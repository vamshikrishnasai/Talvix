"""
URL scraping utility using only Python standard library.
No external dependencies required (no bs4/requests).
"""
import urllib.request
import urllib.error
import html.parser
import re


class _TextExtractor(html.parser.HTMLParser):
    """Minimal HTML parser that extracts visible text."""
    _SKIP_TAGS = {"script", "style", "head", "meta", "link", "noscript"}

    def __init__(self):
        super().__init__()
        self._texts: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in self._SKIP_TAGS:
            self._skip += 1

    def handle_endtag(self, tag):
        if tag in self._SKIP_TAGS and self._skip > 0:
            self._skip -= 1

    def handle_data(self, data):
        if self._skip == 0:
            text = data.strip()
            if text:
                self._texts.append(text)

    def get_text(self) -> str:
        return " ".join(self._texts)


def scrape_url_text(url: str) -> str:
    """
    Fetch a URL and return its visible text content.
    Uses only Python stdlib — no bs4 or requests required.
    """
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            },
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read()
            charset = resp.headers.get_content_charset() or "utf-8"
            html_content = raw.decode(charset, errors="replace")

        parser = _TextExtractor()
        parser.feed(html_content)
        text = parser.get_text()

        # Collapse whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text

    except Exception as e:
        print(f"[ScrapeURL] Failed for {url}: {e}")
        return ""
