"use client";
import { useState, useEffect, useRef } from "react";

// ── Particle field ────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = window.innerWidth, h = canvas.height = window.innerHeight;
    const pts = Array.from({length:80}, () => ({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3,
      r:Math.random()*1.5+.4,
      color:["#7c6af7","#34d399","#f59e0b","#f472b6","#06b6d4"][Math.floor(Math.random()*5)],
      o:Math.random()*.5+.1,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0,0,w,h);
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.color; ctx.globalAlpha=p.o; ctx.fill();
      });
      ctx.globalAlpha=1;
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<120){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle="#7c6af7";ctx.globalAlpha=(1-d/120)*.08;ctx.lineWidth=.5;ctx.stroke();}
      }
      ctx.globalAlpha=1; raf=requestAnimationFrame(draw);
    }
    draw();
    const onResize=()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;};
    window.addEventListener("resize",onResize);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onResize);};
  },[]);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}/>;
}

// ── Typewriter ────────────────────────────────────────────────────────────
function TypeWriter({texts,speed=60}) {
  const [display,setDisplay]=useState(""); const [ti,setTi]=useState(0);
  const [ci,setCi]=useState(0); const [del,setDel]=useState(false);
  useEffect(()=>{
    const cur=texts[ti];
    const t=setTimeout(()=>{
      if(!del){if(ci<cur.length){setDisplay(cur.slice(0,ci+1));setCi(ci+1);}else setTimeout(()=>setDel(true),1800);}
      else{if(ci>0){setDisplay(cur.slice(0,ci-1));setCi(ci-1);}else{setDel(false);setTi((ti+1)%texts.length);}}
    },del?speed/2:speed);
    return ()=>clearTimeout(t);
  },[ci,del,ti,texts,speed]);
  return <span>{display}<span style={{animation:"blink 1s step-end infinite",borderRight:"2px solid #7c6af7",marginLeft:2}}>&nbsp;</span></span>;
}

// ── Counter ───────────────────────────────────────────────────────────────
function Counter({target,suffix="",duration=1800}) {
  const [val,setVal]=useState(0); const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        const s=Date.now();
        const tick=()=>{const p=Math.min((Date.now()-s)/duration,1);setVal(Math.round((1-Math.pow(1-p,3))*target));if(p<1)requestAnimationFrame(tick);};
        requestAnimationFrame(tick); obs.disconnect();
      }
    },{threshold:.5});
    if(ref.current)obs.observe(ref.current); return ()=>obs.disconnect();
  },[target,duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── SVG Icons ─────────────────────────────────────────────────────────────
const Ico = {
  arrow: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (c) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill={c} opacity="0.2"/><path d="M5 8.5L7 10.5L11 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  dot: (c) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={c} opacity="0.2"/><path d="M4.5 7.5L6 9L9.5 5.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  keyboard: (c) => <svg width="36" height="36" viewBox="0 0 48 48" fill="none"><rect x="4" y="14" width="40" height="26" rx="5" stroke={c} strokeWidth="2" fillOpacity="0"/>{[8,15,22,29,36].map(x=><rect key={x} x={x} y="18" width="5" height="5" rx="1.5" fill={c} opacity="0.7"/>)}{[10,17.5,25,32.5].map(x=><rect key={x} x={x} y="25" width="5" height="5" rx="1.5" fill={c} opacity="0.5"/>)}<rect x="16" y="32" width="16" height="5" rx="2" fill={c} opacity="0.7"/></svg>,
  trivia: (c) => <svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke={c} strokeWidth="2" fillOpacity="0"/><path d="M18 18C18 14.7 20.7 12 24 12C27.3 12 30 14.7 30 18C30 21 27 22.5 24 24V26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/><circle cx="24" cy="32" r="2" fill={c}/></svg>,
  play: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="3,2 11,7 3,12" fill="currentColor" opacity="0.9"/></svg>,
  github: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  bolt: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  globe: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  tqak: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="1" y="5" width="16" height="16" rx="4" fill="#7c6af7" opacity="0.9"/><rect x="11" y="9" width="16" height="16" rx="4" fill="#f59e0b" opacity="0.85"/><rect x="5" y="10" width="6" height="1.5" rx=".75" fill="#fff" opacity="0.5"/><rect x="5" y="13" width="4" height="1.5" rx=".75" fill="#fff" opacity="0.35"/></svg>,
};

// ── Reveal hook ───────────────────────────────────────────────────────────
function useReveal() {
  const ref=useRef(null); const [vis,setVis]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold:.1});
    if(ref.current)obs.observe(ref.current); return ()=>obs.disconnect();
  },[]);
  return [ref,vis];
}

