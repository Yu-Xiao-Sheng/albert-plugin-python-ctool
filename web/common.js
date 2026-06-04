const Tool = {
  container: null,
  _id: 0,

  init() {
    this.container = document.getElementById('tool-content');
  },

  header(title, badge) {
    const h = document.createElement('div');
    h.className = 'tool-header';
    h.innerHTML = `<h1>${title}</h1>${badge ? `<span class="badge">${badge}</span>` : ''}`;
    this.container.appendChild(h);
  },

  section(label) {
    const s = document.createElement('div');
    s.className = 'section';
    if (label) {
      const l = document.createElement('div');
      l.className = 'section-label';
      l.textContent = label;
      s.appendChild(l);
    }
    this.container.appendChild(s);
    return s;
  },

  textarea(placeholder, readonly) {
    const t = document.createElement('textarea');
    t.placeholder = placeholder || '';
    t.id = 'ta_' + (++this._id);
    if (readonly) t.classList.add('output');
    if (readonly) t.readOnly = true;
    return t;
  },

  input(placeholder, type) {
    const i = document.createElement('input');
    i.type = type || 'text';
    i.placeholder = placeholder || '';
    i.id = 'inp_' + (++this._id);
    return i;
  },

  btnRow() {
    const r = document.createElement('div');
    r.className = 'btn-row';
    this.container.appendChild(r);
    return r;
  },

  btn(text, onClick, cls) {
    const b = document.createElement('button');
    b.textContent = text;
    if (cls) b.className = cls;
    b.addEventListener('click', onClick);
    return b;
  },

  formRow(label, inputEl) {
    const r = document.createElement('div');
    r.className = 'form-row';
    if (label) {
      const l = document.createElement('label');
      l.textContent = label;
      r.appendChild(l);
    }
    if (inputEl) r.appendChild(inputEl);
    this.container.appendChild(r);
    return r;
  },

  select(options) {
    const s = document.createElement('select');
    options.forEach(([val, text]) => {
      const o = document.createElement('option');
      o.value = val;
      o.textContent = text;
      s.appendChild(o);
    });
    return s;
  },

  error() {
    const e = document.createElement('div');
    e.className = 'error';
    this.container.appendChild(e);
    return e;
  },

  showErr(el, msg) {
    el.textContent = msg;
    el.classList.add('show');
  },

  hideErr(el) {
    el.classList.remove('show');
  },

  copy(text) {
    navigator.clipboard.writeText(text).then(() => this.toast('已复制到剪贴板', 'success'));
  },

  async paste() {
    return navigator.clipboard.readText();
  },

  toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'success');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  },

  tabs(items) {
    const r = document.createElement('div');
    r.className = 'tabs';
    const panels = [];
    items.forEach(([label, panel], i) => {
      const t = document.createElement('button');
      t.className = 'tab' + (i === 0 ? ' active' : '');
      t.textContent = label;
      t.addEventListener('click', () => {
        r.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        panels.forEach((p, j) => p.style.display = j === i ? '' : 'none');
      });
      r.appendChild(t);
      panels.push(panel);
      if (i > 0) panel.style.display = 'none';
    });
    this.container.appendChild(r);
    return panels;
  },

  html(parent, html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    parent.appendChild(d);
    return d;
  }
};

window.Tool = Tool;
