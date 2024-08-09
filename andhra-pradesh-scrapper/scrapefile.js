// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//     // Launch the browser
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Navigate to the target website
//     await page.goto('https://socialwelfare.apcfss.in/schemes.html');

//     // Wait for the necessary DOM to be rendered
//     await page.waitForSelector('.col-xs-12.col-sm-12.col-md-12.col-lg-12');

//     // Extract data
//     const schemes = await page.evaluate(() => {
//         const schemes = [];
//         const schemeElements = document.querySelectorAll('.col-xs-12.col-sm-12.col-md-12.col-lg-12');

//         schemeElements.forEach(schemeElement => {
//             const titleElement = schemeElement.querySelector('.captions2') || schemeElement.querySelector('.captions');
//             const descriptionElements = schemeElement.querySelectorAll('.desc-para');
//             const tableRows = schemeElement.querySelectorAll('table tbody tr');

//             const title = titleElement ? titleElement.innerText.trim() : 'No title available';
//             const descriptions = [];

//             descriptionElements.forEach(descElement => {
//                 descriptions.push(descElement.innerText.trim());
//             });

//             const tableData = [];
//             tableRows.forEach(row => {
//                 const cells = row.querySelectorAll('td');
//                 const rowData = [];
//                 cells.forEach(cell => {
//                     rowData.push(cell.innerText.trim());
//                 });
//                 tableData.push(rowData);
//             });

//             schemes.push({
//                 title: title,
//                 descriptions: descriptions,
//                 tableData: tableData
//             });
//         });

//         return schemes;
//     });

//     // Save data to andra_pradeshs.json
//     fs.writeFileSync('andhra_pradesh.json', JSON.stringify(schemes, null, 2));

//     console.log('Data saved to andhra_pradesh.json');

//     // Close the browser
//     await browser.close();
// })();

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeData() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Replace with the target URL
    const url = 'https://socialwelfare.apcfss.in/schemes.html';
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
        const result = [];
        
        // Function to clean up text
        const cleanText = (text) => {
            return text.replace(/\n/g, ' ').trim();
        };
        
        const sections = document.querySelectorAll('.col-xs-12.col-sm-12.col-md-12.col-lg-12');
        
        sections.forEach(section => {
            const titles = section.querySelectorAll('.captions, .captions2');
            titles.forEach(title => {
                const titleText = cleanText(title.innerText);
                const paragraphs = [];
                let nextElement = title.nextElementSibling;
                while (nextElement && nextElement.tagName.toLowerCase() === 'p') {
                    paragraphs.push(cleanText(nextElement.innerText));
                    nextElement = nextElement.nextElementSibling;
                }
                result.push({
                    title: titleText,
                    description: paragraphs.join(' ')
                });
            });
        });

        return result;
    });

    // Save data to a JSON file
    fs.writeFileSync('andhra.json', JSON.stringify(data, null, 2), 'utf-8');
    
    await browser.close();
}

scrapeData();
