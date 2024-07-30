const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');

const config = {
  baseUrl: "https://mp.gov.in/Govschemes",
  select: "#schemes"
};

async function extractData(page) {
  const data = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('.form-group.row label')).map(label => label.innerText.trim());
    const textareas = Array.from(document.querySelectorAll('.form-group.row textarea')).map(textarea => textarea.value.trim());

    const keyValuePairs = {};
    labels.forEach((label, index) => {
      keyValuePairs[label] = textareas[index];
    });

    return keyValuePairs;
  });

  return data;
}

async function selectOptionAndExtractData(page, value) {
  await page.select(config.select, value);

  // Use a shorter delay for subsequent updates
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

  const data = await extractData(page);
  return data;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to the main page
  await page.goto("https://mp.gov.in", { waitUntil: "networkidle2" });

  // Click on the English language switcher
  await page.evaluate(() => {
    const langSwitcher = document.querySelector('a[title="English"]');
    if (langSwitcher) {
      langSwitcher.click();
    }
  });

  // Wait for the page to navigate to the English version
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Wait for the page to fully load after switching language
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

  // Now navigate to the Govschemes page
  await page.goto(config.baseUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector(config.select);

  const options = await page.evaluate(() => {
    const selectElement = document.querySelector('#schemes');
    return Array.from(selectElement.options).map(option => option.value).filter(value => value !== "");
  });

  const allData = [];

  for (const value of options) {
    const data = await selectOptionAndExtractData(page, value);
    allData.push({ id: uuidv4(), scheme: value, data });
  }

  await fs.writeFile('mp.json', JSON.stringify(allData, null, 2));
  console.log('Data saved to mp.json');

  await browser.close();
}

main();
