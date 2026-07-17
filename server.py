#!/usr/bin/env python3
"""Local static file server with caching disabled, so the iPhone always gets fresh files."""

import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


with ReusableTCPServer(("0.0.0.0", PORT), NoCacheHandler) as httpd:
    print(f"Serving on 0.0.0.0:{PORT} (caching disabled)")
    httpd.serve_forever()
