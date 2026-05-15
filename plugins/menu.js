import { sendButtons, sendInteractiveMessage } from 'baileys_helpers';

export function buildMainMenu(config, uptime) {
  return {
    text:
      `╭───❍ *${config.botName.toUpperCase()}* ❍───\n` +
      `│ 🤖 Status: Online\n` +
      `│ 👑 Owner: ${config.ownerName}\n` +
      `│ ⚙️ Prefix: ${config.prefix}\n` +
      `│ ⏱️ Uptime: ${uptime}\n` +
      `╰──────────────────\n\n` +
      `Tap a button below to navigate:`,
    footer: `Powered by ${config.botName}`,
    buttons: [
      { id: `${config.prefix}categories`, text: '📋 Command Panel' },
      { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '🌐 Website', url: config.websiteUrl }) },
      { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '💬 Chat Owner', url: `https://wa.me/${config.ownerNumber}` }) }
    ]
  };
}

export function buildCategories(config) {
  return {
    text: `✨ *${config.botName} Command Panel*\nChoose a command category below:`,
    footer: 'Navigate with ease',
    interactiveButtons: [
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '🚀 Core Commands',
          sections: [{
            title: 'Main Features',
            rows: [
              { id: `${config.prefix}menu`, title: '🏠 Menu', description: 'Show home layout' },
              { id: `${config.prefix}ai what can you do`, title: '🤖 AI Assistant', description: 'Ask AI anything' },
              { id: `${config.prefix}ping`, title: '⚡ Ping', description: 'Bot response speed' },
              { id: `${config.prefix}extras`, title: '🎁 Extras 55+', description: 'Advanced utility pack' }
            ]
          }]
        })
      },
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '👥 Group Tools',
          sections: [{
            title: 'Group Management',
            rows: [
              { id: `${config.prefix}rules`, title: '📜 Rules', description: 'Show group rules' },
              { id: `${config.prefix}tagall`, title: '🔊 Tag All', description: 'Mention all members' },
              { id: `${config.prefix}hidetag hello team`, title: '🤫 Hidden Tag', description: 'Silent mention' }
            ]
          }]
        })
      },
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: '🧩 Features',
          sections: [{
            title: 'Interactive Features',
            rows: [
              { id: `${config.prefix}poll`, title: '📊 Poll', description: 'Create interactive poll' },
              { id: `${config.prefix}shop`, title: '🛒 Shop', description: 'Offer card with buttons' },
              { id: `${config.prefix}feedback`, title: '⭐ Feedback', description: 'Rate the bot' }
            ]
          }]
        })
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
      await sendInteractiveMessage(sock, from, buildCategories(config), { quoted: m });
      return;
    }

    await sendButtons(sock, from, buildMainMenu(config, getUptimeString()), { quoted: m });
  }
};
