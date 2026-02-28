// Vercel Serverless Function
//
// Purpose:
// - Proxy all /api/* requests to the real backend.
// - Makes auth cookies first-party on iOS Safari/Brave (WebKit), so login works on phones.
//
//
// Notes:
// - This function forwards the request method/body/headers.
// - It also forwards Set-Cookie back to the browser.

async function readBody(req) {
  // For GET/HEAD there is no body
  if (req.method === "GET" || req.method === "HEAD") return null;

  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) return resolve(null);
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  const backendBase = process.env.REACT_APP_API_URL;

  if (!backendBase) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error:
          "BACKEND_URL is not set on Vercel. Add BACKEND_URL=https://YOUR-BACKEND.onrender.com",
      }),
    );
    return;
  }

  // Build target URL by reusing the same pathname + querystring.
  // Example: incoming /api/auth/login -> backend /api/auth/login
  const originalUrl = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = new URL(
    originalUrl.pathname + originalUrl.search,
    backendBase,
  );

  // Copy headers (remove hop-by-hop / host headers)
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["content-length"]; // fetch will compute

  // Read body (Buffer) for non-GET requests
  const body = await readBody(req);

  // Forward request
  let upstream;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch (e) {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: "Proxy request failed", details: e?.message }),
    );
    return;
  }

  // Status
  res.statusCode = upstream.status;

  // Forward headers (handle Set-Cookie properly)
  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : upstream.headers.get("set-cookie")
        ? [upstream.headers.get("set-cookie")]
        : [];

  if (setCookies.length) {
    res.setHeader("Set-Cookie", setCookies);
  }

  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k === "set-cookie") return;
    if (k === "content-encoding") return; // avoid mismatched encoding
    res.setHeader(key, value);
  });

  // Body passthrough
  const arrayBuffer = await upstream.arrayBuffer();
  res.end(Buffer.from(arrayBuffer));
};
