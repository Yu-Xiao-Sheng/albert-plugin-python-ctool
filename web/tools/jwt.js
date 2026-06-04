export const title = 'JWT 解析';

export function run(Tool) {
  Tool.header('JWT 解析', 'JWT');

  const inp = Tool.textarea('粘贴 JWT Token (eyJ...)');
  Tool.container.appendChild(inp);

  const err = Tool.error();

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('解析', doDecode, 'primary'));

  // Header section
  const headerSection = Tool.section('Header');
  const headerOut = Tool.textarea('', true);
  headerSection.appendChild(headerOut);

  // Payload section
  const payloadSection = Tool.section('Payload');
  const payloadOut = Tool.textarea('', true);
  payloadSection.appendChild(payloadOut);

  // Status section
  const statusSection = Tool.section('状态');
  const statusDiv = document.createElement('div');
  statusDiv.id = 'jwt-status';
  statusSection.appendChild(statusDiv);

  function doDecode() {
    Tool.hideErr(err);
    headerOut.value = '';
    payloadOut.value = '';
    statusDiv.innerHTML = '';

    const token = inp.value.trim();
    if (!token) { Tool.showErr(err, '请输入 JWT Token'); return; }

    const parts = token.split('.');
    if (parts.length !== 3) { Tool.showErr(err, '无效的 JWT 格式 (需要 3 部分)'); return; }

    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      headerOut.value = JSON.stringify(header, null, 2);
    } catch (e) {
      headerOut.value = '解析失败: ' + e.message;
    }

    try {
      const payload = JSON.parse(b64urlDecode(parts[1]));
      payloadOut.value = JSON.stringify(payload, null, 2);

      // Check expiry
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = Date.now();
        const isExpired = now > payload.exp * 1000;
        const timeLeft = Math.abs(now - payload.exp * 1000);
        const days = Math.floor(timeLeft / 86400000);
        const hours = Math.floor((timeLeft % 86400000) / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);

        const color = isExpired ? '#e74c3c' : '#27ae60';
        const statusText = isExpired
          ? `已过期 (过期 ${days}天${hours}小时${mins}分钟)`
          : `有效 (剩余 ${days}天${hours}小时${mins}分钟)`;

        statusDiv.innerHTML = `
          <div style="padding: 8px 12px; border-radius: 4px; color: white; background: ${color}; margin-bottom: 8px;">
            ${statusText}
          </div>
          <div><strong>签发时间:</strong> ${payload.iat ? new Date(payload.iat * 1000).toLocaleString('zh-CN') : '未指定'}</div>
          <div><strong>过期时间:</strong> ${expDate.toLocaleString('zh-CN')}</div>
          <div><strong>签发者:</strong> ${payload.iss || '未指定'}</div>
          <div><strong>受众:</strong> ${payload.aud || '未指定'}</div>
        `;
      } else {
        statusDiv.innerHTML = '<div style="padding: 8px 12px; border-radius: 4px; color: white; background: #f39c12;">无过期时间 (exp)</div>';
      }
    } catch (e) {
      payloadOut.value = '解析失败: ' + e.message;
    }
  }

  function b64urlDecode(str) {
    let s = str.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return atob(s);
  }
}
