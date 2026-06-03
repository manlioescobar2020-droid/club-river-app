// Ejecutar desde la consola del navegador o importar temporalmente en App.tsx
// para verificar conectividad con el backend

const BASE = 'http://localhost:3000/api';

export async function testConnectivity() {
  console.log('[TEST] === Iniciando prueba de conectividad ===');
  console.log('[TEST] Target:', BASE);

  // 1. Ping al endpoint de login con credenciales vacías (esperamos 400, no error de red)
  try {
    console.log('[TEST] Probando POST /auth/mobile-login...');
    const res = await fetch(`${BASE}/auth/mobile-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'wrongpass' }),
    });

    const data = await res.json().catch(() => null);
    console.log('[TEST] Status HTTP:', res.status);
    console.log('[TEST] Respuesta:', JSON.stringify(data));

    if (res.status === 401 || res.status === 400) {
      console.log('[TEST] ✓ Servidor alcanzable — responde con error de credenciales (esperado)');
    } else if (res.status === 200) {
      console.log('[TEST] ✓ Login exitoso (inesperado con credenciales de prueba)');
    } else {
      console.warn('[TEST] ⚠ Status inesperado:', res.status);
    }
  } catch (err: any) {
    console.error('[TEST] ✗ Error de red — el servidor NO es alcanzable');
    console.error('[TEST] Detalle:', err.message);
    console.error('[TEST] Verificá que el backend esté corriendo en localhost:3000');
  }

  console.log('[TEST] === Fin de prueba ===');
}

// Auto-ejecutar si se importa directamente
testConnectivity();
