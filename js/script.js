const API_URL = 'http://localhost:8080/';
let HISTORY = [];
let currentConversationId = Date.now();
let requestInProgress = false;

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const modelSelect = document.getElementById('model');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const downloadBtn = document.getElementById('download-btn');
const modelPath = document.getElementById('model-path');
const temperatureInput = document.getElementById('temperature');
const temperatureSlider = document.getElementById('temperature-slider');
const systemPrompt = document.getElementById('system-prompt');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const conversationsList = document.getElementById('conversations-list');
const emptyConversations = document.getElementById('empty-conversations');
const connectionStatus = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');
const chatLoading = document.getElementById('chat-loading');

// Event Listeners
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        showTab(tabId);
    });
});

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

downloadBtn.addEventListener('click', downloadModel);

modelSelect.addEventListener('change', changeModel);

temperatureSlider.addEventListener('input', () => {
    temperatureInput.value = temperatureSlider.value;
});

temperatureInput.addEventListener('input', () => {
    temperatureSlider.value = temperatureInput.value;
});

// Functions
function showTab(tabId) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

async function checkConnection() {
    try {
        const response = await fetch(API_URL + 'models', { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
            connectionStatus.classList.add('connected');
            statusText.textContent = 'Connected to API';
            return true;
        } else {
            throw new Error('API responded with error');
        }
    } catch (err) {
        connectionStatus.classList.remove('connected');
        statusText.textContent = 'API connection failed';
        return false;
    }
}

async function loadModels() {
    if (!await checkConnection()) {
        addMessage('system', 'Error: Could not connect to API. Please check if the server is running.');
        return;
    }

    try {
        const res = await fetch(API_URL + 'models');
        if (!res.ok) throw new Error('Failed to fetch models');

        const data = await res.json();
        modelSelect.innerHTML = '<option value="">Select a model</option>';

        if (data.models && data.models.length > 0) {
            data.models.forEach(model => {
                modelSelect.innerHTML += `<option value="${model}">${model}</option>`;
            });
            addMessage('system', `${data.models.length} models available. Select one to start chatting.`);
        } else {
            addMessage('system', 'No models available. Download a model to get started.');
        }
    } catch (err) {
        console.error('Error loading models:', err);
        addMessage('error', `Could not load models: ${err.message}`);
    }
}

async function changeModel() {
    const modelName = modelSelect.value;
    if (!modelName) return;

    try {
        // Show loading state
        modelSelect.disabled = true;

        const response = await fetch(API_URL + 'load_model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model_name: modelName })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error && data.error.includes('already loaded')) {
                await unloadModel();
                return changeModel();
            }
            throw new Error(data.error || 'Unknown error loading model');
        }

        addMessage('system', `Model "${modelName}" loaded successfully!`);
        HISTORY = []; // Reset history when changing models
        currentConversationId = Date.now();
    } catch (err) {
        addMessage('error', `Error loading model: ${err.message}`);
    } finally {
        modelSelect.disabled = false;
    }
}

async function unloadModel() {
    try {
        await fetch(API_URL + 'unload_model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error unloading model:', err);
    }
}

