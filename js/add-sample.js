import { backupDatabase, fetchFileContent, uploadNewFile, updateFile } from './github_api.js';

var config = JSON.parse(localStorage.getItem('appConfig'));

// Populate State/UT select dropdown
export function populateDropdown(states, uts) {
	const dropdown = document.getElementById('stateDropdown');
	dropdown.innerHTML = `
        <option value="">Select State/UT</option>
        <optgroup label="States"></optgroup>
        <optgroup label="Union Territories"></optgroup>
        `;

	const stateGroup = dropdown.querySelector('optgroup[label="States"]');
	const utGroup = dropdown.querySelector('optgroup[label="Union Territories"]');

	// Populate States
	for (const [state, code] of Object.entries(states)) {
		const option = document.createElement('option');
		option.value = code;
		option.textContent = state;
		stateGroup.appendChild(option);
	}

	// Populate UTs
	for (const [ut, code] of Object.entries(uts)) {
		const option = document.createElement('option');
		option.value = code;
		option.textContent = ut;
		utGroup.appendChild(option);
	}

	$('#stateDropdown').selectpicker('refresh');
}

// State/UT dropdown load
fetch('../js/config/state-map.json')
	.then(response => response.json())
	.then(data => {
	const { states, uts } = data;
	populateDropdown(states, uts);
}).catch(error => console.error('Error loading JSON:', error));

// Show Toast
function showAlertToast(message, type = 'error') {
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

// Create a new sample after taking backup of existing
export async function addNewSample(stateCode, sampleData, images, password) {
	const sample = JSON.parse(sampleData);
	sample.images = [];

	// Step 1: Upload images
	try {
		const timestampBase = new Date().toISOString().replace(/[:.-]/g, '');
		await Promise.all(images.map(async (image, index) => {
			const imageFileName = `${timestampBase}${index}.png`;
			const imageUrl = `${config.baseUrl}/${config.placeImagesFolderPath}/${imageFileName}`;
			const base64Image = await imageToBase64(image);
			const imageDetails = await uploadNewFile(imageUrl, base64Image, password);

			sample.images.push({
				imageName: imageFileName,
				imageSha: imageDetails?.content?.sha
			});
		}));
	} catch (error) {
		throw new Error(`1/5 Image upload failed: ${error?.message || error}`);
	}

	// Step 2: Fetch and parse DB
	let db, existingJson;
	const dbUrl = `${config.baseUrl}/${config.databaseFolderPath}/${config.databaseFileName}`;
	try {
		db = await fetchFileContent(dbUrl, password);
		existingJson = JSON.parse(atob(db.content));
	} catch (error) {
		throw new Error(`2/5 Failed to fetch or parse DB: ${error?.message || error}`);
	}

	// Step 3: Find target state
	if (!Array.isArray(existingJson)) existingJson = [];
	const targetState = existingJson.find(state => state.code === stateCode);
	if (!targetState) {
		throw new Error(`3/5 State with code "${stateCode}" not found in DB.`);
	}

	// Step 4: Add sample to state
	const newId = `#${targetState.samples.length + 1}`;
	sample.id = newId;
	targetState.samples.push(sample);

	// Step 5: Prepare updated DB content
	const updatedBase64Content = btoa(JSON.stringify(existingJson, null, 2));

	// Step 6: Backup old DB
	try {
		await backupDatabase(db.content, password);
	} catch (error) {
		throw new Error(`4/5 Backup failed: ${error?.message || error}`);
	}

	// Step 7: Upload updated DB
	try {
		const response = await updateFile(dbUrl, db.sha, updatedBase64Content, password);
		console.log("Database updated successfully.");
		return response;
	} catch (error) {
		throw new Error(`5/5 DB update failed: ${error?.message || error}`);
	}
}

// Convert Image to Base64
function imageToBase64(image) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64String = reader.result.split(',')[1];
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(image);
	});
}

// On select image, it'll show preview
export function previewImage(event, id) {
	const input = event.target;
	const file = input.files[0];
	const preview = document.getElementById(`photo${id}Preview`);
	const icon = document.getElementById(`photo${id}Icon`);
	const label = document.getElementById(`photo${id}Label`);
	const removeBtn = document.getElementById(`removePhoto${id}`);

	if (file) {
		const reader = new FileReader();
		reader.onload = function (e) {
			preview.src = e.target.result;
			preview.style.display = 'block';
			icon.style.display = 'none';
			label.style.display = 'none';
			removeBtn.style.display = 'block';
		};
		reader.readAsDataURL(file);
	}
}

// Image cross button listener
export function removeImage(id) {
	const input = document.getElementById(`photo${id}Input`);
	const preview = document.getElementById(`photo${id}Preview`);
	const icon = document.getElementById(`photo${id}Icon`);
	const label = document.getElementById(`photo${id}Label`);
	const removeBtn = document.getElementById(`removePhoto${id}`);

	input.value = '';
	preview.src = '';
	preview.style.display = 'none';
	icon.style.display = 'block';
	label.style.display = 'block';
	removeBtn.style.display = 'none';
}

// Converts time 24 hour format to 12 hour format
export async function to12HourFormat(time24) {
	const [hour, minute] = time24.split(":").map(Number);
	const ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;
	return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Define functions globally
window.addNewSample = addNewSample;
window.showAlertToast = showAlertToast;
window.previewImage = previewImage;
window.removeImage = removeImage;
window.to12HourFormat = to12HourFormat;