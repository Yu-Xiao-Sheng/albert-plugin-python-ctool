export const title = '时区转换';

export function run(Tool) {
  Tool.header('时区转换', 'Time');

  const commonTimezones = [
    ['Asia/Shanghai', '中国 (Asia/Shanghai)'],
    ['Asia/Tokyo', '日本 (Asia/Tokyo)'],
    ['Asia/Seoul', '韩国 (Asia/Seoul)'],
    ['Asia/Singapore', '新加坡 (Asia/Singapore)'],
    ['Asia/Kolkata', '印度 (Asia/Kolkata)'],
    ['Asia/Dubai', '迪拜 (Asia/Dubai)'],
    ['Europe/London', '伦敦 (Europe/London)'],
    ['Europe/Paris', '巴黎 (Europe/Paris)'],
    ['Europe/Berlin', '柏林 (Europe/Berlin)'],
    ['Europe/Moscow', '莫斯科 (Europe/Moscow)'],
    ['America/New_York', '纽约 (America/New_York)'],
    ['America/Chicago', '芝加哥 (America/Chicago)'],
    ['America/Denver', '丹佛 (America/Denver)'],
    ['America/Los_Angeles', '洛杉矶 (America/Los_Angeles)'],
    ['Pacific/Auckland', '奥克兰 (Pacific/Auckland)'],
    ['Australia/Sydney', '悉尼 (Australia/Sydney)'],
    ['UTC', 'UTC'],
  ];

  Tool.section('输入时间与时区');

  const dtInput = Tool.input('', 'datetime-local');
  Tool.formRow('日期时间', dtInput);
  // default to now in local
  const now = new Date();
  dtInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const fromTz = Tool.select(commonTimezones);
  Tool.formRow('源时区', fromTz);

  const err = Tool.error();

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('转换', doConvert, 'primary'));

  const outSection = Tool.section('转换结果');
  const outArea = Tool.textarea('', true);
  outSection.appendChild(outArea);

  function doConvert() {
    Tool.hideErr(err);
    if (!dtInput.value) { Tool.showErr(err, '请选择日期时间'); return; }

    const dtVal = dtInput.value;
    const from = fromTz.value;

    // Parse input as if it's in the source timezone
    const results = commonTimezones.map(([tz, label]) => {
      try {
        // Create a formatter to get the date parts in the target timezone
        const parts = new Intl.DateTimeFormat('zh-CN', {
          timeZone: tz,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false,
          weekday: 'short'
        }).formatToParts(new Date(dtVal + (from === 'UTC' ? 'Z' : '')));

        // Calculate offset by comparing source and target
        const getPart = (type) => {
          const p = parts.find(p => p.type === type);
          return p ? p.value : '';
        };

        const formatted = `${getPart('year')}-${getPart('month')}-${getPart('day')} ` +
          `${getPart('hour')}:${getPart('minute')}:${getPart('second')} ${getPart('weekday')}`;
        return `${label}: ${formatted}`;
      } catch (e) {
        return `${label}: 错误`;
      }
    });

    // Highlight the source timezone
    const sourceIdx = commonTimezones.findIndex(([tz]) => tz === from);
    const sourceFormatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: from,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, weekday: 'short'
    });

    outArea.value = results.join('\n');
  }
}
