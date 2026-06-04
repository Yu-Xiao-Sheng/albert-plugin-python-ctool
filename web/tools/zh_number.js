export const title = '中文数字转换';
export function run(Tool) {
  Tool.header('中文数字转换');

  const err = Tool.error();

  const modeRow = Tool.formRow('转换模式', null);
  const modeSel = Tool.select([
    ['num2zh', '数字 → 中文'],
    ['zh2num', '中文 → 数字'],
    ['num2upper', '数字 → 金额大写'],
  ]);
  modeRow.appendChild(modeSel);

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('转换', doConvert, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('输出');
  const output = Tool.textarea('转换结果...', true);
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));

  const ZH_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const ZH_UNITS = ['', '十', '百', '千'];
  const ZH_BIG_UNITS = ['', '万', '亿', '兆'];

  const UPPER_DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const UPPER_UNITS = ['', '拾', '佰', '仟'];
  const UPPER_BIG_UNITS = ['', '万', '亿', '兆'];

  // Number to Chinese
  function numToZh(num) {
    if (num === 0) return '零';
    const isNeg = num < 0;
    let absNum = Math.abs(num);

    // Handle decimal part
    let intPart = Math.floor(absNum);
    let decPart = absNum - intPart;
    let decStr = '';
    if (decPart > 1e-10) {
      decStr = '点';
      const decDigits = decPart.toFixed(10).substring(2).replace(/0+$/, '');
      for (const ch of decDigits) {
        decStr += ZH_DIGITS[parseInt(ch)];
      }
    }

    if (intPart === 0) return (isNeg ? '负' : '') + '零' + decStr;

    const intStr = convertIntPart(intPart, ZH_DIGITS, ZH_UNITS, ZH_BIG_UNITS);
    return (isNeg ? '负' : '') + intStr + decStr;
  }

  // Number to uppercase money format
  function numToUpperMoney(num) {
    if (num === 0) return '零圆整';

    const isNeg = num < 0;
    let absNum = Math.abs(num);
    // Round to 2 decimal places
    absNum = Math.round(absNum * 100) / 100;

    const intPart = Math.floor(absNum);
    const fenPart = Math.round((absNum - intPart) * 100);
    const jiao = Math.floor(fenPart / 10);
    const fen = fenPart % 10;

    let result = isNeg ? '负' : '';

    if (intPart === 0) {
      result += '零圆';
    } else {
      result += convertIntPart(intPart, UPPER_DIGITS, UPPER_UNITS, UPPER_BIG_UNITS);
      result += '圆';
    }

    if (jiao === 0 && fen === 0) {
      result += '整';
    } else {
      if (jiao > 0) {
        result += UPPER_DIGITS[jiao] + '角';
      } else if (intPart > 0) {
        result += '零';
      }
      if (fen > 0) {
        result += UPPER_DIGITS[fen] + '分';
      }
    }

    return result;
  }

  function convertIntPart(num, digits, units, bigUnits) {
    if (num === 0) return digits[0];

    // Split into groups of 4 digits from right
    const groups = [];
    let n = num;
    while (n > 0) {
      groups.push(n % 10000);
      n = Math.floor(n / 10000);
    }

    let result = '';
    let needZero = false;

    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g === 0) {
        needZero = true;
        continue;
      }

      if (needZero || (i < groups.length - 1 && g < 1000)) {
        result += digits[0];
        needZero = false;
      }

      result += convertGroup(g, digits, units) + bigUnits[i];
    }

    return result;
  }

  function convertGroup(num, digits, units) {
    if (num === 0) return '';
    let result = '';
    const d0 = Math.floor(num / 1000);
    const d1 = Math.floor((num % 1000) / 100);
    const d2 = Math.floor((num % 100) / 10);
    const d3 = num % 10;

    let prevZero = false;
    if (d0 > 0) {
      result += digits[d0] + units[3];
    } else {
      prevZero = true;
    }
    if (d1 > 0) {
      result += digits[d1] + units[2];
      prevZero = false;
    } else if (!prevZero && (d2 > 0 || d3 > 0)) {
      result += digits[0];
      prevZero = true;
    }
    if (d2 > 0) {
      result += digits[d2] + units[1];
      prevZero = false;
    } else if (!prevZero && d3 > 0) {
      result += digits[0];
      prevZero = true;
    }
    if (d3 > 0) {
      result += digits[d3];
    }

    return result;
  }

  // Chinese to Number
  function zhToNum(str) {
    str = str.trim();
    if (!str) return NaN;

    const zhDigitMap = {
      '零': 0, '〇': 0, '一': 1, '壹': 1, '二': 2, '贰': 2, '两': 2, '三': 3, '叁': 3,
      '四': 4, '肆': 4, '五': 5, '伍': 5, '六': 6, '陆': 6, '七': 7, '柒': 7,
      '八': 8, '捌': 8, '九': 9, '玖': 9
    };
    const zhUnitMap = {
      '十': 10, '拾': 10, '百': 100, '佰': 100, '千': 1000, '仟': 1000,
      '万': 10000, '亿': 100000000, '兆': 1000000000000
    };

    let isNeg = false;
    if (str.startsWith('负') || str.startsWith('－') || str.startsWith('-')) {
      isNeg = true;
      str = str.substring(1);
    }

    // Handle decimal point
    const dotIdx = str.indexOf('点');
    let intStr = str;
    let decStr = '';
    if (dotIdx >= 0) {
      intStr = str.substring(0, dotIdx);
      decStr = str.substring(dotIdx + 1);
    }

    // Also handle 圆/元 for money format - strip trailing unit chars
    intStr = intStr.replace(/[圆元角分整]+$/g, '');

    if (!intStr || intStr === '零') {
      let result = 0;
      let decVal = 0;
      if (decStr) {
        for (const ch of decStr) {
          if (zhDigitMap[ch] !== undefined) {
            decVal = decVal * 10 + zhDigitMap[ch];
          }
        }
        const decLen = decStr.length;
        result += decVal / Math.pow(10, decLen);
      }
      return isNeg ? -result : result;
    }

    let result = 0;
    let current = 0;
    let temp = 0;

    for (let i = 0; i < intStr.length; i++) {
      const ch = intStr[i];

      if (zhDigitMap[ch] !== undefined) {
        temp = zhDigitMap[ch];
      } else if (zhUnitMap[ch] !== undefined) {
        const unit = zhUnitMap[ch];
        if (unit >= 10000) {
          // Big unit: 万亿兆
          if (temp === 0 && current === 0) temp = 1;
          current = (current + temp) * unit;
          result += current;
          current = 0;
          temp = 0;
        } else {
          // Small unit: 十百千
          if (temp === 0) temp = 1; // e.g., 十二 => 12
          current += temp * unit;
          temp = 0;
        }
      }
    }
    result += current + temp;

    // Handle decimal
    if (decStr) {
      let decVal = 0;
      const validDecDigits = [];
      for (const ch of decStr) {
        if (zhDigitMap[ch] !== undefined) {
          validDecDigits.push(zhDigitMap[ch]);
        }
      }
      for (const d of validDecDigits) {
        decVal = decVal * 10 + d;
      }
      result += decVal / Math.pow(10, validDecDigits.length);
    }

    return isNeg ? -result : result;
  }

  function doConvert() {
    Tool.hideErr(err);
    const val = input.value.trim();
    if (!val) {
      Tool.showErr(err, '请输入内容');
      return;
    }

    const mode = modeSel.value;
    try {
      if (mode === 'num2zh') {
        const num = parseFloat(val);
        if (isNaN(num)) {
          Tool.showErr(err, '请输入有效的数字');
          return;
        }
        output.value = numToZh(num);
      } else if (mode === 'zh2num') {
        const result = zhToNum(val);
        if (isNaN(result)) {
          Tool.showErr(err, '无法识别的中文数字');
          return;
        }
        output.value = String(result);
      } else if (mode === 'num2upper') {
        const num = parseFloat(val);
        if (isNaN(num)) {
          Tool.showErr(err, '请输入有效的数字');
          return;
        }
        output.value = numToUpperMoney(num);
      }
    } catch (e) {
      Tool.showErr(err, '转换失败: ' + e.message);
    }
  }
}
