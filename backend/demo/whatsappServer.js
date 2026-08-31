const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const SESSION_PATH = path.join(__dirname, '.wwebjs_auth');

let client = null;
let isClientReady = false;

// פונקציית השהייה אסינכרונית (אינה חוסמת את ה-Event Loop)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// פונקציה אסינכרונית למחיקת התיקייה ללא חסימת Node.js
async function deleteFolderAsync(folderPath, maxRetries = 5, delay = 1500) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (fs.existsSync(folderPath)) {
        await fs.promises.rm(folderPath, { recursive: true, force: true });
        console.log('🗑️ Session directory deleted successfully.');
      }
      return true;
    } catch (err) {
      if (err.code === 'EBUSY' && i < maxRetries - 1) {
        console.log(`⏳ File locked by Chrome, retrying deletion (${i + 1}/${maxRetries})...`);
        await sleep(delay);
      } else {
        console.error('⚠️ Could not delete session directory:', err.message);
        return false;
      }
    }
  }
  return false;
}

function createAndInitClient() {
  console.log('⚡ Initializing WhatsApp client...');

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'session-client' // שימוש ב-ID קבוע מונע התנגשויות נתיבים
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', (qr) => {
    console.log('📲 QR Code received, scan it with your phone:');
    qrcode.generate(qr, { small: true });
    isClientReady = false;
    io.emit('qr', qr);
  });

  client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    isClientReady = true;
    io.emit('ready');
  });

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated successfully');
  });

  client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failure:', msg);
    isClientReady = false;
  });

  client.on('disconnected', (reason) => {
    console.log('🚪 WhatsApp client disconnected:', reason);
    isClientReady = false;
  });

  client.on('message', async (msg) => {
    try {
      if (msg.from.includes('@g.us') || msg.isStatus) return;

      console.log(`📩 Private message from ${msg.from}: ${msg.body || '[מדיה/קובץ]'}`);

      const contact = await msg.getContact().catch(() => null);

      const messageData = {
        fromPhone: msg.from.replace('@c.us', ''),
        senderName: contact?.pushname || contact?.name || msg.from.replace('@c.us', ''),
        text: msg.body || '[הודעת מדיה]',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      io.emit('message_received', messageData);

    } catch (error) {
      console.error('⚠️ Error processing incoming message:', error.message);
    }
  });

  client.initialize().catch(err => {
    console.error('⚠️ Client initialization error:', err.message);
  });
}

// פונקציית האיפוס המתוקנת
async function resetWhatsAppSession() {
  console.log('🔴 Starting WhatsApp session reset...');
  isClientReady = false;

  if (client) {
    try {
      // סגירת בדפדפן באופן יזום אם סגירת ה-Client מתעכבת
      if (client.puppeteer && client.puppeteer.browser) {
        await client.puppeteer.browser.close().catch(() => {});
      }
      await client.destroy();
      console.log('✅ Client destroyed.');
    } catch (err) {
      console.log('Notice: Client destroy error (safe to ignore):', err.message);
    }
  }

  client = null;

  // השהייה אסינכרונית כדי לאפשר ל-Windows לשחרר נעילות קבצים
  console.log('⏳ Waiting 3 seconds for Chrome processes to terminate...');
  await sleep(3000);

  // מחיקת הקבצים בעזרת פונקציה אסינכרונית
  await deleteFolderAsync(SESSION_PATH);

  console.log('🔄 Re-initializing new WhatsApp client...');
  createAndInitClient();
}

// --- אירועי Socket.IO ---
io.on('connection', (socket) => {
  console.log('🔌 React client connected to Socket:', socket.id);

  if (isClientReady) {
    socket.emit('ready');
  }

  socket.on('send_message', async ({ toPhone, text }) => {
    try {
      if (!toPhone || !text || !client) return;

      let cleanPhone = toPhone.replace(/\D/g, '');
      if (cleanPhone.startsWith('05')) {
        cleanPhone = '972' + cleanPhone.slice(1);
      }

      const formattedNumber = `${cleanPhone}@c.us`;
      await client.sendMessage(formattedNumber, text);
      console.log(`📤 Message sent to ${formattedNumber}: ${text}`);
    } catch (err) {
      console.error('⚠️ Error sending message:', err.message);
    }
  });

  socket.on('logout', async () => {
    console.log('🔴 Logout requested from React client');
    await resetWhatsAppSession();
  });

  socket.on('disconnect', () => {
    console.log('🔌 React client disconnected from Socket:', socket.id);
  });
});

// הפעלה ראשונית
createAndInitClient();

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 WhatsApp Backend server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Caught uncaughtException:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});