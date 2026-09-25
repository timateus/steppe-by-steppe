(()=>{
const META=DATA.meta;
const $=id=>document.getElementById(id);
const NS="http://www.w3.org/2000/svg";
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// ---- i18n ----
const LANGS=["en","ru","kk"], LI={en:0,ru:1,kk:2};
const plural=(n,one,few,many)=>{const a=n%10,b=n%100;return a===1&&b!==11?one:a>=2&&a<=4&&(b<10||b>=20)?few:many};
const T={
en:{tagline:"Travel region to region across Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan and Uzbekistan.",
  taglineGs:"Travel region to region across the Great Steppe, from the Volga to Inner Mongolia.",
  daily:"Daily",practice:"Practice",shortest:"Shortest",left:"Guesses left",lg0:"On a shortest route",lg1:"1 step off",lg2:"2 off",lg3:"Far off",
  ph:"Type a region, oblast or city…",guessBtn:"Guess",hintBtn:"Hint",borders:"Borders",bordersOn:"Borders on",bordersTip:"Reveal every region's outline. Counts as a hint.",giveUp:"Give up",
  showResult:"Show result",seeMap:"Look at the map",copy:"Copy result",copied:"Copied",nextP:"Play a practice route",nextN:"New practice route",
  labels:"Label revealed regions",factsToggle:"Show a fact after each guess",howTitle:"How to play",listTitle:n=>`The ${n} regions on this map`,
  gsBadge:"Great Steppe",gsExit:"Back to Central Asia",gsOn:"You found the secret Great Steppe map: Turkic and steppe regions of Russia, China and Mongolia join the game.",
  C:{KZ:"Kazakhstan",KG:"Kyrgyzstan",TJ:"Tajikistan",TM:"Turkmenistan",UZ:"Uzbekistan",RU:"Russia",CN:"China",MN:"Mongolia"},
  already:n=>`${n} is already on the map.`,dup:n=>`You've already guessed ${n}.`,unknown:q=>`“${q}” isn't a region we know. Try another spelling.`,
  ex0:n=>`${n} is on a shortest route.`,exFar:n=>`${n} is far from the shortest route.`,exN:(n,e)=>`${n} is ${e} step${e>1?"s":""} off the shortest route.`,
  hintMsg:(c,l)=>`Hint: a region in ${c} starting with “${l}” (outlined in purple).`,bordersMsg:"Region borders revealed. This counts as a hint.",
  kWin:"You made it",kLose:"Game over",tPerfect:"Perfect route!",tWin:"Route complete",tGave:"Route revealed",tOut:"Out of guesses",
  winText:(g,sp,over,h,b)=>`${g} guess${g>1?"es":""} for a ${sp}-region shortest route${over?` (${over} extra)`:""}${h?`, ${h} hint${h>1?"s":""}`:""}${b?", borders shown":""}.`,
  loseText:p=>`One shortest route: ${p}.`,doneWin:(g,sp)=>`Solved in ${g} guess${g>1?"es":""} (shortest: ${sp})`,doneLose:"Not this time: the shortest route is shown on the map",
  shareOk:"Shortest route!",shareOver:o=>`+${o} over shortest`,shareFail:"Didn't make it",shareP:"(practice)",selCopy:"Press Ctrl/⌘+C to copy the selected result.",
  btw:"btw,",close:"Close",pick:"Pick a region from the list.",
  stTitle:"Statistics",stPlayed:"Played",stWin:"Win %",stStreak:"Streak",stBest:"Best streak",stDist:"Daily results, by guesses over the shortest route",stPerfect:"perfect",stLost:"missed",stNone:"Finish a daily route to start your stats.",
  stToday:"Today's route",stGlobal:(n,w,a)=>`${n} ${n===1?"person has":"people have"} played it · ${w}% made it${a!=null?` · on average +${a} over the shortest`:""}`,stGlobalNone:"Nobody has finished it yet. You could be first.",stMine:"Your daily games",regions:n=>`${n} regions`,thR:"Region",thL:"Official local name",thC:"Capital",
  how:`<ul>
<li>Connect the two blue regions with a chain of regions that share a land border. Enter the regions in between, in any order.</li>
<li>Each guess is coloured by how far it is from a shortest route: <b style="color:var(--g0)">green</b> is on one, <b style="color:var(--g1)">yellow</b> adds one step, <b style="color:var(--g2)">orange</b> adds two, and <b style="color:var(--g3)">red</b> adds three or more.</li>
<li>You get the shortest route's length plus four guesses. <b>Hint</b> outlines a region on the best remaining route. <b>Borders</b> reveals every region's outline for the rest of the game. Neither uses up a guess, but both show in your result (💡 and 🗺️).</li>
<li>After each guess you get a quick fact about that region. Tap any coloured region for another one.</li>
<li>Borders count across countries. Cities with regional status (Astana, Bishkek, Dushanbe, Tashkent, Ashgabat, Arkadag and others) are separate stops. Most sit inside a single region, so they only connect to it.</li>
<li>Drag to move the map, and pinch or scroll to zoom.</li>
<li>You can type English, Russian, Kazakh or local official names, or common older spellings (Zhambyl, Navoiy, Soghd, Nur-Sultan…).</li></ul>`,
  about:`<p>Current first-level divisions as of September 2026, including Kazakhstan's 2022 reform (Abai, Jetisu and Ulytau regions) and Turkmenistan's Arkadag, designated a city of national importance in 2023. Names follow each government's English usage, with the official local-language name alongside.</p>
<p>Size and population rankings in the facts use official areas and figures from the national statistics offices (stat.gov.kz, stat.gov.kg, stat.tj, stat.uz) and Turkmenistan's 2022 census. Boundaries: © OpenStreetMap contributors (ODbL), simplified.</p>`,
  aboutGs:`<p>The Great Steppe map adds a selection of Russia's regions along the Kazakh border and its Turkic and Mongolic republics, China's Xinjiang, Gansu, Qinghai and Inner Mongolia, and all of Mongolia's provinces. Boundaries: © OpenStreetMap contributors (ODbL), simplified.</p>`},
ru:{tagline:"Путешествие от региона к региону по Казахстану, Кыргызстану, Таджикистану, Туркменистану и Узбекистану.",
  taglineGs:"Путешествие от региона к региону по Великой степи — от Волги до Внутренней Монголии.",
  daily:"Задача дня",practice:"Тренировка",shortest:"Кратчайший",left:"Осталось",lg0:"На кратчайшем пути",lg1:"+1 шаг",lg2:"+2",lg3:"Далеко",
  ph:"Введите область, регион или город…",guessBtn:"Ввод",hintBtn:"Подсказка",borders:"Границы",bordersOn:"Границы видны",bordersTip:"Показать контуры всех регионов. Считается подсказкой.",giveUp:"Сдаться",
  showResult:"Показать итог",seeMap:"Посмотреть карту",copy:"Скопировать",copied:"Скопировано",nextP:"Сыграть тренировку",nextN:"Новый маршрут",
  labels:"Подписывать открытые регионы",factsToggle:"Показывать факт после каждого хода",howTitle:"Как играть",listTitle:n=>`${n} ${plural(n,"регион","региона","регионов")} на карте`,
  gsBadge:"Великая степь",gsExit:"Вернуться в Центральную Азию",gsOn:"Вы нашли секретную карту Великой степи: в игру добавлены тюркские и степные регионы России, Китая и Монголии.",
  C:{KZ:"Казахстан",KG:"Кыргызстан",TJ:"Таджикистан",TM:"Туркменистан",UZ:"Узбекистан",RU:"Россия",CN:"Китай",MN:"Монголия"},
  already:n=>`${n} — уже на карте.`,dup:n=>`${n} — уже названо.`,unknown:q=>`Не знаем региона «${q}». Попробуйте другое написание.`,
  ex0:n=>`${n} — на кратчайшем пути.`,exFar:n=>`${n} — далеко от кратчайшего пути.`,exN:(n,e)=>`${n} — ${e} ${plural(e,"шаг","шага","шагов")} в сторону от кратчайшего пути.`,
  hintMsg:(c,l)=>`Подсказка: регион в стране «${c}» на букву «${l}» (обведён фиолетовым).`,bordersMsg:"Границы регионов показаны. Это считается подсказкой.",
  kWin:"Получилось",kLose:"Игра окончена",tPerfect:"Идеальный маршрут!",tWin:"Маршрут пройден",tGave:"Маршрут показан",tOut:"Попытки закончились",
  winText:(g,sp,over,h,b)=>`${g} ${plural(g,"попытка","попытки","попыток")} при кратчайшем пути в ${sp} ${plural(sp,"регион","региона","регионов")}${over?` (лишних: ${over})`:""}${h?`, подсказок: ${h}`:""}${b?", с границами":""}.`,
  loseText:p=>`Один из кратчайших путей: ${p}.`,doneWin:(g,sp)=>`Пройдено за ${g} ${plural(g,"попытку","попытки","попыток")} (кратчайший: ${sp})`,doneLose:"В этот раз не вышло — кратчайший путь показан на карте",
  shareOk:"Кратчайший путь!",shareOver:o=>`+${o} к кратчайшему`,shareFail:"Не получилось",shareP:"(тренировка)",selCopy:"Нажмите Ctrl/⌘+C, чтобы скопировать выделенный результат.",
  btw:"Кстати,",close:"Закрыть",pick:"Выберите регион из списка.",
  stTitle:"Статистика",stPlayed:"Сыграно",stWin:"Побед, %",stStreak:"Серия",stBest:"Лучшая серия",stDist:"Результаты задач дня: сколько ходов сверх кратчайшего",stPerfect:"идеально",stLost:"не дошли",stNone:"Пройдите задачу дня, чтобы начать статистику.",
  stToday:"Сегодняшний маршрут",stGlobal:(n,w,a)=>`сыграли ${n} ${plural(n,"человек","человека","человек")} · дошли ${w}%${a!=null?` · в среднем +${a} к кратчайшему`:""}`,stGlobalNone:"Пока никто не прошёл. Станьте первым.",stMine:"Ваши задачи дня",regions:n=>`${n} ${plural(n,"регион","региона","регионов")}`,thR:"Регион",thL:"Официальное местное название",thC:"Центр",
  how:`<ul>
<li>Соедините два синих региона цепочкой регионов, у которых есть общая сухопутная граница. Вводите промежуточные регионы в любом порядке.</li>
<li>Цвет показывает, насколько регион далёк от кратчайшего пути: <b style="color:var(--g0)">зелёный</b> — на нём, <b style="color:var(--g1)">жёлтый</b> — +1 шаг, <b style="color:var(--g2)">оранжевый</b> — +2, <b style="color:var(--g3)">красный</b> — +3 и больше.</li>
<li>Попыток — длина кратчайшего пути плюс четыре. <b>Подсказка</b> обводит регион на лучшем оставшемся пути. <b>Границы</b> открывают контуры всех регионов до конца игры. Попыток они не тратят, но видны в результате (💡 и 🗺️).</li>
<li>После каждого хода — короткий факт о регионе. Нажмите на любой цветной регион, чтобы узнать ещё один.</li>
<li>Границы между странами тоже считаются. Города с особым статусом (Астана, Бишкек, Душанбе, Ташкент, Ашхабад, Аркадаг и другие) — отдельные остановки; большинство из них окружены одним регионом и соединяются только с ним.</li>
<li>Карту можно двигать пальцем и увеличивать щипком или колёсиком.</li>
<li>Можно вводить русские, английские, казахские и официальные местные названия, а также старые варианты (Жамбыл, Навоий, Согд, Нур-Султан…).</li></ul>`,
  about:`<p>Действующее административное деление первого уровня на сентябрь 2026 года, включая реформу 2022 года в Казахстане (Абайская, Жетысуская и Улытауская области) и туркменский Аркадаг, получивший в 2023 году статус города государственного значения. Рядом с русским названием приведено официальное название на государственном языке.</p>
<p>Рейтинги по площади и населению в фактах основаны на официальных данных национальных статистических служб (stat.gov.kz, stat.gov.kg, stat.tj, stat.uz) и переписи Туркменистана 2022 года. Границы: © участники OpenStreetMap (ODbL), упрощены.</p>`,
  aboutGs:`<p>Карта Великой степи добавляет часть регионов России вдоль границы с Казахстаном и её тюркские и монгольские республики, китайские Синьцзян, Ганьсу, Цинхай и Внутреннюю Монголию, а также все аймаки Монголии. Границы: © участники OpenStreetMap (ODbL), упрощены.</p>`},
kk:{tagline:"Қазақстан, Қырғызстан, Тәжікстан, Түрікменстан және Өзбекстан өңірлері бойынша саяхат.",
  taglineGs:"Ұлы дала өңірлері бойынша саяхат — Еділден Ішкі Моңғолияға дейін.",
  daily:"Күн жұмбағы",practice:"Жаттығу",shortest:"Ең қысқа",left:"Қалды",lg0:"Ең қысқа жолда",lg1:"+1 қадам",lg2:"+2",lg3:"Алыс",
  ph:"Облыс, өңір немесе қала атауын жазыңыз…",guessBtn:"Енгізу",hintBtn:"Кеңес",borders:"Шекара",bordersOn:"Шекара ашық",bordersTip:"Барлық өңірдің шекарасын көрсету. Кеңес ретінде саналады.",giveUp:"Берілу",
  showResult:"Нәтижені көрсету",seeMap:"Картаны қарау",copy:"Көшіру",copied:"Көшірілді",nextP:"Жаттығу ойнау",nextN:"Жаңа бағыт",
  labels:"Ашылған өңірлерге атау қою",factsToggle:"Әр жүрістен кейін дерек көрсету",howTitle:"Қалай ойнайды",listTitle:n=>`Картадағы ${n} өңір`,
  gsBadge:"Ұлы дала",gsExit:"Орталық Азияға оралу",gsOn:"Сіз Ұлы даланың құпия картасын таптыңыз: ойынға Ресей, Қытай және Моңғолияның түркі және дала өңірлері қосылды.",
  C:{KZ:"Қазақстан",KG:"Қырғызстан",TJ:"Тәжікстан",TM:"Түрікменстан",UZ:"Өзбекстан",RU:"Ресей",CN:"Қытай",MN:"Моңғолия"},
  already:n=>`${n} картада бар.`,dup:n=>`${n} аталып қойды.`,unknown:q=>`«${q}» деген өңір табылмады. Басқаша жазып көріңіз.`,
  ex0:n=>`${n} — ең қысқа жолда.`,exFar:n=>`${n} — ең қысқа жолдан алыс.`,exN:(n,e)=>`${n} — ең қысқа жолдан ${e} қадам шетте.`,
  hintMsg:(c,l)=>`Кеңес: ${c} еліндегі «${l}» әрпінен басталатын өңір (күлгінмен белгіленген).`,bordersMsg:"Өңір шекаралары ашылды. Бұл кеңес ретінде саналады.",
  kWin:"Жеттіңіз",kLose:"Ойын аяқталды",tPerfect:"Мінсіз бағыт!",tWin:"Бағыт аяқталды",tGave:"Бағыт көрсетілді",tOut:"Әрекет таусылды",
  winText:(g,sp,over,h,b)=>`${g} әрекет, ең қысқа жол — ${sp} өңір${over?` (артық: ${over})`:""}${h?`, кеңес: ${h}`:""}${b?", шекаралармен":""}.`,
  loseText:p=>`Ең қысқа жолдардың бірі: ${p}.`,doneWin:(g,sp)=>`${g} әрекетте жеттіңіз (ең қысқасы: ${sp})`,doneLose:"Бұл жолы болмады — ең қысқа жол картада көрсетілді",
  shareOk:"Ең қысқа жол!",shareOver:o=>`ең қысқадан +${o}`,shareFail:"Болмады",shareP:"(жаттығу)",selCopy:"Белгіленген нәтижені көшіру үшін Ctrl/⌘+C басыңыз.",
  btw:"Айтпақшы,",close:"Жабу",pick:"Тізімнен өңірді таңдаңыз.",
  stTitle:"Статистика",stPlayed:"Ойналды",stWin:"Жеңіс, %",stStreak:"Қатар",stBest:"Үздік қатар",stDist:"Күн жұмбақтарының нәтижесі: ең қысқадан артық жүрістер",stPerfect:"мінсіз",stLost:"жетпеді",stNone:"Статистиканы бастау үшін күн жұмбағын шешіңіз.",
  stToday:"Бүгінгі бағыт",stGlobal:(n,w,a)=>`${n} адам ойнады · ${w}% жетті${a!=null?` · орта есеппен ең қысқадан +${a}`:""}`,stGlobalNone:"Әзірге ешкім шешкен жоқ. Бірінші болыңыз.",stMine:"Сіздің күн жұмбақтарыңыз",regions:n=>`${n} өңір`,thR:"Өңір",thL:"Ресми жергілікті атауы",thC:"Орталығы",
  how:`<ul>
<li>Екі көк өңірді ортақ құрлық шекарасы бар өңірлер тізбегімен жалғаңыз. Арасындағы өңірлерді кез келген ретпен енгізіңіз.</li>
<li>Түс өңірдің ең қысқа жолдан қаншалықты алыс екенін көрсетеді: <b style="color:var(--g0)">жасыл</b> — жолдың үстінде, <b style="color:var(--g1)">сары</b> — +1 қадам, <b style="color:var(--g2)">қызғылт сары</b> — +2, <b style="color:var(--g3)">қызыл</b> — +3 және одан көп.</li>
<li>Әрекет саны — ең қысқа жолдың ұзындығы қосу төрт. <b>Кеңес</b> ең жақсы қалған жолдағы өңірді белгілейді. <b>Шекаралар</b> ойын соңына дейін барлық өңірдің контурын ашады. Олар әрекетті жұмсамайды, бірақ нәтижеде көрінеді (💡 және 🗺️).</li>
<li>Әр жүрістен кейін өңір туралы қысқа дерек шығады. Тағы біреуін білу үшін кез келген түсті өңірді басыңыз.</li>
<li>Елдер арасындағы шекаралар да есептеледі. Ерекше мәртебелі қалалар (Астана, Бішкек, Душанбе, Ташкент, Ашхабад, Аркадаг және басқалар) — жеке аялдама; олардың көбі бір өңірдің ішінде орналасқан, сондықтан тек сонымен жалғасады.</li>
<li>Картаны саусақпен жылжытып, екі саусақпен немесе дөңгелекпен үлкейтуге болады.</li>
<li>Қазақша, орысша, ағылшынша және ресми жергілікті атауларды, сондай-ақ ескі нұсқаларды (Жамбыл, Навоий, Согд, Нұр-Сұлтан…) жазуға болады.</li></ul>`,
  about:`<p>2026 жылғы қыркүйектегі бірінші деңгейлі әкімшілік бөлініс, соның ішінде Қазақстанның 2022 жылғы реформасы (Абай, Жетісу және Ұлытау облыстары) және 2023 жылы мемлекеттік маңызы бар қала мәртебесін алған түрікмен Аркадагы. Қазақша атаудың қасында мемлекеттік тілдегі ресми атауы көрсетілген.</p>
<p>Деректердегі аумақ пен халық саны бойынша рейтингтер ұлттық статистика қызметтерінің (stat.gov.kz, stat.gov.kg, stat.tj, stat.uz) ресми деректеріне және Түрікменстанның 2022 жылғы санағына негізделген. Шекаралар: © OpenStreetMap қатысушылары (ODbL), жеңілдетілген.</p>`,
  aboutGs:`<p>Ұлы дала картасына Ресейдің Қазақстанмен шекарадағы өңірлерінің бір бөлігі және оның түркі және моңғол республикалары, Қытайдың Шыңжаң, Ганьсу, Цинхай және Ішкі Моңғолия өңірлері, сондай-ақ Моңғолияның барлық аймақтары қосылған. Шекаралар: © OpenStreetMap қатысушылары (ODbL), жеңілдетілген.</p>`}
};
// Language: saved choice, else the browser's preferred languages. Speakers of other
// languages of the region (Uzbek, Kyrgyz, Tajik, Turkmen, Mongolian…) get Russian.
function detectLang(){
  const saved=(store.get("sbs-prefs")||{}).lang;if(LANGS.includes(saved))return saved;
  const prefs=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||"en"]).map(l=>String(l).toLowerCase());
  for(const l of prefs){const b=l.split("-")[0];
    if(b==="kk")return "kk";if(b==="ru")return "ru";if(b==="en")return "en";
    if(["uz","ky","tg","tk","mn","tt","ba","be","uk","az","ka","hy"].includes(b))return "ru"}
  return "en"}
