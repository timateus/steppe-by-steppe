"""Turn projected boundaries + names + facts into build/data.js for the page."""
import json
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

R = json.load(open("data/regions.json"))
ADJ = json.load(open("build/adj.json"))
F = json.load(open("data/facts.json"))["regions"]  # official area / population (core regions)
S = json.load(open("data/short_facts.json"))

def build_map(path, W=1000, PAD=20):
    d = json.load(open(path))
    shapes = {f["properties"]["id"]: shape(f["geometry"]).buffer(0) for f in d["features"]}
    X0, Y0, X1, Y1 = unary_union(list(shapes.values())).bounds
    s = (W - 2 * PAD) / (X1 - X0)
    H = round((Y1 - Y0) * s + 2 * PAD)
    tx = lambda x, y: (round((x - X0) * s + PAD, 1), round((Y1 - y) * s + PAD, 1))
    def ring(r):
        out = []
        for p in (tx(*p) for p in r):
            if not out or out[-1] != p:
                out.append(p)
        return "M" + "L".join(f"{x:g},{y:g}" for x, y in out) + "Z"
    def path(g):
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        return "".join(ring(r) for p in polys for r in p)
    geo = {}
    for f in d["features"]:
        i = f["properties"]["id"]; g = shapes[i]
        lp = g.centroid if g.contains(g.centroid) else g.representative_point()
        b = g.bounds; x0, y1 = tx(b[0], b[1]); x1, y0 = tx(b[2], b[3])
        geo[i] = {"d": path(f["geometry"]), "c": tx(lp.x, lp.y), "b": [x0, y0, x1, y1]}
    countries = {}
    for cc in sorted({R[i]["cc"] for i in shapes}):
        u = unary_union([shapes[i].buffer(300) for i in shapes if R[i]["cc"] == cc]).buffer(-300).simplify(1500)
        countries[cc] = path(mapping(u))
    adj = {i: [n for n in ADJ[i] if n in shapes] for i in shapes}
    return {"W": W, "H": H, "geo": geo, "adj": adj, "countries": countries}

# Size and population rankings among a country's regions (cities excluded), from official figures.
C = {"KZ": ("Kazakhstan", "Казахстана", "Қазақстандағы"), "KG": ("Kyrgyzstan", "Кыргызстана", "Қырғызстандағы"),
     "TJ": ("Tajikistan", "Таджикистана", "Тәжікстандағы"), "TM": ("Turkmenistan", "Туркменистана", "Түрікменстандағы"),
     "UZ": ("Uzbekistan", "Узбекистана", "Өзбекстандағы")}
EN_ORD = {2: "2nd", 3: "3rd"}; RU_ORD = {2: "второй", 3: "третий"}; KK_ORD = {2: "екінші", 3: "үшінші"}
def rank_facts():
    out = {}
    for cc, (cen, cru, ckk) in C.items():
        ids = [i for i in F if i.startswith(cc) and (F[i]["cap"] or i == "TJ-RA")]
        n = len(ids)
        for key in ("area", "pop"):
            order = sorted(ids, key=lambda i: -F[i][key]); vals = [F[i][key] for i in order]
            for k, i in enumerate(order):
                pos = k + 1
                if not (pos == 1 or pos == n or (pos == 2 and n >= 5) or (pos == 3 and n >= 7)):
                    continue
                if any(abs(vals[k] - vals[j]) / max(vals[k], vals[j]) < 0.03 for j in (k - 1, k + 1) if 0 <= j < n):
                    continue
                en = R[i]["en"].replace("Republic of", "the Republic of")
                if key == "area":
                    e = "the biggest" if pos == 1 else "the smallest" if pos == n else f"the {EN_ORD[pos]} biggest"
                    r = "крупнейший по площади" if pos == 1 else "самый маленький по площади" if pos == n else f"{RU_ORD[pos]} по площади"
                    kz = "аумағы бойынша ең үлкен" if pos == 1 else "аумағы бойынша ең кіші" if pos == n else f"аумағы бойынша {KK_ORD[pos]}"
                else:
                    e = "the most populous" if pos == 1 else "the least populated" if pos == n else f"the {EN_ORD[pos]} most populous"
                    r = "самый населённый" if pos == 1 else "наименее населённый" if pos == n else f"{RU_ORD[pos]} по населению"
                    kz = "халқы ең көп" if pos == 1 else "халқы ең аз" if pos == n else f"халқы бойынша {KK_ORD[pos]}"
                out.setdefault(i, []).append([f"{en} is {e} region in {cen}!", f"{R[i]['ru']} — {r} регион {cru}!", f"{R[i]['kk']} — {ckk} {kz} өңір!"])
    return out
RF = rank_facts()

meta = {}
for i, r in R.items():
    meta[i] = {k: r[k] for k in ("cc", "core", "en", "ru", "kk", "local", "aliases", "cap", "short")}
    meta[i]["facts"] = S[i] + RF.get(i, [])

out = {"meta": meta, "maps": {"core": build_map("build/proj_core.geojson"), "gs": build_map("build/proj_gs.geojson")}}
s = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
open("build/data.js", "w").write("const DATA=" + s + ";")
print({k: (v["W"], v["H"], len(v["geo"])) for k, v in out["maps"].items()}, len(s))
