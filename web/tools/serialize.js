export const title = 'JSON/XML/YAML 转换';
export function run(Tool) {
  Tool.header('JSON/XML/YAML 格式转换');

  const err = Tool.error();

  const fromRow = Tool.formRow('源格式', null);
  const fromSel = Tool.select([['json', 'JSON'], ['xml', 'XML']]);
  fromRow.appendChild(fromSel);

  const toRow = Tool.formRow('目标格式', null);
  const toSel = Tool.select([['json', 'JSON'], ['xml', 'XML']]);
  toRow.appendChild(toSel);

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入 JSON 或 XML...');
  inputSec.appendChild(input);

  // --- Simple JSON to XML ---
  function jsonToXml(obj, tag) {
    let xml = '';
    if (obj === null || obj === undefined) {
      return `<${tag}/>`;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        xml += jsonToXml(item, tag || 'item');
      }
      return xml;
    }
    if (typeof obj === 'object') {
      xml += `<${tag}>`;
      for (const key of Object.keys(obj)) {
        xml += jsonToXml(obj[key], key);
      }
      xml += `</${tag}>`;
      return xml;
    }
    const escaped = String(obj)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    return `<${tag}>${escaped}</${tag}>`;
  }

  // --- Simple XML to JSON ---
  function xmlToJson(xmlStr) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr.trim(), 'text/xml');
    const errNode = doc.querySelector('parsererror');
    if (errNode) {
      throw new Error('XML 解析错误: ' + errNode.textContent);
    }
    function nodeToObj(node) {
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (text) return text;
        return null;
      }
      if (!node.children || node.children.length === 0) {
        const text = node.textContent.trim();
        if (text === '') return null;
        // try to parse as number
        if (!isNaN(text) && text !== '') return Number(text);
        if (text === 'true') return true;
        if (text === 'false') return false;
        return text;
      }
      const obj = {};
      for (const child of node.children) {
        const key = child.tagName;
        const val = nodeToObj(child);
        if (key in obj) {
          if (!Array.isArray(obj[key])) {
            obj[key] = [obj[key]];
          }
          obj[key].push(val);
        } else {
          obj[key] = val;
        }
      }
      return obj;
    }
    return nodeToObj(doc.documentElement);
  }

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('转换', () => {
    Tool.hideErr(err);
    try {
      const from = fromSel.value;
      const to = toSel.value;

      if (from === to) {
        output.value = input.value;
        return;
      }

      if (from === 'json' && to === 'xml') {
        const obj = JSON.parse(input.value);
        output.value = jsonToXml(obj, 'root');
      } else if (from === 'xml' && to === 'json') {
        const obj = xmlToJson(input.value);
        output.value = JSON.stringify(obj, null, 2);
      } else {
        Tool.showErr(err, '不支持的转换组合');
      }
    } catch (e) {
      Tool.showErr(err, '转换失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('格式化 JSON', () => {
    Tool.hideErr(err);
    try {
      const obj = JSON.parse(input.value);
      output.value = JSON.stringify(obj, null, 2);
    } catch (e) {
      Tool.showErr(err, 'JSON 格式错误: ' + e.message);
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
