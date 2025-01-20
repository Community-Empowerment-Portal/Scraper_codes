const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

async function get_scheme_data(scheme_data) {
    const url = scheme_data.scheme_url;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { timeout: 300000 });

        const result = await page.evaluate(() => {
            const description = document.querySelector('.cardcontents.paddingbottom');
            return description ? description.innerText.trim() : '';
        });

        // Add a unique ID and description to the scheme data
        return { id: uuidv4(), scheme_url: url, ...scheme_data, description: result };
    } catch (error) {
        console.log(`Error fetching data from ${url}:`, error.message);
        return { id: uuidv4(), scheme_url: url, ...scheme_data, description: '' };
    } finally {
        await browser.close();
    }
}

async function get_schemes(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { timeout: 300000 });

        const result = await page.evaluate(() => {
            const rows = document.querySelectorAll('.nm-post-title');
            const data = [];
            rows.forEach((row) => {
                const title = row.innerText.trim();
                const scheme_url = row.querySelector('a')?.href || '';
                if (title && scheme_url) {
                    data.push({ title, scheme_url });
                }
            });
            return data;
        });

        // Fetch data for each scheme
        const schemesWithDetails = [];
        for (let i = 0; i < result.length; i++) {
            schemesWithDetails.push(await get_scheme_data(result[i]));
        }

        return schemesWithDetails;
    } catch (error) {
        console.log(`Error fetching schemes from ${url}:`, error.message);
        return [];
    } finally {
        await browser.close();
    }
}

async function main() {
    const allSchemes = [];
    const promises = [];

    // Loop through pages
    for (let i = 1; i <= 12; i++) {
        promises.push(get_schemes(`https://education.arunachal.gov.in/career/scholarship/page/${i}`));
    }

    // Wait for all pages to be scraped
    const results = await Promise.all(promises);
    results.forEach((schemes) => allSchemes.push(...schemes));

    // Write the final data to a file
    await fs.writeFile('arunachal_scholarship_1.json', JSON.stringify(allSchemes, null, 2));
    console.log('Scraping done, data saved to arunachal_scholarship_1.json');
}

main().catch((error) => console.error('Error in main:', error.message));
