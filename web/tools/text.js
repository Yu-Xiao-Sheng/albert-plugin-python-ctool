export const title = '文本处理';

export function run(Tool) {
  Tool.header('文本处理');

  const sec = Tool.section();
  const input = Tool.textarea('输入要处理的文本...');
  sec.appendChild(input);

  const errEl = Tool.error();

  const row1 = document.createElement('div');
  row1.className = 'btn-row';
  row1.appendChild(Tool.btn('转大写', doUpper, 'primary'));
  row1.appendChild(Tool.btn('转小写', doLower));
  row1.appendChild(Tool.btn('首字母大写', doCapitalize));
  row1.appendChild(Tool.btn('行去重', doDedupLines));
  Tool.container.appendChild(row1);

  const row2 = document.createElement('div');
  row2.className = 'btn-row';
  row2.appendChild(Tool.btn('行排序 ↑', () => doSortLines('asc')));
  row2.appendChild(Tool.btn('行排序 ↓', () => doSortLines('desc')));
  row2.appendChild(Tool.btn('去空行', doRemoveEmptyLines));
  row2.appendChild(Tool.btn('去首尾空格', doTrim));
  Tool.container.appendChild(row2);

  const row3 = document.createElement('div');
  row3.className = 'btn-row';
  row3.appendChild(Tool.btn('反转', doReverse));
  row3.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    statsDiv.textContent = '';
    Tool.hideErr(errEl);
  }));
  Tool.container.appendChild(row3);

  const outSec = Tool.section('输出');
  const output = Tool.textarea('处理结果', true);
  outSec.appendChild(output);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制结果', () => {
    if (output.value) Tool.copy(output.value);
  }));

  const statsDiv = document.createElement('div');
  statsDiv.className = 'result-info';
  statsDiv.style.minHeight = '20px';
  statsDiv.style.marginTop = '10px';
  statsDiv.style.fontSize = '12px';
  statsDiv.style.color = 'var(--text2)';
  Tool.container.appendChild(statsDiv);

  function updateStats() {
    const text = input.value;
    if (!text) { statsDiv.textContent = ''; return; }
    const chars = text.length;
    const lines = text.split('\n').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    statsDiv.textContent = `字符数: ${chars} | 行数: ${lines} | 字数: ${words}`;
  }

  input.addEventListener('input', updateStats);

  function doUpper() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    output.value = text.toUpperCase();
    updateStats();
  }

  function doLower() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    output.value = text.toLowerCase();
    updateStats();
  }

  function doCapitalize() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    output.value = text.replace(/\b\w/g, c => c.toUpperCase());
    updateStats();
  }

  function doTrim() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    output.value = text.split('\n').map(line => line.trim()).join('\n');
    updateStats();
  }

  function doDedupLines() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    const seen = new Set();
    const lines = text.split('\n');
    const result = [];
    for (const line of lines) {
      if (!seen.has(line)) {
        seen.add(line);
        result.push(line);
      }
    }
    output.value = result.join('\n');
    updateStats();
  }

  function doSortLines(order) {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    const lines = text.split('\n');
    lines.sort();
    if (order === 'desc') lines.reverse();
    output.value = lines.join('\n');
    updateStats();
  }

  function doRemoveEmptyLines() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    output.value = text.split('\n').filter(line => line.trim() !== '').join('\n');
    updateStats();
  }

  function doReverse() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入文本'); return; }
    Tool.hideErr(errEl);
    output.value = text.split('').reverse().join('');
    updateStats();
  }
}
