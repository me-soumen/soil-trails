// Landing Page - Statistics Update
async function loadStatsConfig() {
	const response = await fetch("../js/config/config.json");
	return await response.json();
}

async function loadSamplesFromDb(config) {
	const dbPath = `../${config.databaseFolderPath}/${config.databaseFileName}`;
	const response = await fetch(dbPath);
	return await response.json();
}

// Calculate and update statistics
function updateStatistics(data) {
	let totalSamples = 0;
	let soilSamples = 0;
	let waterSamples = 0;
	const visitedStates = new Set();
	
	data.forEach(state => {
		const stateSampleCount = state.samples ? state.samples.length : 0;
		totalSamples += stateSampleCount;
		
		if (stateSampleCount > 0) {
			visitedStates.add(state.code);
		}
		
		if (state.samples) {
			state.samples.forEach(sample => {
				if (sample.type === 'soil') {
					soilSamples++;
				} else if (sample.type === 'water') {
					waterSamples++;
				}
			});
		}
	});
	
	const totalLocationsEl = document.getElementById('total-locations');
	const totalSamplesEl = document.getElementById('total-samples');
	const soilSamplesEl = document.getElementById('soil-samples');
	const waterSamplesEl = document.getElementById('water-samples');
	
	if (totalLocationsEl) totalLocationsEl.textContent = visitedStates.size;
	if (totalSamplesEl) totalSamplesEl.textContent = totalSamples;
	if (soilSamplesEl) soilSamplesEl.textContent = soilSamples;
	if (waterSamplesEl) waterSamplesEl.textContent = waterSamples;
}

// Load statistics on page load
window.onload = async function() {
	try {
		const config = await loadStatsConfig();
		const data = await loadSamplesFromDb(config);
		updateStatistics(data);
	} catch (error) {
		console.error('Error loading statistics:', error);
	}
}
