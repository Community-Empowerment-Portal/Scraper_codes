// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Array of URLs to scrape
//     const urls = [
//         'https://upagripardarshi.gov.in/StaticPages/StateSponsored-CropBreeding-hi.aspx',
//         'https://upagripardarshi.gov.in/StaticPages/CentrallySponsored-CropBreeding-hi.aspx'
//         // Add more URLs as needed
//     ];

//     let allData = [];

//     for (const url of urls) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const data = await page.evaluate(() => {
//             const container = document.querySelector('.col-md-9');
//             let schemes = [];

//             const headers = container.querySelectorAll('.context_area2 h4 strong');
//             headers.forEach(header => {
//                 const category = header.innerText.trim();
//                 const listItems = header.parentElement.nextElementSibling.querySelectorAll('ul li');

//                 let descriptions = [];
//                 listItems.forEach(item => {
//                     const link = item.querySelector('a');
//                     descriptions.push({
//                         text: link ? link.innerText.trim() : null,
//                         href: link ? link.href : null
//                     });
//                 });

//                 schemes.push({
//                     category,
//                     descriptions
//                 });
//             });

//             return schemes;
//         });

//         allData.push({
//             url,
//             data
//         });
//     }

//     fs.writeFileSync('agriculture.json', JSON.stringify(allData, null, 2));

//     await browser.close();
// })();

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapePage(url) {
    const browser = await puppeteer.launch({ headless: false }); // Set to true if you don't need the browser UI
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
        function cleanText(text) {
            return text.trim();
        }

        const schemes = [];
        const contentDiv = document.querySelector('#DivContent');
        if (!contentDiv) return null;

        const sections = contentDiv.querySelectorAll('h4');

        sections.forEach(section => {
            const title = section ? cleanText(section.textContent) : '';
            const details = [];
            const nextElement = section.nextElementSibling;

            if (nextElement && nextElement.tagName.toLowerCase() === 'div') {
                const detailItems = nextElement.querySelectorAll('ul > li');

                detailItems.forEach(detailItem => {
                    const subTitleElement = detailItem.querySelector('a');
                    const subTitle = subTitleElement ? cleanText(subTitleElement.textContent) : '';
                    const link = subTitleElement ? subTitleElement.href : '';

                    details.push({ title: subTitle, link });
                });
            }

            schemes.push({ title, details });
        });

        return schemes;
    });

    await browser.close();
    return data;
}

(async () => {
    const urls = [
        'https://upagripardarshi.gov.in/StaticPages/StateSponsored-CropBreeding-hi.aspx',
        'https://upagripardarshi.gov.in/StaticPages/CentrallySponsored-CropBreeding-hi.aspx'
        // Add more URLs as needed
    ];

    let allData = [];
    for (let url of urls) {
        const data = await scrapePage(url);
        if (data) {
            allData = allData.concat(data);
        }
    }

    fs.writeFileSync('agriculture.json', JSON.stringify(allData, null, 2), 'utf-8');

    console.log('Data has been saved to agriculture.json');
})();
