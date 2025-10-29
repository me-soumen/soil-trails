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
		const params = {
			to_email: emailCfg.toEmail || '',
			event_type: eventType,
			timestamp: nowIso,
			// Common optional fields safely mapped
			state_code: payload?.stateCode || payload?.state_code || '',
			sample_id: payload?.sampleId || payload?.sample_id || '',
			place: payload?.place || payload?.sample?.place || '',
			type: payload?.type || payload?.sample?.type || '',
			date: payload?.date || payload?.sample?.date || '',
			time: payload?.time || payload?.sample?.time || '',
			latitude: payload?.latitude ?? payload?.sample?.latitude ?? '',
			longitude: payload?.longitude ?? payload?.sample?.longitude ?? '',
			notes: payload?.notes || payload?.sample?.notes || '',
			action: payload?.action || '',
			error_message: payload?.errorMessage || payload?.message || '',
			error_stack: payload?.errorStack || payload?.stack || '',
			error_json: payload?.errorJson || ''
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