let LANG=detectLang();
const L=()=>T[LANG];
const nm=id=>META[id][LANG];
const short=id=>META[id].short[LI[LANG]];
const fact=f=>f[LI[LANG]];

// ---- map state (Central Asia or the secret Great Steppe map) ----
let MODE, M, R, IDS, D, PAIRS, EL, KEYS, vb;
const svg=$("map"),gC=$("gCtry"),gR=$("gReg"),gD=$("gDots"),gL=$("gLbl");
const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/ё/g,"е").replace(/[ʻʼ'’‘`\-.\s]/g,"");
const STRIP=/(^|\s)(region|oblast|oblysy|oblusu|viloyati|welayaty|province|city|shahri|shaary|sheheri|republic of|republic|respublikasi|krai|aimag|область|облысы|облусу|велаят|уәлаяты|аймағы|аймак|аймаг|республика|республикасы|край|өлкесі|город|провинция|провинциясы)(?=\s|$)/gi;
function useMap(mode){
  MODE=mode;M=DATA.maps[mode];IDS=Object.keys(M.geo);R={};
  for(const id of IDS)R[id]={...META[id],...M.geo[id],n:M.adj[id]};
  D={};for(const s of IDS){const d={[s]:0},q=[s];while(q.length){const u=q.shift();for(const v of R[u].n)if(!(v in d)){d[v]=d[u]+1;q.push(v)}}D[s]=d}
  const [lo,hi]=mode==="gs"?[4,11]:[3,8];
  PAIRS=[];for(const a of IDS)for(const b of IDS)if(a<b&&D[a][b]>=lo&&D[a][b]<=hi)PAIRS.push([a,b]);
  KEYS={};for(const id of IDS){const r=META[id];
    KEYS[id]=[...new Set([r.en,r.ru,r.kk,r.local,...r.short,...r.aliases,...[r.en,r.ru,r.kk,r.local].map(s=>s.replace(STRIP," "))].map(norm).filter(Boolean))]}
  gC.innerHTML="";gR.innerHTML="";EL={};
  for(const cc in M.countries){const p=document.createElementNS(NS,"path");p.setAttribute("d",M.countries[cc]);p.setAttribute("class","ctry");gC.appendChild(p)}
  const area=id=>{const b=R[id].b;return (b[2]-b[0])*(b[3]-b[1])};
  for(const id of [...IDS].sort((a,b)=>area(b)-area(a))){const p=document.createElementNS(NS,"path");p.setAttribute("d",R[id].d);p.setAttribute("class","r");p.dataset.id=id;gR.appendChild(p);EL[id]=p}
  vb={x:0,y:0,w:M.W,h:M.W*asp()};
  document.documentElement.dataset.mode=mode;
}
const SMALL=id=>{const b=R[id].b;return Math.max(b[2]-b[0],b[3]-b[1])<9};

// ---- pan & zoom; the viewBox always matches the element's shape ----
const asp=()=>{const w=svg.clientWidth,h=svg.clientHeight;return w&&h?h/w:0.77};
function setVB(v){const W=M.W,H=M.H,a=asp();v.w=Math.max(40,Math.min(W*1.35,v.w));v.h=v.w*a;
  v.x=Math.max(-0.2*W,Math.min(W*1.2-v.w,v.x));v.y=Math.max(-0.2*H,Math.min(H*1.2-v.h,v.y));vb=v;
  svg.setAttribute("viewBox",`${v.x} ${v.y} ${v.w} ${v.h}`);scaleMarks()}
function fitTo(ids,pad=0.16){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const id of ids){const b=R[id].b;x0=Math.min(x0,b[0]);y0=Math.min(y0,b[1]);x1=Math.max(x1,b[2]);y1=Math.max(y1,b[3])}
  const a=asp();let w=Math.max(x1-x0,(y1-y0)/a,M.W*0.15);w*=1+pad*2;const h=w*a;setVB({x:(x0+x1)/2-w/2,y:(y0+y1)/2-h/2,w,h})}
function zoomAt(f,cx,cy){const w=vb.w*f;if(w<40||w>M.W*1.35)return;setVB({x:cx-(cx-vb.x)*f,y:cy-(cy-vb.y)*f,w,h:w*asp()})}
function toSvg(e){const r=svg.getBoundingClientRect();return[vb.x+(e.clientX-r.left)/r.width*vb.w,vb.y+(e.clientY-r.top)/r.height*vb.h]}
svg.addEventListener("wheel",e=>{e.preventDefault();const[x,y]=toSvg(e);zoomAt(e.deltaY>0?1.18:1/1.18,x,y)},{passive:false});
const ptrs=new Map();let moved=0,downTarget=null;
svg.addEventListener("pointerdown",e=>{downTarget=e.target;svg.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);svg.classList.add("drag");moved=0});
svg.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;const r=svg.getBoundingClientRect();const prev=ptrs.get(e.pointerId);
  moved+=Math.abs(e.clientX-prev[0])+Math.abs(e.clientY-prev[1]);
  if(ptrs.size===1){setVB({...vb,x:vb.x-(e.clientX-prev[0])/r.width*vb.w,y:vb.y-(e.clientY-prev[1])/r.height*vb.h})}
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()];const d0=Math.hypot(a[0]-b[0],a[1]-b[1]);ptrs.set(e.pointerId,[e.clientX,e.clientY]);const [c,dd]=[...ptrs.values()];const d1=Math.hypot(c[0]-dd[0],c[1]-dd[1]);
    if(d0>0&&d1>0){const mx=(c[0]+dd[0])/2,my=(c[1]+dd[1])/2;zoomAt(d0/d1,vb.x+(mx-r.left)/r.width*vb.w,vb.y+(my-r.top)/r.height*vb.h)}return}
  ptrs.set(e.pointerId,[e.clientX,e.clientY])});
