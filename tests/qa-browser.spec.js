import { test, expect } from '@playwright/test';

test('Mesoco changed pages render after login', async ({ page }) => {
  const baseUrl = 'http://192.168.123.8:8000';

  await page.goto(`${baseUrl}/login`);
  const loginResult = await page.evaluate(async () => {
    await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    const xsrf = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
    const response = await fetch('/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': xsrf,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({ username: 'E1001', password: 'password' }),
    });

    return { status: response.status, setCookie: response.headers.get('set-cookie') };
  });
  console.log(`login ${JSON.stringify(loginResult)}`);
  expect(loginResult.status).toBe(200);
  const meResult = await page.evaluate(async () => {
    const response = await fetch('/api/me', { credentials: 'include', headers: { Accept: 'application/json' } });
    return { status: response.status, text: await response.text(), cookie: document.cookie };
  });
  console.log(`api-me ${meResult.status} ${meResult.text.slice(0, 120)} cookie=${meResult.cookie}`);

  for (const [name, url, text] of [
    ['assets', `${baseUrl}/assets`, 'Danh mục thiết bị'],
    ['locations', `${baseUrl}/locations`, 'Vị trí'],
    ['handover', `${baseUrl}/handover`, 'Bàn giao / Thu hồi'],
    ['suppliers', `${baseUrl}/suppliers`, 'Nhà cung cấp'],
    ['purchase-orders', `${baseUrl}/purchase-orders`, 'Đơn hàng'],
  ]) {
    await page.goto(url);
    await expect(page.getByText(text).first()).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: `storage/app/qa-${name}.png`, fullPage: true });
  }

  await page.goto(`${baseUrl}/assets`);
  const assignedRow = page.locator('tr', { hasText: 'DEMO-IT-001' });
  await expect(assignedRow.getByText('Đã bàn giao')).toBeVisible();

  await page.goto(`${baseUrl}/assets#handover`);
  await expect(page.getByText('Bàn giao / Thu hồi').first()).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/\/handover$/);
});
