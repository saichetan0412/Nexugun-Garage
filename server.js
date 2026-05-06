const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "cars.json");

app.use(express.json());
app.use(express.static(__dirname));

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
  imagePath: row["IMAGE PATH"] || "",
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
  const requiredFields = ["brand", "model", "year", "description", "imagePath"];
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
      imagePath: String(req.body.imagePath),
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
