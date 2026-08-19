import { applyCors, sendJson } from '../../_lib/http.js'

function createSampleJwt(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      id: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    }),
  ).toString('base64url')
  return `${header}.${payload}.mockSignatureKey1234567890`
}

export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed' })
  }

  const userId = req.query.userId || 'default-user'
  const from = req.query.from || 'main'
  const token = createSampleJwt(userId)

  return sendJson(res, 200, {
    success: true,
    message: 'Login successful',
    token,
    accessToken: token,
    data: {
      token,
      user: {
        id: userId,
        name: `User ${userId}`,
        role: 'admin',
        source: from,
      },
    },
  })
}
