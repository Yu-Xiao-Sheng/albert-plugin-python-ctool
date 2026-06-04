export const title = '时间戳转换';

export function run(Tool) {
  Tool.header('时间戳转换', 'Time');

  const nowTs = Math.floor(Date.now() / 1000);
  const nowMs = Date.now();

  // current timestamp section
  const secNow = Tool.section('当前时间戳');
  Tool.html(secNow, `<div class="result-block">
    <div><strong>秒级:</strong> <code id="cur-sec">${nowTs}</code>
      <button class="btn-sm" onclick="Tool.copy('${nowTs}')">复制</button></div>
    <div><strong>毫秒级:</strong> <code id="cur-ms">${nowMs}</code>
      <button class="btn-sm" onclick="Tool.copy('${nowMs}')">复制</button></div>
  </div>`);

  // update current timestamp every second
  setInterval(() => {
    const s = Math.floor(Date.now() / 1000);
    const m = Date.now();
    const secEl = document.getElementById('cur-sec');
    const msEl = document.getElementById('cur-ms');
    if (secEl) secEl.textContent = s;
    if (msEl) msEl.textContent = m;
  }, 1000);

  // tab panels
  const ts2datePanel = document.createElement('div');
  const date2tsPanel = document.createElement('div');

  Tool.tabs([['时间戳 → 日期', ts2datePanel], ['日期 → 时间戳', date2tsPanel]]);
  Tool.container.appendChild(ts2datePanel);
  Tool.container.appendChild(date2tsPanel);

  // Tab: timestamp to date
  const inp1 = Tool.input('输入时间戳 (秒或毫秒)');
  Tool.formRow('时间戳', inp1, ts2datePanel);
  ts2datePanel.appendChild(inp1);

  const err1 = Tool.error();
  ts2datePanel.appendChild(err1);

  const br1 = document.createElement('div');
  br1.className = 'btn-row';
  br1.appendChild(Tool.btn('转换', doConvert, 'primary'));
  ts2datePanel.appendChild(br1);

  const out1 = Tool.textarea('转换结果...', true);
  ts2datePanel.appendChild(out1);

  function doConvert() {
    Tool.hideErr(err1);
    const raw = inp1.value.trim();
    if (!raw) { Tool.showErr(err1, '请输入时间戳'); return; }
    const num = Number(raw);
    if (isNaN(num)) { Tool.showErr(err1, '无效的时间戳'); return; }
    const ms = raw.length > 10 ? num : num * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) { Tool.showErr(err1, '无效的时间戳'); return; }
    out1.value =
      `本地时间: ${d.toLocaleString('zh-CN', { hour12: false })}\n` +
      `UTC时间:  ${d.toUTCString()}\n` +
      `ISO 8601: ${d.toISOString()}\n` +
      `秒级时间戳: ${Math.floor(ms / 1000)}\n` +
      `毫秒时间戳: ${ms}`;
  }

  // Tab: date to timestamp
  const inp2 = Tool.input('', 'datetime-local');
  Tool.formRow('日期时间', inp2, date2tsPanel);
  date2tsPanel.appendChild(inp2);

  // set default to now
  const now = new Date();
  const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  inp2.value = localISO;

  const err2 = Tool.error();
  date2tsPanel.appendChild(err2);

  const br2 = document.createElement('div');
  br2.className = 'btn-row';
  br2.appendChild(Tool.btn('转换', doConvertDate, 'primary'));
  date2tsPanel.appendChild(br2);

  const out2 = Tool.textarea('转换结果...', true);
  date2tsPanel.appendChild(out2);

  function doConvertDate() {
    Tool.hideErr(err2);
    if (!inp2.value) { Tool.showErr(err2, '请选择日期时间'); return; }
    const d = new Date(inp2.value);
    if (isNaN(d.getTime())) { Tool.showErr(err2, '无效的日期'); return; }
    const sec = Math.floor(d.getTime() / 1000);
    out2.value =
      `本地时间: ${d.toLocaleString('zh-CN', { hour12: false })}\n` +
      `UTC时间:  ${d.toUTCString()}\n` +
      `秒级时间戳: ${sec}\n` +
      `毫秒时间戳: ${d.getTime()}`;
  }
}
