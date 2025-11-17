module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testData = req.body;
    
    // Validate required fields
    if (!testData.name || !testData.results) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format and send Telegram message
    const message = formatTelegramMessage(testData);
    const telegramSent = await sendTelegramMessage(message);

    console.log('Test submission received:', {
      student: testData.name,
      score: testData.results.score,
      total: testData.results.total,
      timeSpent: testData.timeSpent
    });

    res.status(200).json({ 
      success: true, 
      message: 'Test submitted successfully',
      telegramSent: telegramSent
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

function formatTelegramMessage(testData) {
  const { name, timeSpent, results, testName } = testData;
  
  let message = `📚 *NEW TEST SUBMISSION* 📚\n\n`;
  message += `*Test:* ${testName}\n`;
  message += `*Student:* ${name}\n`;
  message += `*Time Spent:* ${timeSpent}\n`;
  message += `*Overall Score:* ${results.score}/${results.total} (${results.percentage}%)\n\n`;
  
  // Part 1: Prepositions Analysis
  message += `*📍 PART 1 - Prepositions of Time (${results.prepositionsScore}/${results.prepositionsTotal})*\n`;
  results.details.filter(q => q.section === 'prepositions').forEach(q => {
    const status = q.isCorrect ? '✅' : '❌';
    message += `${status} Q${q.questionId}: Your: "${q.userAnswer}" | Correct: "${q.correctAnswer}"\n`;
  });
  
  message += `\n*🔢 PART 2 - Quantifiers (${results.quantifiersScore}/${results.quantifiersTotal})*\n`;
  results.details.filter(q => q.section === 'quantifiers').forEach(q => {
    const status = q.isCorrect ? '✅' : '❌';
    message += `${status} Q${q.questionId}: Your: "${q.userAnswer}" | Correct: "${q.correctAnswer}"\n`;
  });
  
  // Performance Summary
  message += `\n*📊 PERFORMANCE SUMMARY*\n`;
  message += `Prepositions: ${results.prepositionsScore}/20 (${Math.round(results.prepositionsScore/20*100)}%)\n`;
  message += `Quantifiers: ${results.quantifiersScore}/5 (${Math.round(results.quantifiersScore/5*100)}%)\n`;
  message += `Overall: ${results.percentage}% - ${getPerformanceText(results.percentage)}\n\n`;
  message += `*Timestamp:* ${new Date().toLocaleString()}`;
  
  return message;
}

function getPerformanceText(percentage) {
  if (percentage >= 90) return 'Excellent! 🎉';
  if (percentage >= 80) return 'Very Good! 👍';
  if (percentage >= 70) return 'Good! 😊';
  if (percentage >= 60) return 'Satisfactory 👌';
  return 'Needs Improvement 📖';
}

async function sendTelegramMessage(message) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram credentials not set. Message would be:', message);
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    console.log('Message sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}