function addMessage(type, content, authorOverride = null) {
    const messageType = type === 'user' ? 'user' :
        type === 'error' ? 'error' :
            type === 'system' ? 'system' : '';

    const author = authorOverride ||
        (type === 'user' ? 'You' :
            type === 'error' ? 'Error' :
                type === 'system' ? 'System' :
                    `RKLLAMA${modelSelect.value ? ` (${modelSelect.value})` : ''}`);

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageType}`;
    messageDiv.innerHTML = `<strong>${author}:</strong> ${content}`;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    return messageDiv;
}

async function sendMessage() {
    // Prevent double sending
    if (requestInProgress) return;

    const message = userInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!message) return;
    if (!selectedModel) {
        addMessage('error', 'Please select a model first');
        return;
    }

    // Add user message to chat
    addMessage('user', message);
    HISTORY.push({ role: 'user', content: message });
    userInput.value = '';

    // Prepare for sending
    requestInProgress = true;
    chatLoading.style.display = 'flex';

    try {
        const response = await fetch(API_URL + 'generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: HISTORY, stream: true })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate response');
        }

        // Create placeholder for streaming response
        const messageDiv = addMessage('assistant', '');
        const contentSpan = document.createElement('span');
        messageDiv.appendChild(contentSpan);

        // Stream response
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let assistantMessage = '';

        await readStream(reader, decoder, (chunk) => {
            try {
                const jsonChunk = JSON.parse(chunk);
                console.log(jsonChunk)
                assistantMessage += jsonChunk.response;
                contentSpan.textContent = assistantMessage;
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch (e) {
                console.error('Error parsing chunk:', e);
            }
        });

        // Update message with final content
        messageDiv.innerHTML = `<strong>RKLLAMA (${selectedModel}):</strong> ${assistantMessage}`;

        // Add to history and save conversation
        HISTORY.push({ role: 'assistant', content: assistantMessage });
        saveConversation();
    } catch (error) {
        addMessage('error', error.message);
    } finally {
        requestInProgress = false;
        chatLoading.style.display = 'none';
    }
}

async function downloadModel() {
    const path = modelPath.value.trim();
    const temp = parseFloat(temperatureInput.value);
    const system = systemPrompt.value.trim();

    if (!path) {
        modelPath.classList.add('error');
        return;
    }

    modelPath.classList.remove('error');
    downloadBtn.disabled = true;
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Preparing download...';

    const notificationMsg = addMessage('system', `Starting download of ${path}...`);

    try {
        const response = await fetch(API_URL + 'pull', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: path })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Download failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        await readStream(reader, decoder, (chunk) => {
            const percentage = parseFloat(chunk.trim());
            if (!isNaN(percentage)) {
                progressFill.style.width = `${percentage}%`;
                progressText.textContent = `${percentage.toFixed(1)}%`;
                notificationMsg.innerHTML = `<strong>System:</strong> Downloading ${path}... ${percentage.toFixed(1)}%`;
            }
        });

        // Extract model name from path
        const modelName = path.split('/').pop().replace('.rkllm', '');

        // Prepare payload for loading model
        const loadPayload = {
            model_name: modelName,
            temperature: temp
        };

        if (system) loadPayload.system = system;

        // Load the downloaded model
        const loadResponse = await fetch(API_URL + 'load_model', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loadPayload)
        });

        if (!loadResponse.ok) {
            const errorData = await loadResponse.json();
            throw new Error(errorData.error || 'Failed to load model after download');
        }

        // Update the model select dropdown
        await loadModels();
        modelSelect.value = modelName;

        addMessage('system', `Model "${modelName}" downloaded and loaded successfully!`);

        // Reset history for new model
        HISTORY = [];
        currentConversationId = Date.now();
    } catch (error) {
        addMessage('error', `Download failed: ${error.message}`);
    } finally {
        downloadBtn.disabled = false;
        progressContainer.style.display = 'none';
    }
}

async function readStream(reader, decoder, callback) {
    let done = false;
    let buffer = '';

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // Process complete JSON chunks
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last incomplete line in buffer

        for (const line of lines) {
            if (line.trim()) {
                callback(line);
            }
        }
    }

    // Process any remaining content
    if (buffer.trim()) {
        callback(buffer);
    }
}

function saveConversation() {
    // Only save if we have a conversation
    if (HISTORY.length < 2) return;

    const conversation = {
        id: currentConversationId,
        model: modelSelect.value,
        timestamp: new Date().toISOString(),
        messages: [...HISTORY]
    };

    let conversations = JSON.parse(localStorage.getItem('conversations') || '[]');

    // Update existing conversation or add new one
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
    } else {
        conversations.push(conversation);
    }

    // Sort by timestamp (newest first)
    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to last 50 conversations
    conversations = conversations.slice(0, 50);

    localStorage.setItem('conversations', JSON.stringify(conversations));
    loadConversations();
}

function loadConversations() {
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');

    if (conversations.length === 0) {
        emptyConversations.style.display = 'flex';
        return;
    }

    emptyConversations.style.display = 'none';
    conversationsList.innerHTML = '';

    conversations.forEach(conversation => {
        // Get first user message as title
        const firstUserMsg = conversation.messages.find(m => m.role === 'user');
        const title = firstUserMsg ? firstUserMsg.content : 'Untitled Conversation';

        // Format date
        const date = new Date(conversation.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        // Count messages
        const msgCount = conversation.messages.filter(m => m.role === 'user').length;

        const conversationEl = document.createElement('div');
        conversationEl.className = 'conversation';
        conversationEl.innerHTML = `
                    <div>${title.substring(0, 50)}${title.length > 50 ? '...' : ''}</div>
                    <div>
                        <span class="badge model">${conversation.model}</span>
                        <span class="badge messages">${msgCount} messages</span>
                    </div>
                    <div class="timestamp">${formattedDate}</div>
                `;

        conversationEl.addEventListener('click', () => {
            loadConversation(conversation);
        });

        conversationsList.appendChild(conversationEl);
    });
}

function loadConversation(conversation) {
    // Switch to chat tab
    showTab('chat');

    // Set the model if it's available
    if (modelSelect.querySelector(`option[value="${conversation.model}"]`)) {
        modelSelect.value = conversation.model;
    } else {
        // If model isn't available, show a warning
        addMessage('system', `Model "${conversation.model}" is not currently available. Please select another model.`);
    }

    // Set conversation history
    HISTORY = [...conversation.messages];
    currentConversationId = conversation.id;

    // Clear and rebuild chat
    chatBox.innerHTML = '';

    HISTORY.forEach(message => {
        if (message.role === 'user') {
            addMessage('user', message.content);
        } else if (message.role === 'assistant') {
            addMessage('assistant', message.content, `RKLLAMA (${conversation.model})`);
        }
    });
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    loadModels();
    loadConversations();

    userInput.focus();
});