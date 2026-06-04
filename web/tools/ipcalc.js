export const title = 'IP 子网计算';
export function run(Tool) {
  Tool.header('IP 子网计算器');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.input('请输入 IP/CIDR，如 192.168.1.0/24', 'text');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('计算', doCalc, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('计算结果');
  const output = Tool.textarea('计算结果...', true);
  output.style.fontFamily = 'monospace';
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制结果', () => {
    if (output.value) Tool.copy(output.value);
  }));

  function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  }

  function intToIp(num) {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ].join('.');
  }

  function ipToBinary(ip) {
    return ip.split('.').map(n => parseInt(n).toString(2).padStart(8, '0')).join('.');
  }

  function intToBinary(num) {
    return [
      ((num >>> 24) & 0xFF).toString(2).padStart(8, '0'),
      ((num >>> 16) & 0xFF).toString(2).padStart(8, '0'),
      ((num >>> 8) & 0xFF).toString(2).padStart(8, '0'),
      (num & 0xFF).toString(2).padStart(8, '0')
    ].join('.');
  }

  function doCalc() {
    Tool.hideErr(err);
    const val = input.value.trim();
    if (!val) {
      Tool.showErr(err, '请输入 IP/CIDR');
      return;
    }

    const match = val.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (!match) {
      Tool.showErr(err, '格式错误，请使用 IP/CIDR 格式，如 192.168.1.0/24');
      return;
    }

    const ip = match[1];
    const cidr = parseInt(match[2]);

    const ipParts = ip.split('.').map(Number);
    for (const p of ipParts) {
      if (p < 0 || p > 255) {
        Tool.showErr(err, 'IP 地址格式错误');
        return;
      }
    }
    if (cidr < 0 || cidr > 32) {
      Tool.showErr(err, 'CIDR 必须在 0-32 之间');
      return;
    }

    const ipInt = ipToInt(ip);
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;
    const firstHostInt = cidr >= 31 ? networkInt : (networkInt + 1) >>> 0;
    const lastHostInt = cidr >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0;
    const totalHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;

    const lines = [
      'IP 地址:      ' + ip + '    ' + ipToBinary(ip),
      '子网掩码:     ' + intToIp(maskInt) + '    ' + intToBinary(maskInt),
      '通配符掩码:   ' + intToIp(wildcardInt) + '    ' + intToBinary(wildcardInt),
      '────────────────────────────────────────────────',
      '网络地址:     ' + intToIp(networkInt),
      '广播地址:     ' + intToIp(broadcastInt),
      '第一个主机:   ' + intToIp(firstHostInt),
      '最后一个主机: ' + intToIp(lastHostInt),
      '主机数量:     ' + totalHosts.toLocaleString(),
      'CIDR:         /' + cidr,
      'IP 类型:      ' + getIpClass(ipParts[0]),
    ];
    output.value = lines.join('\n');
  }

  function getIpClass(first) {
    if (first < 128) return 'A 类 (1-127)';
    if (first < 192) return 'B 类 (128-191)';
    if (first < 224) return 'C 类 (192-223)';
    if (first < 240) return 'D 类 (组播, 224-239)';
    return 'E 类 (保留, 240-255)';
  }
}
