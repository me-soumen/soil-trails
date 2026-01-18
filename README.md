# 🪨 Soil Trails - India Edition

A personal project to document soil and water samples collected from various states and union territories across India. Built with precise geolocation tracking, timestamps, and visual documentation.

🌱 **Goal**: Collect samples from all states and union territories of India!

---

## 🌐 Website

- https://soil.trails.click/
- https://me-soumen.github.io/soil-trails/

---

## ✨ Features

- 📍 **Add samples** with precise GPS coordinates, timestamps, and notes
- 🗺️ **Explore by state** with interactive state cards and sample galleries
- 🖼️ **Visual documentation** with multiple images per sample
- 🔒 **Secure updates** using encrypted GitHub token authentication
- 🌓 **Dark/Light theme** toggle
- 📱 **Fully responsive** design

---

## 📁 Project Structure

```
soil-trails/
├── app/                    # Application pages
│   ├── add/               # Add sample page
│   └── explore/           # Explore samples page
├── css/                   # Stylesheets
│   ├── variables.css      # CSS variables (theme colors)
│   ├── styles.css         # Base styles (navbar, footer)
│   ├── components.css     # Reusable components
│   └── pages.css          # Page-specific styles
├── js/
│   ├── pages/             # Page-specific JavaScript
│   │   ├── index-page.js  # Landing page
│   │   ├── explore-page.js # Explore page
│   │   └── add-page.js    # Add sample page
│   ├── services/          # Core services
│   │   ├── api.js         # GitHub API integration
│   │   ├── decrypt.js     # Token decryption
│   │   └── compressor.js  # Image compression
│   ├── utils/             # Utilities
│   │   ├── theme.js       # Theme management
│   │   ├── logger.js      # Error logging
│   │   └── notifications.js # Email notifications
│   └── config/            # Configuration files
├── database/
│   ├── data.json          # Main database
│   ├── backup/            # Database backups
│   └── places/            # Sample images
├── images/
│   ├── favicon.png
│   ├── logo.png
│   └── states/            # State map images
└── index.html             # Landing page
```

---

## 🚀 Usage

1. **Landing Page**: Overview with statistics and features
2. **Explore**: Browse samples by state/UT with interactive cards
3. **Add Sample**: Submit new samples with images, coordinates, and notes

---

## 📦 Data Structure

Samples are stored in `database/data.json` with the following structure:

```json
{
  "code": "KA",
  "state": "Karnataka",
  "samples": [
    {
      "id": "#1",
      "place": "Bangalore",
      "type": "soil",
      "date": "2025-05-05",
      "time": "05:55 PM",
      "latitude": 12.979647089493072,
      "longitude": 77.59081867848421,
      "notes": "Collected near Vidhan Soudha",
      "images": [
        {
          "imageName": "20250508T190223037Z0.png",
          "imageSha": "5a41380291c83e0ff700dd40d379fcc8a37c07ff"
        }
      ]
    }
  ]
}
```

---

## 🤝 Contributors

| Name                 | Role                    |
|----------------------|-------------------------|
| **Soumen Mukherjee** | Creator & Maintainer    |
| **Payel Banerjee**   | Frontend Developer      |

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (CSS Variables for theming), JavaScript (ES6+)
- **Styling**: Bootstrap 5.3.6, Bootstrap Icons
- **Storage**: GitHub API (Repository-based JSON storage)
- **Security**: AES-256-GCM encryption with PBKDF2

---

**Note**: This is a personal hobby project. All data is stored securely in the repository using encrypted authentication.
