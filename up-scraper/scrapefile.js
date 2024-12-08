
// const puppeteer = require('puppeteer');
// const fs = require('fs');

// const urls = [
//     'https://www.backwardwelfareup.gov.in/en/page/computer-training-scheme',
//     'https://www.backwardwelfareup.gov.in/en/page/prematric',
//     'https://www.backwardwelfareup.gov.in/en/page/postmatric',
//     'https://www.backwardwelfareup.gov.in/en/page/feereimbursement',
//     'https://www.backwardwelfareup.gov.in/en/page/marriage-grant-scheme',
//     'https://www.backwardwelfareup.gov.in/en/page/hostel-construction-scheme'
//     // Add more URLs here
// ];

// async function scrape(url) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(url);

//     const data = await page.evaluate(() => {
//         const extractText = (element) => {
//             return element && element.innerText ? element.innerText.trim().replace(/⇒\s*/g, '') : null;
//         };

//         const findElementContainingText = (tag, texts) => {
//             const elements = document.getElementsByTagName(tag);
//             for (let element of elements) {
//                 for (let text of texts) {
//                     if (element.textContent && element.textContent.toLowerCase().includes(text.toLowerCase())) {
//                         return element;
//                     }
//                 }
//             }
//             return null;
//         };

//         const extractTableText = (headers) => {
//             const headerElement = findElementContainingText('h3', headers);
//             if (!headerElement) return null;

//             const table = headerElement.nextElementSibling;
//             if (!table || table.tagName !== 'TABLE') return null;

//             const tableRows = Array.from(table.querySelectorAll('tbody tr'));
//             return tableRows.map(row => {
//                 const cells = row.querySelectorAll('td');
//                 return cells[1] ? cells[1].innerText.trim().replace(/⇒\s*/g, '') : null;
//             }).filter(item => item); // Filter out null values
//         };

//         const extractTableWithExtra = (headers) => {
//             const headerElement = findElementContainingText('h3', headers);
//             if (!headerElement) return null;

//             const table = headerElement.nextElementSibling;
//             if (!table || table.tagName !== 'TABLE') return null;

//             const tableRows = Array.from(table.querySelectorAll('tbody tr'));
//             return tableRows.map(row => {
//                 const cells = row.querySelectorAll('td');
//                 return {
//                     content: cells[1] ? cells[1].innerText.trim().replace(/⇒\s*/g, '') : null,
//                     extra: cells[2] ? cells[2].innerText.trim().replace(/⇒\s*/g, '') : null
//                 };
//             }).filter(item => item.content); // Filter out items without content
//         };

//         const extractList = (headers) => {
//             const headerElement = findElementContainingText('h3', headers);
//             if (!headerElement) return null;

//             const list = headerElement.nextElementSibling;
//             if (!list || list.tagName !== 'UL') return null;

//             return Array.from(list.querySelectorAll('li')).map(item => item.innerText.trim());
//         };

//         return {
//             objective: extractText(findElementContainingText('h3', ['Objective', 'Objectives'])?.nextElementSibling?.querySelector('tbody tr td:nth-child(2) p')) ||
//                         extractText(findElementContainingText('p', ['Objective', 'Objectives'])),
//             eligibility: extractList(['Eligibility']) || extractTableText(['Eligibility']),
//             courseAndDuration: extractTableWithExtra(['Course and Duration']),
//             amount: extractList(['Amount']) || extractTableWithExtra(['Amount']),
//             selectionProcess: extractList(['Selection process', 'Process', 'Procedure to fill online application']) ||
//                                 extractText(findElementContainingText('h3', ['Selection process', 'Process', 'Procedure to fill online application'])?.nextElementSibling),

//             onlineApplicationGuidelines: extractTableText(['Guidelines regarding online application']),
//             importantPoints: extractTableText(['Important points','Important Point']),
//             traineeGuidelines: extractTableWithExtra(['Guidelines/conditions for trainee']),
//             progressReport: extractTableWithExtra([
//                 'Progress report',
//                 'Progress report of computer training scheme of last 5 years',
//                 'Progress report on fee reimbursement of last 5 years',
//                 'Progress report of pre matric scholarship of last years'
//             ])
//         };
//     });

//     await browser.close();
//     return data;
// }

// (async () => {
//     const results = [];

//     for (const url of urls) {
//         try {
//             const data = await scrape(url);
//             results.push({ url, data });
//         } catch (error) {
//             console.error(`Error scraping ${url}:`, error);
//         }
//     }

//     // Save the data to up.json
//     fs.writeFileSync('up.json', JSON.stringify(results, null, 2));

//     console.log('Data saved to up.json');
// })();
const puppeteer = require('puppeteer');
const fs = require('fs');
const {v4: uuidv4} = require('uuid')

