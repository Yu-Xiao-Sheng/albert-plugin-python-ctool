# -*- coding: utf-8 -*-
"""
Developer tools powered by Ctool (local instance with popup window).

Synopsis: ct [keyword]
"""

import os
import subprocess
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingMixIn

from albert import *

md_iid = "5.0"
md_version = "2.0.0"
md_name = "Ctool"
md_description = "Developer tools powered by Ctool (local popup)"
md_license = "MIT"
md_url = "https://github.com/Yu-Xiao-Sheng/albert-plugin-python-ctool"
md_authors = ["@Yu-Xiao-Sheng"]

CTOOL_PORT = 17321
PLUGIN_DIR = Path(__file__).parent
CTOOL_APP_DIR = str(PLUGIN_DIR / "ctool_app")
CTOOL_BASE_URL = f"http://localhost:{CTOOL_PORT}"
POPUP_SCRIPT = str(PLUGIN_DIR / "ctool_popup.py")
POPUP_PYTHON = "/usr/bin/python3"

_server_started = False


class _CtoolHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CTOOL_APP_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        pass


class _CtoolServer(ThreadingMixIn, HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def _ensure_server():
    global _server_started
    if _server_started:
        return
    try:
        server = _CtoolServer(("127.0.0.1", CTOOL_PORT), _CtoolHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        _server_started = True
    except OSError:
        pass  # Port already in use, server already running


# (name, category, keywords, url_path, description)
TOOLS = [
    # 编码转换
    ("JSON工具", "编码转换", "json format 格式化 压缩 转义 校验", "json",
     "格式化/校验/压缩/转义/Unicode转中文"),
    ("Base64 编码", "编码转换", "base64 encode decode 编码 解码", "base64/encoder",
     "Base64 编码/解码"),
    ("Base64 解码", "编码转换", "base64 decode 解码", "base64/decoder",
     "Base64 解码"),
    ("URL 编码", "编码转换", "url encode 编码", "url/encoder",
     "URL 编码/解码"),
    ("URL 解码", "编码转换", "url decode 解码", "url/decoder",
     "URL 解码"),
    ("Unicode 转换", "编码转换", "unicode emoji 转换 html css 实体", "unicode/encoder",
     "Unicode/Emoji/HTML实体 双向转换"),
    ("HTML 编码", "编码转换", "html encode 编码 解码", "html",
     "HTML 编码/解码"),
    ("Hex/String", "编码转换", "hex string 十六进制 字符串 转换", "hexString/stringToHex",
     "十六进制与字符串互转"),
    ("Hex/Base64", "编码转换", "hex base64 十六进制 转换", "hexBase64",
     "十六进制与Base64互转"),
    ("ASCII 编码", "编码转换", "ascii 十进制 十六进制 八进制 二进制", "ascii",
     "ASCII 编码转换"),
    ("进制转换", "编码转换", "radix base 进制 2 8 10 16 64 转换", "radix",
     "2-64进制转换"),
    ("序列化转换", "编码转换", "serialize json xml yaml php properties 转换", "serialize",
     "JSON/XML/YAML/PHP 互转"),
    ("Gzip", "编码转换", "gzip 压缩 解压", "gzip/encoder",
     "Gzip 压缩/解压"),
    ("Punycode", "编码转换", "punycode 域名 中文", "punycode/encoder",
     "Punycode 编码/解码"),

    # 加密解密
    ("哈希", "加密解密", "hash md5 sha1 sha256 sha512 sm3 摘要", "hash",
     "MD5/SHA1/SHA256/SHA512/SM3"),
    ("HMAC", "加密解密", "hmac hash mac", "hmac",
     "HMAC 签名"),
    ("AES 加密", "加密解密", "aes encrypt 加密", "encrypt/aes/encrypt",
     "AES 加密"),
    ("AES 解密", "加密解密", "aes decrypt 解密", "encrypt/aes/decrypt",
     "AES 解密"),
    ("DES 加密", "加密解密", "des encrypt 加密", "encrypt/des/encrypt",
     "DES 加密"),
    ("DES 解密", "加密解密", "des decrypt 解密", "encrypt/des/decrypt",
     "DES 解密"),
    ("SM2 加密", "加密解密", "sm2 encrypt 加密", "encrypt/sm2/encrypt",
     "国密 SM2 加密"),
    ("SM4 加密", "加密解密", "sm4 encrypt 加密", "encrypt/sm4/encrypt",
     "国密 SM4 加密"),
    ("RSA 加密", "加密解密", "rsa encrypt 加密", "encrypt/rsa/encrypt",
     "RSA 加密"),
    ("Bcrypt", "加密解密", "bcrypt 加密 验证", "bcrypt",
     "Bcrypt 加密/验证"),
    ("签名验证", "加密解密", "sign signature 签名 验证", "sign",
     "数字签名验证"),

    # 开发工具
    ("代码格式化", "开发工具", "code format js ts html css vue sql xml yaml 格式化", "code/code",
     "JS/TS/HTML/CSS/SQL/XML/YAML 格式化"),
    ("正则表达式", "开发工具", "regex regular expression 正则 匹配 查找 替换", "regex",
     "正则匹配/查找/替换"),
    ("Crontab", "开发工具", "crontab cron 定时 任务 规则", "crontab",
     "Crontab 规则校验"),
    ("SQL 参数填充", "开发工具", "sql parameter mybatis 参数 填充", "sqlFillParameter",
     "Mybatis SQL 参数填充"),
    ("WebSocket 调试", "开发工具", "websocket ws 调试 在线", "websocket",
     "WebSocket 在线调试"),
    ("变量名转换", "开发工具", "variable camel snake pascal 变量名 命名", "variableConversion",
     "驼峰/下划线/短横线 命名转换"),
    ("HTTP Snippet", "开发工具", "http snippet curl axios fetch 代码", "httpSnippet",
     "HTTP 请求代码片段"),
    ("Docker Compose", "开发工具", "docker compose 容器 编排", "dockerCompose",
     "Docker Compose 工具"),
    ("代码运行", "开发工具", "code run 运行 js python", "code/run",
     "在线代码运行"),

    # 文本处理
    ("文本处理", "文本处理", "text 大小写 替换 去重 排序 统计 标点 简繁", "text",
     "大小写/替换/去重/排序/统计/简繁"),
    ("文本对比", "文本处理", "diff compare 对比 差异", "diffs",
     "文本差异化对比"),
    ("汉字转拼音", "文本处理", "pinyin 拼音 汉字 声调", "pinyin",
     "汉字转拼音"),
    ("随机字符", "文本处理", "random string 随机 字符 密码 生成", "randomString",
     "随机字符串生成器"),
    ("UUID 生成", "文本处理", "uuid guid 生成 唯一", "uuid",
     "UUID 在线生成"),

    # 网络工具
    ("IP 地址查询", "网络工具", "ip address 地址 查询 运营商", "ip",
     "IP 地址/运营商查询"),
    ("IP 网络计算器", "网络工具", "ip subnet mask 子网 掩码 网段", "ipcalc/ipv4",
     "IP 子网掩码计算"),
    ("URL 解析", "网络工具", "url parse 解析 参数", "urlParse",
     "URL 解析/参数提取"),

    # 时间日期
    ("时间戳转换", "时间日期", "time timestamp 时间戳 转换 毫秒", "time/timestamp",
     "时间戳双向转换"),
    ("时区转换", "时间日期", "timezone 时区", "time/timezone",
     "时区转换"),
    ("时间计算器", "时间日期", "time calculator 时间 计算 日期差", "time/calculator",
     "时间日期计算"),

    # 生成工具
    ("二维码生成", "生成工具", "qrcode qr 二维码 生成", "qrCode/generate",
     "二维码生成"),
    ("二维码解析", "生成工具", "qrcode qr 二维码 解析 识别", "qrCode/parse",
     "二维码解析"),
    ("条形码", "生成工具", "barcode 条形码 生成", "barcode",
     "条形码生成"),

    # 其他工具
    ("JWT 解码", "其他工具", "jwt token decode 解码 header payload", "jwt",
     "JWT Token 解码"),
    ("单位换算", "其他工具", "unit convert 单位 换算 长度 面积 体积 质量 温度", "unit",
     "长度/面积/体积/质量/温度等换算"),
    ("原码反码补码", "其他工具", "binary 原码 反码 补码", "binary",
     "原码/反码/补码生成"),
    ("ARM/HEX", "其他工具", "arm hex 互转 汇编", "arm/armToHex",
     "ARM 汇编与 HEX 互转"),
    ("颜色转换", "其他工具", "color 颜色 hex rgb hsl 转换 取色", "color",
     "颜色格式转换"),
    ("数据校验", "其他工具", "bcc crc lrc 校验 验证", "dataValidation/bcc",
     "BCC/CRC/LRC 校验"),
    ("中文数字", "其他工具", "中文 数字 金额 转换", "zhNumber",
     "中文数字/金额转换"),
    ("ASN.1", "其他工具", "asn1 证书 解析", "asn1",
     "ASN.1 证书解析"),
]


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
        for name, cat, kw, path, desc in TOOLS:
            if not query:
                matched.append((name, cat, kw, path, desc))
            else:
                searchable = f"{name} {cat} {kw}".lower()
                if query in searchable:
                    matched.append((name, cat, kw, path, desc))

        if not matched:
            return []

        items = []
        for name, cat, kw, path, desc in matched:
            url = f"{CTOOL_BASE_URL}#/tool/{path}"
            items.append(StandardItem(
                id=f"ctool-{path}",
                text=name,
                subtext=f"[{cat}] {desc}",
                icon_factory=Plugin.makeIcon,
                actions=[
                    Action("open", "Open in popup",
                           lambda u=url, n=name: self._open_popup(u, n)),
                ]
            ))

        yield items

    def _open_popup(self, url, title):
        subprocess.Popen(
            [POPUP_PYTHON, POPUP_SCRIPT, url, f"Ctool - {title}"],
            start_new_session=True
        )
