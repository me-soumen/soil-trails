/*------------------------------------------------------------------------------------------------
GitHub APIs: Fetch Content / Upload a File / Update a File
----------------------------------------------------------------------------------------------*/
var config = {}

// Load config file
export async function loadConfig() {
  const response = await fetch('../config/js/config/config.json');
  if (!response.ok) {
    throw new Error('Failed to load config.json');
  }
  config = await response.json();
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
        console.error('Error fetching file content:', error);
        throw new Error(`GitHub API error: ${error.message}`);
    }

    const data = await response.json();
    console.log(data)
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
    console.error('Error uploading file:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }

  const data = await response.json();
  console.log('GitHub: File uploaded with url:', data.content.path);
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
      console.error('Error updating file:', error);
      throw new Error(`GitHub API error: ${error.message}`);
      }

      const data = await response.json();
      console.log('GitHub: File updated successfully:', data.content.path);
      return data;
}