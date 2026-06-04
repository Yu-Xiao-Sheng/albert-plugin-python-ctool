export const title = '二维码生成';

export function run(Tool) {
  Tool.header('二维码生成', 'QR');

  const inp = Tool.textarea('输入文本或 URL');
  Tool.container.appendChild(inp);

  const err = Tool.error();

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('生成二维码', generate, 'primary'));

  const outSection = Tool.section('生成结果');
  const qrDiv = document.createElement('div');
  qrDiv.id = 'qr-output';
  qrDiv.style.textAlign = 'center';
  outSection.appendChild(qrDiv);

  const downloadRow = document.createElement('div');
  downloadRow.className = 'btn-row';
  downloadRow.style.display = 'none';
  downloadRow.id = 'qr-download-row';
  downloadRow.appendChild(Tool.btn('下载 PNG', downloadQR));
  outSection.appendChild(downloadRow);

  let currentCanvas = null;

  function generate() {
    Tool.hideErr(err);
    const text = inp.value.trim();
    if (!text) { Tool.showErr(err, '请输入文本或 URL'); return; }

    // Load qrcode library if not loaded
    if (typeof qrcode === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
      script.onload = () => doGenerate(text);
      script.onerror = () => Tool.showErr(err, '二维码库加载失败');
      document.head.appendChild(script);
    } else {
      doGenerate(text);
    }
  }

  function doGenerate(text) {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(text);
      qr.make();

      const size = 8;
      const modules = qr.getModuleCount();
      const canvas = document.createElement('canvas');
      const margin = 4;
      canvas.width = (modules + margin * 2) * size;
      canvas.height = (modules + margin * 2) * size;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      for (let r = 0; r < modules; r++) {
        for (let c = 0; c < modules; c++) {
          if (qr.isDark(r, c)) {
            ctx.fillRect((c + margin) * size, (r + margin) * size, size, size);
          }
        }
      }

      qrDiv.innerHTML = '';
      qrDiv.appendChild(canvas);
      currentCanvas = canvas;
      document.getElementById('qr-download-row').style.display = '';

      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.border = '1px solid #ddd';
    } catch (e) {
      Tool.showErr(err, '生成失败: ' + e.message);
    }
  }

  function downloadQR() {
    if (!currentCanvas) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = currentCanvas.toDataURL('image/png');
    link.click();
  }
}
