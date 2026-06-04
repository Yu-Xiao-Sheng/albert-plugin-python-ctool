export const title = 'RSA 加密/解密';

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

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  return bytes.buffer;
}

function ab2str(buf) {
  return new TextDecoder().decode(buf);
}

let cachedKeyPair = null;

export function run(Tool) {
  Tool.header('RSA 加密/解密', 'Web Crypto');

  // Key generation section
  const genSec = Tool.section('密钥生成');

  const keySizeSelect = Tool.select([
    ['2048', '2048 位'],
    ['4096', '4096 位']
  ]);
  const keySizeRow = document.createElement('div');
  keySizeRow.className = 'form-row';
  const keySizeLabel = document.createElement('label');
  keySizeLabel.textContent = '密钥长度';
  keySizeRow.appendChild(keySizeLabel);
  keySizeRow.appendChild(keySizeSelect);
  genSec.appendChild(keySizeRow);

  const genErr = document.createElement('div');
  genErr.className = 'error';
  genSec.appendChild(genErr);

  const genBtnRow = document.createElement('div');
  genBtnRow.className = 'btn-row';
  genBtnRow.appendChild(Tool.btn('生成密钥对', doGenerate, 'primary'));
  genSec.appendChild(genBtnRow);

  const pubKeyLabel = document.createElement('div');
  pubKeyLabel.className = 'section-label';
  pubKeyLabel.textContent = '公钥 (PEM)';
  pubKeyLabel.style.marginTop = '8px';
  genSec.appendChild(pubKeyLabel);

  const pubKeyOutput = Tool.textarea('公钥将在此显示', true);
  pubKeyOutput.style.minHeight = '80px';
  genSec.appendChild(pubKeyOutput);

  const pubCopyRow = document.createElement('div');
  pubCopyRow.className = 'btn-row';
  pubCopyRow.appendChild(Tool.btn('复制公钥', () => {
    if (pubKeyOutput.value) Tool.copy(pubKeyOutput.value);
  }));
  genSec.appendChild(pubCopyRow);

  const priKeyLabel = document.createElement('div');
  priKeyLabel.className = 'section-label';
  priKeyLabel.textContent = '私钥 (PEM)';
  genSec.appendChild(priKeyLabel);

  const priKeyOutput = Tool.textarea('私钥将在此显示', true);
  priKeyOutput.style.minHeight = '80px';
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
  Tool.tabs([
    ['加密', encryptPanel],
    ['解密', decryptPanel]
  ]);
  Tool.container.appendChild(encryptPanel);
  Tool.container.appendChild(decryptPanel);

  // === Encrypt Panel ===
  const encInput = Tool.textarea('输入要加密的明文...');
  encryptPanel.appendChild(encInput);

  const encPubKeyInput = Tool.textarea('输入公钥 (PEM 格式)...');
  encPubKeyInput.style.minHeight = '80px';
  encPubKeyInput.placeholder = '粘贴公钥或使用上方生成的密钥';
  encryptPanel.appendChild(encPubKeyInput);

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

  const encCopyRow = document.createElement('div');
  encCopyRow.className = 'btn-row';
  encCopyRow.appendChild(Tool.btn('复制密文', () => {
    if (encOutput.value) Tool.copy(encOutput.value);
  }));
  encryptPanel.appendChild(encCopyRow);

  // === Decrypt Panel ===
  const decInput = Tool.textarea('输入要解密的密文...');
  decryptPanel.appendChild(decInput);

  const decPriKeyInput = Tool.textarea('输入私钥 (PEM 格式)...');
  decPriKeyInput.style.minHeight = '80px';
  decPriKeyInput.placeholder = '粘贴私钥';
  decryptPanel.appendChild(decPriKeyInput);

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

  async function doGenerate() {
    Tool.hideErr(genErr);
    try {
      const bits = parseInt(keySizeSelect.value);
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: bits,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );
      cachedKeyPair = keyPair;

      const pubKeyBuf = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const priKeyBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      const pubB64 = bufToBase64(pubKeyBuf);
      const priB64 = bufToBase64(priKeyBuf);

      pubKeyOutput.value = '-----BEGIN PUBLIC KEY-----\n' +
        pubB64.match(/.{1,64}/g).join('\n') +
        '\n-----END PUBLIC KEY-----';
      priKeyOutput.value = '-----BEGIN PRIVATE KEY-----\n' +
        priB64.match(/.{1,64}/g).join('\n') +
        '\n-----END PRIVATE KEY-----';

      Tool.toast('密钥对生成成功', 'success');
    } catch (e) {
      Tool.showErr(genErr, '生成失败: ' + e.message);
    }
  }

  async function importPublicKey(pem) {
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const buf = base64ToBuf(b64);
    return crypto.subtle.importKey('spki', buf, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
  }

  async function importPrivateKey(pem) {
    const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    const buf = base64ToBuf(b64);
    return crypto.subtle.importKey('pkcs8', buf, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
  }

  async function doEncrypt() {
    const text = encInput.value;
    const pubKeyPem = encPubKeyInput.value.trim();
    if (!text) { Tool.showErr(encErr, '请输入明文'); return; }
    if (!pubKeyPem) { Tool.showErr(encErr, '请输入公钥'); return; }
    Tool.hideErr(encErr);

    try {
      const publicKey = await importPublicKey(pubKeyPem);
      const encoder = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        encoder.encode(text)
      );
      const format = encFormatSelect.value;
      encOutput.value = format === 'base64' ? bufToBase64(encrypted) : bufToHex(encrypted);
    } catch (e) {
      Tool.showErr(encErr, '加密失败: ' + e.message);
    }
  }

  async function doDecrypt() {
    const cipherText = decInput.value.trim();
    const priKeyPem = decPriKeyInput.value.trim();
    if (!cipherText) { Tool.showErr(decErr, '请输入密文'); return; }
    if (!priKeyPem) { Tool.showErr(decErr, '请输入私钥'); return; }
    Tool.hideErr(decErr);

    try {
      const privateKey = await importPrivateKey(priKeyPem);
      const format = decFormatSelect.value;
      const buf = format === 'base64' ? base64ToBuf(cipherText) : hexToBuf(cipherText);
      const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, buf);
      decOutput.value = ab2str(decrypted);
    } catch (e) {
      Tool.showErr(decErr, '解密失败: 密钥错误或密文损坏');
    }
  }
}
