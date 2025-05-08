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
})
	.catch(error => console.error('Error loading JSON:', error));

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
export async function addNewSample(stateCode, sampleData, image, password) {
	const sample = JSON.parse(sampleData);

	// Handle Image upload :: name change, convert to base64, get sha to persist in sample
	const timestamp = new Date()?.toISOString()?.replace(/[:.-]/g, '');
	const imageFileName = `${timestamp}.png`;
	const imageUrl = `${config.baseUrl}/${config.placeImagesFolderPath}/${imageFileName}`;
	const base64Image = await imageToBase64(image);
	const imageDetails = await uploadNewFile(imageUrl, base64Image, password);
	sample.imageName = imageFileName;
	sample.imageSha = imageDetails?.content?.sha;

	// Handle Backup :: fetch latest content, take backup, convert to JSON
	const dbUrl = `${config.baseUrl}/${config.databaseFolderPath}/${config.databaseFileName}`;
	const db = await fetchFileContent(dbUrl, password);
	await backupDatabase(db.content, password);
	let existingJson = JSON.parse(atob(db.content));

	// Find state index in DB
	if (!Array.isArray(existingJson)) existingJson = [];
	const targetState = existingJson.find(state => state.code === stateCode);
	if (!targetState) {
		throw new Error(`State "${state.state}" not found in database.`);
	}

	// Step 6: Assign a new ID to the sample
	const newId = `#${targetState.samples.length + 1}`;
	sample.id = newId;

	// Step 7: Append sample to state's samples array
	targetState.samples.push(sample);

	// Step 8: Convert updated object and image to base64
	const base64Content = btoa(JSON.stringify(existingJson, null, 2));

	// Step 9: Prepare API call to update file
	await updateFile(dbUrl, db.sha, base64Content, password);

	console.log("Database updated successfully.")
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

// Converts time 24 hour format to 12 hour format
export async function to12HourFormat(time24) {
	const [hour, minute] = time24.split(":").map(Number);
	const ampm = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;
	return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

window.addNewSample = addNewSample;
window.showAlertToast = showAlertToast;
window.to12HourFormat = to12HourFormat;