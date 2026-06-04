export const title = 'URL 解析';
export function run(Tool) {
  Tool.header('URL 解析器');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.input('请输入 URL，如 https://example.com:8080/path?key=value#hash', 'text');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('解析', doParse, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    paramsOutput.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('URL 组成部分');
  const output = Tool.textarea('解析结果...', true);
  output.style.fontFamily = 'monospace';
  outputSec.appendChild(output);

  const paramsSec = Tool.section('查询参数');
  const paramsOutput = Tool.textarea('查询参数列表...', true);
  paramsOutput.style.fontFamily = 'monospace';
  paramsSec.appendChild(paramsOutput);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制 URL 信息', () => {
    if (output.value) Tool.copy(output.value);
  }));
  outRow.appendChild(Tool.btn('复制参数信息', () => {
    if (paramsOutput.value) Tool.copy(paramsOutput.value);
  }));

  function doParse() {
    Tool.hideErr(err);
    const urlStr = input.value.trim();
    if (!urlStr) {
      Tool.showErr(err, '请输入 URL');
      return;
    }

    let parsed;
    try {
      parsed = new URL(urlStr);
    } catch (e) {
      Tool.showErr(err, '无效的 URL: ' + e.message);
      return;
    }

    const parts = [
      '协议 (protocol):  ' + parsed.protocol,
      '主机名 (hostname): ' + parsed.hostname,
      '端口 (port):       ' + (parsed.port || '(默认)'),
      '路径 (pathname):   ' + parsed.pathname,
      '查询 (search):     ' + (parsed.search || '(无)'),
      '哈希 (hash):       ' + (parsed.hash || '(无)'),
      '完整源 (origin):   ' + parsed.origin,
      '用户名 (username): ' + (parsed.username || '(无)'),
      '密码 (password):   ' + (parsed.password || '(无)'),
      '完整 URL (href):   ' + parsed.href,
    ];
    output.value = parts.join('\n');

    const searchParams = parsed.searchParams;
    if (searchParams.toString()) {
      const paramLines = [];
      let idx = 0;
      searchParams.forEach((value, key) => {
        idx++;
        paramLines.push(idx + '. ' + key + ' = ' + value);
      });
      paramsOutput.value = paramLines.join('\n');
    } else {
      paramsOutput.value = '(无查询参数)';
    }
  }
}
