export function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export function sendJson(res, statusCode, body) {
  applyCors(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.status(statusCode).json(body)
}

export function requireAuth(req, res) {
  if (!req.headers.authorization) {
    sendJson(res, 401, { success: false, message: 'Unauthorized: Missing token' })
    return false
  }
  return true
}

export async function readJsonBody(req) {
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body
  }

  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw.trim()) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON payload'))
      }
    })
    req.on('error', reject)
  })
}

export function filterConfigByType(config, configType) {
  if (!configType) return { ...config }
  const keys = configType.split(',').map((k) => k.trim())
  return Object.fromEntries(Object.entries(config).filter(([k]) => keys.includes(k)))
}
