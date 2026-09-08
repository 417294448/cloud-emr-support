#!/usr/bin/env python3
"""抓取 GCP Dataproc (Managed Spark) 组件版本和生命周期，更新 gcp-dataproc-application-version-info.json。"""

import json
import re
import subprocess
from datetime import date
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "gcp-dataproc-application-version-info.json"
BASE = "https://cloud.google.com.googledrive.googleworkspace.globe.myshn.net/dataproc/docs/concepts/versioning"
MAIN_URL = f"{BASE}/dataproc-version-clusters"
USER_AGENT = "Mozilla/5.0"
CURL_ARGS = ["-k", "-sL", "-A", USER_AGENT]


def curl(url: str) -> str:
    result = subprocess.run(
        ["curl", *CURL_ARGS, url],
        capture_output=True,
        # Windows 下 subprocess 默认用 locale 编码（gbk）解码 stdout，抓取 UTF-8
        # 页面会抛 UnicodeDecodeError 导致输出为 None；显式按 UTF-8 解码。
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"curl failed for {url}: {result.stderr}")
    return result.stdout


def load_json():
    if JSON_PATH.exists():
        return json.loads(JSON_PATH.read_text(encoding="utf-8"))
    return {}


def save_json(data):
    JSON_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def clean_text(t):
    if not t:
        return ""
    return re.sub(r"\s+", " ", t.replace("\xa0", " ").replace("\u3000", " ")).strip()


def parse_date_from_header(cell_text: str):
    """从类似 '2.3.34-debian12/... 2026/07/15' 的文本里提取日期。"""
    m = re.search(r"(\d{4}/\d{2}/\d{2})", cell_text)
    return m.group(1) if m else None


def format_date(date_ymd: str) -> str:
    """把 2026/07/15 格式转换为 'July 15, 2026'。"""
    if not date_ymd or date_ymd == "TBD":
        return date_ymd
    m = re.match(r"(\d{4})/(\d{2})/(\d{2})", date_ymd)
    if not m:
        return date_ymd
    y, mo, d = m.group(1), int(m.group(2)), int(m.group(3))
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    return f"{months[mo-1]} {d}, {y}"


def parse_main_page(html: str):
    """解析主页面的版本表（Debian/Ubuntu/Rocky 三个），提取 release 信息。"""
    soup = BeautifulSoup(html, "html.parser")
    releases = []
    release_info = {}
    for table in soup.find_all("table"):
        rows = []
        for tr in table.find_all("tr"):
            cells = [clean_text(td.get_text()) for td in tr.find_all(["td", "th"])]
            if cells and any(c for c in cells):
                rows.append(cells)
        if not rows or len(rows[0]) < 4:
            continue
        header = rows[0]
        joined = " ".join(header)
        if "Version" not in joined:
            continue
        for row in rows[1:]:
            if not row:
                continue
            version = row[0]
            if not version:
                continue
            # 主版本号：2.3, 2.2, 2.1, 3.0 等
            short = re.match(r"(\d+\.\d+)", version)
            if not short:
                continue
            release_line = short.group(1)
            info = {}
            # 常见表头：Version / Last updated / Released on / Supported until / Available until / Notes
            for i, h in enumerate(header):
                if i >= len(row):
                    continue
                k = clean_text(h)
                if not k:
                    continue
                info[k] = row[i]
            if release_line in releases:
                continue
            releases.append(release_line)
            release_info[release_line] = {
                "osImages": info.get("Version", ""),
                "lastUpdated": format_date(info.get("Last updated", "")),
                "releasedOn": format_date(info.get("Released on", "")),
                "supportedUntil": format_date(info.get("Supported until", "")),
                "availableUntil": format_date(info.get("Available until", "")),
                "releaseStage": info.get("Notes", ""),
                "additionalNotes": info.get("Notes", ""),
            }
    # 按主版本号排序，新版本在前
    releases.sort(key=lambda v: tuple(int(x) for x in v.split(".")), reverse=True)
    return releases, release_info


