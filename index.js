const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const ShortUrl = require("./models/shortUrl");

const router = express.Router();
const rateLimitMiddleware = require("./middlewares/rateLimit.js");

require("dotenv").config();
const connectToDB = require("./config/db.js");
connectToDB();

const PORT = process.env.PORT || 8000;

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(rateLimitMiddleware);

// app.use('/', require('./routes/main'));

app.get("/", async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render("index", { shortUrls: shortUrls });
});

app.post("/shortUrls", async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl });
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.get("/qrcode/:shortUrl", async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  QRCode.toDataURL(shortUrl.full, (err, url) => {
    res.render("qrcode", { url: url });
  });
});


app.listen(8000, () => {
  console.log("App listening on port 8000");
});
