// const puppeteer = require('puppeteer');

// (async () => {
//   // Launch the browser
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // Navigate to the website
//   await page.goto('https://pbscfc.punjab.gov.in/?q=node/30', { waitUntil: 'networkidle2' });

//   // Extract data
//   const data = await page.evaluate(() => {
//     // Helper function to find the next sibling element that is not a whitespace text node
//     function getNextElementSibling(element) {
//       let sibling = element.nextElementSibling;
//       while (sibling && sibling.nodeType !== 1) {
//         sibling = sibling.nextElementSibling;
//       }
//       return sibling;
//     }

//     // Select the main content container
//     const container = document.querySelector('.field-name-body');

//     // Extract details
//     const eligibilityHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('ELIGIBILITY:-'));
//     const eligibility = Array.from(getNextElementSibling(eligibilityHeader).querySelectorAll('li')).map(li => li.innerText).join('\n');

//     const annualIncomeHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('ANNUAL INCOME'));
//     const annualIncome = annualIncomeHeader.innerText.replace('ANNUAL INCOME:-', '').trim() + ' ' + getNextElementSibling(annualIncomeHeader).innerText.trim();

//     const fundingPatternHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('FUNDING PATTERN'));
//     const fundingPatternList = getNextElementSibling(fundingPatternHeader);
//     const fundingPattern = Array.from(fundingPatternList.querySelectorAll('li')).map(li => li.innerText);

//     const procedureHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('PROCEDURE FOR TAKING LOAN:-'));
//     const procedure = getNextElementSibling(procedureHeader).innerText.trim();

//     const moreInfoLink = container.querySelector('a[href*="socialjustice.nic.in"]').href;

//     return {
//       eligibility,
//       annualIncome,
//       fundingPattern,
//       procedure,
//       moreInfoLink
//     };
//   });

//   // Log the extracted data
//   console.log(data);

//   // Save data to a JSON file
//   const fs = require('fs');
//   fs.writeFileSync('punjab_scheme.json', JSON.stringify(data, null, 2));

//   // Close the browser
//   await browser.close();
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   const schemeUrls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
//   ];

