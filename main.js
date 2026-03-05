import path from 'node:path';
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

import { config, ownerJid } from './libs/config.js';
import { extractMessageText, getUptimeString, getRandomQuote } from './libs/helpers.js';
import { moderateGroupMessage } from './libs/moderation.js';
import { loadPlugins, runPlugins } from './libs/pluginLoader.js';

const logger = pino({ level: config.logLevel });
const msgCache = new NodeCache();
const spamDetect = new NodeCache();
const startTime = Date.now();

async function startStilettoBot() {
  const plugins = await loadPlugins(path.resolve('plugins'));

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
      console.log(`Scan QR Code - ${config.botName}`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed (${statusCode || 'unknown'}). Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) startStilettoBot();
    } else if (connection === 'open') {
      console.log(`${config.botName} is ONLINE`);
      console.log(`Loaded plugins: ${plugins.map((p) => p.name).join(', ')}`);
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
    const normalized = lower.startsWith(config.prefix) ? lower.slice(config.prefix.length).trim() : lower;
    const isOwner = sender === ownerJid;

    try {
      let groupMetadata = null;
      let isAdmin = false;

      if (isGroup) {
        groupMetadata = await sock.groupMetadata(from);
        const participant = groupMetadata.participants.find((p) => p.id === sender);
        isAdmin = Boolean(participant?.admin);
      }

      if (isGroup) {
        const blocked = await moderateGroupMessage({
          sock,
          spamDetect,
          from,
          sender,
          text,
          isAdmin,
          isOwner,
          msgKey: m.key,
          quoted: m
        });

        if (blocked) return;
      }

      const handled = await runPlugins({
        plugins,
        rawText: lower,
        normalizedText: normalized,
        ctx: {
          sock,
          from,
          sender,
          m,
          text: normalized,
          rawText: lower,
          config,
          isOwner,
          isGroup,
          isAdmin,
          groupMetadata,
          getUptimeString: () => getUptimeString(startTime),
          getRandomQuote
        }
      });

      if (!handled && (m.message?.buttonsResponseMessage || m.message?.listResponseMessage || m.message?.templateButtonReplyMessage)) {
        await sock.sendMessage(from, { text: `✅ Command received. Use ${config.prefix}menu to open the main panel.` }, { quoted: m });
      }
    } catch (error) {
      console.error('messages.upsert error:', error?.message || error);
      await sock.sendMessage(from, { text: '⚠️ Something went wrong while handling your command.' }, { quoted: m });
    }
  });
}

startStilettoBot().catch(console.error);
