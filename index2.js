const express = require("express");
const SerpApi = require("google-search-results-nodejs");
const data = require("./google_results");
const fs = require("fs");
const app = express();
const port = 3000;
const cheerio = require("cheerio");

async function fetchPage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Error("Network response was not ok");
    }
    return response.text();
  } catch (error) {
    console.log("Network response was not ok", url);
  }
}

async function fetchGoogleResults(query) {
  const search = new SerpApi.GoogleSearch(
    "f07068c619f225f9e6f8856b408268e4e65f1ffca2c76c6e54affdfe0cba29a9"
  );
  return new Promise((resolve, reject) => {
    search.json(
      {
        q: query,
        start: 200,
        num: 100,
      },
      (result) => {
        fs.writeFileSync(
          `google_results.json`,
          JSON.stringify(result, null, 2)
        );
        resolve(result);
      }
    );
  });
}

async function processGoogleResults() {
  let scrappedData = fs.readFileSync("poland.json", "utf-8");
  scrappedData = JSON.parse(scrappedData);

  const allData = [];
  for (const site of data.organic_results) {
    const siteHTML = await fetchPage(site.link);
    if (typeof siteHTML !== "string") continue;
    console.log(typeof siteHTML);
    // Parse the JSON data
    const $ = cheerio.load(siteHTML);
    const siteBody = $("body").text();
    const emailExpression = Array.from(
      new Set(
        siteBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
      )
    );
    allData.push({
      title: site.title,
      link: site.link,
      emails: emailExpression,
    });
  }
  fs.writeFileSync(`poland.json`, JSON.stringify(allData, null, 2));
  let arr = [];
  allData.forEach((element) => {
    arr = arr.concat(element.emails);
  });
  console.log(arr.length);
}

const getAll = () => {
  const states = [
    "turkey",
    "romania",
    "bulgaria",
    "czech",
    "slovakia",
    "lithuania",
    "latvia",
    "greece",
    "hungary",
    "poland",
  ];

  let allData = [];

  for (const state of states) {
    const file = fs.readFileSync(`${state}.json`, "utf-8");
    const data = JSON.parse(file);
    console.log(state, data.length);
    allData = allData.concat(
      data.map((el) => {
        return {
          ...el,
          country: state,
        };
      })
    );
  }

  console.log(allData.length);
  allData = allData.filter((el) => el.emails.length);
  fs.writeFileSync("allData.json", JSON.stringify(allData, null, 2));
};

const processGoogle = async () => {};

const scrape = async (queries) => {
  for (query in queries) {
    const results = await fetchGoogleResults(query);
    await processGoogleResults(results);
  }
};

app.listen(port, async () => {
  console.log(
    await fetchGoogleResults("Faculty of Agriculture + academic staff + Turkey")
  );

  await scrape([
    "Faculty of Agriculture + academic staff + Turkey",
    "Faculty of Agriculture + staff + Turkey",
  ]);
  //await processGoogleResults();
  // getAll();
});

//Bulgaria, Czech Republic, Slovakia, Lithuania, Latvia, Greece, Hungary, Poland.
