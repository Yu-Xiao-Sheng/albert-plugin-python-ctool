export const title = 'Gzip 压缩/解压';
export function run(Tool) {
  Tool.header('Gzip 压缩/解压', 'Compression API');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入文本...');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('压缩 (Gzip)', async () => {
    Tool.hideErr(err);
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input.value);
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();

      writer.write(data);
      writer.close();

      const chunks = [];
      let totalLen = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLen += value.length;
      }

      const result = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      // Display as Base64
      let binary = '';
      result.forEach(b => binary += String.fromCharCode(b));
      output.value = btoa(binary);
      Tool.toast('压缩完成，Base64 输出', 'success');
    } catch (e) {
      Tool.showErr(err, '压缩失败: ' + e.message);
    }
  }));
  row.appendChild(Tool.btn('解压 (Gzip)', async () => {
    Tool.hideErr(err);
    try {
      // Input is Base64 encoded gzip data
      const binary = atob(input.value.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const cs = new DecompressionStream('gzip');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();

      writer.write(bytes);
      writer.close();

      const chunks = [];
      let totalLen = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        totalLen += value.length;
      }

      const result = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      const decoder = new TextDecoder();
      output.value = decoder.decode(result);
      Tool.toast('解压完成', 'success');
    } catch (e) {
      Tool.showErr(err, '解压失败: ' + e.message);
    }
  }));

  const outputSec = Tool.section('输出 (Base64)');
  const output = Tool.textarea('结果...', true);
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));
}
