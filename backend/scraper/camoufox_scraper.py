import sys
import json
import time

def scrape_pddikti(keyword: str, target_univ: str = ""):
    try:
        from camoufox.sync_api import Camoufox
    except ImportError:
        print(json.dumps({
            "success": False,
            "error": "Camoufox package belum terinstal."
        }))
        return

    try:
        with Camoufox(headless=True, humanize=True) as browser:
            page = browser.new_page()
            
            page.goto("https://pddikti.kemdiktisaintek.go.id/", wait_until="commit", timeout=45000)
            
            # Tunggu Cloudflare Turnstile terverifikasi
            for _ in range(15):
                time.sleep(2)
                title = page.title()
                if "Just a moment" not in title and "Memverifikasi" not in title:
                    break
                try:
                    for frame in page.frames:
                        cb = frame.locator("input[type='checkbox'], span.cb-c, div.ctp-checkbox-label").first
                        if cb.is_visible():
                            cb.click()
                            time.sleep(1)
                except Exception:
                    pass

            time.sleep(4)
            page.wait_for_load_state("load", timeout=15000)
            time.sleep(1)

            # Panggil endpoint pencarian resmi PDDikti Kemdiktisaintek
            api_res = page.evaluate(f"""
                async () => {{
                    try {{
                        const r = await fetch('/api/pencarian/all/{keyword}', {{
                            headers: {{ 'Accept': 'application/json' }}
                        }});
                        if (r.ok) {{
                            return await r.json();
                        }}
                        return null;
                    }} catch(e) {{
                        return null;
                    }}
                }}
            """)

            if not api_res:
                api_res = page.evaluate(f"""
                    async () => {{
                        try {{
                            const r = await fetch('/api/pencarian/mhs/{keyword}', {{
                                headers: {{ 'Accept': 'application/json' }}
                            }});
                            if (r.ok) {{
                                return await r.json();
                            }}
                            return null;
                        }} catch(e) {{
                            return null;
                        }}
                    }}
                """)

            mahasiswa_list = []
            if api_res:
                if isinstance(api_res, dict):
                    data = api_res.get("data", api_res)
                    if isinstance(data, dict):
                        mahasiswa_list = data.get("mahasiswa", [])
                    elif isinstance(data, list):
                        mahasiswa_list = data
                elif isinstance(api_res, list):
                    mahasiswa_list = api_res

            # Filter KHUSUS mahasiswa dari UNIVERSITAS HAMZANWADI
            hamzanwadi_students = []
            for m in mahasiswa_list:
                m_pt = str(m.get("nama_pt", "")).upper()
                m_sinkatan = str(m.get("sinkatan_pt", "")).upper()
                if "HAMZANWADI" in m_pt or "HAMZANWADI" in m_sinkatan:
                    hamzanwadi_students.append(m)

            best_match = None
            if hamzanwadi_students:
                for m in hamzanwadi_students:
                    m_nim = str(m.get("nim", "")).strip()
                    if keyword == m_nim or keyword in m_nim or m_nim in keyword:
                        best_match = m
                        break
                if not best_match:
                    best_match = hamzanwadi_students[0]

            if best_match:
                print(json.dumps({
                    "success": True,
                    "keyword": keyword,
                    "university_filter": "UNIVERSITAS HAMZANWADI",
                    "student": {
                        "nama": best_match.get("nama", "").strip(),
                        "nim": best_match.get("nim", "").strip(),
                        "nama_pt": "UNIVERSITAS HAMZANWADI",
                        "nama_prodi": best_match.get("nama_prodi", "").strip()
                    },
                    "total_found": len(hamzanwadi_students),
                    "matched_students": hamzanwadi_students[:5]
                }))
            else:
                print(json.dumps({
                    "success": False,
                    "keyword": keyword,
                    "university_filter": "UNIVERSITAS HAMZANWADI",
                    "error": f"Data mahasiswa dengan NIM '{keyword}' tidak ditemukan pada pangkalan data resmi Universitas Hamzanwadi di Kemdiktisaintek."
                }))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "NIM tidak diberikan"}))
        sys.exit(1)

    keyword = sys.argv[1]
    target_univ = sys.argv[2] if len(sys.argv) > 2 else ""
    scrape_pddikti(keyword, target_univ)
