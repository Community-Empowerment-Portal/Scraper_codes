const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function departmental_pdf_links() {
    const url = 'https://sje.rajasthan.gov.in/Default.aspx?PageID=3453';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 60000 });

    const result = await page.evaluate(() => {
        let data = [];
        const rows = document.querySelectorAll('.tbl tbody tr');
        rows.forEach((it, index) => {
            if (index === 0) return;
            const title = it.children[1].children[0]?.textContent;
            const schemeUrl = it.children[1].children[0]?.href;
            const requireDocumentsUrl = it.children[2].children[0]?.href;
            const userManualUrl = it.children[3].children[0]?.href;
            data.push({ title, schemeUrl, requireDocumentsUrl, userManualUrl });
        });
        return data;
    });
    await fs.writeFile('rajasthan-department-scheme_url.json', JSON.stringify(result, null, 2));
    await browser.close();
}

let allResults = [];

async function scrape_title_and_pdfUrl(urls) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const url of urls) {
        try {
            await page.goto(url, { timeout: 60000 });

            const result = await page.evaluate(() => {
                let data = [];
                const rows = document.querySelectorAll('p a');

                rows.forEach((it) => {
                    const title = it.textContent.trim();
                    const pdfUrl = it.href;
                    if (pdfUrl.endsWith('.pdf')) {
                        data.push({ title, pdfUrl });
                    } else {
                        data.push({ title, pdfUrl });
                    }
                });
                return data;
            });

            for (let res of result) {
                if (!res.pdfUrl.endsWith('.pdf')) {
                    const embedSrc = await getEmbedSrc(res.pdfUrl);
                    if (embedSrc) {
                        res.pdfUrl = embedSrc;
                    }
                }
            }

            allResults = [...allResults, ...result];
        } catch (err) {
            console.error(`Error scraping ${url}:`, err);
        }
    }

    await fs.writeFile('rajasthan-pdf-links.json', JSON.stringify(allResults, null, 2), 'utf8');
    console.log('Scraping complete. Results saved to rajasthan-pdf-links.json.');

    await browser.close();
}

async function getEmbedSrc(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let embedSrc = null;

    try {
        await page.goto(url, { timeout: 60000 });

        embedSrc = await page.evaluate(() => {
            const embedTag = document.querySelector('embed');
            return embedTag ? embedTag.src : null;
        });
    } catch (err) {
        console.error(`Error fetching embed src for ${url}:`, err);
    }

    await browser.close();
    return embedSrc;
}

async function getUrls(base_url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(base_url, { timeout: 60000 });

    const result = await page.evaluate(() => {
        let allUrls = [];
        const links = document.querySelectorAll('li div a');
        links.forEach((it) => {
            const link = it.href;
            if (link.endsWith('.pdf')) {
                const title = it.textContent.trim();
                allUrls.push({ title, pdfUrl: link });
            } else {
                allUrls.push(link);
            }
        });
        return allUrls;
    });

    await browser.close();
    return result;
}

(async () => {
    const base_url = 'https://sje.rajasthan.gov.in/Default.aspx?PageID=2'; 
    let res = await getUrls(base_url); 
    const urls = []
    res.forEach((url)=>{
        if(typeof url === 'string'){urls.push(url)}
        else{allResults.push(url)}
    })
    await scrape_title_and_pdfUrl(urls);
})();
