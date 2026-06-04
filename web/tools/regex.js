export const title = '正则测试';
export function run(Tool) {
  Tool.header('正则测试');

  const errEl = Tool.error();

  Tool.formRow('正则表达式', Tool.input('输入正则表达式，如 \\d+', 'text'));
  const patternInput = document.getElementById('inp_1');

  Tool.formRow('标志位', Tool.select([['g', 'g (全局)'], ['i', 'i (忽略大小写)'], ['m', 'm (多行)'], ['s', 's (点匹配换行)'], ['gi', 'gi'], ['gm', 'gm'], ['im', 'im'], ['gim', 'gim']]));
  const flagsSelect = document.getElementById('inp_2');

  Tool.section('测试字符串');
  const testArea = Tool.textarea('输入要测试的字符串');
  Tool.container.appendChild(testArea);

  Tool.section('替换');
  Tool.formRow('替换字符串', Tool.input('替换文本（可选，留空则只匹配）', 'text'));
  const replaceInput = document.getElementById('inp_3');

  const btnRow = Tool.btnRow();
  btnRow.appendChild(Tool.btn('匹配测试', doMatch, 'primary'));
  btnRow.appendChild(Tool.btn('替换', doReplace, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    patternInput.value = '';
    testArea.value = '';
    replaceInput.value = '';
    resultArea.value = '';
    highlightDiv.innerHTML = '';
    Tool.hideErr(errEl);
  }));

  Tool.section('匹配结果');
  const highlightDiv = document.createElement('div');
  highlightDiv.style.cssText = 'padding:10px;border:1px solid var(--border);border-radius:var(--radius);font-family:var(--mono);font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all;min-height:40px;background:#f7fafc;';
  Tool.container.appendChild(highlightDiv);

  const resultArea = Tool.textarea('匹配详情', true);
  Tool.container.appendChild(resultArea);

  function doMatch() {
    Tool.hideErr(errEl);
    highlightDiv.innerHTML = '';
    resultArea.value = '';
    const pattern = patternInput.value;
    const flags = flagsSelect.value;
    const text = testArea.value;
    if (!pattern) { Tool.showErr(errEl, '请输入正则表达式'); return; }
    try {
      const re = new RegExp(pattern, flags);
      let matches = [];
      let match;
      if (flags.includes('g')) {
        while ((match = re.exec(text)) !== null) {
          matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
          if (match[0].length === 0) re.lastIndex++;
        }
      } else {
        match = re.exec(text);
        if (match) matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
      }
      if (matches.length === 0) {
        highlightDiv.textContent = text;
        resultArea.value = '没有匹配结果';
        return;
      }
      let html = '';
      let lastIdx = 0;
      matches.forEach((m, i) => {
        html += escapeHtml(text.slice(lastIdx, m.index));
        html += `<span style="background:#fef08a;border-radius:2px;padding:0 1px;border-bottom:2px solid #eab308;">${escapeHtml(m.value)}</span>`;
        lastIdx = m.index + m.value.length;
      });
      html += escapeHtml(text.slice(lastIdx));
      highlightDiv.innerHTML = html;
      resultArea.value = matches.map((m, i) =>
        `匹配 ${i + 1}: "${m.value}" (位置: ${m.index}${m.groups.length ? ', 捕获组: ' + m.groups.map((g, gi) => `$${gi + 1}="${g}"`).join(', ') : ''})`
      ).join('\n');
    } catch (e) {
      Tool.showErr(errEl, '正则表达式错误: ' + e.message);
    }
  }

  function doReplace() {
    Tool.hideErr(errEl);
    highlightDiv.innerHTML = '';
    resultArea.value = '';
    const pattern = patternInput.value;
    const flags = flagsSelect.value;
    const text = testArea.value;
    const replacement = replaceInput.value;
    if (!pattern) { Tool.showErr(errEl, '请输入正则表达式'); return; }
    try {
      const re = new RegExp(pattern, flags);
      const result = text.replace(re, replacement);
      highlightDiv.textContent = result;
      resultArea.value = result;
    } catch (e) {
      Tool.showErr(errEl, '替换错误: ' + e.message);
    }
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
