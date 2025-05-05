# 🪨 Soil Collection Tracker (India Edition)

Welcome to the **Soil Collection Tracker** — a personal project built to track my hobby of collecting soil samples from various places across India!  
This site helps me record, update, and view the details of all the soils I have collected so far from different states, cities, and regions.

🌱 Whether it's the red soil of Tamil Nadu, black cotton soil from Maharashtra, or alluvial soil from the Gangetic plains — every sample has a place here!

🎯 My Goal is to collect soil samples from each states and union territories of India!

---

### Website Link

https://me-soumen.github.io/soil-collection/

---

## 🌍 About This Project

This website is built to:
- ✅ **Add** new soil collection entries with place, date, coordinates and notes.
- ✅ **Update** existing soil details as I revisit places.
- ✅ **View** all collection data in a neat table with location of collection point.

The collection details are saved in a `database/states.json` file, which serves as the master record for my soil samples.

---

## 🔖 Features

- 📍 **Track places**: Code, State, Place, Date, Time, Latitude, Longitude, Notes
- 🔄 **Edit and update** existing records
- 🗺️ **Geolocation support** for accurate coordinates
- 🔒 Uses **GitHub Actions** for secure updates
- 📝 All data is version-controlled right here in this repo

---

## 🚀 How to Use

1. **Clone or fork** this repo
2. Open the site from `index.html`
3. Go to `Add or Update State` page to add new soil entries
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
  "place": "Hogenakkal Falls",
  "date": "08-02-2025",
  "time": "01:30 PM",
  "latitude": 12.110986586674395,
  "longitude": 77.7747682536287,
  "notes": "Collected in the middle of Kaveri River while taking Coracle ride"
}