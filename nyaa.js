const base = 'https://torrent-search-api-livid.vercel.app/api/';

// Isolated search function so it NEVER loses 'this' scope when Hayase calls it
async function performSearch(title, episode) {
  if (!title || typeof title !== 'string') return [];
  
  let query = title.replace(/[^\w\s-]/g, ' ').trim();
  if (episode !== undefined && episode !== null) {
    query += ` ${episode.toString().padStart(2, '0')}`;
  }

  const targetUrl = `${base}nyaasi/${encodeURIComponent(query)}`;
  // Proxy wrapper to bypass browser CORS on web players
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await window.fetch(proxyUrl);
    if (!response.ok) return [];

    const textData = await response.text();
    if (!textData) return [];

    const data = JSON.parse(textData);
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
}

// Exporting a plain object (Hayase's 'n.mod') with explicitly declared functions
export default {
  async single(payload) {
    // Safely extract the title whether Hayase passes { titles: ["..."] } or a raw string
    const title = payload?.titles?.[0] || payload?.title || (typeof payload === 'string' ? payload : '');
    return performSearch(title, payload?.episode);
  },

  async batch(payload) {
    const title = payload?.titles?.[0] || payload?.title || (typeof payload === 'string' ? payload : '');
    return performSearch(title, null);
  },

  async movie(payload) {
    const title = payload?.titles?.[0] || payload?.title || (typeof payload === 'string' ? payload : '');
    return performSearch(title, null);
  },

  async test() {
    try {
      const testUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(base + 'nyaasi/one%20piece')}`;
      const res = await window.fetch(testUrl);
      return res.ok;
    } catch {
      return false;
    }
  }
};
