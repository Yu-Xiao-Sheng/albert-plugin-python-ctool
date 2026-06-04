export const title = 'Punycode 编解码';
export function run(Tool) {
  Tool.header('Punycode 编码/解码 (IDN 域名)');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.input('请输入域名，如: 中文.com', 'text');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('编码 (域名→Punycode)', () => {
    Tool.hideErr(err);
    try {
      const domain = input.value.trim();
      if (!domain) {
        Tool.showErr(err, '请输入域名');
        return;
      }
      // Use the URL API to convert internationalized domain names
      // The hostname property of a URL with non-ASCII chars returns punycode
      const parts = domain.split('.');
      const encoded = parts.map(part => {
        // Check if the part contains non-ASCII characters
        if (/[\x80-\xFF]/.test(part)) {
          // Create a fake URL to get punycode encoding
          try {
            const url = new URL('http://' + part);
            return url.hostname;
          } catch {
            // Fallback: use manual punycode encoding for each label
            return encodePunycode(part);
          }
        }
        return part;
      }).join('.');
      output.value = encoded;
    } catch (e) {
      Tool.showErr(err, '编码失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('解码 (Punycode→域名)', () => {
    Tool.hideErr(err);
    try {
      const domain = input.value.trim();
      if (!domain) {
        Tool.showErr(err, '请输入域名');
        return;
      }
      // For decoding, we try to use the URL constructor
      // Some browsers auto-decode xn-- domains
      const parts = domain.split('.');
      const decoded = parts.map(part => {
        if (part.startsWith('xn--')) {
          try {
            const url = new URL('http://' + part);
            // Some browsers return decoded form
            return url.hostname;
          } catch {
            return part;
          }
        }
        return part;
      }).join('.');
      output.value = decoded;
    } catch (e) {
      Tool.showErr(err, '解码失败: ' + e.message);
    }
  }));

  // Simple Punycode encoding implementation (RFC 3492)
  function encodePunycode(input) {
    const base = 36;
    const tmin = 1;
    const tmax = 26;
    const skew = 38;
    const damp = 700;
    const initialBias = 72;
    const initialN = 128;
    const delimiter = '-';

    let n = initialN;
    let delta = 0;
    let bias = initialBias;
    let output = '';

    // Handle basic code points
    const basicChars = [];
    const nonBasicChars = [];
    for (let i = 0; i < input.length; i++) {
      const cp = input.codePointAt(i);
      if (cp < 128) {
        basicChars.push(cp);
        output += String.fromCharCode(cp);
      } else {
        nonBasicChars.push(cp);
        if (cp > 0xFFFF) i++; // skip surrogate pair
      }
    }

    if (basicChars.length > 0 && nonBasicChars.length > 0) {
      output += delimiter;
    }

    let h = basicChars.length;
    const b = basicChars.length;
    const sorted = [...new Set(nonBasicChars)].sort((a, b) => a - b);
    let charIndex = 0;

    while (charIndex < sorted.length) {
      const m = sorted[charIndex];
      delta = delta + (m - n) * (h + 1);
      n = m;

      for (let i = 0; i < input.length; i++) {
        const c = input.codePointAt(i);
        if (c < n) {
          delta++;
        }
        if (c === n) {
          let q = delta;
          let k = base;
          while (true) {
            const t = k <= bias ? tmin : (k >= bias + tmax ? tmax : k - bias);
            if (q < t) break;
            output += String.fromCharCode(
              ((t + (q - t) % (base - t)) < 26 ? 97 : 22) +
              ((t + (q - t) % (base - t)) % (base - t < 0 ? base : base - t))
            );
            // Simplified encoding digit
            const digit = t + (q - t) % (base - t);
            output = output.slice(0, -1);
            output += String.fromCharCode(digit < 26 ? digit + 97 : digit + 22);
            q = Math.floor((q - t) / (base - t));
            k += base;
          }
          output += String.fromCharCode(q < 26 ? q + 97 : q + 22);
          bias = adaptBias(delta, h + 1, h === b);
          delta = 0;
          h++;
        }
        if (c > 0xFFFF) i++;
      }

      charIndex++;
      delta++;
      n++;
    }

    return 'xn--' + output;
  }

  function adaptBias(delta, nPoints, isFirst) {
    const damp = isFirst ? 700 : 2;
    const base = 36;
    const tmin = 1;
    const tmax = 26;
    const skew = 38;

    delta = Math.floor(delta / damp);
    delta += Math.floor(delta / nPoints);
    let k = 0;
    while (delta > Math.floor((base - tmin) * tmax / 2)) {
      delta = Math.floor(delta / (base - tmin));
      k += base;
    }
    return k + Math.floor((base - tmin + 1) * delta / (delta + skew));
  }

  const outputSec = Tool.section('输出');
  const output = Tool.input('结果...', 'text');
  output.readOnly = true;
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));
}
