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

    let bidDetails = null;
    $("table tbody tr").each((i, row) => {
      const rowId = $(row).find("td").eq(1).text().trim();
      if (rowId === id) {
        bidDetails = {
          id: rowId,
          title: $(row).find("td").eq(2).text().trim(),
          status: $(row).find("td").eq(3).text().trim(),
          dueDate: $(row).find("td").eq(4).text().trim(),
          publishDate: $(row).find("td").eq(5).text().trim(),
          mainCategory: $(row).find("td").eq(6).text().trim(),
          solicitationType: $(row).find("td").eq(7).text().trim(),
          issuingAgency: $(row).find("td").eq(8).text().trim(),
          bidHoldersList: $(row).find("td").eq(9).text().trim(),
          emmId: $(row).find("td").eq(10).text().trim(),
        };
        return false;
      }
    });

    if (!bidDetails) {
      return res
        .status(404)
        .json({ error: `Element with ID="${id}" not found` });
    }

    res.json(bidDetails);
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
