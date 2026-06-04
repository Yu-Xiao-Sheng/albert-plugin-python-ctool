export const title = 'URL 编解码';
export function run(Tool) {
  Tool.header('URL 编码/解码');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入 URL 或文本...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('编码 (Encode)', () => {
    Tool.hideErr(err);
    try {
      output.value = encodeURIComponent(input.value);
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('编码 (组件)', () => {
    Tool.hideErr(err);
    try {
      output.value = encodeURI(input.value);
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('解码 (Decode)', () => {
    Tool.hideErr(err);
    try {
      output.value = decodeURIComponent(input.value);
    } catch (e) {
      Tool.showErr(err, '解码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('解码 (组件)', () => {
    Tool.hideErr(err);
    try {
      output.value = decodeURI(input.value);
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
