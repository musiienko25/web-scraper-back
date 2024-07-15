const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для обробки JSON тіла запиту
app.use(express.json());

// Middleware для налаштування CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Змініть на потрібний вам URL
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Роут для пошуку елемента за data-id
app.get("/api/scrape", async (req, res) => {
  const { id } = req.query;
  try {
    const { data } = await axios.get(
      "https://emma.maryland.gov/page.aspx/en/rfp/request_browse_public"
    );
    const $ = cheerio.load(data);

    const element = $(`[data-id="${id}"]`);
    if (element.length === 0) {
      return res
        .status(404)
        .json({ error: `Element with data-id="${id}" not found.` });
    }

    const elementHtml = element.html();
    res.send(elementHtml);
  } catch (error) {
    console.error("Error scraping data:", error);
    res
      .status(500)
      .json({ error: "Error fetching data from external source." });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
