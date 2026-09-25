"""Load region boundaries, compute which regions share a land border.

Reads data/regions.json (names, codes, OSM relation IDs) and data/raw/<osm>.json.
Writes build/all.geojson (every region) and build/adj.json (neighbours).
Pass -v to print shared-border lengths.
"""
import json, sys
from shapely.geometry import shape, mapping
from shapely.strtree import STRtree

R = json.load(open("data/regions.json"))
codes = list(R)
geoms = {c: shape(json.load(open(f"data/raw/{R[c]['osm']}.json"))).buffer(0) for c in codes}

adj = {c: [] for c in codes}
tree = STRtree([geoms[c] for c in codes])
rep = []
for a, ca in enumerate(codes):
    A = geoms[ca]
    for b in tree.query(A.buffer(0.01)):
        cb = codes[b]
        if b <= a:
            continue
        B = geoms[cb]
        # Shared border length in degrees; 0.02 (about 2 km) filters out point contacts.
        L = A.boundary.intersection(B.buffer(0.003)).length
        contained = A.buffer(0.001).contains(B) or B.buffer(0.001).contains(A)
        rep.append((round(L, 3), ca, cb, contained))
        if L > 0.02 or contained:
            adj[ca].append(cb)
            adj[cb].append(ca)
if "-v" in sys.argv:
    for r in sorted(rep):
        print(r)

feats = [{"type": "Feature", "properties": {"id": c, "core": R[c]["core"]}, "geometry": mapping(geoms[c])} for c in codes]
json.dump({"type": "FeatureCollection", "features": feats}, open("build/all.geojson", "w"))
json.dump(adj, open("build/adj.json", "w"))
