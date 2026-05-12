const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "cars.json");
const DEFAULT_IMAGE_PATH = "Images/placeholder.jpg";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "SaiChetan0412";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Chet@n0412";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-secret-in-production";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

app.use(express.json());

function buildStableId(row) {
  const raw = `${row.BRAND || ""}-${row["CAR MODEL"] || ""}-${row.YEAR || ""}`
    .trim()
    .toLowerCase();
  return crypto.createHash("sha1").update(raw).digest("hex").slice(0, 16);
}

const toApiCar = (row) => ({
  id: row.id || buildStableId(row),
  brand: row.BRAND || "",
  model: row["CAR MODEL"] || "",
  year: Number(row.YEAR) || 0,
  description: row.DESCRIPTION || "",
  imagePath: row["IMAGE PATH"] || DEFAULT_IMAGE_PATH,
  engine: row.ENGINE || "",
  topSpeed: row["TOP SPEED"] || "",
  price: row.PRICE || "",
  videoUrl: row.VIDEO_URL || "",
});

const toStorageCar = (car) => ({
  id: car.id,
  BRAND: car.brand,
  "CAR MODEL": car.model,
  YEAR: car.year,
  DESCRIPTION: car.description,
  "IMAGE PATH": car.imagePath,
  ENGINE: car.engine,
  "TOP SPEED": car.topSpeed,
  PRICE: car.price,
  VIDEO_URL: car.videoUrl,
});

async function readCars() {
  const text = await fs.readFile(DATA_FILE, "utf8");
  const rows = JSON.parse(text);
  return rows.map(toApiCar);
}

async function writeCars(cars) {
  const payload = JSON.stringify(cars.map(toStorageCar), null, 2);
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, payload, "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

function applyFilters(cars, query) {
  const { brand, search, year, sortYear } = query;
  let result = [...cars];

  if (brand && brand !== "All") {
    result = result.filter((car) => car.brand.toLowerCase() === String(brand).toLowerCase());
  }
  if (search) {
    const q = String(search).trim().toLowerCase();
    result = result.filter((car) => car.model.toLowerCase().includes(q));
  }
  if (year) {
    const y = Number(year);
    result = result.filter((car) => car.year === y);
  }
  if (sortYear === "asc" || sortYear === "desc") {
    result.sort((a, b) => (sortYear === "asc" ? a.year - b.year : b.year - a.year));
  }

  return result;
}

function validateCarInput(input, isPatch = false) {
  const requiredFields = ["brand", "model", "year", "description"];
  if (!isPatch) {
    for (const field of requiredFields) {
      if (input[field] === undefined || input[field] === null || input[field] === "") {
        return `Field '${field}' is required.`;
      }
    }
  }
  if (input.year !== undefined && Number.isNaN(Number(input.year))) {
    return "Field 'year' must be a valid number.";
  }
  return null;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const pairs = header.split(";").map((part) => part.trim()).filter(Boolean);
  const cookies = {};
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, idx).trim());
    const value = decodeURIComponent(pair.slice(idx + 1).trim());
    cookies[key] = value;
  }
  return cookies;
}

function createSessionToken(username) {
  const payload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payloadB64, signature] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  const sigBuf = Buffer.from(signature || "");
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  if (!payload || payload.exp < Date.now()) return null;
  return payload;
}

function setSessionCookie(res, token) {
  const parts = [
    `ng_admin_session=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "ng_admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
}

function requireAdminAuth(req, res, next) {
  const cookies = parseCookies(req);
  const session = verifySessionToken(cookies.ng_admin_session);
  if (!session || session.u !== ADMIN_USERNAME) {
    return res.status(401).json({ error: "Unauthorized. Admin login required." });
  }
  next();
}

app.post("/api/admin/login", (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  const token = createSessionToken(username);
  setSessionCookie(res, token);
  res.json({ message: "Login successful." });
});

app.post("/api/admin/logout", (req, res) => {
  clearSessionCookie(res);
  res.status(204).send();
});

app.get("/api/admin/session", (req, res) => {
  const cookies = parseCookies(req);
  const session = verifySessionToken(cookies.ng_admin_session);
  if (!session || session.u !== ADMIN_USERNAME) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, username: session.u });
});

app.get("/admin.html", (req, res, next) => {
  const cookies = parseCookies(req);
  const session = verifySessionToken(cookies.ng_admin_session);
  if (!session || session.u !== ADMIN_USERNAME) {
    return res.redirect("/admin-login.html");
  }
  next();
});

app.use((req, res, next) => {
  if (
    (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") &&
    (req.path === "/api/cars" || req.path.startsWith("/api/cars/"))
  ) {
    return requireAdminAuth(req, res, next);
  }
  next();
});

app.use(express.static(__dirname));

app.get("/api/cars", async (req, res) => {
  try {
    const cars = await readCars();
    const filtered = applyFilters(cars, req.query);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to load cars.", details: error.message });
  }
});

app.get("/api/cars/:id", async (req, res) => {
  try {
    const cars = await readCars();
    const car = cars.find((c) => c.id === req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found." });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to load car.", details: error.message });
  }
});

app.post("/api/cars", async (req, res) => {
  try {
    const validationError = validateCarInput(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const cars = await readCars();
    const newCar = {
      id: crypto.randomUUID(),
      brand: String(req.body.brand),
      model: String(req.body.model),
      year: Number(req.body.year),
      description: String(req.body.description),
      imagePath: String(req.body.imagePath || DEFAULT_IMAGE_PATH),
      engine: String(req.body.engine || ""),
      topSpeed: String(req.body.topSpeed || ""),
      price: String(req.body.price || ""),
      videoUrl: String(req.body.videoUrl || ""),
    };

    cars.push(newCar);
    await writeCars(cars);
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ error: "Failed to create car.", details: error.message });
  }
});

app.put("/api/cars/:id", async (req, res) => {
  try {
    const validationError = validateCarInput(req.body, true);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const cars = await readCars();
    const idx = cars.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Car not found." });
    }

    const updated = {
      ...cars[idx],
      ...req.body,
      year: req.body.year !== undefined ? Number(req.body.year) : cars[idx].year,
    };
    cars[idx] = updated;
    await writeCars(cars);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update car.", details: error.message });
  }
});

app.delete("/api/cars/:id", async (req, res) => {
  try {
    const cars = await readCars();
    const existing = cars.find((c) => c.id === req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Car not found." });
    }
    const next = cars.filter((c) => c.id !== req.params.id);
    await writeCars(next);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete car.", details: error.message });
  }
});

app.get("/*path", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Nexugun Garage app running on http://localhost:${PORT}`);
});
