import api from './axiosConfig.js';

// Backend reference currently does not expose a newsletter service.
// Keeping this client isolated so it can be wired quickly if that service is added later.
export const newsletterApi={ subscribe:(email)=>api.post('/api/newsletter/subscribe',{email}) };
