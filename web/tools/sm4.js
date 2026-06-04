export const title = 'SM4 加密/解密';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const SM4_CDN = 'https://cdn.jsdelivr.net/npm/sm-crypto@0.3.13/dist/sm4.min.js';
let sm4Loaded = false;

async function ensureSM4(errEl) {
  if (sm4Loaded && window.sm4) return true;
  try {
    await loadScript(SM4_CDN);
    sm4Loaded = true;
    return true;
  } catch (e) {
    return false;
  }
}

let _showErr, _hideErr;

export function run(Tool) {
  _showErr = (el, msg) => Tool.showErr(el, msg);
  _hideErr = (el) => Tool.hideErr(el);

  Tool.header('SM4 加密/解密');

  const note = document.createElement('div');
  note.className = 'result-info';
  note.style.marginBottom = '10px';
  note.textContent = '使用 sm-crypto 库实现 SM4 国密对称加密/解密。首次使用需加载外部库。密钥为 32 位 Hex 字符串（16 字节）。';
  Tool.container.appendChild(note);

  const encryptPanel = document.createElement('div');
  const decryptPanel = document.createElement('div');
  const panels = Tool.tabs([
    ['加密', encryptPanel],
    ['解密', decryptPanel]
  ]);
  Tool.container.appendChild(encryptPanel);
  Tool.container.appendChild(decryptPanel);

  // === Encrypt Panel ===
  const encInput = Tool.textarea('输入要加密的明文...');
  encryptPanel.appendChild(encInput);

  const encKeyInput = Tool.input('输入密钥（32 位 Hex，如 0123456789abcdeffedcba9876543210）');
  const encKeyRow = document.createElement('div');
  encKeyRow.className = 'form-row';
  const encKeyLabel = document.createElement('label');
  encKeyLabel.textContent = '密钥';
  encKeyRow.appendChild(encKeyLabel);
  encKeyRow.appendChild(encKeyInput);
  encryptPanel.appendChild(encKeyRow);

  const encInputTypeSelect = Tool.select([
    ['string', '文本字符串'],
    ['hex', 'Hex 输入']
  ]);
  const encInputTypeRow = document.createElement('div');
  encInputTypeRow.className = 'form-row';
  const encInputTypeLabel = document.createElement('label');
  encInputTypeLabel.textContent = '输入类型';
  encInputTypeRow.appendChild(encInputTypeLabel);
  encInputTypeRow.appendChild(encInputTypeSelect);
  encryptPanel.appendChild(encInputTypeRow);

  const encErr = document.createElement('div');
  encErr.className = 'error';
  encryptPanel.appendChild(encErr);

  const encBtnRow = document.createElement('div');
  encBtnRow.className = 'btn-row';
  encBtnRow.appendChild(Tool.btn('加密', doEncrypt, 'primary'));
  encBtnRow.appendChild(Tool.btn('生成随机密钥', () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    encKeyInput.value = key;
    Tool.toast('已生成随机密钥', 'success');
  }));
  encryptPanel.appendChild(encBtnRow);

  const encOutLabel = document.createElement('div');
  encOutLabel.className = 'section-label';
  encOutLabel.textContent = '密文';
  encryptPanel.appendChild(encOutLabel);

  const encOutput = Tool.textarea('加密结果（Hex）', true);
  encryptPanel.appendChild(encOutput);

  const encCopyRow = document.createElement('div');
  encCopyRow.className = 'btn-row';
  encCopyRow.appendChild(Tool.btn('复制密文', () => {
    if (encOutput.value) Tool.copy(encOutput.value);
  }));
  encryptPanel.appendChild(encCopyRow);

  // === Decrypt Panel ===
  const decInput = Tool.textarea('输入要解密的密文（Hex）...');
  decryptPanel.appendChild(decInput);

  const decKeyInput = Tool.input('输入密钥（32 位 Hex）');
  const decKeyRow = document.createElement('div');
  decKeyRow.className = 'form-row';
  const decKeyLabel = document.createElement('label');
  decKeyLabel.textContent = '密钥';
  decKeyRow.appendChild(decKeyLabel);
  decKeyRow.appendChild(decKeyInput);
  decryptPanel.appendChild(decKeyRow);

  const decOutputTypeSelect = Tool.select([
    ['string', '文本字符串'],
    ['hex', 'Hex 输出']
  ]);
  const decOutputTypeRow = document.createElement('div');
  decOutputTypeRow.className = 'form-row';
  const decOutputTypeLabel = document.createElement('label');
  decOutputTypeLabel.textContent = '输出类型';
  decOutputTypeRow.appendChild(decOutputTypeLabel);
  decOutputTypeRow.appendChild(decOutputTypeSelect);
  decryptPanel.appendChild(decOutputTypeRow);

  const decErr = document.createElement('div');
  decErr.className = 'error';
  decryptPanel.appendChild(decErr);

  const decBtnRow = document.createElement('div');
  decBtnRow.className = 'btn-row';
  decBtnRow.appendChild(Tool.btn('解密', doDecrypt, 'primary'));
  decryptPanel.appendChild(decBtnRow);

  const decOutLabel = document.createElement('div');
  decOutLabel.className = 'section-label';
  decOutLabel.textContent = '明文';
  decryptPanel.appendChild(decOutLabel);

  const decOutput = Tool.textarea('解密结果', true);
  decryptPanel.appendChild(decOutput);

  const decCopyRow = document.createElement('div');
  decCopyRow.className = 'btn-row';
  decCopyRow.appendChild(Tool.btn('复制结果', () => {
    if (decOutput.value) Tool.copy(decOutput.value);
  }));
  decryptPanel.appendChild(decCopyRow);

  async function doEncrypt() {
    const text = encInput.value;
    const key = encKeyInput.value.trim();
    if (!text) { Tool.showErr(encErr, '请输入明文'); return; }
    if (!key) { Tool.showErr(encErr, '请输入密钥'); return; }
    if (key.length !== 32) { Tool.showErr(encErr, '密钥必须为 32 位 Hex 字符'); return; }

    if (!await ensureSM4(encErr)) {
      Tool.showErr(encErr, 'SM4 库加载失败，请检查网络连接');
      return;
    }
    Tool.hideErr(encErr);

    try {
      const inputType = encInputTypeSelect.value;
      const encrypted = window.sm4.encrypt(text, key, { input: inputType, output: 'hex' });
      encOutput.value = encrypted;
    } catch (e) {
      Tool.showErr(encErr, '加密失败: ' + e.message);
    }
  }

  async function doDecrypt() {
    const cipherText = decInput.value.trim();
    const key = decKeyInput.value.trim();
    if (!cipherText) { Tool.showErr(decErr, '请输入密文'); return; }
    if (!key) { Tool.showErr(decErr, '请输入密钥'); return; }
    if (key.length !== 32) { Tool.showErr(decErr, '密钥必须为 32 位 Hex 字符'); return; }

    if (!await ensureSM4(decErr)) {
      Tool.showErr(decErr, 'SM4 库加载失败，请检查网络连接');
      return;
    }
    Tool.hideErr(decErr);

    try {
      const outputType = decOutputTypeSelect.value;
      const decrypted = window.sm4.decrypt(cipherText, key, { output: outputType });
      decOutput.value = decrypted;
    } catch (e) {
      Tool.showErr(decErr, '解密失败: ' + e.message);
    }
  }
}
