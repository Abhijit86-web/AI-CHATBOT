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

// Static responses
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
    "You can call me JASS GPT. I'm here to help you with various questions and tasks!",
    "I'm JASS GPT - an AI designed to assist and chat with you!"
  ],
  weather: [
    "I don't have access to real-time weather data, but you can check your local weather forecast on weather websites or apps!",
    "For current weather information, I'd recommend checking a reliable weather service like weather.com or your local weather app.",
    "I can't provide live weather updates, but weather apps on your phone usually have the most accurate current conditions!"
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
    "I can help with programming questions! What language or concept would you like to discuss?",
    "Programming is one of my favorite topics! What coding challenge can I help you with?",
    "I'd be happy to assist with programming. Are you working on something specific?"
  ],
  math: [
    "I can help with math problems! What calculation or concept do you need assistance with?",
    "Mathematics is fascinating! What math question can I help you solve?",
    "I'm ready to tackle some math with you! What's the problem you're working on?"
  ],
  help: [
    "I can help with a wide variety of topics including: general questions, math, programming, writing, explanations of concepts, and casual conversation. What would you like to explore?",
    "I'm here to assist with information, answer questions, help with problems, or just have a friendly chat. What interests you?",
    "I can provide information, explanations, help with tasks, answer questions, or simply chat. How would you like me to help?"
  ],
  thanks: [
    "You're very welcome! Happy to help!",
    "My pleasure! Feel free to ask anything else.",
    "Glad I could help! Is there anything else you'd like to know?"
  ],
  default: [
    "That's an interesting question! Could you tell me more about what you're looking for?",
    "I'd be happy to help! Can you provide a bit more context about what you need?",
    "Great question! Let me think about that... Could you elaborate a bit more?",
    "I'm here to help! What specific aspect of this would you like me to focus on?",
    "That's a thoughtful question. What would be most helpful for you to know about this topic?"
  ]
};

// Backend API function
async function callBackendAPI(message) {
  try {
    const response = await fetch(CONFIG.API_URL.backend, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend error: ${errorData.message || 'Internal server error'}`);
    }

    const data = await response.json();
    if (data.success && data.response) {
      return data.response;
    } else {
      throw new Error('Invalid response format from backend');
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('BACKEND_OFFLINE');
    }
    throw error;
  }
}

// Fallback advanced AI-like logic
async function generateAdvancedAIResponse(message) {
  const msg = message.toLowerCase().trim();

  await new Promise(resolve => setTimeout(resolve, 500));

  // Custom rules
  if (msg.includes('write') && msg.includes('code')) {
    return `I can help you write code! Based on "${message}", what language are you interested in?`;
  }

  if (msg.includes('how to') || msg.includes('tutorial')) {
    return `Here's a general approach for "${message}":\n1. Understand the basics\n2. Plan and break down the task\n3. Implement step by step. Want a specific example?`;
  }

  if (msg.includes('difference') || msg.includes('vs')) {
    return `Good comparison! "${message}" typically involves differences in speed, complexity, or use cases. Which aspect should I compare?`;
  }

  if (msg.match(/\d+\s*[\+\-\*\/]\s*\d+/)) {
    try {
      const result = eval(msg.replace(/[^\d\+\-\*\/\.]/g, ''));
      return `The result of "${message}" is ${result}`;
    } catch {
      return "That looks like a math expression, but I couldn't compute it.";
    }
  }

  return responses.default[Math.floor(Math.random() * responses.default.length)];
}

// Main API route
async function getAPIResponse(message) {
  try {
    if (CONFIG.API_TYPE === 'backend') {
      return await callBackendAPI(message);
    }
    return await generateAdvancedAIResponse(message);
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.message === 'BACKEND_OFFLINE') {
      return await generateAdvancedAIResponse(message);
    }
    return await generateAdvancedAIResponse(message);
  }
}

// Fallback without API
function getFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase();

  if (/^(hi|hello|hey|greetings)/.test(msg)) return getRandomResponse('greetings');
  if (/how are you/.test(msg)) return getRandomResponse('howAreYou');
  if (/your name|who are you/.test(msg)) return getRandomResponse('name');
  if (/weather|temperature/.test(msg)) return getRandomResponse('weather');
  if (/time/.test(msg)) return getRandomResponse('time');
  if (/date|day/.test(msg)) return getRandomResponse('date');
  if (/code|html|css|javascript|python/.test(msg)) return getRandomResponse('programming');
  if (/math|calculate|equation/.test(msg)) return getRandomResponse('math');
  if (/thank/.test(msg)) return getRandomResponse('thanks');
  if (/help/.test(msg)) return getRandomResponse('help');

  return getRandomResponse('default');
}

function getRandomResponse(category) {
  const arr = responses[category];
  return arr[Math.floor(Math.random() * arr.length)];
}

// UI message handling
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

  return typingDiv;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  if (typingIndicator) typingIndicator.remove();
}

// Form submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  userInput.value = '';

  const typingIndicator = showTypingIndicator();
  try {
    const aiResponse = await getAPIResponse(message);
    removeTypingIndicator();
    addMessage(aiResponse, false);
  } catch (error) {
    removeTypingIndicator();
    addMessage("Oops! Something went wrong. Please try again later.", false);
  }
});

window.addEventListener('load', () => {
  userInput.focus();
});
