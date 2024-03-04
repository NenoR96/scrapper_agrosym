const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const indexRoute = require("./routes/index");
const app = express();
const port = 3000;
//=================================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
app.use(express.static("public"));
app.use("/", indexRoute);

app.listen(port, async () => {
  // await processGoogleResults(
  //   {
  //     organic_results: [
  //       // {
  //       //   link: "https://birimler.atauni.edu.tr/ziraat-fakultesi/akademik-personel/",
  //       // },
  //       // {
  //       //   link: "https://forestry.ubc.ca/people/staff-directory",
  //       // },
  //       {
  //         link: "https://www.tntech.edu/cahe/ag/faculty-staff.php",
  //       },
  //     ],
  //   },
  //   "biddlostaa"
  // );
  // await scrape([
  //   // "Faculty of Forestry + academic staff + Turkey",
  //   //"Faculty of Forestry + staff + Turkey",
  //   `Faculty of Forestry "staff" + Turkey`,
  //   "Orman Fakültesi + personeli",
  //   `Orman Fakültesi "personel"`,
  // ]);
  //await downloadCSV("./turkey_forestry/all");
});

//Bulgaria, Czech Republic, Slovakia, Lithuania, Latvia, Greece, Hungary, Poland.
