const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
app.use(express.json());

const API_KEY = process.env.ARKESEL_API_KEY;

app.post("/send-voice", async (req, res) => {
  try {
    const { phone, voiceUrl } = req.body;

    const response = await axios.get(voiceUrl, {
      responseType: "stream"
    });

    const filePath = "./voice.mp3";
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", async () => {

      const form = new FormData();
      form.append("recipients", phone);
      form.append("voice_file", fs.createReadStream(filePath));

      const result = await axios.post(
        "https://sms.arkesel.com/api/v2/sms/voice/send",
        form,
        {
          headers: {
            "api-key": API_KEY,
            ...form.getHeaders()
          }
        }
      );

      res.json({ success: true, result: result.data });
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Voice bridge running...");
});
