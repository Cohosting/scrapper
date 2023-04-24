var express = require('express');
var cors = require('cors');

var app = express();
app.use(express.json());
app.use(cors())
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

async function scrapeScrollableData(url) {
  console.log({ url });

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const html = await page.content()



    const $ = cheerio.load(html);

    const reviews = [];

    $('div.ciubx2o div._162hp8xh').each((index, element) => {
      const review = $(element).find('div.r1rl3yjt > div:nth-child(2) > div:nth-child(1)').text().trim();
      const button = $(element).find('div.r1rl3yjt > div:nth-child(2) > div:nth-child(2)').text().trim();
      reviews.push(review);
    });

    await browser.close();
    return reviews;
  } catch (err) {
    console.log(err)
  }

}

app.get('/scrap-review', async function (req, res) {
  const reviews = await scrapeScrollableData(req.query.url);
  res.status(200).json({
    reviews
  }
  )
});


app.get('/review-tone', async function (req, res) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Say this is a test",
    temperature: 0,
    max_tokens: 7,
  });


  console.log(response);

});
app.listen(5000, function () {


  console.log('Example app listening on port 3000!');
});




