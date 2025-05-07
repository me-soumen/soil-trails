/*------------------------------------------------------------------------------------------------
GitHub APIs: Fetch Content / Upload a File / Update a File
----------------------------------------------------------------------------------------------*/
var config = {}

// Load config file
export async function loadConfig() {
	const basePath = window.location.hostname === 'localhost' ? '' : '/soil-collection';
	const response = await fetch(`${basePath}/js/config/config.json`);
	config = await response.json();
}

// Backup current states.json file into backup/ folder
export async function backupDatabase(dbContent, token) {
	await loadConfig();
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const backupFilename = `${timestamp}.json`;
	const backupUrl = `${config.baseUrl}/${config.databaseBackupFolderPath}/${backupFilename}`;
	const data = await uploadNewFile(backupUrl, dbContent, token);
	console.log("Backup created successfully.")
}

// Fetch file content from GitHub (Base64 encoded)
export async function fetchFileContent(fileUrl, token) {
	const response = await fetch(fileUrl, {
		method: 'GET',
		headers: {
			'Accept': 'application/vnd.github+json',
			'Authorization': `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});

	if (!response.ok) {
		const error = await response.json();
		console.error('GitHub: Error fetching file content:', error);
		throw new Error(`GitHub API error: ${error.message}`);
	}

	const data = await response.json();
	return data;
}

// Upload a new file to GitHub
export async function uploadNewFile(fileUrl, content, token) {
	const body = {
		message: "Uploading database backup",
		committer: {
			name: `${config.committerName}`,
			email: `${config.committerEmail}`
		},
		content: content // base64 encoded content
	};

	const response = await fetch(fileUrl, {
		method: 'PUT',
		headers: {
			'Accept': 'application/vnd.github+json',
			'Authorization': `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const error = await response.json();
		console.error('GitHub: Error uploading file:', error);
		throw new Error(`GitHub API error: ${error.message}`);
	}

	const data = await response.json();
	console.log('GitHub: File uploaded successfully url:', data.content.path);
	return data;
}

// Update an existing file in GitHub
export async function updateFile(fileUrl, fileSha, updatedContent, token) {
	const body = {
		message: "Adding one sample data",
		committer: {
			name: `${config.committerName}`,
			email: `${config.committerEmail}`
		},
		sha: fileSha,
		content: updatedContent  // base64 encoded content
	};

	const response = await fetch(fileUrl, {
		method: 'PUT',
		headers: {
			'Accept': 'application/vnd.github+json',
			'Authorization': `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const error = await response.json();
		console.error('GitHub: Error updating file:', error);
		throw new Error(`GitHub API error: ${error.message}`);
	}

	const data = await response.json();
	console.log('GitHub: File updated successfully:', data.content.path);
	return data;
}

window.onload = async function() {
	await loadConfig(); // Wait for loadConfig to finish
}