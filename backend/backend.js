const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const token = '8146098580:AAEqoayiC3Y6u-xtmoToK0LW4ilxc1O6RUE';
const bot = new TelegramBot(token, { polling: true });

// Express app to listen to $PORT
const app = express();
const port = process.env.PORT || 3000; // Use the port assigned by Heroku or default to 3000


app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const admin = require('firebase-admin');
const express = require('express');

// Admin User ID (Replace with your own Telegram User ID)
const ADMIN_USER_IDS = [631028808, 926460821]; // Replace with your actual admin ID

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); // Add this to your environment
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore(); // Firestore database instance

// Store broadcast data temporarily
let broadcastData = {};

function isAdmin(userId) {
  return ADMIN_USER_IDS.includes(userId); // Check if the user ID is in the admin list
}

// Function to add a user to Firestore
async function addUser(userId) {
  const userRef = db.collection('users').doc(userId.toString());
  await userRef.set({ id: userId });
  console.log(`User ${userId} added to Firestore`);
}

// Function to get all users from Firestore
async function getAllUsers() {
  const snapshot = await db.collection('users').get();
  const users = snapshot.docs.map(doc => doc.data());
  return users.map(user => user.id); // Return array of user IDs
}

// Handles the /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Add user to Firestore when they start the bot
  await addUser(chatId);

  bot.sendPhoto(chatId, './spinscasino_thimbles_logo_standard.png', {
    caption: 'Welcome to SpinsCasino Thimbles game hack - 🤖AI Thimbles prediction mini-app\nTo start the mini-app, press the button below 👇',
    reply_markup: {
      inline_keyboard: [[
        { text: 'Open App', web_app: { url: 'https://spinsthimbles.netlify.app/' } }]
      ]
    }
  });
});

// Broadcast command for the admin to send a message to all users
bot.onText(/\/broadcast$/, (msg) => {
  const chatId = msg.chat.id;

  // Check if the user is one of the admins
  if (isAdmin(chatId)) {
    broadcastData[chatId] = { step: 'waiting_for_message' }; // Set the step to waiting for a message
    bot.sendMessage(chatId, "Send me the message you wish to broadcast.");
  } else {
    bot.sendMessage(chatId, "You are not authorized to broadcast.");
  }
});


// Handle incoming messages for broadcasting
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // If the admin is sending a message for broadcast
  if (isAdmin(chatId) && broadcastData[chatId] && broadcastData[chatId].step === 'waiting_for_message') {
    // Save the message (it could include text, photos, videos, etc.)
    broadcastData[chatId] = { message: msg, step: 'confirming' };

    // Send the message back to the admin for confirmation
    if (msg.text) {
      await bot.sendMessage(chatId, msg.text, { reply_markup: msg.reply_markup });
    } else if (msg.photo) {
      await bot.sendPhoto(chatId, msg.photo[0].file_id, { caption: msg.caption, reply_markup: msg.reply_markup });
    } else if (msg.video) {
      await bot.sendVideo(chatId, msg.video.file_id, { caption: msg.caption, reply_markup: msg.reply_markup });
    } else if (msg.video_note) {  // This is for Telegram circle video messages
      await bot.sendVideoNote(chatId, msg.video_note.file_id, { reply_markup: msg.reply_markup });
    } else if (msg.document) {
      await bot.sendDocument(chatId, msg.document.file_id, { caption: msg.caption, reply_markup: msg.reply_markup });
    } else if (msg.audio) {
      await bot.sendAudio(chatId, msg.audio.file_id, { caption: msg.caption, reply_markup: msg.reply_markup });
    }

    // Send the confirmation message with Approve and Decline buttons
    bot.sendMessage(chatId, "Is this the message you want to broadcast?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Approve✅', callback_data: 'approve_broadcast' }],
          [{ text: 'Decline❌', callback_data: 'decline_broadcast' }]
        ]
      }
    });
  }
});

// Handle Approve/Decline actions for broadcast
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // Check if the user is one of the admins
  if (isAdmin(chatId) && broadcastData[chatId]) {
    if (data === 'approve_broadcast') {
      const messageToBroadcast = broadcastData[chatId].message;

      // Get all users from Firestore
      const userIds = await getAllUsers();

      // Broadcast the message to all users
      userIds.forEach(userId => {
        if (messageToBroadcast.text) {
          bot.sendMessage(userId, messageToBroadcast.text, { reply_markup: messageToBroadcast.reply_markup });
        } else if (messageToBroadcast.photo) {
          bot.sendPhoto(userId, messageToBroadcast.photo[0].file_id, { caption: messageToBroadcast.caption, reply_markup: messageToBroadcast.reply_markup });
        } else if (messageToBroadcast.video) {
          bot.sendVideo(userId, messageToBroadcast.video.file_id, { caption: messageToBroadcast.caption, reply_markup: messageToBroadcast.reply_markup });
        } else if (messageToBroadcast.video_note) {  // Broadcasting Telegram circle video messages
          bot.sendVideoNote(userId, messageToBroadcast.video_note.file_id, { reply_markup: messageToBroadcast.reply_markup });
        } else if (messageToBroadcast.document) {
          bot.sendDocument(userId, messageToBroadcast.document.file_id, { caption: messageToBroadcast.caption, reply_markup: messageToBroadcast.reply_markup });
        } else if (messageToBroadcast.audio) {
          bot.sendAudio(userId, messageToBroadcast.audio.file_id, { caption: messageToBroadcast.caption, reply_markup: messageToBroadcast.reply_markup });
        }
      });

      // Notify the admin that the message was broadcasted
      bot.sendMessage(chatId, "Message successfully broadcasted to all users.");
      delete broadcastData[chatId]; // Clear the broadcast data
    } else if (data === 'decline_broadcast') {
      // Notify the admin that the broadcast was cancelled
      bot.sendMessage(chatId, "Broadcast cancelled. Send /broadcast to start again.");
      delete broadcastData[chatId]; // Clear the broadcast data
    }
  }
});