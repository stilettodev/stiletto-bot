function buildMainMenu(config, uptime) {
  return {
    image: { url: 'https://i.imgur.com/stiletto-banner.jpg' },
    caption:
      `╭───❍ *${config.botName.toUpperCase()}* ❍───\n` +
      `│ 🤖 Status: Online\n` +
      `│ 👑 Owner: ${config.ownerName}\n` +
      `│ ⚙️ Prefix: ${config.prefix}\n` +
      `│ ⏱️ Uptime: ${uptime}\n` +
      `╰──────────────────\n\n` +
      `Tap a button below or use *${config.prefix}categories* for full panel.`,
    footer: `Powered by ${config.botName}`,
    templateButtons: [
      { quickReplyButton: { displayText: '📋 Open Command Panel', id: `${config.prefix}categories` } },
      { urlButton: { displayText: '🌐 Website', url: config.websiteUrl } },
      { urlButton: { displayText: '💬 Chat Owner', url: `https://wa.me/${config.ownerNumber}` } }
    ]
  };
}

function buildCategories(config) {
  return {
    text: `✨ *${config.botName} Command Panel*\nChoose a command category below:`,
    buttonText: 'Open Categories',
    sections: [
      {
        title: '🚀 Core',
        rows: [
          { title: 'Menu', rowId: `${config.prefix}menu`, description: 'Show home layout' },
          { title: 'AI Assistant', rowId: `${config.prefix}ai what can you do`, description: 'Ask AI anything' },
          { title: 'Ping', rowId: `${config.prefix}ping`, description: 'Bot response speed' },
          { title: 'Extras 55+', rowId: `${config.prefix}extras`, description: 'Advanced utility command pack' }
        ]
      },
      {
        title: '👥 Group Tools',
        rows: [
          { title: 'Rules', rowId: `${config.prefix}rules`, description: 'Show group rules' },
          { title: 'Tag All', rowId: `${config.prefix}tagall`, description: 'Mention all members' },
          { title: 'Hidden Tag', rowId: `${config.prefix}hidetag hello team`, description: 'Silent mention all' }
        ]
      },
      {
        title: '🧩 Features',
        rows: [
          { title: 'Poll', rowId: `${config.prefix}poll`, description: 'Interactive poll' },
          { title: 'Shop', rowId: `${config.prefix}shop`, description: 'Offer card with buttons' },
          { title: 'Feedback', rowId: `${config.prefix}feedback`, description: 'Rate the bot' }
        ]
      }
    ]
  };
}

export default {
  name: 'menu',
  commands: ['menu', 'help', 'categories', 'hi', 'hello', 'start', 'open_categories'],
  async execute(ctx) {
    const { sock, from, text, config, getUptimeString, m } = ctx;

    if (text.toLowerCase().includes('categories')) {
      await sock.sendMessage(from, buildCategories(config), { quoted: m });
      return;
    }

    await sock.sendMessage(from, buildMainMenu(config, getUptimeString()), { quoted: m });
  }
};
