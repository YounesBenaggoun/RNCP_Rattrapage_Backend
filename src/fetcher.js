export async function fetchRoniText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'roni-ingest/1.0' } });
  if (!res.ok) throw new Error(`Téléchargement échoué : HTTP ${res.status} ${res.statusText}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('text/plain')) {
    throw new Error(`Type de contenu inattendu : "${type}" (attendu text/plain)`);
  }
  const text = await res.text();
  if (!text.trim()) throw new Error('Fichier RONI vide');
  if (text.length > 10_000_000) throw new Error('Fichier anormalement volumineux (>10 Mo)');
  return text;
}
