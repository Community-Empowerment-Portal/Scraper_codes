import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const main = async () => {
  const categoriesUrl = "https://sjsa.maharashtra.gov.in/en/schemes-categories";
  const categories = await getAllCategories(categoriesUrl);
  writeData(categories, "categories");

  for (const category of categories) {
    const url = category.url;
    const name = category.name;
    const id = category.id;
    const pages = (await checkIfMoreThanOnePages(url)).length - 2;

    if (pages > 0) {
      let AllPagesData = {
        data: [],
      };
      console.log("Screaping data for paging");
      for (let i = 0; i < pages; i++) {
        const url = category.url + "?&Submit=Submit&page=" + i;
        const data = await getDataOfEachCategory(url, id, name);
        // AllPagesData = AllPagesData.concat(data.data);
        AllPagesData= {...AllPagesData, data: [...AllPagesData.data, ...data.data], id: data.uuid, name: data.name}
      }
      
      writeData(AllPagesData, name.replace("&", "").trim());
      console.log("Scraping completed for paging");
    } else {
      const data = await getDataOfEachCategory(url, id, name);
      writeData(data, name.replace("&", "").trim());
    }
  }
  console.log("Scraping completed");
  return;
};

const checkIfMoreThanOnePages = async (url) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  page.viewport({ width: 1920, height: 1080 });
  const parentElement = await page.$$(".pager li");
  await browser.close();
  return parentElement;
};

const getDataOfEachCategory = async (url, uuid, name) => {
  console.log("Scraping data for ", name);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  page.viewport({ width: 1920, height: 1080 });
  try {
    const getData = await page.evaluate(() => {
      const data = [];
      const totalContents = document.querySelector(".view-content");
      const fieldBody = totalContents.querySelectorAll(".schemesBodyData");

      for (const field of fieldBody) {
        const secheTables = field.querySelectorAll(".tableOut table");
        const placeholder = {
          "NameoftheScheme":"scheme_name",
          "Fundingby":"funding_by",
          "SchemeObjective":"scheme_objective",
          "BeneficiaryCategory":"beneficiary_category",
          "EligibilityCriteria":"eligibility_criteria",
          "Eligibilitycriteria":"eligibility_criteria",
          "BenefitsProvided":"benefits_provided",
          "ApplicationProcess":"application_process",
          "CategoryofScheme":"category",
          "ContactOffice":"contact_office",
          "MainObjective":"main_objective",
          "योजनेचेनांव":"scheme_name",
          "योजनेचाप्रकार":"funding_by",
          "योजनेचाउद्देश":"scheme_objective",
          "योजनाज्याप्रवर्गासाठीलागूआहेत्याचेनांव":"beneficiary_category",
          "योजनेच्याप्रमुखअटी":"eligibility_criteria",
          "दिल्याजाणाऱ्यालाभाचेस्वरुप":"benefits_provided",
          "अर्जकरण्याचीपध्दत":"application_process",
          "योजनेचीवर्गवारी":"category",
          "संपर्ककार्यालयाचेनांव":"contact_office",
        }

        // Details
        const detailRows = secheTables[0].querySelectorAll("tr");
        let details = {};
        // get current page url
        const url = window.location.href;
        for (let i = 1; i < detailRows.length; i++) {
          const columns = detailRows[i].querySelectorAll("td");
          if (columns.length <= 2) {

            const key = columns[0].innerText.replace(/\t|\n/g, "").trim().split(" ").join("");
            const value = columns[1].innerText.replace(/\t|\n/g, "").trim();
            details[placeholder[key]??key] = value;
          } else {
            const key = columns[1].innerText.replace(/\t|\n/g, "").trim().split(" ").join("");
            const value = columns[2].innerText.replace(/\t|\n/g, "").trim();
            details[placeholder[key]??key] = value;
          }
        }

        details["url"] = url;
        // console.log(details);

        // Statistics
        // let statistics = [];
        // if (secheTables.length > 1) {
        //   const statRows = secheTables[1].querySelectorAll("tr");
        //   const statKeys = Array.from(
        //     statRows[0].querySelectorAll("th"),
        //     (th) => th.innerText.replace(/\t|\n/g, "").trim()
        //   );
        //   statistics = Array.from(statRows)
        //     .slice(1)
        //     .map((row) =>
        //       Array.from(row.querySelectorAll("td")).reduce(
        //         (obj, td, index) => {
        //           obj[statKeys[index]] = td.innerText
        //             .replace(/\t|\n/g, "")
        //             .trim();
        //           return obj;
        //         },
        //         {}
        //       )
        //     );
        // }

        const dataOfScheme = {
          details: { ...details },
          // statistics: statistics,
        };

        data.push(dataOfScheme);
      }
      return data;
    });
    await browser.close();
    return { data: getData, name, uuid };
  } catch (error) {
    console.log(error);
  }
};

// console.log(await getDataOfEachCategory("https://sjsa.maharashtra.gov.in/en/scheme-category/social-remedies?&Submit=Submit&page=1", "1", "test"));


const getAllCategories = async (categoriesUrl) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(categoriesUrl);
  page.viewport({ width: 1366, height: 768 });
  
  try {
    const getCategories = await page.evaluate(() => {
      const categories = [];
      const linkBoxs = document.querySelector(".linkBoxsOuter");
      const allCategories = linkBoxs.querySelectorAll("li");
      
      for (const category of allCategories) {
        const name = category.querySelector("a").innerText.split(" ").join("_");
        const url = category.querySelector("a").href;
        categories.push({ name, url });
        }
        
        categories.shift();
        return categories;
        });
        await browser.close();
        // add id to each category
        for (const category of getCategories) {
      category.id = uuidv4();
    }
    return getCategories;
    } catch (error) {
      console.log(error);
      }
      };
      
      const writeData = (data, fileName) => {
        let jsonData = JSON.stringify(data, null, 2);
        const filePath = `./data/${fileName}.json`;
        fs.writeFileSync(filePath, jsonData);
        console.log(`Data written to ${filePath}`);
        };
        
        main();
        
        // writeData(await getDataOfEachCategory("https://sjsa.maharashtra.gov.in/en/scheme-category/social-remedies", "1", "test"))

        // console.log("All data scrapped successfully from maharastra");