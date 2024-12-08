const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
    'https://uphwd.gov.in/en/page/central-government-schemes', // Replace with your first URL
    'https://uphwd.gov.in/en/page/state-government-schemes', // Replace with your third URL
    // Add more URLs as needed
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const allData = [];

    for (const url of urls) {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.col-lg-9.col-md-9.col-sm-12.col-xs-12.padding-right.inner-left-content table tbody tr'));
            return rows.map(row => {
                const schemeName = row.querySelector('td:nth-child(2)').innerText.split('File Size')[0].trim();
                const pdfLink = row.querySelector('td:nth-child(3) a').href;
                return {
                    schemeName,
                    pdfLink
                };
            });
        });
        allData.push({ url, schemes: data });
    }

    fs.writeFileSync('disabilities.json', JSON.stringify(allData, null, 2));

    await browser.close();
})();

