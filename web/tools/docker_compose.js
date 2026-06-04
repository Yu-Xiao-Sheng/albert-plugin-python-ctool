export const title = 'Docker Compose';
export function run(Tool) {
  Tool.header('Docker Compose 助手');

  const errEl = Tool.error();

  const tab1Panel = document.createElement('div');
  const tab2Panel = document.createElement('div');
  Tool.tabs([
    ['Compose -> docker run', tab1Panel],
    ['docker run -> Compose', tab2Panel],
  ]);

  // Tab 1: Compose YAML -> docker run
  Tool.html(tab1Panel, '<div class="section-label" style="margin-top:10px">Docker Compose YAML</div>');
  const yamlArea = Tool.textarea('粘贴 docker-compose.yml 内容');
  tab1Panel.appendChild(yamlArea);
  const t1Btns = document.createElement('div');
  t1Btns.className = 'btn-row';
  t1Btns.appendChild(Tool.btn('转换', yamlToRun, 'primary'));
  t1Btns.appendChild(Tool.btn('复制结果', () => Tool.copy(t1Output.value)));
  tab1Panel.appendChild(t1Btns);
  Tool.html(tab1Panel, '<div class="section-label">docker run 命令</div>');
  const t1Output = Tool.textarea('转换后的 docker run 命令', true);
  t1Output.style.minHeight = '120px';
  tab1Panel.appendChild(t1Output);

  // Tab 2: docker run -> Compose YAML
  Tool.html(tab2Panel, '<div class="section-label" style="margin-top:10px">docker run 命令</div>');
  const runArea = Tool.textarea('粘贴 docker run 命令，例如:\ndocker run -d --name myapp -p 8080:80 -v /data:/app/data -e KEY=VALUE nginx:latest');
  tab2Panel.appendChild(runArea);
  const t2Btns = document.createElement('div');
  t2Btns.className = 'btn-row';
  t2Btns.appendChild(Tool.btn('转换', runToYaml, 'primary'));
  t2Btns.appendChild(Tool.btn('复制结果', () => Tool.copy(t2Output.value)));
  tab2Panel.appendChild(t2Btns);
  Tool.html(tab2Panel, '<div class="section-label">docker-compose.yml</div>');
  const t2Output = Tool.textarea('转换后的 docker-compose.yml', true);
  t2Output.style.minHeight = '200px';
  tab2Panel.appendChild(t2Output);

  function yamlToRun() {
    Tool.hideErr(errEl);
    const yaml = yamlArea.value.trim();
    if (!yaml) { Tool.showErr(errEl, '请输入 YAML'); return; }
    try {
      const services = parseSimpleYaml(yaml);
      const commands = [];
      for (const [name, svc] of Object.entries(services)) {
        let cmd = 'docker run -d';
        cmd += ` --name ${name}`;
        if (svc.restart) cmd += ` --restart ${svc.restart}`;
        if (svc.ports) {
          (Array.isArray(svc.ports) ? svc.ports : [svc.ports]).forEach(p => { cmd += ` -p ${p}`; });
        }
        if (svc.volumes) {
          (Array.isArray(svc.volumes) ? svc.volumes : [svc.volumes]).forEach(v => { cmd += ` -v ${v}`; });
        }
        if (svc.environment) {
          const envs = Array.isArray(svc.environment) ? svc.environment : Object.entries(svc.environment).map(([k, v]) => `${k}=${v}`);
          envs.forEach(e => { cmd += ` -e ${typeof e === 'string' ? e : e}`; });
        }
        if (svc.networks) {
          (Array.isArray(svc.networks) ? svc.networks : [svc.networks]).forEach(n => { cmd += ` --network ${n}`; });
        }
        if (svc.container_name) cmd += ` --name ${svc.container_name}`;
        if (svc.image) cmd += ` ${svc.image}`;
        else if (svc.build) cmd += ` (build from ${svc.build})`;
        commands.push(cmd);
      }
      t1Output.value = commands.join('\n\n');
    } catch (e) {
      Tool.showErr(errEl, 'YAML 解析错误: ' + e.message);
    }
  }

  function parseSimpleYaml(text) {
    const result = {};
    let currentService = null;
    let currentKey = null;
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.match(/^services:/i)) continue;
      const svcMatch = line.match(/^  (\w+):/);
      if (svcMatch) {
        currentService = svcMatch[1];
        result[currentService] = {};
        currentKey = null;
        continue;
      }
      if (!currentService) continue;
      const kvMatch = line.match(/^    (\w+):\s*(.*)/);
      if (kvMatch) {
        const key = kvMatch[1];
        const val = kvMatch[2].trim().replace(/^["']|["']$/g, '');
        currentKey = key;
        if (val) {
          if (val.startsWith('- ') || val.includes('\n')) {
            result[currentService][key] = [val.replace(/^- /, '')];
          } else {
            result[currentService][key] = val;
          }
        } else {
          result[currentService][key] = [];
        }
        continue;
      }
      const listItem = line.match(/^      - (.+)/);
      if (listItem && currentKey && Array.isArray(result[currentService][currentKey])) {
        result[currentService][currentKey].push(listItem[1].replace(/^["']|["']$/g, ''));
      }
    }
    return result;
  }

  function runToYaml() {
    Tool.hideErr(errEl);
    const cmd = runArea.value.trim();
    if (!cmd) { Tool.showErr(errEl, '请输入 docker run 命令'); return; }
    try {
      const tokens = cmd.split(/\s+/).filter(Boolean);
      let name = 'myservice';
      let image = '';
      const ports = [];
      const volumes = [];
      const envs = [];
      let network = '';
      let restart = '';
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '--name' && tokens[i + 1]) { name = tokens[++i]; }
        else if (tokens[i] === '-p' && tokens[i + 1]) { ports.push(tokens[++i]); }
        else if (tokens[i].startsWith('--publish=')) { ports.push(tokens[i].split('=')[1]); }
        else if (tokens[i] === '-v' && tokens[i + 1]) { volumes.push(tokens[++i]); }
        else if (tokens[i].startsWith('--volume=')) { volumes.push(tokens[i].split('=')[1]); }
        else if (tokens[i] === '-e' && tokens[i + 1]) { envs.push(tokens[++i]); }
        else if (tokens[i].startsWith('--env=')) { envs.push(tokens[i].split('=')[1]); }
        else if (tokens[i] === '--network' && tokens[i + 1]) { network = tokens[++i]; }
        else if (tokens[i] === '--restart' && tokens[i + 1]) { restart = tokens[++i]; }
      }
      image = tokens[tokens.length - 1];
      if (image === 'run' || image.startsWith('-')) image = 'image:latest';

      let yaml = 'version: "3"\nservices:\n';
      yaml += `  ${name}:\n`;
      yaml += `    image: ${image}\n`;
      if (restart) yaml += `    restart: ${restart}\n`;
      if (ports.length) yaml += `    ports:\n${ports.map(p => `      - "${p}"`).join('\n')}\n`;
      if (volumes.length) yaml += `    volumes:\n${volumes.map(v => `      - ${v}`).join('\n')}\n`;
      if (envs.length) yaml += `    environment:\n${envs.map(e => `      - ${e}`).join('\n')}\n`;
      if (network) yaml += `    networks:\n      - ${network}\n`;
      t2Output.value = yaml.trim();
    } catch (e) {
      Tool.showErr(errEl, '解析错误: ' + e.message);
    }
  }
}
