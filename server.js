/**
 * Local Backend Server for Apt HQ (/v2 APIs)
 *
 * Provides:
 * - POST  /v2/users/login?userId={userId}&from={from}
 * - GET   /v2/aggregate/config?config_type=...
 * - PATCH /v2/aggregate/config
 * - GET   /v2/aggregate/all_configs?brokers=...&config_type=...
 * - PATCH /v2/aggregate/all_configs
 *
 * Runs on http://localhost:3000
 */

import http from 'http';
import { URL } from 'url';

const PORT = 3000;

// In-memory broker configs store
let currentBrokerConfig = {
  key: 'tradesmart',
  typography: { fontSans: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  colors: { primary: '#8b5cf6', background: '#0b0f19', card: '#111827' },
};

let allBrokerConfigs = [
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
];

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(body));
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function createSampleJwt(userId) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      id: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    })
  ).toString('base64url');
  const signature = 'mockSignatureKey1234567890';
  return `${header}.${payload}.${signature}`;
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname, searchParams } = parsedUrl;

  console.log(`[API Server] ${req.method} ${pathname}${parsedUrl.search}`);

  // 1. POST /v2/users/login
  if (req.method === 'POST' && pathname === '/v2/users/login') {
    const userId = searchParams.get('userId') || 'default-user';
    const from = searchParams.get('from') || 'main';
    const token = createSampleJwt(userId);

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
    });
  }

  // 2. GET /v2/aggregate/config
  if (req.method === 'GET' && pathname === '/v2/aggregate/config') {
    const auth = req.headers.authorization;
    if (!auth) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized: Missing token' });
    }

    const configType = searchParams.get('config_type');
    let data = { ...currentBrokerConfig };
    if (configType) {
      const keys = configType.split(',').map((k) => k.trim());
      data = Object.fromEntries(Object.entries(data).filter(([k]) => keys.includes(k)));
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Config fetched successfully',
      data,
    });
  }

  // 3. PATCH /v2/aggregate/config
  if (req.method === 'PATCH' && pathname === '/v2/aggregate/config') {
    const auth = req.headers.authorization;
    if (!auth) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized: Missing token' });
    }

    try {
      const body = await parseRequestBody(req);
      if (!body || typeof body !== 'object' || !Object.keys(body).length) {
        return sendJson(res, 400, { success: false, message: 'Config must contain at least one key' });
      }

      currentBrokerConfig = { ...body };
      return sendJson(res, 200, {
        success: true,
        message: 'Config updated successfully',
        data: currentBrokerConfig,
      });
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // 4. GET /v2/aggregate/all_configs
  if (req.method === 'GET' && pathname === '/v2/aggregate/all_configs') {
    const auth = req.headers.authorization;
    if (!auth) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized: Missing token' });
    }

    const brokersFilter = searchParams.get('brokers');
    const configType = searchParams.get('config_type');

    let rows = allBrokerConfigs.map((b) => ({ ...b }));

    if (brokersFilter) {
      const brokersList = brokersFilter.split(',').map((b) => b.trim().toLowerCase());
      rows = rows.filter((r) => brokersList.includes(r.brokerName.toLowerCase()));
    }

    if (configType) {
      const keys = configType.split(',').map((k) => k.trim());
      rows = rows.map((r) => ({
        ...r,
        config: Object.fromEntries(Object.entries(r.config).filter(([k]) => keys.includes(k))),
      }));
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Configs fetched successfully',
      data: rows,
    });
  }

  // 5. PATCH /v2/aggregate/all_configs
  if (req.method === 'PATCH' && pathname === '/v2/aggregate/all_configs') {
    const auth = req.headers.authorization;
    if (!auth) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized: Missing token' });
    }

    try {
      const body = await parseRequestBody(req);
      if (!body.configs || !Array.isArray(body.configs) || !body.configs.length) {
        return sendJson(res, 400, { success: false, message: 'configs array required' });
      }

      for (const item of body.configs) {
        const idx = allBrokerConfigs.findIndex(
          (b) => b.brokerName.toLowerCase() === item.brokerName.toLowerCase()
        );
        if (idx >= 0) {
          allBrokerConfigs[idx].config = item.config;
        } else {
          allBrokerConfigs.push(item);
        }
      }

      return sendJson(res, 200, {
        success: true,
        message: 'Configs updated successfully',
        data: allBrokerConfigs,
      });
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // Fallback 404
  return sendJson(res, 404, {
    detail: 'Not Found',
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Apt HQ Backend Server running on http://localhost:${PORT}`);
  console.log(`   - POST  /v2/users/login?userId={userId}&from=main`);
  console.log(`   - GET   /v2/aggregate/config`);
  console.log(`   - PATCH /v2/aggregate/config`);
  console.log(`   - GET   /v2/aggregate/all_configs`);
  console.log(`   - PATCH /v2/aggregate/all_configs\n`);
});
