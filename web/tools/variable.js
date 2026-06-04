export const title = '变量命名转换';
export function run(Tool) {
  Tool.header('变量命名转换');

  Tool.formRow('输入变量名', Tool.input('例如: myVariableName'));
  const inputEl = document.getElementById('inp_1');

  const btnRow = Tool.btnRow();
  btnRow.appendChild(Tool.btn('转换全部', convertAll, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    inputEl.value = '';
    results.forEach(r => r.value = '');
  }));

  Tool.section('转换结果');
  const formats = [
    { label: 'camelCase', fn: toCamel },
    { label: 'snake_case', fn: toSnake },
    { label: 'PascalCase', fn: toPascal },
    { label: 'UPPER_SNAKE', fn: toUpperSnake },
    { label: 'kebab-case', fn: toKebab },
    { label: 'dot.case', fn: toDot },
  ];
  const results = [];
  formats.forEach(({ label, fn }) => {
    const row = document.createElement('div');
    row.className = 'form-row';
    row.style.marginBottom = '6px';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    lbl.style.minWidth = '110px';
    lbl.style.fontSize = '13px';
    lbl.style.color = 'var(--text2)';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.readOnly = true;
    inp.style.flex = '1';
    const copyBtn = Tool.btn('复制', () => Tool.copy(inp.value));
    copyBtn.style.marginLeft = '4px';
    row.appendChild(lbl);
    row.appendChild(inp);
    row.appendChild(copyBtn);
    Tool.container.appendChild(row);
    results.push({ input: inp, fn });
  });

  inputEl.addEventListener('input', convertAll);

  function splitWords(str) {
    str = str.trim();
    if (!str) return [];
    if (str.includes('_') && str.includes('-')) str = str.replace(/-/g, '_');
    if (str.includes('_')) return str.split('_').filter(Boolean).map(w => w.toLowerCase());
    if (str.includes('-')) return str.split('-').filter(Boolean).map(w => w.toLowerCase());
    if (str.includes('.')) return str.split('.').filter(Boolean).map(w => w.toLowerCase());
    if (/^[A-Z]+$/.test(str)) return [str.toLowerCase()];
    return str.replace(/([A-Z])/g, ' $1').trim().split(/\s+/).filter(Boolean).map(w => w.toLowerCase());
  }

  function toCamel(words) {
    return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }
  function toSnake(words) { return words.join('_'); }
  function toPascal(words) {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }
  function toUpperSnake(words) { return words.join('_').toUpperCase(); }
  function toKebab(words) { return words.join('-'); }
  function toDot(words) { return words.join('.'); }

  function convertAll() {
    const words = splitWords(inputEl.value);
    results.forEach(r => { r.input.value = words.length ? r.fn(words) : ''; });
  }
}
