// Email notifications helper using EmailJS
export async function sendEmailNotification(eventType, payload) {
	try {
        const raw = localStorage.getItem('appConfig');
        if (!raw) {
            console.warn('Email notification skipped: appConfig missing in localStorage');
            return;
        }
        const cfg = JSON.parse(raw) || {};
        if (cfg?.email?.provider !== 'emailjs') {
            console.warn('Email notification skipped: provider not emailjs or email config missing');
            return;
        }
        const emailCfg = cfg?.email?.emailjs || {};
        if (!emailCfg.publicKey || !emailCfg.serviceId) {
            console.warn('Email notification skipped: missing EmailJS publicKey/serviceId');
            return;
        }

		if (window.emailjs?.init && !window.__emailjsInitialized) {
			window.emailjs.init(emailCfg.publicKey);
			window.__emailjsInitialized = true;
		}

		const templates = emailCfg.templates || {};
		let templateId = undefined;
			switch (eventType) {
			case 'add_success':
			case 'delete_success':
				// Prefer single action template; fall back for backward compatibility
				templateId = templates.action || emailCfg.templateIdAction || emailCfg.templateId || emailCfg.templateIdAdd || emailCfg.templateIdDelete; break;
			case 'error':
				templateId = templates.error || emailCfg.templateIdError || emailCfg.templateId; break;
			default:
				templateId = emailCfg.templateIdAction || emailCfg.templateId;
		}
        if (!templateId) {
            console.warn('Email notification skipped: templateId missing for event', eventType);
            return;
        }

		const nowIso = new Date().toISOString();

		const toStringSafe = (v) => {
			if (v === undefined || v === null) return '';
			try { return String(v); } catch { return ''; }
		};

		const params = {
			to_email: toStringSafe(emailCfg.toEmail || ''),
			event_type: toStringSafe(eventType),
			timestamp: toStringSafe(nowIso),
			// Common optional fields safely mapped (all coerced to strings)
			state_code: toStringSafe(payload?.stateCode || payload?.state_code || ''),
			sample_id: toStringSafe(payload?.sampleId || payload?.sample_id || ''),
			place: toStringSafe(payload?.place || payload?.sample?.place || ''),
			type: toStringSafe(payload?.type || payload?.sample?.type || ''),
			date: toStringSafe(payload?.date || payload?.sample?.date || ''),
			time: toStringSafe(payload?.time || payload?.sample?.time || ''),
			latitude: toStringSafe(payload?.latitude ?? payload?.sample?.latitude ?? ''),
			longitude: toStringSafe(payload?.longitude ?? payload?.sample?.longitude ?? ''),

			notes: toStringSafe(payload?.notes || payload?.sample?.notes || ''),
			action: toStringSafe(payload?.action || ''),
			error_message: toStringSafe(payload?.errorMessage || payload?.message || ''),
			error_stack: toStringSafe(payload?.errorStack || payload?.stack || ''),
			error_json: toStringSafe(payload?.errorJson || '')
		};

        if (window.emailjs?.send) {
            await window.emailjs.send(emailCfg.serviceId, templateId, params);
        }
	} catch (err) {
		console.error('Email notification failed:', err);
	}
}

// Also expose on window for inline scripts if needed
if (typeof window !== 'undefined') {
	window.sendEmailNotification = sendEmailNotification;
}


