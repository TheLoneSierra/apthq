import { allBrokerConfigs, upsertBrokerConfigs } from '../../_lib/store.js'
import {
  applyCors,
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

    const brokersFilter = req.query.brokers
    const configType = req.query.config_type

    let rows = allBrokerConfigs.map((b) => ({ ...b, config: { ...b.config } }))

    if (brokersFilter) {
      const brokersList = brokersFilter.split(',').map((b) => b.trim().toLowerCase())
      rows = rows.filter((r) => brokersList.includes(r.brokerName.toLowerCase()))
    }

    if (configType) {
      const keys = configType.split(',').map((k) => k.trim())
      rows = rows.map((r) => ({
        ...r,
        config: Object.fromEntries(
          Object.entries(r.config).filter(([k]) => keys.includes(k)),
        ),
      }))
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Configs fetched successfully',
      data: rows,
    })
  }

  if (req.method === 'PATCH') {
    if (!requireAuth(req, res)) return

    try {
      const body = await readJsonBody(req)
      if (!body.configs || !Array.isArray(body.configs) || !body.configs.length) {
        return sendJson(res, 400, { success: false, message: 'configs array required' })
      }

      const names = body.configs.map((c) => c.brokerName?.toLowerCase())
      if (new Set(names).size !== names.length) {
        return sendJson(res, 400, { success: false, message: 'Duplicate brokerName in configs' })
      }

      for (const item of body.configs) {
        if (!item.brokerName?.trim()) {
          return sendJson(res, 400, { success: false, message: 'Each config must have a brokerName' })
        }
        if (!item.config || !Object.keys(item.config).length) {
          return sendJson(res, 400, {
            success: false,
            message: `Config for ${item.brokerName} must contain at least one key`,
          })
        }
      }

      const data = upsertBrokerConfigs(body.configs)
      return sendJson(res, 200, {
        success: true,
        message: 'Configs updated successfully',
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
