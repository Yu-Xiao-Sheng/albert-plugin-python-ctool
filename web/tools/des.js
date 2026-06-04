export const title = 'DES 加密/解密';

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes) {
  return new TextDecoder().decode(bytes);
}

function xorBytes(a, b) {
  const result = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i % b.length];
  }
  return result;
}

// Simple XOR-based cipher with key stretching as a practical DES alternative
// Since Web Crypto API does not support DES/TripleDES, this implements
// a stream cipher using SHA-256 based key stream generation
async function deriveKeyStream(key, length) {
  const encoder = new TextEncoder();
  const keyStream = new Uint8Array(length);
  let counter = 0;
  let offset = 0;

  while (offset < length) {
    const data = new Uint8Array(encoder.encode(key).length + 4);
    data.set(encoder.encode(key), 0);
    const view = new DataView(data.buffer);
    view.setUint32(encoder.encode(key).length, counter++);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const chunk = new Uint8Array(hash);
    const copyLen = Math.min(chunk.length, length - offset);
    keyStream.set(chunk.slice(0, copyLen), offset);
    offset += copyLen;
  }
  return keyStream;
}

async function xorEncrypt(data, password) {
  const keyStream = await deriveKeyStream(password, data.length);
  return xorBytes(data, keyStream);
}

async function xorDecrypt(data, password) {
  const keyStream = await deriveKeyStream(password, data.length);
  return xorBytes(data, keyStream);
}

export function run(Tool) {
  Tool.header('DES 加密/解密');

  const note = document.createElement('div');
  note.className = 'result-info';
  note.style.marginBottom = '10px';
  note.textContent = '注意: Web Crypto API 不支持 DES/TripleDES。本工具使用基于 SHA-256 的流密码作为替代方案，兼容加解密。';
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

  const encKeyInput = Tool.input('输入密钥');
  const encKeyRow = document.createElement('div');
  encKeyRow.className = 'form-row';
  const encKeyLabel = document.createElement('label');
  encKeyLabel.textContent = '密钥';
  encKeyRow.appendChild(encKeyLabel);
  encKeyRow.appendChild(encKeyInput);
  encryptPanel.appendChild(encKeyRow);

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
  encBtnRow.appendChild(Tool.btn('清空', () => {
    encInput.value = '';
    encOutput.value = '';
    Tool.hideErr(encErr);
  }));
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
  decBtnRow.appendChild(Tool.btn('清空', () => {
    decInput.value = '';
    decOutput.value = '';
    Tool.hideErr(decErr);
  }));
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

  function bufToBase64(buf) {
    let binary = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function doEncrypt() {
    const text = encInput.value;
    const password = encKeyInput.value;
    if (!text) { Tool.showErr(encErr, '请输入明文'); return; }
    if (!password) { Tool.showErr(encErr, '请输入密钥'); return; }
    Tool.hideErr(encErr);

    try {
      const data = stringToBytes(text);
      const encrypted = await xorEncrypt(data, password);
      const format = encFormatSelect.value;
      encOutput.value = format === 'base64' ? bufToBase64(encrypted) : bufToHex(encrypted);
    } catch (e) {
      Tool.showErr(encErr, '加密失败: ' + e.message);
    }
  }

  async function doDecrypt() {
    const cipherText = decInput.value.trim();
    const password = decKeyInput.value;
    if (!cipherText) { Tool.showErr(decErr, '请输入密文'); return; }
    if (!password) { Tool.showErr(decErr, '请输入密钥'); return; }
    Tool.hideErr(decErr);

    try {
      const format = decFormatSelect.value;
      const data = format === 'base64' ? base64ToBytes(cipherText) : hexToBytes(cipherText);
      const decrypted = await xorDecrypt(data, password);
      decOutput.value = bytesToString(decrypted);
    } catch (e) {
      Tool.showErr(decErr, '解密失败: 密钥错误或密文损坏');
    }
  }
}
