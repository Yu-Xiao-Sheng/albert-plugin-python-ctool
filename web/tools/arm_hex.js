export const title = 'ARM/HEX 转换';
export function run(Tool) {
  Tool.header('ARM 指令 / HEX 转换');

  const err = Tool.error();

  const inputSec = Tool.section('输入');
  const input = Tool.textarea('请输入 ARM 汇编指令或 HEX 值...\n示例指令: MOV R0, #1 / ADD R1, R2, R3 / NOP / B 0x100');
  inputSec.appendChild(input);

  const row = Tool.btnRow();
  row.appendChild(Tool.btn('ARM → Hex', doArmToHex, 'primary'));
  row.appendChild(Tool.btn('Hex → ARM', doHexToArm, 'primary'));
  row.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    Tool.hideErr(err);
  }));

  const outputSec = Tool.section('输出');
  const output = Tool.textarea('转换结果...', true);
  output.style.fontFamily = 'monospace';
  outputSec.appendChild(output);

  const outRow = Tool.btnRow();
  outRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));

  // Basic ARM (32-bit ARMv7) instruction encoding
  // Supports: NOP, MOV Rd, #imm, ADD Rd, Rn, #imm, ADD Rd, Rn, Rm,
  //           SUB Rd, Rn, #imm, SUB Rd, Rn, Rm,
  //           B offset/label, BL offset/label, LDR Rd, [Rn, #offset], STR Rd, [Rn, #offset]

  function parseReg(s) {
    const m = s.trim().toUpperCase().match(/^R(\d+)$/);
    if (!m) return -1;
    const n = parseInt(m[1]);
    return (n >= 0 && n <= 15) ? n : -1;
  }

  function parseImm(s) {
    s = s.trim();
    if (s.startsWith('#')) s = s.substring(1).trim();
    if (s.startsWith('0x') || s.startsWith('0X')) return parseInt(s, 16);
    if (s.startsWith('0b') || s.startsWith('0B')) return parseInt(s.substring(2), 2);
    return parseInt(s, 10);
  }

  function encodeShiftedImm(imm) {
    // Try to find a rotation that fits 8-bit rotated immediate
    for (let rot = 0; rot < 16; rot++) {
      const rotated = ((imm >>> 0) << (rot * 2)) | (imm >>> (32 - rot * 2));
      const val = (rotated >>> 0) & 0xFFFFFFFF;
      if ((val & 0xFFFFFF00) === 0) {
        return (rot << 8) | (val & 0xFF);
      }
    }
    // Check if imm fits in 8 bits directly
    if (imm >= 0 && imm <= 255) return imm;
    return -1;
  }

  function encodeArmToHex(line) {
    line = line.trim();
    // Remove comments
    const commentIdx = line.indexOf(';');
    if (commentIdx >= 0) line = line.substring(0, commentIdx).trim();
    // Remove @ comments
    const atIdx = line.indexOf('@');
    if (atIdx >= 0) line = line.substring(0, atIdx).trim();
    if (!line) return null;

    // Normalize: uppercase, collapse whitespace
    const upper = line.toUpperCase().replace(/\s+/g, ' ').trim();

    // NOP
    if (upper === 'NOP') return 0xE1A00000;

    // Split into mnemonic and operands
    const spaceIdx = upper.indexOf(' ');
    if (spaceIdx < 0) {
      // Bare mnemonic
      if (upper === 'NOP') return 0xE1A00000;
      throw new Error('无法识别的指令: ' + line);
    }
    const mnemonic = upper.substring(0, spaceIdx);
    const operands = upper.substring(spaceIdx + 1).split(',').map(s => s.trim());

    // MOV Rd, #imm => cond 00 I opcode S Rn Rd shift_imm
    // MOV = data processing, opcode = 1101, I=1 for immediate
    if (mnemonic === 'MOV') {
      if (operands.length === 2) {
        const rd = parseReg(operands[0]);
        const imm = parseImm(operands[1]);
        if (rd < 0) throw new Error('无效的寄存器: ' + operands[0]);
        const imm12 = encodeShiftedImm(imm);
        if (imm12 < 0) throw new Error('无法编码立即数: ' + operands[1]);
        return (0xE3A00000 | (rd << 12) | imm12) >>> 0;
      }
      if (operands.length === 2 && parseReg(operands[1]) >= 0) {
        const rd = parseReg(operands[0]);
        const rm = parseReg(operands[1]);
        return (0xE1A00000 | (rd << 12) | rm) >>> 0;
      }
      throw new Error('MOV 格式: MOV Rd, #imm 或 MOV Rd, Rm');
    }

    // ADD Rd, Rn, #imm / ADD Rd, Rn, Rm
    if (mnemonic === 'ADD') {
      if (operands.length === 3) {
        const rd = parseReg(operands[0]);
        const rn = parseReg(operands[1]);
        if (rd < 0 || rn < 0) throw new Error('无效的寄存器');
        if (operands[2].startsWith('#') || /^\d/.test(operands[2])) {
          const imm = parseImm(operands[2]);
          const imm12 = encodeShiftedImm(imm);
          if (imm12 < 0) throw new Error('无法编码立即数: ' + operands[2]);
          return (0xE2800000 | (rn << 16) | (rd << 12) | imm12) >>> 0;
        } else {
          const rm = parseReg(operands[2]);
          if (rm < 0) throw new Error('无效的寄存器: ' + operands[2]);
          return (0xE0800000 | (rn << 16) | (rd << 12) | rm) >>> 0;
        }
      }
      throw new Error('ADD 格式: ADD Rd, Rn, #imm 或 ADD Rd, Rn, Rm');
    }

    // SUB Rd, Rn, #imm / SUB Rd, Rn, Rm
    if (mnemonic === 'SUB') {
      if (operands.length === 3) {
        const rd = parseReg(operands[0]);
        const rn = parseReg(operands[1]);
        if (rd < 0 || rn < 0) throw new Error('无效的寄存器');
        if (operands[2].startsWith('#') || /^\d/.test(operands[2])) {
          const imm = parseImm(operands[2]);
          const imm12 = encodeShiftedImm(imm);
          if (imm12 < 0) throw new Error('无法编码立即数: ' + operands[2]);
          return (0xE2400000 | (rn << 16) | (rd << 12) | imm12) >>> 0;
        } else {
          const rm = parseReg(operands[2]);
          if (rm < 0) throw new Error('无效的寄存器: ' + operands[2]);
          return (0xE0400000 | (rn << 16) | (rd << 12) | rm) >>> 0;
        }
      }
      throw new Error('SUB 格式: SUB Rd, Rn, #imm 或 SUB Rd, Rn, Rm');
    }

    // B offset / BL offset
    if (mnemonic === 'B' || mnemonic === 'BL') {
      const link = mnemonic === 'BL' ? 1 : 0;
      const offset = parseImm(operands[0]);
      // offset is in bytes, encode as signed 24-bit word offset
      const off = (offset >> 2) & 0x00FFFFFF;
      return ((0xEA000000 | (link << 24) | off) >>> 0);
    }

    // LDR Rd, [Rn, #offset]
    if (mnemonic === 'LDR') {
      if (operands.length >= 2) {
        const rd = parseReg(operands[0]);
        if (rd < 0) throw new Error('无效的寄存器: ' + operands[0]);
        // Parse [Rn, #offset]
        const memStr = operands.slice(1).join(',').trim();
        const memMatch = memStr.match(/^\[R(\d+)\s*,\s*#(-?\d+)\]$/i);
        if (!memMatch) {
          // Try [Rn] (no offset)
          const memMatch2 = memStr.match(/^\[R(\d+)\]$/i);
          if (memMatch2) {
            const rn = parseInt(memMatch2[1]);
            return (0xE5900000 | (rn << 16) | (rd << 12)) >>> 0;
          }
          throw new Error('LDR 格式: LDR Rd, [Rn, #offset]');
        }
        const rn = parseInt(memMatch[1]);
        const off = parseInt(memMatch[2]);
        if (off < 0) {
          return (0xE5100000 | (rn << 16) | (rd << 12) | ((-off) & 0xFFF)) >>> 0;
        }
        return (0xE5900000 | (rn << 16) | (rd << 12) | (off & 0xFFF)) >>> 0;
      }
      throw new Error('LDR 格式: LDR Rd, [Rn, #offset]');
    }

    // STR Rd, [Rn, #offset]
    if (mnemonic === 'STR') {
      if (operands.length >= 2) {
        const rd = parseReg(operands[0]);
        if (rd < 0) throw new Error('无效的寄存器: ' + operands[0]);
        const memStr = operands.slice(1).join(',').trim();
        const memMatch = memStr.match(/^\[R(\d+)\s*,\s*#(-?\d+)\]$/i);
        if (!memMatch) {
          const memMatch2 = memStr.match(/^\[R(\d+)\]$/i);
          if (memMatch2) {
            const rn = parseInt(memMatch2[1]);
            return (0xE5800000 | (rn << 16) | (rd << 12)) >>> 0;
          }
          throw new Error('STR 格式: STR Rd, [Rn, #offset]');
        }
        const rn = parseInt(memMatch[1]);
        const off = parseInt(memMatch[2]);
        if (off < 0) {
          return (0xE5000000 | (rn << 16) | (rd << 12) | ((-off) & 0xFFF)) >>> 0;
        }
        return (0xE5800000 | (rn << 16) | (rd << 12) | (off & 0xFFF)) >>> 0;
      }
      throw new Error('STR 格式: STR Rd, [Rn, #offset]');
    }

    throw new Error('不支持的指令: ' + mnemonic + '\n支持: MOV, ADD, SUB, B, BL, LDR, STR, NOP');
  }

  function decodeHexToArm(hex) {
    const instr = hex >>> 0;
    const cond = (instr >>> 28) & 0xF;
    const condStr = ['EQ','NE','CS','CC','MI','PL','VS','VC','HI','LS','GE','LT','GT','LE','','NV'][cond];

    // Data processing immediate
    if (((instr >>> 26) & 0x3) === 0) {
      const I = (instr >>> 25) & 1;
      const opcode = (instr >>> 21) & 0xF;
      const S = (instr >>> 20) & 1;
      const rn = (instr >>> 16) & 0xF;
      const rd = (instr >>> 12) & 0xF;
      const opMnemonics = ['AND','EOR','SUB','RSB','ADD','ADC','SBC','RSC','TST','TEQ','CMP','CMN','ORR','MOV','BIC','MVN'];
      const mnemonic = opMnemonics[opcode];

      if (opcode === 13) { // MOV
        if (I) {
          const imm12 = instr & 0xFFF;
          const rot = (imm12 >>> 8) & 0xF;
          const val = imm12 & 0xFF;
          const imm = ((val >>> (rot * 2)) | (val << (32 - rot * 2))) >>> 0;
          return `MOV R${rd}, #${imm}`;
        } else {
          const rm = instr & 0xF;
          return `MOV R${rd}, R${rm}`;
        }
      }

      if (opcode === 15) { // MVN
        if (I) {
          const imm12 = instr & 0xFFF;
          const rot = (imm12 >>> 8) & 0xF;
          const val = imm12 & 0xFF;
          const imm = ((val >>> (rot * 2)) | (val << (32 - rot * 2))) >>> 0;
          return `MVN R${rd}, #${imm}`;
        } else {
          const rm = instr & 0xF;
          return `MVN R${rd}, R${rm}`;
        }
      }

      if (opcode === 0 || opcode === 1 || opcode === 2 || opcode === 3 ||
          opcode === 4 || opcode === 5 || opcode === 6 || opcode === 7 ||
          opcode === 12 || opcode === 14) {
        if (I) {
          const imm12 = instr & 0xFFF;
          const rot = (imm12 >>> 8) & 0xF;
          const val = imm12 & 0xFF;
          const imm = ((val >>> (rot * 2)) | (val << (32 - rot * 2))) >>> 0;
          return `${mnemonic} R${rd}, R${rn}, #${imm}`;
        } else {
          const rm = instr & 0xF;
          return `${mnemonic} R${rd}, R${rn}, R${rm}`;
        }
      }

      // TST, TEQ, CMP, CMN don't have Rd useful for display, but show anyway
      if (I) {
        const imm12 = instr & 0xFFF;
        const rot = (imm12 >>> 8) & 0xF;
        const val = imm12 & 0xFF;
        const imm = ((val >>> (rot * 2)) | (val << (32 - rot * 2))) >>> 0;
        return `${mnemonic} R${rn}, #${imm}`;
      } else {
        const rm = instr & 0xF;
        return `${mnemonic} R${rn}, R${rm}`;
      }
    }

    // Branch
    if (((instr >>> 25) & 0x7) === 0x5) {
      const link = (instr >>> 24) & 1;
      let offset = instr & 0x00FFFFFF;
      if (offset & 0x800000) offset = offset | 0xFF000000; // sign extend
      const byteOffset = (offset << 2);
      const mnemonic = link ? 'BL' : 'B';
      return `${mnemonic} ${byteOffset}`;
    }

    // LDR/STR
    if (((instr >>> 26) & 0x3) === 1) {
      const P = (instr >>> 24) & 1;
      const U = (instr >>> 23) & 1;
      const B = (instr >>> 22) & 1;
      const W = (instr >>> 21) & 1;
      const L = (instr >>> 20) & 1;
      const rn = (instr >>> 16) & 0xF;
      const rd = (instr >>> 12) & 0xF;
      const offset12 = instr & 0xFFF;
      const mnemonic = L ? 'LDR' : 'STR';
      const byteChar = B ? 'B' : '';
      const sign = U ? '' : '-';
      if (P) {
        if (offset12 === 0) {
          return `${mnemonic}${byteChar} R${rd}, [R${rn}]`;
        }
        return `${mnemonic}${byteChar} R${rd}, [R${rn}, #${sign}${offset12}]`;
      }
      return `${mnemonic}${byteChar} R${rd}, [R${rn}], #${sign}${offset12}`;
    }

    return `.word 0x${instr.toString(16).toUpperCase().padStart(8, '0')}`;
  }

  function doArmToHex() {
    Tool.hideErr(err);
    const text = input.value.trim();
    if (!text) {
      Tool.showErr(err, '请输入 ARM 汇编指令');
      return;
    }
    const lines = text.split('\n');
    const results = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('@') || trimmed.startsWith('//')) {
        results.push('');
        continue;
      }
      try {
        const hex = encodeArmToHex(trimmed);
        if (hex !== null) {
          results.push('0x' + hex.toString(16).toUpperCase().padStart(8, '0') + '    ; ' + trimmed);
        }
      } catch (e) {
        results.push('ERROR: ' + trimmed + ' -> ' + e.message);
      }
    }
    output.value = results.join('\n');
  }

  function doHexToArm() {
    Tool.hideErr(err);
    const text = input.value.trim();
    if (!text) {
      Tool.showErr(err, '请输入 HEX 值');
      return;
    }
    const lines = text.split('\n');
    const results = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        results.push('');
        continue;
      }
      // Strip possible 0x prefix, semicolons, comments
      let hexStr = trimmed.replace(/;.*$/, '').trim().replace(/^0x/i, '').replace(/^0X/, '');
      if (hexStr.length > 8) hexStr = hexStr.substring(0, 8);
      const val = parseInt(hexStr, 16);
      if (isNaN(val)) {
        results.push('ERROR: 无法解析: ' + trimmed);
        continue;
      }
      try {
        const arm = decodeHexToArm(val);
        results.push(arm + '    ; 0x' + hexStr.toUpperCase().padStart(8, '0'));
      } catch (e) {
        results.push('ERROR: ' + trimmed + ' -> ' + e.message);
      }
    }
    output.value = results.join('\n');
  }
}
