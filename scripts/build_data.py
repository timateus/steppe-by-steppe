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
F=json.load(open('data/facts.json'))['regions']
S=json.load(open('data/short_facts.json'))
CEN={"KZ":"Kazakhstan","KG":"Kyrgyzstan","TJ":"Tajikistan","TM":"Turkmenistan","UZ":"Uzbekistan"}
CRU={"KZ":"Казахстана","KG":"Кыргызстана","TJ":"Таджикистана","TM":"Туркменистана","UZ":"Узбекистана"}
ORD_EN={2:"2nd",3:"3rd"}; ORD_RU={2:"второй",3:"третий"}
def rank_facts():
    # Rankings among a country's regions (cities excluded), from official area and population.
    out={}
    for cc in CEN:
        ids=[i for i in F if i.startswith(cc) and (F[i]['cap'] or i=="TJ-RA")]
        n=len(ids)
        for key in ("area","pop"):
            order=sorted(ids,key=lambda i:-F[i][key])
            vals=[F[i][key] for i in order]
            for k,i in enumerate(order):
                pos=k+1
                if not (pos==1 or pos==n or (pos==2 and n>=5) or (pos==3 and n>=7)): continue
                near=[vals[j] for j in (k-1,k+1) if 0<=j<n]
                if any(abs(vals[k]-v)/max(vals[k],v)<0.03 for v in near): continue
                name=META[i]['en'].replace('Republic of','the Republic of'); ru=F[i]['ru']
                if key=="area":
                    e=("the biggest" if pos==1 else "the smallest" if pos==n else f"the {ORD_EN[pos]} biggest")+f" region in {CEN[cc]}"
                    r=("крупнейший по площади" if pos==1 else "самый маленький по площади" if pos==n else f"{ORD_RU[pos]} по площади")+f" регион {CRU[cc]}"
                else:
                    e=("the most populous" if pos==1 else "the least populated" if pos==n else f"the {ORD_EN[pos]} most populous")+f" region in {CEN[cc]}"
                    r=("самый населённый" if pos==1 else "наименее населённый" if pos==n else f"{ORD_RU[pos]} по населению")+f" регион {CRU[cc]}"
                out.setdefault(i,[]).append([f"{name} is {e}!",f"{ru} — {r}!"])
    return out
META=m['meta']
RF=rank_facts()
for i,r in regions.items():
    f=F[i]
    r.update(ru=f['ru'],cap=f['cap'],facts=S[i]+RF.get(i,[]))
out=dict(W=W,H=H,regions=regions,countries=countries)
s_=json.dumps(out,ensure_ascii=False,separators=(',',':'))
open('build/data.js','w').write("const DATA="+s_+";")
print(H,len(s_))
