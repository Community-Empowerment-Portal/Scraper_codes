const puppeteer = require('puppeteer')
const fs = require('fs')

async function scrapeHaryana(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://haryana.gov.in/schemes-programmes/');
    const result = await page.evaluate(()=>{
        let schemeCategories = document.querySelectorAll(".eventContent")
        const result = []
        schemeCategories.forEach((item)=>{
            const title = item.querySelector('h2').innerText
            const publishDate = item.querySelector('p').innerText.replace("Publish Date: ","")
            const schemeDetails = item.querySelector('a').href
            result.push({
                title: title,
                publishDate: publishDate,
                schemeDetails: schemeDetails
            })
        })
        return result
    })
    
    
    await browser.close()
    return result
}
async function main(){
    const schemes = []
    const schemeCategory = await scrapeHaryana()
    for (const scheme of schemeCategory){
        const schemeTitle = scheme.title
        const publishDate = scheme.publishDate
        const schemeUrl = scheme.schemeDetails

        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(schemeUrl)
        const result = await page.evaluate((schemeTitle, publishDate, schemeUrl)=>{
            const schemeDescription = document.querySelector('.award-details div div p').innerText
            const schemeBeneficiary = document.querySelector('.award-details div div :nth-child(5)').innerText
            const schemeBenefits = document.querySelector('.award-details div div :nth-child(7)').innerText
            const howToApply = document.querySelector('.scheme-dtls div p').innerText
            const pdfUrl = document.querySelector('.scheme-dtls div span a').href
            const schemeData = {
                title: schemeTitle,
                publishDate: publishDate,
                description: schemeDescription,
                benefits: schemeBenefits,
                howToApply: howToApply,
                pdfUrl: pdfUrl,
                schemeUrl: schemeUrl
            }
            return schemeData
        },schemeTitle, publishDate, schemeUrl)
        schemes.push(result)
        await browser.close()
    }
    
    fs.writeFileSync('haryanaSchemes.json', JSON.stringify(schemes, null, 2), 'utf-8');

    console.log('Data has been saved to schemes.json');
}
main()


