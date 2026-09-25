import json
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
# id -> (code, country, English name, local official name, extra aliases)
R = {
 215441:("KZ-27","KZ","West Kazakhstan Region","Батыс Қазақстан облысы",["Batys Qazaqstan","West Kazakhstan","Oral","Uralsk"]),
 214834:("KZ-23","KZ","Atyrau Region","Атырау облысы",["Atyraū"]),
 215686:("KZ-47","KZ","Mangystau Region","Маңғыстау облысы",["Mangghystau","Mangistau","Aktau"]),
 215683:("KZ-15","KZ","Aktobe Region","Ақтөбе облысы",["Aqtöbe","Aqtobe","Aktyubinsk"]),
 1288730:("KZ-39","KZ","Kostanay Region","Қостанай облысы",["Qostanay","Kostanai"]),
 215760:("KZ-59","KZ","North Kazakhstan Region","Солтүстік Қазақстан облысы",["Soltüstik Qazaqstan","North Kazakhstan","Petropavl"]),
 215743:("KZ-11","KZ","Akmola Region","Ақмола облысы",["Aqmola","Kokshetau"]),
 215772:("KZ-55","KZ","Pavlodar Region","Павлодар облысы",[]),
 215776:("KZ-35","KZ","Karaganda Region","Қарағанды облысы",["Qaraghandy","Karagandy"]),
 14312737:("KZ-62","KZ","Ulytau Region","Ұлытау облысы",["Ulytaū","Zhezkazgan"]),
 215727:("KZ-43","KZ","Kyzylorda Region","Қызылорда облысы",["Qyzylorda"]),
 215739:("KZ-61","KZ","Turkistan Region","Түркістан облысы",["Türkistan","South Kazakhstan"]),
 215722:("KZ-31","KZ","Jambyl Region","Жамбыл облысы",["Zhambyl","Taraz"]),
 215718:("KZ-19","KZ","Almaty Region","Алматы облысы",["Konaev","Qonaev"]),
 14312169:("KZ-33","KZ","Jetisu Region","Жетісу облысы",["Zhetisu","Zhetysu","Taldykorgan"]),
 14243026:("KZ-10","KZ","Abai Region","Абай облысы",["Abay","Semey"]),
 215699:("KZ-63","KZ","East Kazakhstan Region","Шығыс Қазақстан облысы",["Shyghys Qazaqstan","East Kazakhstan","Oskemen","Ust-Kamenogorsk"]),
 3087155:("KZ-71","KZ","Astana","Астана",["Nur-Sultan","Akmola city"]),
 2465058:("KZ-75","KZ","Almaty","Алматы",["Almaty city","Alma-Ata"]),
 3389772:("KZ-79","KZ","Shymkent","Шымкент",["Chimkent"]),
 178026:("KG-C","KG","Chüy Region","Чүй облусу",["Chuy","Chui"]),
 178023:("KG-T","KG","Talas Region","Талас облусу",[]),
 178025:("KG-Y","KG","Issyk-Kul Region","Ысык-Көл облусу",["Ysyk-Köl","Issyk Kul","Issykkul","Karakol"]),
 1251542:("KG-N","KG","Naryn Region","Нарын облусу",[]),
 178024:("KG-J","KG","Jalal-Abad Region","Жалал-Абад облусу",["Jalalabad","Djalal-Abad"]),
 178020:("KG-O","KG","Osh Region","Ош облусу",[]),
 178019:("KG-B","KG","Batken Region","Баткен облусу",[]),
 8493930:("KG-GB","KG","Bishkek","Бишкек шаары",["Frunze"]),
 19059632:("KG-GO","KG","Osh","Ош шаары",["Osh city"]),
 3279374:("TJ-SU","TJ","Sughd Region","Вилояти Суғд",["Sogd","Soghd","Khujand","Leninabad"]),
 3279615:("TJ-RA","TJ","Districts of Republican Subordination","Ноҳияҳои тобеи ҷумҳурӣ",["Nohiyahoi Tobei Jumhuri","RRS","DRS","Republican Subordination"]),
 3279616:("TJ-KT","TJ","Khatlon Region","Вилояти Хатлон",["Bokhtar"]),
 3279614:("TJ-GB","TJ","Gorno-Badakhshan Autonomous Region","Вилояти Мухтори Кӯҳистони Бадахшон",["GBAO","Kuhistoni Badakhshon","Kŭhistoni Badakhshon","Mountainous Badakhshan","Badakhshan","Pamir","Khorog"]),
 7328360:("TJ-DU","TJ","Dushanbe","Душанбе",["Stalinabad"]),
 223032:("TM-B","TM","Balkan Region","Balkan welaýaty",["Balkan"]),
 223031:("TM-A","TM","Ahal Region","Ahal welaýaty",["Akhal"]),
 223028:("TM-D","TM","Dashoguz Region","Daşoguz welaýaty",["Daşoguz","Dashhowuz","Dasoguz"]),
 223029:("TM-L","TM","Lebap Region","Lebap welaýaty",["Türkmenabat"]),
 223030:("TM-M","TM","Mary Region","Mary welaýaty",[]),
 7328329:("TM-S","TM","Ashgabat","Aşgabat",["Ashkhabad"]),
 15654588:("TM-AR","TM","Arkadag","Arkadag şäheri",[]),
 196241:("UZ-QR","UZ","Republic of Karakalpakstan","Qoraqalpogʻiston Respublikasi",["Karakalpakstan","Qoraqalpogʻiston","Qoraqalpogiston","Nukus"]),
 196242:("UZ-XO","UZ","Khorezm Region","Xorazm viloyati",["Xorazm","Khwarazm","Urgench"]),
 1670973:("UZ-BU","UZ","Bukhara Region","Buxoro viloyati",["Buxoro","Bukhoro"]),
 196246:("UZ-NW","UZ","Navoi Region","Navoiy viloyati",["Navoiy","Navoiy"]),
 196249:("UZ-SA","UZ","Samarkand Region","Samarqand viloyati",["Samarqand"]),
 1670974:("UZ-QA","UZ","Kashkadarya Region","Qashqadaryo viloyati",["Qashqadaryo","Qarshi","Karshi"]),
 196248:("UZ-SU","UZ","Surkhandarya Region","Surxondaryo viloyati",["Surxondaryo","Termez","Termiz"]),
 196254:("UZ-JI","UZ","Jizzakh Region","Jizzax viloyati",["Jizzax","Djizak"]),
 196253:("UZ-SI","UZ","Syrdarya Region","Sirdaryo viloyati",["Sirdaryo","Gulistan"]),
 196251:("UZ-TO","UZ","Tashkent Region","Toshkent viloyati",["Toshkent viloyati","Nurafshon"]),
 2216724:("UZ-TK","UZ","Tashkent","Toshkent shahri",["Toshkent","Tashkent city"]),
 178017:("UZ-NG","UZ","Namangan Region","Namangan viloyati",[]),
 178016:("UZ-AN","UZ","Andijan Region","Andijon viloyati",["Andijon"]),
 178018:("UZ-FA","UZ","Fergana Region","Fargʻona viloyati",["Fargʻona","Fargona","Ferghana"]),
}
geoms={}
for i,(code,*_) in R.items():
    g=json.load(open(f"data/raw/{i}.json"))
    geoms[code]=shape(g).buffer(0)
codes=list(geoms)
adj={c:[] for c in codes}
rep=[]
for a in range(len(codes)):
    for b in range(a+1,len(codes)):
        A,B=geoms[codes[a]],geoms[codes[b]]
        if not A.buffer(0.01).intersects(B): continue
        # shared border length (degrees), via thin buffer
        L=A.boundary.intersection(B.buffer(0.003)).length
        contained = A.buffer(0.001).contains(B) or B.buffer(0.001).contains(A)
        rep.append((round(L,3),codes[a],codes[b],contained))
        if L>0.02 or contained:
            adj[codes[a]].append(codes[b]); adj[codes[b]].append(codes[a])
import sys
if "-v" in sys.argv:
    for r in sorted(rep): print(r)
feats=[]
for i,(code,cc,en,loc,al) in R.items():
    feats.append({"type":"Feature","properties":{"id":code},"geometry":mapping(geoms[code])})
json.dump({"type":"FeatureCollection","features":feats},open("build/all.geojson","w"))
json.dump({"meta":{c:{"cc":cc,"en":en,"local":loc,"aliases":al} for i,(c,cc,en,loc,al) in R.items()},"adj":adj},open("build/meta.json","w"),ensure_ascii=False)
