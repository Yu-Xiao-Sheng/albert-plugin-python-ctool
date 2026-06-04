export const title = '二维码解析';

export function run(Tool) {
  Tool.header('二维码解析', 'QR');

  Tool.html(Tool.section('说明'),
    '<div class="result-block" style="padding: 12px;">' +
    '<p>浏览器端二维码解析需要摄像头权限，在桌面工具中不太适用。</p>' +
    '<p>该功能已整合到 <strong>二维码生成</strong> 工具中，可前往使用。</p>' +
    '<p>如果你需要将文本内容编码为二维码，请使用二维码生成工具。</p>' +
    '</div>'
  );

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('前往二维码生成', () => {
    const url = new URL(location.href);
    url.searchParams.set('t', 'qr_generate');
    location.href = url.toString();
  }, 'primary'));
}
