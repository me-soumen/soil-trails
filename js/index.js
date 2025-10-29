import { backupDatabase, fetchFileContent, uploadNewFile, updateFile, deleteFile } from './github_api.js';
import { sendEmailNotification } from './notifications.js';
import { logError, logInfo } from './logger.js';

const carousel = document.getElementById('state-carousel');
const sampleSection = document.getElementById('sample-section');
var config = {};

// Load config file
async function loadConfig() {
	const response = await fetch("./js/config/config.json");
	config = await response.json();
	localStorage.setItem('appConfig', JSON.stringify(config));
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
		tile.className = 'state-tile position-relative';

		let stateTileHTML = `<img src="./images/states/${state.code}.png" alt="${state.state}" class="state-map">`
							+ `<div class="fw-bold">${state.state}</div>`;
		// Show sample count badge if present
		var badge = document.createElement('div');
		if (state.samples.length > 0) {
			const sampleTypes = { soil: 0, water: 0 };
			state.samples.forEach(sample => {
				(sample?.type === 'water') ? sampleTypes.water++ : sampleTypes.soil++;
			});

			const type = (sampleTypes.water > 0 && sampleTypes.soil > 0) ? 'both' : (sampleTypes.water > 0) ? 'water' : 'soil';
			badge.className = `position-absolute translate-middle badge badge-position rounded-pill d-flex ${type}-badge`;
			if (sampleTypes.soil > 0) {
				badge.innerHTML += `<div class="soil-badge">${sampleTypes.soil}</div>`;
			}
			if (sampleTypes.water > 0) {
				badge.innerHTML += `<div class="water-badge">${sampleTypes.water}</div>`;
			}
		}
		tile.innerHTML = stateTileHTML;
		tile.appendChild(badge);

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
	sampleSection.innerHTML = '';
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
	            <div id="sampleCarousel-${sample.id}" class="carousel slide position-relative" data-bs-ride="carousel" style="padding: 0 !important;">
				    <div class="carousel-indicators">
				        <button type="button" data-bs-target="#sampleCarousel-${sample.id}" data-bs-slide-to="0" class="active" aria-current="true" aria-label="${sample.state}-1"></button>
				        <button type="button" data-bs-target="#sampleCarousel-${sample.id}" data-bs-slide-to="1" aria-label="${sample.state}-2"></button>
				    </div>
				    <div class="carousel-inner rounded-top">
				        <div class="carousel-item active">
				            <img src="./${config.placeImagesFolderPath}/${sample.images[0].imageName}" class="d-block w-100" alt="${sample.place}">
				        </div>
				        <div class="carousel-item">
				            <img src="./${config.placeImagesFolderPath}/${sample.images[1].imageName}" class="d-block w-100" alt="${sample.place} second view">
				        </div>
				    </div>
				    <!-- Previous button -->
				    <button class="carousel-control-prev" type="button" data-bs-target="#sampleCarousel-${sample.id}" data-bs-slide="prev">
				        <span class="visually-hidden">Previous</span>
				    </button>
				    <!-- Next button -->
				    <button class="carousel-control-next" type="button" data-bs-target="#sampleCarousel-${sample.id}" data-bs-slide="next">
				        <span class="visually-hidden">Next</span>
				    </button>
				    <!-- Delete Button -->
				    <button class="delete-btn position-absolute top-0 end-0 m-2" style="z-index: 999;" id="delete-sample-btn" data-code="${stateData.code}" data-id="${sample.id}" data-bs-toggle="modal" data-bs-target="#delete-modal">
				        <i class="bi bi-trash text-danger fs-4"></i>
				    </button>
				</div>
				<div class="sample-type-${sample.type}">${sample.type}</div>
	            <div class="sample-content">
	                <div class="sample-header">
	                    <h3>${sample.place}</h3>
	                    <div class="sample-id">${sample.id}</div>
	                </div>
	                <div class="text-black-50 small">${stateData.state}</div>
	                <div class="sample-meta">
	                    <div class="d-flex align-items-center justify-content-between">
	                        <div>
	                            <i class="bi bi-calendar2-event"></i>
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
			// For DOM to load
			setTimeout(() => {
				const carouselElement = document.getElementById(`sampleCarousel-${sample.id}`);
				if (carouselElement && window.bootstrap?.Carousel) {
					new bootstrap.Carousel(carouselElement);
				}
			}, 0);
		});
	}
}

