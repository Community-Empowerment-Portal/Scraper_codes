const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

async function scrapeData(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 300000 });

    const result = await page.evaluate(() => {
        function getSchemeData(nodes) {
            let description = ''
            let eligibility = ''
            let requiredDocuments =''
            if(nodes[0]?.textContent.trim() === 'Aim:' ||nodes[0]?.textContent.trim() === 'AIM OF THE SCHEME:'){
                description = nodes[1]?.textContent.trim()
            }
            else if(nodes[0]?.textContent.split(':')[0].trim() === 'Objective'){
                description = nodes[0]?.textContent.split(':')[1].trim()
            }
            else{
                description = nodes[0]?.textContent.trim()
            }
            if(nodes[1]?.textContent.trim() === 'Eligibility:'){
                for(let i = 0; i<nodes[2]?.children.length;i++ ){
                    eligibility += nodes[2]?.children[i].textContent.trim()+'\n'
                }
            }
            if(nodes[3]?.textContent.trim().startsWith('Required Documents:')){
                for(let i = 0; i<nodes[4]?.children.length;i++ ){
                    requiredDocuments += nodes[4]?.children[i].textContent.trim()+'\n'
                }
            }

            return {
                applyLink,
                description,
                eligibility,
                requiredDocuments,
            };
        }
    
        const nodes = document.querySelector('.even.field-item')?.children || [];
        const applyLink = document.querySelector("td a")?.href || ''
        return getSchemeData(nodes, applyLink);
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
        const rows = document.querySelectorAll("tbody tr td a")
        rows.forEach((row) => {
            const title = row?.textContent.trim()
            const scheme_url = row?.href
            data.push({ title, scheme_url });
        });
        return data;
    });

    await browser.close();
    return result;
}

async function run() {

    const allData = await getAllUrls('https://chdsw.gov.in/index.php/scheme/index');
    const promises = allData.map(async (scheme) => {
        const scrapedData =  await scrapeData(scheme.scheme_url);
        return { id: uuidv4(), ...scheme, ...scrapedData };
    });


    const result = await Promise.all(promises);

    await fs.writeFile('chandigarh.json', JSON.stringify(result, null, 2), 'utf8');
}

run();