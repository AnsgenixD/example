export default {
  base: 'https://torrent-search-api-livid.vercel.app/api/',

  // The core search logic, bound to the extension's internal context
  async performSearch(title, episode) {
    if (!title || typeof title !== 'string') return [];
    
    let query = title.replace(/[^\w\s-]/g, ' ').trim();
    if (episode !== undefined && episode !== null) {
      query += ` ${episode.toString().padStart(2, '0')}`;
    }

    // Direct API URL without any third-party allorigins wrapper
    const targetUrl = `${this.base}nyaasi/${encodeURIComponent(query)}`;

    try {
      let data;
      
      // Use Hayase's built-in request tunnel to completely bypass browser CORS
      if (typeof this.request === 'function') {
        const res = await this.request(targetUrl);
        // Hayase's request sometimes auto-parses, sometimes returns string
        data = typeof res === 'string' ? JSON.parse(res) : res;
      } else {
        // Fallback standard fetch just in case
        const response = await fetch(targetUrl);
        const text = await response.text();
        data = JSON.parse(text);
      }

      // Safeguard for Miru/Hayase API wrappers that nest data
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }

      if (!Array.isArray(data)) return [];

      return data.map(item => ({
        title: item.Name || 'Unknown Title',
        link: item.Magnet || '',
        hash: item.Magnet?.match(/btih:([A-Fa-f0-9]+)/)?.[1]?.toLowerCase() || '',
        seeders: Number(item.Seeders || 0),
        leechers: Number(item.Leechers || 0),
        downloads: Number(item.Downloads || 0),
        size: 0,
        date: item.DateUploaded ? new Date(item.DateUploaded) : new Date(),
        accuracy: 'medium',
        type: 'alt'
      }));

    } catch (error) {
      console.error(`[Nyaa Ext Exception]:`, error);
      return [];
    }
  },

  // Map the required Hayase hooks directly to our search function
  async single(payload) {
    const title = payload?.titles?.[0] || payload?.title || (typeof payload === 'string' ? payload : '');
    return this.performSearch(title, payload?.episode);
  },

  async batch(payload) {
    const title = payload?.titles?.[0] || payload?.title || (typeof payload === 'string' ? payload : '');
    return this.performSearch(title, null);
  },

  async movie(payload) {
    const title = payload?.titles?.[0] || payload?.title || (typeof payload === 'string' ? payload : '');
    return this.performSearch(title, null);
  },

  async test() {
    try {
      if (typeof this.request === 'function') {
        await this.request(`${this.base}nyaasi/one%20piece`);
        return true;
      }
      const res = await fetch(`${this.base}nyaasi/one%20piece`);
      return res.ok;
    } catch {
      return false;
    }
  }
};
