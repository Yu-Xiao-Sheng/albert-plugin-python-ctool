export const title = 'HTTP 代码生成';
export function run(Tool) {
  Tool.header('HTTP 代码生成');

  const errEl = Tool.error();

  Tool.formRow('Method', Tool.select([['GET', 'GET'], ['POST', 'POST'], ['PUT', 'PUT'], ['DELETE', 'DELETE'], ['PATCH', 'PATCH'], ['HEAD', 'HEAD'], ['OPTIONS', 'OPTIONS']]));
  const methodSelect = document.getElementById('inp_1');

  Tool.formRow('URL', Tool.input('https://api.example.com/users'));
  const urlInput = document.getElementById('inp_2');

  Tool.section('Headers (每行一个 Key: Value)');
  const headersArea = Tool.textarea('Content-Type: application/json\nAuthorization: Bearer token123');
  Tool.container.appendChild(headersArea);

  Tool.section('Body');
  const bodyArea = Tool.textarea('{"key": "value"}');
  Tool.container.appendChild(bodyArea);

  const btnRow = Tool.btnRow();
  btnRow.appendChild(Tool.btn('生成全部', generateAll, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    urlInput.value = '';
    headersArea.value = '';
    bodyArea.value = '';
    panels.forEach(p => p.querySelector('textarea') && (p.querySelector('textarea').value = ''));
  }));

  const tabsData = [
    ['curl', document.createElement('div')],
    ['wget', document.createElement('div')],
    ['fetch', document.createElement('div')],
    ['axios', document.createElement('div')],
  ];
  const panels = Tool.tabs(tabsData);
  panels.forEach(p => {
    const ta = Tool.textarea('', true);
    ta.style.minHeight = '150px';
    p.appendChild(ta);
    const copyBtn = Tool.btn('复制', () => Tool.copy(ta.value));
    copyBtn.style.marginTop = '6px';
    p.appendChild(copyBtn);
  });

  function parseHeaders() {
    const h = {};
    headersArea.value.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) h[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
    return h;
  }

  function generateAll() {
    Tool.hideErr(errEl);
    const url = urlInput.value.trim();
    if (!url) { Tool.showErr(errEl, '请输入 URL'); return; }
    const method = methodSelect.value;
    const headers = parseHeaders();
    const body = bodyArea.value.trim();

    panels[0].querySelector('textarea').value = genCurl(method, url, headers, body);
    panels[1].querySelector('textarea').value = genWget(method, url, headers, body);
    panels[2].querySelector('textarea').value = genFetch(method, url, headers, body);
    panels[3].querySelector('textarea').value = genAxios(method, url, headers, body);
  }

  function genCurl(method, url, headers, body) {
    let cmd = `curl -X ${method} '${url}'`;
    Object.entries(headers).forEach(([k, v]) => { cmd += ` \\\n  -H '${k}: ${v}'`; });
    if (body && ['POST','PUT','PATCH'].includes(method)) cmd += ` \\\n  -d '${body}'`;
    return cmd;
  }

  function genWget(method, url, headers, body) {
    let cmd = `wget --method=${method} '${url}'`;
    Object.entries(headers).forEach(([k, v]) => { cmd += ` \\\n  --header='${k}: ${v}'`; });
    if (body && ['POST','PUT','PATCH'].includes(method)) cmd += ` \\\n  --body-data='${body}'`;
    cmd += ' -qO -';
    return cmd;
  }

  function genFetch(method, url, headers, body) {
    const opts = { method };
    if (Object.keys(headers).length) opts.headers = headers;
    if (body && ['POST','PUT','PATCH'].includes(method)) opts.body = body;
    return `fetch('${url}', ${JSON.stringify(opts, null, 2)})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;
  }

  function genAxios(method, url, headers, body) {
    const lower = method.toLowerCase();
    let code = `const axios = require('axios');\n\n`;
    const config = {};
    if (Object.keys(headers).length) config.headers = headers;
    if (body && ['POST','PUT','PATCH'].includes(method)) {
      code += `axios.${lower}('${url}', ${JSON.stringify(body)}`;
      if (Object.keys(config).length) code += `, ${JSON.stringify(config, null, 2)}`;
      code += ')';
    } else {
      if (Object.keys(config).length) {
        code += `axios.${lower}('${url}', ${JSON.stringify(config, null, 2)})`;
      } else {
        code += `axios.${lower}('${url}')`;
      }
    }
    code += `\n  .then(res => console.log(res.data))\n  .catch(err => console.error(err));`;
    return code;
  }
}
