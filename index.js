const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

app.get("/img4k", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl)
    return res.status(400).json({ error: "Missing image url" });

  const input = path.join(__dirname, "input.jpg");
  const output = path.join(__dirname, "output_4k.jpg");

  try {
    // Download image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(input, response.data);

    // Convert to 4K (3840x2160)
    exec(
      `convert "${input}" -resize 3840x2160^ -gravity center -extent 3840x2160 "${output}"`,
      (err) => {
        if (err || !fs.existsSync(output)) {
          return res.status(500).json({ error: "Image convert failed" });
        }

        res.sendFile(output, () => {
          fs.unlinkSync(input);
          fs.unlinkSync(output);
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Processing error" });
  }
});

app.listen(PORT, () => {
  console.log("🟢 Image 4K API running on http://0.0.0.0:" + PORT);
});