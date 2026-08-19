export interface KeyValueEntry {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'color' | 'json'
}

export function isHexColor(val: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(val.trim())
}

/**
 * Flattens a nested object into a list of key-value entries with dot notation paths.
 * E.g. { colors: { primary: "#fff" } } => [{ key: "colors.primary", value: "#fff", type: "color" }]
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): KeyValueEntry[] {
  const result: KeyValueEntry[] = []

  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    const entryId = `${fullKey}_${Math.random().toString(36).slice(2, 7)}`

    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      const nested = flattenObject(v as Record<string, unknown>, fullKey)
      if (nested.length > 0) {
        result.push(...nested)
      } else {
        result.push({
          id: entryId,
          key: fullKey,
          value: '{}',
          type: 'json',
        })
      }
    } else if (Array.isArray(v)) {
      result.push({
        id: entryId,
        key: fullKey,
        value: JSON.stringify(v),
        type: 'json',
      })
    } else if (typeof v === 'number') {
      result.push({
        id: entryId,
        key: fullKey,
        value: String(v),
        type: 'number',
      })
    } else if (typeof v === 'boolean') {
      result.push({
        id: entryId,
        key: fullKey,
        value: String(v),
        type: 'boolean',
      })
    } else if (typeof v === 'string') {
      const isColor = isHexColor(v)
      result.push({
        id: entryId,
        key: fullKey,
        value: v,
        type: isColor ? 'color' : 'string',
      })
    } else {
      result.push({
        id: entryId,
        key: fullKey,
        value: v == null ? '' : String(v),
        type: 'string',
      })
    }
  }

  return result
}

function parseTypedValue(val: string, type: KeyValueEntry['type']): unknown {
  const trimmed = val.trim()
  if (type === 'number') {
    const num = Number(trimmed)
    return isNaN(num) ? trimmed : num
  }
  if (type === 'boolean') {
    if (trimmed.toLowerCase() === 'true') return true
    if (trimmed.toLowerCase() === 'false') return false
  }
  if (type === 'json') {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed
    }
  }
  return val
}

/**
 * Reconstructs a nested object from flattened dot-notated key-value entries.
 * E.g. [{ key: "colors.primary", value: "#fff" }] => { colors: { primary: "#fff" } }
 */
export function unflattenEntries(entries: KeyValueEntry[]): Record<string, unknown> {
  const root: Record<string, unknown> = {}

  for (const entry of entries) {
    const key = entry.key.trim()
    if (!key) continue

    const parsedVal = parseTypedValue(entry.value, entry.type)
    const parts = key.split('.').map((p) => p.trim()).filter(Boolean)
    if (!parts.length) continue

    let current: Record<string, unknown> = root
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (
        current[part] === undefined ||
        current[part] === null ||
        typeof current[part] !== 'object' ||
        Array.isArray(current[part])
      ) {
        current[part] = {}
      }
      current = current[part] as Record<string, unknown>
    }

    const lastPart = parts[parts.length - 1]
    current[lastPart] = parsedVal
  }

  return root
}
