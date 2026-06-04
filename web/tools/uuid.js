export const title = 'UUID 生成器';

export function run(Tool) {
  Tool.header('UUID 生成器');

  const sec = Tool.section();

  // Version select
  const versionSelect = Tool.select([
    ['v4', 'UUID v4 (随机)']
  ]);
  Tool.formRow('版本', versionSelect);

  // Count input
  const countInput = Tool.input('5', 'number');
  countInput.value = '5';
  countInput.min = '1';
  countInput.max = '50';
  countInput.style.width = '80px';
  Tool.formRow('数量', countInput);

  // Uppercase option
  const upperCheck = document.createElement('input');
  upperCheck.type = 'checkbox';
  upperCheck.id = 'uuid_upper';
  upperCheck.style.marginRight = '6px';
  const upperLabel = document.createElement('label');
  upperLabel.textContent = '大写输出';
  upperLabel.style.fontSize = '13px';
  upperLabel.style.color = 'var(--text2)';
  upperLabel.prepend(upperCheck);
  const upperRow = document.createElement('div');
  upperRow.className = 'form-row';
  upperRow.appendChild(upperLabel);
  Tool.container.appendChild(upperRow);

  // No dashes option
  const noDashCheck = document.createElement('input');
  noDashCheck.type = 'checkbox';
  noDashCheck.id = 'uuid_nodash';
  noDashCheck.style.marginRight = '6px';
  const noDashLabel = document.createElement('label');
  noDashLabel.textContent = '去除连字符';
  noDashLabel.style.fontSize = '13px';
  noDashLabel.style.color = 'var(--text2)';
  noDashLabel.prepend(noDashCheck);
  const noDashRow = document.createElement('div');
  noDashRow.className = 'form-row';
  noDashRow.appendChild(noDashLabel);
  Tool.container.appendChild(noDashRow);

  const errEl = Tool.error();

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  btnRow.appendChild(Tool.btn('生成', doGenerate, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    output.value = '';
    Tool.hideErr(errEl);
  }));
  Tool.container.appendChild(btnRow);

  const outSec = Tool.section('输出');
  const output = Tool.textarea('UUID 将在此显示', true);
  outSec.appendChild(output);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制结果', () => {
    if (output.value) Tool.copy(output.value);
  }));

  function generateUUIDv4() {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }

  function doGenerate() {
    const count = Math.min(Math.max(parseInt(countInput.value) || 1, 1), 50);
    Tool.hideErr(errEl);

    const results = [];
    for (let i = 0; i < count; i++) {
      let uuid = generateUUIDv4();
      if (noDashCheck.checked) uuid = uuid.replace(/-/g, '');
      if (upperCheck.checked) uuid = uuid.toUpperCase();
      results.push(uuid);
    }
    output.value = results.join('\n');
  }
}
