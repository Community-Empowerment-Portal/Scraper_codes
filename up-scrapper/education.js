// const puppeteer = require('puppeteer');
// const fs = require('fs');

// const urls = [
//     'https://basiceducation.up.gov.in/en/page/nipun-bharat-(mission-prerna)',
//     'https://basiceducation.up.gov.in/en/page/operation-kayakalp',
//     'https://basiceducation.up.gov.in/en/page/samekit-siksha',
//     'https://basiceducation.up.gov.in/en/page/samudayik-sahbhagita'
//     // Add more URLs as needed
// ];

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     const results = [];

//     for (const url of urls) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const data = await page.evaluate(() => {
//             const missionTitle = document.querySelector('.incontent h4').innerText.trim();
//             const imageSrc = document.querySelector('.incontent img').src;
//             const description = document.querySelector('.incontent p').innerText.trim();
//             const objectives = Array.from(document.querySelectorAll('.incontent ul.list li')).map(li => li.innerText.trim());
            
//             const tableRows = Array.from(document.querySelectorAll('.table-responsive table tbody tr'));
//             const links = tableRows.map(row => {
//                 const title = row.querySelector('td:nth-child(2)').innerText.split('Size')[0].trim();
//                 const pdfLink = row.querySelector('td:nth-child(3) a').href;
//                 return { title, pdfLink };
//             });

//             return {
//                 missionTitle,
//                 imageSrc,
//                 description,
//                 objectives,
//                 links
//             };
//         });

//         results.push({ url, data });
//     }

//     fs.writeFileSync('education_schemes.json', JSON.stringify(results, null, 2));

//     await browser.close();
// })();

const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
    'https://basiceducation.up.gov.in/en/page/nipun-bharat-(mission-prerna)',
    'https://basiceducation.up.gov.in/en/page/operation-kayakalp',
    'https://basiceducation.up.gov.in/en/page/samekit-siksha',
    'https://basiceducation.up.gov.in/en/page/samudayik-sahbhagita',
    'https://basiceducation.up.gov.in/en/page/kasturba-gandhi-balika-vidlaya-yojana',
    'https://basiceducation.up.gov.in/en/page/mis',
    'https://basiceducation.up.gov.in/en/page/school-chalo-abhiyan',
    'https://basiceducation.up.gov.in/en/page/sharda-program'
    // Add more URLs as needed
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const results = [];

    for (const url of urls) {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const data = await page.evaluate(() => {
            const missionTitleElement = document.querySelector('.incontent h4');
            const missionTitle = missionTitleElement ? missionTitleElement.innerText.trim() : null;

            const imageElement = document.querySelector('.incontent img');
            const imageSrc = imageElement ? imageElement.src : null;

            const descriptionElement = document.querySelector('.incontent p');
            const description = descriptionElement ? descriptionElement.innerText.trim() : null;

            const objectiveElements = document.querySelectorAll('.incontent ul.list li');
            const objectives = objectiveElements ? Array.from(objectiveElements).map(li => li.innerText.trim()) : [];

            const tableRows = document.querySelectorAll('.table-responsive table tbody tr');
            const links = tableRows ? Array.from(tableRows).map(row => {
                const titleElement = row.querySelector('td:nth-child(2)');
                const title = titleElement ? titleElement.innerText.split('Size')[0].trim() : null;

                const linkElement = row.querySelector('td:nth-child(3) a');
                const pdfLink = linkElement ? linkElement.href : null;

                return { title, pdfLink };
            }) : [];

            return {
                missionTitle,
                imageSrc,
                description,
                objectives,
                links
            };
        });

        results.push({ url, data });
    }

    fs.writeFileSync('education_schemes.json', JSON.stringify(results, null, 2));

    await browser.close();
})();
