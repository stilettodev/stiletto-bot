const LINKS_REGEX = /(https?:\/\/[^\s]+|t\.me|wa\.me|chat\.whatsapp\.com)/i;

export async function moderateGroupMessage({ sock, spamDetect, from, sender, text, isAdmin, isOwner, msgKey, quoted }) {
  if (!text) return false;

  const hasLink = LINKS_REGEX.test(text);
  if (!hasLink || isAdmin || isOwner) return false;

  if (spamDetect.get(sender)) {
    await sock.sendMessage(from, { delete: msgKey });
    await sock.groupParticipantsUpdate(from, [sender], 'remove');
    await sock.sendMessage(from, {
      text: `🚫 Auto-kicked @${sender.split('@')[0]} for repeated link spam.`,
      mentions: [sender]
    });
  } else {
    spamDetect.set(sender, true, 12);
    await sock.sendMessage(from, { text: '⚠️ No external links allowed (warning 1/2).', quoted });
  }

  return true;
}
