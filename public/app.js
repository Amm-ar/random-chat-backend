// /public/app.js

const socket = io(); // Connect to backend

// Called when user clicks "Connect to Random Stranger"
function connectToStranger() {
  socket.emit('find_partner');
}

// When server finds a partner
socket.on('partner_found', () => {
  console.log('Partner found! You can start chatting.');
  document.getElementById('chat-status').innerText = "Connected to a stranger! Say Hi 👋";
});

// Receiving message from partner
socket.on('receive_message', (data) => {
  const chatBox = document.getElementById('chat-box');
  const messageDiv = document.createElement('div');
  messageDiv.innerText = "Stranger: " + data.message;
  chatBox.appendChild(messageDiv);
});

// Sending a message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('send_message', { message });
    const chatBox = document.getElementById('chat-box');
    const myMessage = document.createElement('div');
    myMessage.innerText = "You: " + message;
    chatBox.appendChild(myMessage);
    messageInput.value = '';
  }
}

// If partner leaves
socket.on('partner_left', () => {
  alert("Stranger disconnected. Try finding a new partner.");
  document.getElementById('chat-status').innerText = "Disconnected.";
});
