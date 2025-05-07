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

// Update database file (calls backup first)
export async function addNewSample(stateCode, sampleData, image, token) {
	const sample = JSON.parse(sampleData);

	// Step 2: Construct db url and image url
	const dbUrl = `${config.baseUrl}/${config.databaseFolderPath}/${config.databaseFileName}`;
	const imageUrl = `${config.baseUrl}/${config.placeImagesFolderPath}/${sample.imageName}`;

	// Step 3: Get latest db content
	const db = await fetchFileContent(dbUrl, token);
	let existingJson = JSON.parse(atob(db.content));
	if (!Array.isArray(existingJson)) existingJson = [];

	// Step 4: Parse sample input and find matching state
	const targetState = existingJson.find(state => state.code === stateCode);
	if (!targetState) {
		throw new Error(`State "${sample.state}" not found in database.`);
	}

	// Step 5: Backup current db
	await backupDatabase(db.content, token);

	// Step 6: Assign a new ID to the sample
	const newId = `#${targetState.samples.length + 1}`;
	sample.id = newId;

	// Step 7: Append sample to state's samples array
	targetState.samples.push(sample);

	// Step 8: Convert updated object and image to base64
	const base64Content = btoa(JSON.stringify(existingJson, null, 2));
	const base64Image = await fileToBase64(image);

	// Step 9: Prepare API call to update file
	await updateFile(dbUrl, db.sha, base64Content, token);
	await uploadNewFile(imageUrl, base64Image, token)

	console.log("Database updated successfully.")
}

// Convert Image to Base64
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			// Remove the base64 prefix
			const base64String = reader.result.split(',')[1];
			resolve(base64String);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

window.addNewSample = addNewSample;
window.showAlertToast = showAlertToast;