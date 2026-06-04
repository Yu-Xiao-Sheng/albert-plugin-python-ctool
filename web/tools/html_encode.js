export const title = 'HTML 编解码';
export function run(Tool) {
  Tool.header('HTML 编码/解码');

  const err = Tool.error();

  const encodeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  const decodeMap = {};
  for (const [k, v] of Object.entries(encodeMap)) {
    decodeMap[v] = k;
  }

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入 HTML 或文本...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('HTML 编码', () => {
    Tool.hideErr(err);
    try {
      output.value = input.value.replace(/[&<>"'`=\/]/g, ch => encodeMap[ch]);
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('HTML 解码', () => {
    Tool.hideErr(err);
    try {
      const ta = document.createElement('textarea');
      ta.innerHTML = input.value;
      output.value = ta.value;
    } catch (e) {
      Tool.showErr(err, '解码失败: ' + e.message);
    }
  }));

  const outputSec = Tool.section('输出');
  const output = Tool.textarea('结果...', true);
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));
}
