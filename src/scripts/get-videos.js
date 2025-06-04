import fs from "fs";
import axios from "axios";

const API_KEY = "e756c694-0181-4cbe-84ce424bf2ca-65e8-4067";
const LIBRARY_ID = "448959";

(async () => {
  try {
    const res = await axios.get(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: API_KEY,
        },
      }
    );

    const videos = res.data.items;

    const csv = [
      "title,videoId,directUrl",
      ...videos.map((v, i) => {
        const id = v.guid;
        const url = `https://iframe.mediadelivery.net/play/${LIBRARY_ID}/${id}`;
        return `"${v.title}",${id},${url}`;
      }),
    ].join("\n");

    fs.writeFileSync("videos.csv", csv);
    console.log("✅ Plik videos.csv został zapisany.");
  } catch (err) {
    console.error("❌ Błąd:", err.response?.data || err.message);
  }
})();
