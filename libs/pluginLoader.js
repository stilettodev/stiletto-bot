import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadPlugins(pluginsDir) {
  const files = await readdir(pluginsDir);
  const pluginFiles = files.filter((f) => f.endsWith('.js')).sort();

  const plugins = [];
  for (const file of pluginFiles) {
    const fullPath = path.join(pluginsDir, file);
    const mod = await import(pathToFileURL(fullPath).href);
    const plugin = mod.default;

    if (!plugin?.name || typeof plugin.execute !== 'function') continue;

    const commands = (plugin.commands || []).map((c) => c.toLowerCase());
    plugins.push({ ...plugin, commands });
  }

  return plugins;
}

export async function runPlugins({ plugins, rawText, normalizedText, ctx }) {
  for (const plugin of plugins) {
    const matched = plugin.commands.some((command) => {
      return (
        rawText === command ||
        rawText.startsWith(`${command} `) ||
        normalizedText === command ||
        normalizedText.startsWith(`${command} `)
      );
    });

    if (!matched) continue;

    await plugin.execute(ctx);
    return true;
  }

  return false;
}
