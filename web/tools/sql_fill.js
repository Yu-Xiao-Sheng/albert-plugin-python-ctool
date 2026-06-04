export const title = 'SQL 参数填充';
export function run(Tool) {
  Tool.header('SQL 参数填充', 'MyBatis');

  const errEl = Tool.error();

  Tool.formRow('模式', Tool.select([['q', '? 占位符'], ['mybatis', '#{} MyBatis'], ['both', '两者都支持']]));
  const modeSelect = document.getElementById('inp_1');

  Tool.section('SQL 语句');
  const sqlArea = Tool.textarea('SELECT * FROM users WHERE id = ? AND name = ?\n或\nSELECT * FROM users WHERE id = #{id} AND name = #{name}');
  Tool.container.appendChild(sqlArea);

  Tool.section('参数');
  const paramArea = Tool.textarea('输入参数值，每行一个（对应 ? 顺序）\n或 JSON 格式：{"id": 1, "name": "admin"}\n或 key=value 格式（每行一个）');
  Tool.container.appendChild(paramArea);

  const btnRow = Tool.btnRow();
  btnRow.appendChild(Tool.btn('填充参数', fillSQL, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    sqlArea.value = '';
    paramArea.value = '';
    resultArea.value = '';
    Tool.hideErr(errEl);
  }));

  Tool.section('结果');
  const resultArea = Tool.textarea('填充后的 SQL', true);
  Tool.container.appendChild(resultArea);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制结果', () => Tool.copy(resultArea.value)));

  function fillSQL() {
    Tool.hideErr(errEl);
    let sql = sqlArea.value.trim();
    const paramText = paramArea.value.trim();
    if (!sql) { Tool.showErr(errEl, '请输入 SQL 语句'); return; }
    if (!paramText) { Tool.showErr(errEl, '请输入参数'); return; }

    try {
      const params = parseParams(paramText);
      if (sql.includes('#{')) {
        params.forEach((val, key) => {
          const regex = new RegExp('#\\{' + escapeRegex(key) + '\\}', 'g');
          sql = sql.replace(regex, formatVal(val));
        });
        sql = sql.replace(/#\{[^}]+\}/g, 'NULL');
      } else {
        let idx = 0;
        sql = sql.replace(/\?/g, () => {
          if (idx < (Array.isArray(params) ? params.length : params.size)) {
            const val = Array.isArray(params) ? params[idx] : [...params.values()][idx];
            idx++;
            return formatVal(val);
          }
          return 'NULL';
        });
      }
      resultArea.value = sql;
    } catch (e) {
      Tool.showErr(errEl, '参数解析错误: ' + e.message);
    }
  }

  function parseParams(text) {
    text = text.trim();
    if (text.startsWith('{') || text.startsWith('"')) {
      try {
        const obj = JSON.parse(text);
        if (Array.isArray(obj)) return obj.map(v => v);
        return new Map(Object.entries(obj));
      } catch (e) { /* fallback */ }
    }
    if (text.includes('=')) {
      const map = new Map();
      text.split('\n').forEach(line => {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 1).trim();
          map.set(key, autoType(val));
        }
      });
      return map;
    }
    return text.split('\n').filter(l => l.trim()).map(l => autoType(l.trim()));
  }

  function autoType(val) {
    if (val === 'null' || val === 'NULL') return null;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (/^-?\d+$/.test(val)) return parseInt(val);
    if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
    return val;
  }

  function formatVal(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'boolean') return val ? '1' : '0';
    const escaped = String(val).replace(/'/g, "''");
    return `'${escaped}'`;
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
