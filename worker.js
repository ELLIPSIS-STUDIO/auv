// worker.js 完整代码
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const accountId = '6592cbf41fc387c0b2182315df4a86cd';
  const apiToken = 'h894T-l6xG6ZBCQOMs2Cwp_lJCeeBurqP2wZh0Zl';
  const modelId = '@cf/stable-diffusion-xl';
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
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
}
