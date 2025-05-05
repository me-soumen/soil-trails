let config = {};

// 1. Load config file
async function loadConfig() {
  const response = await fetch('./config/config.json');
  config = await response.json();
}

// 2: Convert input string to Base64
function convertToBase64(inputString) {
  return btoa(unescape(encodeURIComponent(inputString)));
}

// 3. Fetch the latest SHA of database json file
async function fetchLatestSha(token) {
  const apiUrl = `${config.baseUrl}/${config.databaseFilename}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error fetching SHA:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const data = await response.json();
  return data.sha;
}


// 4: Fetch latest file content (Base64 encoded)
async function fetchFileContent(token) {
  const apiUrl = 'https://api.github.com/repos/me-soumen/soil-collection/contents/root/states.json';

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error fetching file content:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const data = await response.json();
  return data; // Contains 'sha' and 'content' (Base64 encoded)
}

// 5: Backup current states.json file into backup/ folder
async function backupStatesJson(token) {
  const fileData = await fetchFileContent(token);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Make it filename safe
  const backupFilename = `backup/states-${timestamp}.json`;

  const apiUrl = `https://api.github.com/repos/me-soumen/soil-collection/contents/${backupFilename}`;

  const body = {
    message: `Backup states.json at ${timestamp}`,
    committer: {
      name: "Soumen",
      email: "me.soumen02@gmail.com"
    },
    content: fileData.content // Already Base64 from GitHub API
  };

  const response = await fetch(apiUrl, {
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
    console.error('Error backing up file:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const data = await response.json();
  console.log('Backup created at:', data.content.path);
  return data;
}

// 6: Update states.json file (calls backup first)
async function updateStatesJson(rawContent, token) {

    // Step 1: Load config
    loadConfig();

    // Step 2: Backup current file
    await backupStatesJson(token);

    // Step 3: Get latest SHA
    const latestSha = await fetchLatestSha(token);

    // Step 4: Convert content to Base64
    const base64Content = convertToBase64(rawContent);

    // Step 5: Prepare API call
    const apiUrl = 'https://api.github.com/repos/me-soumen/soil-collection/contents/root/states.json';

    const body = {
    message: "Updating states.json",
    committer: {
      name: "Soumen",
      email: "me.soumen02@gmail.com"
    },
    sha: latestSha,
    content: base64Content
    };

    const response = await fetch(apiUrl, {
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
    console.error('Error updating file:', error);
    throw new Error(`GitHub API error: ${error.message}`);
    }

    const data = await response.json();
    console.log('File updated successfully:', data.content.path);
    return data;
}