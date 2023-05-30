import puppeteer, { Browser } from 'puppeteer';
import express from 'express';
import CONSTS from './crawlerConsts';

const PORT = 8001;

const app = express();

app.listen(PORT, () => console.log(`Server runing on port: ${PORT}`));

app.get("/health", (req, res) => {
    res.sendStatus(200);
});

app.get("/searchEmails", async (req, res) => {

    const browser = await puppeteer.launch();    
    const page = await browser.newPage();

    const url = CONSTS.sites.empresas.url + req.query.freguesia + "/?qPagina=" + req.query.page;
    console.log("Accessing: ", url);
    await page.goto(url);
    await page.waitForSelector(CONSTS.sites.empresas.waitSelector);

    let empresas = await page.$$eval(CONSTS.sites.empresas.selector, tagsEmpresa => {
        return tagsEmpresa.map(el => el.textContent);            
    });
    console.log("Finish: ", empresas.length);

    //let promises:Promise<Array<string>>[] = [];
    let promises:Array<string>[] = [];
    for (let index = 0; index < empresas.length; index++) {
        const empresa = empresas[index];
        promises.push(await googleSearch(browser, empresa));
    }
    
    let links:string[] = promises.flat(1);    
    //let links:string[] = (await Promise.all(promises)).flat(1);    

    //let promisesEmails:Promise<Array<string>>[] = [];
    let promisesEmails:Array<string>[] = [];
    for (let index = 0; index < links.length; index++) {
        const siteEmpresa = links[index];
        promisesEmails.push(await emailSearch(browser, siteEmpresa));
    }

    //let emails:string[] = (await Promise.all(promisesEmails)).flat(1); 
    let emails:string[] = promisesEmails.flat(1);  

    console.log("END");
    //await browser.close();

    res.send([...new Set(emails)].join('; '));
});

async function googleSearch(browser:Browser, empresa:any) {
    const pageGoogle = await browser.newPage();
    console.log("Empresa: ", empresa);
    await pageGoogle.goto(CONSTS.sites.google.url + empresa + " email contacto");
    await pageGoogle.waitForSelector(CONSTS.sites.google.waitSelector);

    return  pageGoogle.$$eval(CONSTS.sites.google.selector, (linksGoogle:any) => {
        return linksGoogle.slice(0,3).map((link:any) => link.getAttribute("href"))
    });
}

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

async function emailSearch(browser:Browser, siteEmpresa:any) {
    let emails:Array<string> = new Array();
    try {
        const pageEmpresa = await browser.newPage();
        console.log("GOTO: ", siteEmpresa);
        //await pageEmpresa.goto("https://webcache.googleusercontent.com/search?q=cache:" + siteEmpresa);
        await pageEmpresa.goto(siteEmpresa);
        const content = await pageEmpresa.content();            
        content.match(emailRegex)?.forEach((email:any) => {
            if(!CONSTS.blackList.includes(email)
                && !CONSTS.notEndWith.find(end => email.endsWith(end))){
                console.log("Email:--------- ", email);
                emails.push(email);
            }
        });      
    } catch (error) {
        console.log(siteEmpresa, error);
    }
    return emails;
}