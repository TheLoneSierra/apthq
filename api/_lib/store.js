/** Shared in-memory store (persists while a serverless instance stays warm). */

export let currentBrokerConfig = {
  key: 'tradesmart',
  typography: { fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  colors: { primary: '#8b5cf6', background: '#0b0f19', card: '#111827' },
}

export let allBrokerConfigs = [
  {
    brokerName: 'tradesmart',
    config: {
      key: 'tradesmart',
      typography: { fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif' },
      colors: { primary: '#8b5cf6', surface: '#1e1b4b' },
    },
  },
  {
    brokerName: 'smc',
    config: {
      key: 'smc',
      typography: { fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif' },
      colors: { primary: '#3b82f6', surface: '#172554' },
    },
  },
  {
    brokerName: 'navia',
    config: {
      key: 'navia',
      typography: { fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif' },
      colors: { primary: '#f59e0b', surface: '#451a03' },
    },
  },
  {
    brokerName: 'bajaj',
    config: {
      key: 'bajaj',
      typography: { fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif' },
      colors: { primary: '#ef4444', surface: '#450a0a' },
    },
  },
]

export function setCurrentBrokerConfig(config) {
  currentBrokerConfig = { ...config }
  return currentBrokerConfig
}

export function setAllBrokerConfigs(configs) {
  allBrokerConfigs = configs
  return allBrokerConfigs
}

export function upsertBrokerConfigs(entries) {
  for (const item of entries) {
    const idx = allBrokerConfigs.findIndex(
      (b) => b.brokerName.toLowerCase() === item.brokerName.toLowerCase(),
    )
    if (idx >= 0) allBrokerConfigs[idx].config = item.config
    else allBrokerConfigs.push(item)
  }
  return allBrokerConfigs
}
