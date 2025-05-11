import { decryptToken } from './credentials/credentials.js';

/*------------------------------------------------------------------------------------------------
GitHub APIs: Fetch Content / Upload a File / Update a File
----------------------------------------------------------------------------------------------*/
var config = JSON.parse(localStorage.getItem('appConfig'));

// Backup current db file into backup/ folder
export async function backupDatabase(dbContent, password) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	const backupFilename = `${timestamp}.json`;
	const backupUrl = `${config.baseUrl}/${config.databaseBackupFolderPath}/${backupFilename}`;
	const data = await uploadNewFile(backupUrl, dbContent, password);
	console.log("Backup created successfully.")
}

// Fetch file content from GitHub (Base64 encoded)
export async function fetchFileContent(fileUrl, password) {
	const token = await decryptToken(config.encryptedString, password);
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
export async function uploadNewFile(fileUrl, content, password) {
	const token = await decryptToken(config.encryptedString, password);
	const body = {
		message: `${config.commit.message.modify}`,
		committer: {
			name: `${config.commit.committerName}`,
			email: `${config.commit.committerEmail}`
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
export async function updateFile(fileUrl, fileSha, updatedContent, password) {
	const token = await decryptToken(config.encryptedString, password);
	const body = {
		message: `${config.commit.message.modify}`,
		committer: {
			name: `${config.commit.committerName}`,
			email: `${config.commit.committerEmail}`
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

// Delete a file from GitHub
export async function deleteFile(fileUrl, fileSha, password) {
	const token = await decryptToken(config.encryptedString, password);
	const body = {
		message: `${config.commit.message.delete}`,
		committer: {
			name: `${config.commit.committerName}`,
			email: `${config.commit.committerEmail}`
		},
		sha: fileSha
	};

	const response = await fetch(fileUrl, {
		method: 'DELETE',
		headers: {
			'Accept': 'application/vnd.github+json',
			'Authorization': `Bearer ${token}`,
			'X-GitHub-Api-Version': '2022-11-28'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const error = await response.json();
		console.error('GitHub: Error deleteing file:', error);
		throw new Error(`GitHub API error: ${error.message}`);
	}

	const data = await response.json();
	console.log('GitHub: File deleted successfully');
	return data;
}