const up=e=>{const was=ptrs.size;ptrs.delete(e.pointerId);if(!ptrs.size)svg.classList.remove("drag");
  if(e.type==="pointerup"&&was===1&&moved<8&&downTarget){const id=downTarget.dataset&&downTarget.dataset.id;if(id&&isShown(id))showFact(id)}};
svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up);
$("zIn").onclick=()=>zoomAt(1/1.4,vb.x+vb.w/2,vb.y+vb.h/2);
$("zOut").onclick=()=>zoomAt(1.4,vb.x+vb.w/2,vb.y+vb.h/2);
$("zFit").onclick=()=>fitTo([G.start,G.end,...G.guesses,...G.hints]);
function scaleMarks(){const k=vb.w/Math.max(svg.clientWidth,300);
  for(const c of gD.children)c.setAttribute("r",6*k);
  for(const t of gL.children){t.setAttribute("font-size",12*k);t.setAttribute("stroke-width",3*k)}}
let lastW=0;new ResizeObserver(()=>{const w=svg.clientWidth;if(!w||!vb)return;const cx=vb.x+vb.w/2,cy=vb.y+vb.h/2,k=lastW?vb.w/lastW*w:vb.w;lastW=w;
  setVB({x:cx-k/2,y:cy-k*asp()/2,w:k,h:k*asp()})}).observe(svg);

