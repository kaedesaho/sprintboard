export function formatString(text?: string) {
  if (!text) return "";

  const formatted = text.replace("_", " ");

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
