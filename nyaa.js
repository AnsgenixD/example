export default class Nyaa {
  base = 'https://torrent-search-api-livid.vercel.app/api/'

  // Overriding standard search hooks natively as methods
  async search(kw, page, filter) {
    if (!kw) return []
    
    // Clean the search query string
    let query = kw.replace(/[^\w\s-]/g, ' ').trim()

    const cleanQuery = encodeURIComponent(query)
    const targetUrl = `${this.base}nyaasi/${cleanQuery}`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`

    try {
      const response = await window.fetch(proxyUrl)
      if (!response.ok) return []

      const textData = await response.text()
      if (!textData) return []

      const data = JSON.parse(textData)
      if (!Array.isArray(data)) return []

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
      }))

    } catch (error) {
      console.error(`[Nyaa Ext Exception]:`, error)
      return []
    }
  }

  // Map individual, batch, and movie requests directly into the core search method
  async single(kw) {
    return this.search(kw)
  }

  async batch(kw) {
    return this.search(kw)
  }

  async movie(kw) {
    return this.search(kw)
  }
}
