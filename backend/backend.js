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

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.toLowerCase() === '/start') {
    bot.sendPhoto(chatId, './spinscasino_thimbles_logo_standard.png', {
      caption: 'Welcome to SpinsCasino Thimbles game hack - 🤖AI Thimbles prediction mini-app\nTo start the mini-app, press the button below 👇',
      reply_markup: {
        inline_keyboard: [[
          { text: 'Open App', web_app: { url: 'https://spinsthimbles.netlify.app/' } }]
        ]
      }
    });
  }
});
