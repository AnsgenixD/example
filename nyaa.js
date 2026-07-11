export default class Nyaa {
  base = 'https://torrent-search-api-livid.vercel.app/api/'

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }

  batch = async (args) => this.single(args)
  movie = async (args) => this.single(args)

  async search(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`

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

  async test() {
    try {
      const testUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.base + 'nyaasi/one%20piece')}`
      const res = await window.fetch(testUrl)
      return res.ok
    } catch {
      return false
    }
  }
}
