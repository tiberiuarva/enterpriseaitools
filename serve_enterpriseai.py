from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, unquote
import gzip
import io
import os

REPO_ROOT = Path('/home/n8nadmin/.openclaw/workspace-enterpriseai-tools/repo')
FALLBACK_ROOT = REPO_ROOT / 'out'
ROOT_LINK = REPO_ROOT / '.preview' / 'current'
PREFIX = '/enterpriseai-tools'


def resolve_root() -> Path:
    if ROOT_LINK.exists():
        return ROOT_LINK.resolve()
    return FALLBACK_ROOT

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(resolve_root()), **kwargs)

    compressed_types = {
        'text/html',
        'text/plain',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'application/xml',
        'image/svg+xml',
    }

    def translate_path(self, path: str) -> str:
        parsed = urlparse(path)
        clean_path = unquote(parsed.path)

        if clean_path.startswith(PREFIX):
            clean_path = clean_path[len(PREFIX):] or '/'

        if clean_path in ('', '/'):
            clean_path = '/index.html'

        root = resolve_root()
        candidate = root / clean_path.lstrip('/')

        if candidate.is_dir():
            index_file = candidate / 'index.html'
            if index_file.exists():
                candidate = index_file
        elif not candidate.exists():
            if not candidate.suffix:
                html_candidate = root / clean_path.lstrip('/') / 'index.html'
                if html_candidate.exists():
                    candidate = html_candidate
                else:
                    flat_html = root / f"{clean_path.lstrip('/')}.html"
                    if flat_html.exists():
                        candidate = flat_html

        return str(candidate)

    def send_head(self):
        path = Path(self.translate_path(self.path))

        if not path.exists() or path.is_dir():
            return super().send_head()

        ctype = self.guess_type(str(path))
        accepts_gzip = 'gzip' in self.headers.get('Accept-Encoding', '').lower()
        should_gzip = accepts_gzip and ctype in self.compressed_types

        if should_gzip:
            raw = path.read_bytes()
            compressed = gzip.compress(raw, compresslevel=6)
            self.send_response(200)
            self.send_header('Content-type', ctype)
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(len(compressed)))
            self.send_header('Last-Modified', self.date_time_string(path.stat().st_mtime))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Vary', 'Accept-Encoding')
            self.end_headers()
            return io.BytesIO(compressed)

        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Vary', 'Accept-Encoding')
        super().end_headers()

    def log_message(self, format, *args):
        print('%s - - [%s] %s' % (self.address_string(), self.log_date_time_string(), format % args))

server = ThreadingHTTPServer(('0.0.0.0', 3005), Handler)
print('Serving enterpriseai.tools preview on 0.0.0.0:3005 with prefix', PREFIX, 'from', resolve_root())
server.serve_forever()
