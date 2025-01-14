const puppeteer = require('puppeteer')
const {v4: uuidv4} = require('uuid')
const fs = require('fs').promises

async function get_data() {
    const url = "https://www.arunachaluniversity.ac.in/scholarship"
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await  page.goto(url , {timeout:60000})
    const result = await page.evaluate(()=>{
        const rows = document?.querySelector('tbody').children
        const data = []
        for(let i =1; i<rows.length;i++){
            if(i === 10){continue}
            let title = rows[i]?.children[1].innerText.trim() 
            let application_programme = rows[i]?.children[2].innerText.trim() 

            let eligibility = rows[i]?.children[3].innerText
            .replace(/•/g, "") // Remove bullets
            .trim() // Remove extra spaces
            .split("\n") // Split into an array by newlines
            .map((item) => item.trim()) // Trim each element in the array
            .filter((item) => item !== ""); // Remove empty strings
            
            let granting_agency =  rows[i]?.children[4].innerText.trim() 
            data.push({title, application_programme, eligibility, granting_agency})
        }
        return data 
    })

    const resultWithUUID = result.map((item)=>({id:uuidv4(), scheme_url: url,...item}))

    await fs.writeFile('arunachal_scholarship.json', JSON.stringify(resultWithUUID, null,2))
    
    await browser.close()
}

get_data()