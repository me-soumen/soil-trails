# 🪨 Soil Trails - India Edition

Welcome to the **Soil Trails** — a personal project built to track my hobby of collecting soil samples from various
places across India!  
This site helps me record, update, and view the details of all the soils I have collected so far from different states,
cities, and regions.

🌱 Whether it's the red soil of Tamil Nadu, black cotton soil from Maharashtra, or alluvial soil from the Gangetic
plains — every sample has a place here!

🎯 My Goal is to collect soil samples from each states and union territories of India! Hope to visit all parts of India someday.

---

### Website Link

https://me-soumen.github.io/soil-trails/

---

## 🌍 About This Project

This website is built to:

- ✅ **Add** new soil collection entries with place, date, coordinates and notes.
- ✅ **Delete** existing soil sample details if anything goes wrong.
- ✅ **View** all collection data in a neat table with location of collection point.

The collection details are saved in a `database/states.json` file, which serves as the master record for my soil
samples.

---

## 🔖 Features

- 📍 **Track places**: Code, State, Place, Date, Time, Latitude, Longitude, Notes
- 🗺️ **Geolocation support** for accurate coordinates
- 🔒 Uses **Secure Password** to decrypt the GitHub token for secure updates
- 📝 All data is version-controlled right here in this repo

---

## 🚀 How to Use

1. **Clone or fork** this repo
2. Open the site from `index.html`
3. Go to `Add State` page to add new soil entries
4. View updated details in the main state table

---

## 🤝 Collaborators

| Name                 | Role                                  |
|----------------------|---------------------------------------|
| **Soumen Mukherjee** | Creator & Collector (Main Maintainer) |
| **Payel Banerjee**   | Frontend Developer                    |

---

## 📦 Data Structure (Sample Entry)

```json
{
    "code": "KA",
    "state": "Karnataka",
    "samples": [
        {
            "place": "Hogenakkal Falls",
            "date": "2025-02-08",
            "time": "1:30 PM",
            "latitude": 12.110978776456369,
            "longitude": 77.77476196873303,
            "notes": "Collected from the middle of Kaveri River",
            "imageName": "20250508T190223037Z.png",
            "imageSha": "5a41380291c83e0ff700dd40d379fcc8a37c07ff",
            "id": "#1"
        }
    ]
}