export const title = '颜色转换';
export function run(Tool) {
  Tool.header('颜色转换器');

  const err = Tool.error();

  // Color preview swatch
  const previewRow = Tool.formRow('预览', null);
  const swatch = document.createElement('div');
  swatch.style.cssText = 'width:100px;height:40px;border:1px solid #555;border-radius:4px;background-color:#000000;vertical-align:middle;';
  previewRow.appendChild(swatch);

  // Color picker
  const pickerRow = Tool.formRow('取色器', null);
  const picker = document.createElement('input');
  picker.type = 'color';
  picker.value = '#000000';
  picker.style.cssText = 'width:60px;height:32px;padding:0;border:none;cursor:pointer;';
  picker.addEventListener('input', () => {
    input.value = picker.value;
    doConvert();
  });
  pickerRow.appendChild(picker);

  const inputSec = Tool.section('输入');
  const formatRow = Tool.formRow('输入格式', null);
  const formatSel = Tool.select([
    ['auto', '自动检测'],
    ['hex', 'Hex (#RGB / #RRGGBB)'],
    ['rgb', 'RGB (r,g,b / rgb(r,g,b))'],
    ['hsl', 'HSL (h,s%,l% / hsl(h,s%,l%))'],
  ]);
  formatRow.appendChild(formatSel);

  const input = Tool.input('输入颜色值，如 #FF5733 / rgb(255,87,51) / hsl(11,100%,60%)', 'text');
  input.addEventListener('input', () => doConvert());
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('转换', doConvert, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    swatch.style.backgroundColor = '#000000';
    picker.value = '#000000';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('转换结果');
  const output = Tool.textarea('转换结果...', true);
  output.style.fontFamily = 'monospace';
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));

  function parseInput(str) {
    str = str.trim();
    const fmt = formatSel.value;

    if (fmt === 'hex' || (fmt === 'auto' && str.startsWith('#'))) {
      let hex = str.substring(1);
      if (hex.length === 3) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
      const r = parseInt(hex.substring(0,2), 16);
      const g = parseInt(hex.substring(2,4), 16);
      const b = parseInt(hex.substring(4,6), 16);
      return {r, g, b};
    }

    if (fmt === 'rgb' || (fmt === 'auto' && (str.startsWith('rgb') || str.includes(',')))) {
      const m = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (m) return {r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3])};
      const parts = str.split(',').map(s => parseInt(s.trim()));
      if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
        return {r: parts[0], g: parts[1], b: parts[2]};
      }
      return null;
    }

    if (fmt === 'hsl' || (fmt === 'auto' && str.startsWith('hsl'))) {
      const m = str.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
      if (m) return hslToRgb(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
      const m2 = str.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
      if (m2) return hslToRgb(parseInt(m2[1]), parseInt(m2[2]), parseInt(m2[3]));
      return null;
    }

    // Auto: try hex first, then rgb, then hsl
    if (str.startsWith('#')) {
      let hex = str.substring(1);
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      if (/^[0-9a-fA-F]{6}$/.test(hex)) {
        return {r: parseInt(hex.substring(0,2),16), g: parseInt(hex.substring(2,4),16), b: parseInt(hex.substring(4,6),16)};
      }
    }

    const rgbM = str.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbM) return {r: parseInt(rgbM[1]), g: parseInt(rgbM[2]), b: parseInt(rgbM[3])};

    const parts = str.split(',').map(s => parseInt(s.trim()));
    if (parts.length === 3 && parts.every(n => !isNaN(n))) {
      // Heuristic: if any value > 360 or there's a % sign, treat as HSL
      if (str.includes('%') || (parts.every(n => n >= 0 && n <= 360) && parts[0] <= 360 && parts[1] <= 100 && parts[2] <= 100)) {
        return hslToRgb(parts[0], parts[1], parts[2]);
      }
      if (parts.every(n => n >= 0 && n <= 255)) {
        return {r: parts[0], g: parts[1], b: parts[2]};
      }
    }

    const hslM = str.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/);
    if (hslM) return hslToRgb(parseInt(hslM[1]), parseInt(hslM[2]), parseInt(hslM[3]));

    return null;
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r1, g1, b1;
    if (h < 60)      { r1 = c; g1 = x; b1 = 0; }
    else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
    else              { r1 = c; g1 = 0; b1 = x; }
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function toHex(n) {
    return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  }

  function doConvert() {
    Tool.hideErr(err);
    const val = input.value.trim();
    if (!val) return;

    const rgb = parseInput(val);
    if (!rgb) {
      Tool.showErr(err, '无法识别的颜色格式');
      return;
    }

    const {r, g, b} = rgb;
    const hex6 = '#' + toHex(r) + toHex(g) + toHex(b);
    const hex6Up = hex6.toUpperCase();
    const hex3 = '#' + toHex(r)[0] + toHex(g)[0] + toHex(b)[0];
    const hsl = rgbToHsl(r, g, b);

    swatch.style.backgroundColor = hex6;
    picker.value = hex6;

    const lines = [
      'HEX (6位):   ' + hex6Up,
      'HEX (3位):   ' + hex3.toUpperCase(),
      'RGB:         rgb(' + r + ', ' + g + ', ' + b + ')',
      'HSL:         hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)',
      '──────────────────────────────',
      'R: ' + r + '  G: ' + g + '  B: ' + b,
      'R(Hex): ' + toHex(r).toUpperCase() + '  G(Hex): ' + toHex(g).toUpperCase() + '  B(Hex): ' + toHex(b).toUpperCase(),
      'H: ' + hsl.h + '  S: ' + hsl.s + '%  L: ' + hsl.l + '%',
    ];
    output.value = lines.join('\n');
  }
}
