import json
from shapely.geometry import shape
from shapely.ops import unary_union
d=json.load(open('build/proj.geojson')); m=json.load(open('build/meta.json'))
X0,X1,Y0,Y1=-1426380,1534210,-977830,1273760
PAD=20; W=1000; s=(W-2*PAD)/(X1-X0); H=round((Y1-Y0)*s+2*PAD)
def tx(x,y): return (round((x-X0)*s+PAD,1), round((Y1-y)*s+PAD,1))
def ring(r):
    pts=[tx(*p) for p in r]; out=[]; 
    for p in pts:
        if not out or out[-1]!=p: out.append(p)
    return "M"+"L".join(f"{x:g},{y:g}" for x,y in out)+"Z"
def path(g):
    polys=g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    return "".join(ring(r) for p in polys for r in p)
regions={}; shapes={}
for f in d['features']:
    i=f['properties']['id']; g=shape(f['geometry']).buffer(0); shapes[i]=g
    lp=g.representative_point() if g.area< g.convex_hull.area*0.6 else g.centroid
    if not g.contains(lp): lp=g.representative_point()
    b=g.bounds
    x0,y1=tx(b[0],b[1]); x1,y0=tx(b[2],b[3])
    regions[i]=dict(m['meta'][i], d=path(f['geometry']), c=tx(lp.x,lp.y), b=[x0,y0,x1,y1], n=m['adj'][i])
countries={}
for cc in ["KZ","KG","TJ","TM","UZ"]:
    u=unary_union([shapes[i].buffer(300) for i in shapes if m['meta'][i]['cc']==cc]).buffer(-300).simplify(1500)
    from shapely.geometry import mapping
    countries[cc]=path(mapping(u))
out=dict(W=W,H=H,regions=regions,countries=countries)
s_=json.dumps(out,ensure_ascii=False,separators=(',',':'))
open('build/data.js','w').write("const DATA="+s_+";")
print(H,len(s_))
