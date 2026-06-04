export const title = 'IP 信息查询';
export function run(Tool) {
  Tool.header('IP 信息查询', '需要网络');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.input('请输入 IP 地址，如 8.8.8.8', 'text');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  let loading = false;
  const queryBtn = Tool.btn('查询', doQuery, 'primary');
  row.appendChild(queryBtn);
  row.appendChild(Tool.btn('查询本机 IP', () => {
    input.value = '';
    doQuery();
  }));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('查询结果');
  const output = Tool.textarea('查询结果...', true);
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制结果', () => {
    if (output.value) Tool.copy(output.value);
  }));

  async function doQuery() {
    Tool.hideErr(err);
    if (loading) return;

    const ip = input.value.trim();
    const url = ip ? `http://ip-api.com/json/${ip}?lang=zh-CN` : 'http://ip-api.com/json/?lang=zh-CN';

    loading = true;
    queryBtn.textContent = '查询中...';
    queryBtn.disabled = true;
    output.value = '正在查询，请稍候...';

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      if (data.status === 'fail') {
        Tool.showErr(err, '查询失败: ' + (data.message || '无效的 IP 地址'));
        output.value = '';
        return;
      }

      const lines = [
        '国家: ' + (data.country || '-'),
        '地区: ' + (data.regionName || '-'),
        '城市: ' + (data.city || '-'),
        'ISP: ' + (data.isp || '-'),
        '组织: ' + (data.org || '-'),
        '时区: ' + (data.timezone || '-'),
        '经度: ' + (data.lon != null ? data.lon : '-'),
        '纬度: ' + (data.lat != null ? data.lat : '-'),
        'IP: ' + (data.query || '-'),
        'AS: ' + (data.as || '-'),
      ];
      output.value = lines.join('\n');
    } catch (e) {
      Tool.showErr(err, '查询失败: ' + e.message);
      output.value = '';
    } finally {
      loading = false;
      queryBtn.textContent = '查询';
      queryBtn.disabled = false;
    }
  }
}
