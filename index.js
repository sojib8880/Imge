const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp"); // lightweight 4K upscale

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/img4k", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.json({ error: "No URL provided" });

  const tempInput = path.join(__dirname, "cache", `input_${Date.now()}.jpg`);
  const tempOutput = path.join(__dirname, "cache", `output_${Date.now()}.jpg`);

  try {
    // Create cache folder if not exists
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Download image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(tempInput, Buffer.from(response.data));

    // Use sharp to upscale
    await sharp(tempInput)
      .resize({ width: 3840, height: 2160, fit: "inside" }) // max 4K
      .toFile(tempOutput);

    // Send image
    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(tempOutput, () => {
      // Cleanup
      fs.unlinkSync(tempInput);
      fs.unlinkSync(tempOutput);
    });

  } catch (err) {
    console.error("Processing error:", err.message);
    res.json({ error: "Processing error" });
  }
});

app.listen(PORT, () => console.log(`🟢 Image 4K API running on http://0.0.0.0:${PORT}`));
