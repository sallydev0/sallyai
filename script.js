// script.js
document.addEventListener('DOMContentLoaded', () => {
  // ... (keep existing theme toggle code unchanged)

  // LLM Chat Code
  const userInput = document.getElementById('user-input');
  const askButton = document.getElementById('ask-button');
  const responseContainer = document.getElementById('response-container');

  async function getLLMResponse(userMessage) {
      try {
          const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
              method: 'POST',
              mode: 'cors', // Explicitly enable CORS mode
              headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({
                  model: "llama-3.2-3b-instruct",
                  messages: [
                      { "role": "system", "content": "Always answer like a lawyer." },
                      { "role": "user", "content": userMessage }
                  ],
                  temperature: 0.7,
                  max_tokens: -1,
                  stream: false
              })
          });

          if (!response.ok) {
              const errorBody = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorBody}`);
          }
          
          const data = await response.json();
          return data.choices[0]?.message?.content || "No response content found";

      } catch (error) {
          console.error('API Error:', error);
          return `Network Error: ${error.message}`;
      }
  }

  async function handleAsk() {
      const question = userInput.value.trim();
      if (!question) return;

      console.log('Submitting question:', question);
      responseContainer.innerHTML = '<div class="loading">Consulting legal statutes...</div>';
      userInput.value = '';
      askButton.disabled = true;

      try {
          const startTime = Date.now();
          const response = await getLLMResponse(question);
          const latency = Date.now() - startTime;

          console.log(`Received response in ${latency}ms:`, response);
          responseContainer.innerHTML = `
              <div class="response-content">
                  <div class="question">${question}</div>
                  <div class="answer">${response}</div>
              </div>
          `;
      } catch (error) {
          console.error('Handler Error:', error);
          responseContainer.innerHTML = `
              <div class="error">
                  Connection Failed:<br>
                  ${error.message}<br>
                  Ensure the LLM server is running at http://127.0.0.1:1234
              </div>
          `;
      } finally {
          askButton.disabled = false;
      }
  }

  // Event Listeners
  askButton.addEventListener('click', handleAsk);
  userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAsk();
  });
});