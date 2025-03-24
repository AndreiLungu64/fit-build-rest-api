import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootRouter = express.Router();

rootRouter.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

rootRouter.get("/new-page(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "new-page.html"));
});

rootRouter.get("/old-page(.html)?", (req, res) => {
  res.redirect(301, "/new-page.html"); //the redirect changes the file for the current route so it is correct like this
});

export default rootRouter;
