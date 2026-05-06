async function loadContent(filename) {
  const response = await fetch(`content/${filename}`);
  if (!response.ok) throw new Error(`Cannot load ${filename}: ${response.status}`);
  const text = await response.text();
  const result = {};
  text.split('\n').forEach(line => {
    if (line.startsWith('#')) return;
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      result[key] = value;
    }
  });
  return result;
}
