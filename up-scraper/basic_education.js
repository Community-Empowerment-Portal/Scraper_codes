const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const urls = [
        'https://basiceducation.up.gov.in/en/page/nipun-bharat-(mission-prerna)',
        'https://basiceducation.up.gov.in/en/page/operation-kayakalp',
        'https://basiceducation.up.gov.in/en/page/samekit-siksha',
        'https://basiceducation.up.gov.in/en/page/samudayik-sahbhagita',
        'https://basiceducation.up.gov.in/en/page/kasturba-gandhi-balika-vidlaya-yojana',
        'https://basiceducation.up.gov.in/en/page/mis',
        'https://basiceducation.up.gov.in/en/page/school-chalo-abhiyan',
        'https://basiceducation.up.gov.in/en/page/sharda-program'
    ];

    const results = [];

    for (const url of urls) {
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            const data = await page.evaluate((url) => {
                const container = document.querySelector('.col-md-9 .incontent');
                if (!container) return { url, error: 'Content container not found' };

                const titleElement = container.querySelector('h4');
                const descriptionElement = container.querySelector('p');
                const missionObjectivesElements = container.querySelectorAll('ul.list li');
                const tableRowElements = container.querySelectorAll('table.table tbody tr');

                const title = titleElement ? titleElement.innerText.trim() : 'Title not found';
                const description = descriptionElement ? descriptionElement.innerText.trim() : 'Description not found';

                const missionObjectives = [];
                missionObjectivesElements.forEach(item => {
                    missionObjectives.push(item.innerText.trim());
                });

                const tableRows = [];
                tableRowElements.forEach(row => {
                    const columns = row.querySelectorAll('td');
                    if (columns.length >= 3) {
                        tableRows.push({
                            sNo: columns[0].innerText.trim(),
                            title: columns[1].innerText.trim(),
                            link: columns[2].querySelector('a') ? columns[2].querySelector('a').href : 'Link not found'
                        });
                    }
                });

                return {
                    url,
                    title,
                    description,
                    missionObjectives,
                    tableRows
                };
            }, url);

            results.push(data);
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            results.push({ url, error: error.message });
        }
    }

    fs.writeFileSync('basic_education.json', JSON.stringify(results, null, 2));

    await browser.close();
})();
