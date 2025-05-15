addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const accountId = '6592cbf41fc387c0b2182315df4a86cd';
  const apiToken = 'h894T-l6xG6ZBCQOMs2Cwp_lJCeeBurqP2wZh0Zl';
  
  // 从请求 URL 中提取模型 ID（例如：请求路径为 /@cf/stable-diffusion-xl）
  const url = new URL(request.url);
  const modelId = url.pathname.split('/').filter(part => part)[0]; // 提取路径中的第一个非空部分
  
  if (!modelId) {
    return new Response('Missing model ID', { status: 400 });
  }

  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // 处理预检请求（OPTIONS）
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: request.body
    });

    // 克隆响应并添加 CORS 头
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*'
      }
    });

    return modifiedResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
