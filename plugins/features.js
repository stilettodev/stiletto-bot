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
      await sock.sendMessage(from, {
        image: { url: 'https://i.imgur.com/stiletto-banner.jpg' },
        caption: `🛍️ *${config.botName.toUpperCase()} PRO*\n\n✅ Lifetime license\n✅ Full source code\n✅ 24/7 support\n\nPrice: KES 4,999`,
        footer: 'Limited slots available',
        templateButtons: [
          { quickReplyButton: { displayText: '📩 I Want To Buy', id: `${config.prefix}owner` } },
          { quickReplyButton: { displayText: '📋 View Commands', id: `${config.prefix}categories` } },
          { urlButton: { displayText: '💬 Contact Owner', url: `https://wa.me/${config.ownerNumber}` } }
        ]
      });
      return;
    }

    if (lower.startsWith('feedback')) {
      if (['feedback_5', 'feedback_4', 'feedback_3'].includes(lower)) {
        await sock.sendMessage(from, { text: `🙏 Thanks for your rating! You selected: ${text}` }, { quoted: m });
        return;
      }

      await sock.sendMessage(from, {
        text: `How would you rate *${config.botName}*?`,
        buttons: [
          { buttonId: 'feedback_5', buttonText: { displayText: '⭐⭐⭐⭐⭐ Excellent' } },
          { buttonId: 'feedback_4', buttonText: { displayText: '⭐⭐⭐⭐ Great' } },
          { buttonId: 'feedback_3', buttonText: { displayText: '⭐⭐⭐ Good' } }
        ],
        headerType: 1
      }, { quoted: m });
    }
  }
};
