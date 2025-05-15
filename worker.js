addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 处理根路径，返回前端页面
  if (url.pathname === '/' || url.pathname === '') {
    return new Response(`
      <html>
        <head>
          <title>如意AI图像生成器</title>
          <!-- 引入 Tailwind CSS 和 Font Awesome -->
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
          <div class="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="p-6">
              <h1 class="text-3xl font-bold text-gray-800 mb-2">如意AI图像生成器</h1>
              <p class="text-gray-600 mb-6">请使用下方表单生成AI图像</p>
              
              <!-- 表单和图像显示区域 -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 左侧控制面板 -->
                <div class="lg:col-span-1">
                  <div class="bg-gray-50 p-5 rounded-lg shadow-sm">
                    <h2 class="text-xl font-semibold mb-4">生成设置</h2>
                    <form id="generateImageForm">
                      <div class="mb-4">
                        <label for="prompt" class="block text-sm font-medium text-gray-700 mb-1">提示词:</label>
                        <textarea id="prompt" name="prompt" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"></textarea>
                      </div>
                      <div class="mb-4">
                        <label for="model" class="block text-sm font-medium text-gray-700 mb-1">模型:</label>
                        <select id="model" name="model" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                          <option value="model1">Stable Diffusion XL</option>
                          <option value="model2">Stable Diffusion 512</option>
                          <option value="model3">Stable Diffusion 768</option>
                        </select>
                      </div>
                      <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                        生成图像
                      </button>
                    </form>
                  </div>
                </div>
                
                <!-- 右侧结果展示 -->
                <div class="lg:col-span-2">
                  <div class="bg-gray-50 p-5 rounded-lg shadow-sm h-full">
                    <h2 class="text-xl font-semibold mb-4">生成结果</h2>
                    <div id="loadingState" class="hidden">
                      <p class="text-gray-600">正在生成图片...</p>
                      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
                      </div>
                    </div>
                    <div id="errorState" class="hidden text-red-500">
                      生成失败，请重试
                    </div>
                    <div id="generatedImage" class="hidden">
                      <img id="imageDisplay" src="" alt="Generated Image" class="max-w-full rounded-lg shadow">
                    </div>
                    <div id="initialState">
                      <p class="text-gray-500">请输入提示词并点击"生成图像"按钮</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script>
            // 配置 Workers URL
            const workersUrl = 'https://ruyiai.3314078190.workers.dev';
            
            // DOM 元素
            const form = document.getElementById('generateImageForm');
            const loadingState = document.getElementById('loadingState');
            const errorState = document.getElementById('errorState');
            const generatedImage = document.getElementById('generatedImage');
            const initialState = document.getElementById('initialState');
            const imageDisplay = document.getElementById('imageDisplay');
            
            // 模型映射表
            const modelMap = {
              'model1': '@cf/stable-diffusion-xl',
              'model2': '@cf/stable-diffusion-512',
              'model3': '@cf/stable-diffusion-768'
            };
            
            // 表单提交
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              // 显示加载状态
              initialState.classList.add('hidden');
              generatedImage.classList.add('hidden');
              errorState.classList.add('hidden');
              loadingState.classList.remove('hidden');
              
              try {
                const prompt = document.getElementById('prompt').value.trim();
                if (!prompt) throw new Error('请输入提示词');
                
                const model = document.getElementById('model').value;
                const selectedModel = modelMap[model] || '@cf/stable-diffusion-xl';
                
                // 构建请求体
                const requestBody = {
                  prompt: prompt,
                  num_inference_steps: 25,
                  width: 1024,
                  height: 1024
                };
                
                // 模拟进度条
                let progress = 0;
                const progressBar = loadingState.querySelector('div');
                const interval = setInterval(() => {
                  progress += 10;
                  if (progress > 100) progress = 100;
                  // 使用传统字符串拼接，避免模板字符串语法
                  progressBar.style.width = progress + '%';
                }, 300);
                
                // 发送请求
                const response = await fetch(`${workersUrl}/ai/run/${selectedModel}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestBody)
                });
                
                clearInterval(interval);
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData?.errors?.[0]?.message || '请求失败');
                }
                
                const result = await response.json();
                if (result && result.result && result.result.image) {
                  imageDisplay.src = 'data:image/png;base64,' + result.result.image;
                  generatedImage.classList.remove('hidden');
                } else {
                  throw new Error('无效的响应格式');
                }
              } catch (error) {
                console.error('生成失败:', error);
                errorState.textContent = '生成失败: ' + error.message;
                errorState.classList.remove('hidden');
              } finally {
                loadingState.classList.add('hidden');
              }
            });
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // 处理 AI 生成请求
  const pathParts = url.pathname.split('/').filter(part => part);
  
  // 验证路径格式：/ai/run/<model-id>
  if (pathParts.length < 3 || pathParts[0] !== 'ai' || pathParts[1] !== 'run') {
    return new Response(JSON.stringify({
      success: false,
      errors: [{ code: 7000, message: 'No route for that URI' }]
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const modelId = pathParts[2];
  const accountId = '6592cbf41fc387c0b2182315df4a86cd';
  const apiToken = 'h894T-l6xG6ZBCQOMs2Cwp_lJCeeBurqP2wZh0Zl';
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
  
  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
        ...corsHeaders
      }
    });
    
    return modifiedResponse;
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      errors: [{ code: 5000, message: 'Internal server error' }]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
