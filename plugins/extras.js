import crypto from 'node:crypto';

const todoStore = new Map();
const reminderStore = new Map();
const afkStore = new Map();

function getSenderId(sender = '') {
  return sender.split('@')[0] || sender;
}

function getArgs(text) {
  const parts = text.trim().split(/\s+/);
  const command = (parts.shift() || '').toLowerCase();
  return { command, args: parts, rest: parts.join(' ') };
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function titleCase(input) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function hashText(algorithm, value) {
  return crypto.createHash(algorithm).update(value).digest('hex');
}

const commandList = [
  'echo', 'reverse', 'upper', 'lower', 'title', 'length', 'words', 'charcount', 'repeat', 'trim',
  'pick', 'choose', 'coin', 'roll', 'rps', 'random', 'dice', 'flip', 'uuid', 'password',
  'calc', 'add', 'sub', 'mul', 'div', 'mod', 'pow', 'sqrt', 'percent', 'avg',
  'base64enc', 'base64dec', 'urlenc', 'urldec', 'md5', 'sha1', 'sha256', 'jsonpretty', 'jsonmin', 'hex',
  'now', 'date', 'time', 'unix', 'countdown', 'greet', 'compliment', 'roast', 'fact', 'joke',
  'advice', 'motivate', 'todoadd', 'todolist', 'tododel', 'todoclear', 'remind', 'reminders', 'delreminder', 'clearreminders',
  'afk', 'myafk', 'clearafk', 'extras'
];

export default {
  name: 'extras',
  commands: commandList,
  async execute(ctx) {
    const { sock, from, text, sender, m } = ctx;
    const { command, args, rest } = getArgs(text);
    const senderId = getSenderId(sender);

    if (command === 'extras') {
      await sock.sendMessage(from, {
        text: `✨ *Extra Commands (55+)*\n\n${commandList.map((c) => `• ${c}`).join('\n')}`
      }, { quoted: m });
      return;
    }

    if (command === 'echo') return sock.sendMessage(from, { text: rest || 'Usage: !echo your text' }, { quoted: m });
    if (command === 'reverse') return sock.sendMessage(from, { text: rest ? rest.split('').reverse().join('') : 'Usage: !reverse your text' }, { quoted: m });
    if (command === 'upper') return sock.sendMessage(from, { text: rest ? rest.toUpperCase() : 'Usage: !upper your text' }, { quoted: m });
    if (command === 'lower') return sock.sendMessage(from, { text: rest ? rest.toLowerCase() : 'Usage: !lower your text' }, { quoted: m });
    if (command === 'title') return sock.sendMessage(from, { text: rest ? titleCase(rest) : 'Usage: !title your text' }, { quoted: m });
    if (command === 'length') return sock.sendMessage(from, { text: `Length: ${rest.length}` }, { quoted: m });
    if (command === 'words') return sock.sendMessage(from, { text: `Words: ${rest ? rest.split(/\s+/).filter(Boolean).length : 0}` }, { quoted: m });
    if (command === 'charcount') return sock.sendMessage(from, { text: `Characters (no spaces): ${rest.replace(/\s/g, '').length}` }, { quoted: m });
    if (command === 'repeat') {
      const count = Math.min(Math.max(parseInt(args[0], 10) || 0, 1), 20);
      const phrase = args.slice(1).join(' ');
      return sock.sendMessage(from, { text: phrase ? Array.from({ length: count }, () => phrase).join('\n') : 'Usage: !repeat 3 hello' }, { quoted: m });
    }
    if (command === 'trim') return sock.sendMessage(from, { text: rest.trim() || 'Usage: !trim your text' }, { quoted: m });

    if (command === 'pick' || command === 'choose') {
      const options = rest.split(',').map((v) => v.trim()).filter(Boolean);
      if (options.length < 2) return sock.sendMessage(from, { text: 'Usage: !pick tea, coffee, juice' }, { quoted: m });
      return sock.sendMessage(from, { text: `I choose: *${options[Math.floor(Math.random() * options.length)]}*` }, { quoted: m });
    }
    if (command === 'coin' || command === 'flip') return sock.sendMessage(from, { text: Math.random() < 0.5 ? '🪙 Heads' : '🪙 Tails' }, { quoted: m });
    if (command === 'roll' || command === 'dice') {
      const sides = Math.min(Math.max(parseInt(args[0], 10) || 6, 2), 1000);
      return sock.sendMessage(from, { text: `🎲 ${1 + Math.floor(Math.random() * sides)} (1-${sides})` }, { quoted: m });
    }
    if (command === 'rps') {
      const user = (args[0] || '').toLowerCase();
      const picks = ['rock', 'paper', 'scissors'];
      if (!picks.includes(user)) return sock.sendMessage(from, { text: 'Usage: !rps rock|paper|scissors' }, { quoted: m });
      const bot = picks[Math.floor(Math.random() * picks.length)];
      const win = (user === 'rock' && bot === 'scissors') || (user === 'paper' && bot === 'rock') || (user === 'scissors' && bot === 'paper');
      const draw = user === bot;
      return sock.sendMessage(from, { text: `You: ${user}\nBot: ${bot}\nResult: ${draw ? 'Draw' : win ? 'You win 🎉' : 'You lose 😅'}` }, { quoted: m });
    }
    if (command === 'random') {
      const min = toNumber(args[0]);
      const max = toNumber(args[1]);
      if (min === null || max === null || min > max) return sock.sendMessage(from, { text: 'Usage: !random 10 50' }, { quoted: m });
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      return sock.sendMessage(from, { text: `🎯 Random: ${value}` }, { quoted: m });
    }
    if (command === 'uuid') return sock.sendMessage(from, { text: crypto.randomUUID() }, { quoted: m });
    if (command === 'password') {
      const len = Math.min(Math.max(parseInt(args[0], 10) || 12, 6), 64);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
      const pass = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return sock.sendMessage(from, { text: `🔐 ${pass}` }, { quoted: m });
    }

    if (['calc', 'add', 'sub', 'mul', 'div', 'mod', 'pow', 'sqrt', 'percent', 'avg'].includes(command)) {
      if (command === 'calc') {
        try {
          if (!/^[0-9+\-*/().%\s]+$/.test(rest)) throw new Error('invalid');
          const result = Function(`"use strict"; return (${rest})`)();
          return sock.sendMessage(from, { text: `Result: ${result}` }, { quoted: m });
        } catch {
          return sock.sendMessage(from, { text: 'Usage: !calc (2+3)*5' }, { quoted: m });
        }
      }

      const nums = args.map(toNumber).filter((v) => v !== null);
      if (!nums.length) return sock.sendMessage(from, { text: `Usage: !${command} numbers...` }, { quoted: m });

      if (command === 'add') return sock.sendMessage(from, { text: `Result: ${nums.reduce((a, b) => a + b, 0)}` }, { quoted: m });
      if (command === 'sub') return sock.sendMessage(from, { text: `Result: ${nums.slice(1).reduce((a, b) => a - b, nums[0])}` }, { quoted: m });
      if (command === 'mul') return sock.sendMessage(from, { text: `Result: ${nums.reduce((a, b) => a * b, 1)}` }, { quoted: m });
      if (command === 'div') return sock.sendMessage(from, { text: nums[1] === 0 ? 'Cannot divide by zero.' : `Result: ${nums[0] / nums[1]}` }, { quoted: m });
      if (command === 'mod') return sock.sendMessage(from, { text: nums[1] === 0 ? 'Cannot modulo by zero.' : `Result: ${nums[0] % nums[1]}` }, { quoted: m });
      if (command === 'pow') return sock.sendMessage(from, { text: `Result: ${Math.pow(nums[0], nums[1] ?? 2)}` }, { quoted: m });
      if (command === 'sqrt') return sock.sendMessage(from, { text: nums[0] < 0 ? 'No real square root for negatives.' : `Result: ${Math.sqrt(nums[0])}` }, { quoted: m });
      if (command === 'percent') return sock.sendMessage(from, { text: `Result: ${(nums[0] / 100) * (nums[1] ?? 1)}` }, { quoted: m });
      if (command === 'avg') return sock.sendMessage(from, { text: `Result: ${nums.reduce((a, b) => a + b, 0) / nums.length}` }, { quoted: m });
    }

    if (command === 'base64enc') return sock.sendMessage(from, { text: rest ? Buffer.from(rest).toString('base64') : 'Usage: !base64enc text' }, { quoted: m });
    if (command === 'base64dec') {
      try {
        return sock.sendMessage(from, { text: Buffer.from(rest, 'base64').toString('utf8') || 'Invalid base64' }, { quoted: m });
      } catch {
        return sock.sendMessage(from, { text: 'Invalid base64 input.' }, { quoted: m });
      }
    }
    if (command === 'urlenc') return sock.sendMessage(from, { text: encodeURIComponent(rest) }, { quoted: m });
    if (command === 'urldec') return sock.sendMessage(from, { text: decodeURIComponent(rest) }, { quoted: m });
    if (command === 'md5') return sock.sendMessage(from, { text: hashText('md5', rest) }, { quoted: m });
    if (command === 'sha1') return sock.sendMessage(from, { text: hashText('sha1', rest) }, { quoted: m });
    if (command === 'sha256') return sock.sendMessage(from, { text: hashText('sha256', rest) }, { quoted: m });
    if (command === 'jsonpretty') {
      try { return sock.sendMessage(from, { text: JSON.stringify(JSON.parse(rest), null, 2) }, { quoted: m }); } catch { return sock.sendMessage(from, { text: 'Usage: !jsonpretty {"a":1}' }, { quoted: m }); }
    }
    if (command === 'jsonmin') {
      try { return sock.sendMessage(from, { text: JSON.stringify(JSON.parse(rest)) }, { quoted: m }); } catch { return sock.sendMessage(from, { text: 'Usage: !jsonmin {"a":1}' }, { quoted: m }); }
    }
    if (command === 'hex') return sock.sendMessage(from, { text: rest ? Buffer.from(rest, 'utf8').toString('hex') : 'Usage: !hex text' }, { quoted: m });

    if (command === 'now') return sock.sendMessage(from, { text: new Date().toString() }, { quoted: m });
    if (command === 'date') return sock.sendMessage(from, { text: new Date().toLocaleDateString('en-KE') }, { quoted: m });
    if (command === 'time') return sock.sendMessage(from, { text: new Date().toLocaleTimeString('en-KE') }, { quoted: m });
    if (command === 'unix') return sock.sendMessage(from, { text: `${Math.floor(Date.now() / 1000)}` }, { quoted: m });
    if (command === 'countdown') {
      const minutes = Math.min(Math.max(parseInt(args[0], 10) || 0, 1), 1440);
      return sock.sendMessage(from, { text: `⏳ ${minutes} minute(s) = ${minutes * 60} seconds.` }, { quoted: m });
    }

    if (command === 'greet') return sock.sendMessage(from, { text: `Hello @${senderId}! 👋`, mentions: [sender] }, { quoted: m });
    if (command === 'compliment') {
      const list = ['You are consistent.', 'You have sharp ideas.', 'You learn fast.', 'You build with purpose.'];
      return sock.sendMessage(from, { text: list[Math.floor(Math.random() * list.length)] }, { quoted: m });
    }
    if (command === 'roast') {
      const list = ['You are buffering like 2G.', 'Your excuses have unlimited data.', 'Even autocorrect gave up today.'];
      return sock.sendMessage(from, { text: list[Math.floor(Math.random() * list.length)] }, { quoted: m });
    }
    if (command === 'fact') {
      const facts = ['Honey never spoils.', 'Octopuses have three hearts.', 'Bananas are berries.'];
      return sock.sendMessage(from, { text: `🧠 ${facts[Math.floor(Math.random() * facts.length)]}` }, { quoted: m });
    }
    if (command === 'joke') {
      const jokes = ['Why do JavaScript devs wear glasses? Because they do not C#.', 'I told my code a joke, now it has bugs.'];
      return sock.sendMessage(from, { text: `😂 ${jokes[Math.floor(Math.random() * jokes.length)]}` }, { quoted: m });
    }
    if (command === 'advice') {
      const tips = ['Start small, finish strong.', 'Ship first, polish next.', 'Measure before optimizing.'];
      return sock.sendMessage(from, { text: `💡 ${tips[Math.floor(Math.random() * tips.length)]}` }, { quoted: m });
    }
    if (command === 'motivate') {
      const tips = ['Keep pushing, greatness takes reps.', 'Consistency creates confidence.', 'Discipline wins daily.'];
      return sock.sendMessage(from, { text: `🔥 ${tips[Math.floor(Math.random() * tips.length)]}` }, { quoted: m });
    }

    if (command === 'todoadd') {
      if (!rest) return sock.sendMessage(from, { text: 'Usage: !todoadd buy milk' }, { quoted: m });
      const list = todoStore.get(senderId) || [];
      list.push(rest);
      todoStore.set(senderId, list);
      return sock.sendMessage(from, { text: `✅ Added todo #${list.length}` }, { quoted: m });
    }
    if (command === 'todolist') {
      const list = todoStore.get(senderId) || [];
      if (!list.length) return sock.sendMessage(from, { text: 'Your todo list is empty.' }, { quoted: m });
      return sock.sendMessage(from, { text: list.map((item, i) => `${i + 1}. ${item}`).join('\n') }, { quoted: m });
    }
    if (command === 'tododel') {
      const idx = (parseInt(args[0], 10) || 0) - 1;
      const list = todoStore.get(senderId) || [];
      if (idx < 0 || idx >= list.length) return sock.sendMessage(from, { text: 'Usage: !tododel 1' }, { quoted: m });
      list.splice(idx, 1);
      todoStore.set(senderId, list);
      return sock.sendMessage(from, { text: '🗑️ Todo removed.' }, { quoted: m });
    }
    if (command === 'todoclear') {
      todoStore.delete(senderId);
      return sock.sendMessage(from, { text: '🧹 Todo list cleared.' }, { quoted: m });
    }

    if (command === 'remind') {
      const time = parseInt(args[0], 10);
      const note = args.slice(1).join(' ');
      if (!time || !note) return sock.sendMessage(from, { text: 'Usage: !remind 10 submit report' }, { quoted: m });
      const list = reminderStore.get(senderId) || [];
      list.push({ minutes: time, note, createdAt: Date.now() });
      reminderStore.set(senderId, list);
      return sock.sendMessage(from, { text: `⏰ Reminder saved: ${time}m - ${note}` }, { quoted: m });
    }
    if (command === 'reminders') {
      const list = reminderStore.get(senderId) || [];
      if (!list.length) return sock.sendMessage(from, { text: 'No reminders found.' }, { quoted: m });
      return sock.sendMessage(from, { text: list.map((r, i) => `${i + 1}. ${r.minutes}m - ${r.note}`).join('\n') }, { quoted: m });
    }
    if (command === 'delreminder') {
      const idx = (parseInt(args[0], 10) || 0) - 1;
      const list = reminderStore.get(senderId) || [];
      if (idx < 0 || idx >= list.length) return sock.sendMessage(from, { text: 'Usage: !delreminder 1' }, { quoted: m });
      list.splice(idx, 1);
      reminderStore.set(senderId, list);
      return sock.sendMessage(from, { text: '🗑️ Reminder deleted.' }, { quoted: m });
    }
    if (command === 'clearreminders') {
      reminderStore.delete(senderId);
      return sock.sendMessage(from, { text: '🧹 Reminders cleared.' }, { quoted: m });
    }

    if (command === 'afk') {
      if (!rest) return sock.sendMessage(from, { text: 'Usage: !afk Busy right now' }, { quoted: m });
      afkStore.set(senderId, rest);
      return sock.sendMessage(from, { text: `🛌 AFK set: ${rest}` }, { quoted: m });
    }
    if (command === 'myafk') {
      const status = afkStore.get(senderId);
      return sock.sendMessage(from, { text: status ? `AFK: ${status}` : 'You are not AFK.' }, { quoted: m });
    }
    if (command === 'clearafk') {
      afkStore.delete(senderId);
      return sock.sendMessage(from, { text: '✅ AFK cleared.' }, { quoted: m });
    }
  }
};
