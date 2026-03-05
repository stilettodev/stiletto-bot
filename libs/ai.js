export async function askAI(question) {
  const response = await fetch(`https://api.stiletto.dev/ai?ask=${encodeURIComponent(question)}`)
    .then((r) => r.text())
    .catch(() => `Stiletto says: "${question}" — interesting question! I'm still learning.`);

  return response;
}
