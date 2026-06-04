export const title = 'AES 加密/解密';

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  return bytes.buffer;
}

function bufToBase64(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToString(buf) {
  return new TextDecoder().decode(buf);
}

export function run(Tool) {
  Tool.header('AES 加密/解密');

  // Create tab panels
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

  const encKeyInput = Tool.input('输入密钥（至少 16 字符）');
  const encKeyRow = document.createElement('div');
  encKeyRow.className = 'form-row';
  encKeyRow.appendChild(document.createElement('label'));
  encKeyRow.querySelector('label').textContent = '密钥';
  encKeyRow.appendChild(encKeyInput);
  encryptPanel.appendChild(encKeyRow);

  const encModeSelect = Tool.select([
    ['AES-CBC', 'AES-CBC'],
    ['AES-GCM', 'AES-GCM']
  ]);
  const encModeRow = document.createElement('div');
  encModeRow.className = 'form-row';
  const encModeLabel = document.createElement('label');
  encModeLabel.textContent = '模式';
  encModeRow.appendChild(encModeLabel);
  encModeRow.appendChild(encModeSelect);
  encryptPanel.appendChild(encModeRow);

  const encFormatSelect = Tool.select([
    ['base64', 'Base64'],
    ['hex', 'Hex']
  ]);
  const encFormatRow = document.createElement('div');
  encFormatRow.className = 'form-row';
  const encFormatLabel = document.createElement('label');
  encFormatLabel.textContent = '输出格式';
  encFormatRow.appendChild(encFormatLabel);
  encFormatRow.appendChild(encFormatSelect);
  encryptPanel.appendChild(encFormatRow);

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

  const encIvLabel = document.createElement('div');
  encIvLabel.className = 'result-info';
  encIvLabel.textContent = 'IV (初始化向量) 将显示在下方';
  encryptPanel.appendChild(encIvLabel);

  const encIvOutput = Tool.textarea('IV', true);
  encIvOutput.style.minHeight = '40px';
  encryptPanel.appendChild(encIvOutput);

  const encCopyRow = document.createElement('div');
  encCopyRow.className = 'btn-row';
  encCopyRow.appendChild(Tool.btn('复制密文', () => {
    if (encOutput.value) Tool.copy(encOutput.value);
  }));
  encCopyRow.appendChild(Tool.btn('复制 IV', () => {
    if (encIvOutput.value) Tool.copy(encIvOutput.value);
  }));
  encryptPanel.appendChild(encCopyRow);

  // === Decrypt Panel ===
  const decInput = Tool.textarea('输入要解密的密文...');
  decryptPanel.appendChild(decInput);

  const decKeyInput = Tool.input('输入密钥');
  const decKeyRow = document.createElement('div');
  decKeyRow.className = 'form-row';
  const decKeyLabel = document.createElement('label');
  decKeyLabel.textContent = '密钥';
  decKeyRow.appendChild(decKeyLabel);
  decKeyRow.appendChild(decKeyInput);
  decryptPanel.appendChild(decKeyRow);

  const decIvInput = Tool.input('输入 IV（Hex 格式）');
  const decIvRow = document.createElement('div');
  decIvRow.className = 'form-row';
  const decIvLabel = document.createElement('label');
  decIvLabel.textContent = 'IV';
  decIvRow.appendChild(decIvLabel);
  decIvRow.appendChild(decIvInput);
  decryptPanel.appendChild(decIvRow);

  const decModeSelect = Tool.select([
    ['AES-CBC', 'AES-CBC'],
    ['AES-GCM', 'AES-GCM']
  ]);
  const decModeRow = document.createElement('div');
  decModeRow.className = 'form-row';
  const decModeLabel = document.createElement('label');
  decModeLabel.textContent = '模式';
  decModeRow.appendChild(decModeLabel);
  decModeRow.appendChild(decModeSelect);
  decryptPanel.appendChild(decModeRow);

  const decFormatSelect = Tool.select([
    ['base64', 'Base64'],
    ['hex', 'Hex']
  ]);
  const decFormatRow = document.createElement('div');
  decFormatRow.className = 'form-row';
  const decFormatLabel = document.createElement('label');
  decFormatLabel.textContent = '密文格式';
  decFormatRow.appendChild(decFormatLabel);
  decFormatRow.appendChild(decFormatSelect);
  decryptPanel.appendChild(decFormatRow);

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

  // Derive key from password using PBKDF2
  async function deriveKey(password, salt, mode) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: mode, length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function doEncrypt() {
    const text = encInput.value;
    const password = encKeyInput.value;
    if (!text) { Tool.showErr(encErr, '请输入明文'); return; }
    if (!password || password.length < 4) { Tool.showErr(encErr, '请输入密钥（至少 4 个字符）'); return; }
    Tool.hideErr(encErr);

    try {
      const mode = encModeSelect.value;
      const format = encFormatSelect.value;
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(mode === 'AES-GCM' ? 12 : 16));
      const key = await deriveKey(password, salt, mode);
      const enc = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt(
        { name: mode, iv: iv },
        key,
        enc.encode(text)
      );

      // Prepend salt to ciphertext
      const combined = new Uint8Array(salt.byteLength + new Uint8Array(encrypted).byteLength);
      combined.set(salt, 0);
      combined.set(new Uint8Array(encrypted), salt.byteLength);

      encOutput.value = format === 'base64' ? bufToBase64(combined.buffer) : bufToHex(combined.buffer);
      encIvOutput.value = bufToHex(iv.buffer);
    } catch (e) {
      Tool.showErr(encErr, '加密失败: ' + e.message);
    }
  }

  async function doDecrypt() {
    const cipherText = decInput.value.trim();
    const password = decKeyInput.value;
    const ivHex = decIvInput.value.trim();
    if (!cipherText) { Tool.showErr(decErr, '请输入密文'); return; }
    if (!password) { Tool.showErr(decErr, '请输入密钥'); return; }
    if (!ivHex) { Tool.showErr(decErr, '请输入 IV'); return; }
    Tool.hideErr(decErr);

    try {
      const mode = decModeSelect.value;
      const format = decFormatSelect.value;
      const combined = format === 'base64' ? new Uint8Array(base64ToBuf(cipherText)) : new Uint8Array(hexToBuf(cipherText));
      const salt = combined.slice(0, 16);
      const data = combined.slice(16);
      const iv = new Uint8Array(hexToBuf(ivHex));
      const key = await deriveKey(password, salt, mode);
      const decrypted = await crypto.subtle.decrypt({ name: mode, iv: iv }, key, data);
      decOutput.value = arrayBufferToString(decrypted);
    } catch (e) {
      Tool.showErr(decErr, '解密失败: 密钥错误或密文损坏');
    }
  }
}
