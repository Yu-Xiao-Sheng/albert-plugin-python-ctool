export const title = '随机字符串';

export function run(Tool) {
  Tool.header('随机字符串');

  const sec = Tool.section();

  // Length input
  const lengthInput = Tool.input('32', 'number');
  lengthInput.value = '32';
  lengthInput.min = '1';
  lengthInput.max = '256';
  lengthInput.style.width = '80px';
  Tool.formRow('长度', lengthInput);

  // Character set checkboxes
  const checkRow = document.createElement('div');
  checkRow.className = 'form-row';
  checkRow.style.flexWrap = 'wrap';

  const lowerCheck = document.createElement('input');
  lowerCheck.type = 'checkbox';
  lowerCheck.id = 'rand_lower';
  lowerCheck.checked = true;
  const lowerLabel = document.createElement('label');
  lowerLabel.textContent = '小写字母 (a-z)';
  lowerLabel.style.fontSize = '13px';
  lowerLabel.style.color = 'var(--text2)';
  lowerLabel.prepend(lowerCheck);

  const upperCheck = document.createElement('input');
  upperCheck.type = 'checkbox';
  upperCheck.id = 'rand_upper';
  upperCheck.checked = true;
  const upperLabel = document.createElement('label');
  upperLabel.textContent = '大写字母 (A-Z)';
  upperLabel.style.fontSize = '13px';
  upperLabel.style.color = 'var(--text2)';
  upperLabel.prepend(upperCheck);

  const numCheck = document.createElement('input');
  numCheck.type = 'checkbox';
  numCheck.id = 'rand_num';
  numCheck.checked = true;
  const numLabel = document.createElement('label');
  numLabel.textContent = '数字 (0-9)';
  numLabel.style.fontSize = '13px';
  numLabel.style.color = 'var(--text2)';
  numLabel.prepend(numCheck);

  const specCheck = document.createElement('input');
  specCheck.type = 'checkbox';
  specCheck.id = 'rand_spec';
  const specLabel = document.createElement('label');
  specLabel.textContent = '特殊字符 (!@#$%)';
  specLabel.style.fontSize = '13px';
  specLabel.style.color = 'var(--text2)';
  specLabel.prepend(specCheck);

  checkRow.appendChild(lowerLabel);
  checkRow.appendChild(upperLabel);
  checkRow.appendChild(numLabel);
  checkRow.appendChild(specLabel);
  Tool.container.appendChild(checkRow);

  // Count input
  const countInput = Tool.input('1', 'number');
  countInput.value = '1';
  countInput.min = '1';
  countInput.max = '20';
  countInput.style.width = '80px';
  Tool.formRow('生成数量', countInput);

  const errEl = Tool.error();

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  btnRow.appendChild(Tool.btn('生成', doGenerate, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    output.value = '';
    Tool.hideErr(errEl);
  }));
  Tool.container.appendChild(btnRow);

  const outSec = Tool.section('输出');
  const output = Tool.textarea('随机字符串将在此显示', true);
  outSec.appendChild(output);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制结果', () => {
    if (output.value) Tool.copy(output.value);
  }));

  const CHARS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  function doGenerate() {
    let charset = '';
    if (lowerCheck.checked) charset += CHARS.lower;
    if (upperCheck.checked) charset += CHARS.upper;
    if (numCheck.checked) charset += CHARS.numbers;
    if (specCheck.checked) charset += CHARS.special;

    if (!charset) {
      Tool.showErr(errEl, '请至少选择一种字符类型');
      return;
    }

    const length = parseInt(lengthInput.value) || 32;
    const count = Math.min(Math.max(parseInt(countInput.value) || 1, 1), 20);

    Tool.hideErr(errEl);

    const results = [];
    const randomValues = new Uint32Array(length);
    for (let i = 0; i < count; i++) {
      crypto.getRandomValues(randomValues);
      let str = '';
      for (let j = 0; j < length; j++) {
        str += charset[randomValues[j] % charset.length];
      }
      results.push(str);
    }
    output.value = results.join('\n');
  }
}
