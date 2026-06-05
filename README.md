# Albert Ctool Plugin

在 [Albert Launcher](https://albertlauncher.github.io/) 中快速使用 51 款开发者工具。

每个工具独立运行在 GTK WebKit2 弹窗中，无需浏览器，完全离线。

## 工具列表

| 分类 | 工具 |
|------|------|
| **编码转换** | JSON 格式化、Base64、URL 编解码、Unicode、HTML 编解码、Hex/String、Hex/Base64、ASCII、进制转换、序列化转换、Gzip、Punycode |
| **加密解密** | 哈希(MD5/SHA)、HMAC、AES、DES、SM2、SM4、RSA、Bcrypt、签名验证 |
| **开发工具** | 代码格式化、正则表达式、Crontab、SQL 参数填充、变量名转换、HTTP Snippet、WebSocket、Docker Compose |
| **文本处理** | 文本处理、文本对比、汉字转拼音、随机字符、UUID |
| **网络工具** | IP 查询、IP 子网计算、URL 解析 |
| **时间日期** | 时间戳转换、时区转换、时间计算器 |
| **生成工具** | 二维码生成、二维码解析、条形码 |
| **其他工具** | JWT 解码、单位换算、原码反码补码、ARM/HEX、颜色转换、数据校验、中文数字、ASN.1 解析 |

## 安装

### 前提条件

- [Albert Launcher](https://albertlauncher.github.io/) v34+
- Python 3 系统（用于 GTK WebKit2 弹窗）
- WebKit2 运行库（大部分桌面发行版已预装）

如未安装 Albert：

```bash
# Ubuntu 24.04 / Linux Mint 22
curl -fsSL https://download.opensuse.org/repositories/home:manuelschneid3r/xUbuntu_24.04/Release.key | \
  gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/home_manuelschneid3r.gpg >/dev/null
echo "deb http://download.opensuse.org/repositories/home:/manuelschneid3r/xUbuntu_24.04/ /" | \
  sudo tee /etc/apt/sources.list.d/home:manuelschneid3r.list
sudo apt update && sudo apt install albert
```

> Ubuntu 22.04 请将 `xUbuntu_24.04` 替换为 `xUbuntu_22.04`。

### 一键安装

```bash
git clone https://github.com/Yu-Xiao-Sheng/albert-plugin-python-ctool.git
cd albert-plugin-python-ctool
./install.sh
```

### 手动安装

```bash
git clone https://github.com/Yu-Xiao-Sheng/albert-plugin-python-ctool.git ~/albert-plugin-python-ctool
mkdir -p ~/.local/share/albert/python/plugins/
ln -s ~/albert-plugin-python-ctool ~/.local/share/albert/python/plugins/ctool
```

安装后打开 Albert Settings → Plugins → 勾选 **Ctool**。

## 使用

在 Albert 中输入 `ct` 触发：

```
ct            → 显示全部 51 个工具
ct json       → JSON 格式化
ct hash       → 哈希计算
ct encrypt    → 加密解密
ct base64     → Base64 编解码
ct 时间       → 时间相关（支持中文搜索）
ct 二维码     → 二维码工具
```

选中工具回车，弹窗直接打开独立工具页面。

### 搜索关键词

中英文均可搜索：

- `json` → JSON 格式化
- `md5` / `sha256` → 哈希计算
- `加密` / `decrypt` → 加密解密工具
- `正则` / `regex` → 正则表达式
- `二维码` / `qrcode` → 二维码工具
- `timestamp` / `时间戳` → 时间戳转换

## 架构

```
albert-plugin-python-ctool/
├── __init__.py          # Albert 插件入口 + HTTP 服务器
├── ctool_popup.py       # GTK WebKit2 弹窗启动器
├── ctool_icon.png       # 插件图标
├── install.sh           # 一键安装脚本
├── web/
│   ├── tool.html        # 工具页面容器
│   ├── common.js        # 共享 UI 框架
│   ├── common.css       # 极简样式
│   ├── icons/           # 分类图标 (8 个)
│   └── tools/           # 51 个独立工具 JS
│       ├── json.js
│       ├── base64.js
│       └── ...
```

每个工具是独立的纯 JS 文件，导出 `title` 和 `run(Tool)`，通过 `common.js` 提供的 UI API 构建界面。

## 卸载

```bash
rm ~/.local/share/albert/python/plugins/ctool
rm -rf ~/albert-plugin-python-ctool
```

## 致谢

- [Ctool](https://github.com/baiy/Ctool) - 工具灵感来源，by [@baiy](https://github.com/baiy)

## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — 免费 for personal and open-source use, commercial use prohibited.
