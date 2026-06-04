export const title = 'Bcrypt 哈希';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const BCRYPT_CDN = 'https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcryptjs.min.js';
let bcryptLoaded = false;

async function ensureBcrypt(errEl, Tool) {
  if (bcryptLoaded && window.dcodeIO && window.dcodeIO.BCrypt) return true;
  try {
    await loadScript(BCRYPT_CDN);
    bcryptLoaded = true;
    return true;
  } catch (e) {
    Tool.showErr(errEl, 'bcryptjs 库加载失败，请检查网络连接');
    return false;
  }
}

function getBcrypt() {
  return window.dcodeIO ? window.dcodeIO.BCrypt : null;
}

export function run(Tool) {
  Tool.header('Bcrypt 哈希', 'bcryptjs');

  const note = document.createElement('div');
  note.className = 'result-info';
  note.style.marginBottom = '10px';
  note.textContent = '使用 bcryptjs 库进行密码哈希和验证。首次使用需加载外部库。';
  Tool.container.appendChild(note);

  // Hash and Verify tabs
  const hashPanel = document.createElement('div');
  const verifyPanel = document.createElement('div');
  Tool.tabs([
    ['哈希', hashPanel],
    ['验证', verifyPanel]
  ]);
  Tool.container.appendChild(hashPanel);
  Tool.container.appendChild(verifyPanel);

  // === Hash Panel ===
  const hashInput = Tool.textarea('输入要哈希的文本...');
  hashPanel.appendChild(hashInput);

  const roundsSelect = Tool.select([
    ['4', '4 轮'],
    ['5', '5 轮'],
    ['6', '6 轮'],
    ['7', '7 轮'],
    ['8', '8 轮'],
    ['9', '9 轮'],
    ['10', '10 轮'],
    ['11', '11 轮'],
    ['12', '12 轮']
  ]);
  const roundsRow = document.createElement('div');
  roundsRow.className = 'form-row';
  const roundsLabel = document.createElement('label');
  roundsLabel.textContent = '轮数 (cost)';
  roundsRow.appendChild(roundsLabel);
  roundsRow.appendChild(roundsSelect);
  hashPanel.appendChild(roundsRow);

  const hashErr = document.createElement('div');
  hashErr.className = 'error';
  hashPanel.appendChild(hashErr);

  const hashBtnRow = document.createElement('div');
  hashBtnRow.className = 'btn-row';
  hashBtnRow.appendChild(Tool.btn('生成哈希', doHash, 'primary'));
  hashPanel.appendChild(hashBtnRow);

  const hashOutLabel = document.createElement('div');
  hashOutLabel.className = 'section-label';
  hashOutLabel.textContent = '哈希结果';
  hashPanel.appendChild(hashOutLabel);

  const hashOutput = Tool.textarea('哈希结果', true);
  hashPanel.appendChild(hashOutput);

  const hashCopyRow = document.createElement('div');
  hashCopyRow.className = 'btn-row';
  hashCopyRow.appendChild(Tool.btn('复制哈希', () => {
    if (hashOutput.value) Tool.copy(hashOutput.value);
  }));
  hashPanel.appendChild(hashCopyRow);

  // === Verify Panel ===
  const verifyInput = Tool.textarea('输入原始文本...');
  verifyPanel.appendChild(verifyInput);

  const verifyHashInput = Tool.textarea('输入 Bcrypt 哈希值...');
  verifyHashInput.style.minHeight = '60px';
  verifyHashInput.placeholder = '$2a$10$...';
  verifyPanel.appendChild(verifyHashInput);

  const verifyErr = document.createElement('div');
  verifyErr.className = 'error';
  verifyPanel.appendChild(verifyErr);

  const verifyBtnRow = document.createElement('div');
  verifyBtnRow.className = 'btn-row';
  verifyBtnRow.appendChild(Tool.btn('验证', doVerify, 'primary'));
  verifyPanel.appendChild(verifyBtnRow);

  const verifyResult = document.createElement('div');
  verifyResult.className = 'result-info';
  verifyResult.style.minHeight = '30px';
  verifyResult.style.marginTop = '10px';
  verifyPanel.appendChild(verifyResult);

  async function doHash() {
    const text = hashInput.value;
    if (!text) { Tool.showErr(hashErr, '请输入文本'); return; }
    Tool.hideErr(hashErr);
    if (!await ensureBcrypt(hashErr, Tool)) return;

    try {
      const BCrypt = getBcrypt();
      const rounds = parseInt(roundsSelect.value);
      const salt = BCrypt.genSalt(rounds);
      const hash = BCrypt.hashSync(text, salt);
      hashOutput.value = hash;
    } catch (e) {
      Tool.showErr(hashErr, '哈希失败: ' + e.message);
    }
  }

  async function doVerify() {
    const text = verifyInput.value;
    const hash = verifyHashInput.value.trim();
    if (!text) { Tool.showErr(verifyErr, '请输入原始文本'); return; }
    if (!hash) { Tool.showErr(verifyErr, '请输入哈希值'); return; }
    Tool.hideErr(verifyErr);
    if (!await ensureBcrypt(verifyErr, Tool)) return;

    try {
      const BCrypt = getBcrypt();
      const result = BCrypt.compareSync(text, hash);
      verifyResult.textContent = result ? '验证通过: 匹配' : '验证失败: 不匹配';
      verifyResult.style.color = result ? 'var(--success, #52c41a)' : 'var(--error, #ff4d4f)';
    } catch (e) {
      Tool.showErr(verifyErr, '验证失败: ' + e.message);
    }
  }
}
