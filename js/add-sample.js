import { fetchFileContent, uploadNewFile, updateFile } from './github_api.js';

var config = {};
// Load config file
async function loadConfig() {
    const response = await fetch('../js/config/config.json');
    config = await response.json();
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
export async function updateStatesJson(rawContent, token) {
    // Step 1: Load config
    await loadConfig();

    const dbUrl = `${config.baseUrl}/${config.databaseFolderName}/${config.databaseFileName}`;

    // Step 2: Get latest db content
    const db = await fetchFileContent(dbUrl, token);
    let existingJson = JSON.parse(atob(db.content));

    if (!Array.isArray(existingJson)) existingJson = [];

    // Step 3: Parse sample input and find matching state
    const sample = JSON.parse(rawContent);
    const targetState = existingJson.find(state => state.code === sample.code);

    if (!targetState) {
        throw new Error(`State "${sample.state}" not found in database.`);
    }

    // Step 4: Backup current db
    await backupDatabase(db.content, token);

    // Step 5: Assign a new ID to the sample
    const newId = `#${targetState.samples.length + 1}`;
    sample.id = newId;

    // Step 6: Append sample to state's samples array
    targetState.samples.push(sample);

    // Step 7: Convert updated object to base64
    const base64Content = btoa(JSON.stringify(existingJson, null, 2));
    console.log(base64Content);

    // Step 6: Prepare API call to update file
    await updateFile(dbUrl, db.sha, base64Content, token);

    console.log("Database updated successfully.")
}

window.updateStatesJson = updateStatesJson;