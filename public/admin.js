// /public/admin.js

async function loadStats() {
    try {
      const res = await fetch('/admin/stats');
      if (res.status === 401) {
        window.location.href = '/admin';
      }
  
      const data = await res.json();
      document.getElementById('activeUsers').innerText = data.activeUsers;
      document.getElementById('totalMessages').innerText = data.totalMessages;
      document.getElementById('serverUptime').innerText = Math.floor(data.serverUptime) + " sec";
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  }
  
  // Refresh every 5 sec
  setInterval(loadStats, 5000);
  loadStats();
  