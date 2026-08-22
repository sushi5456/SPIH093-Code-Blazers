import "dotenv/config";
import express from "express";
import { healthHandler, scanUrlHandler } from "./scanUrl.js";
const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.use(express.json());
app.post("/api/scan-url", scanUrlHandler);
app.get("/api/health", healthHandler);
app.listen(port, () => {
    console.log(`SIGHTSENSE API server listening on http://localhost:${port}`);
});