// ---- game ----
const DAY0=Date.UTC(2026,8,25);
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const dayNo=s=>{const[y,m,d]=s.split("-").map(Number);return Math.round((Date.UTC(y,m-1,d)-DAY0)/864e5)+1};
function rng(seed){let a=0;for(const ch of seed)a=Math.imul(a^ch.charCodeAt(0),2654435761)>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function pick(rand){const [a,b]=PAIRS[Math.floor(rand()*PAIRS.length)];return rand()<.5?[a,b]:[b,a]}
const dailyKey=()=>MODE==="gs"?"sbs-daily-gs":"sbs-daily";

let G, factId=null, factIdx=0, overlayOpen=false;
const maxG=()=>D[G.start][G.end]-1+4;
const known=()=>new Set([G.start,G.end,...G.guesses]);
function bestPath(a,b,kn){const cost={},prev={},dq=[a];cost[a]=0;
  while(dq.length){const u=dq.shift();for(const v of R[u].n){const w=cost[u]+(kn.has(v)?0:1);if(!(v in cost)||w<cost[v]){cost[v]=w;prev[v]=u;kn.has(v)?dq.unshift(v):dq.push(v)}}}
  const p=[];for(let u=b;u!==a;u=prev[u])p.unshift(u);p.pop();return p}
function connected(a,b,set){const seen=new Set([a]),q=[a];while(q.length){const u=q.shift();if(u===b)return true;for(const v of R[u].n)if(set.has(v)&&!seen.has(v)){seen.add(v);q.push(v)}}return false}
const excess=(x)=>D[G.start][x]+D[x][G.end]-D[G.start][G.end];
const solution=()=>G.done&&!G.won?new Set(bestPath(G.start,G.end,known())):new Set();
const isShown=id=>id===G.start||id===G.end||G.guesses.includes(id)||solution().has(id);
const valid=g=>g&&R[g.start]&&R[g.end]&&g.guesses.every(x=>R[x]);
function newGame(mode){
  if(mode==="daily"){const t=today();const saved=store.get(dailyKey());
    if(saved&&saved.date===t&&valid(saved)){G=saved}else{const[s,e]=pick(rng((MODE==="gs"?"sbs-gs-":"sbs-")+t));G={mode,date:t,start:s,end:e,guesses:[],hints:[],done:false,won:false}}}
  else{const[s,e]=pick(Math.random);G={mode,start:s,end:e,guesses:[],hints:[],done:false,won:false}}
  $("mDaily").setAttribute("aria-pressed",mode==="daily");$("mPractice").setAttribute("aria-pressed",mode!=="daily");
  GLOBAL=null;fetchGlobal();$("guess").value="";closeSugg();msg("");hideFact();overlayOpen=G.done;render();fitTo(G.done?[G.start,G.end,...G.guesses]:[G.start,G.end]);
}
function save(){if(G.mode==="daily")store.set(dailyKey(),G)}

function guess(id){
  if(G.done)return;
  if(id===G.start||id===G.end){msg(L().already(nm(id)),true);return}
  if(G.guesses.includes(id)){msg(L().dup(nm(id)),true);return}
  G.guesses.push(id);G.hints=G.hints.filter(h=>h!==id);
  const ex=excess(id);
  msg(ex===0?L().ex0(nm(id)):ex>=3?L().exFar(nm(id)):L().exN(nm(id),ex));
  if(connected(G.start,G.end,known())){G.done=true;G.won=true;finish()}
  else if(G.guesses.length>=maxG()){G.done=true;G.won=false;finish()}
  save();
  if($("tFacts").checked)showFact(id);
  render();
  const b=R[id].b;if(G.done)fitTo([G.start,G.end,...G.guesses,...solution()]);else if(b[0]<vb.x||b[2]>vb.x+vb.w||b[1]<vb.y||b[3]>vb.y+vb.h)fitTo([G.start,G.end,...G.guesses]);
}
function hint(){if(G.done)return;const p=bestPath(G.start,G.end,known());const id=p.find(x=>!G.guesses.includes(x)&&!G.hints.includes(x))||p.find(x=>!G.guesses.includes(x));
  if(!id)return;if(!G.hints.includes(id))G.hints.push(id);msg(L().hintMsg(L().C[R[id].cc],nm(id)[0]));save();render()}
function giveUp(){if(G.done)return;G.done=true;G.won=false;G.gaveUp=true;finish();save();render();fitTo([G.start,G.end,...G.guesses,...solution()])}
function finish(){overlayOpen=true;
  if(G.mode==="daily"){recordDaily();sendGlobal()}
  requestAnimationFrame(()=>{const r=$("mapbox").getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)$("mapbox").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})})}