# 同一组件的命名在不同详情页不一致（3.0 用 "Apache Xxx"，2.x 用 "Xxx"），
# 统一到无前缀形式，避免同一组件在结果表里被拆成两行、旧版本显示 "—"。
_CANONICAL_COMPONENT_NAMES = {
    "Apache Ranger": "Ranger",
    "Apache Solr": "Solr",
    "Apache Zeppelin Notebook": "Zeppelin Notebook",
    "Apache Zookeeper": "Zookeeper",
}


def parse_detail_page(html: str, expected_release: str):
    """解析详情页的第一个（组件）表，返回 {component: {release: version}}。"""
    soup = BeautifulSoup(html, "html.parser")
    apps = {}
    for table in soup.find_all("table"):
        rows = []
        for tr in table.find_all("tr"):
            cells = [clean_text(td.get_text()) for td in tr.find_all(["td", "th"])]
            if cells and any(c for c in cells):
                rows.append(cells)
        if not rows or len(rows[0]) < 2:
            continue
        headers = rows[0]
        first_col = headers[0]
        if first_col != "Component":
            continue  # 跳过 GPU、Python 库、R 库等其他表
        print(f"  [debug] found Component table, {len(rows)-1} rows")
        # 只要第一列数据中 Component 的版本即可，按列取第一个数据列
        for row in rows[1:]:
            if not row or not row[0]:
                continue
            app_full = row[0]
            # 组件名常带提示后缀（installed / optional component /
            # initialization action），需一并清除后再做命名归一化。
            app = re.sub(r"initialization action", "", app_full)
            app = re.sub(r"optional\s+component", "", app)
            app = re.sub(r"\s*installed\s*$", "", app, flags=re.IGNORECASE)
            app = clean_text(app)
            if not app:
                continue
            app = _CANONICAL_COMPONENT_NAMES.get(app, app)
            val = row[1] if len(row) > 1 else ""
            val_clean = None if (not val or val == "-") else val
            apps.setdefault(app, {})[expected_release] = val_clean
        return apps
    print(f"  [debug] no Component table found in {len(soup.find_all('table'))} tables")
    return {}


def merge_descriptions(existing, all_apps):
    result = {}
    for app in all_apps:
        if app in existing:
            result[app] = existing[app]
    return result


def main():
    existing = load_json()
    releases, release_info = [], {}
    try:
        main_html = curl(MAIN_URL)
        releases, release_info = parse_main_page(main_html)
        print(f"[GCP] Main page releases: {releases}")
    except Exception as e:
        print(f"[GCP] Warning: main page failed ({e}); using existing release list")
        releases = existing.get("releases", [])
        release_info = existing.get("releaseInfo", {})

    applications = {}
    DETAIL_URLS = [
        ("2.3", f"{BASE}/image-release-2.3"),
        ("2.2", f"{BASE}/image-release-2.2"),
        ("2.1", f"{BASE}/image-release-2.1"),
        ("3.0", f"{BASE}/image-release-3.0"),
    ]
    for release, url in DETAIL_URLS:
        if release not in releases:
            # 即使主页面没列出，也尝试抓取看看
            pass
        try:
            html = curl(url)
            apps = parse_detail_page(html, release)
            print(f"[GCP] {release}: {len(apps)} components")
            for app, data in apps.items():
                if app not in applications:
                    applications[app] = {}
                applications[app].update(data)
        except Exception as e:
            print(f"[GCP] Warning: {release} detail page failed: {e}")

    all_apps = set(applications.keys())
    descriptions = merge_descriptions(
        existing.get("applicationDescriptions", {}), all_apps
    )

    data = {
        "dataAsOf": date.today().isoformat(),
        "standardSupportPolicy": existing.get("standardSupportPolicy", {}),
        "applicationDescriptions": descriptions,
        "releases": releases or existing.get("releases", []),
        "releaseInfo": release_info or existing.get("releaseInfo", {}),
        "applications": applications or existing.get("applications", {}),
    }

    save_json(data)
    print(f"[GCP] Saved {JSON_PATH}")


if __name__ == "__main__":
    main()
