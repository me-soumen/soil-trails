import { fetchFileContent, uploadNewFile, updateFile } from './github_api.js';

const carousel = document.getElementById('state-carousel');
const sampleSection = document.getElementById('sample-section');

var config = {};
// Load config file
async function loadConfig() {
    const response = await fetch('./js/config/config.json');
    config = await response.json();
}

var data = []
// Load config file
async function loadData() {
    const dbPath = `./${config.databaseFolderPath}/${config.databaseFileName}`;
    console.log(dbPath);
    const response = await fetch(dbPath);
    data = await response.json();
}

function populateData() {
    // Load State Carousel
    data.forEach((state, index) => {
        const tile = document.createElement('div');
            tile.className = 'state-tile';
            tile.innerHTML = `
                <img src="./images/states/${state.code}.png" alt="${state.state}" class="state-map">
                <div class="fw-bold">${state.state}</div>
            `;
            tile.addEventListener('click', () => {
                document.querySelectorAll('.state-tile').forEach(el => el.classList.remove('active'));
                tile.classList.add('active');
                loadSamples(state);
            });
        if (index === 0) {
            tile.classList.add('active');
            loadSamples(state);
        }
        carousel.appendChild(tile);
    });
}

// Load Samples Function
function loadSamples(stateData) {

  sampleSection.innerHTML = ''; // clear
  if(stateData.samples.length == 0) {
    const tile = document.createElement('div');
    tile.className = 'no-record d-flex align-items-center justify-content-center fw-bold';
    tile.innerHTML = `Hope to visit soon...`;
    sampleSection.appendChild(tile);
  } else {
      stateData.samples.forEach(sample => {
        const tile = document.createElement('div');
        tile.className = 'sample-tile';
        tile.innerHTML = `
          <img src="./${config.placeImagesFolderPath}/${sample.imageName}" alt="${sample.place}">
          <div class="sample-content">
            <div class="sample-header">
              <h3>${sample.place}</h3>
              <div class="sample-id">${sample.id}</div>
            </div>
            <div class="text-black-50 small">${stateData.state}</div>
            <div class="sample-meta">
            <div class="d-flex align-items-center justify-content-between">
                <div>
                    <i class="bi bi-calendar"></i>
                    ${sample.date}
                  </div>
                  <div>
                    <i class="bi bi-alarm"></i>
                    ${sample.time}
                  </div>
            </div>

              <div>
                <i class="bi bi-geo-alt"></i>
                <a href="${config.mapBaseUrl}${sample.latitude},${sample.longitude}" target="_blank">View on Map</a>
              </div>
            </div>
            <div class="sample-notes align-items-start">
            <i class="bi bi-card-text"></i>
            <div class="ps-2">${sample.notes}</div>
            </div>
          </div>
        `;
        sampleSection.appendChild(tile);
      });
    }
}

window.onload = async function() {
    await loadConfig(); // Wait for loadConfig to finish
    await loadData();   // Wait for loadData to finish
    populateData();     // Once the data is loaded, populate the data
}

let scrollPosition = 0;
// Carousal Navigation
function moveCarousel(direction) {
console.log(direction);
  const carousel = document.getElementById("state-carousel");
  const scrollAmount = 320; // adjust to card width + margin

  scrollPosition += direction * scrollAmount;
  carousel.scrollTo({
    left: scrollPosition,
    behavior: "smooth"
  });
}