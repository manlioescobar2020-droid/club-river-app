import { test, expect, Page } from '@playwright/test';

const BASE_URL  = 'http://localhost:8081';
const EMAIL     = 'admin@clubriverplate.com';
const PASSWORD  = 'admin123';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.locator('input').nth(0).fill(EMAIL);
  await page.locator('input').nth(1).fill(PASSWORD);
  await page.locator('text=Ingresar').first().click();
  await page.waitForSelector('text=Inicio', { timeout: 15000 });
}

async function openChat(page: Page) {
  await page.locator('[data-testid="chat-open-btn"]').click();
  await page.waitForSelector('text=Asistente River', { timeout: 5000 });
}

async function sendMsg(page: Page, text: string) {
  await page.locator('[data-testid="chat-input"]').fill(text);
  await page.locator('[data-testid="chat-send-btn"]').click();
}

// ─── T01: Floating button visible on all tabs ─────────────────────────────────

test('T01 — floating button visible on all tabs', async ({ page }) => {
  await login(page);

  const chatBtn = page.locator('[data-testid="chat-open-btn"]');
  const tabs = ['Inicio', 'Alquileres', 'Disciplinas', 'Cuotas', 'Noticias', 'Perfil'];

  for (const tab of tabs) {
    await page.locator(`text=${tab}`).last().click();
    await page.waitForTimeout(500);
    await expect(chatBtn).toBeVisible({ timeout: 4000 });
    console.log(`  ✅ Botón flotante visible en tab: ${tab}`);
  }

  await page.screenshot({ path: 'test-results/T01-floating-button.png' });
});

// ─── T02: Modal opens correctly ───────────────────────────────────────────────

test('T02 — modal opens with correct UI', async ({ page }) => {
  await login(page);
  await openChat(page);

  await expect(page.locator('text=Asistente River')).toBeVisible();

  // Empty state hint
  await expect(page.locator('text=Hola! Soy el asistente')).toBeVisible();

  // Input is present and empty
  const input = page.locator('[data-testid="chat-input"]');
  await expect(input).toBeVisible();
  await expect(input).toHaveValue('');

  // Close and trash buttons present
  await expect(page.locator('[data-testid="chat-close-btn"]')).toBeVisible();
  await expect(page.locator('[data-testid="chat-clear-btn"]')).toBeVisible();

  await page.screenshot({ path: 'test-results/T02-modal-open.png' });
  console.log('  ✅ Modal abre con header, estado vacío, input, botones close y trash');
});

// ─── T03: Send message, get AI response ──────────────────────────────────────

test('T03 — send message and receive AI response', async ({ page }) => {
  await login(page);
  await openChat(page);

  const reqPromise = page.waitForRequest(r =>
    r.url().includes('/api/assistant/chat') && r.method() === 'POST'
  );
  const resPromise = page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );

  await sendMsg(page, 'Hola, ¿qué disciplinas tiene el club?');

  // Input cleared after send
  await expect(page.locator('[data-testid="chat-input"]')).toHaveValue('');

  // Verify request body
  const req = await reqPromise;
  const body = JSON.parse(req.postData() || '{}');
  expect(body.mensaje).toBe('Hola, ¿qué disciplinas tiene el club?');
  console.log(`  ✅ POST /api/assistant/chat → { mensaje: "${body.mensaje}" }`);

  // Verify response
  const res = await resPromise;
  const resBody = await res.json();
  expect(resBody).toHaveProperty('respuesta');
  expect(resBody).toHaveProperty('conversacionId');
  console.log(`  ✅ Respuesta: conversacionId=${resBody.conversacionId}, texto="${String(resBody.respuesta).slice(0, 60)}..."`);

  // User message bubble visible
  await expect(page.locator('text=Hola, ¿qué disciplinas tiene el club?')).toBeVisible({ timeout: 5000 });

  // Wait for assistant text to appear
  await page.waitForFunction(
    () => document.body.innerText.includes('disciplina') || document.body.innerText.includes('club') || document.body.innerText.includes('Básquet'),
    { timeout: 10000 }
  );

  await page.screenshot({ path: 'test-results/T03-conversation.png' });
  console.log('  ✅ Mensaje usuario visible, respuesta del asistente visible');
});

// ─── T04: Second message keeps conversacionId ─────────────────────────────────

test('T04 — second message maintains conversation context', async ({ page }) => {
  await login(page);
  await openChat(page);

  // First message
  const res1Promise = page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );
  await sendMsg(page, 'Hola, ¿qué disciplinas tiene el club?');
  const res1 = await res1Promise;
  const body1 = await res1.json();
  const convId = body1.conversacionId;
  console.log(`  ✅ Primer mensaje OK, conversacionId=${convId}`);

  await page.waitForTimeout(1500);

  // Second message — must include conversacionId
  const req2Promise = page.waitForRequest(r =>
    r.url().includes('/api/assistant/chat') && r.method() === 'POST'
  );
  const res2Promise = page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );

  await sendMsg(page, '¿Cuánto cuesta la cuota de Básquet?');

  const req2 = await req2Promise;
  const req2Body = JSON.parse(req2.postData() || '{}');
  expect(req2Body.conversacionId).toBe(convId);
  console.log(`  ✅ Segundo mensaje incluye conversacionId=${req2Body.conversacionId} (contexto mantenido)`);

  const res2 = await res2Promise;
  const body2 = await res2.json();
  expect(body2.respuesta).toBeTruthy();
  console.log(`  ✅ Respuesta 2: "${String(body2.respuesta).slice(0, 80)}..."`);

  // Both user messages visible
  await expect(page.locator('text=Hola, ¿qué disciplinas tiene el club?')).toBeVisible();
  await expect(page.locator('text=¿Cuánto cuesta la cuota de Básquet?')).toBeVisible();

  await page.screenshot({ path: 'test-results/T04-context.png' });
  console.log('  ✅ Ambos mensajes visibles en historial');
});

