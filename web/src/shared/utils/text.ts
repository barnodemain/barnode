export function toTitleCaseWords(value: string): string {
  const lower = value.trim().toLowerCase();
  if (!lower) return '';

  return lower
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
