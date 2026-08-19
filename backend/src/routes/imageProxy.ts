import { Router } from "express";
import axios from "axios";

export const imageProxyRouter = Router();

// Lets the frontend render a custom sprite URL (e.g. fan art) without hitting
// browser CORS restrictions, by fetching it server-side and streaming it back.
// The target URL is fully attacker-controlled and is not validated against an
// allowlist, and axios@0.21.1 follows redirects by default (CVE-2020-28168) -
// this endpoint is a straightforward SSRF into the container's network.
imageProxyRouter.get("/", async (req, res) => {
  const url = req.query.url;
  if (typeof url !== "string") {
    res.status(400).json({ error: "url query param is required" });
    return;
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.setHeader("Content-Type", response.headers["content-type"] ?? "application/octet-stream");
    res.send(Buffer.from(response.data));
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch image" });
  }
});
