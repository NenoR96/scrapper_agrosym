const express = require("express");
const router = express.Router();
const { downloadCSV, scrape, processGoogleResults } = require("../utils");

router.get("/", function (req, res) {
  res.render("index");
});

router.post("/", async (req, res) => {
  const { websiteUrl, google_search } = req.body;
  if (websiteUrl) {
    const filename = encodeURIComponent(`download_${new Date().getTime()}`);

    await processGoogleResults(
      {
        organic_results: req.body.websiteUrl
          .split("\r\n")
          .filter((el) => el)
          .map((el) => {
            return { link: el };
          }),
      },
      filename
    );
    const csv = await downloadCSV(filename);
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  }
  if (google_search) {
    await scrape(google_search);
    console.log("scrape");
    const csv = await downloadCSV(encodeURIComponent(google_search));
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  }
  //res.redirect("/");
});

router.post("/search", async (req, res) => {
  res.send({});
});

router.get("/files", async (req, res) => {
  res.send({});
});

module.exports = router;