// ---- one-line fact ----
function showFact(id){const f=META[id].facts;if(!f||!f.length)return;
  let k=Math.floor(Math.random()*f.length);if(factId===id&&f.length>1&&k===factIdx)k=(k+1)%f.length;
  factIdx=k;factId=id;render()}
function hideFact(){factId=null;$("fact").hidden=true;if(G)render()}
function renderFact(){const id=factId;if(!id||!META[id].facts[factIdx]){$("fact").hidden=true;return}
  $("fact").innerHTML=`<p><b>${L().btw}</b> ${esc(fact(META[id].facts[factIdx]))}</p><button class="x" type="button" aria-label="${L().close}" id="fx">×</button>`;
  $("fact").hidden=false;$("fx").onclick=hideFact}

// ---- statistics: personal (this browser) and, when STATS_URL is set, everyone's daily results ----
// The stats server's address comes from stats.json, which the "Deploy stats server" GitHub
// Action writes next to index.html. Without it the page shows personal stats only.
let STATS_URL="";
const statsKey=()=>"sbs-stats-"+MODE;
function loadStats(){const st=store.get(statsKey());if(st)return st;
  const old=MODE==="core"&&store.get("sbs-stats");// earlier versions kept only totals
  return {played:old?old.played:0,won:old?old.won:0,streak:0,best:0,last:null,lastWin:null,dist:[0,0,0,0,0],lost:old?old.played-old.won:0,perfect:old?old.perfect:0}}
