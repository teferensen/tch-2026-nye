// Shared helpers: loads songs.tsv and turns each row into an object keyed by the header row.

async function loadSongs() {
  const res = await fetch('songs.tsv', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load songs.tsv (' + res.status + ').');
  const lines = (await res.text()).replace(/\r/g, '').split('\n').filter(l => l.trim());
  const headers = lines.shift().split('\t').map(h => h.trim());
  const seen = {};
  return lines.map(line => {
    const cells = line.split('\t');
    const song = {};
    headers.forEach((h, i) => { song[h] = (cells[i] || '').trim(); });
    let id = slugify(song.Artist + ' ' + song.Song);
    seen[id] = (seen[id] || 0) + 1;
    if (seen[id] > 1) id += '-' + seen[id];
    song.id = id;
    return song;
  });
}

function slugify(s) {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// "C Major, C Lydian" -> "C Major" for the compact card view
function firstKey(k) { return (k || '').split(',')[0].trim(); }

function genreTags(g) {
  return g.split(',').map(x => x.trim()).filter(Boolean)
    .map(x => `<span class="tag">${esc(x)}</span>`).join('');
}
