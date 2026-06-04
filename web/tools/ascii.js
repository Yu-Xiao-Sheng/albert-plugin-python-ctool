export const title = 'ASCII 编码';
export function run(Tool) {
  Tool.header('ASCII 编码转换');

  const err = Tool.error();

  const modeRow = Tool.formRow('转换模式', null);
  const modeSel = Tool.select([
    ['str_dec', '字符串 → 十进制'],
    ['str_hex', '字符串 → 十六进制'],
    ['str_oct', '字符串 → 八进制'],
    ['str_bin', '字符串 → 二进制'],
    ['dec_str', '十进制 → 字符串'],
    ['hex_str', '十六进制 → 字符串'],
    ['oct_str', '八进制 → 字符串'],
    ['bin_str', '二进制 → 字符串']
  ]);
  modeRow.appendChild(modeSel);

  const sepRow = Tool.formRow('输出分隔符', null);
  const sepInput = Tool.input('空格 (默认)', 'text');
  sepInput.value = ' ';
  sepRow.appendChild(sepInput);

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入内容...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('转换', () => {
    Tool.hideErr(err);
    try {
      const mode = modeSel.value;
      const sep = sepInput.value;
      let result = '';

      if (mode.startsWith('str_')) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(input.value);
        const parts = Array.from(bytes).map(b => {
          switch (mode) {
            case 'str_dec': return b.toString(10);
            case 'str_hex': return b.toString(16).toUpperCase().padStart(2, '0');
            case 'str_oct': return b.toString(8).padStart(3, '0');
            case 'str_bin': return b.toString(2).padStart(8, '0');
          }
        });
        result = parts.join(sep);
      } else {
        const parts = input.value.trim().split(/[\s,;]+/);
        const bytes = parts.map(p => {
          let code;
          switch (mode) {
            case 'dec_str': code = parseInt(p, 10); break;
            case 'hex_str': code = parseInt(p, 16); break;
            case 'oct_str': code = parseInt(p, 8); break;
            case 'bin_str': code = parseInt(p, 2); break;
          }
          if (isNaN(code) || code < 0 || code > 255) {
            throw new Error('无效值: ' + p);
          }
          return code;
        });
        const decoder = new TextDecoder();
        result = decoder.decode(new Uint8Array(bytes));
      }

      output.value = result;
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
