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

const logger = pino({ level: 'silent' });
const msgCache = new NodeCache();
const spamDetect = new NodeCache(); // Anti-spam
let startTime = Date.now();

const OWNER = '254708464426@s.whatsapp.net';
const OWNER_NAME = 'Stiletto';
const BOT_NAME = 'Stiletto Bot';

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
    markOnlineOnConnect: true
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('Scan QR Code - Stiletto Bot');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startStilettoBot();
    } else if (connection === 'open') {
      console.log('Stiletto Bot is ONLINE');
    }
  });

  // AUTO WELCOME & GOODBYE
  sock.ev.on('group-participants.update', async (event) => {
    const { id, participants, action } = event;
    if (!id.endsWith('@g.us')) return;

    try {
      const metadata = await sock.groupMetadata(id);
      const groupName = metadata.subject;

      for (const user of participants) {
        const ppUrl = await sock.profilePictureUrl(user).catch(() => 'https://i.imgur.com/default.jpg');

        if (action === 'add') {
          await sock.sendMessage(id, {
            image: { url: 'https://i.imgur.com/stiletto-welcome.jpg' }, // change if you have banner
            caption: `*Welcome to ${groupName}!*\n\n@${user.split('@')[0]} just joined\n\n*Powered by Stiletto Bot*`,
            mentions: [user]
          });
        }
        if (action === 'remove') {
          await sock.sendMessage(id, {
            text: `*@${user.split('@')[0]} left the group*\n\nGoodbye `,
            mentions: [user]
          });
        }
      }
    } catch (e) { }
  });

  // MAIN MESSAGE HANDLER
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe || msgCache.get(m.key.id)) return;
    msgCache.set(m.key.id, true, 300);

    const from = m.key.remoteJid;
    const sender = m.key.participant || from;
    const isGroup = from.endsWith('@g.us');
    const pushname = m.pushName || 'User';
    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || '').trim();
    const lower = text.toLowerCase();

    // ANTI-SPAM + ANTI-LINK (non-admin)
    if (isGroup && !m.key.fromMe) {
      const metadata = await sock.groupMetadata(from);
      const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
      const hasLink = /(https?:\/\/[^\s]+|t.me|wa.me|chat.whatsapp.com)/i.test(text);

      if (hasLink && !isAdmin) {
        if (spamDetect.get(sender)) {
          await sock.sendMessage(from, { delete: m.key });
          await sock.groupParticipantsUpdate(from, [sender], 'remove');
          await sock.sendMessage(from, { text: `Auto-kicked @${sender.split('@')[0]} for spamming links`, mentions: [sender] });
        } else {
          spamDetect.set(sender, true, 10);
          await sock.sendMessage(from, { text: 'No links allowed (1st warning)', quoted: m });
        }
        return;
      }
    }

    // OWNER ONLY COMMANDS
    const isOwner = sender === OWNER;

    if (lower === '!broadcast' && isOwner && m.message?.extendedTextMessage?.text) {
      const bcText = text.slice(10).trim();
      const groups = await sock.groupFetchAllParticipating();
      for (const [id] of Object.entries(groups)) {
        await sock.sendMessage(id, { text: `*BROADCAST FROM STILETTO*\n\n${bcText}` });
      }
      await sock.sendMessage(from, { text: 'Broadcast sent to all groups!' });
      return;
    }

    // MAIN MENU
    if (['!menu', 'menu', 'hi', 'hello', '!start'].includes(lower)) {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600), mins = Math.floor((uptime % 3600) / 60), secs = uptime % 60;

      await sock.sendMessage(from, {
        text: `*STILETTO BOT* is online!\n\n*Owner:* ${OWNER_NAME}\n*Prefix:* !\n*Uptime:* ${hours}h ${mins}m ${secs}s\n\nChoose a feature below `,
        footer: { text: '© 2025 Stiletto • All rights reserved' },
        templateButtons: [
          { urlButton: { displayText: 'Website', url: 'https://stiletto.page.gd' } },
          { urlButton: { displayText: 'X @stiletto_shell', url: 'https://x.com/stiletto_shell' } },
          { urlButton: { displayText: 'GitHub', url: 'https://github.com/stilettodev' } },
          { quickReplyButton: { displayText: 'All Features', id: 'menu_all' } }
        ]
      }, { quoted: m });
    }

    // ALL FEATURES LIST
    if (lower === '!categories' || m.message?.templateButtonReplyMessage?.selectedId === 'menu_all') {
      await sock.sendMessage(from, {
        text: 'Select a feature:',
        buttonText: 'Open Menu',
        sections: [
          {
            title: 'Interactive Features',
            rows: [
              { title: 'Native Poll', rowId: 'poll' },
              { title: 'Shop Catalog', rowId: 'catalog' },
              { title: 'Location', rowId: 'location' },
              { title: 'Hydrated Shop', rowId: 'shop' },
              { title: 'Feedback', rowId: 'feedback' }
            ]
          },
          {
            title: 'Owner Only',
            rows: [
              { title: 'Broadcast Message', rowId: 'owner_bc' },
              { title: 'Bot Stats', rowId: 'stats' }
            ]
          }
        ]
      });
    }

    // POLL
    if (lower === '!poll' || m.message?.listResponseMessage?.singleSelectReply?.selectedRowId === 'poll') {
      await sock.sendMessage(from, {
        poll: { name: 'Favorite Stiletto Bot feature?', values: ['Buttons', 'AI', 'Anti-Spam', 'Auto-Welcome', 'Catalog'], selectableCount: 1 }
      });
    }

    // CATALOG
    if (lower === '!catalog' || m.message?.listResponseMessage?.singleSelectReply?.selectedRowId === 'catalog') {
      await sock.sendMessage(from, {
        product: {
          productId: 'STILETTO2025',
          title: 'Stiletto Bot Pro',
          description: 'Lifetime access • All features • Custom commands',
          price: '4999',
          currencyCode: 'KES',
          productImage: { url: 'https://i.imgur.com/stiletto-banner.jpg' }
        },
        body: 'Exclusive offer for early users!',
        footer: { text: 'Contact @stiletto_shell on X' }
      });
    }

    // LOCATION
    if (lower === '!location') {
      await sock.sendMessage(from, {
        location: { degreesLatitude: -1.2921, degreesLongitude: 36.8219, name: 'Nairobi, Kenya', address: 'Stiletto HQ' }
      });
    }

    // HYDRATED SHOP
    if (lower === '!shop') {
      await sock.sendMessage(from, {
        image: { url: 'https://i.imgur.com/stiletto-banner.jpg' },
        caption: `*STILETTO BOT PRO*\n\n Lifetime license\n Full source code\n 24/7 support\n\nPrice: KES 4,999`,
        footer: { text: 'Limited slots available' },
        templateButtons: [
          { quickReplyButton: { displayText: 'Buy Now', id: 'buy' } },
          { urlButton: { displayText: 'Contact Owner', url: 'https://wa.me/254708464426' } }
        ]
      });
    }

    // FEEDBACK
    if (lower === '!feedback') {
      await sock.sendMessage(from, {
        text: 'Rate Stiletto Bot:',
        buttons: [
          { buttonId: '5star', buttonText: { displayText: '5 Stars' } },
          { buttonId: 'love', buttonText: { displayText: 'Love it' } },
          { buttonId: 'improve', buttonText: { displayText: 'Can improve' } }
        ],
        headerType: 1
      });
    }

    // FREE AI (using free Groq-style endpoint or fallback)
    if (lower.startsWith('!ai ') || lower.startsWith('stiletto ')) {
      const question = text.slice(lower.startsWith('!ai') ? 4 : 9).trim();
      await sock.sendMessage(from, { react: { text: 'Thinking', key: m.key } });

      const response = await fetch(`https://api.stiletto.dev/ai?ask=${encodeURIComponent(question)}`)
        .then(r => r.text())
        .catch(() => `Stiletto says: "${question}" — interesting question! I'm still learning. Ask me anything `);

      await sock.sendMessage(from, { text: response }, { quoted: m });
    }

    // HANDLE ALL RESPONSES
    if (m.message?.buttonsResponseMessage || m.message?.listResponseMessage || m.message?.templateButtonReplyMessage) {
      await sock.sendMessage(from, { text: 'Thank you for using Stiletto Bot!' });
    }
  });
}

startStilettoBot().catch(console.error);
