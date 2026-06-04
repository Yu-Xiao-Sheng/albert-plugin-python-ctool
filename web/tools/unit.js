export const title = '单位转换';

export function run(Tool) {
  Tool.header('单位转换', 'Unit');

  const categories = {
    '长度': {
      units: [
        ['mm', '毫米 (mm)', 0.001],
        ['cm', '厘米 (cm)', 0.01],
        ['m', '米 (m)', 1],
        ['km', '千米 (km)', 1000],
        ['in', '英寸 (in)', 0.0254],
        ['ft', '英尺 (ft)', 0.3048],
        ['yd', '码 (yd)', 0.9144],
        ['mi', '英里 (mi)', 1609.344],
        ['nmi', '海里 (nmi)', 1852],
      ],
    },
    '面积': {
      units: [
        ['mm2', '平方毫米', 0.000001],
        ['cm2', '平方厘米', 0.0001],
        ['m2', '平方米', 1],
        ['km2', '平方千米', 1000000],
        ['ha', '公顷', 10000],
        ['acre', '英亩', 4046.8564224],
        ['ft2', '平方英尺', 0.09290304],
      ],
    },
    '体积': {
      units: [
        ['ml', '毫升', 0.001],
        ['l', '升', 1],
        ['m3', '立方米', 1000],
        ['gal', '加仑 (美)', 3.785411784],
        ['qt', '夸脱 (美)', 0.946352946],
        ['pt', '品脱 (美)', 0.473176473],
        ['floz', '液盎司 (美)', 0.0295735296],
        ['cup', '杯 (美)', 0.2365882365],
      ],
    },
    '质量': {
      units: [
        ['mg', '毫克', 0.001],
        ['g', '克', 1],
        ['kg', '千克', 1000],
        ['t', '吨', 1000000],
        ['oz', '盎司', 28.349523125],
        ['lb', '磅', 453.59237],
        ['jin', '斤', 500],
        ['liang', '两', 50],
      ],
    },
    '温度': {
      special: true,
      units: [
        ['C', '摄氏度 (°C)'],
        ['F', '华氏度 (°F)'],
        ['K', '开尔文 (K)'],
      ],
    },
  };

  const catSelect = Tool.select(Object.keys(categories).map(k => [k, k]));
  Tool.formRow('类别', catSelect);

  const valueInput = Tool.input('输入数值', 'number');
  Tool.formRow('数值', valueInput);

  const fromSelect = Tool.select([['', '请选择']]);
  const fromRow = document.createElement('div'); fromRow.className = 'form-row';
  fromRow.innerHTML = '<label>从</label>'; fromRow.appendChild(fromSelect);
  Tool.container.appendChild(fromRow);

  const toSelect = Tool.select([['', '请选择']]);
  const toRow = document.createElement('div'); toRow.className = 'form-row';
  toRow.innerHTML = '<label>到</label>'; toRow.appendChild(toSelect);
  Tool.container.appendChild(toRow);

  const err = Tool.error();

  const br = Tool.btnRow();
  br.appendChild(Tool.btn('转换', doConvert, 'primary'));

  const resultSection = Tool.section('结果');
  const resultOut = Tool.textarea('', true);
  resultSection.appendChild(resultOut);

  function updateUnits() {
    const cat = catSelect.value;
    const catData = categories[cat];
    const opts = catData.units.map(([val, text]) => [val, text]);
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    opts.forEach(([val, text]) => {
      fromSelect.appendChild(new Option(text, val));
      toSelect.appendChild(new Option(text, val));
    });
    if (opts.length > 1) toSelect.selectedIndex = 1;
  }

  catSelect.addEventListener('change', updateUnits);
  updateUnits();

  function doConvert() {
    Tool.hideErr(err);
    const val = parseFloat(valueInput.value);
    if (isNaN(val)) { Tool.showErr(err, '请输入有效数值'); return; }
    const cat = catSelect.value;
    const from = fromSelect.value;
    const to = toSelect.value;
    if (!from || !to) { Tool.showErr(err, '请选择单位'); return; }

    let result;
    if (cat === '温度') {
      result = convertTemp(val, from, to);
    } else {
      const catData = categories[cat];
      const fromFactor = catData.units.find(u => u[0] === from)[2];
      const toFactor = catData.units.find(u => u[0] === to)[2];
      result = val * fromFactor / toFactor;
    }

    const fromLabel = categories[cat].units.find(u => u[0] === from)[1];
    const toLabel = categories[cat].units.find(u => u[0] === to)[1];

    resultOut.value =
      `${val} ${fromLabel}\n= ${result} ${toLabel}\n\n` +
      `${result.toPrecision(10)}`;
  }

  function convertTemp(val, from, to) {
    // Convert to Celsius first
    let c;
    if (from === 'C') c = val;
    else if (from === 'F') c = (val - 32) * 5 / 9;
    else c = val - 273.15; // K

    // Convert from Celsius to target
    if (to === 'C') return c;
    if (to === 'F') return c * 9 / 5 + 32;
    return c + 273.15; // K
  }
}
