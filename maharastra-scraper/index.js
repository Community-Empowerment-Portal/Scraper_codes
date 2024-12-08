import puppeteer from "puppeteer-extra";  // Use puppeteer-extra instead of puppeteer
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
puppeteer.use(StealthPlugin());
const config = {
  baseUrl: "https://sjsa.maharashtra.gov.in/en/schemes-categories",
  selectors: {
    menuItems: ".mainColum .menu-block-wrapper li",
    menuLink: "a",
    accordion: ".accoSchemes",
    title: ".accTrigger h3",
    tables: ".tableData",
    tableRows: "tbody tr",
    cells: "td, th",
    nextButton: ".pager-next",
  },
};

async function extractUrls() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  const page = await browser.newPage();
  await page.goto(config.baseUrl, { waitUntil: "networkidle2" });
  const urls = await page.evaluate((selectors) => {
    const list = document.querySelectorAll(selectors.menuItems);
    const pageUrls = [];
    list.forEach((item) => {
      const link = item.querySelector(selectors.menuLink);
      if (link) {
        pageUrls.push(link.href);
      }
    });
    return pageUrls;
  }, config.selectors);
  await browser.close();
  return urls;
} //extracting the scheme page url

async function scrapeData(url, selectors) {
  const browser = await puppeteer.launch({ headless: true, args: ['--ignore-certificate-errors'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const schemes = [];

  try {
    await page.goto(url, { waitUntil: "networkidle2" });
    let hasNextPage = true;

    while (hasNextPage) {
      await page.waitForSelector(selectors.accordion);
      const data = await page.evaluate((selectors, url) => {
        try {
          const accordionItems = document.querySelectorAll(selectors.accordion);
          const extractedData = [];

          accordionItems.forEach((item) => {
            const title = item.querySelector(selectors.title)
              .innerText.replace(/\n/g, "")
              .replace(/\t/g, "")
              .trim();

            let details = {
              "scheme_link": url 
            };

            const tables = item.querySelectorAll(selectors.tables);
            tables.forEach((table, tableIndex) => {
              const tableRows = table.querySelectorAll(selectors.tableRows);
              if (tableIndex === 0) {
                tableRows.forEach((row) => {
                  const cells = row.querySelectorAll(selectors.cells);
                  if (cells.length === 3 && cells[1].innerText !== "Scheme") {
                    const key = cells[1].innerText
                      .replace(/\n/g, "")
                      .replace(/\t/g, "")
                      .trim();
                    const value = cells[2].innerText
                      .replace(/\n/g, "")
                      .replace(/\t/g, "")
                      .trim();
                    details[key] = value;
                  }
                });
              } else {
                const stats = [];
                tableRows.forEach((row) => {
                  const cells = row.querySelectorAll(selectors.cells);
                  if (cells.length === 4 && cells[0].innerText !== "Sr.No.") {
                    const year = cells[1].innerText.replace(/\n/g, "")
                      .replace(/\t/g, "")
                      .trim();
                    const expenditure = cells[2].innerText.replace(/\n/g, "")
                      .replace(/\t/g, "")
                      .trim();
                    const beneficiaries = cells[3].innerText
                      .replace(/\n/g, "")
                      .replace(/\t/g, "")
                      .trim();
                    stats.push({ year, expenditure, beneficiaries });
                  }
                });
                details["Statistical Summary"] = stats;
              }
            });
            extractedData.push({ title, details });
          });

          return extractedData;
        } catch (error) {
          console.error("Error in page evaluation:", error);
          return [];
        }
      }, selectors, url);

      if (data.length > 0) {
        data.forEach((item) => schemes.push({ ...item, id: uuidv4() }));
      } else {
        console.error(`No data extracted from ${url}`);
      }

      const nextButton = await page.$(selectors.nextButton);
      if (nextButton) {
        await nextButton.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });
      } else {
        hasNextPage = false;
      }
    }
  } catch (error) {
    console.error(`Error scraping data from ${url}:`, error);
  } finally {
    await page.close();
    await browser.close();
  }
  return schemes;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function main() {
  try {
    const urls = await extractUrls();
    let allSchemes = [];
    const selectors = config.selectors;

    for (const url of urls) {
      console.log(`Scraping data from ${url}`);
      const urlSchemes = await scrapeData(url, selectors);
      allSchemes = allSchemes.concat(urlSchemes);
      console.log(`Scraped ${urlSchemes.length} schemes from ${url}`);
    }

    const filepath = path.join(__dirname, "Schemes.json");
    fs.writeFileSync(filepath, JSON.stringify(allSchemes, null, 2));
    console.log(`Data saved to ${filepath}`);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
