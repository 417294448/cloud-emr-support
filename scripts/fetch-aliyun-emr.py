#!/usr/bin/env python3
"""抓取阿里云 EMR on ECS 组件版本和生命周期，更新 aliyun-emr-application-version-info.json。"""

import json
import re
import subprocess
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "aliyun-emr-application-version-info.json"
BASE_COMPONENTS = "https://help.aliyun.com/zh/emr/emr-on-ecs/product-overview/emr-on-ecs-release-version"
BASE_LIFECYCLE = "https://help.aliyun.com/zh/emr/emr-on-ecs/product-overview/lifecycle-policies-for-emr-on-ecs"
USER_AGENT = "Mozilla/5.0"


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


def extract_ice_page_content(html: str) -> str:
    """从阿里云 client-rendered 页面里提取 content HTML 字符串。"""
    soup = BeautifulSoup(html, "html.parser")
    for s in soup.find_all("script"):
        t = s.string or ""
        if "__ICE_PAGE_PROPS__" not in t:
            continue
        m = re.search(r"__ICE_PAGE_PROPS__\s*=\s*(\{[\s\S]*)", t)
        if not m:
            continue
        txt = m.group(1)
        depth = 0
        end = -1
        for i, c in enumerate(txt):
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end <= 0:
            continue
        try:
            data = json.loads(txt[:end])
        except json.JSONDecodeError:
            continue

        def find(obj, target_key):
            if isinstance(obj, dict):
                if target_key in obj:
                    return obj[target_key]
                for v in obj.values():
                    r = find(v, target_key)
                    if r is not None:
                        return r
            elif isinstance(obj, list):
                for v in obj:
                    r = find(v, target_key)
                    if r is not None:
                        return r
            return None

        content = find(data, "content")
        if isinstance(content, str) and content:
            return content
    raise RuntimeError("Could not find ICE content")


def parse_text(t):
    if not t:
        return ""
    return t.replace("\u3000", " ").replace("\xa0", " ").strip()


def parse_components_html(html: str):
    """解析组件版本页面，返回 series dict (name -> {releases, applications})。"""
    soup = BeautifulSoup(html, "html.parser")
    series_result = {}
    current_series = None

    for elem in soup.find_all(["h2", "h3", "table"]):
        if elem.name in ("h2", "h3"):
            text = parse_text(elem.get_text())
            m = re.match(r"EMR-(\d+\.x)", text)
            if m:
                current_series = f"EMR-{m.group(1)}"
                series_result.setdefault(current_series, {"releases": [], "applications": {}})
        elif elem.name == "table" and current_series:
            rows = []
            for tr in elem.find_all("tr"):
                cells = [parse_text(td.get_text()) for td in tr.find_all(["td", "th"])]
                if cells and any(c for c in cells):
                    rows.append(cells)
            if not rows or len(rows[0]) < 2:
                continue
            headers = rows[0]
            real_rels = []
            real_idx = []
            for i, h in enumerate(headers):
                if h and re.match(r"EMR-\d+\.\d+\.x", h):
                    real_rels.append(h)
                    real_idx.append(i)
            if not real_rels:
                continue
            sd = series_result[current_series]
            for r in real_rels:
                if r not in sd["releases"]:
                    sd["releases"].append(r)
            for row in rows[1:]:
                if not row or not row[0]:
                    continue
                app = row[0]
                if not app or app in ("组件", "服务"):
                    continue
                for rel, idx in zip(real_rels, real_idx):
                    val = row[idx] if idx < len(row) else ""
                    val_clean = None if (not val or val == "-") else val
                    sd["applications"].setdefault(app, {})[rel] = val_clean

    return series_result


def parse_lifecycle_html(html: str):
    """解析生命周期页面，返回 (releaseLifecycle, retiredSeriesLifecycle)。"""
    soup = BeautifulSoup(html, "html.parser")
    release_lifecycle = {}
    retired = []
    for table in soup.find_all("table"):
        rows = []
        for tr in table.find_all("tr"):
            cells = [parse_text(td.get_text()) for td in tr.find_all(["td", "th"])]
            if cells and any(c for c in cells):
                rows.append(cells)
        if not rows:
            continue
        # 生命周期表头大致为：发行版本 / GA / EOM / EOS
        header = rows[0]
        if len(header) < 4:
            continue
        joined = " ".join(header)
        if ("GA" not in joined) or ("EOM" not in joined):
            continue
        # 确定列索引
        def find_idx(kw):
            for i, h in enumerate(header):
                if kw in h:
                    return i
            return -1
        rel_idx = 0
        ga_idx = find_idx("GA")
        eom_idx = find_idx("EOM")
        eos_idx = find_idx("EOS")
        if ga_idx < 0 or eom_idx < 0 or eos_idx < 0:
            continue
        for row in rows[1:]:
            if not row or not row[rel_idx]:
                continue
            label = row[rel_idx]
            ga = row[ga_idx] if ga_idx < len(row) else ""
            eom = row[eom_idx] if eom_idx < len(row) else ""
            eos = row[eos_idx] if eos_idx < len(row) else ""
            ga = None if not ga or ga == "-" else ga
            eom = None if not eom or eom == "-" else eom
            eos = None if not eos or eos == "-" else eos
            # 如果是具体版本如 5.18.x，转为 EMR-5.18.x
            m = re.match(r"^(\d+\.\d+\.x)$", label)
            if m:
                release_lifecycle[f"EMR-{label}"] = {"ga": ga, "eom": eom, "eos": eos}
            else:
                retired.append({"label": label, "ga": ga, "eom": eom, "eos": eos})
    return release_lifecycle, retired


def merge_descriptions(existing, all_apps):
    result = {}
    for app in all_apps:
        if app in existing:
            result[app] = existing[app]
    return result


def main():
    existing = load_json()

    # 组件版本页
    components_html_raw = curl(BASE_COMPONENTS)
    components_html = extract_ice_page_content(components_html_raw)
    series = parse_components_html(components_html)
    print(f"[Aliyun] Series found: {list(series.keys())}")
    for sname, sdata in series.items():
        print(f"  {sname}: {len(sdata['releases'])} releases, {len(sdata['applications'])} components")

    # 生命周期页
    lifecycle_raw = curl(BASE_LIFECYCLE)
    lifecycle_html = extract_ice_page_content(lifecycle_raw)
    release_lifecycle, retired = parse_lifecycle_html(lifecycle_html)
    print(f"[Aliyun] Lifecycle rows: {len(release_lifecycle)} specific + {len(retired)} retired series")

    # 收集所有组件名
    all_apps = set()
    for sdata in series.values():
        all_apps.update(sdata["applications"].keys())
    descriptions = merge_descriptions(
        existing.get("applicationDescriptions", {}), all_apps
    )

    data = {
        "dataAsOf": "2026-08-21",
        "standardSupportPolicy": existing.get("standardSupportPolicy", {}),
        "applicationDescriptions": descriptions,
        "releaseLifecycle": release_lifecycle,
        "retiredSeriesLifecycle": retired,
    }
    data.update(series)

    save_json(data)
    print(f"[Aliyun] Saved {JSON_PATH}")


if __name__ == "__main__":
    main()
