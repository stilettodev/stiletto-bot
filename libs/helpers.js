export function extractMessageText(message = {}) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.buttonsResponseMessage?.selectedDisplayText ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.listResponseMessage?.title ||
    message.templateButtonReplyMessage?.selectedId ||
    message.templateButtonReplyMessage?.selectedDisplayText ||
    ''
  ).trim();
}

export function getUptimeString(startTime) {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = uptime % 60;
  return `${hours}h ${mins}m ${secs}s`;
}

export function getRandomQuote() {
  const quotes = [
    'Discipline beats motivation when motivation is low.',
    'Small progress every day compounds into big wins.',
    'Execution is the bridge between ideas and success.',
    'Consistency is your unfair advantage.',
    'Stay sharp. Build. Ship. Improve.'
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}
