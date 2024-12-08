const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises'); // Using fs.promises for async file operations
puppeteer.use(StealthPlugin());

const config = {
  baseUrl: "https://sje.gujarat.gov.in/dscw/Schemes?lang=English",
  selectors: {
    menuItems: "table tr",
    menuLink: "a",
    detailTitle: "td.h2",
    detailContent: "td.normalText",
    detailListItem: "li.normalText",
  },
};

async function extractUrls(thisPage) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(thisPage, { waitUntil: "networkidle2" });
  const urls = await page.evaluate((selectors) => {
    const list = document.querySelectorAll(selectors.menuItems);
    const pageUrls = [];
    list.forEach((item) => {
      const link = item.querySelector(selectors.menuLink);
      if (link) {
        // Fetch title attribute from anchor tag
        const title = link.getAttribute('title') || 'No Title';
        pageUrls.push({ url: link.href, title });
      }
    });
    return pageUrls;
  }, config.selectors);
  await browser.close();
  return urls;
}

async function scrapeData(thisUrl, parentTitle) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(thisUrl, { waitUntil: "networkidle2" });

  const data = await page.evaluate((selectors, url) => {
    const details = {};
    const titles = document.querySelectorAll(selectors.detailTitle);
    const contents = document.querySelectorAll(selectors.detailContent);

    titles.forEach((title, index) => {
      const contentElement = contents[index];
      let content = '';
      if (contentElement) {
        content = Array.from(contentElement.querySelectorAll(selectors.detailListItem))
          .map(item => item.textContent.trim())
          .join(', ');
      }
      details[title.textContent.trim()] = content;
    });

    // Add the scheme link to the details
    details["scheme_link"] = url;

    return details;
  }, config.selectors, thisUrl); // Pass `thisUrl` as an argument to `page.evaluate`

  await browser.close();
  return {
    id: uuidv4(),
    title: parentTitle,
    details: data,
  };
}


async function main() {
  try {
    const initialUrls = await extractUrls(config.baseUrl);
    const urlMap = {};
    const scrapedData = [];
    for (const { url, title } of initialUrls) {
      const allUrls = await extractUrls(url);
      urlMap[url] = allUrls;

      
      for (const { url: detailedUrl, title: subTitle } of allUrls) {
        const data = await scrapeData(detailedUrl, subTitle);
        scrapedData.push(data);
      }

      // Write scraped data to console
      // console.log(scrapedData);

      // Write scraped data to JSON file
      
    }
    const fileName = 'gujratschemes.json';
    await fs.writeFile(fileName, JSON.stringify(scrapedData, null, 2));
    console.log(`Scraped data saved to ${fileName}`);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
