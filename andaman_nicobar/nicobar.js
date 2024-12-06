const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

async function scrapeData(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 300000 });

    const result = await page.evaluate(() => {
        function cleanText(text) {
            return text
                .replace(/^\s+|\s+$/g, '') // Trim leading and trailing whitespace
                .replace(/\s+/g, ' ') // Replace multiple spaces or newlines with a single space
                .trim();
        }

        function parseData(text,application_form) {
            const titleMatch = text.match(/^\s*(.*?)\n/);
            const title = titleMatch ? cleanText(titleMatch[1]) : null;

            const dateMatch = text.match(/Date\s*:\s*(\d{2}\/\d{2}\/\d{4})/);
            const publishDate = dateMatch ? cleanText(dateMatch[1]) : null;

            const sectorMatch = text.match(/Sector:\s*(.*?)\n/);
            const department = sectorMatch ? cleanText(sectorMatch[1]) : null;

            const descriptionMatch = text.match(/Sector:\s*.*?\n(.*?)Beneficiary:/s);
            const description = descriptionMatch ? cleanText(descriptionMatch[1]) : null;

            const beneficiaryMatch = text.match(/Beneficiary:\s*(.*?)Benefits:/s);
            const beneficiary = beneficiaryMatch ? cleanText(beneficiaryMatch[1]) : null;

            const benefitsMatch = text.match(/Benefits:\s*(.*?)How To Apply/s);
            const benefits = benefitsMatch ? cleanText(benefitsMatch[1]) : null;

            const howToApplyMatch = text.match(/How To Apply\s*(?:Visit:\s*)?(https?:\/\/[^\s]+)/i);
            const howToApply = howToApplyMatch ? cleanText(howToApplyMatch[1]) : null;

            return {
                title,
                publishDate,
                department,
                description,
                beneficiary,
                benefits,
                howToApply,
                application_form
            };
        }
        const rawText = document.querySelector('.row.list-view-no-border.scheme')?.textContent || '';
        const application_form = document.querySelector('.row.list-view-no-border.scheme a')?.href || ''
        return parseData(rawText,application_form);
    });

    await browser.close();
    return result;
}

async function getAllUrls(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 300000 });

    const result = await page.evaluate(() => {
        let data = [];
        const rows = document.querySelectorAll(".publicContainer.schme-img-thirteen a")
        rows.forEach((row) => {
            const title = row?.title.trim()
            const scheme_url = row?.href
            data.push({ title, scheme_url });
        });
        return data;
    });

    await browser.close();
    return result;
}

async function run() {

    const allData = await getAllUrls('https://nicobars.andaman.nic.in/schemes/');
    const promises = allData.map(async (scheme) => {
        const scrapedData =  await scrapeData(scheme.scheme_url);
        return { id: uuidv4(), ...scheme, ...scrapedData };
    });


    const result = await Promise.all(promises);

    await fs.writeFile('nicobar.json', JSON.stringify(result, null, 2), 'utf8');
}

run();
