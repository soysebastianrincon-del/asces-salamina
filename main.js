/* ===== CONFIGURACIÓN DE ASCES =====
   Cuando la asociación tenga su WhatsApp oficial, escríbelo aquí con indicativo y sin espacios.
   Ejemplo: whatsapp: "573001234567"  */
const ASCES = {
  whatsapp: "",
  evento: "2026-12-07T08:00:00-05:00"
};

/* menú móvil */
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
  });
}

/* orden aleatorio de las marcas: ninguna queda siempre de primera */
document.querySelectorAll('[data-shuffle]').forEach(box => {
  const fixed = [...box.children].filter(c => c.hasAttribute('data-fixed'));
  const items = [...box.children].filter(c => !c.hasAttribute('data-fixed'));
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.concat(fixed).forEach(el => box.appendChild(el));
});

/* cuenta regresiva al evento */
const target = new Date(ASCES.evento).getTime();
function tick() {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
        m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  document.querySelectorAll('[data-countdown]').forEach(el => {
    el.querySelector('[data-d]').textContent = d;
    el.querySelector('[data-h]').textContent = String(h).padStart(2, '0');
    el.querySelector('[data-m]').textContent = String(m).padStart(2, '0');
    const sec = el.querySelector('[data-s]');
    if (sec) sec.textContent = String(s).padStart(2, '0');
  });
}
if (document.querySelector('[data-countdown]')) { tick(); setInterval(tick, 1000); }

/* chispas de fuego en las secciones del evento */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('canvas.embers').forEach(cv => {
  const ctx = cv.getContext('2d');
  let W, H, parts = [];
  const resize = () => {
    const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize(); window.addEventListener('resize', resize);
  const spawn = (y) => ({ x: Math.random() * W, y: y ?? H + 10, r: Math.random() * 1.8 + .6,
    vy: Math.random() * .6 + .25, vx: (Math.random() - .5) * .3, life: Math.random() * .6 + .4, ph: Math.random() * 6.28 });
  const N = Math.round(Math.min(70, W / 16));
  for (let i = 0; i < N; i++) parts.push(spawn(Math.random() * H));
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.vy; p.ph += .03; p.x += p.vx + Math.sin(p.ph) * .25;
      const a = Math.max(0, Math.min(1, p.y / H)) * p.life;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(255,213,138,${a})`); g.addColorStop(.4, `rgba(242,140,50,${a * .55})`); g.addColorStop(1, 'rgba(224,102,43,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.28); ctx.fill();
      if (p.y < -10) Object.assign(p, spawn());
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  draw();
});

/* formularios: arman un mensaje listo para WhatsApp */
document.querySelectorAll('form[data-wa]').forEach(form => {
  const out = form.parentElement.querySelector('.form-out');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const lines = [form.dataset.wa];
    form.querySelectorAll('[data-label]').forEach(f => { if (f.value.trim()) lines.push(`${f.dataset.label}: ${f.value.trim()}`); });
    const text = lines.join('\n');
    out.hidden = false;
    out.querySelector('pre').textContent = text;
    const link = out.querySelector('a.wa');
    if (ASCES.whatsapp) {
      link.href = `https://wa.me/${ASCES.whatsapp}?text=${encodeURIComponent(text)}`;
      link.hidden = false;
      out.querySelector('.note').hidden = true;
    } else {
      link.hidden = true;
      out.querySelector('.note').hidden = false;
    }
    out.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  });
});
document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', async () => {
  const pre = btn.closest('.form-out').querySelector('pre');
  try { await navigator.clipboard.writeText(pre.textContent); btn.textContent = 'Copiado'; setTimeout(() => btn.textContent = 'Copiar mensaje', 2000); }
  catch { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
}));

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
