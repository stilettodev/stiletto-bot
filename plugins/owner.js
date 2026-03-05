export default {
  name: 'owner',
  commands: ['broadcast'],
  async execute(ctx) {
    const { sock, from, text, isOwner, config, m } = ctx;

    if (!isOwner) {
      await sock.sendMessage(from, { text: 'Owner-only command.' }, { quoted: m });
      return;
    }

    const message = text.slice('broadcast'.length).trim();
    if (!message) {
      await sock.sendMessage(from, { text: `Usage: ${config.prefix}broadcast your message` }, { quoted: m });
      return;
    }

    const groups = await sock.groupFetchAllParticipating();
    const ids = Object.keys(groups);

    for (const id of ids) {
      await sock.sendMessage(id, { text: `📢 *BROADCAST FROM ${config.botName.toUpperCase()}*\n\n${message}` });
    }

    await sock.sendMessage(from, { text: `✅ Broadcast sent to ${ids.length} groups.` }, { quoted: m });
  }
};
