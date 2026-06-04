export const title = 'Base64 编解码';
export function run(Tool) {
  Tool.header('Base64 编码/解码');

  const err = Tool.error();

  const encodingRow = Tool.formRow('字符编码', null);
  const encodingSel = Tool.select([['utf-8', 'UTF-8'], ['ascii', 'ASCII']]);
  encodingRow.appendChild(encodingSel);

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入文本...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('编码 (Encode)', () => {
    Tool.hideErr(err);
    try {
      const encoding = encodingSel.value;
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input.value);
      let binary = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      output.value = btoa(binary);
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('解码 (Decode)', () => {
    Tool.hideErr(err);
    try {
      const binary = atob(input.value.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const decoder = new TextDecoder(encodingSel.value);
      output.value = decoder.decode(bytes);
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
