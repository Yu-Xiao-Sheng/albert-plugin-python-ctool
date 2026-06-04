export const title = '进制转换';
export function run(Tool) {
  Tool.header('进制转换 (2-36)');

  const err = Tool.error();

  const bases = [];
  for (let i = 2; i <= 36; i++) {
    bases.push([String(i), i + ' 进制']);
  }

  const fromRow = Tool.formRow('源进制', null);
  const fromSel = Tool.select(bases);
  fromSel.value = '10';
  fromRow.appendChild(fromSel);

  const toRow = Tool.formRow('目标进制', null);
  const toSel = Tool.select(bases);
  toSel.value = '16';
  toRow.appendChild(toSel);

  const inputSec = Tool.section('输入数值');
  const input = Tool.input('请输入要转换的数值', 'text');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('转换', () => {
    Tool.hideErr(err);
    try {
      const fromBase = parseInt(fromSel.value);
      const toBase = parseInt(toSel.value);
      const val = input.value.trim();

      if (!val) {
        Tool.showErr(err, '请输入数值');
        return;
      }

      const isNeg = val.startsWith('-');
      const absVal = isNeg ? val.slice(1) : val;

      if (fromBase <= 10) {
        if (!/^[0-9]+$/.test(absVal)) {
          Tool.showErr(err, `${fromBase} 进制不允许包含字母`);
          return;
        }
        for (const ch of absVal) {
          if (parseInt(ch) >= fromBase) {
            Tool.showErr(err, `字符 '${ch}' 不属于 ${fromBase} 进制`);
            return;
          }
        }
      } else {
        const maxChar = (fromBase - 10 - 1);
        const pattern = new RegExp(`^[0-9a-${String.fromCharCode(97 + maxChar)}A-${String.fromCharCode(65 + maxChar)}]+$`);
        if (!pattern.test(absVal)) {
          Tool.showErr(err, `输入不是有效的 ${fromBase} 进制数`);
          return;
        }
      }

      const dec = parseInt(absVal, fromBase);
      if (isNaN(dec)) {
        Tool.showErr(err, '无法解析输入数值');
        return;
      }

      let result = dec.toString(toBase).toUpperCase();
      if (isNeg) result = '-' + result;
      output.value = result;
    } catch (e) {
      Tool.showErr(err, '转换失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('快速: 转2', () => { toSel.value = '2'; }));
  row.appendChild(Tool.btn('快速: 转8', () => { toSel.value = '8'; }));
  row.appendChild(Tool.btn('快速: 转10', () => { toSel.value = '10'; }));
  row.appendChild(Tool.btn('快速: 转16', () => { toSel.value = '16'; }));
  row.appendChild(Tool.btn('快速: 转32', () => { toSel.value = '32'; }));

  const outputSec = Tool.section('输出');
  const output = Tool.textarea('结果...', true);
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));
}
