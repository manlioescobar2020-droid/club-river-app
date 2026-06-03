import { test, expect } from '@playwright/test';

test('debug — modal DOM structure', async ({ page }) => {
  await page.goto('http://localhost:8081');
  await page.waitForLoadState('networkidle');

  // Login
  await page.locator('input').nth(0).fill('admin@clubriverplate.com');
  await page.locator('input').nth(1).fill('admin123');
  await page.locator('text=Ingresar').first().click();
  await page.waitForSelector('text=Inicio', { timeout: 15000 });

  // Click chat button
  await page.locator('[data-testid="chat-open-btn"]').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/debug-5-modal-open.png' });

  // Dump all inputs in modal
  const inputs = await page.locator('input, textarea').all();
  console.log(`Inputs found: ${inputs.length}`);
  for (const inp of inputs) {
    const ph = await inp.getAttribute('placeholder');
    const val = await inp.inputValue().catch(() => '');
    console.log(`  input: placeholder="${ph}" value="${val}"`);
  }

  // Dump all text content visible
  const bodyText = await page.locator('body').innerText();
  console.log('Body text:\n', bodyText.slice(0, 600));

  // Find all clickable elements (no role="button" so use other approach)
  const allDivs = await page.locator('div[style*="cursor"]').all();
  console.log(`Divs with cursor style: ${allDivs.length}`);

  // Look for send button area
  await page.screenshot({ path: 'test-results/debug-6-modal-dom.png' });

  // Try typing in the input
  const msgInput = page.locator('input[placeholder*="Escribí"]').first();
  await msgInput.fill('Hola test');
  await page.screenshot({ path: 'test-results/debug-7-typed.png' });
  console.log('Typed in input successfully');
});
