(function () {
  const story = document.getElementById('section-story');
  if (!story || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

gsap.registerPlugin(ScrollTrigger);

/* 真實 OSM 文化路 SVG：保留 v05 道路及診所投影，簡化細路 */
const svg=document.querySelector("#cultureSvg");
const geoPins=gsap.utils.toArray(".geo-pin");
const sortedPins=[...geoPins].sort((a,b)=>{
 const ma=(a.getAttribute("transform")||"").match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
 const mb=(b.getAttribute("transform")||"").match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
 const xa=ma?+ma[1]:0, ya=ma?+ma[2]:0;
 const xb=mb?+mb[1]:0, yb=mb?+mb[2]:0;
 return (ya-yb)||(xb-xa);
});

/* Scene 04 uses the previously approved phone-scroll concept, with denser floating cards. */
const pinSvg='<svg viewBox="0 0 52 48"><path d="M3 20 26 3 49 20V44H3Z" fill="#fff" stroke="#17191d" stroke-width="3.2" stroke-linejoin="round"/><path d="M26 15v17M17.5 23.5h17" stroke="#f45500" stroke-width="6"/></svg>';
const handoff=document.querySelector('#handoffPins');
const pts=[[15,19],[25,31],[40,19],[57,26],[72,14],[84,30],[16,47],[34,54],[49,45],[69,52],[86,64],[20,76],[40,78],[57,70],[76,84],[33,13],[90,14],[10,65],[62,10],[52,90]];
pts.forEach(([x,y])=>{let e=document.createElement('div');e.className='pin';e.style.left=x+'%';e.style.top=y+'%';e.innerHTML=pinSvg;handoff.appendChild(e)});
const demoResults=document.querySelector('#demoResults');
const fakeNames=['文化路診所 A','板橋診所 B','文化路診所 C','板橋診所 D','文化路診所 E','板橋診所 F','文化路診所 G'];
fakeNames.forEach((name,i)=>{const el=document.createElement('div');el.className='demo-result';el.innerHTML=`<strong>${name}</strong><div class="stars">★★★★★ <span style="color:#17191d;font-size:12px">${(4.6+(i%4)*.1).toFixed(1)}</span></div><small>距離 ${350+i*150} 公尺 · 評價與評論</small><span class="book">立即預約</span>`;demoResults.appendChild(el)});
const burstHolder=document.querySelector('#burstCards');
const burstDefs=[['看距離','附近就有好多間診所'],['比星等','★★★★★　4.9'],['讀評論','「預約方便、服務親切」'],['線上預約','立即預約'],['搜尋結果','附近的診所越來越多'],['熱門推薦','★★★★★　4.8'],['看診時間','今天可以預約'],['比較選擇','距離、評價、評論'],['病患留言','「環境整潔、交通方便」'],['快速掛號','選擇時段'],['診所資訊','評價 4.7 · 評論'],['線上諮詢','查看更多資訊'],['搜尋附近','更多診所結果'],['評價比較','★★★★★　4.9']];
const bursts=[];
burstDefs.forEach((d,i)=>{let el=document.createElement('div');el.className='burst';el.innerHTML=`<strong>${d[0]}</strong><p>${d[1]}</p>`;const spots=[[3,12],[56,7],[5,33],[60,28],[2,55],[55,50],[10,75],[62,73],[22,8],[43,84],[71,14],[3,86],[48,39],[67,61]];el.style.left=spots[i][0]+'%';el.style.top=spots[i][1]+'%';el.style.transform=`translateY(95px) rotate(${i%2?6:-6}deg)`;burstHolder.appendChild(el);bursts.push(el)});
gsap.set(["#s1","#s2","#mapWorld","#searchScene","#endingScene","#approvedTaiwanScene"],{opacity:0});
gsap.set("#approvedTaiwanScene",{visibility:"hidden"});
gsap.set("#s1",{opacity:0,visibility:"hidden"});

const count={v:19861};
const growthPins=[...document.querySelectorAll("#approvedTaiwanScene .locked-pin")];
const growthCount=document.querySelector("#growthCounter");
const growthPlus=document.querySelector("#growthPlus");
function renderGrowth(v){
  const p=Math.max(0,Math.min(1,(v-19861)/(23000-19861)));
  growthCount.textContent=Math.round(v).toLocaleString("en-US");
  growthPlus.textContent=p>=.999?"+":"";
  growthPins.forEach((el,i)=>{
    const start=.025+(i/growthPins.length)*.86;
    const t=Math.max(0,Math.min(1,(p-start)/.09));
    // opacity:0 alone can leave SVG image compositor artifacts in Chrome.
    // Fully remove unrevealed icons from painting, including during scrub reverse.
    el.style.visibility = t <= 0.001 ? "hidden" : "visible";
    el.style.opacity=String(t);
    el.style.filter = t <= 0.001 ? "none" : "drop-shadow(1px 1px 0 #17191d)";
    el.style.transform=`translate(-50%,-50%) scale(${.82+.18*t})`;
  });
}
renderGrowth(19861);

/* 01 文化路：v06 跟路。鏡頭中心貼在文化路座標上，由華江橋（東北）往西南，不把路帶出畫面。 */
const ROAD=[
  [1042,180],
  [1008,188],
  [997,197],
  [972,241],
  [949,266],
  [926,291],
  [903,329],
  [880,380],
  [846,426],
  [813,473],
  [788,506]
];
const lerp=(a,b,p)=>a+(b-a)*p;
function roadAt(t){
  const n=ROAD.length-1;
  const u=Math.max(0,Math.min(1,t))*n;
  const i=Math.min(n-1,Math.floor(u));
  const p=u-i;
  return {x:lerp(ROAD[i][0],ROAD[i+1][0],p),y:lerp(ROAD[i][1],ROAD[i+1][1],p)};
}
const drive={t:0};
function applyDrive(){
  if(!svg) return;
  const mobile=window.matchMedia("(max-width: 760px)").matches;
  const r=roadAt(drive.t);
  const w=lerp(mobile?260:300, mobile?390:430, drive.t);
  const h=mobile?w*1.32:w;
  /* 鏡頭略偏東北，讓文化路前方佔畫面左下、華江橋在右上，避免路被帶出畫面。 */
  const x=r.x+14;
  const y=r.y-18;
  svg.setAttribute("viewBox",`${x-w/2} ${y-h/2} ${w} ${h}`);
  const reveal=Math.max(0,(drive.t-0.08)/0.92);
  const n=Math.min(sortedPins.length,Math.floor(Math.pow(reveal,.85)*sortedPins.length));
  sortedPins.forEach((el,i)=>{el.style.opacity=i<n?"1":"0";});
}
gsap.set(sortedPins,{opacity:0});
applyDrive();

const tl=gsap.timeline({
 defaults:{ease:"none"},
 scrollTrigger:{
   trigger:"#section-story",
   start:"top top",
   end:"+=4200",
   pin:true,
   pinSpacing:true,
   scrub:0.25,
   anticipatePin:1,
   invalidateOnRefresh:true,
   onUpdate:self=>gsap.set("#progress",{width:(self.progress*100)+"%"}),
   onRefresh:()=>applyDrive()
 }
});

tl.to("#mapWorld",{opacity:1,duration:.16})
  .to({}, {duration:.36})
  .set("#s1",{visibility:"visible"})
  .fromTo("#s1",{opacity:0,y:12},{opacity:1,y:0,duration:.2})
  .to(drive,{t:.4,duration:1.2,onUpdate:applyDrive,ease:"none"})
  .to("#s1",{opacity:0,y:-8,duration:.12}).set("#s1",{visibility:"hidden"})
  .set("#s2",{visibility:"visible"}).fromTo("#s2",{opacity:0,y:8},{opacity:1,y:0,duration:.12},"<")
  .to(drive,{t:1,duration:1.5,onUpdate:applyDrive,ease:"none"},"<")
  .to({}, {duration:.32})
  /* 分鏡 3：50 步黑卡；地圖停在最密路段後被蓋住。 */
  .to("#bridgeBlack",{opacity:1,duration:.16})
  .to({}, {duration:.48})
  .to("#mapWorld",{opacity:0,duration:.18})
  .to("#s2",{opacity:0,duration:.16},"<")
  /* 03 唯一的台灣圖層：鎖定麥克筆地圖與 Clinic2，同一坐標系。 */
  .call(()=>renderGrowth(count.v))
  .fromTo("#approvedTaiwanScene",{opacity:0,visibility:"hidden"},{opacity:1,visibility:"visible",duration:.26})
  .to("#bridgeBlack",{opacity:0,duration:.24},"<")
  .to(count,{v:23000,duration:.56,onUpdate:()=>renderGrowth(count.v)})
  .to({}, {duration:.36})
  /* 04 單一診所圖示語言接往手機搜尋，沒有舊版線條台灣地圖。 */
  .to("#approvedTaiwanScene",{opacity:0,duration:.30})
  .set("#approvedTaiwanScene",{visibility:"hidden"})
  .to("#searchScene",{opacity:1,duration:.30},"<")
  .fromTo("#handoffPins",{opacity:0,scale:1.15},{opacity:1,scale:1,duration:.24},"<")
  .to("#handoffPins",{opacity:0,scale:.58,x:90,y:20,duration:.38})
  .fromTo("#demoPhone",{opacity:0,scale:.78},{opacity:1,scale:1,duration:.42},"-=.30")
  .to("#demoResults",{y:-310,duration:.65})
  .to("#demoResults",{y:-480,duration:.58})
  .to(bursts,{opacity:1,y:0,rotation:(i)=>((i%5)-2)*3,stagger:.045,duration:.26},"-=.33")
  .to(bursts,{x:(i)=>((i%4)-1.5)*13,y:(i)=>((i%3)-1)*11,stagger:.022,duration:.30})
  .to({}, {duration:.28})

  /* Ending: transition line then mandatory editorial question. */
  .set("#endingScene",{visibility:"visible"})
  .to("#endingScene",{opacity:1,duration:.20})
  .fromTo("#endingPre",{opacity:0,y:18},{opacity:1,y:0,duration:.33})
  .to({}, {duration:.34})
  .to("#endingPre",{opacity:0,y:-20,duration:.22})
  .fromTo(".ending-lead",{opacity:0,y:22},{opacity:1,y:0,duration:.28})
  .fromTo(".ending-question",{opacity:0,scale:.4,filter:"blur(6px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:.52,ease:"power3.out"},"-=.03")
  .to({}, {duration:.75});

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
