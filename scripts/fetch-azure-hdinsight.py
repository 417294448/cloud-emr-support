#!/usr/bin/env python3
"""抓取 Azure HDInsight 组件版本与支持信息，更新 azure-hdinsight-application-version-info.json。"""

import json
import re
import subprocess
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "azure-hdinsight-application-version-info.json"
BASE = "https://learn.microsoft.com/en-us/azure/hdinsight"
USER_AGENT = "Mozilla/5.0"

APP_ALIASES = {
    "Apache Hadoop and YARN": "Apache Hadoop",
    "Apache Zookeeper": "Apache ZooKeeper",
}


def curl(url: str) -> str:
    result = subprocess.run(
        ["curl", "-sL", "-A", USER_AGENT, url],
        capture_output=True,
        text=True,
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


def parse_table(table):
    rows = []
    for tr in table.find_all("tr"):
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if cells:
            rows.append(cells)
    return rows


def fetch_main_page():
    html = curl(f"{BASE}/hdinsight-component-versioning")
    return BeautifulSoup(html, "html.parser")


def extract_supported_versions(soup):
    tables = soup.find_all("table")
    if not tables:
        raise RuntimeError("No tables found on main page")
    table = tables[0]
    rows = parse_table(table)
    if not rows:
        raise RuntimeError("Empty main table")
    headers = rows[0]
    releases = []
    release_info = {}
    detail_links = {}
    for tr, text_row in zip(table.find_all("tr")[1:], rows[1:]):
        version_cell = text_row[0]
        m = re.search(r"HDInsight\s+([0-9.]+)", version_cell)
        if not m:
            continue
        version = m.group(1)
        releases.append(version)
        info = {}
        for i, h in enumerate(headers[1:], start=1):
            if i < len(text_row):
                info[h] = text_row[i]
        release_info[version] = info
        a = tr.find("a")
        if a:
            href = a.get("href", "")
            if href.startswith("/"):
                href = f"https://learn.microsoft.com{href}"
            elif not href.startswith("http"):
                href = f"{BASE}/{href.lstrip('./')}"
            detail_links[version] = href
    return releases, release_info, detail_links


def fetch_detail_page(url):
    html = curl(url)
    return BeautifulSoup(html, "html.parser")


def extract_components(soup):
    """提取第一个组件版本表，返回 {component: {release: version}}。"""
    tables = soup.find_all("table")
    for table in tables:
        rows = parse_table(table)
        if not rows:
            continue
        headers = rows[0]
        if len(headers) < 2:
            continue
        if "Component" not in headers[0]:
            continue
        releases = []
        for h in headers[1:]:
            m = re.search(r"HDInsight\s+([0-9.]+)", h)
            releases.append(m.group(1) if m else h)
        apps = {}
        for row in rows[1:]:
            if not row or not row[0]:
                continue
            app = APP_ALIASES.get(row[0], row[0])
            app_data = {}
            for rel, ver in zip(releases, row[1:]):
                v = ver.strip()
                app_data[rel] = None if v in ("-", "", "N/A") else v
            apps[app] = app_data
        return apps
    return {}


def merge_descriptions(existing, apps):
    result = {}
    for app in apps:
        if app in existing:
            result[app] = existing[app]
    return result


def main():
    existing = load_json()
    soup = fetch_main_page()
    releases, release_info, detail_links = extract_supported_versions(soup)
    print(f"[Azure] Releases: {releases}")
    print(f"[Azure] Detail links: {detail_links}")

    applications = {}
    seen_urls = set()
    for version in releases:
        url = detail_links.get(version)
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        detail_soup = fetch_detail_page(url)
        components = extract_components(detail_soup)
        print(f"[Azure] {url}: {len(components)} components")
        for app, data in components.items():
            if app not in applications:
                applications[app] = {}
            applications[app].update(data)

    descriptions = merge_descriptions(
        existing.get("applicationDescriptions", {}), applications
    )

    data = {
        "dataAsOf": "2026-09-01",
        "standardSupportPolicy": existing.get("standardSupportPolicy", {}),
        "applicationDescriptions": descriptions,
        "releases": releases,
        "releaseInfo": release_info,
        "applications": applications,
    }

    save_json(data)
    print(f"[Azure] Saved {JSON_PATH}")


if __name__ == "__main__":
    main()
