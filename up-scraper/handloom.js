// const puppeteer = require('puppeteer');
// const fs = require('fs');

// const urls = [
//     'https://handloom.upsdc.gov.in/Home/MGBBY',
//     // Add more URLs here
// ];

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     let allSchemes = [];

//     for (const url of urls) {
//         console.log(`Scraping URL: ${url}`);
        
//         let attempts = 0;
//         const maxAttempts = 3;
//         let success = false;

//         while (attempts < maxAttempts && !success) {
//             try {
//                 await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
//                 success = true;

//                 const data = await page.evaluate(() => {
//                     const extractText = (selector) => {
//                         const element = document.querySelector(selector);
//                         return element ? element.innerText.trim() : null;
//                     };

//                     const extractListItems = (selector) => {
//                         return Array.from(document.querySelectorAll(`${selector} li`)).map(li => li.innerText.trim());
//                     };

//                     const extractTable = () => {
//                         const rows = Array.from(document.querySelectorAll('.table-responsive table tbody tr'));
//                         return rows.map(row => {
//                             const cells = row.querySelectorAll('td');
//                             return {
//                                 sno: cells[0].innerText.trim(),
//                                 contribution: cells[1].innerText.trim(),
//                                 amount: cells[2].innerText.trim()
//                             };
//                         });
//                     };

//                     const scheme = {
//                         title: extractText('#ctl00_lblTitle'),
//                         breadcrumb: extractText('#ctl00_lblBreadcrumb'),
//                         overview: extractText('.wel-content > p.adijust'),
//                         eligibilityCriteria: extractListItems('.wel-content > ul.about-tab.adijust'),
//                         features: extractListItems('.wel-content > ul.about-tab.adijust:nth-of-type(2)'),
//                         premiumInsuranceCoverage: extractTable()
//                     };

//                     return scheme;
//                 });

//                 allSchemes.push(data);
//                 console.log(`Successfully scraped data from ${url}`);
//             } catch (error) {
//                 attempts++;
//                 console.log(`Attempt ${attempts} for ${url} failed: ${error.message}`);
//                 if (attempts < maxAttempts) {
//                     console.log(`Retrying ${url}...`);
//                     await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
//                 } else {
//                     console.log(`Failed to scrape ${url} after ${maxAttempts} attempts.`);
//                 }
//             }
//         }
//     }

//     fs.writeFileSync('handloom.json', JSON.stringify(allSchemes, null, 2));

//     await browser.close();
// })();
const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
    'https://handloom.upsdc.gov.in/Home/MGBBY',
    'https://handloom.upsdc.gov.in/Home/HWCWS',
    'https://handloom.upsdc.gov.in/Home/NHDP',
    'https://handloom.upsdc.gov.in/Home/PMJJBY',
    'https://handloom.upsdc.gov.in/Home/PMSBY',
    'https://handloom.upsdc.gov.in/Home/aths',
    'https://handloom.upsdc.gov.in/Home/reerpw',
    'https://handloom.upsdc.gov.in/Home/reerhw',
    'https://handloom.upsdc.gov.in/Home/Cmhwas',
    'https://handloom.upsdc.gov.in/Home/St_kabir'
    
    
    // Replace with actual URL 1
 // Replace with actual URL 2
    // Add more URLs as needed
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let results = [];

    for (const url of urls) {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const data = await page.evaluate(() => {
            const titleElement = document.querySelector('#ctl00_lblTitle');
            const title = titleElement ? titleElement.innerText.trim() : null;

            const descriptionElement = document.querySelector('.wel-content > p.adijust');
            const description = descriptionElement ? descriptionElement.innerText.trim() : null;

            const eligibilityElements = document.querySelectorAll('.about-tab.adijust li');
            const eligibilityCriteria = eligibilityElements ? Array.from(eligibilityElements).map(li => li.innerText.trim()) : [];

            const featuresElements = document.querySelectorAll('.wel-content ul.about-tab.adijust:nth-of-type(2) li');
            const features = featuresElements ? Array.from(featuresElements).map(li => li.innerText.trim()) : [];

            const premiumElements = document.querySelectorAll('.table-responsive tbody tr');
            const premiumCoverage = premiumElements ? Array.from(premiumElements).map(row => {
                const columns = row.querySelectorAll('td');
                return {
                    sNo: columns[0] ? columns[0].innerText.trim() : null,
                    contribution: columns[1] ? columns[1].innerText.trim() : null,
                    amount: columns[2] ? columns[2].innerText.trim() : null
                };
            }) : [];

            return {
                title,
                description,
                eligibilityCriteria,
                features,
                premiumCoverage
            };
        });

        results.push({ url, data });
    }

    fs.writeFileSync('handloom.json', JSON.stringify(results, null, 2));

    await browser.close();
})();