function recordDaily(){const st=loadStats();if(st.last===G.date)return;
  const over=G.guesses.length-(D[G.start][G.end]-1),y=new Date(G.date+"T12:00:00");y.setDate(y.getDate()-1);
  const yest=`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,"0")}-${String(y.getDate()).padStart(2,"0")}`;
  st.played++;st.last=G.date;
  if(G.won){st.won++;st.dist[Math.min(over,4)]++;st.streak=st.lastWin===yest?st.streak+1:1;st.best=Math.max(st.best,st.streak);st.lastWin=G.date;
    if(over===0&&!G.hints.length&&!G.borders)st.perfect++}
  else{st.lost++;st.streak=0}
  store.set(statsKey(),st)}
let GLOBAL=null;
const statsOn=()=>STATS_URL&&!/(^|\.)claude\.ai$/.test(location.hostname);
if(!/(^|\.)claude\.ai$/.test(location.hostname))fetch("stats.json",{cache:"no-store"}).then(r=>r.ok?r.json():null)
  .then(j=>{if(j&&/^https:\/\/[\w.-]+$/.test(j.url||"")){STATS_URL=j.url;if(G)fetchGlobal()}}).catch(()=>{});
function clientId(){let id=store.get("sbs-cid");if(!id){id=Math.random().toString(36).slice(2)+Date.now().toString(36);store.set("sbs-cid",id)}return id}
function fetchGlobal(){if(!statsOn()||!G||G.mode!=="daily")return;const g=G;
  fetch(`${STATS_URL}/stats?day=${g.date}&map=${MODE}&route=${g.start}>${g.end}`,{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{if(j&&G===g){GLOBAL=j;renderStats()}}).catch(()=>{})}
function sendGlobal(){if(!statsOn())return;const sp=D[G.start][G.end]-1;
  fetch(`${STATS_URL}/result`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({day:G.date,map:MODE,route:`${G.start}>${G.end}`,client:clientId(),
    guesses:G.guesses.length,shortest:sp,won:!!G.won,hints:G.hints.length,borders:!!G.borders})}).then(()=>fetchGlobal()).catch(()=>{})}
function statsHTML(){const l=L(),st=loadStats(),n=st.played,pct=n?Math.round(st.won/n*100):0;
  let h="";
  if(GLOBAL&&G&&G.mode==="daily"){h+=`<div class="st-g"><b>${l.stToday}</b>: ${GLOBAL.played?l.stGlobal(GLOBAL.played,Math.round(GLOBAL.won/GLOBAL.played*100),GLOBAL.avgOver==null?null:(+GLOBAL.avgOver).toFixed(1)):l.stGlobalNone}</div>`}
  h+=`<div class="st-h">${l.stMine}${MODE==="gs"?" · "+l.gsBadge:""}</div>`;
  if(!n)return h+`<p class="st-none">${l.stNone}</p>`;
  h+=`<div class="st-nums">${[[n,l.stPlayed],[pct,l.stWin],[st.streak,l.stStreak],[st.best,l.stBest]].map(([v,k])=>`<div><b>${v}</b><small>${k}</small></div>`).join("")}</div>`;
  const rows=[["+0",st.dist[0],l.stPerfect],["+1",st.dist[1]],["+2",st.dist[2]],["+3",st.dist[3]],["+4",st.dist[4]],["✗",st.lost,l.stLost]];
  const mx=Math.max(1,...rows.map(r=>r[1]));
  const me=G&&G.mode==="daily"&&G.done&&G.date===st.last?(G.won?Math.min(G.guesses.length-(D[G.start][G.end]-1),4):5):-1;
  h+=`<div class="st-h2">${l.stDist}</div><div class="st-dist">${rows.map(([k,v],i)=>`<span>${k}</span><div class="bar${i===me?" me":""}${i===5?" x":""}" style="width:${Math.max(6,v/mx*100)}%">${v}</div>`).join("")}</div>`;
  return h}
function renderStats(){$("statsBox").innerHTML=statsHTML();$("rStats").innerHTML=G&&G.mode==="daily"?statsHTML():""}

