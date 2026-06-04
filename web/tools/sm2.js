export const title = 'SM2 加密/解密';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const SM2_CDN = 'https://cdn.jsdelivr.net/npm/sm-crypto@0.3.13/dist/sm2.min.js';
let sm2Loaded = false;

async function ensureSM2(errEl) {
  if (sm2Loaded && window.sm2) return true;
  try {
    await loadScript(SM2_CDN);
    sm2Loaded = true;
    return true;
  } catch (e) {
    Tool_showErr(errEl, 'SM2 库加载失败，请检查网络连接');
    return false;
  }
}

let Tool_showErr, Tool_hideErr;

export function run(Tool) {
  Tool_showErr = (el, msg) => Tool.showErr(el, msg);
  Tool_hideErr = (el) => Tool.hideErr(el);

  Tool.header('SM2 加密/解密');

  const note = document.createElement('div');
  note.className = 'result-info';
  note.style.marginBottom = '10px';
  note.textContent = '使用 sm-crypto 库实现 SM2 国密非对称加密/解密。首次使用需加载外部库。';
  Tool.container.appendChild(note);

  // Generate key pair section
  const genSec = Tool.section('密钥生成');

  const genErr = document.createElement('div');
  genErr.className = 'error';

  const genBtnRow = document.createElement('div');
  genBtnRow.className = 'btn-row';
  genBtnRow.appendChild(Tool.btn('生成密钥对', doGenerate, 'primary'));
  genSec.appendChild(genBtnRow);
  genSec.appendChild(genErr);

  const pubKeyLabel = document.createElement('div');
  pubKeyLabel.className = 'section-label';
  pubKeyLabel.textContent = '公钥';
  pubKeyLabel.style.marginTop = '8px';
  genSec.appendChild(pubKeyLabel);

  const pubKeyOutput = Tool.textarea('公钥将在此显示', true);
  pubKeyOutput.style.minHeight = '60px';
  genSec.appendChild(pubKeyOutput);

  const pubCopyRow = document.createElement('div');
  pubCopyRow.className = 'btn-row';
  pubCopyRow.appendChild(Tool.btn('复制公钥', () => {
    if (pubKeyOutput.value) Tool.copy(pubKeyOutput.value);
  }));
  genSec.appendChild(pubCopyRow);

  const priKeyLabel = document.createElement('div');
  priKeyLabel.className = 'section-label';
  priKeyLabel.textContent = '私钥';
  genSec.appendChild(priKeyLabel);

  const priKeyOutput = Tool.textarea('私钥将在此显示', true);
  priKeyOutput.style.minHeight = '60px';
  genSec.appendChild(priKeyOutput);

  const priCopyRow = document.createElement('div');
  priCopyRow.className = 'btn-row';
  priCopyRow.appendChild(Tool.btn('复制私钥', () => {
    if (priKeyOutput.value) Tool.copy(priKeyOutput.value);
  }));
  genSec.appendChild(priCopyRow);

  // Encrypt / Decrypt tabs
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

  const encPubKeyInput = Tool.textarea('输入公钥（Hex）');
  encPubKeyInput.style.minHeight = '60px';
  encPubKeyInput.placeholder = '输入公钥或使用上方生成的密钥';
  encryptPanel.appendChild(encPubKeyInput);

  const cipherModeSelect = Tool.select([
    ['C1C3C2', 'C1C3C2'],
    ['C1C2C3', 'C1C2C3']
  ]);
  const cipherModeRow = document.createElement('div');
  cipherModeRow.className = 'form-row';
  const cipherModeLabel = document.createElement('label');
  cipherModeLabel.textContent = '密文模式';
  cipherModeRow.appendChild(cipherModeLabel);
  cipherModeRow.appendChild(cipherModeSelect);
  encryptPanel.appendChild(cipherModeRow);

  const encErr = document.createElement('div');
  encErr.className = 'error';
  encryptPanel.appendChild(encErr);

  const encBtnRow = document.createElement('div');
  encBtnRow.className = 'btn-row';
  encBtnRow.appendChild(Tool.btn('加密', doEncrypt, 'primary'));
  encryptPanel.appendChild(encBtnRow);

  const encOutLabel = document.createElement('div');
  encOutLabel.className = 'section-label';
  encOutLabel.textContent = '密文';
  encryptPanel.appendChild(encOutLabel);

  const encOutput = Tool.textarea('加密结果', true);
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

  const decPriKeyInput = Tool.textarea('输入私钥（Hex）');
  decPriKeyInput.style.minHeight = '60px';
  decPriKeyInput.placeholder = '输入私钥';
  decryptPanel.appendChild(decPriKeyInput);

  const decCipherModeSelect = Tool.select([
    ['C1C3C2', 'C1C3C2'],
    ['C1C2C3', 'C1C2C3']
  ]);
  const decCipherModeRow = document.createElement('div');
  decCipherModeRow.className = 'form-row';
  const decCipherModeLabel = document.createElement('label');
  decCipherModeLabel.textContent = '密文模式';
  decCipherModeRow.appendChild(decCipherModeLabel);
  decCipherModeRow.appendChild(decCipherModeSelect);
  decryptPanel.appendChild(decCipherModeRow);

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

  async function doGenerate() {
    if (!await ensureSM2(genErr)) return;
    Tool.hideErr(genErr);
    try {
      const keyPair = window.sm2.generateKeyPairHex();
      pubKeyOutput.value = keyPair.publicKey;
      priKeyOutput.value = keyPair.privateKey;
      Tool.toast('密钥对生成成功', 'success');
    } catch (e) {
      Tool.showErr(genErr, '生成失败: ' + e.message);
    }
  }

  async function doEncrypt() {
    const text = encInput.value;
    const pubKey = encPubKeyInput.value.trim();
    if (!text) { Tool.showErr(encErr, '请输入明文'); return; }
    if (!pubKey) { Tool.showErr(encErr, '请输入公钥'); return; }
    if (!await ensureSM2(encErr)) return;
    Tool.hideErr(encErr);

    try {
      const cipherMode = cipherModeSelect.value;
      const encrypted = window.sm2.doEncrypt(text, pubKey, cipherMode);
      encOutput.value = encrypted;
    } catch (e) {
      Tool.showErr(encErr, '加密失败: ' + e.message);
    }
  }

  async function doDecrypt() {
    const cipherText = decInput.value.trim();
    const priKey = decPriKeyInput.value.trim();
    if (!cipherText) { Tool.showErr(decErr, '请输入密文'); return; }
    if (!priKey) { Tool.showErr(decErr, '请输入私钥'); return; }
    if (!await ensureSM2(decErr)) return;
    Tool.hideErr(decErr);

    try {
      const cipherMode = decCipherModeSelect.value;
      const decrypted = window.sm2.doDecrypt(cipherText, priKey, cipherMode);
      decOutput.value = decrypted;
    } catch (e) {
      Tool.showErr(decErr, '解密失败: ' + e.message);
    }
  }
}
