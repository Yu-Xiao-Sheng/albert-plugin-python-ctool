export const title = 'Crontab 解析';
export function run(Tool) {
  Tool.header('Crontab 解析');

  const errEl = Tool.error();

  Tool.formRow('Cron 表达式', Tool.input('* * * * *（分 时 日 月 周）'));
  const cronInput = document.getElementById('inp_1');

  const fieldNames = ['分钟', '小时', '日', '月', '星期'];
  const fieldRanges = ['0-59', '0-23', '1-31', '1-12', '0-6'];

  const btnRow = Tool.btnRow();
  btnRow.appendChild(Tool.btn('解析', parse, 'primary'));
  btnRow.appendChild(Tool.btn('示例: 每分钟', () => { cronInput.value = '* * * * *'; parse(); }));
  btnRow.appendChild(Tool.btn('示例: 每小时', () => { cronInput.value = '0 * * * *'; parse(); }));
  btnRow.appendChild(Tool.btn('示例: 每天零点', () => { cronInput.value = '0 0 * * *'; parse(); }));
  btnRow.appendChild(Tool.btn('示例: 每周一早9点', () => { cronInput.value = '0 9 * * 1'; parse(); }));

  Tool.section('字段说明');
  const descArea = Tool.textarea('', true);
  descArea.style.minHeight = '80px';
  Tool.container.appendChild(descArea);

  Tool.section('下次运行时间');
  const nextArea = Tool.textarea('', true);
  nextArea.style.minHeight = '120px';
  Tool.container.appendChild(nextArea);

  Tool.section('人类可读描述');
  const humanDiv = document.createElement('div');
  humanDiv.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius:var(--radius);font-size:14px;line-height:1.6;background:#f7fafc;';
  Tool.container.appendChild(humanDiv);

  function parse() {
    Tool.hideErr(errEl);
    const parts = cronInput.value.trim().split(/\s+/);
    if (parts.length !== 5) {
      Tool.showErr(errEl, 'Cron 表达式必须有 5 个字段（分 时 日 月 周）');
      return;
    }

    let fieldDesc = fieldNames.map((name, i) => {
      const range = fieldRanges[i];
      return `${name}(${range}): ${expandField(parts[i], i)}`;
    }).join('\n');
    descArea.value = fieldDesc;

    humanDiv.textContent = toHuman(parts);

    try {
      const nextTimes = getNextRuns(parts, 5);
      nextArea.value = nextTimes.map((t, i) => `${i + 1}. ${t}`).join('\n');
    } catch (e) {
      Tool.showErr(errEl, '计算运行时间出错: ' + e.message);
      nextArea.value = '';
    }
  }

  function expandField(field, idx) {
    const ranges = [[0,59],[0,23],[1,31],[1,12],[0,6]];
    const [min, max] = ranges[idx];
    if (field === '*') return `每${fieldNames[idx]} (${min}-${max})`;
    if (field.includes('/')) {
      const [base, step] = field.split('/');
      return `从 ${base === '*' ? min : base} 开始，每 ${step} ${fieldNames[idx]}`;
    }
    if (field.includes(',')) return `${field}（指定值）`;
    if (field.includes('-')) return `从 ${field.replace('-', ' 到 ')}`;
    return `固定值 ${field}`;
  }

  function toHuman(parts) {
    const [min, hour, day, month, dow] = parts;
    if (min === '*' && hour === '*' && day === '*' && month === '*' && dow === '*') return '每分钟执行一次';
    if (hour === '*' && day === '*' && month === '*' && dow === '*' && min !== '*') return `每小时的第 ${min} 分钟执行`;
    if (day === '*' && month === '*' && dow === '*') return `每天 ${hour}:${min.padStart(2,'0')} 执行`;
    if (month === '*' && dow === '*') return `每月 ${day} 日 ${hour}:${min.padStart(2,'0')} 执行`;
    const weekDays = ['日','一','二','三','四','五','六'];
    if (day === '*' && month === '*') return `每星期${weekDays[parseInt(dow)] || dow} ${hour}:${min.padStart(2,'0')} 执行`;
    return `${parts.join(' ')} - 自定义计划`;
  }

  function getNextRuns(parts, count) {
    const cron = parseCronField(parts);
    const results = [];
    const now = new Date();
    let next = new Date(now.getTime() + 60000);
    next.setSeconds(0, 0);

    for (let i = 0; i < count; i++) {
      next = findNext(cron, next);
      if (!next) break;
      results.push(formatDate(next));
      next = new Date(next.getTime() + 60000);
    }
    return results.length ? results : ['无法计算（表达式可能无效）'];
  }

  function parseCronField(parts) {
    return parts.map((p, idx) => {
      const ranges = [[0,59],[0,23],[1,31],[1,12],[0,6]];
      const [min, max] = ranges[idx];
      const vals = new Set();
      p.split(',').forEach(seg => {
        if (seg.includes('/')) {
          const [range, step] = seg.split('/');
          const s = step ? parseInt(step) : 1;
          let [start, end] = range === '*' ? [min, max] : range.split('-').map(Number);
          if (isNaN(end)) end = max;
          for (let v = start; v <= end; v += s) vals.add(v);
        } else if (seg.includes('-')) {
          const [start, end] = seg.split('-').map(Number);
          for (let v = start; v <= end; v++) vals.add(v);
        } else if (seg === '*') {
          for (let v = min; v <= max; v++) vals.add(v);
        } else {
          vals.add(parseInt(seg));
        }
      });
      return [...vals].sort((a, b) => a - b);
    });
  }

  function findNext(cron, start) {
    const d = new Date(start);
    for (let i = 0; i < 525600; i++) {
      if (cron[2].includes(d.getDate()) && cron[3].includes(d.getMonth() + 1) && cron[4].includes(d.getDay()) && cron[1].includes(d.getHours()) && cron[0].includes(d.getMinutes())) {
        return d;
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    return null;
  }

  function formatDate(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} (${['日','一','二','三','四','五','六'][d.getDay()]})`;
  }
}
