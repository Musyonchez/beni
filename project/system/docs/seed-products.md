# Seed Products for Postman

POST each body to: `POST http://localhost:5000/api/products`  
Headers: `Authorization: Bearer <farmer_token>`  
Body: `raw → JSON`

---

## Vegetables

### 1 — Sukuma Wiki
```json
{
  "title": "Fresh Sukuma Wiki",
  "category": "vegetables",
  "description": "Freshly harvested kale from Kiambu. No pesticides, watered daily. Great for cooking.",
  "price": 30,
  "unit": "bunch",
  "quantity": 200,
  "images": [],
  "location": { "type": "Point", "coordinates": [36.8219, -1.2921] },
  "locationName": "Kiambu, Nairobi"
}
```

### 2 — Tomatoes
```json
{
  "title": "Ripe Tomatoes",
  "category": "vegetables",
  "description": "Farm-fresh tomatoes from Thika. Sweet and firm, ideal for cooking or salads.",
  "price": 120,
  "unit": "kg",
  "quantity": 80,
  "images": [],
  "location": { "type": "Point", "coordinates": [37.0833, -1.0333] },
  "locationName": "Thika, Kiambu County"
}
```

---

## Fruits

### 3 — Mangoes
```json
{
  "title": "Sweet Apple Mangoes",
  "category": "fruits",
  "description": "Juicy apple mangoes from Makueni. Naturally ripened, no chemicals.",
  "price": 80,
  "unit": "kg",
  "quantity": 150,
  "images": [],
  "location": { "type": "Point", "coordinates": [37.6244, -1.8044] },
  "locationName": "Makueni County"
}
```

### 4 — Avocados
```json
{
  "title": "Hass Avocados",
  "category": "fruits",
  "description": "Creamy Hass avocados from Muranga. Ready to eat, rich in flavour.",
  "price": 15,
  "unit": "piece",
  "quantity": 300,
  "images": [],
  "location": { "type": "Point", "coordinates": [37.0244, -0.7833] },
  "locationName": "Muranga County"
}
```

---

## Grains

### 5 — White Maize
```json
{
  "title": "Dried White Maize",
  "category": "grains",
  "description": "Dry-season white maize from Kitale. Clean, well-dried, no aflatoxin. Good for ugali.",
  "price": 55,
  "unit": "kg",
  "quantity": 500,
  "images": [],
  "location": { "type": "Point", "coordinates": [35.0062, 1.0154] },
  "locationName": "Kitale, Trans-Nzoia County"
}
```

### 6 — Green Grams
```json
{
  "title": "Green Grams (Ndengu)",
  "category": "grains",
  "description": "High-protein green grams from Mwala. Clean and sorted, ideal for githeri or soup.",
  "price": 150,
  "unit": "kg",
  "quantity": 200,
  "images": [],
  "location": { "type": "Point", "coordinates": [37.4500, -1.4833] },
  "locationName": "Mwala, Machakos County"
}
```

---

## Livestock

### 7 — Fresh Cow Milk
```json
{
  "title": "Fresh Cow Milk",
  "category": "livestock",
  "description": "Fresh whole milk from grass-fed Friesian cows. Collected morning and evening. Delivered same day.",
  "price": 60,
  "unit": "litre",
  "quantity": 100,
  "images": [],
  "location": { "type": "Point", "coordinates": [36.6500, -0.4167] },
  "locationName": "Ol Kalou, Nyandarua County"
}
```

### 8 — Free-Range Eggs
```json
{
  "title": "Free-Range Hen Eggs",
  "category": "livestock",
  "description": "Eggs from free-range indigenous chickens. Rich yolk, no hormones or antibiotics.",
  "price": 600,
  "unit": "crate",
  "quantity": 20,
  "images": [],
  "location": { "type": "Point", "coordinates": [36.7500, -1.1500] },
  "locationName": "Limuru, Kiambu County"
}
```

---

## Inputs

### 9 — DAP Fertiliser
```json
{
  "title": "DAP Fertiliser 50kg",
  "category": "inputs",
  "description": "Genuine DAP fertiliser for planting season. 50kg bag. Boosts root development.",
  "price": 3800,
  "unit": "piece",
  "quantity": 30,
  "images": [],
  "location": { "type": "Point", "coordinates": [36.8219, -1.2921] },
  "locationName": "Nairobi, Kenya"
}
```

### 10 — Certified Maize Seed
```json
{
  "title": "H614D Certified Maize Seed",
  "category": "inputs",
  "description": "H614D hybrid maize seed, 2kg packet. High yield, drought tolerant. Ideal for medium altitude.",
  "price": 950,
  "unit": "piece",
  "quantity": 50,
  "images": [],
  "location": { "type": "Point", "coordinates": [35.0062, 1.0154] },
  "locationName": "Kitale, Trans-Nzoia County"
}
```
