export const title = '条形码生成';

export function run(Tool) {
  Tool.header('条形码生成', 'Barcode');

  const inp = Tool.input('输入条形码内容');
  Tool.formRow('内容', inp);

  const formatSelect = Tool.select([
    ['CODE128', 'CODE128 (通用)'],
    ['EAN13', 'EAN-13 (13位数字)'],
    ['UPC', 'UPC-A (12位数字)'],
    ['CODE39', 'CODE39'],
    ['ITF14', 'ITF-14 (14位数字)'],
    ['pharmacode', 'Pharmacode'],
  ]);
  Tool.formRow('格式', formatSelect);

  const err = Tool.error();

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('生成条形码', generate, 'primary'));

  const outSection = Tool.section('生成结果');
  const barcodeSvg = document.createElement('svg');
  barcodeSvg.id = 'barcode-svg';
  outSection.appendChild(barcodeSvg);

  const downloadRow = document.createElement('div');
  downloadRow.className = 'btn-row';
  downloadRow.id = 'barcode-download';
  downloadRow.style.display = 'none';
  downloadRow.appendChild(Tool.btn('下载 SVG', downloadSVG));
  downloadRow.appendChild(Tool.btn('复制 SVG', () => {
    const svg = document.getElementById('barcode-svg');
    Tool.copy(svg.outerHTML);
  }));
  outSection.appendChild(downloadRow);

  function generate() {
    Tool.hideErr(err);
    const text = inp.value.trim();
    if (!text) { Tool.showErr(err, '请输入条形码内容'); return; }

    if (typeof JsBarcode === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
      script.onload = () => doGenerate(text);
      script.onerror = () => Tool.showErr(err, 'JsBarcode 库加载失败');
      document.head.appendChild(script);
    } else {
      doGenerate(text);
    }
  }

  function doGenerate(text) {
    try {
      const format = formatSelect.value;
      const svg = document.getElementById('barcode-svg');
      JsBarcode(svg, text, {
        format: format,
        lineColor: '#000',
        width: 2,
        height: 80,
        displayValue: true,
        font: 'monospace',
        fontSize: 14,
        margin: 10,
      });
      document.getElementById('barcode-download').style.display = '';
      Tool.toast('条形码生成成功', 'success');
    } catch (e) {
      Tool.showErr(err, '生成失败: ' + e.message);
    }
  }

  function downloadSVG() {
    const svg = document.getElementById('barcode-svg');
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'barcode.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