// ── SVG Button ────────────────────────────────────────────────────────────
function SvgBtn({href,onClick,color,bg,border,children,icon,size="md",external}) {
  const pad = size==="sm" ? "6px 14px" : size==="lg" ? "14px 32px" : "10px 22px";
  const fs  = size==="sm" ? 12 : size==="lg" ? 16 : 14;
  const s = {
    display:"inline-flex",alignItems:"center",gap:8,
    padding:pad, borderRadius:10, border:`1px solid ${border||color+"44"}`,
    background:bg||color+"22", color, fontSize:fs, fontWeight:700,
    textDecoration:"none", cursor:"pointer", transition:"all 0.18s",
    fontFamily:"inherit",
  };
  const hoverIn  = e=>{e.currentTarget.style.background=color+"33";e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 8px 24px ${color}33`;};
  const hoverOut = e=>{e.currentTarget.style.background=bg||color+"22";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";};
  if(href) return <a href={href} target={external?"_blank":undefined} rel={external?"noopener noreferrer":undefined} style={s} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>{icon}{children}{Ico.arrow}</a>;
  return <button onClick={onClick} style={s} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>{icon}{children}</button>;
}

// ── App card ─────────────────────────────────────────────────────────────
function AppCard({name,tag,tagColor,url,description,stats,features,accentColor,assets}) {
  const [ref,vis]=useReveal();
  const [showFrame,setShowFrame]=useState(false);
  const [loaded,setLoaded]=useState(false);
  return (
    <div ref={ref} style={{display:"flex",flexDirection:"column",gap:40,padding:"80px 0",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(48px)",transition:"opacity .8s ease,transform .8s ease"}}>
      {/* Info */}
      <div>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:20}}>
          <span style={{background:tagColor+"22",color:tagColor,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",padding:"4px 12px",borderRadius:99,border:`1px solid ${tagColor}44`}}>{tag}</span>
        </div>
        <h2 style={{fontSize:"clamp(32px,5vw,52px)",fontWeight:900,margin:"0 0 16px",lineHeight:1.1,color:"#fff"}}>{name}</h2>
        <p style={{fontSize:16,color:"#aaa",lineHeight:1.7,margin:"0 0 28px",maxWidth:480}}>{description}</p>

        {/* Stats */}
        <div style={{display:"flex",gap:24,marginBottom:32,flexWrap:"wrap"}}>
          {stats.map(s=>(
            <div key={s.label}>
              <div style={{fontSize:28,fontWeight:900,color:accentColor,fontFamily:"'JetBrains Mono',monospace"}}><Counter target={s.value} suffix={s.suffix||""}/></div>
              <div style={{fontSize:11,color:"#666",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:36}}>
          {features.map(f=>(
            <div key={f} style={{display:"flex",alignItems:"flex-start",gap:10}}>
              {Ico.check(accentColor)}
              <span style={{fontSize:14,color:"#ccc",lineHeight:1.5}}>{f}</span>
            </div>
          ))}
        </div>

        <SvgBtn href={url} external color={accentColor} bg={`linear-gradient(135deg,${accentColor},${accentColor}bb)`} border="transparent" size="lg" icon={name==="AccuratKey"?Ico.keyboard(accentColor):Ico.trivia(accentColor)}>
          <span style={{color:"#fff"}}>Open {name}</span>
        </SvgBtn>
      </div>

      {/* Assets showcase */}
      {assets && (
        <div style={{background:"#0a0a14",border:`1px solid ${accentColor}22`,borderRadius:16,padding:"28px 24px"}}>
          <div style={{fontSize:11,color:accentColor,letterSpacing:2,textTransform:"uppercase",fontWeight:700,marginBottom:20,fontFamily:"'JetBrains Mono',monospace"}}>Assets & Components</div>
          {assets}
        </div>
      )}

      {/* Live embed */}
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:-24,borderRadius:24,background:`radial-gradient(ellipse at center,${accentColor}18 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{borderRadius:16,overflow:"hidden",border:`1px solid ${accentColor}33`,boxShadow:`0 0 0 1px ${accentColor}22,0 24px 80px #00000088`,background:"#0d0d1a",position:"relative",height:520}}>
          {/* Browser chrome */}
          <div style={{height:36,background:"#111120",borderBottom:`1px solid ${accentColor}22`,display:"flex",alignItems:"center",padding:"0 14px",gap:8}}>
            <div style={{display:"flex",gap:5}}>{["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c,opacity:.8}}/>)}</div>
            <div style={{flex:1,background:"#1a1a2e",borderRadius:6,height:22,display:"flex",alignItems:"center",padding:"0 10px",fontSize:11,color:"#555",fontFamily:"monospace"}}>{url.replace("https://","")}</div>
          </div>
          {showFrame ? (
            <div style={{position:"relative",height:"calc(100% - 36px)"}}>
              {!loaded&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#0d0d1a"}}><div style={{width:32,height:32,border:`3px solid ${accentColor}44`,borderTopColor:accentColor,borderRadius:"50%",animation:"spin .8s linear infinite"}}/></div>}
              <iframe src={url+"?embed=1"} style={{width:"100%",height:"100%",border:"none",display:"block"}} onLoad={()=>setLoaded(true)} title={name}/>
            </div>
          ) : (
            <div style={{height:"calc(100% - 36px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,background:`linear-gradient(160deg,#0d0d1a 0%,${accentColor}08 100%)`,cursor:"pointer"}} onClick={()=>setShowFrame(true)}>
              <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${accentColor}33,${accentColor}11)`,border:`2px solid ${accentColor}44`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {name==="AccuratKey"?Ico.keyboard(accentColor):Ico.trivia(accentColor)}
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#fff",fontWeight:700,fontSize:14}}>Click to preview</div>
                <div style={{color:"#555",fontSize:12,marginTop:4}}>Live embed</div>
              </div>
              <SvgBtn onClick={()=>setShowFrame(true)} color={accentColor} icon={Ico.play}>Load preview</SvgBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AccuratKey assets ─────────────────────────────────────────────────────
const AK_SECTIONS = [
  {label:"Foundations",color:"#10b981",icon:"F",lv:"1-15"},
  {label:"Precision Flow",color:"#818cf8",icon:"P",lv:"16-30"},
  {label:"Word Power",color:"#f59e0b",icon:"W",lv:"31-45"},
  {label:"Keyboard Mastery",color:"#06b6d4",icon:"K",lv:"46-60"},
  {label:"Speed Surge",color:"#facc15",icon:"S",lv:"61-75"},
  {label:"Free Run",color:"#ec4899",icon:"R",lv:"76-99"},
  {label:"Century Club",color:"#ef4444",icon:"C",lv:"100-115"},
  {label:"Endurance",color:"#a855f7",icon:"E",lv:"116-130"},
  {label:"Literature",color:"#fbbf24",icon:"L",lv:"131-145"},
  {label:"Machine Mode",color:"#f97316",icon:"M",lv:"146-155"},
  {label:"Legend Tier",color:"#dc2626",icon:"X",lv:"156-165"},
];
const AK_TABS = [
  {label:"Games",icon:<svg width="20" height="20" viewBox="0 0 40 40" fill="none"><ellipse cx="20" cy="32" rx="13" ry="5" stroke="currentColor" strokeWidth="1.6" opacity=".6"/><rect x="18" y="16" width="4" height="16" rx="2" fill="currentColor" opacity=".7"/><circle cx="20" cy="13" r="6" fill="currentColor" opacity=".85"/><circle cx="7" cy="24" r="4" fill="currentColor" opacity=".6"/><circle cx="33" cy="24" r="4" fill="currentColor" opacity=".6"/></svg>},
  {label:"Map",icon:<svg width="20" height="20" viewBox="0 0 40 40" fill="none"><path d="M12 34 Q8 26 20 22 Q32 18 28 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity=".7"/><circle cx="12" cy="34" r="4" fill="currentColor" opacity=".8"/><circle cx="20" cy="22" r="3.5" fill="currentColor" opacity=".6"/><circle cx="28" cy="10" r="4" fill="currentColor" opacity=".9"/><line x1="28" y1="6" x2="28" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/><path d="M28 2 L35 4 L28 6 Z" fill="currentColor" opacity=".8"/></svg>},
  {label:"Daily",icon:<svg width="20" height="20" viewBox="0 0 40 40" fill="none"><rect x="5" y="8" width="30" height="28" rx="4" stroke="currentColor" strokeWidth="1.8" opacity=".7" fillOpacity=".08" fill="currentColor"/><rect x="5" y="8" width="30" height="8" rx="4" fill="currentColor" opacity=".2"/><rect x="13" y="5" width="3" height="7" rx="1.5" fill="currentColor" opacity=".7"/><rect x="24" y="5" width="3" height="7" rx="1.5" fill="currentColor" opacity=".7"/>{[0,1,2,3].map(c=>[0,1,2].map(r=><circle key={`${c}${r}`} cx={11+c*6} cy={22+r*5} r={c===1&&r===1?2.5:1.5} fill="currentColor" opacity={c===1&&r===1?.9:.3}/>))}</svg>},
  {label:"Test",icon:<svg width="20" height="20" viewBox="0 0 40 40" fill="none"><rect x="3" y="10" width="34" height="22" rx="4" stroke="currentColor" strokeWidth="1.8" opacity=".7" fillOpacity=".08" fill="currentColor"/>{[7,12,17,22,27].map(x=><rect key={x} x={x} y="14" width="4" height="4" rx="1.2" fill="currentColor" opacity=".5"/>)}<rect x="11" y="26" width="18" height="4" rx="2" fill="currentColor" opacity=".6"/></svg>},
];
const AK_NODE_STATES = [
  {label:"Completed",color:"#10b981",completed:true},
  {label:"Current",color:"#7c6af7",current:true},
  {label:"Unlocked",color:"#f59e0b"},
  {label:"Locked",color:"#2a2a3e",locked:true},
];

// ── TrivQuic assets ───────────────────────────────────────────────────────
const TQ_EFFECTS = [
  {name:"wave",color:"#06b6d4",css:s=>`@keyframes __wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} ${s}{animation:__wave .5s ease-in-out infinite!important;}`},
  {name:"shake",color:"#ef4444",css:s=>`@keyframes __shake{0%,100%{transform:translate(0)}25%{transform:translate(-8px,4px)}50%{transform:translate(8px,-4px)}75%{transform:translate(-6px,6px)}} ${s}{animation:__shake .1s infinite;}`},
  {name:"spin",color:"#a855f7",css:s=>`@keyframes __spin2{from{transform:rotate(0)}to{transform:rotate(360deg)}} ${s}{animation:__spin2 3s linear;}`},
  {name:"explode",color:"#f97316",css:s=>`@keyframes __explode{0%{transform:scale(1);opacity:1}100%{transform:scale(3);opacity:0}} ${s}{animation:__explode 2s ease-in forwards!important;}`},
  {name:"implode",color:"#8b5cf6",css:s=>`@keyframes __implode{0%{transform:scale(1);opacity:1}100%{transform:scale(0);opacity:0}} ${s}{animation:__implode 2s ease-in forwards!important;}`},
  {name:"melt",color:"#fbbf24",css:s=>`@keyframes __melt{0%{filter:none}100%{filter:blur(4px);transform:scaleY(1.3) translateY(10%);opacity:0}} ${s}{animation:__melt 4s ease-in forwards!important;}`},
  {name:"vhs",color:"#10b981",css:s=>`@keyframes __vhs{0%{transform:translateY(0)}50%{transform:translateY(2px)}100%{transform:translateY(-2px)}} ${s}{animation:__vhs .1s infinite;filter:contrast(1.2) brightness(.9) saturate(1.4);}`},
  {name:"pulse",color:"#f472b6",css:s=>`@keyframes __pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}} ${s}{animation:__pulse .6s ease-in-out infinite;}`},
  {name:"flip",color:"#38bdf8",css:s=>`@keyframes __flip{0%{transform:perspective(400px) rotateY(0)}50%{transform:perspective(400px) rotateY(180deg)}100%{transform:perspective(400px) rotateY(360deg)}} ${s}{animation:__flip 3s ease-in-out;}`},
  {name:"upsidedown",color:"#facc15",css:s=>`${s}{transform:rotate(180deg);}`},
  {name:"invert",color:"#e879f9",css:s=>`${s}{filter:invert(1);}`},
  {name:"neon",color:"#34d399",css:s=>`${s}{filter:drop-shadow(0 0 8px #0ff) drop-shadow(0 0 16px #f0f) saturate(2);}`},
  {name:"earthquake",color:"#f43f5e",css:s=>`@keyframes __quake{0%,100%{transform:translate(0,0)}25%{transform:translate(-8px,4px)}50%{transform:translate(8px,-4px)}75%{transform:translate(-4px,8px)}} ${s}{animation:__quake .1s infinite;}`},
  {name:"zoom",color:"#818cf8",css:s=>`@keyframes __zoom{0%{transform:scale(1)}100%{transform:scale(1.5)}} ${s}{animation:__zoom 3s ease-in forwards;}`},
];

// ── Changelog ─────────────────────────────────────────────────────────────
const CHANGELOG = [
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 28, 2026", items:["Fixed crash in admin analytics tab - failStats and failStatsLoading were used throughout via setFailSt"] },
  
  { app:"TrivQuic", tag:"trivquic", color:"#f59e0b", date:"Jun 27, 2026", items:["Added a Wrong Answers setting to Solo mode - Count (default, wrong answers reset streak and cost point"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 27, 2026", items:["Added Freestyle - genuinely open-ended creative writing, validated against the real rhyme dictionary"] },
  
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 27, 2026", items:["Added Wildcard Words - the randomness lives in the typing task itself"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 27, 2026", items:["Added Memory Edit - a genuinely different memory mechanic"] },
  
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Added Speed Surge II - a new 12th section, levels 171-180"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Fixed the changelog feed cutting off mid-sentence, removed an inaccurate Pomodoro mention from help docs"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Mini-games now have proper back-button support between the menu, settings, and gameplay"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Fixed the back button skipping past open menus like Friends and Challenges"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Restored the full Shop (Themes, Sounds, and Fonts) after an earlier accidental removal"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Added Word Bomb, a new game where you defuse a bomb before its fuse runs out"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Removed the Stars rating from the level-completion certificate"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 26, 2026", items:["Fixed the no-keyboard warning not re-appearing if your keyboard disconnects"] }
];

// ── Main ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [filter,setFilter]=useState("all");
  const [showAllChangelog,setShowAllChangelog]=useState(false);
  const [scrollY,setScrollY]=useState(0);
  useEffect(()=>{const f=()=>setScrollY(window.scrollY);window.addEventListener("scroll",f,{passive:true});return()=>window.removeEventListener("scroll",f);},[]);
  const filteredFull=filter==="all"?CHANGELOG:CHANGELOG.filter(e=>e.tag===filter);
  const filtered=showAllChangelog?filteredFull:filteredFull.slice(0,3);

  return (
    <>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-14px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #7c6af777}50%{box-shadow:0 0 24px #7c6af7cc,0 0 48px #7c6af744}}
        ::selection{background:#7c6af744;}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0a0a0f}::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:3px}
        html{scroll-behavior:smooth}
      `}</style>

      <ParticleField/>

      {/* Nav */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrollY>40?"#08080fdd":"transparent",backdropFilter:scrollY>40?"blur(16px)":"none",borderBottom:scrollY>40?"1px solid #1e1e3044":"none",transition:"all .3s",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 clamp(20px,5vw,80px)",height:64}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {Ico.tqak}
          <span style={{fontWeight:800,fontSize:16,color:"#fff",letterSpacing:.3}}>tqak</span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <SvgBtn href="https://accuratkey.vercel.app" external color="#a78bfa" size="sm">AccuratKey</SvgBtn>
          <SvgBtn href="https://trivquic.vercel.app" external color="#fbbf24" size="sm">TrivQuic</SvgBtn>
        </div>
      </nav>

      <main style={{position:"relative",zIndex:1}}>

        {/* Hero */}
        <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px clamp(20px,5vw,80px) 60px",textAlign:"center"}}>
          <div style={{position:"absolute",top:"20%",left:"15%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,#7c6af722 0%,transparent 70%)",pointerEvents:"none",animation:"float 8s ease-in-out infinite"}}/>
          <div style={{position:"absolute",top:"30%",right:"12%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,#f59e0b18 0%,transparent 70%)",pointerEvents:"none",animation:"float 10s ease-in-out infinite 2s"}}/>

          <div style={{marginBottom:20,display:"inline-flex",alignItems:"center",gap:8,background:"#1a1a2e",border:"1px solid #2a2a4e",borderRadius:99,padding:"6px 16px"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#34d399",boxShadow:"0 0 8px #34d399"}}/>
            <span style={{fontSize:12,color:"#888",fontWeight:600}}>tqak — two web apps by chris0622ha</span>
          </div>

          <h1 style={{fontSize:"clamp(42px,8vw,96px)",fontWeight:900,margin:"0 0 20px",lineHeight:1,letterSpacing:-2,background:"linear-gradient(135deg,#fff 30%,#a78bfa 60%,#f59e0b 90%)",backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundSize:"200% 200%",animation:"gradientShift 6s ease infinite"}}>
            Build your<br/>best skills
          </h1>

          <p style={{fontSize:"clamp(15px,2vw,20px)",color:"#888",maxWidth:560,margin:"0 0 12px",lineHeight:1.6}}>Two web apps — one for typing mastery, one for trivia.</p>
          <div style={{fontSize:"clamp(16px,2.5vw,22px)",color:"#bbb",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,minHeight:32}}>
            <TypeWriter texts={["165 levels of typing","38 trivia games","Track WPM and accuracy","One-tap trivia battles","Compete on leaderboards"]}/>
          </div>

          <div style={{display:"flex",gap:14,marginTop:40,flexWrap:"wrap",justifyContent:"center"}}>
            <SvgBtn href="#accuratkey" color="#a78bfa" bg="linear-gradient(135deg,#7c6af7,#a78bfa)" border="transparent" size="lg" icon={Ico.keyboard("#fff")}><span style={{color:"#fff"}}>AccuratKey</span></SvgBtn>
            <SvgBtn href="#trivquic" color="#111" bg="linear-gradient(135deg,#f59e0b,#fbbf24)" border="transparent" size="lg" icon={Ico.trivia("#111")}><span style={{color:"#111"}}>TrivQuic</span></SvgBtn>
          </div>

          <div style={{marginTop:80,display:"flex",flexDirection:"column",alignItems:"center",gap:8,opacity:.4}}>
            <span style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"#888"}}>Scroll</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none"><rect x="5" y="2" width="6" height="12" rx="3" stroke="#888" strokeWidth="1.5"/><circle cx="8" cy="7" r="1.5" fill="#888" style={{animation:"float 1.5s ease-in-out infinite"}}/></svg>
          </div>
        </section>

        {/* Stats bar */}
        <section style={{background:"linear-gradient(90deg,#0d0d1a,#12101f,#0d0d1a)",borderTop:"1px solid #1e1e30",borderBottom:"1px solid #1e1e30",padding:"40px clamp(20px,5vw,80px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:32}}>
          {[{n:165,s:"",l:"Typing Levels"},{n:38,s:"",l:"Trivia Games"},{n:10,s:"",l:"Keyboard Layouts"},{n:100,s:"%",l:"Free to Play"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:40,fontWeight:900,color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}><Counter target={s.n} suffix={s.s}/></div>
              <div style={{fontSize:12,color:"#555",textTransform:"uppercase",letterSpacing:1.5,marginTop:4}}>{s.l}</div>
            </div>
          ))}
        </section>

        {/* AccuratKey */}
        <section id="accuratkey" style={{padding:"0 clamp(20px,5vw,80px)",maxWidth:1280,margin:"0 auto"}}>
          <AppCard name="AccuratKey" tag="AccuratKey" tagColor="#7c6af7" url="https://accuratkey.vercel.app" accentColor="#7c6af7" side="left"
            description="A serious keyboard training app with 170 levels across 11 sections — from home-row basics to impossible long-word gauntlets. Multi-profile, WPM tracking, streak system, and daily challenges."
            stats={[{value:170,label:"Levels"},{value:10,label:"Layouts"},{value:11,label:"Sections"}]}
            features={["170 levels across Foundations, Word Power, Literature, Legend Tier and more","10 keyboard layouts including Colemak, Dvorak, QWERTZ, and Workman","Multi-profile system — one account, multiple family members","WPM personal bests, combo multipliers, and Keys currency","Section confetti and unlock animations when you reach new territory","Daily challenge with global leaderboard — new words every day"]}
          />
        </section>

        <div style={{height:1,background:"linear-gradient(90deg,transparent,#2a2a4e,transparent)",margin:"0 clamp(20px,5vw,80px)"}}/>

        {/* TrivQuic */}
        <section id="trivquic" style={{padding:"0 clamp(20px,5vw,80px)",maxWidth:1280,margin:"0 auto"}}>
          <AppCard name="TrivQuic" tag="TrivQuic" tagColor="#f59e0b" url="https://trivquic.vercel.app" accentColor="#f59e0b" side="right"
            description="A one-tap trivia app with 38 games across 10 categories. Answer fast, climb the leaderboard, and take on daily challenges — built for speed and competition."
            stats={[{value:38,label:"Games"},{value:10,label:"Categories"},{value:1,suffix:" tap",label:"to answer"}]}
            features={["38 trivia games across Science, History, Pop Culture, Geography and more","Google sign-in with per-UID stats saved in Firebase Firestore","Personal best tracking and profile page","Daily challenge — one new trivia set every day","Global leaderboard by username","Streak multipliers and score tracking"]}
          />
        </section>

        {/* Changelog */}
        <section style={{padding:"80px clamp(20px,5vw,80px)",maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:"#555",marginBottom:12}}>What's new</div>
            <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,margin:"0 0 12px",color:"#fff"}}>Changelog</h2>
            <p style={{color:"#666",fontSize:15}}>Updated every 2 additions across both apps</p>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
            {[["all","All"],["accuratkey","AccuratKey"],["trivquic","TrivQuic"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{padding:"7px 18px",borderRadius:99,border:`1px solid ${filter===v?"#7c6af7":"#1e1e30"}`,background:filter===v?"#7c6af722":"transparent",color:filter===v?"#a78bfa":"#666",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s",letterSpacing:.5}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:40}}>
            <button onClick={()=>setShowAllChangelog(s=>!s)} style={{padding:"6px 16px",borderRadius:99,border:"1px solid #1e1e30",background:"transparent",color:"#555",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .2s",letterSpacing:.5}}>
              {showAllChangelog?"Show Past 3":`Show All (${filteredFull.length})`}
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {filtered.map((e,i)=>(
              <div key={i} style={{background:"#0d0d1a",border:`1px solid ${e.color}33`,borderLeft:`3px solid ${e.color}`,borderRadius:12,padding:"20px 24px",transition:"transform .2s,box-shadow .2s"}} onMouseEnter={x=>{x.currentTarget.style.transform="translateX(4px)";x.currentTarget.style.boxShadow=`0 0 24px ${e.color}18`;}} onMouseLeave={x=>{x.currentTarget.style.transform="translateX(0)";x.currentTarget.style.boxShadow="none";}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{background:e.color+"22",color:e.color,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,letterSpacing:1,textTransform:"uppercase"}}>{e.app}</span>
                  <span style={{color:"#444",fontSize:12,fontFamily:"monospace"}}>{e.date}</span>
                </div>
                <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:7}}>
                  {e.items.map((item,j)=>(
                    <li key={j} style={{display:"flex",alignItems:"flex-start",gap:10}}>{Ico.dot(e.color)}<span style={{color:"#bbb",fontSize:14,lineHeight:1.5}}>{item}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{borderTop:"1px solid #1e1e30",padding:"40px clamp(20px,5vw,80px)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {Ico.tqak}
            <span style={{color:"#444",fontSize:13}}>tqak — chris0622ha</span>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
            <SvgBtn href="https://accuratkey.vercel.app" external color="#a78bfa" size="sm">AccuratKey</SvgBtn>
            <SvgBtn href="https://trivquic.vercel.app" external color="#fbbf24" size="sm">TrivQuic</SvgBtn>
            <SvgBtn href="https://github.com/chris0622ha" external color="#888" size="sm" icon={Ico.github}>GitHub</SvgBtn>
          </div>
        </footer>

      </main>
    </>
  );
}
