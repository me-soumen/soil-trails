var config = JSON.parse(localStorage.getItem('appConfig'));

// Function to dynamically load Compressor.js once
function loadCompressorLibrary() {
	return new Promise((resolve, reject) => {
		if (window.Compressor) {
			resolve();
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://unpkg.com/compressorjs@1.2.1/dist/compressor.min.js';
		script.onload = () => resolve();
		script.onerror = () => reject(new Error('Failed to load Compressor.js'));
		document.head.appendChild(script);
	});
}

// Function to compress image and force JPEG output
function compressImage(file) {
	const quality = config.compressQuality;
	return new Promise(async (resolve, reject) => {
		try {
			await loadCompressorLibrary();

			new Compressor(file, {
				quality: quality,
				convertSize: 0, // Force *all* images (even small PNGs) to convert to JPEG
				mimeType: 'image/jpeg', // Force output as JPEG
				success(result) {
					resolve(result);
				},
				error(err) {
					reject(err);
				},
			});
		} catch (err) {
			reject(err);
		}
	});
}

window.compressImage = compressImage;