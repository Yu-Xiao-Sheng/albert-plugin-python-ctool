export const title = 'ASN.1/PEM 解码';
export function run(Tool) {
  Tool.header('ASN.1 / PEM 证书解码');

  const err = Tool.error();

  const inputSec = Tool.section('输入 PEM 证书');
  const input = Tool.textarea('粘贴 PEM 格式证书...\n-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('解码', doDecode, 'primary'));
  row.appendChild(Tool.btn('示例', () => {
    // A minimal example certificate (self-signed, expired, for testing)
    input.value = '-----BEGIN CERTIFICATE-----\nMIIBljCCAT2gAwIBAgIJALeljnVHaVW8MA0GCSqGSIb3DQEBCwUAMBExDzANBgNV\nBAMMBnRlc3QwMDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAxMDEwMDAwMDBaMBExDzAN\nBgNVBAMMBnRlc3QwMDCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAvy3PpNb2\n1Sk/VJYxpEPxYiH3xYZOBwKKCr0O8SxdAzJ\r\nF3eCj7hOFrMDI0g/eZkg0kPgLSnB\n+p1VwP6jBXQhL4m6fYFHpIPYfVCCTG\r\niJBEXCWlHJVOVhQCBaHf0NQCAW8=\n-----END CERTIFICATE-----';
  }));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    asn1Output.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('证书信息');
  const output = Tool.textarea('证书字段信息...', true);
  output.style.fontFamily = 'monospace';
  outputSec.appendChild(output);

  const asn1Sec = Tool.section('ASN.1 结构');
  const asn1Output = Tool.textarea('ASN.1 TLV 结构...', true);
  asn1Output.style.fontFamily = 'monospace';
  asn1Output.style.minHeight = '200px';
  asn1Sec.appendChild(asn1Output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制证书信息', () => {
    if (output.value) Tool.copy(output.value);
  }));
  outRow.appendChild(Tool.btn('复制 ASN.1 结构', () => {
    if (asn1Output.value) Tool.copy(asn1Output.value);
  }));

  // ASN.1 Tag classes
  const TAG_CLASSES = ['UNIVERSAL', 'APPLICATION', 'CONTEXT', 'PRIVATE'];
  const UNIVERSAL_TAGS = {
    0x01: 'BOOLEAN', 0x02: 'INTEGER', 0x03: 'BIT STRING', 0x04: 'OCTET STRING',
    0x05: 'NULL', 0x06: 'OID', 0x0C: 'UTF8String', 0x13: 'PrintableString',
    0x16: 'IA5String', 0x17: 'UTCTime', 0x18: 'GeneralizedTime',
    0x30: 'SEQUENCE', 0x31: 'SET', 0x05: 'NULL', 0x0A: 'ENUMERATED',
    0x22: 'IA5String',
  };

  function base64Decode(str) {
    // Handle URL-safe base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4 !== 0) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function parsePEM(pemStr) {
    // Extract base64 content between BEGIN/END markers
    const match = pemStr.match(/-----BEGIN [^-]+-----\s*([\s\S]*?)\s*-----END [^-]+-----/);
    if (!match) throw new Error('无效的 PEM 格式，需要包含 BEGIN/END 标记');
    const b64 = match[1].replace(/[\s\r\n]/g, '');
    return base64Decode(b64);
  }

  function parseTLV(bytes, offset, depth) {
    const results = [];
    let pos = offset;

    while (pos < bytes.length) {
      if (depth > 50) break;

      const start = pos;
      if (pos >= bytes.length) break;

      // Parse tag
      let tagByte = bytes[pos++];
      const tagClass = (tagByte >> 6) & 0x03;
      const constructed = (tagByte >> 5) & 0x01;
      let tagNum = tagByte & 0x1F;

      if (tagNum === 0x1F) {
        // Long form tag
        tagNum = 0;
        while (pos < bytes.length) {
          const b = bytes[pos++];
          tagNum = (tagNum << 7) | (b & 0x7F);
          if (!(b & 0x80)) break;
        }
      }

      // Parse length
      if (pos >= bytes.length) break;
      let length = bytes[pos++];
      let lengthBytes = 1;

      if (length & 0x80) {
        const numBytes = length & 0x7F;
        if (numBytes === 0) {
          // Indefinite length - not handling, break
          break;
        }
        length = 0;
        for (let i = 0; i < numBytes && pos < bytes.length; i++) {
          length = (length << 8) | bytes[pos++];
          lengthBytes++;
        }
      }

      const valueOffset = pos;
      const indent = '  '.repeat(depth);

      let tagName;
      if (tagClass === 0) {
        tagName = UNIVERSAL_TAGS[tagByte] || ('TAG ' + tagNum);
        // For constructed SEQUENCE/SET the tag byte includes constructed bit
        if (tagByte === 0x30) tagName = 'SEQUENCE';
        if (tagByte === 0x31) tagName = 'SET';
      } else {
        const tagId = ((tagClass << 8) | tagNum);
        tagName = TAG_CLASSES[tagClass] + ' [' + tagNum + ']';
      }

      let valueStr = '';
      if (constructed) {
        valueStr = null; // Will be parsed recursively
      } else {
        const valueBytes = bytes.slice(pos, pos + length);
        valueStr = formatValue(tagByte, valueBytes);
      }

      results.push({
        indent, tagName, tagClass, constructed,
        tagByte: '0x' + tagByte.toString(16).toUpperCase().padStart(2, '0'),
        length, start, valueOffset,
        value: valueStr,
        raw: bytes.slice(pos, pos + length)
      });

      pos = valueOffset + length;
    }

    return results;
  }

  function formatValue(tagByte, bytes) {
    if (bytes.length === 0) return '';
    if (tagByte === 0x02) { // INTEGER
      let hex = Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
      // Try to display as number for small values
      if (bytes.length <= 8) {
        let num = 0;
        for (const b of bytes) num = (num << 8) | b;
        return hex + ' (' + num + ')';
      }
      return hex;
    }
    if (tagByte === 0x03) { // BIT STRING
      if (bytes.length > 1) {
        const unusedBits = bytes[0];
        const data = bytes.slice(1);
        const hex = Array.from(data).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
        return '(unused bits: ' + unusedBits + ') ' + hex;
      }
      return '';
    }
    if (tagByte === 0x04) { // OCTET STRING
      return Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    }
    if (tagByte === 0x05) return ''; // NULL
    if (tagByte === 0x06) { // OID
      return decodeOID(bytes);
    }
    if (tagByte === 0x13 || tagByte === 0x0C || tagByte === 0x16) { // String types
      return new TextDecoder().decode(bytes);
    }
    if (tagByte === 0x17) { // UTCTime
      return formatTime(bytes, false);
    }
    if (tagByte === 0x18) { // GeneralizedTime
      return formatTime(bytes, true);
    }
    // Default: hex
    return Array.from(bytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
  }

  function decodeOID(bytes) {
    if (bytes.length === 0) return '';
    const components = [];
    components.push(Math.floor(bytes[0] / 40));
    components.push(bytes[0] % 40);

    let value = 0;
    for (let i = 1; i < bytes.length; i++) {
      value = (value << 7) | (bytes[i] & 0x7F);
      if (!(bytes[i] & 0x80)) {
        components.push(value);
        value = 0;
      }
    }

    const oid = components.join('.');

    // Known OIDs
    const knownOIDs = {
      '2.5.4.3': 'CN (Common Name)',
      '2.5.4.6': 'C (Country)',
      '2.5.4.7': 'L (Locality)',
      '2.5.4.8': 'ST (State)',
      '2.5.4.10': 'O (Organization)',
      '2.5.4.11': 'OU (Organizational Unit)',
      '1.2.840.113549.1.1.1': 'RSA',
      '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
      '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
      '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
      '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
      '1.2.840.10045.2.1': 'EC Public Key',
      '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
      '2.5.29.14': 'subjectKeyIdentifier',
      '2.5.29.15': 'keyUsage',
      '2.5.29.17': 'subjectAltName',
      '2.5.29.19': 'basicConstraints',
      '2.5.29.35': 'authorityKeyIdentifier',
      '2.5.29.37': 'extKeyUsage',
      '1.3.6.1.5.5.7.3.1': 'serverAuth',
      '1.3.6.1.5.5.7.3.2': 'clientAuth',
    };

    return oid + (knownOIDs[oid] ? ' (' + knownOIDs[oid] + ')' : '');
  }

  function formatTime(bytes, isGeneralized) {
    const str = new TextDecoder().decode(bytes);
    // UTCTime: YYMMDDHHMMSSZ
    // GeneralizedTime: YYYYMMDDHHMMSSZ
    try {
      if (isGeneralized) {
        const y = str.substring(0,4), m = str.substring(4,6), d = str.substring(6,8);
        const h = str.substring(8,10), min = str.substring(10,12), s = str.substring(12,14);
        return y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s;
      } else {
        let y = str.substring(0,2), m = str.substring(2,4), d = str.substring(4,6);
        const h = str.substring(6,8), min = str.substring(8,10), s = str.substring(10,12);
        y = parseInt(y) >= 50 ? '19' + y : '20' + y;
        return y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s;
      }
    } catch (e) {
      return str;
    }
  }

  function buildASN1Tree(bytes, offset, length, depth) {
    const lines = [];
    let pos = offset;
    const end = offset + length;

    while (pos < end && depth < 50) {
      const startPos = pos;

      if (pos >= bytes.length) break;
      let tagByte = bytes[pos++];
      const tagClass = (tagByte >> 6) & 0x03;
      const constructed = (tagByte >> 5) & 0x01;
      let tagNum = tagByte & 0x1F;

      if (tagNum === 0x1F) {
        tagNum = 0;
        while (pos < bytes.length) {
          const b = bytes[pos++];
          tagNum = (tagNum << 7) | (b & 0x7F);
          if (!(b & 0x80)) break;
        }
      }

      if (pos >= bytes.length) break;
      let len = bytes[pos++];
      if (len & 0x80) {
        const numBytes = len & 0x7F;
        if (numBytes === 0) break;
        len = 0;
        for (let i = 0; i < numBytes && pos < bytes.length; i++) {
          len = (len << 8) | bytes[pos++];
        }
      }

      const indent = '  '.repeat(depth);
      let tagName;
      if (tagClass === 0) {
        if (tagByte === 0x30) tagName = 'SEQUENCE';
        else if (tagByte === 0x31) tagName = 'SET';
        else tagName = UNIVERSAL_TAGS[tagByte] || ('UNIVERSAL_' + tagNum);
      } else if (tagClass === 2) {
        tagName = '[' + tagNum + ']';
      } else {
        tagName = TAG_CLASSES[tagClass] + '_' + tagNum;
      }

      const headerLen = pos - startPos;
      const valueStart = pos;

      if (constructed) {
        lines.push(indent + tagName + ' (len=' + len + ') {');
        if (len > 0) {
          const inner = buildASN1Tree(bytes, valueStart, len, depth + 1);
          lines.push(...inner);
        }
        lines.push(indent + '}');
      } else {
        const valueBytes = bytes.slice(valueStart, valueStart + len);
        const valStr = formatValue(tagByte, valueBytes);
        const tagHex = '0x' + tagByte.toString(16).toUpperCase().padStart(2, '0');
        if (valStr) {
          const displayVal = valStr.length > 80 ? valStr.substring(0, 77) + '...' : valStr;
          lines.push(indent + tagName + ' [' + tagHex + '] (len=' + len + '): ' + displayVal);
        } else if (tagByte === 0x05) {
          lines.push(indent + tagName + ' [' + tagHex + '] (len=' + len + ')');
        } else {
          lines.push(indent + tagName + ' [' + tagHex + '] (len=' + len + ')');
        }
      }

      pos = valueStart + len;
    }

    return lines;
  }

  function extractCertFields(bytes) {
    const fields = {};
    try {
      // Certificate is a SEQUENCE of TBSCertificate, signatureAlgorithm, signatureValue
      // TBSCertificate is a SEQUENCE
      // Simple recursive extraction
      const tbsBytes = extractTBSCertificate(bytes);
      if (tbsBytes) {
        extractFieldsFromTBS(tbsBytes, fields);
      }
    } catch (e) {
      fields['解析警告'] = e.message;
    }
    return fields;
  }

  function extractTBSCertificate(bytes) {
    // Top-level SEQUENCE
    let pos = 0;
    if (bytes[pos++] !== 0x30) return null;
    let seqLen = bytes[pos++];
    if (seqLen & 0x80) {
      const n = seqLen & 0x7F;
      seqLen = 0;
      for (let i = 0; i < n; i++) seqLen = (seqLen << 8) | bytes[pos++];
    }

    // TBSCertificate is the first element (SEQUENCE or CONTEXT[0] for v3)
    const tbsStart = pos;
    let tagByte = bytes[pos++];
    let isExplicitVersion = false;

    // Check for explicit version tag [0]
    if (tagByte === 0xA0) {
      isExplicitVersion = true;
      let vLen = bytes[pos++];
      if (vLen & 0x80) {
        const n = vLen & 0x7F;
        vLen = 0;
        for (let i = 0; i < n; i++) vLen = (vLen << 8) | bytes[pos++];
      }
      // Skip version content
      pos += vLen;
      tagByte = bytes[pos++];
    }

    // Now find the end of TBSCertificate
    // TBSCertificate length
    let tbsLen = bytes[pos++];
    if (tbsLen & 0x80) {
      const n = tbsLen & 0x7F;
      tbsLen = 0;
      for (let i = 0; i < n; i++) tbsLen = (tbsLen << 8) | bytes[pos++];
    }
    const tbsTotalLen = pos + tbsLen - tbsStart;
    return bytes.slice(tbsStart, tbsStart + tbsTotalLen);
  }

  function readTLVAt(bytes, offset) {
    if (offset >= bytes.length) return null;
    let pos = offset;
    const tagByte = bytes[pos++];
    const constructed = (tagByte >> 5) & 1;
    let len = bytes[pos++];
    if (len & 0x80) {
      const n = len & 0x7F;
      if (n === 0) return null;
      len = 0;
      for (let i = 0; i < n; i++) len = (len << 8) | bytes[pos++];
    }
    return { tagByte, constructed, len, valueOffset: pos, endOffset: pos + len };
  }

  function extractFieldsFromTBS(tbsBytes, fields) {
    let pos = 0;

    // Outer SEQUENCE
    if (tbsBytes[pos++] !== 0x30) return;
    let seqLen = tbsBytes[pos++];
    if (seqLen & 0x80) {
      const n = seqLen & 0x7F;
      seqLen = 0;
      for (let i = 0; i < n; i++) seqLen = (seqLen << 8) | tbsBytes[pos++];
    }

    // Version [0] EXPLICIT
    let version = 'v1';
    if (tbsBytes[pos] === 0xA0) {
      const tlv = readTLVAt(tbsBytes, pos);
      if (tlv) {
        const verTLV = readTLVAt(tbsBytes, tlv.valueOffset);
        if (verTLV) {
          const v = tbsBytes[verTLV.valueOffset];
          version = 'v' + (v + 1);
        }
        pos = tlv.endOffset;
      }
    }
    fields['版本 (Version)'] = version;

    // Serial Number
    const serialTLV = readTLVAt(tbsBytes, pos);
    if (serialTLV && serialTLV.tagByte === 0x02) {
      const serialBytes = tbsBytes.slice(serialTLV.valueOffset, serialTLV.endOffset);
      fields['序列号 (Serial)'] = Array.from(serialBytes).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(':');
      pos = serialTLV.endOffset;
    }

    // Signature Algorithm
    const sigAlgTLV = readTLVAt(tbsBytes, pos);
    if (sigAlgTLV && sigAlgTLV.tagByte === 0x30) {
      const oidTLV = readTLVAt(tbsBytes, sigAlgTLV.valueOffset);
      if (oidTLV && oidTLV.tagByte === 0x06) {
        fields['签名算法 (SigAlg)'] = decodeOID(tbsBytes.slice(oidTLV.valueOffset, oidTLV.endOffset));
      }
      pos = sigAlgTLV.endOffset;
    }

    // Issuer
    const issuerTLV = readTLVAt(tbsBytes, pos);
    if (issuerTLV && issuerTLV.tagByte === 0x30) {
      fields['颁发者 (Issuer)'] = extractDN(tbsBytes, issuerTLV.valueOffset, issuerTLV.endOffset);
      pos = issuerTLV.endOffset;
    }

    // Validity
    const validityTLV = readTLVAt(tbsBytes, pos);
    if (validityTLV && validityTLV.tagByte === 0x30) {
      let vPos = validityTLV.valueOffset;
      const notBeforeTLV = readTLVAt(tbsBytes, vPos);
      if (notBeforeTLV) {
        fields['生效时间 (Not Before)'] = formatValue(notBeforeTLV.tagByte, tbsBytes.slice(notBeforeTLV.valueOffset, notBeforeTLV.endOffset));
        vPos = notBeforeTLV.endOffset;
      }
      const notAfterTLV = readTLVAt(tbsBytes, vPos);
      if (notAfterTLV) {
        fields['过期时间 (Not After)'] = formatValue(notAfterTLV.tagByte, tbsBytes.slice(notAfterTLV.valueOffset, notAfterTLV.endOffset));
      }
      pos = validityTLV.endOffset;
    }

    // Subject
    const subjectTLV = readTLVAt(tbsBytes, pos);
    if (subjectTLV && subjectTLV.tagByte === 0x30) {
      fields['使用者 (Subject)'] = extractDN(tbsBytes, subjectTLV.valueOffset, subjectTLV.endOffset);
      pos = subjectTLV.endOffset;
    }

    // SubjectPublicKeyInfo
    const spkiTLV = readTLVAt(tbsBytes, pos);
    if (spkiTLV && spkiTLV.tagByte === 0x30) {
      let spkiPos = spkiTLV.valueOffset;
      const algTLV = readTLVAt(tbsBytes, spkiPos);
      if (algTLV && algTLV.tagByte === 0x30) {
        const algOidTLV = readTLVAt(tbsBytes, algTLV.valueOffset);
        if (algOidTLV && algOidTLV.tagByte === 0x06) {
          fields['公钥算法 (PubKey Alg)'] = decodeOID(tbsBytes.slice(algOidTLV.valueOffset, algOidTLV.endOffset));
        }
        spkiPos = algTLV.endOffset;
      }
      const pkTLV = readTLVAt(tbsBytes, spkiPos);
      if (pkTLV && pkTLV.tagByte === 0x03) {
        const pkBytes = tbsBytes.slice(pkTLV.valueOffset + 1, pkTLV.endOffset); // skip unused bits byte
        fields['公钥长度 (PubKey Bits)'] = (pkBytes.length * 8) + ' bits';
      }
    }
  }

  function extractDN(bytes, start, end) {
    const parts = [];
    let pos = start;

    while (pos < end) {
      // SET
      const setTLV = readTLVAt(bytes, pos);
      if (!setTLV || setTLV.tagByte !== 0x31) break;

      let setPos = setTLV.valueOffset;
      // SEQUENCE
      const seqTLV = readTLVAt(bytes, setPos);
      if (!seqTLV || seqTLV.tagByte !== 0x30) break;

      let seqPos = seqTLV.valueOffset;
      // OID
      const oidTLV = readTLVAt(bytes, seqPos);
      if (!oidTLV || oidTLV.tagByte !== 0x06) break;
      const oidStr = decodeOID(bytes.slice(oidTLV.valueOffset, oidTLV.endOffset));
      // Extract short name
      let shortName = oidStr;
      const match = oidStr.match(/^([\d.]+)\s*\(([^)]+)\)/);
      if (match) shortName = match[2];

      seqPos = oidTLV.endOffset;
      // Value
      const valTLV = readTLVAt(bytes, seqPos);
      if (valTLV) {
        const val = new TextDecoder().decode(bytes.slice(valTLV.valueOffset, valTLV.endOffset));
        parts.push(shortName + '=' + val);
      }

      pos = setTLV.endOffset;
    }

    return parts.join(', ');
  }

  function doDecode() {
    Tool.hideErr(err);
    const val = input.value.trim();
    if (!val) {
      Tool.showErr(err, '请输入 PEM 证书');
      return;
    }

    try {
      const bytes = parsePEM(val);

      // Build ASN.1 tree
      const asn1Lines = buildASN1Tree(bytes, 0, bytes.length, 0);
      asn1Output.value = asn1Lines.join('\n');

      // Extract certificate fields
      const fields = extractCertFields(bytes);
      const fieldLines = [];
      for (const [key, value] of Object.entries(fields)) {
        fieldLines.push(key + ':');
        fieldLines.push('  ' + value);
        fieldLines.push('');
      }
      output.value = fieldLines.join('\n');
    } catch (e) {
      Tool.showErr(err, '解码失败: ' + e.message);
    }
  }
}
