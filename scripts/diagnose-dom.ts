import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navegando a http://localhost:8081...');
  await page.goto('http://localhost:8081');
  console.log('Esperando 15 segundos...');
  await page.waitForTimeout(15000);
  const html = await page.content();
  console.log('=== HTML ===');
  console.log(html.slice(0, 5000));
  console.log('\n=== INPUTS EN DOM ===');
  const inputs = await page.$$eval('input', (els) => els.map(el => ({
    type: el.type,
    placeholder: el.placeholder,
    name: el.name,
    id: el.id,
    className: el.className,
  })));
  console.log(JSON.stringify(inputs, null, 2));
  await browser.close();
}

main();
