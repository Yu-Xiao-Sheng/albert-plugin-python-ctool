export const title = 'HMAC 生成';

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function run(Tool) {
  Tool.header('HMAC 生成');

  const sec = Tool.section();
  const input = Tool.textarea('输入要计算 HMAC 的文本...');
  sec.appendChild(input);

  const keyInput = Tool.input('输入密钥');
  Tool.formRow('密钥', keyInput);

  const algSelect = Tool.select([
    ['SHA-1', 'SHA-1'],
    ['SHA-256', 'SHA-256'],
    ['SHA-512', 'SHA-512']
  ]);
  Tool.formRow('算法', algSelect);

  const errEl = Tool.error();

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('生成 HMAC', doHmac, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    keyInput.value = '';
    output.value = '';
    Tool.hideErr(errEl);
  }));

  const outSec = Tool.section('输出');
  const output = Tool.textarea('HMAC 结果', true);
  outSec.appendChild(output);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制结果', () => {
    if (output.value) Tool.copy(output.value);
  }));

  async function doHmac() {
    const text = input.value;
    const key = keyInput.value;
    if (!text) {
      Tool.showErr(errEl, '请输入文本');
      return;
    }
    if (!key) {
      Tool.showErr(errEl, '请输入密钥');
      return;
    }
    Tool.hideErr(errEl);

    try {
      const alg = algSelect.value;
      const encoder = new TextEncoder();

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key),
        { name: 'HMAC', hash: alg },
        false,
        ['sign']
      );

      const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(text));
      output.value = bufToHex(sig);
    } catch (e) {
      Tool.showErr(errEl, '生成失败: ' + e.message);
    }
  }
}
