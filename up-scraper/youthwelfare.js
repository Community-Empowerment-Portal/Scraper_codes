const puppeteer = require('puppeteer');
const fs = require('fs');
const {v4: uuidv4} = require('uuid')

const urls = [
    'https://www.yuvasathi.in/schemes-detail/up-free-tablet-smartphone-yojana',
    'https://www.yuvasathi.in/schemes-detail/sant-ravidas-siksha-sahayata-yojana',
    'https://www.yuvasathi.in/schemes-detail/atal-awasiya-vidhalay-yojana',
    'https://www.yuvasathi.in/schemes-detail/up-scholarship-scheme-',
    'https://www.yuvasathi.in/schemes-detail/free-education-for-sports-medal-winners-participants-of-national-international-events',
    'https://www.yuvasathi.in/schemes-detail/central-sector-scheme-of-scholarship-for-college-and-university-students',
    'https://www.yuvasathi.in/schemes-detail/up-mukhyamantri-abhyudaya-yojana-',
    'https://www.yuvasathi.in/schemes-detail/up-madarsa-registration-scheme',
    'https://www.yuvasathi.in/schemes-detail/pre-matric-scholarship-for-minorities',
    'https://www.yuvasathi.in/schemes-detail/national-overseas-scholarship-for-students-with-disabilities',
    'https://www.yuvasathi.in/schemes-detail/up-free-education-scheme',
    'https://www.yuvasathi.in/schemes-detail/post-graduate-merit-scholarship-scheme-for-university-rank-holders-applicable-at-under-graduate-level-',
    'https://www.yuvasathi.in/schemes-detail/pradhan-mantri-kaushal-vikas-yojana---recognition-of-prior-learning',
    'https://www.yuvasathi.in/schemes-detail/up-mukhyamantri-udyami-mitra-yojana',
    'https://www.yuvasathi.in/schemes-detail/capacity-building-for-service-providers---entrepreneurship-programme',
    'https://www.yuvasathi.in/schemes-detail/pradhan-mantri-kaushal-vikas-yojana---short-term-training',
    'https://www.yuvasathi.in/schemes-detail/up-skill-development-mission',
    'https://www.yuvasathi.in/schemes-detail/seekho-aur-kamao',
    'https://www.yuvasathi.in/schemes-detail/pradhan-mantri-gramin-digital-saksharta-abhiyaan',
    'https://www.yuvasathi.in/schemes-detail/up-one-district-one-sport-%28odos%29-yojana-',
    'https://www.yuvasathi.in/schemes-detail/tenzing-norgay-national-adventure-award',
    'https://www.yuvasathi.in/schemes-detail/chief-minister-village-industries-employment-scheme',
    'https://www.yuvasathi.in/schemes-detail/up-kaushal-satrang-scheme',
    'https://www.yuvasathi.in/schemes-detail/rojgar-mela',
    'https://www.yuvasathi.in/schemes-detail/career-counseling-programs',
    'https://www.yuvasathi.in/schemes-detail/sevamitra-portal',
    'https://www.yuvasathi.in/schemes-detail/national-youth-corps',
    'https://www.yuvasathi.in/schemes-detail/agnipath-yojana',
    'https://www.yuvasathi.in/schemes-detail/internship-scheme-of-the-ministry-of-labour-%26-employment',
    'https://www.yuvasathi.in/schemes-detail/up-mukhyamantri-yuva-swarozgar-yojana',
    'https://www.yuvasathi.in/schemes-detail/cm-apprenticeship-promotion-scheme',
    'https://www.yuvasathi.in/schemes-detail/mukhyamantri-yuva-udyamita-vikas-abhiyan-',
    'https://www.yuvasathi.in/schemes-detail/up-naveen-rojgar-chatri-yojana',
    'https://www.yuvasathi.in/schemes-detail/up-pt.-deendayal-grameen-kaushal-yojana',
    'https://www.yuvasathi.in/schemes-detail/indirect-tax-internship-scheme-in-central-board-of-indirect-taxes-and-customs-%28cbic%29',
    'https://www.yuvasathi.in/schemes-detail/internship-scheme-of-the-ministry-of-woman-and-child-development',
    'https://www.yuvasathi.in/schemes-detail/internship-programme-by-the-ministry-of-external-affairs',
    'https://www.yuvasathi.in/schemes-detail/internship-programme-at-the-serious-fraud-investigation-office-%28sfio%29',
    'https://www.yuvasathi.in/schemes-detail/new-swarnima-scheme-for-women',
    'https://www.yuvasathi.in/schemes-detail/national-awards-for-outstanding-services-in-the-field-of-prevention-of-alcoholism-and-substance-%28drug%29-abuse%3A-best-research-or-innovation',
    'https://www.yuvasathi.in/schemes-detail/up-ews-certificate',
    'https://www.yuvasathi.in/schemes-detail/up-awas-vikas-yojana',
    'https://www.yuvasathi.in/schemes-detail/pradhan-mantri-awaas-yojana-gramin',
    'https://www.yuvasathi.in/schemes-detail/up-awas-vikas-yojana',
    'https://www.yuvasathi.in/schemes-detail/pradhan-mantri-awaas-yojana-gramin',
    'https://www.yuvasathi.in/schemes-detail/education-loan-scheme',
    'https://www.yuvasathi.in/schemes-detail/nidhi-eir-loan-yojana',
    'https://www.yuvasathi.in/schemes-detail/odop-financing-scheme',
    'https://www.yuvasathi.in/schemes-detail/stand-up-india',
    'https://www.yuvasathi.in/schemes-detail/deendayal-upadhyay-chetna-yojana',
    'https://www.yuvasathi.in/schemes-detail/good-samaritan-scheme',
    'https://www.yuvasathi.in/schemes-detail/cycle-assistance-scheme',
    'https://www.yuvasathi.in/schemes-detail/up-labour-health-insurance-scheme',
    'https://www.yuvasathi.in/schemes-detail/pradhan-mantri-garib-kalyan-package-%3A-insurance-scheme-for-health-workers-fighting-covid-19',
    'https://www.yuvasathi.in/schemes-detail/innovation-in-science-pursuit-for-inspired-research-%28inspire%29---faculty-fellowship'

    // Add more URLs here
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let allSchemes = [];

    for (const url of urls) {
        await page.goto(url);

        const data = await page.evaluate((url) => {
            const extractText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.innerText.trim() : null;
            };

            const extractListItems = (selector) => {
                return Array.from(document.querySelectorAll(`${selector} li`)).map(li => li.innerText.trim());
            };

            const extractSteps = (selector) => {
                return Array.from(document.querySelectorAll(selector)).map(step => step.innerText.trim());
            };

            const scheme = {
                title: extractText('.inner-head-left h2'),
                scheme_link:url,
                department: extractText('.top-bage-wrapper .badge:first-child'),
                type: Array.from(document.querySelectorAll('.mid-bage-wrapper .badge')).map(badge => badge.innerText.trim()),
                overview: extractText('#Overview p'),
                benefits: extractListItems('#Benefits ul'),
                eligibility: extractListItems('#Eligibility ul'),
                applicationProcess: extractSteps('.application p'),
                requirements: extractListItems('#Requirements ul'),
                mode: extractText('#Mode p'),
                faqs: Array.from(document.querySelectorAll('#FAQs .accordion-item')).map(faq => {
                    const question = faq.querySelector('.accordion-button').innerText.trim();
                    const answer = faq.querySelector('.accordion-collapse .accordion-body').innerText.trim();
                    return { question, answer };
                }),
            };
            return scheme;
        }, url);
        allSchemes.push({id:uuidv4(), ...data});

    }

    fs.writeFileSync('youthwelfare.json', JSON.stringify(allSchemes, null, 2));
    console.log("saved data to file");
    await browser.close();
})();
