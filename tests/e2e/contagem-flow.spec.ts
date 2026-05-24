import { test, expect } from "@playwright/test";

test.describe("Fluxo Principal da Santa Ceia", () => {
  test("deve criar uma nova ceia, contar pessoas e encerrar", async ({ page }) => {
    // 1. Abrir o app e limpar dados (simular usuário novo)
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 2. Clicar em Nova Santa Ceia
    await page.getByRole('button', { name: /NOVA SANTA CEIA/i }).click();
    
    // 3. Preencher a localidade
    await page.getByPlaceholder('Ex: Itaquera, Brás...').fill('Igreja Central Playwright');
    
    // 4. Iniciar Contagem
    await page.getByRole('button', { name: /Iniciar Contagem/i }).click();
    
    // 5. Validar que foi para a tela de contagem 
    // Como a navegação usa setTimeout(10ms), garantimos que o router teve tempo
    await page.waitForURL('**/contagem');

    // 6. Contar 3 Enfermos
    const countingZone = page.locator('.counting-zone');
    await countingZone.click();
    await countingZone.click();
    await countingZone.click();
    
    // 7. Salvar rodada
    await page.getByRole('button', { name: /Salvar Rodada/i }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // 8. Trocar para Irmãs e contar 5
    await page.getByText('Irmãs').nth(1).click(); // Clica na aba
    for(let i = 0; i < 5; i++) {
      await countingZone.click();
    }

    // 9. Salvar rodada
    await page.getByRole('button', { name: /Salvar Rodada/i }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // 10. Encerrar
    await page.getByRole('button', { name: /Encerrar Santa Ceia/i }).click();
    await page.getByRole('button', { name: 'Encerrar', exact: true }).click();

    // 11. Deve redirecionar para a tela de relatório
    await page.waitForURL('**/relatorio/**');
    await expect(page.getByText('Relatório', { exact: true })).toBeVisible();
    await expect(page.getByText('Igreja Central Playwright')).toBeVisible();
    
    // Validar Total Geral (3 enfermos + 5 irmãs = 8)
    await expect(page.getByText('8', { exact: true }).first()).toBeVisible();
  });
});
