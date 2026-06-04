export const title = 'Unicode 编解码';
export function run(Tool) {
  Tool.header('Unicode 编码/解码');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入文本或 Unicode 编码...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('Unicode 编码', () => {
    Tool.hideErr(err);
    try {
      let result = '';
      for (let i = 0; i < input.value.length; i++) {
        const code = input.value.codePointAt(i);
        if (code > 0xFFFF) {
          result += '\\u{' + code.toString(16).toUpperCase() + '}';
          i++;
        } else {
          result += '\\u' + code.toString(16).toUpperCase().padStart(4, '0');
        }
      }
      output.value = result;
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('Unicode 解码', () => {
    Tool.hideErr(err);
    try {
      output.value = input.value.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => {
        return String.fromCodePoint(parseInt(hex, 16));
      }).replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch (e) {
      Tool.showErr(err, '解码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('中文转 \\u', () => {
    Tool.hideErr(err);
    try {
      let result = '';
      for (let i = 0; i < input.value.length; i++) {
        const code = input.value.charCodeAt(i);
        if (code > 127) {
          result += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          result += input.value[i];
        }
      }
      output.value = result;
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('\\u 转中文', () => {
    Tool.hideErr(err);
    try {
      output.value = input.value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
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
