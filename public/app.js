// /public/app.js

const socket = io(); // Connect to server

// Connect to random stranger
function connectToStranger() {
  const language = document.getElementById('languageSelect').value;
  const tag = document.getElementById('tagSelect').value;
  socket.emit('find_partner', { language, tag });
  document.getElementById('chat-status').innerText = "Searching for a stranger...";
  clearChatBox();
}


// Disconnect from current partner
function disconnectFromStranger() {
  socket.emit('disconnect_from_partner');
  document.getElementById('chat-status').innerText = "Disconnected.";
  clearChatBox();
}

// Find new partner (disconnect first, then find new)
function findNewStranger() {
  socket.emit('disconnect_from_partner');
  clearChatBox();
  setTimeout(() => {
    connectToStranger();
  }, 500); // small delay to ensure server processes disconnect
}

// Clear chat messages
function clearChatBox() {
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = "";
}

function addMessage(content, sender = "you") {
  const chatBox = document.getElementById('chat-box');
  const bubble = document.createElement('div');
  bubble.className = `card p-2 mb-2 ${sender === "you" ? "bg-primary text-white text-end" : "bg-light text-start"}`;
  bubble.style.animation = "fadeIn 0.5s";
  bubble.innerText = (sender === "you" ? "You: " : "Stranger: ") + content;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Sending
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('send_message', { message });
    addMessage(message, "you");
    messageInput.value = '';
  }
}

// Receiving
socket.on('receive_message', (data) => {
  addMessage(data.message, "stranger");
});

// When partner found
socket.on('partner_found', () => {
  console.log('Partner found! You can start chatting.');
  document.getElementById('chat-status').innerText = "Connected to a stranger! Say Hi 👋";
});

// If partner left
socket.on('partner_left', () => {
  alert("Stranger disconnected. Try finding a new partner.");
  document.getElementById('chat-status').innerText = "Disconnected.";
});

// Send typing event
function notifyTyping() {
  socket.emit('typing');
}

document.getElementById('messageInput').addEventListener('input', notifyTyping);

// Show typing indicator
socket.on('partner_typing', () => {
  const typingStatus = document.getElementById('typing-status');
  typingStatus.innerText = "Stranger is typing...";
  clearTimeout(typingStatus.timer);
  typingStatus.timer = setTimeout(() => {
    typingStatus.innerText = "";
  }, 2000); // Hide after 2 sec of inactivity
});
