// Proxy all /api/* requests to the backend serverless function
// This bypasses Vercel deployment protection by keeping requests on the frontend domain

const BACKEND_URL = process.env.BACKEND_URL || 'https://socialsphere-backend-46mqkbyo9-gigiberidzes-projects.vercel.app'

export default async function handler(req, res) {
  const { path = [] } = req.query
  const targetPath = Array.isArray(path) ? path.join('/') : path
  const url = `${BACKEND_URL}/api/${targetPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`

  try {
    const headers = {
      'Content-Type': 'application/json',
    }
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization

    const fetchOptions = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body)
    }

    const response = await fetch(url, fetchOptions)
    const contentType = response.headers.get('content-type') || ''

    res.status(response.status)
    if (contentType.includes('application/json')) {
      const data = await response.json()
      res.json(data)
    } else {
      const text = await response.text()
      res.send(text)
    }
  } catch (err) {
    console.error('Proxy error:', err.message)
    res.status(502).json({ message: 'Backend proxy error', error: err.message })
  }
}
