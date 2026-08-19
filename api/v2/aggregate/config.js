import {
  currentBrokerConfig,
  setCurrentBrokerConfig,
} from '../../_lib/store.js'
import {
  applyCors,
  filterConfigByType,
  readJsonBody,
  requireAuth,
  sendJson,
} from '../../_lib/http.js'

export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return

    const data = filterConfigByType(currentBrokerConfig, req.query.config_type)
    return sendJson(res, 200, {
      success: true,
      message: 'Config fetched successfully',
      data,
    })
  }

  if (req.method === 'PATCH') {
    if (!requireAuth(req, res)) return

    try {
      const body = await readJsonBody(req)
      if (!body || typeof body !== 'object' || !Object.keys(body).length) {
        return sendJson(res, 400, {
          success: false,
          message: 'Config must contain at least one key',
        })
      }

      const data = setCurrentBrokerConfig(body)
      return sendJson(res, 200, {
        success: true,
        message: 'Config updated successfully',
        data,
      })
    } catch (err) {
      return sendJson(res, 400, {
        success: false,
        message: err instanceof Error ? err.message : 'Invalid request',
      })
    }
  }

  return sendJson(res, 405, { success: false, message: 'Method not allowed' })
}
