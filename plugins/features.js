import { sendButtons, sendInteractiveMessage } from 'baileys_helpers';

export default {
  name: 'features',
  commands: ['poll', 'catalog', 'location', 'shop', 'feedback', 'feedback_5', 'feedback_4', 'feedback_3'],
  async execute(ctx) {
    const { sock, from, text, config, m } = ctx;
    const lower = text.toLowerCase();

    if (lower.startsWith('poll')) {
      await sock.sendMessage(from, {
        poll: {
          name: `Favorite ${config.botName} feature?`,
          values: ['AI Assistant', 'Moderation', 'Interactive Menu', 'Group Tools', 'All of them'],
          selectableCount: 1
        }
      });
      return;
    }

    if (lower.startsWith('catalog')) {
      await sock.sendMessage(from, {
        product: {
          productId: 'STILETTO2025',
          title: `${config.botName} Pro`,
          description: 'Lifetime access • Premium support • Custom command setup',
          price: '4999',
          currencyCode: 'KES',
          productImage: { url: 'https://i.imgur.com/stiletto-banner.jpg' }
        },
        body: 'Exclusive offer for early users',
        footer: { text: `Contact ${config.ownerName} for full package` }
      });
      return;
    }

    if (lower.startsWith('location')) {
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

    if (lower.startsWith('shop')) {
      await sendButtons(sock, from, {
        text: `🛍️ *${config.botName.toUpperCase()} PRO*\n\n✅ Lifetime license\n✅ Full source code\n✅ 24/7 support\n\nPrice: KES 4,999`,
        footer: 'Limited slots available',
        buttons: [
          { id: `${config.prefix}owner`, text: '📩 I Want To Buy' },
          { id: `${config.prefix}categories`, text: '📋 View Commands' },
          { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '💬 Contact Owner', url: `https://wa.me/${config.ownerNumber}` }) }
        ]
      });
      return;
    }

    if (lower.startsWith('feedback')) {
      if (['feedback_5', 'feedback_4', 'feedback_3'].includes(lower)) {
        await sock.sendMessage(from, { text: `🙏 Thanks for your rating! You selected: ${text}` }, { quoted: m });
        return;
      }

      await sendButtons(sock, from, {
        text: `How would you rate *${config.botName}*?`,
        footer: 'Your feedback matters',
        buttons: [
          { id: 'feedback_5', text: '⭐⭐⭐⭐⭐ Excellent' },
          { id: 'feedback_4', text: '⭐⭐⭐⭐ Great' },
          { id: 'feedback_3', text: '⭐⭐⭐ Good' }
        ]
      });
    }
  }
};
