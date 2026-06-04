export const title = 'WebSocket 调试';
export function run(Tool) {
  Tool.header('WebSocket 调试');

  const errEl = Tool.error();

  Tool.formRow('URL', Tool.input('ws://echo.websocket.org 或 ws://localhost:8080'));
  const urlInput = document.getElementById('inp_1');

  const connRow = Tool.btnRow();
  connRow.appendChild(Tool.btn('连接', doConnect, 'primary'));
  connRow.appendChild(Tool.btn('断开', doDisconnect, 'danger'));
  const statusSpan = document.createElement('span');
  statusSpan.style.cssText = 'font-size:12px;color:var(--text2);line-height:32px;margin-left:8px;';
  statusSpan.textContent = '未连接';
  connRow.appendChild(statusSpan);

  Tool.section('消息');
  const msgInput = Tool.input('输入要发送的消息');
  Tool.container.appendChild(msgInput);

  const sendRow = Tool.btnRow();
  sendRow.appendChild(Tool.btn('发送', doSend, 'primary'));
  sendRow.appendChild(Tool.btn('发送 JSON', () => {
    try {
      JSON.parse(msgInput.value);
      doSend();
    } catch {
      const obj = { type: 'message', data: msgInput.value, timestamp: Date.now() };
      msgInput.value = JSON.stringify(obj);
      doSend();
    }
  }));
  sendRow.appendChild(Tool.btn('清空日志', () => { logArea.value = ''; }));

  Tool.section('通信日志');
  const logArea = Tool.textarea('', true);
  logArea.style.minHeight = '250px';
  logArea.style.fontSize = '12px';
  Tool.container.appendChild(logArea);

  let ws = null;

  function log(msg, type) {
    const time = new Date().toLocaleTimeString();
    const prefix = type === 'send' ? '>>>' : type === 'recv' ? '<<<' : '---';
    const label = type === 'send' ? '发送' : type === 'recv' ? '接收' : '系统';
    logArea.value += `[${time}] [${label}] ${prefix} ${msg}\n`;
    logArea.scrollTop = logArea.scrollHeight;
  }

  function doConnect() {
    Tool.hideErr(errEl);
    const url = urlInput.value.trim();
    if (!url) { Tool.showErr(errEl, '请输入 WebSocket URL'); return; }
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      Tool.showErr(errEl, '已有活动连接，请先断开');
      return;
    }
    try {
      ws = new WebSocket(url);
      statusSpan.textContent = '连接中...';
      statusSpan.style.color = '#d69e2e';
      log(`正在连接 ${url}...`);

      ws.onopen = () => {
        statusSpan.textContent = '已连接';
        statusSpan.style.color = 'var(--success)';
        log('连接已建立');
      };

      ws.onmessage = (event) => {
        log(event.data, 'recv');
      };

      ws.onerror = (event) => {
        log('连接错误');
        statusSpan.textContent = '错误';
        statusSpan.style.color = 'var(--danger)';
      };

      ws.onclose = (event) => {
        log(`连接关闭 (code: ${event.code}, reason: ${event.reason || '无'})`);
        statusSpan.textContent = '未连接';
        statusSpan.style.color = 'var(--text2)';
        ws = null;
      };
    } catch (e) {
      Tool.showErr(errEl, '连接失败: ' + e.message);
    }
  }

  function doDisconnect() {
    if (ws) {
      ws.close();
      ws = null;
      log('主动断开连接');
    }
  }

  function doSend() {
    const msg = msgInput.value;
    if (!msg) { Tool.showErr(errEl, '请输入消息'); return; }
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      Tool.showErr(errEl, '未连接，请先建立连接');
      return;
    }
    ws.send(msg);
    log(msg, 'send');
    msgInput.value = '';
  }
}