// ─── T05: Clear history ───────────────────────────────────────────────────────

test('T05 — clear history empties chat and resets conversacionId', async ({ page }) => {
  await login(page);
  await openChat(page);

  // Send a message first
  const res1Promise = page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );
  await sendMsg(page, 'Test para limpiar historial');
  await res1Promise;
  await page.waitForTimeout(1000);

  await expect(page.locator('text=Test para limpiar historial')).toBeVisible();

  // Click trash button
  await page.locator('[data-testid="chat-clear-btn"]').click();
  await page.waitForTimeout(500);

  // Message gone, empty state back
  await expect(page.locator('text=Test para limpiar historial')).not.toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=Hola! Soy el asistente')).toBeVisible({ timeout: 3000 });
  console.log('  ✅ Historial limpiado, estado vacío visible');

  // Send new message — conversacionId must be absent (new conversation)
  const req2Promise = page.waitForRequest(r =>
    r.url().includes('/api/assistant/chat') && r.method() === 'POST'
  );
  await sendMsg(page, '¿Qué hay de nuevo?');
  const req2 = await req2Promise;
  const req2Body = JSON.parse(req2.postData() || '{}');
  expect(req2Body.conversacionId).toBeUndefined();
  console.log('  ✅ Nuevo mensaje tras limpiar no incluye conversacionId (nueva conversación)');

  await page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );

  await page.screenshot({ path: 'test-results/T05-cleared.png' });
  console.log('  ✅ Funciona desde cero después de limpiar');
});

// ─── T06: History persists across close/reopen ───────────────────────────────

test('T06 — history persists across close and reopen', async ({ page }) => {
  await login(page);
  await openChat(page);

  const resPromise = page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );
  await sendMsg(page, 'Mensaje para probar persistencia');
  await resPromise;
  await page.waitForTimeout(1000);

  // Close modal
  await page.locator('[data-testid="chat-close-btn"]').click();
  await expect(page.locator('text=Asistente River')).not.toBeVisible({ timeout: 3000 });
  console.log('  ✅ Modal cerrado');

  // Navigate away and back
  await page.locator('text=Disciplinas').first().click();
  await page.waitForTimeout(500);
  await page.locator('text=Inicio').first().click();
  await page.waitForTimeout(500);

  // Reopen chat — history should persist
  await openChat(page);
  await expect(page.locator('text=Mensaje para probar persistencia')).toBeVisible({ timeout: 3000 });
  console.log('  ✅ Historial persiste al cerrar y reabrir el modal');

  await page.screenshot({ path: 'test-results/T06-persistence.png' });
});

// ─── T07: Empty input cannot be sent ─────────────────────────────────────────

test('T07 — empty input does not trigger request', async ({ page }) => {
  await login(page);
  await openChat(page);

  let requestMade = false;
  page.on('request', req => {
    if (req.url().includes('/api/assistant/chat')) requestMade = true;
  });

  // Click send with empty input
  await page.locator('[data-testid="chat-send-btn"]').click();
  await page.waitForTimeout(800);

  expect(requestMade).toBe(false);
  console.log('  ✅ Input vacío no genera request al backend');

  // Also verify typing then clearing doesn't enable send
  await page.locator('[data-testid="chat-input"]').fill('texto');
  await page.locator('[data-testid="chat-input"]').fill('');
  await page.locator('[data-testid="chat-send-btn"]').click();
  await page.waitForTimeout(500);
  expect(requestMade).toBe(false);
  console.log('  ✅ Input vaciado tampoco genera request');
});

// ─── T08: Logout clears chat history ─────────────────────────────────────────

test('T08 — logout clears chat history', async ({ page }) => {
  await login(page);
  await openChat(page);

  const resPromise = page.waitForResponse(r =>
    r.url().includes('/api/assistant/chat') && r.status() === 200,
    { timeout: 35000 }
  );
  await sendMsg(page, 'Mensaje antes del logout');
  await resPromise;
  await page.waitForTimeout(1000);

  // Close chat
  await page.locator('[data-testid="chat-close-btn"]').click();
  await page.waitForTimeout(300);

  // Go to Perfil and logout — use .last() to target tab bar item
  await page.locator('text=Perfil').last().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/T08-perfil.png' });

  // Accept the window.confirm dialog that appears on web
  page.on('dialog', dialog => dialog.accept());

  const logoutBtn = page.locator('text=Cerrar').first();
  await logoutBtn.click();
  await page.waitForTimeout(1000);

  // Confirm we're back at login
  const emailInput = page.locator('input').nth(0);
  await expect(emailInput).toBeVisible({ timeout: 8000 });
  console.log('  ✅ Logout exitoso, pantalla de login visible');

  // Log back in
  await emailInput.fill(EMAIL);
  await page.locator('input').nth(1).fill(PASSWORD);
  await page.locator('text=Ingresar').first().click();
  await page.waitForSelector('text=Inicio', { timeout: 15000 });

  // Open chat — history must be empty
  await openChat(page);
  await expect(page.locator('text=Mensaje antes del logout')).not.toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=Hola! Soy el asistente')).toBeVisible({ timeout: 3000 });

  await page.screenshot({ path: 'test-results/T08-after-relogin.png' });
  console.log('  ✅ Historial limpiado después del logout y re-login');
});