// States Carousal Navigation
var scrollPosition = 0;
function moveCarousel(direction) {
	const carousel = document.getElementById("state-carousel");
	const scrollAmount = 320;

	scrollPosition += direction * scrollAmount;
	carousel.scrollTo({
		left: scrollPosition,
		behavior: "smooth"
	});
}

// Show alert Toast
export function showAlertToast(message, type = 'info') {
	const toast = document.getElementById('errorToast');
	const toastHeader = toast.querySelector('.toast-header');
	const toastTitle = toast.querySelector('.toast-header strong');
	const toastMessage = document.getElementById('toastMessage');

	toastMessage.textContent = message;
	toastHeader.classList.remove('bg-danger', 'bg-success', 'bg-info');

	if (type === 'error') {
		toastHeader.classList.add('bg-danger', 'text-white');
		toastTitle.textContent = 'Error';
	} else if (type === 'success') {
		toastHeader.classList.add('bg-success', 'text-white');
		toastTitle.textContent = 'Success';
	} else if (type === 'info') {
		toastHeader.classList.add('bg-info', 'text-white');
		toastTitle.textContent = 'Info';
	}
	$('#errorToast').toast('show');
}

// Delete a Sample with associated image
async function deleteSample(stateCode, sampleId, password) {
    try {
        const dbUrl = `${config.baseUrl}/${config.databaseFolderPath}/${config.databaseFileName}`;
        let db, data;

        // Step 1: Fetch db
        try {
            db = await fetchFileContent(dbUrl, password);
            data = JSON.parse(atob(db.content));
        } catch (error) {
            throw new Error(`1/5 Failed to fetch DB: ${error?.message || error}`);
        }

        // Step 2: Locate state and target sample
        const state = data.find(item => item.code === stateCode);
        if (!state) {
            throw new Error(`2/5 State with code "${stateCode}" not found.`);
        }
        const sampleToDelete = state.samples.find(s => s.id === sampleId);
        if (!sampleToDelete) {
            throw new Error(`2/5 Sample with ID "${sampleId}" not found in state "${stateCode}".`);
        }

        // Step 3: Remove sample and reindex IDs
        state.samples = state.samples.filter(sample => sample.id !== sampleId);
        state.samples.forEach((sample, index) => {
            sample.id = `#${index + 1}`;
        });

        // Step 4: Delete associated image(s)
        try {
            for (const image of sampleToDelete.images || []) {
                const imageUrl = `${config.baseUrl}/${config.placeImagesFolderPath}/${image.imageName}`;
                await deleteFile(imageUrl, image.imageSha, password);
            }
        } catch (error) {
            throw new Error(`3/5 Failed to delete image(s): ${error?.message || error}`);
        }

        // Step 4: Backup db
        try {
            await backupDatabase(db.content, password);
        } catch (error) {
            throw new Error(`4/5 Failed to fetch DB: ${error?.message || error}`);
        }

        // Step 6: Save updated DB
        try {
            const base64Content = btoa(JSON.stringify(data, null, 2));
            const response = await updateFile(dbUrl, db.sha, base64Content, password);
            logInfo('delete_sample', 'Database updated successfully', { stateCode, sampleId });
            // Success email notification with deleted sample details
            try { sendEmailNotification('delete_success', { action: 'delete', stateCode, sampleId, sample: sampleToDelete }); } catch (_) {}
            return response;
        } catch (error) {
            throw new Error(`4/5 Failed to update DB: ${error?.message || error}`);
        }
    } catch (err) {
        const logEntry = logError('delete_sample', err, { stateCode, sampleId });
        try {
            const errorPayload = {
                action: 'delete',
                stateCode,
                sampleId,
                errorMessage: logEntry.message,
                errorStack: logEntry.stack,
                errorJson: JSON.stringify(logEntry)
            };
            sendEmailNotification('error', errorPayload);
        } catch (e) { /* ignore */ }
        throw err;
    }
}

// Define functions globally
window.handleConfirmDelete = handleConfirmDelete;
window.moveCarousel = moveCarousel;
window.deleteSample = deleteSample;
window.showAlertToast = showAlertToast;

// Load functions on window load
window.onload = async function() {
	await loadConfig();
	config = JSON.parse(localStorage.getItem('appConfig'));
	await loadSamplesFromDb();
	populateStates();
}