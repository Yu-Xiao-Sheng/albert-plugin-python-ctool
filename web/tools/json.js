export const title = 'JSON 格式化';
export function run(Tool) {
  Tool.header('JSON 格式化/压缩/校验');

  const err = Tool.error();
  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入 JSON 字符串...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('格式化', () => {
    Tool.hideErr(err);
    try {
      const obj = JSON.parse(input.value);
      input.value = JSON.stringify(obj, null, 2);
    } catch (e) {
      Tool.showErr(err, 'JSON 解析失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('压缩', () => {
    Tool.hideErr(err);
    try {
      const obj = JSON.parse(input.value);
      input.value = JSON.stringify(obj);
    } catch (e) {
      Tool.showErr(err, 'JSON 解析失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('校验', () => {
    Tool.hideErr(err);
    try {
      JSON.parse(input.value);
      Tool.toast('JSON 格式正确', 'success');
    } catch (e) {
      Tool.showErr(err, 'JSON 格式错误: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('转义', () => {
    Tool.hideErr(err);
    try {
      const escaped = JSON.stringify(input.value);
      output.value = escaped.slice(1, -1);
    } catch (e) {
      Tool.showErr(err, '转义失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('去转义', () => {
    Tool.hideErr(err);
    try {
      const unescaped = JSON.parse('"' + input.value + '"');
      output.value = unescaped;
    } catch (e) {
      Tool.showErr(err, '去转义失败: ' + e.message);
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
