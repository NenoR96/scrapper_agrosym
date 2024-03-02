const express = require("express");
const router = express.Router();
const { downloadCSV, scrape, processGoogleResults } = require("../utils");

router.get("/", function (req, res) {
  res.render("index");
});
// https://github.dev/NenoR96/articles/blob/master/app.js
// https://github.dev/NenoR96/articles/blob/master/app.js
// https://stackoverflow.com/questions/41729664/nodemon-watch-directory-for-changes
// https://stackoverflow.com/questions/43152968/nodemon-not-refreshing-browser-in-react-express-node-app
router.post("/", async (req, res) => {
  const { websiteUrl, google_search } = req.body;
  // res.download("./turkey_forestry.csv");
  if (websiteUrl) {
    // console.log(
    //   "ima website",
    //   req.body.websiteUrl.split("\r\n").filter((el) => el)
    // );
    const filename = encodeURIComponent(`download_${new Date().getTime()}`);

    const data = await processGoogleResults(
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
    console.log("data", csv);
    res.set("Content-Type", "text/csv");
    res.status(200).send(csv);
  }
  if (google_search) {
    const data = await scrape(google_search);
    console.log("scrape");
    const csv = await downloadCSV(encodeURIComponent(google_search));
    console.log("data", csv);
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
