export const title = '代码格式化';
export function run(Tool) {
  Tool.header('代码格式化');

  const errEl = Tool.error();

  Tool.formRow('语言', Tool.select([['json', 'JSON'], ['html', 'HTML'], ['xml', 'XML'], ['css', 'CSS'], ['sql', 'SQL']]));
  const langSelect = document.getElementById('inp_1');

  Tool.formRow('缩进', Tool.select([['2', '2 空格'], ['4', '4 空格'], ['tab', 'Tab']]));
  const indentSelect = document.getElementById('inp_2');

  Tool.section('输入');
  const inputArea = Tool.textarea('粘贴需要格式化的代码...');
  Tool.container.appendChild(inputArea);

  const btnRow = Tool.btnRow();
  btnRow.appendChild(Tool.btn('格式化', format, 'primary'));
  btnRow.appendChild(Tool.btn('压缩', compress));
  btnRow.appendChild(Tool.btn('复制结果', () => Tool.copy(outputArea.value)));

  Tool.section('输出');
  const outputArea = Tool.textarea('格式化后的代码', true);
  Tool.container.appendChild(outputArea);

  function getIndent() {
    const v = indentSelect.value;
    return v === 'tab' ? '\t' : ' '.repeat(parseInt(v));
  }

  function format() {
    Tool.hideErr(errEl);
    const code = inputArea.value.trim();
    if (!code) { Tool.showErr(errEl, '请输入代码'); return; }
    const lang = langSelect.value;
    const indent = getIndent();
    try {
      let result;
      switch (lang) {
        case 'json':
          result = JSON.stringify(JSON.parse(code), null, indent);
          break;
        case 'html':
          result = formatHTML(code, indent);
          break;
        case 'xml':
          result = formatXML(code, indent);
          break;
        case 'css':
          result = formatCSS(code, indent);
          break;
        case 'sql':
          result = formatSQL(code, indent);
          break;
      }
      outputArea.value = result;
    } catch (e) {
      Tool.showErr(errEl, '格式化失败: ' + e.message);
    }
  }

  function compress() {
    Tool.hideErr(errEl);
    const code = inputArea.value;
    if (!code) { Tool.showErr(errEl, '请输入代码'); return; }
    const lang = langSelect.value;
    try {
      let result;
      switch (lang) {
        case 'json':
          result = JSON.stringify(JSON.parse(code));
          break;
        default:
          result = code.replace(/>\s+</g, '><').replace(/\n\s*/g, ' ').replace(/\s{2,}/g, ' ');
      }
      outputArea.value = result;
    } catch (e) {
      Tool.showErr(errEl, '压缩失败: ' + e.message);
    }
  }

  function formatHTML(code, indent) {
    let formatted = '';
    let level = 0;
    const tokens = code.replace(/>\s*</g, '>\n<').split('\n');
    tokens.forEach(token => {
      token = token.trim();
      if (!token) return;
      if (token.match(/^<\/(.*?)>/) && !token.match(/^<\//).input.match(/^<\//)) {
        level = Math.max(0, level - 1);
      }
      if (token.match(/^<\//)) level = Math.max(0, level - 1);
      formatted += indent.repeat(level) + token + '\n';
      if (token.match(/^<[^\/!][^>]*[^\/]>$/) && !isVoidTag(token)) {
        level++;
      }
    });
    return formatted.trim();
  }

  function isVoidTag(token) {
    const m = token.match(/^<(\w+)/);
    if (!m) return false;
    return ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].includes(m[1].toLowerCase());
  }

  function formatXML(code, indent) {
    let formatted = '';
    let level = 0;
    code.replace(/>\s*</g, '>\n<').split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      if (line.startsWith('</')) level = Math.max(0, level - 1);
      formatted += indent.repeat(level) + line + '\n';
      if (line.startsWith('<') && !line.startsWith('</') && !line.startsWith('<?') && !line.startsWith('<!') && !line.endsWith('/>')) {
        level++;
      }
    });
    return formatted.trim();
  }

  function formatCSS(code, indent) {
    let formatted = '';
    let level = 0;
    const cleaned = code.replace(/\s*{\s*/g, ' {\n').replace(/\s*}\s*/g, '\n}\n').replace(/;\s*/g, ';\n');
    cleaned.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      if (line === '}') { level = Math.max(0, level - 1); }
      formatted += indent.repeat(level) + line + '\n';
      if (line.endsWith('{')) level++;
    });
    return formatted.trim();
  }

  function formatSQL(code, indent) {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INSERT INTO', 'UPDATE', 'DELETE', 'SET', 'VALUES', 'CREATE TABLE', 'ALTER TABLE', 'DROP', 'AS', 'DISTINCT', 'BETWEEN', 'IN', 'NOT', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IS NULL', 'IS NOT NULL'];
    let result = code;
    keywords.forEach(kw => {
      const regex = new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi');
      result = result.replace(regex, '\n' + kw.toUpperCase());
    });
    result = result.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');
    return result.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
  }
}
