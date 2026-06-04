# Albert Ctool Plugin

在 [Albert Launcher](https://albertlauncher.github.io/) 中快速访问 [Ctool](https://ctool.dev) 开发者工具集。

Ctool 是一款程序开发常用工具，支持 JSON 格式化、哈希、加解密、Base64、正则表达式、二维码等 50+ 种工具。

## 功能

插件收录了 Ctool 的全部工具，按分类组织：

| 分类 | 工具 |
|------|------|
| **编码转换** | JSON、Base64、URL、Unicode、HTML、Hex/String、Hex/Base64、ASCII、进制转换、序列化、Gzip、Punycode |
| **加密解密** | 哈希(MD5/SHA)、HMAC、AES、DES、SM2、SM4、RSA、Bcrypt、签名验证 |
| **开发工具** | 代码格式化、正则表达式、Crontab、SQL参数填充、WebSocket调试、变量名转换、HTTP Snippet、代码运行 |
| **文本处理** | 文本处理、文本对比、汉字转拼音、随机字符、UUID |
| **网络工具** | IP查询、IP网络计算器、URL解析 |
| **时间日期** | 时间戳转换、时区转换、时间计算器 |
| **生成工具** | 二维码生成/解析、条形码 |
| **其他工具** | JWT解码、单位换算、原码反码补码、ARM/HEX、颜色转换、数据校验、ASN.1 |

## 安装

### 前提条件

已安装 [Albert Launcher](https://albertlauncher.github.io/) (v34+)。

如未安装：

```bash
# Ubuntu / Linux Mint
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

安装后，打开 Albert Settings → Plugins → 勾选 **Ctool**。

## 使用

在 Albert 中输入 `ct` 触发插件：

```
ct            → 显示全部工具
ct json       → 筛选 JSON 相关工具
ct hash       → 筛选哈希相关工具
ct encrypt    → 筛选加密相关工具
ct base64     → 筛选 Base64 相关工具
ct 时间       → 筛选时间相关工具（支持中文搜索）
```

选中工具后回车，自动在浏览器中打开对应的 Ctool 页面。

### 搜索关键词

支持中英文搜索。每个工具关联了多组关键词，例如：

- `json` → JSON工具
- `md5` / `sha256` → 哈希工具
- `格式化` / `format` → 代码格式化
- `加密` / `decrypt` → 加密解密工具
- `二维码` / `qrcode` → 二维码工具
- `正则` / `regex` → 正则表达式

## 卸载

```bash
rm ~/.local/share/albert/python/plugins/ctool
rm -rf ~/albert-plugin-python-ctool
```

## 致谢

- [Ctool](https://github.com/baiy/Ctool) - 程序开发常用工具，by [@baiy](https://github.com/baiy)

## License

MIT
