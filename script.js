const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Configuration
const CONFIG = {
  USE_API: true,
  API_KEY: 'configured_in_backend',
  API_TYPE: 'backend',
  BACKEND_URL: 'http://localhost:3000',
  API_URL: {
    backend: 'http://localhost:3000/api/chat',
    health: 'http://localhost:3000/api/health',
    test: 'http://localhost:3000/api/test'
  }
};

// Response templates
const responses = {
  greetings: [
    "Hello! How can I assist you today?",
    "Hi there! What would you like to know?",
    "Hey! I'm here to help. What's on your mind?",
    "Greetings! How may I be of service?"
  ],
  howAreYou: [
    "I'm doing great, thank you for asking! How are you?",
    "I'm functioning perfectly and ready to help! How about you?",
    "I'm excellent! Thanks for checking in. What can I do for you?"
  ],
  name: [
    "I'm JASS GPT, your AI assistant!",
    "You can call me JASS GPT. I'm here to help!",
    "I'm JASS GPT - your virtual AI companion!"
  ],
  weather: [
    "I can't access live weather data. Try weather.com or a weather app.",
    "Weather updates are best from your local weather app.",
    "I recommend checking weather websites for real-time data."
  ],
  time: [
    `The current time is: ${new Date().toLocaleTimeString()}`,
    `Right now it's ${new Date().toLocaleTimeString()}`,
    `The time is ${new Date().toLocaleTimeString()}`
  ],
  date: [
    `Today's date is: ${new Date().toLocaleDateString()}`,
    `Today is ${new Date().toLocaleDateString()}`,
    `The current date is ${new Date().toLocaleDateString()}`
  ],
  programming: [
    "I can help with programming! What language or problem are you working on?",
    "Programming is fun! Tell me what you're building.",
    "Need help with code? Let me know the language or error!"
  ],
  math: [
    "Need help with math? Give me the problem!",
    "Math is cool! What would you like me to solve?",
    "Give me the equation, and I’ll help you with it."
  ],
  help: [
    "I can help with general questions, math, programming, writing, and more!",
    "Need help? Ask me anything — programming, math, general info, or casual chat!",
    "I'm here to assist! Just type your question."
  ],
  thanks: [
    "You're welcome!",
    "Happy to help!",
    "Any time! Need anything else?"
  ],
  default: [
    "Can you tell me more about that?",
    "I'm here to help! Could you clarify your question?",
    "Interesting! Could you provide more context?",
    "Let’s explore that together. Could you expand a little?"
  ]
};

// Backend API call
async function callBackendAPI(message) {
  try {
    const response = await fetch(CONFIG.API_URL.backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) throw new Error('Backend authentication failed.');
      if (response.status === 429) throw new Error('Rate limit exceeded.');
      if (response.status === 500) throw new Error(`Backend error: ${errorData.message || 'Internal error'}`);
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.response) {
      return data.response;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('BACKEND_OFFLINE');
    }
    throw error;
  }
}

// Generate fallback response
function getFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)/)) {
    return getRandomResponse('greetings');
  }
  if (msg.match(/how are you|how's it going|how do you do/)) {
    return getRandomResponse('howAreYou');
  }
  if (msg.match(/what's your name|who are you|your name/)) {
    return getRandomResponse('name');
  }
  if (msg.match(/weather|temperature|rain|sunny|cloudy/)) {
    return getRandomResponse('weather');
  }
  if (msg.match(/what time|current time|time is it/)) {
    return getRandomResponse('time');
  }
  if (msg.match(/what date|today's date|what day/)) {
    return getRandomResponse('date');
  }
  if (msg.match(/programming|coding|code|javascript|python|html|css|development/)) {
    return getRandomResponse('programming');
  }
  if (msg.match(/math|calculate|equation|formula|number/)) {
    return getRandomResponse('math');
  }
  if (msg.match(/help|what can you do|capabilities|assist/)) {
    return getRandomResponse('help');
  }
  if (msg.match(/thank you|thanks|appreciate/)) {
    return getRandomResponse('thanks');
  }

  // Simple math handling
  if (msg.match(/^\d+\s*[\+\-\*\/]\s*\d+$/)) {
    try {
      const result = eval(msg.replace(/[^\d\+\-\*\/\.]/g, ''));
      return `The answer is: ${result}`;
    } catch (e) {
      return "I couldn't calculate that. Try a simpler math expression.";
    }
  }

  return getRandomResponse('default');
}

// Get random fallback response
function getRandomResponse(category) {
  const responseArray = responses[category];
  return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Get AI response from backend or fallback
async function getAIResponse(userMessage) {
  try {
    if (CONFIG.USE_API && CONFIG.API_TYPE === 'backend') {
      return await callBackendAPI(userMessage);
    } else {
      return getFallbackResponse(userMessage);
    }
  } catch (error) {
    if (error.message === 'BACKEND_OFFLINE') {
      console.warn('Backend offline, using fallback.');
      return getFallbackResponse(userMessage);
    }
    console.error('API Error:', error);
    return "Sorry, I couldn't process that. Try again!";
  }
}

// Chat interface functions
function addMessage(content, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
  avatar.textContent = isUser ? 'U' : 'AI';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot typing-indicator';
  typingDiv.id = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar bot-avatar';
  avatar.textContent = 'AI';

  const typingContent = document.createElement('div');
  typingContent.className = 'message-content';

  const typingDots = document.createElement('div');
  typingDots.className = 'typing-dots';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    typingDots.appendChild(dot);
  }

  typingContent.appendChild(typingDots);
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(typingContent);

  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) typingIndicator.remove();
}

// Submit handler
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  userInput.value = '';

  showTypingIndicator();

  try {
    const aiResponse = await getAIResponse(message);
    removeTypingIndicator();
    addMessage(aiResponse, false);
  } catch (error) {
    removeTypingIndicator();
    addMessage("Oops! Something went wrong.", false);
  }
});

// Focus input on load
window.addEventListener('load', () => {
  userInput.focus();
});
