export const title = '时间计算';

export function run(Tool) {
  Tool.header('时间计算', 'Time');

  const addPanel = document.createElement('div');
  const diffPanel = document.createElement('div');
  Tool.tabs([['时间偏移', addPanel], ['日期差', diffPanel]]);
  Tool.container.appendChild(addPanel);
  Tool.container.appendChild(diffPanel);

  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  // ===== Time offset panel =====
  (function buildAddPanel() {
    const lbl = document.createElement('div');
    lbl.className = 'section-label';
    lbl.textContent = '基准时间';
    addPanel.appendChild(lbl);

    const baseDtInput = Tool.input('', 'datetime-local');
    baseDtInput.value = localNow;
    const r0 = document.createElement('div'); r0.className = 'form-row';
    const l0 = document.createElement('label'); l0.textContent = '基准时间';
    r0.appendChild(l0); r0.appendChild(baseDtInput);
    addPanel.appendChild(r0);

    const lbl2 = document.createElement('div');
    lbl2.className = 'section-label';
    lbl2.textContent = '偏移量';
    addPanel.appendChild(lbl2);

    const opSel = Tool.select([['add', '加 (+)'], ['sub', '减 (-)']]);
    const r1 = document.createElement('div'); r1.className = 'form-row';
    const l1 = document.createElement('label'); l1.textContent = '操作';
    r1.appendChild(l1); r1.appendChild(opSel);
    addPanel.appendChild(r1);

    function makeRow(label, placeholder) {
      const inp = Tool.input(placeholder, 'number');
      const row = document.createElement('div'); row.className = 'form-row';
      const lab = document.createElement('label'); lab.textContent = label;
      row.appendChild(lab); row.appendChild(inp);
      addPanel.appendChild(row);
      return inp;
    }

    const yearsInp = makeRow('年', '年');
    const monthsInp = makeRow('月', '月');
    const daysInput = makeRow('天', '天');
    const hoursInput = makeRow('小时', '小时');
    const minsInput = makeRow('分钟', '分钟');
    const secsInput = makeRow('秒', '秒');

    const err = document.createElement('div'); err.className = 'error';
    addPanel.appendChild(err);

    const br = document.createElement('div'); br.className = 'btn-row';
    br.appendChild(Tool.btn('计算', doCalc, 'primary'));
    addPanel.appendChild(br);

    const out = Tool.textarea('计算结果...', true);
    addPanel.appendChild(out);

    function doCalc() {
      err.classList.remove('show');
      if (!baseDtInput.value) { err.textContent = '请选择基准时间'; err.classList.add('show'); return; }
      const d = new Date(baseDtInput.value);
      if (isNaN(d.getTime())) { err.textContent = '无效的日期'; err.classList.add('show'); return; }
      const sign = opSel.value === 'add' ? 1 : -1;
      d.setFullYear(d.getFullYear() + parseInt(yearsInp.value || 0) * sign);
      d.setMonth(d.getMonth() + parseInt(monthsInp.value || 0) * sign);
      d.setDate(d.getDate() + parseInt(daysInput.value || 0) * sign);
      d.setHours(d.getHours() + parseInt(hoursInput.value || 0) * sign);
      d.setMinutes(d.getMinutes() + parseInt(minsInput.value || 0) * sign);
      d.setSeconds(d.getSeconds() + parseInt(secsInput.value || 0) * sign);
      out.value =
        `结果时间: ${d.toLocaleString('zh-CN', { hour12: false })}\n` +
        `ISO 8601: ${d.toISOString()}\n` +
        `Unix时间戳: ${Math.floor(d.getTime() / 1000)}`;
    }
  })();

  // ===== Date diff panel =====
  (function buildDiffPanel() {
    const lbl = document.createElement('div');
    lbl.className = 'section-label';
    lbl.textContent = '选择两个日期';
    diffPanel.appendChild(lbl);

    const startDt = Tool.input('', 'datetime-local');
    startDt.value = localNow;
    const r0 = document.createElement('div'); r0.className = 'form-row';
    const l0 = document.createElement('label'); l0.textContent = '开始时间';
    r0.appendChild(l0); r0.appendChild(startDt);
    diffPanel.appendChild(r0);

    const endDt = Tool.input('', 'datetime-local');
    endDt.value = localNow;
    const r1 = document.createElement('div'); r1.className = 'form-row';
    const l1 = document.createElement('label'); l1.textContent = '结束时间';
    r1.appendChild(l1); r1.appendChild(endDt);
    diffPanel.appendChild(r1);

    const err = document.createElement('div'); err.className = 'error';
    diffPanel.appendChild(err);

    const br = document.createElement('div'); br.className = 'btn-row';
    br.appendChild(Tool.btn('计算差值', doDiff, 'primary'));
    diffPanel.appendChild(br);

    const out = Tool.textarea('计算结果...', true);
    diffPanel.appendChild(out);

    function doDiff() {
      err.classList.remove('show');
      if (!startDt.value || !endDt.value) { err.textContent = '请选择两个日期时间'; err.classList.add('show'); return; }
      const d1 = new Date(startDt.value);
      const d2 = new Date(endDt.value);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { err.textContent = '无效的日期'; err.classList.add('show'); return; }
      const diffMs = Math.abs(d2 - d1);
      const totalSecs = Math.floor(diffMs / 1000);
      const d = Math.floor(totalSecs / 86400);
      const h = Math.floor((totalSecs % 86400) / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      out.value =
        `相差: ${d} 天 ${h} 小时 ${m} 分钟 ${s} 秒\n` +
        `总计: ${totalSecs} 秒 / ${Math.floor(diffMs / 60000)} 分钟 / ${Math.floor(diffMs / 3600000)} 小时 / ${d} 天\n` +
        `开始: ${d1.toLocaleString('zh-CN', { hour12: false })}\n` +
        `结束: ${d2.toLocaleString('zh-CN', { hour12: false })}`;
    }
  })();
}