const urls = [
    'https://www.backwardwelfareup.gov.in/en/page/computer-training-scheme',
    'https://www.backwardwelfareup.gov.in/en/page/prematric',
    'https://www.backwardwelfareup.gov.in/en/page/postmatric',
    'https://www.backwardwelfareup.gov.in/en/page/feereimbursement',
    'https://www.backwardwelfareup.gov.in/en/page/marriage-grant-scheme',
    'https://www.backwardwelfareup.gov.in/en/page/hostel-construction-scheme',
    'http://samajkalyan.up.gov.in/en/article/scholarship-scheme' // Adding the new URL here
];

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    const data = await page.evaluate(() => {
        const extractText = (element) => {
            return element && element.innerText ? element.innerText.trim().replace(/⇒\s*/g, '') : null;
        };

        const findElementContainingText = (tag, texts) => {
            const elements = document.getElementsByTagName(tag);
            for (let element of elements) {
                for (let text of texts) {
                    if (element.textContent && element.textContent.toLowerCase().includes(text.toLowerCase())) {
                        return element;
                    }
                }
            }
            return null;
        };

        const extractTableText = (headers) => {
            const headerElement = findElementContainingText('h3', headers);
            if (!headerElement) return null;

            const table = headerElement.nextElementSibling;
            if (!table || table.tagName !== 'TABLE') return null;

            const tableRows = Array.from(table.querySelectorAll('tbody tr'));
            return tableRows.map(row => {
                const cells = row.querySelectorAll('td');
                return cells[1] ? cells[1].innerText.trim().replace(/⇒\s*/g, '') : null;
            }).filter(item => item); // Filter out null values
        };

        const extractTableWithExtra = (headers) => {
            const headerElement = findElementContainingText('h3', headers);
            if (!headerElement) return null;

            const table = headerElement.nextElementSibling;
            if (!table || table.tagName !== 'TABLE') return null;

            const tableRows = Array.from(table.querySelectorAll('tbody tr'));
            return tableRows.map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    content: cells[1] ? cells[1].innerText.trim().replace(/⇒\s*/g, '') : null,
                    extra: cells[2] ? cells[2].innerText.trim().replace(/⇒\s*/g, '') : null
                };
            }).filter(item => item.content); // Filter out items without content
        };

        const extractList = (headers) => {
            const headerElement = findElementContainingText('h3', headers);
            if (!headerElement) return null;

            const list = headerElement.nextElementSibling;
            if (!list || list.tagName !== 'UL') return null;

            return Array.from(list.querySelectorAll('li')).map(item => item.innerText.trim());
        };

        // Extract data based on the initial structure
        const objective = extractText(findElementContainingText('h3', ['Objective', 'Objectives'])?.nextElementSibling?.querySelector('tbody tr td:nth-child(2) p')) ||
                          extractText(findElementContainingText('p', ['Objective', 'Objectives']));

        const eligibility = extractList(['Eligibility']) || extractTableText(['Eligibility']);
        const courseAndDuration = extractTableWithExtra(['Course and Duration']);
        const amount = extractList(['Amount']) || extractTableWithExtra(['Amount']);
        const selectionProcess = extractList(['Selection process', 'Process', 'Procedure to fill online application']) ||
                                 extractText(findElementContainingText('h3', ['Selection process', 'Process', 'Procedure to fill online application'])?.nextElementSibling);
        const onlineApplicationGuidelines = extractTableText(['Guidelines regarding online application']);
        const importantPoints = extractTableText(['Important points','Important Point']);
        const traineeGuidelines = extractTableWithExtra(['Guidelines/conditions for trainee']);
        const progressReport = extractTableWithExtra([
            'Progress report',
            'Progress report of computer training scheme of last 5 years',
            'Progress report on fee reimbursement of last 5 years',
            'Progress report of pre matric scholarship of last years'
        ]);

        // Handle additional extraction for specific URL structure (e.g., samajkalyan.up.gov.in)
        const aboutSchemesElement = document.querySelector('.Government.resp-tab-content-active');
        const listElement = aboutSchemesElement ? aboutSchemesElement.querySelector('ul.list') : null;
        const tableElement = aboutSchemesElement ? aboutSchemesElement.querySelector('table') : null;

        const title = extractText(document.querySelector('.inheading h2'));
        const aboutSchemesDescription = listElement ? Array.from(listElement.querySelectorAll('li')).map(item => item.innerText.trim()) : null;
        const aboutSchemesTableData = tableElement ? Array.from(tableElement.querySelectorAll('tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                key: cells[0] ? cells[0].innerText.trim() : null,
                value: cells[1] ? cells[1].innerText.trim() : null
            };
        }) : null;

        return {
            title: title || null,
            objective: objective,
            eligibility: eligibility,
            courseAndDuration: courseAndDuration,
            amount: amount,
            selectionProcess: selectionProcess,
            onlineApplicationGuidelines: onlineApplicationGuidelines,
            importantPoints: importantPoints,
            traineeGuidelines: traineeGuidelines,
            progressReport: progressReport,
            aboutSchemes: {
                description: aboutSchemesDescription,
                tableData: aboutSchemesTableData
            }
        };
    });

    await browser.close();
    return data;
}

(async () => {
    const results = [];

    for (const url of urls) {
        try {
            const data = await scrape(url);
            results.push({id:uuidv4(), scheme_url:url, ...data });
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
        }
    }

    // Save the data to up.json
    fs.writeFileSync('up.json', JSON.stringify(results, null, 2));

    console.log('Data saved to up.json');
})();
