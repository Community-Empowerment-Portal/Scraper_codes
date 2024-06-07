const puppeteer = require('puppeteer')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

async function getSchemes() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let pageNumber = 0
    
    
    // await page.screenshot({path: 'netflix.png', fullPage:true})
    let schemesArray = []
    while (pageNumber<6){
        await page.goto(`https://meghalaya.gov.in/index.php/schemes?page=${pageNumber}`);
        let schemeNames = await page.evaluate(()=>
        Array.from(document.querySelectorAll('.view-content .item-list ul li span span a'), (e)=> e.textContent))
        schemesArray = schemesArray.concat(schemeNames)
        pageNumber++
    }
    // const values = await page.evaluate(()=>
    // Array.from(document.querySelectorAll('.views-row .views-field div'), (e)=> e.textContent))
    
    await browser.close()
    return schemesArray
}


async function getUrls() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let pageNumber = 0
    
    
    // await page.screenshot({path: 'netflix.png', fullPage:true})
    let urlsArray = []
    while (pageNumber<6){
        await page.goto(`https://meghalaya.gov.in/index.php/schemes?page=${pageNumber}`);
        let schemeUrls = await page.evaluate(()=>
        Array.from(document.querySelectorAll('.view-content .item-list ul li span span a'), (e)=> e.href))
        urlsArray = urlsArray.concat(schemeUrls)
        pageNumber++
    }
    // const values = await page.evaluate(()=>
    // Array.from(document.querySelectorAll('.views-row .views-field div'), (e)=> e.textContent))
    
    await browser.close()
    return urlsArray
}

async function getSchemesDetail(urlsArray) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let allData = [];

    for (let url of urlsArray){
        await page.goto(url);

        const keys = await page.evaluate(()=>
            Array.from(document.querySelectorAll('.views-row .views-field span:first-child'), (e)=> e.textContent))
        
        const values = await page.evaluate(()=>
            Array.from(document.querySelectorAll('.views-row .views-field'), (field)=> {
                const secondElement = field.querySelector(':scope > :nth-child(2')
                return secondElement ? secondElement.textContent : null;
            }).filter(text => text != null))
        keys.pop()
        keys.pop()
        
        
        slicedKeys = keys.slice( -values.length+1 )
        
        console.log(slicedKeys[0])
        while (slicedKeys[0] != 'Department: '){
            console.log("checked")
            slicedKeys.shift()
        }
        let data = {
            'ID: ': uuidv4()  
        };
        
        slicedKeys.forEach( (key, index) => {
            data[key] = values[index]
        } );

        data['Scheme Link: '] = url;
        

        allData.push(data)

       

    }
    
    
    // await page.screenshot({path: 'netflix.png', fullPage:true})


    await browser.close()
    return allData
}

// run()
async function main() {

    const schemesArray = await getSchemes();



    const urlsArray = await getUrls();



    const allData = await getSchemesDetail(urlsArray);
    console.log(allData)
    fs.writeFileSync('schemesData.json', JSON.stringify(allData, null, 2));

}

main();



