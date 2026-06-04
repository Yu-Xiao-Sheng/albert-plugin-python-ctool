export const title = '校验和计算';
export function run(Tool) {
  Tool.header('数据校验和');

  const err = Tool.error();

  const algRow = Tool.formRow('算法', null);
  const algSel = Tool.select([
    ['bcc', 'BCC (异或校验)'],
    ['lrc', 'LRC (纵向冗余校验)'],
    ['crc32', 'CRC32'],
  ]);
  algRow.appendChild(algSel);

  const encRow = Tool.formRow('输入编码', null);
  const encSel = Tool.select([
    ['hex', 'HEX (十六进制)'],
    ['ascii', 'ASCII 文本'],
    ['utf8', 'UTF-8 文本'],
  ]);
  encRow.appendChild(encSel);

  const inputSec = Tool.section('输入数据');
  const input = Tool.textarea('输入数据...\nHEX 示例: 01 03 00 00 00 0A\n文本示例: Hello World');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('计算', doCalc, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('校验结果');
  const output = Tool.textarea('校验结果...', true);
  output.style.fontFamily = 'monospace';
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));

  function inputToBytes(text) {
    const encoding = encSel.value;
    if (encoding === 'hex') {
      // Parse hex string, supporting space-separated, continuous, or comma-separated
      const cleaned = text.replace(/[\s,]/g, '');
      if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
        throw new Error('无效的 HEX 输入，请输入偶数个十六进制字符');
      }
      const bytes = [];
      for (let i = 0; i < cleaned.length; i += 2) {
        bytes.push(parseInt(cleaned.substring(i, i + 2), 16));
      }
      return new Uint8Array(bytes);
    } else {
      const encoder = new TextEncoder();
      return encoder.encode(text);
    }
  }

  // BCC: XOR all bytes
  function calcBCC(bytes) {
    let result = 0;
    for (let i = 0; i < bytes.length; i++) {
      result ^= bytes[i];
    }
    return result;
  }

  // LRC: Two's complement of sum of bytes
  function calcLRC(bytes) {
    let sum = 0;
    for (let i = 0; i < bytes.length; i++) {
      sum += bytes[i];
    }
    return ((~sum + 1) & 0xFF);
  }

  // CRC32 with lookup table
  const crc32Table = (function() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let crc = i;
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >>> 1) ^ 0xEDB88320;
        } else {
          crc = crc >>> 1;
        }
      }
      table[i] = crc >>> 0;
    }
    return table;
  })();

  function calcCRC32(bytes) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc32Table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function doCalc() {
    Tool.hideErr(err);
    const text = input.value;
    if (!text.trim()) {
      Tool.showErr(err, '请输入数据');
      return;
    }

    try {
      const bytes = inputToBytes(text);
      if (bytes.length === 0) {
        Tool.showErr(err, '没有有效的数据');
        return;
      }

      const alg = algSel.value;
      let result;
      let resultHex;
      let algName;

      if (alg === 'bcc') {
        result = calcBCC(bytes);
        resultHex = result.toString(16).toUpperCase().padStart(2, '0');
        algName = 'BCC (XOR)';
      } else if (alg === 'lrc') {
        result = calcLRC(bytes);
        resultHex = result.toString(16).toUpperCase().padStart(2, '0');
        algName = 'LRC';
      } else {
        result = calcCRC32(bytes);
        resultHex = result.toString(16).toUpperCase().padStart(8, '0');
        algName = 'CRC32';
      }

      const hexDump = Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
      const lines = [
        '算法:        ' + algName,
        '数据长度:    ' + bytes.length + ' 字节',
        '数据 (HEX):  ' + hexDump,
        '────────────────────────────────',
        '校验值 (HEX): ' + resultHex,
        '校验值 (DEC): ' + result,
        '校验值 (BIN): ' + (result >>> 0).toString(2).padStart(alg === 'crc32' ? 32 : 8, '0'),
      ];
      output.value = lines.join('\n');
    } catch (e) {
      Tool.showErr(err, '计算失败: ' + e.message);
    }
  }
}
