addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const accountId = '6592cbf41fc387c0b2182315df4a86cd'; // 替换为你的 Cloudflare 账户 ID
    const modelId = '@cf/stable-diffusion-xl'; // 根据实际选择的模型修改
    const apiToken = 'h894T-l6xG6ZBCQOMs2Cwp_lJCeeBurqP2wZh0Zl'; // 你的 API 令牌
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    };
    const response = await fetch(apiUrl, {
        method: request.method,
        headers: headers,
        body: request.body
    });
    return new Response(response.body, {
        status: response.status,
        headers: response.headers
    });
}
