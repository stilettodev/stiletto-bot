import pkg from '@itsukichan/baileys';
const {
  default: makeWASocket,
  Browsers,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = pkg;

import pino from 'pino';
import qrcode from 'qrcode-terminal';
import NodeCache from 'node-cache';

const logger = pino({ level: process.env.LOG_LEVEL || 'silent' });
const msgCache = new NodeCache();
const spamDetect = new NodeCache();
const startTime = Date.now();

const OWNER_NUMBER = (process.env.OWNER_NUMBER || '254708464426').replace(/\D/g, '');
const OWNER = `${OWNER_NUMBER}@s.whatsapp.net`;
const OWNER_NAME = process.env.OWNER_NAME || 'Stiletto';
const BOT_NAME = process.env.BOT_NAME || 'Stiletto Bot';
const PREFIX = process.env.BOT_PREFIX || '!';
const WEBSITE_URL = process.env.WEBSITE_URL || 'https://github.com/stilettodev/stiletto-bot';

const LINKS_REGEX = /(https?:\/\/[^\s]+|t\.me|wa\.me|chat\.whatsapp\.com)/i;
const MENU_BUTTON_ID = 'open_categories';

function extractMessageText(message = {}) {
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

function getUptimeSeconds() {
  return Math.floor((Date.now() - startTime) / 1000);
}

function getUptimeString() {
  const uptime = getUptimeSeconds();
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = uptime % 60;
  return `${hours}h ${mins}m ${secs}s`;
}

function buildMainMenu() {
  return {
    image: { url: 'https://i.imgur.com/stiletto-banner.jpg' },
    caption:
      `╭───❍ *${BOT_NAME.toUpperCase()}* ❍───\n` +
      `│ 🤖 Status: Online\n` +
      `│ 👑 Owner: ${OWNER_NAME}\n` +
      `│ ⚙️ Prefix: ${PREFIX}\n` +
      `│ ⏱️ Uptime: ${getUptimeString()}\n` +
      `╰──────────────────\n\n` +
      `Type *${PREFIX}categories* or tap button below for full command panel.`,
    footer: `Powered by ${BOT_NAME}`,
    templateButtons: [
      { quickReplyButton: { displayText: '📋 Open Command Panel', id: MENU_BUTTON_ID } },
      { urlButton: { displayText: '🌐 Website', url: WEBSITE_URL } },
      { urlButton: { displayText: '💬 Chat Owner', url: `https://wa.me/${OWNER_NUMBER}` } }
    ]
  };
}

function buildCategoriesList() {
  return {
    text: `✨ *${BOT_NAME} Command Panel*\nChoose a command category below:`,
    buttonText: 'Open Categories',
    sections: [
      {
        title: '🚀 Core Features',
        rows: [
          { title: 'Main Menu', description: 'Show starter panel', rowId: `${PREFIX}menu` },
          { title: 'AI Assistant', description: `${PREFIX}ai <question>`, rowId: `${PREFIX}ai what can you do` },
          { title: 'Poll', description: 'Send an instant group poll', rowId: `${PREFIX}poll` },
          { title: 'Feedback', description: 'Rate the bot quickly', rowId: `${PREFIX}feedback` }
        ]
      },
      {
        title: '🧰 Utility',
        rows: [
          { title: 'Ping', description: 'Check response speed', rowId: `${PREFIX}ping` },
          { title: 'Stats', description: 'Bot information', rowId: `${PREFIX}stats` },
          { title: 'Time', description: 'Current server time', rowId: `${PREFIX}time` },
          { title: 'Quote', description: 'Get a motivational quote', rowId: `${PREFIX}quote` },
          { title: 'Owner Contact', description: 'Show owner details', rowId: `${PREFIX}owner` }
        ]
      },
      {
        title: '🛡️ Group Admin',
        rows: [
          { title: 'Group Rules', description: 'Share anti-spam rules', rowId: `${PREFIX}rules` },
          { title: 'Tag All', description: 'Mention all group members', rowId: `${PREFIX}tagall` },
          { title: 'Hidden Tag', description: 'Silent mention all users', rowId: `${PREFIX}hidetag hello team` }
        ]
      },
      {
        title: '👑 Owner',
        rows: [
          { title: 'Broadcast', description: 'Send message to all groups', rowId: `${PREFIX}broadcast Update from owner` }
        ]
      }
    ]
  };
}

function getRandomQuote() {
  const quotes = [
    'Discipline beats motivation when motivation is low.',
    'Small progress every day compounds into big wins.',
    'Execution is the bridge between ideas and success.',
    'Consistency is your unfair advantage.',
    'Stay sharp. Build. Ship. Improve.'
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}

async function startStilettoBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./stiletto-session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`Scan QR Code - ${BOT_NAME}`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed (${statusCode || 'unknown'}). Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) startStilettoBot();
    } else if (connection === 'open') {
      console.log(`${BOT_NAME} is ONLINE`);
    }
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (!id?.endsWith('@g.us')) return;

    try {
      const metadata = await sock.groupMetadata(id);
      const groupName = metadata.subject;

      for (const user of participants) {
        if (action === 'add') {
          await sock.sendMessage(id, {
            image: { url: 'https://i.imgur.com/stiletto-welcome.jpg' },
            caption: `👋 *Welcome to ${groupName}*\n\n@${user.split('@')[0]}, enjoy your stay.`,
            mentions: [user]
          });
        }

        if (action === 'remove') {
          await sock.sendMessage(id, {
            text: `*@${user.split('@')[0]} left the group*\n\nGoodbye 👋`,
            mentions: [user]
          });
        }
      }
    } catch (error) {
      console.error('group-participants.update error:', error?.message || error);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message || m.key.fromMe || msgCache.get(m.key.id)) return;
    msgCache.set(m.key.id, true, 300);

    const from = m.key.remoteJid;
    if (!from) return;

    const sender = m.key.participant || from;
    const isGroup = from.endsWith('@g.us');
    const text = extractMessageText(m.message);
    const lower = text.toLowerCase();
    const isOwner = sender === OWNER;

    try {
      let metadata;
      let participant;
      const shouldFetchGroupContext = isGroup && (text || lower.includes(`${PREFIX}tagall`) || lower.includes(`${PREFIX}hidetag`));

      if (shouldFetchGroupContext) {
        metadata = await sock.groupMetadata(from);
        participant = metadata.participants.find((p) => p.id === sender);
      }

      const isAdmin = Boolean(participant?.admin);

      if (isGroup && text) {
        const hasLink = LINKS_REGEX.test(text);
        if (hasLink && !isAdmin && !isOwner) {
          if (spamDetect.get(sender)) {
            await sock.sendMessage(from, { delete: m.key });
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            await sock.sendMessage(from, {
              text: `🚫 Auto-kicked @${sender.split('@')[0]} for repeated link spam.`,
              mentions: [sender]
            });
          } else {
            spamDetect.set(sender, true, 12);
            await sock.sendMessage(from, { text: '⚠️ No external links allowed (warning 1/2).', quoted: m });
          }
          return;
        }
      }

      const isMenuTrigger = [
        'menu',
        'hi',
        'hello',
        'start',
        `${PREFIX}start`,
        `${PREFIX}menu`,
        `${PREFIX}help`,
        MENU_BUTTON_ID
      ].includes(lower);

      if (isMenuTrigger) {
        await sock.sendMessage(from, buildMainMenu(), { quoted: m });
        return;
      }

      if (lower === `${PREFIX}categories`) {
        await sock.sendMessage(from, buildCategoriesList(), { quoted: m });
        return;
      }

      if (lower === `${PREFIX}ping`) {
        const pingMs = Date.now() - (m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : Date.now());
        await sock.sendMessage(from, { text: `🏓 Pong!\n• Uptime: ${getUptimeString()}\n• Latency: ${Math.max(pingMs, 0)}ms` }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}uptime` || lower === `${PREFIX}stats`) {
        await sock.sendMessage(from, {
          text:
            `📊 *${BOT_NAME} Stats*\n` +
            `• Uptime: ${getUptimeString()}\n` +
            `• Owner: ${OWNER_NAME}\n` +
            `• Prefix: ${PREFIX}\n` +
            `• Runtime: Node.js`
        }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}owner`) {
        await sock.sendMessage(from, {
          text: `👑 *Owner*\nName: ${OWNER_NAME}\nNumber: +${OWNER_NUMBER}\nChat: https://wa.me/${OWNER_NUMBER}`
        }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}time`) {
        const now = new Date();
        await sock.sendMessage(from, {
          text: `🕒 Server time: ${now.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}`
        }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}quote`) {
        await sock.sendMessage(from, { text: `💡 ${getRandomQuote()}` }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}rules`) {
        await sock.sendMessage(from, {
          text:
            '*Group Rules*\n' +
            '1) No spam links\n' +
            '2) Respect everyone\n' +
            '3) No hate speech\n' +
            `4) Use ${PREFIX}menu for bot commands`
        }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}tagall`) {
        if (!isGroup) {
          await sock.sendMessage(from, { text: 'This command works in groups only.' }, { quoted: m });
          return;
        }
        if (!isAdmin && !isOwner) {
          await sock.sendMessage(from, { text: 'Admin-only command.' }, { quoted: m });
          return;
        }

        const mentions = metadata.participants.map((p) => p.id);
        const body = mentions.map((id) => `@${id.split('@')[0]}`).join(' ');
        await sock.sendMessage(from, { text: `📢 Attention everyone:\n\n${body}`, mentions }, { quoted: m });
        return;
      }

      if (lower.startsWith(`${PREFIX}hidetag`)) {
        if (!isGroup) {
          await sock.sendMessage(from, { text: 'This command works in groups only.' }, { quoted: m });
          return;
        }
        if (!isAdmin && !isOwner) {
          await sock.sendMessage(from, { text: 'Admin-only command.' }, { quoted: m });
          return;
        }

        const msg = text.slice(`${PREFIX}hidetag`.length).trim() || '📣 Admin announcement';
        const mentions = metadata.participants.map((p) => p.id);
        await sock.sendMessage(from, { text: msg, mentions }, { quoted: m });
        return;
      }

      if (lower.startsWith(`${PREFIX}broadcast`)) {
        if (!isOwner) {
          await sock.sendMessage(from, { text: 'Owner-only command.' }, { quoted: m });
          return;
        }

        const bcText = text.slice(`${PREFIX}broadcast`.length).trim();
        if (!bcText) {
          await sock.sendMessage(from, { text: `Usage: ${PREFIX}broadcast your message` }, { quoted: m });
          return;
        }

        const groups = await sock.groupFetchAllParticipating();
        const ids = Object.keys(groups);
        for (const id of ids) {
          await sock.sendMessage(id, { text: `📢 *BROADCAST FROM ${BOT_NAME.toUpperCase()}*\n\n${bcText}` });
        }
        await sock.sendMessage(from, { text: `✅ Broadcast sent to ${ids.length} groups.` }, { quoted: m });
        return;
      }

      if (lower === `${PREFIX}poll`) {
        await sock.sendMessage(from, {
          poll: {
            name: `Favorite ${BOT_NAME} feature?`,
            values: ['AI Assistant', 'Moderation', 'Interactive Menu', 'Group Tools', 'All of them'],
            selectableCount: 1
          }
        });
        return;
      }

      if (lower === `${PREFIX}catalog`) {
        await sock.sendMessage(from, {
          product: {
            productId: 'STILETTO2025',
            title: `${BOT_NAME} Pro`,
            description: 'Lifetime access • Premium support • Custom command setup',
            price: '4999',
            currencyCode: 'KES',
            productImage: { url: 'https://i.imgur.com/stiletto-banner.jpg' }
          },
          body: 'Exclusive offer for early users',
          footer: { text: `Contact ${OWNER_NAME} for full package` }
        });
        return;
      }

      if (lower === `${PREFIX}location`) {
        await sock.sendMessage(from, {
          location: {
            degreesLatitude: -1.2921,
            degreesLongitude: 36.8219,
            name: 'Nairobi, Kenya',
            address: 'Stiletto HQ'
          }
        });
        return;
      }

      if (lower === `${PREFIX}shop`) {
        await sock.sendMessage(from, {
          image: { url: 'https://i.imgur.com/stiletto-banner.jpg' },
          caption: `🛍️ *${BOT_NAME.toUpperCase()} PRO*\n\n✅ Lifetime license\n✅ Full source code\n✅ 24/7 support\n\nPrice: KES 4,999`,
          footer: 'Limited slots available',
          templateButtons: [
            { quickReplyButton: { displayText: '📩 I Want To Buy', id: `${PREFIX}owner` } },
            { quickReplyButton: { displayText: '📋 View Commands', id: `${PREFIX}categories` } },
            { urlButton: { displayText: '💬 Contact Owner', url: `https://wa.me/${OWNER_NUMBER}` } }
          ]
        });
        return;
      }

      if (lower === `${PREFIX}feedback`) {
        await sock.sendMessage(from, {
          text: `How would you rate *${BOT_NAME}*?`,
          buttons: [
            { buttonId: 'feedback_5', buttonText: { displayText: '⭐⭐⭐⭐⭐ Excellent' } },
            { buttonId: 'feedback_4', buttonText: { displayText: '⭐⭐⭐⭐ Great' } },
            { buttonId: 'feedback_3', buttonText: { displayText: '⭐⭐⭐ Good' } }
          ],
          headerType: 1
        }, { quoted: m });
        return;
      }

      if (lower === 'feedback_5' || lower === 'feedback_4' || lower === 'feedback_3') {
        await sock.sendMessage(from, { text: `🙏 Thanks for your rating! You selected: ${text}` }, { quoted: m });
        return;
      }

      if (lower.startsWith(`${PREFIX}ai `) || lower.startsWith('stiletto ')) {
        const question = text.slice(lower.startsWith(`${PREFIX}ai`) ? `${PREFIX}ai`.length : 8).trim();
        if (!question) {
          await sock.sendMessage(from, { text: `Usage: ${PREFIX}ai your question` }, { quoted: m });
          return;
        }

        await sock.sendMessage(from, { react: { text: '🤔', key: m.key } });

        const response = await fetch(`https://api.stiletto.dev/ai?ask=${encodeURIComponent(question)}`)
          .then((r) => r.text())
          .catch(() => `Stiletto says: "${question}" — interesting question! I'm still learning.`);

        await sock.sendMessage(from, { text: response }, { quoted: m });
        return;
      }

      if (m.message?.buttonsResponseMessage || m.message?.listResponseMessage || m.message?.templateButtonReplyMessage) {
        await sock.sendMessage(from, { text: `✅ Command received. Use ${PREFIX}menu to open the main panel.` }, { quoted: m });
      }
    } catch (error) {
      console.error('messages.upsert error:', error?.message || error);
      await sock.sendMessage(from, { text: '⚠️ Something went wrong while handling your command.' }, { quoted: m });
    }
  });
}

startStilettoBot().catch(console.error);
