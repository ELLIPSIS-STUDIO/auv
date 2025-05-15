generateImageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 显示加载状态
  initialState.classList.add('hidden');
  generatedImageDiv.classList.add('hidden');
  errorState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  
  try {
    // 获取表单数据
    const formData = new FormData(generateImageForm);
    const prompt = formData.get('prompt').trim();
    if (!prompt) throw new Error('请输入提示词');
    
    // 构建请求体
    const requestBody = {
      prompt: formData.get('enhance') === 'on' 
        ? `masterpiece, high quality, detailed, ${prompt}` 
        : prompt,
      num_inference_steps: parseInt(formData.get('numSteps')),
      width: parseInt(formData.get('size').split('x')[0]),
      height: parseInt(formData.get('size').split('x')[1]),
      guidance_scale: 7.5
    };
    
    // 构建通过 Workers 代理的请求 URL
    const modelMap = {
      'model1': '@cf/stable-diffusion-xl',
      'model2': '@cf/stable-diffusion-512',
      'model3': '@cf/stable-diffusion-768'
    };
    
    const selectedModel = modelMap[formData.get('model')] || '@cf/stable-diffusion-xl';
    const requestUrl = `${workersUrl}/ai/run/${selectedModel}`;
    
    // 发送请求（移除 Authorization 头，由 Workers 处理）
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // 处理响应
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.errors?.[0]?.message || `请求失败: ${response.status}`);
    }
    
    const result = await response.json();
    if (result && result.result && result.result.image) {
      generatedImageDiv.classList.remove('hidden');
      imageDisplay.src = `data:image/png;base64,${result.result.image}`;
    } else {
      throw new Error('无效的 API 响应');
    }
  } catch (error) {
    console.error('生成失败:', error);
    errorMessage.textContent = error.message || '生成失败，请重试';
    errorState.classList.remove('hidden');
  } finally {
    loadingState.classList.add('hidden');
  }
});
