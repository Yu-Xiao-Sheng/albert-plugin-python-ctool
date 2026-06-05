# -*- coding: utf-8 -*-
"""
Developer tools powered by Ctool (local standalone pages).

Synopsis: ct [keyword]
"""

import subprocess
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
import threading

from albert import *

md_iid = "5.0"
md_version = "3.0.0"
md_name = "Ctool"
md_description = "Developer tools powered by Ctool (local standalone)"
md_license = "CC-BY-NC-SA-4.0"
md_url = "https://github.com/Yu-Xiao-Sheng/albert-plugin-python-ctool"
md_authors = ["@Yu-Xiao-Sheng"]

CTOOL_PORT = 17321
PLUGIN_DIR = Path(__file__).parent
WEB_DIR = str(PLUGIN_DIR / "web")
CTOOL_BASE_URL = f"http://localhost:{CTOOL_PORT}"
POPUP_SCRIPT = str(PLUGIN_DIR / "ctool_popup.py")
POPUP_PYTHON = "/usr/bin/python3"
ICON_DIR = str(PLUGIN_DIR / "web" / "icons")

_server_started = False


class _Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def log_message(self, format, *args):
        pass


class _Server(ThreadingMixIn, HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def _ensure_server():
    global _server_started
    if _server_started:
        return
    try:
        server = _Server(("127.0.0.1", CTOOL_PORT), _Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        _server_started = True
    except OSError:
        _server_started = True  # already running


# Category icons
def _icon(name):
    return Icon.image(Path(ICON_DIR) / f"{name}.png")


# (name, category, keywords, tool_id, description)
# tool_id maps to web/tools/{tool_id}.js
TOOLS = [
    # ── 编码转换 ──
    ("JSON 格式化", "编码转换", "json format 格式化 压缩 转义 校验", "json",
     "格式化/压缩/校验/转义"),
    ("Base64 编码", "编码转换", "base64 encode 编码", "base64",
     "Base64 编码/解码"),
    ("URL 编解码", "编码转换", "url encode decode 编码 解码", "url",
     "URL 编码/解码"),
    ("Unicode 转换", "编码转换", "unicode emoji \\u 转换", "unicode",
     "Unicode/中文 双向转换"),
    ("HTML 编解码", "编码转换", "html encode 实体 编码 解码", "html_encode",
     "HTML 实体编码/解码"),
    ("Hex/String", "编码转换", "hex string 十六进制 字符串", "hex_string",
     "十六进制与字符串互转"),
    ("Hex/Base64", "编码转换", "hex base64 转换", "hex_base64",
     "十六进制与Base64互转"),
    ("ASCII 编码", "编码转换", "ascii 十进制 十六进制 八进制 二进制", "ascii",
     "ASCII 编码转换"),
    ("进制转换", "编码转换", "radix base 进制 2 8 10 16 36", "radix",
     "2-36 进制转换"),
    ("序列化转换", "编码转换", "serialize json xml yaml 转换", "serialize",
     "JSON/XML 互转"),
    ("Gzip 压缩", "编码转换", "gzip 压缩 解压", "gzip",
     "Gzip 压缩/解压"),
    ("Punycode", "编码转换", "punycode 域名 idn", "punycode",
     "Punycode 编码/解码"),

    # ── 加密解密 ──
    ("哈希计算", "加密解密", "hash md5 sha1 sha256 sha512 摘要", "hash",
     "MD5/SHA-1/SHA-256/SHA-512"),
    ("HMAC", "加密解密", "hmac mac 签名", "hmac",
     "HMAC 签名生成"),
    ("AES 加解密", "加密解密", "aes encrypt decrypt 加密 解密", "aes",
     "AES-CBC/GCM 加解密"),
    ("DES 加解密", "加密解密", "des encrypt decrypt 加密 解密", "des",
     "DES/TripleDES 加解密"),
    ("SM2 加解密", "加密解密", "sm2 国密 加密 解密", "sm2",
     "国密 SM2 加解密"),
    ("SM4 加解密", "加密解密", "sm4 国密 加密 解密", "sm4",
     "国密 SM4 加解密"),
    ("RSA 加解密", "加密解密", "rsa encrypt decrypt 加密 解密", "rsa",
     "RSA-OAEP 加解密"),
    ("Bcrypt", "加密解密", "bcrypt hash 密码 加密 验证", "bcrypt",
     "Bcrypt 哈希/验证"),
    ("签名验证", "加密解密", "sign signature 数字签名 验证 rsa-pss ecdsa", "sign",
     "RSA-PSS/ECDSA 签名"),

    # ── 开发工具 ──
    ("代码格式化", "开发工具", "code format js ts html css sql xml yaml 格式化", "code_format",
     "JSON/HTML/XML/CSS/SQL 格式化"),
    ("正则表达式", "开发工具", "regex regular expression 正则 匹配 替换", "regex",
     "正则匹配/查找/替换"),
    ("Crontab", "开发工具", "crontab cron 定时 任务", "crontab",
     "Crontab 规则校验"),
    ("SQL 参数填充", "开发工具", "sql mybatis 参数 填充", "sql_fill",
     "Mybatis SQL 参数填充"),
    ("变量名转换", "开发工具", "variable camel snake pascal 变量名 命名", "variable",
     "驼峰/下划线/短横线"),
    ("HTTP Snippet", "开发工具", "http curl fetch axios 代码片段", "http_snippet",
     "HTTP 请求代码生成"),
    ("WebSocket", "开发工具", "websocket ws 调试 在线", "websocket",
     "WebSocket 在线调试"),
    ("Docker Compose", "开发工具", "docker compose yaml 容器", "docker_compose",
     "Docker Compose 工具"),

    # ── 文本处理 ──
    ("文本处理", "文本处理", "text 大小写 去重 排序 去空行 统计", "text",
     "大小写/去重/排序/统计"),
    ("文本对比", "文本处理", "diff compare 对比 差异", "diff",
     "文本差异化对比"),
    ("汉字转拼音", "文本处理", "pinyin 拼音 汉字 声调", "pinyin",
     "汉字转拼音"),
    ("随机字符", "文本处理", "random 随机 字符 密码 生成", "random",
     "随机字符串生成"),
    ("UUID 生成", "文本处理", "uuid guid 生成", "uuid",
     "UUID 批量生成"),

    # ── 网络工具 ──
    ("IP 查询", "网络工具", "ip address 地址 查询 运营商", "ip",
     "IP 地址/运营商查询"),
    ("IP 子网计算", "网络工具", "ip subnet mask 子网 掩码 网段", "ipcalc",
     "IP 子网掩码计算"),
    ("URL 解析", "网络工具", "url parse 解析 参数 query", "url_parse",
     "URL 解析/参数提取"),

    # ── 时间日期 ──
    ("时间戳转换", "时间日期", "timestamp 时间戳 转换 毫秒", "timestamp",
     "时间戳双向转换"),
    ("时区转换", "时间日期", "timezone 时区", "timezone",
     "时区转换"),
    ("时间计算器", "时间日期", "time calc 时间 计算 日期差", "time_calc",
     "时间日期计算"),

    # ── 生成工具 ──
    ("二维码生成", "生成工具", "qrcode qr 二维码 生成", "qr_generate",
     "二维码生成"),
    ("二维码解析", "生成工具", "qrcode qr 二维码 解析 识别", "qr_parse",
     "二维码解析"),
    ("条形码", "生成工具", "barcode 条形码 生成", "barcode",
     "条形码生成"),

    # ── 其他工具 ──
    ("JWT 解码", "其他工具", "jwt token decode 解码", "jwt",
     "JWT Token 解码"),
    ("单位换算", "其他工具", "unit convert 单位 换算 长度 质量 温度", "unit",
     "长度/面积/体积/质量/温度"),
    ("原码反码补码", "其他工具", "binary 原码 反码 补码", "binary",
     "原码/反码/补码"),
    ("ARM/HEX", "其他工具", "arm hex 汇编 互转", "arm_hex",
     "ARM 汇编与 HEX 互转"),
    ("颜色转换", "其他工具", "color 颜色 hex rgb hsl 取色", "color",
     "Hex/RGB/HSL 颜色转换"),
    ("数据校验", "其他工具", "bcc crc lrc checksum 校验", "checksum",
     "BCC/LRC/CRC32 校验"),
    ("中文数字", "其他工具", "中文 数字 金额 转换 大写", "zh_number",
     "中文数字/金额大写"),
    ("ASN.1 解析", "其他工具", "asn1 pem certificate 证书 解析", "asn1",
     "ASN.1/PEM 证书解析"),
]

CAT_ICONS = {
    "编码转换": "encode",
    "加密解密": "crypto",
    "开发工具": "dev",
    "文本处理": "text",
    "网络工具": "network",
    "时间日期": "time",
    "生成工具": "gen",
    "其他工具": "other",
}


class Plugin(PluginInstance, GeneratorQueryHandler):

    def __init__(self):
        PluginInstance.__init__(self)
        GeneratorQueryHandler.__init__(self)
        _ensure_server()

    @staticmethod
    def makeIcon():
        return Icon.image(PLUGIN_DIR / "ctool_icon.png")

    def defaultTrigger(self):
        return 'ct '

    def synopsis(self, s):
        return "[tool_name]"

    def configWidget(self):
        return [
            {
                'type': 'label',
                'text': __doc__.strip(),
                'widget_properties': {'textFormat': 'Qt::MarkdownText'}
            }
        ]

    def items(self, ctx):
        query = ctx.query.strip().lower()

        matched = []
        for name, cat, kw, tid, desc in TOOLS:
            if not query:
                matched.append((name, cat, kw, tid, desc))
            else:
                searchable = f"{name} {cat} {kw}".lower()
                if query in searchable:
                    matched.append((name, cat, kw, tid, desc))

        if not matched:
            return []

        items = []
        for name, cat, kw, tid, desc in matched:
            url = f"{CTOOL_BASE_URL}/tool.html?t={tid}"
            icon_name = CAT_ICONS.get(cat, "other")
            icon_factory = lambda n=icon_name: _icon(n)
            items.append(StandardItem(
                id=f"ctool-{tid}",
                text=name,
                subtext=f"[{cat}] {desc}",
                icon_factory=icon_factory,
                actions=[
                    Action("open", "Open",
                           lambda u=url, n=name, ic=icon_name: self._open(u, n, ic)),
                ]
            ))

        yield items

    def _open(self, url, title, icon_name):
        icon_path = str(Path(ICON_DIR) / f"{icon_name}.png")
        subprocess.Popen(
            [POPUP_PYTHON, POPUP_SCRIPT, url, f"Ctool - {title}", icon_path],
            start_new_session=True
        )
