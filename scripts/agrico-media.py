"""Public institution-media discovery and unchanged downloads for the Agrico pack."""
import argparse
import hashlib
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from types import SimpleNamespace
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse

from PIL import Image

WORKSPACE = Path(__file__).resolve().parents[1]
MAX_BYTES = 25 * 1024 * 1024
EXTENSIONS = {"JPEG": ".jpg", "MPO": ".jpg", "PNG": ".png", "WEBP": ".webp", "GIF": ".gif", "AVIF": ".avif", "ICO": ".ico", "TIFF": ".tif"}


def emit(value):
    print(json.dumps(value, ensure_ascii=False, indent=2))


def fetch(url, image=False):
    if urlparse(url).scheme not in ("https", "http"):
        raise ValueError("Only public HTTP(S) resources are supported")
    data = bytearray()
    with urlopen(Request(url), timeout=35) as result:
        response = SimpleNamespace(url=result.url, status_code=result.status, headers=result.headers, encoding=result.headers.get_content_charset())
        while True:
            block = result.read(64 * 1024)
            if not block:
                break
            data.extend(block)
            if len(data) > MAX_BYTES:
                raise ValueError("Resource exceeds the 25 MiB image/page limit")
    return response, bytes(data)


class ImageCandidates(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base = base
        self.items = []

    def add(self, value, kind, alt="", context=""):
        value = html.unescape(value or "").strip().replace("\\/", "/")
        if not value or value.startswith(("data:", "javascript:", "#")):
            return
        url = urljoin(self.base, value)
        if urlparse(url).scheme not in ("http", "https"):
            return
        self.items.append({"url": url, "kind": kind, "alt": alt, "context": context[:180]})

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        context = " ".join(str(attrs.get(k, "")) for k in ["class", "id", "title", "width", "height"])
        alt = attrs.get("alt", "")
        if tag in ("img", "source", "input"):
            for key in ["src", "data-src", "data-lazy-src", "data-original", "data-image", "data-bg"]:
                self.add(attrs.get(key), tag + ":" + key, alt, context)
            for key in ["srcset", "data-srcset", "data-lazy-srcset"]:
                for candidate in attrs.get(key, "").split(","):
                    if candidate.strip():
                        parts = candidate.strip().split()
                        self.add(parts[0], tag + ":" + key, alt, context + " " + " ".join(parts[1:]))
        if tag == "meta" and attrs.get("property", attrs.get("name", "")).lower() in ("og:image", "twitter:image", "og:logo"):
            self.add(attrs.get("content"), "meta", alt, context)
        if tag == "link" and any(word in attrs.get("rel", "") for word in ["icon", "image_src", "apple-touch"]):
            self.add(attrs.get("href"), "link", alt, context)
        if tag == "a" and re.search(r"\.(?:png|jpe?g|webp|svg|avif)(?:\?|$)", attrs.get("href", ""), re.I):
            self.add(attrs["href"], "image-link", alt, context)
        for value in re.findall(r"url\(['\"]?([^)'\"]+)", attrs.get("style", "")):
            self.add(value, "inline-background", alt, context)


def discover(url, limit):
    response, data = fetch(url)
    document = data.decode(response.encoding or "utf-8", errors="replace")
    parser = ImageCandidates(response.url)
    parser.feed(document)
    for match in re.findall(r"url\(['\"]?([^)'\"]+)", document):
        parser.add(match, "css-background")
    for match in re.findall(r'''["']([^"'<>\s]+\.(?:png|jpe?g|webp|svg|avif)(?:\?[^"'<>\s]*)?)["']''', document, re.I):
        parser.add(match, "embedded-image")
    seen = set()
    output = []
    for item in parser.items:
        if item["url"] in seen:
            continue
        seen.add(item["url"])
        text = (item["url"] + " " + item["alt"] + " " + item["context"]).lower()
        item["logo_score"] = 100 * bool(re.search(r"logo|brand|emblem", text)) - 70 * bool(re.search(r"facebook|instagram|twitter|whatsapp|youtube|linkedin|icon|badge|naac|ugc|icar", text))
        item["campus_score"] = 70 * bool(re.search(r"campus|building|aerial|infrastructure|agricult|farm|laborator|greenhouse|library", text)) - 60 * bool(re.search(r"logo|icon|badge|poster|admission|scholarship|brochure|banner-ad", text))
        output.append(item)
    emit({"source_page": response.url, "status": response.status_code, "title": re.findall(r"<title[^>]*>(.*?)</title>", document, re.I | re.S)[:1], "total_candidates": len(output), "candidates": output[:limit]})


def inspect_image(path):
    path = Path(path)
    raw = path.read_bytes()
    common = {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
    if b"<svg" in raw[:2000].lower():
        root = ET.fromstring(raw)
        if not root.tag.endswith("svg"):
            raise ValueError("Not an SVG document")
        view = root.attrib.get("viewBox", "").replace(",", " ").split()
        def numeric(value):
            match = re.match(r"([0-9.]+)", value or "")
            return float(match.group(1)) if match else None
        width, height = numeric(root.attrib.get("width")), numeric(root.attrib.get("height"))
        if (not width or not height) and len(view) == 4:
            width, height = float(view[2]), float(view[3])
        unsafe = bool(re.search(br"<\s*(?:script|foreignObject)|\bonload\s*=|\bonerror\s*=|(?:href|xlink:href)\s*=\s*[\"'](?:https?:|//|javascript:)", raw, re.I))
        return {**common, "format": "SVG", "mime": "image/svg+xml", "width": width, "height": height, "safe_static_svg": not unsafe, "extension": ".svg"}
    with Image.open(path) as image:
        width, height = image.size
        image_format = image.format
        image.verify()
    # MPO is a JPEG-compatible file with multi-picture metadata. Keep the detected
    # format and original bytes, and use the standard JPEG upload media type.
    mime = 'image/jpeg' if image_format == 'MPO' and raw.startswith(b'\xff\xd8') else Image.MIME.get(image_format, 'application/octet-stream')
    return {**common, "format": image_format, "mime": mime, "width": width, "height": height, "extension": EXTENSIONS.get(image_format, path.suffix.lower())}


def download(url, destination):
    target = Path(destination).resolve()
    if not target.is_relative_to(WORKSPACE):
        raise ValueError("Download destination must stay inside D:/agrico-frontend")
    target.parent.mkdir(parents=True, exist_ok=True)
    response, data = fetch(url, image=True)
    if len(data) < 100:
        raise ValueError("Resource is too small to be a usable institution image")
    temporary = target.with_name(target.name + ".download")
    temporary.write_bytes(data)
    try:
        metadata = inspect_image(temporary)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise
    final = target.with_suffix(metadata["extension"])
    if final.exists() and final.read_bytes() != data:
        temporary.unlink(missing_ok=True)
        raise ValueError("Refusing to overwrite a different saved image; choose a different filename")
    temporary.replace(final)
    emit({"file": str(final), "requested_url": url, "resolved_url": response.url, "http_content_type": response.headers.get("Content-Type"), **metadata})


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    page = commands.add_parser("page")
    page.add_argument("url")
    page.add_argument("--limit", type=int, default=80)
    image_command = commands.add_parser("download")
    image_command.add_argument("url")
    image_command.add_argument("destination")
    inspect_command = commands.add_parser("inspect")
    inspect_command.add_argument("file")
    args = parser.parse_args()
    try:
        if args.command == "page":
            discover(args.url, args.limit)
        elif args.command == "download":
            download(args.url, args.destination)
        else:
            emit(inspect_image(args.file))
    except Exception as error:
        emit({"error": type(error).__name__, "message": str(error)})
        sys.exit(1)
