var config = {};

// Load config file
async function loadConfig() {
    const response = await fetch('../js/config/config.json');
    config = await response.json();
}

// Convert input string to Base64
function convertToBase64(inputString) {
  return btoa(unescape(encodeURIComponent(inputString)));
}

// Backup current states.json file into backup/ folder
async function backupDatabase(dbContent, token) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Make it filename safe
    const backupFilename = `${timestamp}.json`;

    const backupUrl = `${config.baseUrl}/${config.databaseBackupFolderName}/${backupFilename}`;
    console.log(backupUrl)

    const data = await uploadNewFile(backupUrl, dbContent, token);

    console.log("Backup created successfully.")
}

// Update database file (calls backup first)
async function updateStatesJson(rawContent, token) {
    // Step 1: Load config
    await loadConfig();

    const dbUrl = `${config.baseUrl}/${config.databaseFolderName}/${config.databaseFileName}`;

    // Step 2: Get latest db content
    const db = await fetchFileContent(dbUrl, token);

    // Step 3: Backup current db
    await backupDatabase(db.content, token);

    // Step 4: Merge (append) rawContent with existing content
    let existingJson = JSON.parse(atob(db.content));  // Decode existing Base64 and parse
    let newJson = JSON.parse(rawContent);

    if (!Array.isArray(existingJson)) existingJson = [];
    if (!Array.isArray(newJson)) newJson = [newJson];

    const mergedJson = [...existingJson, ...newJson];

    // Step 5: Convert merged content back to Base64
    const base64Content = btoa(JSON.stringify(mergedJson, null, 2));
    console.log(base64Content);

    // Step 6: Prepare API call to update file
    await updateFile(dbUrl, db.sha, base64Content, token);

    console.log("Database updated successfully.")
}

/*------------------------------------------------------------------------------------------------
GitHub APIs: Fetch Content / Upload a File / Update a File
----------------------------------------------------------------------------------------------*/
// Fetch file content from GitHub (Base64 encoded)
async function fetchFileContent(fileUrl, token) {
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
        console.error('Error fetching file content:', error);
        throw new Error(`GitHub API error: ${error.message}`);
    }

    const data = await response.json();
    return data;
}

// Upload a new file to GitHub
async function uploadNewFile(fileUrl, content, token) {
  const body = {
    message: "Uploading a new file",
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
    console.error('Error uploading file:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const data = await response.json();
  console.log('GitHub: File uploaded with url:', data.content.path);
  return data;
}

// Update an existing file in GitHub
async function updateFile(fileUrl, fileSha, updatedContent, token) {
    const body = {
        message: "Updating an existing file",
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
      console.error('Error updating file:', error);
      throw new Error(`GitHub API error: ${error.message}`);
      }

      const data = await response.json();
      console.log('GitHub: File updated successfully:', data.content.path);
      return data;
}