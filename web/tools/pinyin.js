export const title = '中文转拼音';

const PINYIN_MAP = {
  '的': 'de2', '一': 'yi1', '是': 'shi4', '不': 'bu4', '了': 'le5',
  '人': 'ren2', '我': 'wo3', '在': 'zai4', '他': 'ta1', '有': 'you3',
  '这': 'zhe4', '个': 'ge4', '上': 'shang4', '们': 'men5', '来': 'lai2',
  '到': 'dao4', '时': 'shi2', '大': 'da4', '地': 'di4', '为': 'wei2',
  '子': 'zi3', '中': 'zhong1', '你': 'ni3', '说': 'shuo1', '生': 'sheng1',
  '国': 'guo2', '年': 'nian2', '着': 'zhe5', '就': 'jiu4', '那': 'na4',
  '要': 'yao4', '和': 'he2', '她': 'ta1', '出': 'chu1', '也': 'ye3',
  '得': 'de2', '里': 'li3', '后': 'hou4', '自': 'zi4', '以': 'yi3',
  '会': 'hui4', '家': 'jia1', '可': 'ke3', '下': 'xia4', '过': 'guo4',
  '天': 'tian1', '能': 'neng2', '对': 'dui4', '然': 'ran2', '用': 'yong4',
  '心': 'xin1', '学': 'xue2', '所': 'suo3', '之': 'zhi1', '道': 'dao4',
  '好': 'hao3', '看': 'kan4', '多': 'duo1', '么': 'me5', '去': 'qu4',
  '没': 'mei2', '把': 'ba3', '还': 'hai2', '应': 'ying1', '事': 'shi4',
  '成': 'cheng2', '方': 'fang1', '如': 'ru2', '都': 'dou1', '进': 'jin4',
  '行': 'xing2', '想': 'xiang3', '种': 'zhong3', '开': 'kai1', '动': 'dong4',
  '长': 'chang2', '已': 'yi3', '现': 'xian4', '做': 'zuo4', '主': 'zhu3',
  '意': 'yi4', '从': 'cong2', '让': 'rang4', '知': 'zhi1', '给': 'gei3',
  '两': 'liang3', '被': 'bei4', '但': 'dan4', '前': 'qian2', '面': 'mian4',
  '又': 'you4', '定': 'ding4', '问': 'wen4', '很': 'hen3', '理': 'li3',
  '代': 'dai4', '当': 'dang1', '情': 'qing2', '三': 'san1', '话': 'hua4',
  '样': 'yang4', '明': 'ming2', '高': 'gao1', '将': 'jiang1', '因': 'yin1',
  '手': 'shou3', '只': 'zhi3', '力': 'li4', '本': 'ben3', '点': 'dian3',
  '经': 'jing1', '电': 'dian4', '等': 'deng3', '十': 'shi2', '体': 'ti3',
  '无': 'wu2', '正': 'zheng4', '新': 'xin1', '门': 'men2', '老': 'lao3',
  '起': 'qi3', '与': 'yu3', '论': 'lun4', '别': 'bie2', '写': 'xie3',
  '总': 'zong3', '名': 'ming2', '目': 'mu4', '吗': 'ma5', '听': 'ting1',
  '先': 'xian1', '变': 'bian4', '回': 'hui2', '信': 'xin4', '打': 'da3',
  '水': 'shui3', '走': 'zou3', '机': 'ji1', '工': 'gong1', '表': 'biao3',
  '感': 'gan3', '制': 'zhi4', '部': 'bu4', '加': 'jia1', '则': 'ze2',
  '何': 'he2', '量': 'liang4', '间': 'jian1', '法': 'fa3', '日': 'ri4',
  '产': 'chan3', '常': 'chang2', '业': 'ye4', '系': 'xi4', '利': 'li4',
  '相': 'xiang1', '教': 'jiao1', '处': 'chu4', '文': 'wen2', '组': 'zu3',
  '次': 'ci4', '风': 'feng1', '治': 'zhi4', '计': 'ji4', '展': 'zhan3',
  '觉': 'jue2', '带': 'dai4', '运': 'yun4', '合': 'he2', '反': 'fan3',
  '内': 'nei4', '真': 'zhen1', '任': 'ren4', '果': 'guo3', '气': 'qi4',
  '解': 'jie3', '件': 'jian4', '育': 'yu4', '场': 'chang3', '管': 'guan3',
  '务': 'wu4', '记': 'ji4', '越': 'yue4', '通': 'tong1', '美': 'mei3',
  '接': 'jie1', '立': 'li4', '特': 'te4', '关': 'guan1', '安': 'an1',
  '白': 'bai2', '少': 'shao3', '区': 'qu1', '改': 'gai3', '重': 'zhong4',
  '东': 'dong1', '四': 'si4', '战': 'zhan4', '西': 'xi1', '干': 'gan4',
  '全': 'quan2', '办': 'ban4', '太': 'tai4', '江': 'jiang1', '花': 'hua1',
  '爱': 'ai4', '南': 'nan2', '城': 'cheng2', '书': 'shu1', '路': 'lu4',
  '数': 'shu4', '化': 'hua4', '半': 'ban4', '头': 'tou2', '黑': 'hei1',
  '光': 'guang1', '死': 'si3', '笑': 'xiao4', '语': 'yu3', '声': 'sheng1',
  '友': 'you3', '克': 'ke4', '红': 'hong2', '吃': 'chi1', '乐': 'le4',
  '张': 'zhang1', '五': 'wu3', '马': 'ma3', '车': 'che1', '眼': 'yan3',
  '许': 'xu3', '空': 'kong1', '放': 'fang4', '快': 'kuai4', '久': 'jiu3',
  '坐': 'zuo4', '夜': 'ye4', '世': 'shi4', '百': 'bai3', '月': 'yue4',
  '海': 'hai3', '王': 'wang2', '像': 'xiang4', '左': 'zuo3', '右': 'you4',
  '思': 'si1', '山': 'shan1', '金': 'jin1', '石': 'shi2', '云': 'yun2',
  '字': 'zi4', '读': 'du2', '画': 'hua4', '春': 'chun1', '夏': 'xia4',
  '秋': 'qiu1', '冬': 'dong1', '男': 'nan2', '女': 'nv3',
  '火': 'huo3', '木': 'mu4', '土': 'tu3', '星': 'xing1',
  '猫': 'mao1', '狗': 'gou3', '鱼': 'yu2', '鸟': 'niao3',
  '龙': 'long2', '牛': 'niu2', '羊': 'yang2', '猪': 'zhu1', '鸡': 'ji1',
  '米': 'mi3', '菜': 'cai4', '茶': 'cha2', '酒': 'jiu3', '肉': 'rou4',
  '跑': 'pao3', '飞': 'fei1', '唱': 'chang4', '跳': 'tiao4',
  '喝': 'he1', '睡': 'shui4', '哭': 'ku1', '叫': 'jiao4', '找': 'zhao3',
  '买': 'mai3', '卖': 'mai4', '绿': 'lv4', '蓝': 'lan2', '黄': 'huang2',
  '紫': 'zi3', '灰': 'hui1', '平': 'ping2', '坏': 'huai4', '丑': 'chou3',
  '冷': 'leng3', '热': 're4', '报': 'bao4', '林': 'lin2', '声': 'sheng1',
  '完': 'wan2', '格': 'ge2', '站': 'zhan4', '拉': 'la1', '局': 'ju2',
  '低': 'di1', '度': 'du4', '术': 'shu4', '深': 'shen1', '远': 'yuan3',
  '县': 'xian4', '达': 'da2', '科': 'ke1', '容': 'rong2', '图': 'tu2',
  '算': 'suan4', '色': 'se4', '保': 'bao3', '持': 'chi2', '温': 'wen1',
  '器': 'qi4', '单': 'dan1', '连': 'lian2', '调': 'diao4', '失': 'shi1',
  '包': 'bao1', '响': 'xiang3', '汽': 'qi4', '费': 'fei4', '约': 'yue1',
  '今': 'jin1', '块': 'kuai4', '落': 'luo4', '适': 'shi4', '帮': 'bang1',
  '首': 'shou3', '清': 'qing1', '接': 'jie1', '台': 'tai2', '厂': 'chang3',
  '权': 'quan2', '毛': 'mao2', '送': 'song4', '板': 'ban3', '求': 'qiu2',
  '护': 'hu4', '视': 'shi4', '注': 'zhu4', '食': 'shi2', '随': 'sui2',
  '足': 'zu2', '歌': 'ge1', '脑': 'nao3', '班': 'ban1', '假': 'jia3',
  '片': 'pian4', '装': 'zhuang1', '收': 'shou1', '突': 'tu1', '式': 'shi4',
  '妈': 'ma1', '乘': 'cheng2', '认': 'ren4', '紧': 'jin3', '司': 'si1',
  '原': 'yuan2', '级': 'ji2', '坚': 'jian1', '续': 'xu4', '父': 'fu4',
  '线': 'xian4', '提': 'ti2', '置': 'zhi4', '集': 'ji2', '建': 'jian4',
  '造': 'zao4', '备': 'bei4', '选': 'xuan3', '抓': 'zhua1', '团': 'tuan2',
  '期': 'qi1', '短': 'duan3', '味': 'wei4', '切': 'qie1', '虽': 'sui1',
  '客': 'ke4', '留': 'liu2', '床': 'chuang2', '亮': 'liang4', '举': 'ju3',
  '派': 'pai4', '刚': 'gang1', '帝': 'di4', '河': 'he2', '阳': 'yang2',
  '树': 'shu4', '草': 'cao3', '叶': 'ye4', '竹': 'zhu2', '银': 'yin2',
  '铁': 'tie3', '铜': 'tong2', '冰': 'bing1', '雷': 'lei2', '雨': 'yu3',
  '雪': 'xue3', '霜': 'shuang1', '露': 'lu4', '阴': 'yin1', '晴': 'qing2',
  '暖': 'nuan3', '穿': 'chuan1', '住': 'zhu4', '盼': 'pan4',
  '停': 'ting2', '推': 'tui1', '压': 'ya1', '洗': 'xi3', '换': 'huan2',
  '借': 'jie4', '付': 'fu4', '母': 'mu3', '兄': 'xiong1', '弟': 'di4',
  '姐': 'jie3', '妹': 'mei4', '爷': 'ye2', '奶': 'nai3', '叔': 'shu1',
  '姑': 'gu1', '舅': 'jiu4', '姨': 'yi2', '孙': 'sun1', '婆': 'po2',
  '公': 'gong1', '粉': 'fen3', '橙': 'cheng2', '棕': 'zong1', '彩': 'cai3',
  '暗': 'an4', '鲜': 'xian1', '艳': 'yan4', '朝': 'zhao1', '夕': 'xi1',
  '晨': 'chen2', '晚': 'wan3', '湖': 'hu2', '船': 'chuan2', '桥': 'qiao2',
  '楼': 'lou2', '窗': 'chuang1', '室': 'shi4', '床': 'chuang2',
  '笔': 'bi3', '纸': 'zhi3', '刀': 'dao1', '尺': 'chi3', '包': 'bao1',
  '裙': 'qun2', '鞋': 'xie2', '帽': 'mao4', '袜': 'wa4', '领': 'ling3',
};

