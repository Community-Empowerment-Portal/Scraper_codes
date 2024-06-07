// const puppeteer = require('puppeteer');

// async function run() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage(); // Add await here
//     await page.goto('https://adwelfare.py.gov.in/programmes-schemes');

//     const text = await page.evaluate(()=> document.body.innerText);
//     console.log(text);

//     await browser.close();
// }

// run();

// const puppeteer = require('puppeteer');

// async function scrapeSchemes() {
   
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.goto('https://adwelfare.py.gov.in/programmes-schemes');

   
//     await page.waitForSelector('.item-list');

//     const schemes = await page.evaluate(() => {
//         const schemesList = [];
//         const schemeElements = document.querySelectorAll('.item-list ul li');

//         schemeElements.forEach((scheme) => {
//             const schemeName = scheme.querySelector('a').innerText;
//             schemesList.push({ name: schemeName });
//         });

//         return schemesList;
//     });

//     await browser.close();

//     return schemes;
// }

// scrapeSchemes().then(schemes => console.log(schemes)).catch(err => console.error(err));

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeSchemes() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.goto('https://adwelfare.py.gov.in/programmes-schemes');

//     await page.waitForSelector('.region-content');

//     const data = await page.evaluate(() => {
       
//         const schemesSection = document.querySelector('.region-content .content');
//         if (!schemesSection) {
//             return [];
//         }

      
//         const schemes = [];
//         const items = schemesSection.querySelectorAll('.item-list ul li a');
//         items.forEach(item => {
//             schemes.push({
//                 title: item.innerText.trim(),
//                 link: item.href,
//                 description: item.title || ''
//             });

            
//         });

//         return schemes;
//     });

//     console.log(data);
//     fs.writeFileSync('schemesData.json', JSON.stringify(data), 'utf-8');
//     console.log('Data Saved');

//     await browser.close();
// }

// scrapeSchemes().catch(error => console.error('Error:', error));



// const puppeteer = require('puppeteer');

// const scrap = async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(
//     "https://adwelfare.py.gov.in/distribution-free-house-sites-scheduled-casteother-economically-backward-classes"
//   );
  
//   const response = await page.evaluate(() => {
//     let data = {};
//     const parent = document.querySelector(".table-responsive");
//     const table = parent.querySelector("table");
//     const rows = table.querySelectorAll("tr");

//     rows.forEach(row => {
//       const category = row.querySelector("th").textContent.trim();
//       const detailsHTML = row.querySelector("td").innerHTML;
//       const details = detailsHTML
//         .replace(/<p>/g, '')
//         .replace(/<\/p>/g, '')
//         .split('<br>')
//         .map(detail => detail.trim());
      
//       data[category] = details;
//     });

//     return data;
//   });

//   console.log(JSON.stringify(response, null, 2));
//   await browser.close();
// };

// scrap();

const puppeteer = require('puppeteer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

async function scrapeSchemes() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://adwelfare.py.gov.in/programmes-schemes');
    await page.waitForSelector('.region-content');

    const schemes = await page.evaluate(() => {
        const schemesSection = document.querySelector('.region-content .content');
        if (!schemesSection) {
            return [];
        }

        const schemes = [];
        const items = schemesSection.querySelectorAll('.item-list ul li a');
        items.forEach(item => {
            schemes.push({
                title: item.innerText.trim(),
                link: item.href
            });
        });

        return schemes;
    });

    const detailedSchemes = [];

    for (let i = 0; i < schemes.length; i++) {
        const scheme = schemes[i];
        await page.goto(scheme.link);

        try {
            await page.waitForSelector('.table-responsive', { timeout: 5000 });
        } catch (error) {
            console.error(`Could not find details for scheme: ${scheme.title}`);
            continue;
        }

        const details = await page.evaluate(() => {
            const data = {};
            const table = document.querySelector('.table-responsive table');
            if (!table) {
                return null;
            }
            const rows = table.querySelectorAll('tr');

            rows.forEach(row => {
                const categoryElement = row.querySelector('th');
                const detailsElement = row.querySelector('td');

                if (categoryElement && detailsElement) {
                    const category = categoryElement.textContent.trim();
                    const detailsHTML = detailsElement.innerHTML;
                    const details = detailsHTML
                        .replace(/<p>/g, '')
                        .replace(/<\/p>/g, '')
                        .replace("a)", '')
                        .replace("b)", '')
                        .replace("c)", '')
                        .replace("d)", '')
                        .replace("e)", '')
                        .replace("f)", '')
                        .replace("g)", '')
                        .replace("h)", '')

                        .split('<br>')
                        .map(detail => detail.trim());

                    data[category] = details;
                }
            });

            return data;
        });

        if (details) {
            detailedSchemes.push({
                id: uuidv4(),
                title: scheme.title,
                link: scheme.link,
                details: details
            });
        } else {
            console.error(`Failed to extract details for scheme: ${scheme.title}`);
        }
    }

    console.log(JSON.stringify(detailedSchemes, null, 2));
    fs.writeFileSync('detailedSchemesData.json', JSON.stringify(detailedSchemes, null, 2), 'utf-8');
    console.log('Data Saved');

    await browser.close();
}

scrapeSchemes().catch(error => console.error('Error:', error));
