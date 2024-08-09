const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
    'http://samajkalyan.up.gov.in/en/article/scholarship-scheme',
    'http://samajkalyan.up.gov.in/en/article/old-age-pension-scheme',
    'http://samajkalyan.up.gov.in/en/article/old-age-homes',
    'http://samajkalyan.up.gov.in/en/article/national-family-benefit-scheme',
    'http://samajkalyan.up.gov.in/en/article/mukhyamantri-samuhik-vivah-yojana',
    'http://samajkalyan.up.gov.in/en/article/pre-examination-training-centers',
    'http://samajkalyan.up.gov.in/en/article/scheduled-caste-hostel-scheme',
    'http://samajkalyan.up.gov.in/en/article/torture-and-harrasment',
    // Add more URLs as needed
];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const results = [];

    for (let url of urls) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            const result = {};

            // Extracting the title
            const title = document.querySelector('h2')?.innerText || 'No title found';
            result.title = title;

            // Extracting the scheme description
            const descriptionParagraphs = document.querySelectorAll('.resp-tab-content-active p');
            let description = '';
            descriptionParagraphs.forEach(p => {
                description += p.innerText + '\n';
            });
            result.description = description.trim();

            // Extracting table data
            const tableRows = document.querySelectorAll('.table-responsive table tr');
            const tableData = [];
            tableRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length === 2) {
                    tableData.push({
                        key: cells[0].innerText.trim(),
                        value: cells[1].innerText.trim()
                    });
                }
            });
            result.tableData = tableData;

            return result;
        });

        results.push({ url, data });
        await page.close();
    }

    await browser.close();

    // Save results to socialwelfare.js
    fs.writeFileSync('socialwelfare.json', JSON.stringify(results, null, 2), 'utf-8');
    console.log('Data saved to socialwelfare.json');
})();
