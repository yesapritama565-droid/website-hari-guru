const $ = (id) => document.getElementById(id);
const teacher = $('teacher'), message = $('message'), preset = $('preset');
let currentShareUrl = '';

preset.addEventListener('change', () => {
  if (preset.value) message.value = preset.value;
  message.focus();
});

$('clearBtn').addEventListener('click', () => {
  teacher.value = ''; message.value = ''; preset.value = '';
  teacher.focus();
});

function encodeData(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function decodeData(encoded) {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function showToast(text) {
  $('toast').textContent = text;
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 2300);
}
function celebrate() {
  const symbols = ['✿','❀','♡','✽','·'];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('span');
    el.className = 'confetti';
    el.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    el.style.left = Math.random()*100 + 'vw';
    el.style.animationDelay = Math.random()*.8 + 's';
    el.style.fontSize = (12 + Math.random()*15) + 'px';
    el.style.color = ['#9caf96','#d7ad9f','#d1b77e'][i%3];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}
function renderMessage(data, shared = false) {
  $('greeting').textContent = data.teacher ? `Hai, ${data.teacher}!` : 'Hai, Guru!';
  $('resultMessage').textContent = data.message;
  $('result').classList.add('show');
  $('creator').style.display = 'none';
  $('book').classList.toggle('shared-mode', shared);
  $('ownerActions').style.display = shared ? 'none' : 'flex';
  if (!shared) $('result').scrollIntoView({behavior:'smooth',block:'center'});
}
$('saveBtn').addEventListener('click', () => {
  const who = teacher.value.trim();
  const words = message.value.trim();
  if (!who) { teacher.focus(); showToast('Tulis dulu nama guru yang dituju ya.'); return; }
  if (!words) { message.focus(); showToast('Pesannya masih kosong. Yuk, tulis dulu!'); return; }
  const data = { teacher: who, message: words };
  currentShareUrl = `${location.href.split('#')[0]}#pesan=${encodeURIComponent(encodeData(data))}`;
  renderMessage(data);
  celebrate();
});
$('sendBtn').addEventListener('click', async () => {
  if (!currentShareUrl) return;
  try {
    await navigator.clipboard.writeText(currentShareUrl);
    showToast('Link pesan berhasil disalin! Tinggal kirim ke siapa pun ♡');
  } catch (error) {
    const field = document.createElement('textarea');
    field.value = currentShareUrl; document.body.appendChild(field);
    field.select(); document.execCommand('copy'); field.remove();
    showToast('Link pesan berhasil disalin! Tinggal kirim ♡');
  }
});
$('againBtn').addEventListener('click', () => {
  location.hash = '';
  $('book').classList.remove('shared-mode');
  $('creator').style.display = 'grid';
  $('result').classList.remove('show');
  $('ownerActions').style.display = 'flex';
  teacher.value = ''; message.value = ''; preset.value = '';
  currentShareUrl = '';
  window.scrollTo({top:0,behavior:'smooth'});
});

// A shared link contains the message itself, so no database or server is needed.
const match = location.hash.match(/pesan=([^&]+)/);
if (match) {
  try {
    const data = decodeData(decodeURIComponent(match[1]));
    if (data && typeof data.message === 'string') renderMessage(data, true);
  } catch (e) { /* Ignore malformed links and show the editor. */ }
}
