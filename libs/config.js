export const config = {
  ownerNumber: (process.env.OWNER_NUMBER || '254708464426').replace(/\D/g, ''),
  ownerName: process.env.OWNER_NAME || 'Stiletto',
  botName: process.env.BOT_NAME || 'Stiletto Bot',
  prefix: process.env.BOT_PREFIX || '!',
  websiteUrl: process.env.WEBSITE_URL || 'https://github.com/stilettodev/stiletto-bot',
  logLevel: process.env.LOG_LEVEL || 'silent'
};

export const ownerJid = `${config.ownerNumber}@s.whatsapp.net`;
