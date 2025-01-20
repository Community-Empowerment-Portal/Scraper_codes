const puppeteer = require('puppeteer')
const {v4: uuidv4} = require('uuid')
const fs = require('fs').promises

async function get_pdf_link() {
    const url = "https://tripura.gov.in/schemes"
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await  page.goto(url , {timeout:60000})
    const result = await page.evaluate(()=>{
        const rows = document.querySelectorAll('tbody tr')
        const data = []
        rows.forEach((row)=>{
            const title = row.children[1].innerText.trim()
            const pdfUrl = row.children[2].children[0].href
            data.push({title, pdfUrl})
        })
        return data 
    })

    const resultWithUUID = result.map((item)=>({id:uuidv4(), scheme_url: url,...item}))

    await fs.writeFile('tripura-pdf-link.json', JSON.stringify(resultWithUUID, null,2))
    
    await browser.close()
}

get_pdf_link()