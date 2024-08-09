const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Replace 'YOUR_URL_HERE' with the actual URL of the page you want to scrape
    await page.goto('https://balvikasup.gov.in/BalVikasUP2/ServicesAndSchemes.aspx', { waitUntil: 'networkidle2', timeout: 60000 });

    const servicesData = await page.evaluate(() => {
        const serviceCards = document.querySelectorAll('.col-md-12 .card');
        let services = [];

        serviceCards.forEach(card => {
            const titleElement = card.querySelector('.card-title');
            const descriptionElements = card.querySelectorAll('.card-text');
            
            let title = titleElement ? titleElement.innerText.trim() : null;
            if (title) {
                // Remove the numeric prefix and dot from the title
                title = title.replace(/^\d+\.\s*/, '');
            }
            
            let descriptions = [];

            descriptionElements.forEach(descElement => {
                descriptions.push(descElement ? descElement.innerText.trim() : null);
            });

            services.push({
                title,
                descriptions
            });
        });

        return services;
    });

    fs.writeFileSync('mother_welfare.json', JSON.stringify(servicesData, null, 2));

    await browser.close();
})();
