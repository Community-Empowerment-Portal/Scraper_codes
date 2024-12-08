const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

async function scrapeUrl(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 300000 });

    const result = await page.evaluate(() => {
        const node = document.querySelector('.container .row .col-md-12');
        if (node) {
            return node.textContent; 
        } else {
            return null; 
        }
    });
    await browser.close();
    return {
        id : uuidv4(),
        schemeUrl:url,
        text:result
    };
}


async function main(urls) {
    const allResults = [];
    const scrapePromises = urls.map(url => scrapeUrl(url));
    const allScrapedData = await Promise.all(scrapePromises);

    allResults.push(...allScrapedData.flat());

    await fs.writeFile('nagaland_raw_data.json', JSON.stringify(allResults, null, 2), 'utf8');
}

async function getAllUrls(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 300000 });

    const result = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.container .row .col-md-12 article header h3 a'));
        return links.map(link => link.href);
    });
    await browser.close();
    return result;

}

async function run() {
    const baseUrl = 'https://dsw.nagaland.gov.in/category/programmes-schemes/';
    const urls = await getAllUrls(baseUrl);
    await main(urls);
}

run();
