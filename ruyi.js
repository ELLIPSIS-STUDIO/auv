addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    // 已替换为你提供的值
    const accountId = '6592cbf41fc387c0b2182315df4a86cd'; 
    const apiToken = 'h894T-l6xG6ZBCQOMs2Cwp_lJCeeBurqP2wZh0Zl';
    const modelId = '@cf/stable-diffusion-xl'; // 这里先固定为Stable Diffusion XL，你可按需修改
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
