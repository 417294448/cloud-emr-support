#!/usr/bin/env python3
"""抓取 AWS EMR 应用版本与支持政策，更新 aws-emr-application-version-info.json。

策略：
- 从 emr-release-components.html 发现所有 emr-release-app-versions-<series>.md 链接；
- 逐个抓取 .md 文件，解析 **Application version information** 下的 pipe table；
- 保留现有 applicationDescriptions 中的双语描述，新组件以英文占位；
- 抓取 emr-standard-support.html，读取「Releases and supported periods」逐版本表
  与变更历史；
- standardSupportPolicy.releases 写入 release -> 生命周期日期 的逐版本映射
  （首次发布/标准支持结束/扩展支持结束/停止支持/生命周期终止），不再拍平成单条汇总；
- note 中追加最新变更摘要。
"""

import json
import os
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "aws-emr-application-version-info.json"
BASE = "https://docs.amazonaws.cn/en_us/emr/latest/ReleaseGuide"
USER_AGENT = "Mozilla/5.0"


def curl(url: str) -> str:
    result = subprocess.run(
        ["curl", "-sL", "-A", USER_AGENT, url],
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


def discover_series():
    html = curl(f"{BASE}/emr-release-components.html")
    # 页面链接到 .html，但我们要抓 .md 导出
    matches = re.findall(r'href="([^"]*emr-release-app-versions-[^"]+\.html)"', html)
    seen = []
    for m in matches:
        if m.startswith("http"):
            url = m
        else:
            url = f"{BASE}/{m.lstrip('/')}"
        md_url = re.sub(r'\.html$', '.md', url)
        if md_url not in seen:
            seen.append(md_url)
    return seen


def parse_markdown_table(md: str):
    """从 markdown 文本中提取第一个 pipe table，返回 (headers, rows)。"""
    lines = md.splitlines()
    # 找到第一个非空且以 | 开头的行
    start = None
    for i, line in enumerate(lines):
        if line.strip().startswith("|"):
            start = i
            break
    if start is None:
        return [], []
    table_lines = []
    for line in lines[start:]:
        stripped = line.strip()
        if not stripped.startswith("|"):
            break
        table_lines.append(stripped)
    if len(table_lines) < 3:
        return [], []

    def split_cells(line):
        # 去掉首尾的 |
        inner = line.strip()[1:-1]
        return [c.strip() for c in inner.split("|")]

    headers = split_cells(table_lines[0])
    rows = [split_cells(ln) for ln in table_lines[2:]]
    return headers, rows


def parse_series_md(url: str):
    md = curl(url)
    headers, rows = parse_markdown_table(md)
    if not headers:
        raise RuntimeError(f"No table found in {url}")
    releases = headers[1:]
    applications = {}
    for row in rows:
        if not row:
            continue
        app = row[0]
        if not app or app == "-":
            continue
        versions = row[1:]
        app_data = {}
        for rel, ver in zip(releases, versions):
            v = ver.strip()
            # AWS uses " - " for not shipped
            if v in ("-", "", "N/A"):
                app_data[rel] = None
            else:
                app_data[rel] = v
        applications[app] = app_data
    return releases, applications


def fetch_support_policy():
    html = curl(f"{BASE}/emr-standard-support.html")
    return html


def parse_policy_tables(html: str):
    """返回 (policy_rows, change_history_rows) 的原始文本列表。"""
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    if len(tables) < 1:
        return [], []
    rows = []
    for tr in tables[0].find_all("tr"):
        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
        if cells:
            rows.append(cells)
    history = []
    if len(tables) >= 2:
        for tr in tables[1].find_all("tr"):
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
            if cells:
                history.append(cells)
    return rows, history


def merge_descriptions(existing: dict, applications: dict):
    """保留已有双语描述；对全新组件暂不写入描述（避免产生未翻译警告）。"""
    result = {}
    for app in applications:
        if app in existing:
            result[app] = existing[app]
    return result


HISTORY_TRANSLATIONS = {
    "Extended Support added": "新增 Extended Support",
    "Bridge support extended": "Bridge support 延期",
    "Amazon added free Extended Support for releases 5.36 and 6.6 and later. Releases 5.36 and 6.6 through 6.15 receive best-effort critical security fixes; releases 7.0 through 7.10 receive full Standard Support.":
        "Amazon 为 5.36 及 6.6 之后版本提供免费 Extended Support：5.36 与 6.6–6.15 获得尽力而为的关键安全修复；7.0–7.10 获得完整 Standard Support。",
    "Bridge support was extended to August 31, 2026 for all eligible releases.":
        "所有符合条件的版本，Bridge support 延长至 August 31, 2026。",
}


def build_release_lifecycles(policy_rows):
    """把「Releases and supported periods」表解析成 release -> 生命周期日期 的映射。

    表头为: Release version | Initial release date | Standard support end date |
    Extended support end date | End of support start date | End of life start date
    首行是表头，其余每行一个 release（可能是 2.x/5.36/7.13/emr-spark-8.1 [LTS] 等）。
    """
    releases = {}
    if not policy_rows:
        return releases
    for row in policy_rows[1:]:
        if len(row) < 6:
            continue
        name = row[0].strip()
        if not name:
            continue
        releases[name] = {
            "initialReleaseDate": row[1].strip(),
            "standardSupportEndDate": row[2].strip(),
            "extendedSupportEndDate": row[3].strip(),
            "endOfSupportStartDate": row[4].strip(),
            "endOfLifeStartDate": row[5].strip(),
        }
    return releases


def build_policy(existing_policy, policy_rows, history_rows):
    """保持前端兼容的 policy 结构，note 中合并最新变更历史。"""
    # 概括性政策说明（不逐条罗列各 release，具体日期由前端按所选版本展示）。
    source = existing_policy.get("source", f"{BASE}/emr-standard-support.html")
    note_en = (
        "Amazon EMR releases follow a common lifecycle: Standard Support (24 months from each "
        "release's initial date), then Extended Support where available, End of Support, and End "
        "of Life. Legacy releases receive Bridge Support through August 31, 2026. Exact dates vary "
        "by release."
    )
    note_zh = (
        "Amazon EMR 各 release 遵循统一的生命周期：标准支持（自首次发布起 24 个月），"
        "随后（如适用）为扩展支持、停止支持，最终生命周期终止。"
        "历史版本由 Bridge Support 覆盖至 August 31, 2026。具体日期因版本而异。"
    )

    # 把变更历史追加到 note 中
    if history_rows and len(history_rows) > 1:
        en_history = []
        zh_history = []
        for row in history_rows[1:]:
            if len(row) >= 3:
                date, change, desc = row[0], row[1], row[2]
                en_history.append(f"{date} - {change}: {desc}")
                zh_change = HISTORY_TRANSLATIONS.get(change, change)
                zh_desc = HISTORY_TRANSLATIONS.get(desc, desc)
                zh_history.append(f"{date} - {zh_change}：{zh_desc}")
        if en_history:
            note_en += " Recent changes: " + "; ".join(en_history) + "."
            note_zh += " 近期变更：" + "；".join(zh_history) + "。"

    releases = build_release_lifecycles(policy_rows)
    if not releases:
        # 表格未解析到任何行时，保留已有的逐 release 数据，避免把好数据清空。
        releases = existing_policy.get("releases", {})

    return {
        "source": source,
        "note": {"en": note_en, "zh": note_zh},
        "announcedDate": "July 25, 2024",
        # releases 为 release -> 生命周期日期 的逐版本映射（依据官方
        # 「Releases and supported periods」表，各 release 日期不同）。
        "releases": releases,
    }


def main():
    existing = load_json()
    series_urls = discover_series()
    print(f"[AWS] Discovered {len(series_urls)} series pages")

    data = {
        # dataAsOf 取本次抓取运行日期（最近一次刷新时间）。
        "dataAsOf": date.today().isoformat(),
        "standardSupportPolicy": existing.get("standardSupportPolicy", {}),
        "applicationDescriptions": existing.get("applicationDescriptions", {}),
    }

    for url in series_urls:
        series = re.search(r"emr-release-app-versions-([^/]+)\.md", url).group(1)
        releases, applications = parse_series_md(url)
        print(f"[AWS] {series}: {len(releases)} releases, {len(applications)} applications")
        data[series] = {
            "releases": releases,
            "applications": applications,
        }
        # 合并描述
        data["applicationDescriptions"] = merge_descriptions(
            data["applicationDescriptions"], applications
        )

    # 抓取并更新支持政策
    policy_html = fetch_support_policy()
    policy_rows, history_rows = parse_policy_tables(policy_html)
    print(f"[AWS] Policy table: {len(policy_rows)} rows, history: {len(history_rows)} rows")
    data["standardSupportPolicy"] = build_policy(
        data["standardSupportPolicy"], policy_rows, history_rows
    )

    save_json(data)
    print(f"[AWS] Saved {JSON_PATH}")


if __name__ == "__main__":
    main()
