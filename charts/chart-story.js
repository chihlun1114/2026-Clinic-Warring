(function () {
  const story = document.getElementById('section-story');
  if (!story || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

gsap.registerPlugin(ScrollTrigger);

/* 真實 OSM 文化路 SVG：保留 v05 道路及診所投影，簡化細路 */
const svg=document.querySelector("#cultureSvg");
const geoPins=gsap.utils.toArray(".geo-pin");
const sortedPins=[...geoPins].sort((a,b)=>{
 const ya=+(a.getAttribute("transform").match(/translate\([^ ]+ ([0-9.]+)/)?.[1]||0);
 const yb=+(b.getAttribute("transform").match(/translate\([^ ]+ ([0-9.]+)/)?.[1]||0);
 return ya-yb;
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
const copyHeadline=document.querySelector('#searchHeadline'),copyDetail=document.querySelector('#searchDetail');
const sceneCopy=[['找診所，<br>先搜尋。','附近的診所一間接著一間出現。'],['找診所，<br>愈來愈像找餐廳。','看距離、比星等、讀評論，最後按下預約。']];
function setSceneCopy(i){copyHeadline.innerHTML=sceneCopy[i][0];copyDetail.textContent=sceneCopy[i][1]}
gsap.set(["#s1","#s2","#mapWorld","#searchScene","#endingScene","#approvedTaiwanScene"],{opacity:0});
gsap.set("#s1",{opacity:1,visibility:"visible"});

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
    el.style.transform=`translate(-50%,-50%) scale(${.82+.18*t})`;
  });
}
renderGrowth(19861);

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
   onUpdate:self=>gsap.set("#progress",{width:(self.progress*100)+"%"})
 }
});

/* 01 文化路：鏡頭行進 → 定點停住 → 90 個 PIN 累積；絕不拉遠。 */
const originalViewBox=svg.getAttribute("viewBox").split(/[ ,]+/).map(Number);
const [vx,vy,vw,vh]=originalViewBox;
const camera={x:vx+vw*.58,y:vy+vh*.22,w:vw*.43,h:vh*.43};
function updateCamera(){svg.setAttribute("viewBox",`${camera.x-camera.w/2} ${camera.y-camera.h/2} ${camera.w} ${camera.h}`)}
updateCamera();
gsap.set(sortedPins,{opacity:0});
tl.to("#mapWorld",{opacity:1,duration:.12})
  .to(camera,{x:910.11,y:323.27,w:405.41,h:261.56,duration:.65,onUpdate:updateCamera},"<")
  .to(sortedPins.slice(0,22),{opacity:1,stagger:.014,duration:.08},"<+=.12")
  .to("#s1",{opacity:0,y:-10,duration:.13}).set("#s1",{visibility:"hidden"})
  .set("#s2",{visibility:"visible"}).fromTo("#s2",{opacity:0,y:10},{opacity:1,y:0,duration:.15},"<")
  /* 鏡頭停止在文化路主視覺位置，剩餘 PIN 不再跟著畫面移出。 */
  .to(camera,{x:880.11,y:373.27,w:476.96,h:307.71,duration:.19,onUpdate:updateCamera},"<")
  .to(sortedPins.slice(22),{opacity:1,stagger:.018,duration:.08})
  .to({}, {duration:.42})
  /* 02 黑色轉場：35 公尺與 50 步集中於此，不再有橘色第三張文案。 */
  .to("#bridgeBlack",{opacity:1,duration:.18})
  .to({}, {duration:.48})
  .to("#mapWorld",{opacity:0,duration:.18})
  .to("#s2",{opacity:0,duration:.16},"<")
  /* 03 唯一的台灣圖層：鎖定麥克筆地圖與 Clinic2，同一坐標系。 */
  .call(()=>renderGrowth(count.v))
  .to("#approvedTaiwanScene",{opacity:1,duration:.26})
  .to("#bridgeBlack",{opacity:0,duration:.24},"<")
  .to(count,{v:23000,duration:.56,onUpdate:()=>renderGrowth(count.v)})
  .to({}, {duration:.36})
  /* 04 單一診所圖示語言接往手機搜尋，沒有舊版線條台灣地圖。 */
  .to("#approvedTaiwanScene",{opacity:0,duration:.30})
  .to("#searchScene",{opacity:1,duration:.30},"<")
  .fromTo("#handoffPins",{opacity:0,scale:1.15},{opacity:1,scale:1,duration:.24},"<")
  .to("#handoffPins",{opacity:0,scale:.58,x:90,y:20,duration:.38})
  .fromTo("#demoPhone",{opacity:0,scale:.78},{opacity:1,scale:1,duration:.42},"-=.30")
  .call(()=>setSceneCopy(0))
  .to("#demoResults",{y:-310,duration:.65})
  .call(()=>setSceneCopy(1))
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
