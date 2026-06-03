import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';

// ── CREDENCIALES ── Reemplazá con usuarios reales de tu BD ────
const CREDS = {
  participante: { email: 'jair@gmail.com',  password: 'aaa111' },
  socio:        { email: 'pepe@gmail.com',  password: 'aaa111' },
  tutor:        { email: 'leila@gmail.com', password: 'aaa111' },
  profesor:     { email: 'juan@gmail.com',  password: 'aaa111' },
};

async function testAppCompleta() {
  console.log('🧪 TESTING FINAL - APP MÓVIL CLUB RIVER PLATE\n');

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext();
  const page = await context.newPage();

  let total = 0;
  let pasados = 0;

  const ok = (nombre: string, condicion: boolean) => {
    total++;
    if (condicion) pasados++;
    console.log(`  ${condicion ? '✅' : '❌'} ${nombre}`);
  };

  // Captura la próxima respuesta que coincida ANTES de la acción
  const capturarRespuesta = (urlFragment: string) =>
    page.waitForResponse(
      (r) => r.url().includes(urlFragment),
      { timeout: 8000 }
    ).catch(() => null);

  // Acepta automáticamente cualquier alert/confirm de error durante el login
  const handleDialogs = () => {
    page.on('dialog', (d) => {
      console.log(`  ⚠️  Dialog: "${d.message().slice(0, 60)}"`);
      d.accept();
    });
  };

  const doLogin = async (email: string, password: string): Promise<boolean> => {
    await page.goto(BASE_URL);
    // La pantalla inicial muestra un botón "Iniciar Sesión" — hay que hacer clic primero
    await page.waitForSelector('text=Iniciar Sesión', { timeout: 30000 });
    await page.click('text=Iniciar Sesión');
    await page.waitForSelector('input[placeholder="Email"]', { timeout: 15000 });
    await page.fill('input[placeholder="Email"]', email);
    await page.fill('input[placeholder="Contraseña"]', password);
    // El botón de login dice "Ingresar"
    await page.click('text=Ingresar');
    await page.waitForTimeout(3000);

    // Verificar que ya no estamos en la pantalla de login
    const enLogin = await page.isVisible('text=Ingresar');
    if (enLogin) {
      console.log(`  ⚠️  Login fallido para ${email} — verificá credenciales`);
      return false;
    }
    return true;
  };

  const doLogout = async () => {
    await page.click('text=Perfil').catch(() => {});
    await page.waitForTimeout(1000);
    // Scroll hacia abajo por si el botón está fuera del viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    // El logout en web usa window.confirm — el handler global lo acepta
    await page.click('text=Cerrar Sesión').catch(() => {});
    await page.waitForTimeout(2500);
    // Verificar que volvimos a la pantalla pública (InicioPublico muestra "Iniciar Sesión")
    const enInicio = await page.isVisible('text=Iniciar Sesión');
    if (!enInicio) {
      console.log('  ⚠️  Logout no completó, navegando a raíz...');
      await page.goto(BASE_URL);
      await page.waitForTimeout(2000);
    }
  };

  handleDialogs();

  try {

    // ──────────────────────────────────────────────────────────
    // TEST 1: PARTICIPANTE
    // ──────────────────────────────────────────────────────────
    console.log('📋 TEST 1: PARTICIPANTE — Mis Categorías\n');

    const loginOk1 = await doLogin(CREDS.participante.email, CREDS.participante.password);
    ok('Login como PARTICIPANTE', loginOk1);

    if (loginOk1) {
      await page.waitForTimeout(1000);

      // El tab puede decir "Categorías" — buscamos por texto parcial también
      const tabCat = await page.isVisible('text=Categorías');
      ok('Tab "Categorías" visible', tabCat);
      ok('Tab "Disciplinas" ausente', !(await page.isVisible('text=Disciplinas')));
      ok('Tab "Mis Clases" ausente',  !(await page.isVisible('text=Mis Clases')));

      if (tabCat) {
        // Ir a Inicio primero para que el regreso a Categorías dispare la llamada API
        await page.click('text=Inicio').catch(() => {});
        await page.waitForTimeout(800);
        const promCat = capturarRespuesta('/api/mi-cuenta/categorias');
        await page.click('text=Categorías');
        const resCat = await promCat;
        ok('GET /api/mi-cuenta/categorias → 200', resCat?.status() === 200);
        ok('Header "Mis Categorías" visible', await page.isVisible('text=Mis Categorías'));
      }
    }

    await doLogout();

    // ──────────────────────────────────────────────────────────
    // TEST 2: SOCIO sin esTutor
    // ──────────────────────────────────────────────────────────
    console.log('\n📋 TEST 2: SOCIO sin esTutor — Mi Cuenta\n');

    const loginOk2 = await doLogin(CREDS.socio.email, CREDS.socio.password);
    ok('Login como SOCIO', loginOk2);

    if (loginOk2) {
      await page.click('text=Perfil');
      await page.waitForTimeout(1500);

      ok('Sección "Mi Cuenta" visible',     await page.isVisible('text=Mi Cuenta'));
      ok('"Mis Recibos" visible',           await page.isVisible('text=Mis Recibos'));
      ok('"Mis Alquileres" visible',        await page.isVisible('text=Mis Alquileres'));
      ok('"Participantes a cargo" ausente', !(await page.isVisible('text=Participantes a cargo')));

      // Recibos
      const promRec = capturarRespuesta('/api/mi-cuenta/recibos');
      await page.click('text=Mis Recibos');
      const resRec = await promRec;
      ok('GET /api/mi-cuenta/recibos → 200', resRec?.status() === 200);

      // Volver al tab Perfil en lugar de browser goBack (React Native Navigation)
      await page.click('text=Perfil').catch(() => page.goBack());
      await page.waitForTimeout(1500);

      // Alquileres
      const promAlq = capturarRespuesta('/api/mi-cuenta/alquileres');
      await page.click('text=Mis Alquileres');
      const resAlq = await promAlq;
      ok('GET /api/mi-cuenta/alquileres → 200', resAlq?.status() === 200);

      // Volver al tab Perfil
      await page.click('text=Perfil').catch(() => page.goBack());
      await page.waitForTimeout(1500);
    }

    await doLogout();

    // ──────────────────────────────────────────────────────────
    // TEST 3: SOCIO con esTutor
    // ──────────────────────────────────────────────────────────
    console.log('\n📋 TEST 3: SOCIO con esTutor — Participantes a cargo\n');

    const loginOk3 = await doLogin(CREDS.tutor.email, CREDS.tutor.password);
    ok('Login como TUTOR', loginOk3);

    if (loginOk3) {
      await page.click('text=Perfil');
      await page.waitForTimeout(1500);

      ok('"Participantes a cargo" visible', await page.isVisible('text=Participantes a cargo'));

      const promPart = capturarRespuesta('/api/mi-cuenta/participantes');
      await page.click('text=Participantes a cargo');
      const resPart = await promPart;
      ok('GET /api/mi-cuenta/participantes → 200', resPart?.status() === 200);

      // Volver al tab Perfil
      await page.click('text=Perfil').catch(() => page.goBack());
      await page.waitForTimeout(1500);
    }

    await doLogout();

    // ──────────────────────────────────────────────────────────
    // TEST 4: PROFESOR — sin módulo de asistencia
    // ──────────────────────────────────────────────────────────
    console.log('\n📋 TEST 4: PROFESOR — Sin módulo de asistencia\n');

    const loginOk4 = await doLogin(CREDS.profesor.email, CREDS.profesor.password);
    ok('Login como PROFESOR', loginOk4);

    if (loginOk4) {
      ok('Tab "Mis Clases" visible',         await page.isVisible('text=Mis Clases'));
      ok('Tab "Categorías" ausente',         !(await page.isVisible('text=Categorías')));

      const promPortal = capturarRespuesta('/api/mi-portal/categorias');
      await page.click('text=Mis Clases');
      const resPortal = await promPortal;
      ok('GET /api/mi-portal/categorias → 200', resPortal?.status() === 200);

      await page.waitForTimeout(1500);
      ok('Botón "Tomar asistencia" AUSENTE',   !(await page.isVisible('text=Tomar asistencia')));
      ok('Botón "Ver participantes" presente',  await page.isVisible('text=Ver participantes'));

      // Ver participantes de la primera categoría
      const botonVP = page.locator('text=Ver participantes').first();
      if (await botonVP.isVisible({ timeout: 2000 }).catch(() => false)) {
        await botonVP.click();
        await page.waitForTimeout(2000);
        ok('Screen ParticipantesLista carga', await page.isVisible('text=Participantes'));
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    }

    // ──────────────────────────────────────────────────────────
    // TEST 5: Asistente IA (botón flotante)
    // ──────────────────────────────────────────────────────────
    console.log('\n📋 TEST 5: Asistente IA global\n');

    const botonIA = await page.isVisible('[data-testid="chat-button"]');
    ok('Botón flotante IA visible', botonIA);

    if (botonIA) {
      await page.click('[data-testid="chat-button"]');
      await page.waitForTimeout(1500);
      ok('Modal chat abre', await page.isVisible('text=Asistente'));
    }

  } catch (err) {
    console.error('\n❌ ERROR INESPERADO:', err);
  } finally {
    const linea = '═'.repeat(52);
    console.log(`\n${linea}`);
    console.log(`  📊  ${pasados}/${total} tests pasados`);
    console.log(linea);
    if (pasados === total) {
      console.log('  ✅  TODOS LOS TESTS PASARON — APP 100% FUNCIONAL');
    } else {
      console.log(`  ⚠️   ${total - pasados} tests fallaron — revisar arriba`);
      console.log('  💡  Verificá que las credenciales en CREDS coincidan con tu BD');
    }
    console.log(`${linea}\n`);
    await browser.close();
  }
}

testAppCompleta();
