export default {
  name: 'group',
  commands: ['rules', 'tagall', 'hidetag'],
  async execute(ctx) {
    const { sock, from, text, isGroup, isAdmin, isOwner, groupMetadata, m, config } = ctx;
    const lower = text.toLowerCase();

    if (lower.startsWith('rules')) {
      await sock.sendMessage(from, {
        text: '*Group Rules*\n1) No spam links\n2) Respect everyone\n3) No hate speech\n4) Use commands responsibly'
      }, { quoted: m });
      return;
    }

    if (!isGroup) {
      await sock.sendMessage(from, { text: 'This command works in groups only.' }, { quoted: m });
      return;
    }

    if (!isAdmin && !isOwner) {
      await sock.sendMessage(from, { text: 'Admin-only command.' }, { quoted: m });
      return;
    }

    const mentions = groupMetadata?.participants?.map((p) => p.id) || [];

    if (lower.startsWith('tagall')) {
      const body = mentions.map((id) => `@${id.split('@')[0]}`).join(' ');
      await sock.sendMessage(from, { text: `📢 Attention everyone:\n\n${body}`, mentions }, { quoted: m });
      return;
    }

    const message = text.slice('hidetag'.length).trim() || `📣 Admin announcement (${config.botName})`;
    await sock.sendMessage(from, { text: message, mentions }, { quoted: m });
  }
};
