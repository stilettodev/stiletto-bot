export default {
  name: 'utility',
  commands: ['ping', 'stats', 'uptime', 'time', 'quote', 'owner'],
  async execute(ctx) {
    const { sock, from, text, config, getUptimeString, getRandomQuote, m } = ctx;
    const lower = text.toLowerCase();

    if (lower.includes('ping')) {
      const pingMs = Date.now() - (m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : Date.now());
      await sock.sendMessage(from, { text: `🏓 Pong!\n• Uptime: ${getUptimeString()}\n• Latency: ${Math.max(pingMs, 0)}ms` }, { quoted: m });
      return;
    }

    if (lower.includes('stats') || lower.includes('uptime')) {
      await sock.sendMessage(from, {
        text:
          `📊 *${config.botName} Stats*\n` +
          `• Uptime: ${getUptimeString()}\n` +
          `• Owner: ${config.ownerName}\n` +
          `• Prefix: ${config.prefix}\n` +
          `• Runtime: Node.js`
      }, { quoted: m });
      return;
    }

    if (lower.includes('owner')) {
      await sock.sendMessage(from, {
        text: `👑 *Owner*\nName: ${config.ownerName}\nNumber: +${config.ownerNumber}\nChat: https://wa.me/${config.ownerNumber}`
      }, { quoted: m });
      return;
    }

    if (lower.includes('time')) {
      const now = new Date();
      await sock.sendMessage(from, {
        text: `🕒 Server time: ${now.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}`
      }, { quoted: m });
      return;
    }

    await sock.sendMessage(from, { text: `💡 ${getRandomQuote()}` }, { quoted: m });
  }
};
