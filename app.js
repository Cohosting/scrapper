var express = require('express');
var app = express();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeScrollableData() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.airbnb.com/rooms/755440963693646510');

  // Scroll down to load more data
/*   const scrollHeight = 'document.body.scrollHeight';
  while (await page.evaluate(`window.scrollY + window.innerHeight < ${scrollHeight}`)) {
    await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
    await page.waitForTimeout(1000); // wait for data to load
  }
 */
  // Extract the data
  const html = await page.content();
  const $ = cheerio.load(html);
  const data = $('.ciubx2o').map((i, el) => $(el).text()).get();
  await browser.close();
  return data;
}

app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
scrapeScrollableData().then(data => console.log(data));

  console.log('Example app listening on port 3000!');
});