// ---- render ----
const DOTC=["var(--g0)","var(--g1)","var(--g2)","var(--g3)"];
function render(){
  const l=L(),sp=D[G.start][G.end]-1;
  $("route").innerHTML=`<span class="pt">${esc(nm(G.start))}</span><span class="cc">${G.start.slice(0,2)}</span><span class="arrow">→</span><span class="pt">${esc(nm(G.end))}</span><span class="cc">${G.end.slice(0,2)}</span>`;
  $("cShort").textContent=sp;$("cLeft").textContent=Math.max(0,maxG()-G.guesses.length);
  const sol=solution();
  for(const id of IDS){const el=EL[id];let c="r",t=0;
    if(id===G.start)c+=" on start",t=1;else if(id===G.end)c+=" on end",t=1;
    else if(G.guesses.includes(id)){c+=" on s"+Math.min(excess(id),3);t=1}
    else if(sol.has(id))c+=" sol",t=1;
    else if(G.hints.includes(id))c+=" hinted";
    if(id===factId)c+=" focus";
    el.setAttribute("class",c);el.innerHTML=t?`<title>${esc(nm(id))} · ${esc(META[id].local)}</title>`:""}
  svg.classList.toggle("borders",!!G.borders||G.done);
  $("bordersBtn").textContent=G.borders?l.bordersOn:l.borders;$("bordersBtn").title=l.bordersTip;
  gD.innerHTML="";gL.innerHTML="";
  for(const id of [G.start,G.end,...G.guesses,...sol]){const[x,y]=R[id].c;
    if(SMALL(id)){const c=document.createElementNS(NS,"circle");c.setAttribute("cx",x);c.setAttribute("cy",y);c.setAttribute("class","dot");c.dataset.id=id;
      c.style.fill=id===G.start||id===G.end?"var(--accent)":sol.has(id)?"var(--accent-soft)":DOTC[Math.min(excess(id),3)];gD.appendChild(c)}
    if($("tLabels").checked||id===G.start||id===G.end){const t=document.createElementNS(NS,"text");t.setAttribute("x",x);t.setAttribute("y",SMALL(id)?y-10*vb.w/Math.max(svg.clientWidth,300):y);t.setAttribute("class","lbl");t.textContent=short(id);gL.appendChild(t)}}
  scaleMarks();
  $("guesses").innerHTML=G.guesses.map(id=>`<li data-id="${id}"><i style="background:${DOTC[Math.min(excess(id),3)]}"></i>${esc(nm(id))}</li>`).join("")+G.hints.filter(h=>!G.guesses.includes(h)).map(()=>`<li class="h"><i></i>${l.hintBtn}</li>`).join("");
  $("form").hidden=G.done;$("donebar").hidden=!G.done;
  $("over").hidden=!(G.done&&overlayOpen);
  if(G.done){const over=G.guesses.length-sp,perfect=G.won&&over===0&&!G.hints.length&&!G.borders;
    $("panel").classList.toggle("lost",!G.won);$("donebar").classList.toggle("lost",!G.won);
    $("rKick").textContent=G.won?l.kWin:l.kLose;
    $("rTitle").textContent=G.won?(perfect?l.tPerfect:l.tWin):G.gaveUp?l.tGave:l.tOut;
    $("rText").textContent=G.won?l.winText(G.guesses.length,sp,over,G.hints.length,G.borders):l.loseText(bestPath(G.start,G.end,new Set([G.start,G.end])).map(nm).join(" → "));
    $("doneText").textContent=G.won?l.doneWin(G.guesses.length,sp):l.doneLose;
    const sq=["🟩","🟨","🟧","🟥"];
    $("rShare").textContent=`Steppe by Steppe${MODE==="gs"?" · "+l.gsBadge:""}${G.mode==="daily"?" #"+dayNo(G.date):" "+l.shareP}\n${short(G.start)} → ${short(G.end)}\n${G.guesses.map(id=>sq[Math.min(excess(id),3)]).join("")}${"💡".repeat(G.hints.length)}${G.borders?"🗺️":""} ${G.won?"✅":"❌"}\n${G.won?(over?l.shareOver(over):l.shareOk):l.shareFail}`;
    $("next").textContent=$("next2").textContent=G.mode==="daily"?l.nextP:l.nextN;
  }
  renderFact();renderStats();
}
function msg(t,err){$("msg").textContent=t;$("msg").classList.toggle("err",!!err)}

function applyLang(){const l=L();document.documentElement.lang=LANG;
  $("h1").innerHTML='Steppe <span id="by">by</span> Steppe';$("by").onclick=secretTap;
  $("tagline").textContent=MODE==="gs"?l.taglineGs:l.tagline;
  $("gsBadge").hidden=MODE!=="gs";$("gsBadge").innerHTML=`${l.gsBadge} <span aria-hidden="true">×</span>`;$("gsBadge").title=l.gsExit;$("gsBadge").setAttribute("aria-label",`${l.gsBadge}: ${l.gsExit}`);
  document.querySelectorAll("[data-t]").forEach(el=>{el.textContent=l[el.dataset.t]});
  $("guess").placeholder=l.ph;$("guess").setAttribute("aria-label",l.ph);$("copy").textContent=l.copy;
  $("how").innerHTML=l.how;$("about").innerHTML=l.about+(MODE==="gs"?l.aboutGs:"");$("listTitle").textContent=l.listTitle(IDS.length);$("statsTitle").textContent=l.stTitle;
  $("lEn").setAttribute("aria-pressed",LANG==="en");$("lRu").setAttribute("aria-pressed",LANG==="ru");$("lKk").setAttribute("aria-pressed",LANG==="kk");
  const ccs=[...new Set(IDS.map(i=>R[i].cc))];
  $("divs").innerHTML=ccs.map(cc=>{const ids=IDS.filter(i=>R[i].cc===cc).sort((a,b)=>nm(a).localeCompare(nm(b),LANG));
    return `<details><summary><span>${l.C[cc]}</span><small>${l.regions(ids.length)}</small></summary><div class="divtable"><table><thead><tr><th>${l.thR}</th><th>${l.thL}</th><th>${l.thC}</th><th>ISO</th></tr></thead><tbody>${ids.map(id=>`<tr><td>${esc(nm(id))}</td><td class="l">${esc(META[id].local)}</td><td class="l">${META[id].cap?esc(META[id].cap[LI[LANG]]):"—"}</td><td class="l">${id==="TM-AR"?"—":id}</td></tr>`).join("")}</tbody></table></div></details>`}).join("");
  if(G)render()}
function setLang(x){LANG=x;savePrefs();applyLang();msg("")}
function savePrefs(){store.set("sbs-prefs",{lang:LANG,labels:$("tLabels").checked,facts:$("tFacts").checked})}

// ---- secret Great Steppe map: tap "by" five times, or open the page with #greatsteppe ----
let taps=[];
function secretTap(){const now=Date.now();taps=taps.filter(t=>now-t<2500);taps.push(now);if(taps.length>=5){taps=[];switchMap(MODE==="gs"?"core":"gs")}}
function switchMap(mode){useMap(mode);store.set("sbs-map",mode);
  try{history.replaceState(null,"",mode==="gs"?"#greatsteppe":location.pathname+location.search)}catch(e){}
  applyLang();newGame("daily");if(mode==="gs")msg(L().gsOn)}
$("gsBadge").onclick=()=>switchMap("core");

