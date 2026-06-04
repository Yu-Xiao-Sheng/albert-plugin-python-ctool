export const title = '数字签名';

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

export function run(Tool) {
  Tool.header('数字签名', 'Web Crypto');

  // Key generation section
  const genSec = Tool.section('密钥生成');

  const algSelect = Tool.select([
    ['RSA-PSS', 'RSA-PSS'],
    ['ECDSA-P256', 'ECDSA (P-256)'],
    ['ECDSA-P384', 'ECDSA (P-384)']
  ]);
  const algRow = document.createElement('div');
  algRow.className = 'form-row';
  const algLabel = document.createElement('label');
  algLabel.textContent = '算法';
  algRow.appendChild(algLabel);
  algRow.appendChild(algSelect);
  genSec.appendChild(algRow);

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

  // Sign / Verify tabs
  const signPanel = document.createElement('div');
  const verifyPanel = document.createElement('div');
  Tool.tabs([
    ['签名', signPanel],
    ['验签', verifyPanel]
  ]);
  Tool.container.appendChild(signPanel);
  Tool.container.appendChild(verifyPanel);

  // === Sign Panel ===
  const signInput = Tool.textarea('输入要签名的文本...');
  signPanel.appendChild(signInput);

  const signPriKeyInput = Tool.textarea('输入私钥 (PEM 格式)...');
  signPriKeyInput.style.minHeight = '80px';
  signPriKeyInput.placeholder = '粘贴私钥或使用上方生成的密钥';
  signPanel.appendChild(signPriKeyInput);

  const signAlgSelect = Tool.select([
    ['RSA-PSS', 'RSA-PSS'],
    ['ECDSA-P256', 'ECDSA (P-256)'],
    ['ECDSA-P384', 'ECDSA (P-384)']
  ]);
  const signAlgRow = document.createElement('div');
  signAlgRow.className = 'form-row';
  const signAlgLabel = document.createElement('label');
  signAlgLabel.textContent = '签名算法';
  signAlgRow.appendChild(signAlgLabel);
  signAlgRow.appendChild(signAlgSelect);
  signPanel.appendChild(signAlgRow);

  const signFormatSelect = Tool.select([
    ['base64', 'Base64'],
    ['hex', 'Hex']
  ]);
  const signFormatRow = document.createElement('div');
  signFormatRow.className = 'form-row';
  const signFormatLabel = document.createElement('label');
  signFormatLabel.textContent = '输出格式';
  signFormatRow.appendChild(signFormatLabel);
  signFormatRow.appendChild(signFormatSelect);
  signPanel.appendChild(signFormatRow);

  const signErr = document.createElement('div');
  signErr.className = 'error';
  signPanel.appendChild(signErr);

  const signBtnRow = document.createElement('div');
  signBtnRow.className = 'btn-row';
  signBtnRow.appendChild(Tool.btn('签名', doSign, 'primary'));
  signPanel.appendChild(signBtnRow);

  const signOutLabel = document.createElement('div');
  signOutLabel.className = 'section-label';
  signOutLabel.textContent = '签名结果';
  signPanel.appendChild(signOutLabel);

  const signOutput = Tool.textarea('签名结果', true);
  signPanel.appendChild(signOutput);

  const signCopyRow = document.createElement('div');
  signCopyRow.className = 'btn-row';
  signCopyRow.appendChild(Tool.btn('复制签名', () => {
    if (signOutput.value) Tool.copy(signOutput.value);
  }));
  signPanel.appendChild(signCopyRow);

  // === Verify Panel ===
  const verifyInput = Tool.textarea('输入原始文本...');
  verifyPanel.appendChild(verifyInput);

  const verifySigInput = Tool.textarea('输入签名值...');
  verifyPanel.appendChild(verifySigInput);

  const verifyPubKeyInput = Tool.textarea('输入公钥 (PEM 格式)...');
  verifyPubKeyInput.style.minHeight = '80px';
  verifyPubKeyInput.placeholder = '粘贴公钥';
  verifyPanel.appendChild(verifyPubKeyInput);

  const verifyAlgSelect = Tool.select([
    ['RSA-PSS', 'RSA-PSS'],
    ['ECDSA-P256', 'ECDSA (P-256)'],
    ['ECDSA-P384', 'ECDSA (P-384)']
  ]);
  const verifyAlgRow = document.createElement('div');
  verifyAlgRow.className = 'form-row';
  const verifyAlgLabel = document.createElement('label');
  verifyAlgLabel.textContent = '签名算法';
  verifyAlgRow.appendChild(verifyAlgLabel);
  verifyAlgRow.appendChild(verifyAlgSelect);
  verifyPanel.appendChild(verifyAlgRow);

  const verifyFormatSelect = Tool.select([
    ['base64', 'Base64'],
    ['hex', 'Hex']
  ]);
  const verifyFormatRow = document.createElement('div');
  verifyFormatRow.className = 'form-row';
  const verifyFormatLabel = document.createElement('label');
  verifyFormatLabel.textContent = '签名格式';
  verifyFormatRow.appendChild(verifyFormatLabel);
  verifyFormatRow.appendChild(verifyFormatSelect);
  verifyPanel.appendChild(verifyFormatRow);

  const verifyErr = document.createElement('div');
  verifyErr.className = 'error';
  verifyPanel.appendChild(verifyErr);

  const verifyBtnRow = document.createElement('div');
  verifyBtnRow.className = 'btn-row';
  verifyBtnRow.appendChild(Tool.btn('验签', doVerify, 'primary'));
  verifyPanel.appendChild(verifyBtnRow);

  const verifyResult = document.createElement('div');
  verifyResult.className = 'result-info';
  verifyResult.style.minHeight = '30px';
  verifyResult.style.marginTop = '10px';
  verifyPanel.appendChild(verifyResult);

  function getAlgParams(alg) {
    switch (alg) {
      case 'RSA-PSS': return { name: 'RSA-PSS', hash: 'SHA-256' };
      case 'ECDSA-P256': return { name: 'ECDSA', namedCurve: 'P-256', hash: 'SHA-256' };
      case 'ECDSA-P384': return { name: 'ECDSA', namedCurve: 'P-384', hash: 'SHA-384' };
    }
  }

  function getSignParams(alg) {
    if (alg === 'RSA-PSS') return { name: 'RSA-PSS', saltLength: 32 };
    const hash = alg === 'ECDSA-P256' ? 'SHA-256' : 'SHA-384';
    return { name: 'ECDSA', hash };
  }

  function getKeyGenParams(alg) {
    if (alg === 'RSA-PSS') {
      return {
        name: 'RSA-PSS',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      };
    }
    const curve = alg === 'ECDSA-P256' ? 'P-256' : 'P-384';
    return { name: 'ECDSA', namedCurve: curve };
  }

  async function doGenerate() {
    Tool.hideErr(genErr);
    try {
      const alg = algSelect.value;
      const params = getKeyGenParams(alg);
      const keyPair = await crypto.subtle.generateKey(params, true, ['sign', 'verify']);

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

  async function importPublicKey(pem, alg) {
    const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    const buf = base64ToBuf(b64);
    const params = getAlgParams(alg);
    return crypto.subtle.importKey('spki', buf, params, false, ['verify']);
  }

  async function importPrivateKey(pem, alg) {
    const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');
    const buf = base64ToBuf(b64);
    const params = getAlgParams(alg);
    return crypto.subtle.importKey('pkcs8', buf, params, false, ['sign']);
  }

  async function doSign() {
    const text = signInput.value;
    const priKeyPem = signPriKeyInput.value.trim();
    if (!text) { Tool.showErr(signErr, '请输入文本'); return; }
    if (!priKeyPem) { Tool.showErr(signErr, '请输入私钥'); return; }
    Tool.hideErr(signErr);

    try {
      const alg = signAlgSelect.value;
      const privateKey = await importPrivateKey(priKeyPem, alg);
      const encoder = new TextEncoder();
      const signature = await crypto.subtle.sign(getSignParams(alg), privateKey, encoder.encode(text));
      const format = signFormatSelect.value;
      signOutput.value = format === 'base64' ? bufToBase64(signature) : bufToHex(signature);
    } catch (e) {
      Tool.showErr(signErr, '签名失败: ' + e.message);
    }
  }

  async function doVerify() {
    const text = verifyInput.value;
    const sigStr = verifySigInput.value.trim();
    const pubKeyPem = verifyPubKeyInput.value.trim();
    if (!text) { Tool.showErr(verifyErr, '请输入原始文本'); return; }
    if (!sigStr) { Tool.showErr(verifyErr, '请输入签名值'); return; }
    if (!pubKeyPem) { Tool.showErr(verifyErr, '请输入公钥'); return; }
    Tool.hideErr(verifyErr);

    try {
      const alg = verifyAlgSelect.value;
      const publicKey = await importPublicKey(pubKeyPem, alg);
      const format = verifyFormatSelect.value;
      const sigBuf = format === 'base64' ? base64ToBuf(sigStr) : hexToBuf(sigStr);
      const encoder = new TextEncoder();
      const valid = await crypto.subtle.verify(getSignParams(alg), publicKey, sigBuf, encoder.encode(text));
      verifyResult.textContent = valid ? '验签通过: 签名有效' : '验签失败: 签名无效';
      verifyResult.style.color = valid ? 'var(--success, #52c41a)' : 'var(--error, #ff4d4f)';
    } catch (e) {
      Tool.showErr(verifyErr, '验签失败: ' + e.message);
    }
  }
}