export function run(Tool) {
  Tool.header('中文转拼音');

  const note = document.createElement('div');
  note.className = 'result-info';
  note.style.marginBottom = '10px';
  note.textContent = '将中文文本转换为带声调数字的拼音。未识别的汉字显示为 "?"。';
  Tool.container.appendChild(note);

  const sec = Tool.section('输入');
  const input = Tool.textarea('输入中文文本，例如：你好世界');
  sec.appendChild(input);

  const errEl = Tool.error();

  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  btnRow.appendChild(Tool.btn('转换', doConvert, 'primary'));
  btnRow.appendChild(Tool.btn('清空', () => {
    input.value = '';
    output.value = '';
    Tool.hideErr(errEl);
  }));
  Tool.container.appendChild(btnRow);

  const outSec = Tool.section('输出');
  const output = Tool.textarea('拼音结果', true);
  outSec.appendChild(output);

  const copyRow = Tool.btnRow();
  copyRow.appendChild(Tool.btn('复制', () => {
    if (output.value) Tool.copy(output.value);
  }));

  function doConvert() {
    const text = input.value;
    if (!text) { Tool.showErr(errEl, '请输入中文文本'); return; }
    Tool.hideErr(errEl);

    const result = [];
    for (const ch of text) {
      if (ch === '\n') {
        result.push('\n');
      } else if (ch.match(/[一-鿿]/)) {
        result.push(PINYIN_MAP[ch] || '?');
      } else {
        result.push(ch);
      }
    }
    output.value = result.join(' ');
  }
}
