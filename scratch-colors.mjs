import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://congregacaocristanobrasil.org.br/', { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    const results = {
      primaryColors: [],
      bgColors: [],
      fonts: [],
    };
    
    // Extract CSS variables from :root if any
    const rootStyles = window.getComputedStyle(document.documentElement);
    results.rootCss = [];
    for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--color') || prop.startsWith('--primary')) {
            results.rootCss.push(`${prop}: ${rootStyles.getPropertyValue(prop)}`);
        }
    }

    const elements = document.querySelectorAll('*');
    const colorMap = {};
    const bgMap = {};
    const fontMap = {};

    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.color && style.color !== 'rgba(0, 0, 0, 0)' && style.color !== 'rgb(0, 0, 0)' && style.color !== 'rgb(255, 255, 255)') {
        colorMap[style.color] = (colorMap[style.color] || 0) + 1;
      }
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'rgb(255, 255, 255)' && style.backgroundColor !== 'transparent') {
        bgMap[style.backgroundColor] = (bgMap[style.backgroundColor] || 0) + 1;
      }
      if (style.fontFamily) {
        fontMap[style.fontFamily] = (fontMap[style.fontFamily] || 0) + 1;
      }
    });

    results.primaryColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    results.bgColors = Object.entries(bgMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    results.fonts = Object.entries(fontMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return results;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
