# English Grammar Test

A web-based English grammar test with automated Telegram reporting.

## Features

- 25 questions (20 prepositions of time + 5 quantifiers)
- Real-time timer
- Mobile-responsive design
- Comprehensive Telegram reports
- Easy deployment on Vercel

## Setup

### 1. Telegram Bot Setup

1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command and follow instructions
3. Save the bot token
4. Start a chat with your bot
5. Get your chat ID by visiting:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`

### 2. Deploy to Vercel

1. Upload all files to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in project settings:
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `TELEGRAM_CHAT_ID`: Your chat ID
4. Deploy!

### 3. Environment Variables

In Vercel project settings, add:
