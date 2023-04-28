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


async function waitAndScroll(page, selector) {
  try {
    await page.waitForSelector(selector);
    let previousHeight = await page.evaluate(
      (selector) => document.querySelector(selector).scrollHeight,
      selector
    );
    await page.evaluate(
      (selector, previousHeight) =>
        document.querySelector(selector).scrollBy(0, previousHeight),
      selector,
      previousHeight
    );
    await page.waitForTimeout7(1000); // wait for new content to load

    const newHeight = await page.evaluate(
      (selector) => document.querySelector(selector).scrollHeight,
      selector
    );
    if (newHeight > previousHeight) {
      await waitAndScroll(page, selector);
    }
  } catch (err) {
    console.log(err);
  }
}

async function scrapeScrollableData(
  url = "https://www.airbnb.com/rooms/755440963693646510?source_impression_id=p3_1682589771_vC2fI79zFJlS%2Bw3f"
) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    await page.evaluate(() =>
      document
        .querySelector('button[data-testid="pdp-show-all-reviews-button')
        .click()
    );
    /*     await page.click('button[data-testid="pdp-show-all-reviews-button"]');
     */ await page.waitForSelector(".c8b3k5d");

    const html = await page.content();

    // Load the HTML content into Cheerio for parsing
    const $ = cheerio.load(html);
    let reviewCount = Number(
      $('button[data-testid="pdp-show-all-reviews-button"]')
        .text()
        .split(" ")[2]
    );
    const reviews = [];

    while (reviews.length < reviewCount) {
      await waitAndScroll(
        page,
        'div[data-testid="pdp-reviews-modal-scrollable-panel"]'
      );

      const html = await page.content();
      const $ = cheerio.load(html);
      $("div.r1are2x1").each((index, element) => {
        const review = $(element).find("span.ll4r2nl").text().trim();
        reviews.push(review);
        if (reviews.length >= reviewCount) {
          return false; // exit the loop when we have 20 reviews
        }
      });
    }

    return reviews;
  } catch (err) {
    console.log(err);
  }
}

app.get("/scrap-review", async function (req, res) {
  const reviews = await scrapeScrollableData(req.query.url);
  res.status(200).json({
    reviews,
  });
});

app.get("/review-tone", async function (req, res) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: "Say this is a test",
    temperature: 0,
    max_tokens: 7,
  });

  console.log(response);
});
app.listen(9999, function () {
  console.log("Example app listening on port 9999!");
});



