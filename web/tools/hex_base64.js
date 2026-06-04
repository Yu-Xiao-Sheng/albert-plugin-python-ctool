export const title = 'Hex/Base64 转换';
export function run(Tool) {
  Tool.header('Hex 与 Base64 转换');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入 Hex 或 Base64 字符串...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('Hex → Base64', () => {
    Tool.hideErr(err);
    try {
      const hexStr = input.value.replace(/[\s]/g, '');
      if (!/^[0-9a-fA-F]*$/.test(hexStr)) {
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
      let binary = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      output.value = btoa(binary);
    } catch (e) {
      Tool.showErr(err, '转换失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('Base64 → Hex', () => {
    Tool.hideErr(err);
    try {
      const binary = atob(input.value.trim());
      const hexParts = [];
      for (let i = 0; i < binary.length; i++) {
        hexParts.push(binary.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase());
      }
      output.value = hexParts.join(' ');
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
