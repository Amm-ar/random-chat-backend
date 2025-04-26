const socket = io('http://localhost:3000'); // Change if server is deployed somewhere else

const chatBox = document.getElementById('chat-box');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const connectBtn = document.getElementById('connect-btn');

let waitingForConfirmation = false;
let pendingMessage = '';

// Scroll chat to the bottom
function scrollChatToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Add message to chat box
function addMessage(sender, message, isSystem = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = isSystem
        ? `<small class="text-muted">${message}</small>`
        : `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageDiv);
    scrollChatToBottom();
}

// Connect to random stranger
connectBtn.addEventListener('click', () => {
    socket.emit('ready');
    addMessage('System', 'Looking for a stranger...', true);
    connectBtn.disabled = true;
});

// Handle form submit
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    if (waitingForConfirmation) {
        alert('Please confirm sending the previous message first.');
        return;
    }

    socket.emit('send_message', message);
    messageInput.value = '';
});

// Receive messages
socket.on('receive_message', ({ sender, message }) => {
    addMessage(sender, message);
});

// Personal info warning
socket.on('personal_info_warning', ({ originalMessage, warning }) => {
    if (confirm(`${warning}\n\nDo you want to send it anyway?`)) {
        socket.emit('confirm_send', originalMessage);
    } else {
        addMessage('System', 'Message canceled.', true);
    }
});

// Start chat
socket.on('start_chat', ({ users }) => {
    addMessage('System', `Connected! You are chatting with: ${users.join(' and ')}`, true);
});

// Handle user left
socket.on('user_left', ({ message }) => {
    addMessage('System', message, true);
    connectBtn.disabled = false;
});

// Error messages
socket.on('error_message', (errorMsg) => {
    alert(errorMsg);
});

// Connection problems
socket.on('disconnect', () => {
    addMessage('System', 'Disconnected from server.', true);
    connectBtn.disabled = false;
});