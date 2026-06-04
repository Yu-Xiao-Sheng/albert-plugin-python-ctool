export const title = 'Hex/String 转换';
export function run(Tool) {
  Tool.header('Hex 与字符串转换');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入字符串或 Hex...');
  inputSec.appendChild(input);

  const sepRow = Tool.formRow('分隔符', null);
  const sepInput = Tool.input('空格 (默认)', 'text');
  sepInput.value = ' ';
  sepRow.appendChild(sepInput);

  const caseRow = Tool.formRow('大小写', null);
  const caseSel = Tool.select([['upper', '大写'], ['lower', '小写']]);
  caseRow.appendChild(caseSel);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('String → Hex', () => {
    Tool.hideErr(err);
    try {
      const sep = sepInput.value;
      const toUpper = caseSel.value === 'upper';
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input.value);
      const hexParts = Array.from(bytes).map(b => {
        const hex = b.toString(16).padStart(2, '0');
        return toUpper ? hex.toUpperCase() : hex;
      });
      output.value = hexParts.join(sep);
    } catch (e) {
      Tool.showErr(err, '转换失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('Hex → String', () => {
    Tool.hideErr(err);
    try {
      const hexStr = input.value.replace(/[\s,;:\-]/g, '');
      if (!/^[0-9a-fA-F]+$/.test(hexStr)) {
        Tool.showErr(err, '输入不是有效的十六进制字符串');
        return;
      }
      if (hexStr.length % 2 !== 0) {
        Tool.showErr(err, '十六进制字符串长度必须为偶数');
        return;
      }
      const bytes = new Uint8Array(hexStr.length / 2);
      for (let i = 0; i < hexStr.length; i += 2) {
        bytes[i / 2] = parseInt(hexStr.substr(i, 2), 16);
      }
      const decoder = new TextDecoder();
      output.value = decoder.decode(bytes);
    } catch (e) {
      Tool.showErr(err, '转换失败: ' + e.message);
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
