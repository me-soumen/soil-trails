import { backupDatabase, fetchFileContent, uploadNewFile, updateFile } from './github_api.js';

const carousel = document.getElementById('state-carousel');
const sampleSection = document.getElementById('sample-section');
var config = {};

// Load config file
async function loadConfig() {
	const basePath = window.location.hostname === 'localhost' ? '' : '/soil-collection';
	const response = await fetch(`${basePath}/js/config/config.json`);
	config = await response.json();
	console.log(config);
}

var data = []
// Load samples from database
async function loadSamplesFromDb() {
	const dbPath = `./${config.databaseFolderPath}/${config.databaseFileName}`;
	const response = await fetch(dbPath);
	data = await response.json();
}

// Populate States/UTs tiles
function populateStates() {
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
			populateSamples(state);
		});
		if (index === 0) {
			tile.classList.add('active');
			populateSamples(state);
		}
		carousel.appendChild(tile);
	});
}

// Populate Samples tiles
function populateSamples(stateData) {
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
            <button class="delete-btn" onclick="deleteSample('${stateData.code}', '${sample.id}')">
                <i class="bi bi-trash"></i>
            </button>
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

// Carousal Navigation
var scrollPosition = 0;
function moveCarousel(direction) {
	const carousel = document.getElementById("state-carousel");
	const scrollAmount = 320; // adjust to card width + margin

	scrollPosition += direction * scrollAmount;
	carousel.scrollTo({
		left: scrollPosition,
		behavior: "smooth"
	});
}

// Delete Sample
async function deleteSample(stateCode, sampleId) {
	let token = prompt("Please enter the GitHub Token");
	if (token != null) {

		// Step 2: Construct db url and image url
		const dbUrl = `${config.baseUrl}/${config.databaseFolderPath}/${config.databaseFileName}`;

		// Step 3: Get latest db content
		const db = await fetchFileContent(dbUrl, token);
		let data = JSON.parse(atob(db.content));

		// Step 4: Backup current db
		await backupDatabase(db.content, token);

		// Step 5: Delete sample and reassign new id
		const state = data.find(item => item.code === stateCode); // fix from dataArray to data
		if (state) {
			const initialLength = state.samples.length;

			state.samples = state.samples.filter(sample => sample.id !== sampleId);
			if (state.samples.length < initialLength) {
				// Reassign IDs based on current count
				state.samples.forEach((sample, index) => {
					sample.id = `#${index + 1}`;
				});
			} else {
				console.log(`Sample with id ${sampleId} not found in state ${stateCode}`);
			}
		} else {
			console.log(`State with code ${stateCode} not found`);
		}

		// Step 6: Convert updated object and image to base64
		const base64Content = btoa(JSON.stringify(data, null, 2));
		console.log(data);
		// Step 7: Prepare API call to update file
		await updateFile(dbUrl, db.sha, base64Content, token);

		console.log("Database updated successfully.")
	}
}

window.moveCarousel = moveCarousel;
window.deleteSample = deleteSample;
window.onload = async function() {
	await loadConfig(); // Wait for loadConfig to finish
	await loadSamplesFromDb();   // Wait for loadSamplesFromDb to finish
	populateStates();     // Once the data is loaded, populate the data
}