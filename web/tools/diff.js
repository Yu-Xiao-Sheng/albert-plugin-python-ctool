export const title = '文本对比';

export function run(Tool) {
  Tool.header('文本对比');

  const note = document.createElement('div');
  note.className = 'result-info';
  note.style.marginBottom = '10px';
  note.textContent = '输入两段文本进行逐行对比，绿色 (+) 表示新增行，红色 (-) 表示删除行。';
  Tool.container.appendChild(note);

  const inputContainer = document.createElement('div');
  inputContainer.style.display = 'grid';
  inputContainer.style.gridTemplateColumns = '1fr 1fr';
  inputContainer.style.gap = '10px';
  Tool.container.appendChild(inputContainer);

  const leftCol = document.createElement('div');
  const leftLabel = document.createElement('div');
  leftLabel.className = 'section-label';
  leftLabel.textContent = '原始文本';
  leftCol.appendChild(leftLabel);
  const leftInput = Tool.textarea('输入原始文本...');
  leftCol.appendChild(leftInput);
  inputContainer.appendChild(leftCol);

  const rightCol = document.createElement('div');
  const rightLabel = document.createElement('div');
  rightLabel.className = 'section-label';
  rightLabel.textContent = '修改文本';
  rightCol.appendChild(rightLabel);
  const rightInput = Tool.textarea('输入修改后的文本...');
  rightCol.appendChild(rightInput);
  inputContainer.appendChild(rightCol);

  const errEl = Tool.error();

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  btnRow.appendChild(Tool.btn('对比', doDiff, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    leftInput.value = '';
    rightInput.value = '';
    resultContainer.innerHTML = '';
    Tool.hideErr(errEl);
  }));
  Tool.container.appendChild(btnRow);

  const outLabel = document.createElement('div');
  outLabel.className = 'section-label';
  outLabel.textContent = '对比结果';
  Tool.container.appendChild(outLabel);

  const resultContainer = document.createElement('div');
  resultContainer.style.fontFamily = 'monospace';
  resultContainer.style.fontSize = '13px';
  resultContainer.style.lineHeight = '1.6';
  resultContainer.style.backgroundColor = 'var(--bg2, #1e1e1e)';
  resultContainer.style.borderRadius = '6px';
  resultContainer.style.padding = '10px';
  resultContainer.style.overflow = 'auto';
  resultContainer.style.maxHeight = '500px';
  resultContainer.style.whiteSpace = 'pre-wrap';
  resultContainer.style.wordBreak = 'break-all';
  Tool.container.appendChild(resultContainer);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制结果', () => {
    const text = resultContainer.textContent;
    if (text) Tool.copy(text);
  }));

  function computeLCS(a, b) {
    const m = a.length, n = b.length;
    const dp = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        if (i === 0 || j === 0) dp[i][j] = 0;
        else if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const diff = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        diff.unshift({ type: 'equal', line: a[i - 1] });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'add', line: b[j - 1] });
        j--;
      } else {
        diff.unshift({ type: 'remove', line: a[i - 1] });
        i--;
      }
    }
    return diff;
  }

  function doDiff() {
    const left = leftInput.value;
    const right = rightInput.value;
    if (!left && !right) {
      Tool.showErr(errEl, '请输入文本');
      return;
    }
    Tool.hideErr(errEl);

    const linesA = left.split('\n');
    const linesB = right.split('\n');
    const diff = computeLCS(linesA, linesB);

    resultContainer.innerHTML = '';

    let addCount = 0, removeCount = 0;
    diff.forEach(item => {
      const line = document.createElement('div');
      line.style.padding = '2px 6px';
      line.style.borderRadius = '3px';
      line.style.marginBottom = '1px';

      if (item.type === 'add') {
        line.style.backgroundColor = 'rgba(46, 160, 67, 0.15)';
        line.style.color = '#3fb950';
        line.textContent = '+ ' + item.line;
        addCount++;
      } else if (item.type === 'remove') {
        line.style.backgroundColor = 'rgba(248, 81, 73, 0.15)';
        line.style.color = '#f85149';
        line.textContent = '- ' + item.line;
        removeCount++;
      } else {
        line.style.color = 'var(--text2, #8b949e)';
        line.textContent = '  ' + item.line;
      }
      resultContainer.appendChild(line);
    });

    const summary = document.createElement('div');
    summary.style.marginTop = '10px';
    summary.style.paddingTop = '8px';
    summary.style.borderTop = '1px solid var(--border, #30363d)';
    summary.style.color = 'var(--text2, #8b949e)';
    summary.style.fontSize = '12px';
    summary.textContent = `共 ${diff.length} 行 | 新增 ${addCount} 行 | 删除 ${removeCount} 行`;
    resultContainer.appendChild(summary);
  }
}
