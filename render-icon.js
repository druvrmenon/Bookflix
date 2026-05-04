const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const logoBase64 = fs.readFileSync('public/logo.png', { encoding: 'base64' });
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #1a0a0a;
          width: 512px;
          height: 512px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        img {
          width: 400px;
          height: 400px;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <img src="data:image/png;base64,${logoBase64}" />
    </body>
    </html>
  `;
  
  await page.setViewport({ width: 512, height: 512 });
  await page.setContent(htmlContent);
  await page.screenshot({ path: 'public/android-chrome-512x512.png' });
  
  await page.setViewport({ width: 192, height: 192 });
  await page.addStyleTag({ content: 'body { width: 192px; height: 192px; } img { width: 150px; height: 150px; }' });
  await page.screenshot({ path: 'public/android-chrome-192x192.png' });
  
  await page.setViewport({ width: 180, height: 180 });
  await page.addStyleTag({ content: 'body { width: 180px; height: 180px; } img { width: 140px; height: 140px; }' });
  await page.screenshot({ path: 'public/apple-touch-icon.png' });

  await browser.close();
  console.log('Icons generated successfully with base64.');
}

run().catch(console.error);
