export const SM = '"Space Mono",ui-monospace,monospace';

export function cvs(el, h) {
  const c = document.createElement('canvas');
  el.appendChild(c);
  const W = Math.max(280, Math.min(620, el.clientWidth || 330));
  const d = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(W * d);
  c.height = Math.round(h * d);
  c.style.width = '100%';
  c.style.height = 'auto';
  const x = c.getContext('2d');
  x.scale(d, d);
  x.textBaseline = 'middle';
  return { c, x, W, H: h };
}

export function box(el, cls, html) {
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = html;
  el.appendChild(d);
  return d;
}

export function slider(el, lab, min, max, val, fmt, on) {
  const w = box(
    el,
    'vsl',
    `<label><span>${lab}</span><b></b></label><input type="range" min="${min}" max="${max}" value="${val}" step="1">`
  );
  const inp = w.querySelector('input'),
    out = w.querySelector('b');
  const sp = new Spring(+val, { k: 220, d: 27 });
  let live = false;
  const pump = () => {
    const v = sp.step();
    on(v);
    if (Math.abs(v - sp.g) > 1e-3 || Math.abs(sp.v) > 1e-3) {
      requestAnimationFrame(pump);
    } else {
      live = false;
      on(sp.g);
    }
  };
  inp.oninput = () => {
    const raw = +inp.value;
    out.textContent = fmt(raw);
    sp.to(raw);
    if (!live) {
      live = true;
      requestAnimationFrame(pump);
    }
  };
  out.textContent = fmt(+val);
  sp.set(+val);
  on(+val);
  return inp;
}

export function readout(el, items) {
  return box(
    el,
    'read',
    items
      .map((i) => `<div><span class="v ${i.c || ''}" id="${i.id}">—</span><span class="k">${i.k}</span></div>`)
      .join('')
  );
}

export const lerp = (a, b, t) => a + (b - a) * t;

export function mixc(c1, c2, t) {
  const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const a = p(c1),
    b = p(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], Math.max(0, Math.min(1, t))))).join(',')})`;
}

export function rr(x, r, y, w, h, rad) {
  if (x.roundRect) {
    x.beginPath();
    x.roundRect(r, y, w, h, rad);
  } else {
    x.beginPath();
    x.rect(r, y, w, h);
  }
}

const _t = () => performance.now() / 1000;

export function Spring(v, o) {
  o = o || {};
  this.k = o.k || 150;
  this.d = o.d || (o.bounce ? 13 : 24);
  this.x = v;
  this.v = 0;
  this.g = v;
  this.l = _t();
}
Spring.prototype.to = function (t) {
  this.g = t;
  return this;
};
Spring.prototype.set = function (v) {
  this.x = this.g = v;
  this.v = 0;
  this.l = _t();
  return this;
};
Spring.prototype.step = function () {
  let dt = _t() - this.l;
  this.l += dt;
  dt = Math.min(0.05, Math.max(0, dt));
  const c = Math.max(1, Math.ceil(dt / 0.008)),
    h = dt / c;
  for (let i = 0; i < c; i++) {
    const a = -this.k * (this.x - this.g) - this.d * this.v;
    this.v += a * h;
    this.x += this.v * h;
  }
  if (Math.abs(this.x - this.g) < 3e-4 && Math.abs(this.v) < 3e-3) {
    this.x = this.g;
    this.v = 0;
  }
  return this.x;
};

export const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const easeOut = (t) => {
  t = clamp01(t);
  return 1 - Math.pow(1 - t, 3);
};
export const easeBack = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

export const fr = (n) => String(n).replace('.', ',');

/** Boucle d'animation scopée à une instance de composant (remplace le registre
 * global loops/raf/stopLoops de l'ancien site.html). */
export function createLoop() {
  const ids = [];
  return {
    raf(fn) {
      const id = requestAnimationFrame(fn);
      ids.push(id);
      return id;
    },
    stop() {
      ids.forEach((id) => cancelAnimationFrame(id));
      ids.length = 0;
    }
  };
}
