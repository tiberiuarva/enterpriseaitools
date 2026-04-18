#!/usr/bin/env python3
import argparse
import http.server
import os
import posixpath
from functools import partial
from pathlib import Path
from urllib.parse import unquote, urlparse

class PreviewHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, base_path="/enterpriseai-tools", **kwargs):
        self.base_path = base_path.rstrip("/") or "/enterpriseai-tools"
        super().__init__(*args, directory=directory, **kwargs)

    def translate_path(self, path):
        parsed = urlparse(path)
        clean_path = parsed.path
        if clean_path == self.base_path:
            clean_path = self.base_path + "/"
        if clean_path.startswith(self.base_path + "/"):
            clean_path = clean_path[len(self.base_path):] or "/"
        elif clean_path in ("/favicon.ico", "/robots.txt", "/sitemap.xml") or clean_path.startswith("/_next/"):
            pass
        else:
            clean_path = "/404/"

        clean_path = posixpath.normpath(unquote(clean_path))
        words = [word for word in clean_path.split("/") if word and word not in (".", "..")]
        full_path = self.directory
        for word in words:
            full_path = os.path.join(full_path, word)
        if parsed.path.endswith("/"):
            full_path = os.path.join(full_path, "")
        return full_path

    def log_message(self, format, *args):
        super().log_message(format, *args)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3005)
    parser.add_argument("--directory", default="out")
    parser.add_argument("--base-path", default="/enterpriseai-tools")
    args = parser.parse_args()

    directory = str(Path(args.directory).resolve())
    handler = partial(PreviewHandler, directory=directory, base_path=args.base_path)
    with http.server.ThreadingHTTPServer((args.host, args.port), handler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    main()
