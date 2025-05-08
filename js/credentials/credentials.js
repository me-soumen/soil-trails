// This encrypt and decrypt full project is available in 'encrypt-decrypt' project
export async function decryptToken(encryptedString, password) {
	const encryptedBytes = Uint8Array.from(
		atob(encryptedString),
		c => c.charCodeAt(0)
	);

	const salt = encryptedBytes.slice(0, 16);
	const iv = encryptedBytes.slice(16, 28);
	const data = encryptedBytes.slice(28);

	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);
	const key = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations: 291993,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		true,
		['decrypt']
	);

	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		key,
		data
	);

	return atob(new TextDecoder().decode(decrypted));
}