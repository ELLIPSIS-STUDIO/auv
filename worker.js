addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const workersRootUrl = 'https://ruyiai.3314078190.workers.dev'; // 定义 Workers 根 URL

  // 处理根路径：返回前端页面
  if (url.pathname === '/' || url.pathname === '') {
    return new Response(
      '<html>' +
      '<head>' +
        '<title>如意AI图像生成器</title>' +
        '<script src="https://cdn.tailwindcss.com"></script>' +
        '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">' +
      '</head>' +
      '<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">' +
        '<div class="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">' +
          '<div class="p-6">' +
            '<h1 class="text-3xl font-bold text-gray-800 mb-2">如意AI图像生成器</h1>' +
            '<p class="text-gray-600 mb-6">请使用下方表单生成AI图像</p>' +
            '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
              '<div class="lg:col-span-1 bg-gray-50 p-5 rounded-lg shadow-sm">' +
                '<h2 class="text-xl font-semibold mb-4">生成设置</h2>' +
                '<form id="generateImageForm">' +
                  '<div class="mb-4">' +
                    '<label for="prompt" class="block text-sm font-medium text-gray-700 mb-1">提示词:</label>' +
                    '<textarea id="prompt" name="prompt" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>' +
                  '</div>' +
                  '<div class="mb-4">' +
                    '<label for="model" class="block text-sm font-medium text-gray-700 mb-1">模型:</label>' +
                    '<select id="model" name="model" class="w-full px-3 py-2 border border-gray-300 rounded-md">' +
                      '<option value="model1">Stable Diffusion XL</option>' +
                      '<option value="model2">Stable Diffusion 512</option>' +
                      '<option value="model3">Stable Diffusion 768</option>' +
                    '</select>' +
                  '</div>' +
                  '<button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-md">生成图像</button>' +
                '</form>' +
              '</div>' +
              '<div class="lg:col-span-2 bg-gray-50 p-5 rounded-lg shadow-sm h-full">' +
                '<h2 class="text-xl font-semibold mb-4">生成结果</h2>' +
                '<div id="loadingState" class="hidden">' +
                  '<p class="text-gray-600">正在生成图片...</p>' +
                  '<div class="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div></div>' +
                '</div>' +
                '<div id="errorState" class="hidden text-red-500">生成失败，请重试</div>' +
                '<div id="generatedImage" class="hidden"><img id="imageDisplay" src="" alt="Generated Image" class="max-w-full rounded-lg shadow"></div>' +
                '<div id="initialState"><p class="text-gray-500">请输入提示词并点击"生成图像"按钮</p></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<script>' +
          'const workersUrl = "' + workersRootUrl + '";' + // 字符串拼接传递 URL
          'const form = document.getElementById("generateImageForm");' +
          'const modelMap = {' +
            '"model1": "@cf/stable-diffusion-xl",' +
            '"model2": "@cf/stable-diffusion-512",' +
            '"model3": "@cf/stable-diffusion-768"' +
          '};' +
          'form.addEventListener("submit", async (e) => {' +
            'e.preventDefault();' +
            'const prompt = document.getElementById("prompt").value.trim();' +
            'if (!prompt) throw new Error("请输入提示词");' +
            'const model = document.getElementById("model").value;' +
            'const selectedModel = modelMap[model] || "@cf/stable-diffusion-xl";' +
            'const requestUrl = workersUrl + "/ai/run/" + selectedModel;' + // 字符串拼接 URL
            'const requestBody = {' +
              'prompt: prompt,' +
              'num_inference_steps: 25,' +
              'width: 1024,' +
              'height: 1024' +
            '};' +
            'try {' +
              'const response = await fetch(requestUrl, {' +
                'method: "POST",' +
                'headers: { "Content-Type": "application/json" },' +
                'body: JSON.stringify(requestBody)' +
              '});' +
              'if (!response.ok) throw new Error("请求失败");' +
              'const result = await response.json();' +
              'if (result.result.image) {' +
                'document.getElementById("imageDisplay").src = "data:image/png;base64," + result.result.image;' +
                'document.getElementById("generatedImage").classList.remove("hidden");' +
              '}' +
            '} catch (error) {' +
              'document.getElementById("errorState").classList.remove("hidden");' +
              'console.error("生成失败:", error);' +
            '}' +
          '});' +
        '</script>' +
      '</body>' +
    '</html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // 处理 AI 生成请求路径（/ai/run/<model-id>）
  const pathParts = url.pathname.split('/').filter(part => part);
  if (pathParts.length < 3 || pathParts[0] !== 'ai' || pathParts[1] !== 'run') {
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ code: 7000, message: "No route for that URI" }]
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 提取模型 ID 并构建 Cloudflare API URL
  const modelId = pathParts[2];
  const accountId = '6592cbf41fc387c0b2182315df4a86cd';
  const apiToken = 'h894T-l6xG6ZBCQOMs2Cwp_lJCeeBurqP2wZh0Zl';
  const apiUrl = 
    'https://api.cloudflare.com/client/v4/accounts/' + 
    accountId + 
    '/ai/run/' + 
    modelId; // 字符串拼接 API URL

  // CORS 头部配置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // 处理预检请求（OPTIONS）
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 转发请求到 Cloudflare AI API
  try {
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiToken // 字符串拼接令牌
      },
      body: request.body
    });
    return new Response(response.body, {
      status: response.status,
      headers: { ...corsHeaders, ...response.headers }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ code: 5000, message: "Internal server error" }]
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
