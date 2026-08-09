export const getAPI = () => {
	if (import.meta.env.MODE === 'development') {
		return 'http://127.0.0.1:8080';
	}
	return 'https://vale-studio-d7g9t.ondigitalocean.app';
};

export const query = async (endpoint = '', data = {}) => {
	try {
		const resp = await fetch(`${getAPI()}/${endpoint}`, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
		});
		if (!resp.ok) {
			return { serverError: await resp.text() };
		}
		return await resp.json();
	} catch (err) {
		return { serverError: err };
	}
};

export const search = async (query: string) => {
	// Bounded so a hung request fails instead of spinning forever: the caller
	// can only tell the visitor something is wrong once the promise settles.
	return fetch(`https://vale.sh/.netlify/functions/search?q=${encodeURIComponent(query)}`, {
		signal: AbortSignal.timeout(8000)
	});
};
