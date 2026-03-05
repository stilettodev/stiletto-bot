import { askAI } from '../libs/ai.js';

export default {
  name: 'ai',
  commands: ['ai', 'stiletto'],
  async execute(ctx) {
    const { sock, from, text, m, config } = ctx;
    const lower = text.toLowerCase();

    const question = text.slice(lower.startsWith('ai') ? 2 : 'stiletto'.length).trim();
    if (!question) {
      await sock.sendMessage(from, { text: `Usage: ${config.prefix}ai your question` }, { quoted: m });
      return;
    }

    await sock.sendMessage(from, { react: { text: '🤔', key: m.key } });
    const response = await askAI(question);
    await sock.sendMessage(from, { text: response }, { quoted: m });
  }
};