//   const scrapeSchemeData = async (url) => {
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     const data = await page.evaluate(() => {
//       function getNextElementSibling(element) {
//         let sibling = element.nextElementSibling;
//         while (sibling && sibling.nodeType !== 1) {
//           sibling = sibling.nextElementSibling;
//         }
//         return sibling;
//       }

//       const container = document.querySelector('.field-name-body');
//       if (!container) return null;

//       const eligibilityHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('ELIGIBILITY'));
//       const eligibility = eligibilityHeader ? Array.from(getNextElementSibling(eligibilityHeader).querySelectorAll('li')).map(li => li.innerText).join('\n') : null;

//       const annualIncomeHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('ANNUAL INCOME'));
//       const annualIncome = annualIncomeHeader ? annualIncomeHeader.innerText.replace('ANNUAL INCOME:-', '').trim() + ' ' + getNextElementSibling(annualIncomeHeader).innerText.trim() : null;

//       const fundingPatternHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('FUNDING PATTERN'));
//       const fundingPatternList = fundingPatternHeader ? getNextElementSibling(fundingPatternHeader) : null;
//       const fundingPattern = fundingPatternList ? Array.from(fundingPatternList.querySelectorAll('li')).map(li => li.innerText) : null;

//       const procedureHeader = Array.from(container.querySelectorAll('p')).find(p => p.innerText.includes('PROCEDURE FOR TAKING LOAN'));
//       const procedure = procedureHeader ? procedureHeader.nextElementSibling.innerText.trim() : null;

//       const moreInfoLinkElement = container.querySelector('a[href*="socialjustice.nic.in"]');
//       const moreInfoLink = moreInfoLinkElement ? moreInfoLinkElement.href : null;

//       return {
//         eligibility,
//         annualIncome,
//         fundingPattern,
//         procedure,
//         moreInfoLink
//       };
//     });

//     return data;
//   };

//   const allSchemesData = [];
//   for (const url of schemeUrls) {
//     const schemeData = await scrapeSchemeData(url);
//     if (schemeData) {
//       allSchemesData.push({ url, ...schemeData });
//     } else {
//       console.error(`Failed to scrape data from ${url}`);
//     }
//   }

//   fs.writeFileSync('punjab_schemes.json', JSON.stringify(allSchemesData, null, 2));

//   await browser.close();
// })();

// const puppeteer = require('puppeteer');

// const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     // Add more URLs as needed
// ];

// async function scrapeSchemeData(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const data = await page.evaluate(() => {
//         const getText = (selector) => {
//             const element = document.querySelector(selector);
//             return element ? element.innerText : '';
//         };

//         const getTextByLabel = (label) => {
//             const elements = Array.from(document.querySelectorAll('.field-item p, .field-item div'));
//             const element = elements.find(el => el.innerText.includes(label));
//             return element ? element.innerText.replace(label, '').trim() : '';
//         };

//         const title = getText('.rdf-meta.element-hidden') || getText('.node-schemes .field-name-body strong');
//         const eligibility = getTextByLabel('ELIGIBILITY:');
//         const fundingPattern = getTextByLabel('FUNDING PATTERN:');
//         const subsidy = getTextByLabel('SUBSIDY:');
//         const sourcesOfFunds = getTextByLabel('SOURCES OF FUNDS:');
//         const rateOfInterest = getTextByLabel('RATE OF INTEREST:');
//         const procedure = getTextByLabel('PROCEDURE FOR TAKING LOAN:');

//         return {
//             title,
//             eligibility,
//             fundingPattern,
//             subsidy,
//             sourcesOfFunds,
//             rateOfInterest,
//             procedure,
//         };
//     });

//     await browser.close();
//     return data;
// }

// async function scrapeAllSchemes(urls) {
//     const schemes = [];
//     for (const url of urls) {
//         const data = await scrapeSchemeData(url);
//         schemes.push(data);
//     }
//     console.log(JSON.stringify(schemes, null, 2));
// }

// scrapeAllSchemes(urls);

// const puppeteer = require('puppeteer');

// const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     // Add more URLs as needed
// ];

// async function scrapeSchemeData(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const data = await page.evaluate(() => {
//         const getText = (selector) => {
//             const element = document.querySelector(selector);
//             return element ? element.innerText : '';
//         };

//         const getTextByLabel = (label) => {
//             const elements = Array.from(document.querySelectorAll('.field-item p, .field-item div, .field-item strong'));
//             const element = elements.find(el => el.innerText.includes(label));
//             if (element) {
//                 let nextElement = element.nextElementSibling;
//                 let text = '';
//                 while (nextElement && nextElement.tagName !== 'STRONG') {
//                     text += nextElement.innerText + ' ';
//                     nextElement = nextElement.nextElementSibling;
//                 }
//                 return text.trim();
//             }
//             return '';
//         };

//         const title = getText('.rdf-meta.element-hidden') || getText('.node-schemes .field-name-body strong');
//         const eligibility = getTextByLabel('ELIGIBILITY:');
//         const fundingPattern = getTextByLabel('FUNDING PATTERN:');
//         const subsidy = getTextByLabel('SUBSIDY:');
//         const sourcesOfFunds = getTextByLabel('SOURCES OF FUNDS:');
//         const rateOfInterest = getTextByLabel('RATE OF INTEREST:');
//         const procedure = getTextByLabel('PROCEDURE FOR TAKING LOAN:');

//         return {
//             title,
//             eligibility,
//             fundingPattern,
//             subsidy,
//             sourcesOfFunds,
//             rateOfInterest,
//             procedure,
//         };
//     });

//     await browser.close();
//     return data;
// }

// async function scrapeAllSchemes(urls) {
//     const schemes = [];
//     for (const url of urls) {
//         const data = await scrapeSchemeData(url);
//         schemes.push(data);
//     }
//     console.log(JSON.stringify(schemes, null, 2));
// }

// scrapeAllSchemes(urls);
// const puppeteer = require('puppeteer');

// const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29'
//     // Add more URLs as needed
// ];

// async function scrapeSchemeData(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const data = await page.evaluate(() => {
//         const getTextByLabel = (label) => {
//             const elements = Array.from(document.querySelectorAll('.field-item p, .field-item div, .field-item strong'));
//             const element = elements.find(el => el.innerText.includes(label));
//             if (element) {
//                 let nextElement = element.nextElementSibling;
//                 let text = '';
//                 while (nextElement && nextElement.tagName !== 'STRONG') {
//                     text += nextElement.innerText + ' ';
//                     nextElement = nextElement.nextElementSibling;
//                 }
//                 return text.trim();
//             }
//             return '';
//         };

//         const getText = (selector) => {
//             const element = document.querySelector(selector);
//             return element ? element.innerText.trim() : '';
//         };

//         const title = getText('.rdf-meta.element-hidden') || getText('.node-schemes .field-name-body strong');
//         const eligibility = getTextByLabel('ELIGIBILITY:');
//         const fundingPattern = getTextByLabel('FUNDING PATTERN:');
//         const subsidy = getTextByLabel('SUBSIDY:');
//         const sourcesOfFunds = getTextByLabel('SOURCES OF FUNDS:');
//         const rateOfInterest = getTextByLabel('RATE OF INTEREST:');
//         const procedure = getTextByLabel('PROCEDURE FOR TAKING LOAN:');

//         return {
//             title,
//             eligibility,
//             fundingPattern,
//             subsidy,
//             sourcesOfFunds,
//             rateOfInterest,
//             procedure,
//         };
//     });

//     await browser.close();
//     return data;
// }

// async function scrapeAllSchemes(urls) {
//     const schemes = [];
//     for (const url of urls) {
//         const data = await scrapeSchemeData(url);
//         schemes.push(data);
//     }
//     console.log(JSON.stringify(schemes, null, 2));
// }

// scrapeAllSchemes(urls);

// const puppeteer = require('puppeteer');
// const fs = require('fs'); 

// const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
// ];

// async function scrapeSchemeData(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);

//     const data = await page.evaluate(() => {
//         const getTextByLabel = (label) => {
//             const elements = Array.from(document.querySelectorAll('.field-item p, .field-item div, .field-item strong'));
//             const element = elements.find(el => el.innerText.includes(label));
//             if (element) {
//                 let nextElement = element.nextElementSibling;
//                 let text = '';
//                 while (nextElement && nextElement.tagName !== 'STRONG') {
//                     text += nextElement.innerText + ' ';
//                     nextElement = nextElement.nextElementSibling;
//                 }
//                 return text.trim();
//             }
//             return '';
//         };

//         const getText = (selector) => {
//             const element = document.querySelector(selector);
//             return element ? element.innerText.trim() : '';
//         };

//         const title = getText('.rdf-meta.element-hidden') || getText('.node-schemes .field-name-body strong');
//         const eligibility = getTextByLabel('ELIGIBILITY:-');
//         const fundingPattern = getTextByLabel('FINANCING PATTERN FOR REHABILITATION:-');
//         const subsidy = getTextByLabel('SUBSIDY:');
//         const sourcesOfFunds = getTextByLabel('SOURCES OF FUNDS:');
//         const rateOfInterest = getTextByLabel('RATE OF INTEREST:-');
//         const procedure = getTextByLabel('PROCEDURE FOR TAKING LOAN:-');

//         return {
//             title,
//             eligibility,
//             fundingPattern,
//             subsidy,
//             sourcesOfFunds,
//             rateOfInterest,
//             procedure,
//         };
//     });

//     await browser.close();
//     return data;
// }

// async function scrapeAllSchemes(urls) {
//     const schemes = [];
//     for (const url of urls) {
//         const data = await scrapeSchemeData(url);
//         schemes.push(data);
//     }
//     return schemes;
// }

// async function saveDataToFile(data) {
//     fs.writeFileSync('punjab_schemes.json', JSON.stringify(data, null, 2), 'utf-8');
//     console.log('Data saved to punjab_schemes.json');
// }

// (async () => {
//     const schemes = await scrapeAllSchemes(urls);
//     await saveDataToFile(schemes);
// })();



// const puppeteer = require('puppeteer');
// const fs = require('fs'); 

// const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
// ];

// async function scrapeSchemeData(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     const data = await page.evaluate(() => {
//         const getElementText = (selector) => {
//             const element = document.querySelector(selector);
//             return element ? element.innerText.trim() : '';
//         };

//         const getTextByLabel = (label) => {
//             const elements = Array.from(document.querySelectorAll('.field-item p, .field-item div, .field-item strong'));
//             const element = elements.find(el => el.innerText.includes(label));
//             if (element) {
//                 let nextElement = element.nextElementSibling;
//                 let text = '';
//                 while (nextElement && nextElement.tagName !== 'STRONG') {
//                     text += nextElement.innerText + ' ';
//                     nextElement = nextElement.nextElementSibling;
//                 }
//                 return text.trim();
//             }
//             return '';
//         };

//         const title = getElementText('.rdf-meta.element-hidden') || getElementText('.node-schemes .field-name-body strong');
//         const eligibility = getTextByLabel('ELIGIBILITY:-');
//         const fundingPattern = getTextByLabel('FINANCING PATTERN FOR REHABILITATION:-');
//         const subsidy = getTextByLabel('SUBSIDY:');
//         const sourcesOfFunds = getTextByLabel('SOURCES OF FUNDS:');
//         const rateOfInterest = getTextByLabel('RATE OF INTEREST:-');
//         const procedure = getTextByLabel('PROCEDURE FOR TAKING LOAN:-');

//         return {
//             title,
//             eligibility,
//             fundingPattern,
//             subsidy,
//             sourcesOfFunds,
//             rateOfInterest,
//             procedure,
//         };
//     });

//     await browser.close();
//     return data;
// }

// async function scrapeAllSchemes(urls) {
//     const schemes = [];
//     for (const url of urls) {
//         const data = await scrapeSchemeData(url);
//         schemes.push(data);
//     }
//     return schemes;
// }

// async function saveDataToFile(data) {
//     fs.writeFileSync('punjab_schemes.json', JSON.stringify(data, null, 2), 'utf-8');
//     console.log('Data saved to punjab_schemes.json');
// }

// (async () => {
//     const schemes = await scrapeAllSchemes(urls);
//     await saveDataToFile(schemes);
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
// ];

// async function scrapeSchemeData(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     const data = await page.evaluate(() => {
//         const getElementText = (selector) => {
//             const element = document.querySelector(selector);
//             return element ? element.innerText.trim() : '';
//         };

//         const getNextSiblingText = (element) => {
//             let nextElement = element.nextElementSibling;
//             let text = '';
//             while (nextElement && nextElement.tagName !== 'STRONG') {
//                 text += nextElement.innerText + ' ';
//                 nextElement = nextElement.nextElementSibling;
//             }
//             return text.trim();
//         };

//         const extractData = (label) => {
//             const element = Array.from(document.querySelectorAll('.field-item p, .field-item div, .field-item strong')).find(el => el.innerText.includes(label));
//             return element ? getNextSiblingText(element) : '';
//         };

//         const title = getElementText('.rdf-meta.element-hidden') || getElementText('.node-schemes .field-name-body strong');
//         const eligibility = extractData('ELIGIBILITY:-');
//         const fundingPattern = extractData('FINANCING PATTERN FOR REHABILITATION:-') || extractData('FUNDING PATTERN:-');
//         const subsidy = extractData('SUBSIDY:');
//         const sourcesOfFunds = extractData('SOURCES OF FUNDS:');
//         const rateOfInterest = extractData('RATE OF INTEREST:-');
//         const procedure = extractData('PROCEDURE FOR TAKING LOAN:-');

//         return {
//             title,
//             eligibility,
//             fundingPattern,
//             subsidy,
//             sourcesOfFunds,
//             rateOfInterest,
//             procedure,
//         };
//     });

//     await browser.close();
//     return data;
// }

// async function scrapeAllSchemes(urls) {
//     const schemes = [];
//     for (const url of urls) {
//         const data = await scrapeSchemeData(url);
//         schemes.push(data);
//     }
//     return schemes;
// }

// async function saveDataToFile(data) {
//     fs.writeFileSync('punjab_schemes.json', JSON.stringify(data, null, 2), 'utf-8');
//     console.log('Data saved to punjab_schemes.json');
// }

// (async () => {
//     const schemes = await scrapeAllSchemes(urls);
//     await saveDataToFile(schemes);
// })();

// const puppeteer = require('puppeteer');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto('https://pbscfc.punjab.gov.in/?q=node/165', { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return {};

//       const paragraphs = descriptionElement.querySelectorAll('p');
//       const structuredData = {};
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           structuredData[key] = value;
//         } else {
//           structuredData["Description"] = p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const url = 'https://pbscfc.punjab.gov.in/?q=node/165';
//   const data = await scrapeScheme(url);
//   console.log(`Data from ${url}:`, data);
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return {};

//       const paragraphs = descriptionElement.querySelectorAll('p');
//       const structuredData = {};
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           structuredData[key] = value;
//         } else {
//           structuredData["Description"] = p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const url = 'https://pbscfc.punjab.gov.in/?q=node/165';
//   const data = await scrapeScheme(url);

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(data, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return {};

//       const paragraphs = descriptionElement.querySelectorAll('p, div');
//       const structuredData = {};
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           structuredData[key] = value;
//         } else {
//           structuredData["Description"] = p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     const data = await scrapeScheme(url);
//     const schemeName = data.title || `Scheme from ${url}`;
//     allData[schemeName] = data;
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();


// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return {};

//       const paragraphs = descriptionElement.querySelectorAll('p, div');
//       const structuredData = {};
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           structuredData[key] = value;
//         } else {
//           structuredData["Description"] = p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     const data = await scrapeScheme(url);
//     const schemeName = data.title || `Scheme from ${url}`;
//     allData[schemeName] = data;
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return {};

//       const paragraphs = descriptionElement.querySelectorAll('p, div');
//       const structuredData = {};
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           structuredData[key] = value;
//         } else {
//           structuredData["Description"] = p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     console.log(`Scraping URL: ${url}`);
//     const data = await scrapeScheme(url);
//     const schemeName = data.title || `Scheme from ${url}`;
//     console.log(`Extracted data for scheme: ${schemeName}`);
//     allData[schemeName] = data;
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();
// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return {};

//       const paragraphs = descriptionElement.querySelectorAll('p, div, ul');
//       const structuredData = {};
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           structuredData[key] = value;
//         } else {
//           structuredData["Description"] = p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     console.log(`Scraping URL: ${url}`);
//     const data = await scrapeScheme(url);
//     const schemeName = data.title || `Scheme from ${url}`;
//     console.log(`Extracted data for scheme: ${schemeName}`);
//     allData[schemeName] = data;
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate(() => {
//     const getTextContent = (selector) => {
//       const element = document.querySelector(selector);
//       return element ? element.textContent.trim() : '';
//     };

//     const getDescription = () => {
//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       return descriptionElement ? descriptionElement.innerText.trim() : '';
//     };

//     const getStructuredData = () => {
//       const structuredData = {
//         'ELIGIBILITY': '',
//         'FUNDING PATTERN': '',
//         'SUBSIDY': '',
//         'SOURCES OF FUNDS': '',
//         'REPAYMENT': '',
//         'RATE OF INTEREST': '',
//         'PROCEDURE FOR TAKING LOAN': ''
//       };

//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return structuredData;

//       const paragraphs = descriptionElement.querySelectorAll('p, div, ul');
      
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           if (structuredData.hasOwnProperty(key)) {
//             structuredData[key] = value;
//           } else {
//             structuredData['Description'] = (structuredData['Description'] || '') + ' ' + value;
//           }
//         } else {
//           structuredData['Description'] = (structuredData['Description'] || '') + ' ' + p.textContent.trim();
//         }
//       });

//       return structuredData;
//     };

//     const title = getTextContent('.field-name-body .field-item strong');
//     const description = getDescription();
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   });

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     console.log(`Scraping URL: ${url}`);
//     const data = await scrapeScheme(url);
//     const schemeName = data.title || `Scheme from ${url}`;
//     console.log(`Extracted data for scheme: ${schemeName}`);
//     allData[schemeName] = data;
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// // Define possible selectors for each field
// const fieldSelectors = {
//   title: ['.field-name-body .field-item strong', '.scheme-title h1', '.title-class'],
//   description: ['.field-name-body .field-item', '.scheme-description', '.description-class'],
//   eligibility: ['strong:contains("ELIGIBILITY:-")','strong:contains("ELIGIBILITY:")', 'p:contains("ELIGIBILITY")', '.eligibility-class'],
//   funding: ['strong:contains("FUNDING")', 'strong:contains("FUNDING PATTERN:-")','p:contains("FUNDING")', '.funding-class'],
//   subsidy: ['strong:contains("SUBSIDY")','strong:contains("SUBSIDY:-")', 'strong:contains("SUBSIDY:")','p:contains("SUBSIDY")', '.subsidy-class'],
//   sources: ['strong:contains("SOURCES OF FUNDS")', 'strong:contains("SOURCES OF FUNDS:-")','p:contains("SOURCES")', '.sources-class'],
//   repayment: ['strong:contains("REPAYMENT")','strong:contains("REPAYMENT:-")', 'p:contains("REPAYMENT")', '.repayment-class'],
//   rateOfInterest: ['strong:contains("RATE OF INTEREST :-")','strong:contains("Loan:")','strong:contains("RATE OF INTEREST:-")', 'p:contains("RATE OF INTEREST")', '.rate-class'],
//   procedure: ['strong:contains("PROCEDURE FOR TAKING LOAN")','strong:contains("Procedure for taking loan:")','strong:contains("PROCEDURE FOR TAKING LOAN:-")', 'p:contains("PROCEDURE")', '.procedure-class']
// };

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate((fieldSelectors) => {
//     const getTextContent = (selectors) => {
//       for (const selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) return element.textContent.trim();
//       }
//       return '';
//     };

//     const getDescription = (selectors) => {
//       for (const selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) return element.innerText.trim();
//       }
//       return '';
//     };

//     const getStructuredData = (selectors) => {
//       const structuredData = {
//         'ELIGIBILITY': '',
//         'FUNDING PATTERN': '',
//         'SUBSIDY': '',
//         'SOURCES OF FUNDS': '',
//         'REPAYMENT': '',
//         'RATE OF INTEREST': '',
//         'PROCEDURE FOR TAKING LOAN': '',
//         'Description': ''
//       };

//       const descriptionElement = document.querySelector(selectors.description);
//       if (!descriptionElement) return structuredData;

//       const paragraphs = descriptionElement.querySelectorAll('p, div, ul');

//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           if (structuredData.hasOwnProperty(key)) {
//             structuredData[key] = value;
//           } else {
//             structuredData['Description'] += value + ' ';
//           }
//         } else {
//           structuredData['Description'] += p.textContent.trim() + ' ';
//         }
//       });

//       // Trim extra spaces
//       Object.keys(structuredData).forEach(key => {
//         structuredData[key] = structuredData[key].trim();
//       });

//       return structuredData;
//     };

//     const title = getTextContent(fieldSelectors.title);
//     const description = getDescription(fieldSelectors.description);
//     const structuredData = getStructuredData(fieldSelectors);

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   }, fieldSelectors);

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     console.log(`Scraping URL: ${url}`);
//     const data = await scrapeScheme(url);
//     if (data.title) {
//       const schemeName = data.title || `Scheme from ${url}`;
//       console.log(`Extracted data for scheme: ${schemeName}`);
//       allData[schemeName] = data;
//     } else {
//       console.log(`No title found for URL: ${url}`);
//     }
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();
// const puppeteer = require('puppeteer');
// const fs = require('fs');

// // Define possible selectors for each field
// const fieldSelectors = {
//     title: ['.field-name-body .field-item strong', '.scheme-title h1', '.title-class'],
//     description: ['.field-name-body .field-item', '.scheme-description', '.description-class'],
//     eligibility: ['strong:contains("ELIGIBILITY:-")','strong:contains("ELIGIBILITY:")', 'p:contains("ELIGIBILITY")', '.eligibility-class'],
//     funding: ['strong:contains("FUNDING")', 'strong:contains("FUNDING PATTERN:-")','p:contains("FUNDING")', '.funding-class'],
//     subsidy: ['strong:contains("SUBSIDY")','strong:contains("SUBSIDY:-")', 'strong:contains("SUBSIDY:")','p:contains("SUBSIDY")', '.subsidy-class'],
//     sources: ['strong:contains("SOURCES OF FUNDS")', 'strong:contains("SOURCES OF FUNDS:-")','p:contains("SOURCES")', '.sources-class'],
//     repayment: ['strong:contains("REPAYMENT")','strong:contains("REPAYMENT:-")', 'p:contains("REPAYMENT")', '.repayment-class'],
//     rateOfInterest: ['strong:contains("RATE OF INTEREST :-")','strong:contains("Loan:")','strong:contains("RATE OF INTEREST:-")', 'p:contains("RATE OF INTEREST")', '.rate-class'],
//     procedure: ['strong:contains("PROCEDURE FOR TAKING LOAN")','strong:contains("Procedure for taking loan:")','strong:contains("PROCEDURE FOR TAKING LOAN:-")', 'p:contains("PROCEDURE")', '.procedure-class']
// };

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate((fieldSelectors) => {
//     const getTextContent = (selectors) => {
//       for (const selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) return element.textContent.trim();
//       }
//       return '';
//     };

//     const getDescription = (selectors) => {
//       for (const selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) return element.innerText.trim();
//       }
//       return '';
//     };

//     const getStructuredData = () => {
//       const structuredData = {
//         'ELIGIBILITY': '',
//         'FUNDING PATTERN': '',
//         'SUBSIDY': '',
//         'SOURCES OF FUNDS': '',
//         'REPAYMENT': '',
//         'RATE OF INTEREST': '',
//         'PROCEDURE FOR TAKING LOAN': '',
//         'Description': ''
//       };

//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return structuredData;

//       const paragraphs = descriptionElement.querySelectorAll('p, div, ul');

//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim().toUpperCase();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           if (structuredData.hasOwnProperty(key)) {
//             structuredData[key] = value;
//           } else {
//             structuredData['Description'] += value + ' ';
//           }
//         } else {
//           structuredData['Description'] += p.textContent.trim() + ' ';
//         }
//       });

//       // Trim extra spaces
//       Object.keys(structuredData).forEach(key => {
//         structuredData[key] = structuredData[key].trim();
//       });

//       return structuredData;
//     };

//     const title = getTextContent(fieldSelectors.title);
//     const description = getDescription(fieldSelectors.description);
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   }, fieldSelectors);

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     console.log(`Scraping URL: ${url}`);
//     try {
//       const data = await scrapeScheme(url);
//       if (data.title) {
//         const schemeName = data.title || `Scheme from ${url}`;
//         console.log(`Extracted data for scheme: ${schemeName}`);
//         allData[schemeName] = data;
//       } else {
//         console.log(`No title found for URL: ${url}`);
//       }
//     } catch (error) {
//       console.error(`Error scraping URL: ${url}`, error);
//     }
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();

// const puppeteer = require('puppeteer');
// const fs = require('fs');

// // Define possible selectors for each field
// const fieldSelectors = {
//     title: ['.field-name-body .field-item strong', '.scheme-title h1', '.title-class'],
//     description: ['.field-name-body .field-item', '.scheme-description', '.description-class'],
//     eligibility: ['strong:contains("ELIGIBILITY:-")','strong:contains("ELIGIBILITY:")', 'p:contains("ELIGIBILITY")', '.eligibility-class'],
//     funding: ['strong:contains("FUNDING")', 'strong:contains("FUNDING PATTERN:-")','p:contains("FUNDING")', '.funding-class'],
//     subsidy: ['strong:contains("SUBSIDY")','strong:contains("SUBSIDY:-")', 'strong:contains("SUBSIDY:")','p:contains("SUBSIDY")', '.subsidy-class'],
//     sources: ['strong:contains("SOURCES OF FUNDS")', 'strong:contains("SOURCES OF FUNDS:-")','p:contains("SOURCES")', '.sources-class'],
//     repayment: ['strong:contains("REPAYMENT")','strong:contains("REPAYMENT:-")', 'p:contains("REPAYMENT")', '.repayment-class'],
//     rateOfInterest: ['strong:contains("RATE OF INTEREST :-")','strong:contains("Loan:")','strong:contains("RATE OF INTEREST:-")', 'p:contains("RATE OF INTEREST")', '.rate-class'],
//     procedure: ['strong:contains("PROCEDURE FOR TAKING LOAN")','strong:contains("Procedure for taking loan:")','strong:contains("PROCEDURE FOR TAKING LOAN:-")', 'p:contains("PROCEDURE")', '.procedure-class']
// };

// async function scrapeScheme(url) {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'networkidle2' });

//   const data = await page.evaluate((fieldSelectors) => {
//     const getTextContent = (selectors) => {
//       for (const selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) return element.textContent.trim();
//       }
//       return '';
//     };

//     const getDescription = (selectors) => {
//       for (const selector of selectors) {
//         const element = document.querySelector(selector);
//         if (element) return element.innerText.trim();
//       }
//       return '';
//     };

//     const getStructuredData = () => {
//       const structuredData = {
//         'ELIGIBILITY': '',
//         'FUNDING PATTERN': '',
//         'SUBSIDY': '',
//         'SOURCES OF FUNDS': '',
//         'REPAYMENT': '',
//         'RATE OF INTEREST': '',
//         'PROCEDURE FOR TAKING LOAN': '',
//         'Description': ''
//       };

//       const descriptionElement = document.querySelector('.field-name-body .field-item');
//       if (!descriptionElement) return structuredData;

//       const paragraphs = descriptionElement.querySelectorAll('p, div, ul');
//       paragraphs.forEach(p => {
//         const strong = p.querySelector('strong');
//         if (strong) {
//           const key = strong.textContent.replace(/[:-]/g, '').trim().toUpperCase();
//           const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').trim();
//           if (structuredData.hasOwnProperty(key)) {
//             structuredData[key] = value;
//           } else {
//             structuredData['Description'] += value + ' ';
//           }
//         } else {
//           structuredData['Description'] += p.textContent.trim() + ' ';
//         }
//       });

//       // Trim extra spaces
//       Object.keys(structuredData).forEach(key => {
//         structuredData[key] = structuredData[key].trim();
//       });

//       return structuredData;
//     };

//     const title = getTextContent(fieldSelectors.title);
//     const description = getDescription(fieldSelectors.description);
//     const structuredData = getStructuredData();

//     return {
//       title,
//       description,
//       ...structuredData
//     };
//   }, fieldSelectors);

//   await browser.close();
//   return data;
// }

// (async () => {
//   const urls = [
//     'https://pbscfc.punjab.gov.in/?q=node/26',
//     'https://pbscfc.punjab.gov.in/?q=node/29',
//     'https://pbscfc.punjab.gov.in/?q=node/165',
//     'https://pbscfc.punjab.gov.in/?q=node/25',
//     'https://pbscfc.punjab.gov.in/?q=node/30',
//     'https://pbscfc.punjab.gov.in/?q=node/31'
//   ];

//   const allData = {};

//   for (const url of urls) {
//     console.log(`Scraping URL: ${url}`);
//     try {
//       const data = await scrapeScheme(url);
//       if (data.title) {
//         const schemeName = data.title || `Scheme from ${url}`;
//         console.log(`Extracted data for scheme: ${schemeName}`);
//         allData[schemeName] = data;
//       } else {
//         console.log(`No title found for URL: ${url}`);
//       }
//     } catch (error) {
//       console.error(`Error scraping URL: ${url}`, error);
//     }
//   }

//   // Save data to punjab_scheme.json
//   fs.writeFile('punjab_scheme.json', JSON.stringify(allData, null, 2), (err) => {
//     if (err) {
//       console.error('Error writing to file', err);
//     } else {
//       console.log('Data successfully saved to punjab_scheme.json');
//     }
//   });
// })();

const puppeteer = require('puppeteer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Define possible selectors for each field
const fieldSelectors = {
    title: ['.field-name-body .field-item strong', '.scheme-title h1', '.title-class'],
    description: ['.field-name-body .field-item', '.scheme-description', '.description-class'],
    eligibility: ['strong:contains("ELIGIBILITY:-")','strong:contains("ELIGIBILITY:")', 'p:contains("ELIGIBILITY")', '.eligibility-class'],
    funding: ['strong:contains("FUNDING")', 'strong:contains("FUNDING PATTERN:-")','p:contains("FUNDING")', '.funding-class'],
    subsidy: ['strong:contains("SUBSIDY")','strong:contains("SUBSIDY:-")', 'strong:contains("SUBSIDY:")','p:contains("SUBSIDY")', '.subsidy-class'],
    sources: ['strong:contains("SOURCES OF FUNDS")', 'strong:contains("SOURCES OF FUNDS:-")','p:contains("SOURCES")', '.sources-class'],
    repayment: ['strong:contains("REPAYMENT")','strong:contains("REPAYMENT:-")', 'p:contains("REPAYMENT")', '.repayment-class'],
    rateOfInterest: ['strong:contains("RATE OF INTEREST :-")','strong:contains("Loan:")','strong:contains("RATE OF INTEREST:-")', 'p:contains("RATE OF INTEREST")', '.rate-class'],
    procedure: ['strong:contains("PROCEDURE FOR TAKING LOAN")','strong:contains("Procedure for taking loan:")','strong:contains("PROCEDURE FOR TAKING LOAN:-")', 'p:contains("PROCEDURE")', '.procedure-class']
};

async function scrapeScheme(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const data = await page.evaluate((fieldSelectors) => {
    const getTextContent = (selectors) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element.textContent.trim();
      }
      return '';
    };

    const getDescription = (selectors) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element.innerText.trim();
      }
      return '';
    };

    const getStructuredData = () => {
      const structuredData = {
        'ELIGIBILITY': '',
        'FUNDING PATTERN': '',
        'SUBSIDY': '',
        'SOURCES OF FUNDS': '',
        'REPAYMENT': '',
        'RATE OF INTEREST': '',
        'PROCEDURE FOR TAKING LOAN': '',
        'Description': ''
      };

      const descriptionElement = document.querySelector('.field-name-body .field-item');
      if (!descriptionElement) return structuredData;

      const paragraphs = descriptionElement.querySelectorAll('p, div, ul');
      paragraphs.forEach(p => {
        const strong = p.querySelector('strong');
        if (strong) {
          const key = strong.textContent.replace(/[:-]/g, '').trim().toUpperCase();
          const value = p.innerHTML.replace(/<strong>.*<\/strong>/, '').replace(/<br\s*\/?>/g, '').trim();
          if (structuredData.hasOwnProperty(key)) {
            structuredData[key] = value;
          } else {
            structuredData['Description'] += value + ' ';
          }
        } else {
          structuredData['Description'] += p.textContent.replace(/<br\s*\/?>/g, '').trim() + ' ';
        }
      });

      // Trim extra spaces
      Object.keys(structuredData).forEach(key => {
        structuredData[key] = structuredData[key].trim();
      });

      return structuredData;
    };

    const title = getTextContent(fieldSelectors.title);
    const description = getDescription(fieldSelectors.description);
    const structuredData = getStructuredData();

    return {
      title,
      description,
      ...structuredData
    };
  }, fieldSelectors);

  await browser.close();
  return data;
}

(async () => {
  const urls = [
    'https://pbscfc.punjab.gov.in/?q=node/26',
    'https://pbscfc.punjab.gov.in/?q=node/29',
    'https://pbscfc.punjab.gov.in/?q=node/165',
    'https://pbscfc.punjab.gov.in/?q=node/25',
    'https://pbscfc.punjab.gov.in/?q=node/30',
    'https://pbscfc.punjab.gov.in/?q=node/31'
  ];

  const allData = {};

  for (const url of urls) {
    console.log(`Scraping URL: ${url}`);
    try {
      const data = await scrapeScheme(url);
      const schemeId = uuidv4(); // Generate a unique ID for each scheme
      if (data.title) {
        const schemeName = data.title || `Scheme from ${url}`;
        console.log(`Extracted data for scheme: ${schemeName}`);
        allData[schemeId] = {
          id: schemeId,
          scheme_url:url,
          ...data
        };
      } else {
        console.log(`No title found for URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error scraping URL: ${url}`, error);
    }
  }

  // Save data to punjab_scheme.json
  fs.writeFile('punjab_schemes.json', JSON.stringify(allData, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file', err);
    } else {
      console.log('Data successfully saved to punjab_schemes.json');
    }
  });
})();
