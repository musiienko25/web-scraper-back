const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api/scrape", async (req, res) => {
  const { id } = req.query;
  try {
    const { data } = await axios.get(
      "https://emma.maryland.gov/page.aspx/en/rfp/request_browse_public"
    );
    const $ = cheerio.load(data);

    let elementHtml = null;
    $("table tbody tr").each((i, row) => {
      const rowId = $(row).find("td").eq(1).text().trim();
      if (rowId === id) {
        elementHtml = $(row).html();
        return false;
      }
    });

    if (!elementHtml) {
      return res
        .status(404)
        .json({ error: `Element with ID="${id}" not found.` });
    }

    res.send(elementHtml);
  } catch (error) {
    console.error("Error scraping data:", error);
    res
      .status(500)
      .json({ error: "Error fetching data from external source." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
