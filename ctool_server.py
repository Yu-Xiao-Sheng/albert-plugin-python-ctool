#!/usr/bin/env python3
"""Simple HTTP server for serving Ctool static files locally."""
import http.server
import socketserver
import os
import sys
import socket
import threading

PORT = 17321
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ctool_app")


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Suppress logs


def start_server():
    if is_port_in_use(PORT):
        return
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    print(f"Serving Ctool at http://localhost:{PORT}")
    start_server()