// ---- input / suggestions ----
const inp=$("guess"),sug=$("sugg");let items=[],sel=0,navd=false;
// Typing a country (or its people: "Kazakh", "узбек", "қазақ") lists all of its regions.
const CTRY_WORDS={KZ:["kazakh","kazak","казах","қазақ"],KG:["kyrgyz","kirghiz","кыргыз","киргиз","қырғыз"],TJ:["tajik","таджик","тәжік"],
  TM:["turkmen","туркмен","түрікмен"],UZ:["uzbek","узбек","өзбек"],RU:["russia","росси","ресей"],CN:["china","chinese","китай","қытай"],MN:["mongolia","монголи","моңғолия"]};
let sugCountry=null;
function countryOf(q){const nq=norm(q);if(nq.length<3)return null;
  for(const cc of new Set(IDS.map(i=>R[i].cc))){const keys=[...LANGS.map(l=>T[l].C[cc]),...(CTRY_WORDS[cc]||[])].map(norm);
    if(keys.some(k=>k.startsWith(nq)||nq.startsWith(k)&&nq.length<=k.length+4))return cc}
  return null}
function search(q,all){const nq=norm(q),n2=norm(q.replace(STRIP," "));sugCountry=null;if(!nq)return[];
  const out=[];for(const id of IDS){let best=9;for(const k of KEYS[id])for(const t of [nq,n2]){if(!t)continue;
    if(k===t)best=Math.min(best,0);else if(k.startsWith(t))best=Math.min(best,1);else if(k.includes(t))best=Math.min(best,3)}
    if(best<9)out.push([best,id])}
  out.sort((a,b)=>a[0]-b[0]||nm(a[1]).length-nm(b[1]).length||nm(a[1]).localeCompare(nm(b[1])));
  let ids=out.slice(0,8).map(x=>x[1]);
  const cc=all===false?null:countryOf(q);
  if(cc){const rest=IDS.filter(i=>R[i].cc===cc&&!ids.includes(i)).sort((a,b)=>nm(a).localeCompare(nm(b),LANG));
    ids=ids.filter(i=>R[i].cc!==cc||out.find(x=>x[1]===i)[0]===0);sugCountry={cc,at:ids.length};ids=[...ids,...rest.filter(i=>!ids.includes(i))]}
  return ids}
function closeSugg(){sug.hidden=true;items=[]}
function showSugg(){items=search(inp.value);sel=0;navd=false;if(!items.length||!inp.value.trim()){closeSugg();return}
  const used=new Set([G.start,G.end,...G.guesses]);
  sug.innerHTML=items.map((id,i)=>(sugCountry&&i===sugCountry.at?`<li class="hd" role="presentation">${esc(L().C[sugCountry.cc])} · ${L().regions(IDS.filter(x=>R[x].cc===sugCountry.cc).length)}</li>`:"")+
    `<li role="option" data-id="${id}" aria-selected="${i===sel}"${used.has(id)?' class="used"':""}><span>${esc(nm(id))}</span><span class="loc">${esc(META[id].local)} · ${L().C[R[id].cc]}</span></li>`).join("");
  sug.hidden=false;sug.scrollTop=0}
function mark(){sug.querySelectorAll("li[data-id]").forEach((li,i)=>li.setAttribute("aria-selected",i===sel));sug.querySelectorAll("li[data-id]")[sel]?.scrollIntoView({block:"nearest"})}
inp.addEventListener("input",showSugg);
inp.addEventListener("keydown",e=>{if(sug.hidden)return;if(e.key==="ArrowDown"){navd=true;sel=(sel+1)%items.length;mark();e.preventDefault()}else if(e.key==="ArrowUp"){navd=true;sel=(sel-1+items.length)%items.length;mark();e.preventDefault()}else if(e.key==="Escape")closeSugg()});
sug.addEventListener("pointerdown",e=>{e.preventDefault();const li=e.target.closest("li[data-id]");if(li)submit(li.dataset.id)});
inp.addEventListener("blur",()=>setTimeout(closeSugg,150));
function submit(id){if(!id){const q=inp.value.trim();if(!q)return;if(sugCountry&&sugCountry.at===0&&!navd&&items.length){msg(L().pick,true);return}const r=search(q,false);if(!r.length&&!items.length){msg(L().unknown(q),true);return}id=items.length?items[sel]:r[0]}
  inp.value="";closeSugg();guess(id);if(!G.done&&!matchMedia("(pointer: coarse)").matches)inp.focus()}
$("form").addEventListener("submit",e=>{e.preventDefault();submit(null)});
$("hint").onclick=hint;$("giveup").onclick=giveUp;
$("bordersBtn").onclick=()=>{if(G.done||G.borders)return;G.borders=true;msg(L().bordersMsg);save();render()};
$("mDaily").onclick=()=>newGame("daily");$("mPractice").onclick=()=>newGame("practice");
$("lEn").onclick=()=>setLang("en");$("lRu").onclick=()=>setLang("ru");$("lKk").onclick=()=>setLang("kk");
$("next").onclick=$("next2").onclick=()=>newGame("practice");
$("seeMap").onclick=()=>{overlayOpen=false;render()};
$("showRes").onclick=()=>{overlayOpen=true;render();$("mapbox").scrollIntoView({block:"start"})};
$("guesses").addEventListener("click",e=>{const li=e.target.closest("li[data-id]");if(li)showFact(li.dataset.id)});
$("copy").onclick=()=>{const t=$("rShare").textContent;const done=()=>{$("copy").textContent=L().copied;setTimeout(()=>$("copy").textContent=L().copy,1600)};
  try{navigator.clipboard.writeText(t).then(done,selectShare)}catch(e){selectShare()}};
function selectShare(){const r=document.createRange();r.selectNodeContents($("rShare"));const s=getSelection();s.removeAllRanges();s.addRange(r);msg(L().selCopy)}
const prefs=store.get("sbs-prefs")||{};if(prefs.labels===false)$("tLabels").checked=false;if(prefs.facts===false)$("tFacts").checked=false;
$("tLabels").onchange=()=>{savePrefs();render()};$("tFacts").onchange=savePrefs;
addEventListener("hashchange",()=>{const want=/^#(greatsteppe|gs)$/i.test(location.hash)?"gs":null;if(want&&MODE!=="gs")switchMap("gs")});

function start(data){
  const hashGs=/^#(greatsteppe|gs)$/i.test(location.hash);
  useMap(data&&data.MODE?data.MODE:hashGs||store.get("sbs-map")==="gs"?"gs":"core");
  applyLang();
  if(data&&data.G&&valid(data.G)){G=data.G;overlayOpen=!!data.overlayOpen;render();fitTo([G.start,G.end,...G.guesses])}else newGame("daily")}
window.claude?.hot?.snapshot?.(()=>({G,overlayOpen,MODE}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
})();
