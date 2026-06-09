/**
 * Netlify serverless function: og-fetch
 * Fetches Open Graph metadata from a URL to avoid CORS issues on the client.
 *
 * Usage: /.netlify/functions/og-fetch?url=https://example.com
 */

export const handler = async (event) => {
  const { url } = event.queryStringParameters || {}

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing url parameter' }),
    }
  }

  // Basic URL validation
  let parsedUrl
  try {
    parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid URL' }),
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UsApp/1.0; +https://usapp.netlify.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: parsedUrl.hostname, image: null }),
      }
    }

    const html = await response.text()

    // Extract OG tags with simple regex (avoid heavy deps)
    const getOGTag = (property) => {
      const match =
        html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, 'i'))
      return match?.[1] || null
    }

    const getTitleTag = () => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      return match?.[1]?.trim() || null
    }

    const getTwitterImage = () => {
      const match =
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)
      return match?.[1] || null
    }

    const getFavicon = () => {
      const match =
        html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i)
      if (!match) return null
      const href = match[1]
      if (href.startsWith('http')) return href
      return `${parsedUrl.origin}${href.startsWith('/') ? '' : '/'}${href}`
    }

    const title = getOGTag('title') || getTitleTag() || parsedUrl.hostname
    const image = getOGTag('image') || getTwitterImage() || getFavicon()
    const description = getOGTag('description')

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        title: title?.substring(0, 200),
        image,
        description: description?.substring(0, 500),
        hostname: parsedUrl.hostname,
      }),
    }
  } catch (err) {
    // Graceful fallback — return hostname as title
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: parsedUrl.hostname, image: null }),
    }
  }
}
