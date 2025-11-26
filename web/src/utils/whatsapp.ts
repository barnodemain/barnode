export function openWhatsapp(text?: string | null) {
  if (!text || text.trim().length === 0) {
    console.warn('[WhatsApp] Testo mancante:', text);
    alert('Questo ordine non ha un testo WhatsApp valido.');
    return;
  }
  const encoded = encodeURIComponent(text);
  window.location.href = `https://wa.me/?text=${encoded}`;
}
