export function logInfo(context, message, extras = {}) {
	const entry = {
		timestamp: new Date().toISOString(),
		level: 'INFO',
		context,
		message,
		...sanitizeExtras(extras)
	};
	console.info('[SoilTrails]', entry);
	return entry;
}

export function logError(context, error, extras = {}) {
	const normalized = normalizeError(error);
	const entry = {
		timestamp: new Date().toISOString(),
		level: 'ERROR',
		context,
		message: normalized.message,
		name: normalized.name,
		stack: normalized.stack,
		cause: normalized.cause,
		...sanitizeExtras(extras)
	};
	console.error('[SoilTrails]', entry);
	return entry;
}

function normalizeError(err) {
	if (!err) return { name: 'Error', message: 'Unknown error', stack: '', cause: undefined };
	const name = err.name || 'Error';
	const message = err.message || String(err);
	const stack = err.stack || '';
	const cause = err.cause ? (err.cause.message || String(err.cause)) : undefined;
	return { name, message, stack, cause };
}

function sanitizeExtras(extras) {
	try {
		JSON.stringify(extras);
		return { extras };
	} catch (_) {
		return { extras: String(extras) };
	}
}


