export const title = '原码/反码/补码';

export function run(Tool) {
  Tool.header('原码/反码/补码', 'Binary');

  const inp = Tool.input('输入十进制整数', 'number');
  Tool.formRow('十进制数', inp);

  const bitsSelect = Tool.select([
    ['8', '8 位'],
    ['16', '16 位'],
    ['32', '32 位'],
  ]);
  Tool.formRow('位宽', bitsSelect);

  const err = Tool.error();

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('转换', doConvert, 'primary'));

  const resultSection = Tool.section('结果');
  const resultOut = Tool.textarea('', true);
  resultSection.appendChild(resultOut);

  function doConvert() {
    Tool.hideErr(err);
    const num = parseInt(inp.value);
    if (isNaN(num)) { Tool.showErr(err, '请输入有效整数'); return; }

    const bits = parseInt(bitsSelect.value);
    const maxVal = Math.pow(2, bits - 1) - 1;
    const minVal = -Math.pow(2, bits - 1);

    if (num > maxVal || num < minVal) {
      Tool.showErr(err, `数值超出 ${bits} 位表示范围 (${minVal} ~ ${maxVal})`);
      return;
    }

    const absBin = Math.abs(num).toString(2).padStart(bits, '0');

    let yuanMa, fanMa, buMa;

    if (num >= 0) {
      yuanMa = '0' + absBin.slice(1);
      fanMa = yuanMa;
      buMa = yuanMa;
    } else {
      // 原码: sign bit 1 + abs value
      yuanMa = '1' + absBin.slice(1);

      // 反码: sign bit 1, invert rest
      const inverted = absBin.slice(1).split('').map(b => b === '0' ? '1' : '0').join('');
      fanMa = '1' + inverted;

      // 补码: 反码 + 1
      let complement = fanMa.split('');
      for (let i = complement.length - 1; i > 0; i--) {
        if (complement[i] === '0') {
          complement[i] = '1';
          break;
        } else {
          complement[i] = '0';
        }
      }
      buMa = complement.join('');
    }

    // Hex representation of two's complement
    const hexVal = parseInt(buMa, 2).toString(16).toUpperCase().padStart(bits / 4, '0');

    resultOut.value =
      `十进制: ${num}\n` +
      `二进制: ${absBin}\n` +
      `十六进制: 0x${hexVal}\n\n` +
      `原码: ${formatBin(yuanMa)}\n` +
      `反码: ${formatBin(fanMa)}\n` +
      `补码: ${formatBin(buMa)}\n\n` +
      `位宽: ${bits} 位\n` +
      `范围: ${minVal} ~ ${maxVal}`;
  }

  function formatBin(bin) {
    // Add spaces every 4 bits from left
    return bin.replace(/(.{4})/g, '$1 ').trim();
  }
}
