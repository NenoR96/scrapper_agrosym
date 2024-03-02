const SerpApi = require("google-search-results-nodejs");
const data = require("./google_results");
const fs = require("fs");
const cheerio = require("cheerio");
const converter = require("json-2-csv");

module.exports = fetchPage = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Error("Network response was not ok", response);
    }
    return response.text();
  } catch (error) {
    console.log("Network response was not ok", console.dir(error));
    return null;
  }
};

module.exports = getAll = () => {
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
    allData = allData.concat(
      data.map((el) => {
        return {
          ...el,
          country: state,
        };
      })
    );
  }

  allData = allData.filter((el) => el.emails.length);
  fs.writeFileSync("allData.json", JSON.stringify(allData, null, 2));
};

module.exports = fetchGoogleResults = async (query, page) => {
  const search = new SerpApi.GoogleSearch(
    "51abd243b0caf6a96023b95aa4cfcbd530bef3d842a2f364ab55a03d7c5fe218"
  );
  console.log("query", query);
  return new Promise((resolve, reject) => {
    search.json(
      {
        q: query,
        start: page * 100,
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
};

const processGoogleResults = async (google_results, filename) => {
  let scrappedData;
  const file_name = `./downloads/${encodeURIComponent(filename)}.json`;
  const process = async () => {
    for (const site of google_results.organic_results) {
      const siteHTML = await fetchPage(site.link);
      if (typeof siteHTML !== "string") continue;
      console.log(typeof siteHTML, site.link);
      // Parse the JSON data
      const $ = cheerio.load(siteHTML);
      const siteBody = $("body").text();
      const emailExpression = Array.from(
        new Set(
          siteBody.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
        )
      );
      scrappedData.push({
        title: site.title,
        link: site.link,
        emails: emailExpression,
      });
    }
    console.log("PISEM");
    fs.writeFileSync(file_name, JSON.stringify(scrappedData, null, 2));
    return scrappedData;
  };

  try {
    scrappedData = fs.readFileSync(file_name, "utf-8");
    scrappedData = JSON.parse(scrappedData);
    return process();
  } catch (err) {
    if (err.code === "ENOENT") {
      fs.writeFileSync(file_name, JSON.stringify([]));
      scrappedData = [];
      return process();
    }
  }
};

module.exports = scrapePage = async (query, page) => {
  let currentPage = page;
  const get = async () => {
    const data = await fetchGoogleResults(query, currentPage);
    if (Array.isArray(data.organic_results)) {
      currentPage++;
      await processGoogleResults(data, query);
      get();
    } else {
      return;
    }
  };

  return get();
};

const scrape = async (query) => {
  const done = await scrapePage(query, 0);
  const data = fs.readFileSync(`./downloads/${encodeURIComponent(query)}.json`);
  return JSON.parse(data);
};

const downloadCSV = async (filename) => {
  const file = fs.readFileSync(`./downloads/${filename}.json`, "utf-8");
  const data = JSON.parse(file);
  const fields = ["title", "link", "emails"];
  const opts = { fields, unwindArrays: true };
  const csv = await converter.json2csv(data, opts);
  return csv;
};

module.exports.processGoogleResults = processGoogleResults;
module.exports.downloadCSV = downloadCSV;
module.exports.scrape = scrape;
