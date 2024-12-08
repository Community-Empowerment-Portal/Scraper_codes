// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapePage(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'domcontentloaded' });

//     const data = await page.evaluate(() => {
//         function cleanText(text) {
//             return text.replace(/^\d+\.\s*/, '').replace(/^\(\p{Script=Devanagari}+\)\s*/u, '').trim();
//         }

//         const contentDiv = document.querySelector('#DivContent');
//         if (!contentDiv) return null;

//         const schemes = [];
//         const schemeItems = contentDiv.querySelectorAll('ul.number-list > li');

//         schemeItems.forEach(item => {
//             const title = cleanText(item.querySelector('strong').textContent);
//             const details = [];

//             const detailItems = item.querySelectorAll('ul.mini-list > li');
//             detailItems.forEach(detailItem => {
//                 const heading = cleanText(detailItem.querySelector('strong').textContent);
//                 const content = detailItem.innerHTML.replace(detailItem.querySelector('strong').outerHTML, '').trim();
//                 details.push({ heading, content });
//             });

//             if (details.length === 0) {
//                 const content = item.innerHTML.replace(item.querySelector('strong').outerHTML, '').trim();
//                 details.push({ heading: '', content });
//             }

//             schemes.push({ title, details });
//         });

//         return schemes;
//     });

//     await browser.close();
//     return data;
// }

// (async () => {
//     const urls = [
//         'https://updairydevelopment.gov.in/CentralFundedSchemes1-hi.aspx',  // Replace with actual URLs
//         'https://updairydevelopment.gov.in/Proposedfacilitiesunderscheme-hi.aspx',
//         // Add more URLs as needed
//     ];

//     let allData = [];
//     for (let url of urls) {
//         const data = await scrapePage(url);
//         if (data) {
//             allData = allData.concat(data);
//         }
//     }

//     fs.writeFileSync('dairy_department.json', JSON.stringify(allData, null, 2), 'utf-8');

//     console.log('Data has been saved to dairy_department.json');
// })();
// 'https://updairydevelopment.gov.in/CentralFundedSchemes1-hi.aspx',  // Replace with actual URLs
// 'https://updairydevelopment.gov.in/Proposedfacilitiesunderscheme-hi.aspx',

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapePage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
        function cleanText(text) {
            return text.replace(/^\d+\.\s*/, '').replace(/^\(\p{Script=Devanagari}+\)\s*/u, '').trim();
        }

        function cleanDescription(description) {
            return description.replace(/<br\s*\/?>/g, ' ').replace(/\s+/g, ' ').trim();
        }

        const contentDiv = document.querySelector('#DivContent');
        if (!contentDiv) return null;

        const schemes = [];
        const schemeItems = contentDiv.querySelectorAll('ul.number-list > li');

        schemeItems.forEach(item => {
            const title = cleanText(item.querySelector('strong').textContent);
            const details = [];

            const detailItems = item.querySelectorAll('ul.mini-list > li');
            detailItems.forEach(detailItem => {
                const subTitle = cleanText(detailItem.querySelector('strong').textContent);
                const description = cleanDescription(detailItem.innerHTML.replace(detailItem.querySelector('strong').outerHTML, '').trim());
                details.push({ title: subTitle, description });
            });

            if (details.length === 0) {
                const description = cleanDescription(item.innerHTML.replace(item.querySelector('strong').outerHTML, '').trim());
                details.push({ title: '', description });
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
        'https://updairydevelopment.gov.in/CentralFundedSchemes1-hi.aspx',  // Replace with actual URLs
        'https://updairydevelopment.gov.in/Proposedfacilitiesunderscheme-hi.aspx'
        // Add more URLs as needed
    ];

    let allData = [];
    for (let url of urls) {
        const data = await scrapePage(url);
        if (data) {
            allData = allData.concat(data);
        }
    }

    fs.writeFileSync('dairy_department.json', JSON.stringify(allData, null, 2), 'utf-8');

    console.log('Data has been saved to dairy_department.json');
})();
