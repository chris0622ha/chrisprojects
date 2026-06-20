"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// Password gate for this page now happens server-side in middleware.ts —
// the page itself never renders unless the request already passed that
// check, so there's nothing client-side to bypass via DevTools or
// sessionStorage.

// ─── ACCURATKEY: All 11 sections (from source) ────────────────────────────
const AK_SECTIONS = [
  { firstId:1,   label:"Foundations",     subtitle:"Home row, core keys, first speed targets",           color:"#10b981", icon:"F" },
  { firstId:16,  label:"Precision Flow",  subtitle:"Vocabulary, patterns, accuracy under pressure",      color:"#818cf8", icon:"P" },
  { firstId:31,  label:"Word Power",      subtitle:"Medical, sports, mythology, compound mastery",       color:"#f59e0b", icon:"W" },
  { firstId:46,  label:"Keyboard Mastery",subtitle:"Spelling, rows, hand isolation, full sentences",     color:"#06b6d4", icon:"K" },
  { firstId:61,  label:"Speed Surge",     subtitle:"Push WPM — sprint drills, patterns, grand mastery", color:"#facc15", icon:"S" },
  { firstId:66,  label:"Free Run",        subtitle:"No WPM targets — flow, fluency, exploration",       color:"#ec4899", icon:"R" },
  { firstId:100, label:"Century Club",    subtitle:"Level 100 and beyond — prestige territory",         color:"#ef4444", icon:"C" },
  { firstId:116, label:"Endurance",       subtitle:"Long-form, rows, alternating, pinky work",          color:"#a855f7", icon:"E" },
  { firstId:131, label:"Literature",      subtitle:"Philosophy, scripture, Shakespeare, US history",     color:"#fbbf24", icon:"L" },
  { firstId:146, label:"Machine Mode",    subtitle:"Finger fury, code marathons, length-based gauntlets",color:"#f97316", icon:"M" },
  { firstId:156, label:"Legend Tier",     subtitle:"Seven crowns — the ultimate proving ground",         color:"#dc2626", icon:"X" },
];

// ─── ACCURATKEY: level colors (first 60 from LEVELS array) ───────────────
const AK_LEVEL_COLORS = [
  "#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899","#f97316","#a855f7","#ef4444",
  "#6366f1","#8b5cf6","#facc15","#f43f5e","#fbbf24","#22c55e","#34d399","#f472b6","#818cf8","#fb923c",
  "#fbbf24","#2dd4bf","#38bdf8","#e879f9","#f97316","#a3e635","#e2e8f0","#60a5fa","#c084fc","#fde68a",
  "#84cc16","#fb7185","#fcd34d","#4ade80","#818cf8","#38bdf8","#f43f5e","#a78bfa","#67e8f9","#fb923c",
  "#facc15","#e2e8f0","#c4b5fd","#fde68a","#06b6d4","#a3e635","#fbbf24","#818cf8","#f87171","#fbbf24",
  "#ef4444","#a78bfa","#facc15","#f59e0b","#34d399","#a78bfa","#fb7185","#c084fc","#fbbf24","#fb923c",
  "#facc15","#06b6d4","#8b5cf6","#10b981","#f59e0b","#3b82f6","#facc15","#ef4444","#f97316","#dc2626",
  "#f43f5e","#ec4899","#a855f7","#fbbf24","#f97316",
];

// ─── TRIVQUIC effects list (from source) ─────────────────────────────────
const TQ_EFFECTS = [
  { name:"wave",      label:"Wave",       color:"#06b6d4", css:(s)=>`@keyframes __wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} ${s}{animation:__wave 0.5s ease-in-out infinite!important;}` },
  { name:"shake",     label:"Shake",      color:"#ef4444", css:(s)=>`@keyframes __shake{0%,100%{transform:translate(0)}10%{transform:translate(-8px,4px)}20%{transform:translate(8px,-4px)}30%{transform:translate(-6px,6px)}40%{transform:translate(6px,-2px)}50%{transform:translate(-10px,2px)}60%{transform:translate(10px,4px)}70%{transform:translate(-4px,-6px)}80%{transform:translate(4px,6px)}90%{transform:translate(-6px,-4px)}} ${s}{animation:__shake 0.1s infinite;}` },
  { name:"spin",      label:"Spin",       color:"#a855f7", css:(s)=>`@keyframes __spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} ${s}{animation:__spin 3s linear;}` },
  { name:"explode",   label:"Explode",    color:"#f97316", css:(s)=>`@keyframes __explode{0%{transform:scale(1);opacity:1}100%{transform:scale(3);opacity:0}} ${s}{animation:__explode 2s ease-in forwards!important;}` },
  { name:"implode",   label:"Implode",    color:"#8b5cf6", css:(s)=>`@keyframes __implode{0%{transform:scale(1);opacity:1}100%{transform:scale(0);opacity:0}} ${s}{animation:__implode 2s ease-in forwards!important;}` },
  { name:"melt",      label:"Melt",       color:"#fbbf24", css:(s)=>`@keyframes __melt{0%{filter:none;transform:none}100%{filter:blur(4px);transform:scaleY(1.3) translateY(10%);opacity:0}} ${s}{animation:__melt 4s ease-in forwards!important;}` },
  { name:"vhs",       label:"VHS",        color:"#10b981", css:(s)=>`@keyframes __vhs{0%{transform:translateY(0)}50%{transform:translateY(2px)}100%{transform:translateY(-2px)}} ${s}{animation:__vhs 0.1s infinite;filter:contrast(1.2) brightness(0.9) saturate(1.4);}` },
  { name:"pulse",     label:"Pulse",      color:"#f472b6", css:(s)=>`@keyframes __pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}} ${s}{animation:__pulse 0.6s ease-in-out infinite;}` },
  { name:"flip",      label:"Flip",       color:"#38bdf8", css:(s)=>`@keyframes __flip{0%{transform:perspective(400px) rotateY(0)}50%{transform:perspective(400px) rotateY(180deg)}100%{transform:perspective(400px) rotateY(360deg)}} ${s}{animation:__flip 3s ease-in-out;}` },
  { name:"upsidedown",label:"Upside Down",color:"#facc15", css:(s)=>`${s}{transform:rotate(180deg);}` },
  { name:"invert",    label:"Invert",     color:"#e879f9", css:(s)=>`${s}{filter:invert(1);}` },
  { name:"neon",      label:"Neon",       color:"#34d399", css:(s)=>`${s}{filter:drop-shadow(0 0 8px #0ff) drop-shadow(0 0 16px #f0f) saturate(2);}` },
  { name:"earthquake",label:"Earthquake", color:"#f43f5e", css:(s)=>`@keyframes __quake{0%,100%{transform:translate(0,0)}25%{transform:translate(-8px,4px)}50%{transform:translate(8px,-4px)}75%{transform:translate(-4px,8px)}} ${s}{animation:__quake 0.1s infinite;}` },
  { name:"zoom",      label:"Zoom",       color:"#818cf8", css:(s)=>`@keyframes __zoom{0%{transform:scale(1)}100%{transform:scale(1.5)}} ${s}{animation:__zoom 3s ease-in forwards;}` },
];

// ─── TRIVQUIC brand colors ─────────────────────────────────────────────────
const TQ_COLORS = [
  { hex:"#f59e0b", name:"Primary" },
  { hex:"#10b981", name:"Correct" },
  { hex:"#ef4444", name:"Wrong" },
  { hex:"#3b82f6", name:"Info" },
  { hex:"#a855f7", name:"Accent" },
  { hex:"#2d2d44", name:"Border" },
  { hex:"#1a1a2e", name:"Card" },
  { hex:"#0f0f1a", name:"Page bg" },
  { hex:"#9ca3af", name:"Muted" },
  { hex:"#e5e7eb", name:"Text" },
  { hex:"#34d399", name:"Success" },
  { hex:"#f97316", name:"Warning" },
];

// ─── AccuratKey Confetti (exact from source) ──────────────────────────────
function Confetti({ sectionName, onDone }) {
  const COLS = ["#a78bfa","#34d399","#f59e0b","#f472b6","#60a5fa","#fb923c","#facc15","#f43f5e","#06b6d4","#84cc16"];
  const count = sectionName ? 120 : 60;
  const pieces = useRef(Array.from({length:count},(_,i)=>({
    id:i, x:Math.random()*100, delay:Math.random()*1.2,
    color:COLS[i%COLS.length], size:Math.random()*10+4,
    drift:(Math.random()-0.5)*280, dur:2.5+Math.random()*2,
    tall:i%3===2, round:i%3===0,
  }))).current;
  useEffect(()=>{ const t=setTimeout(onDone, sectionName?6000:3500); return ()=>clearTimeout(t); },[onDone, sectionName]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {sectionName && (
        <div style={{position:"absolute",top:"30%",left:"50%",
          background:"linear-gradient(135deg,#1a1a2e,#2a1a3e)",
          border:"2px solid #a78bfa88",borderRadius:16,padding:"18px 32px",
          textAlign:"center",zIndex:10000,boxShadow:"0 0 40px #a78bfa44",
          animation:"sectionPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both",
          transform:"translateX(-50%)",whiteSpace:"nowrap",
        }}>
          <div style={{color:"#a78bfa",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Section Unlocked</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:900}}>{sectionName}</div>
        </div>
      )}
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.x}%`,top:-20,
          width:p.size,height:p.tall?p.size*0.4:p.size,
          borderRadius:p.round?"50%":"2px",background:p.color,
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          transform:`translateX(${p.drift}px) rotate(${Math.floor(Math.random()*360)}deg)`,
        }}/>
      ))}
    </div>
  );
}

// ─── AccuratKey KKey icon (from source) ───────────────────────────────────
function KKey({ size=22, color="#7c6af7" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5"/>
      <rect x="3" y="18" width="18" height="3" rx="1.5" fill={color} opacity="0.3"/>
      <path d="M8 7v10M8 12l6-5M8 12l6 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── AccuratKey tab icon SVGs (from source) ───────────────────────────────
const TAB_ICONS = {
  games: (a) => (
    <svg width={a?22:18} height={a?22:18} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="32" rx="13" ry="5" fill={a?"#fff":"currentColor"} opacity={a?0.15:0.12}/>
      <ellipse cx="20" cy="32" rx="13" ry="5" fill="none" stroke={a?"#fff":"currentColor"} strokeWidth="1.6" opacity={a?0.6:0.4}/>
      <rect x="18" y="16" width="4" height="16" rx="2" fill={a?"#fff":"currentColor"} opacity={a?0.85:0.55}/>
      <circle cx="20" cy="13" r="6" fill={a?"#fff":"currentColor"} opacity={a?0.9:0.6}/>
      <circle cx="18" cy="11" r="2" fill={a?"#fff":"currentColor"} opacity={a?0.35:0.2}/>
      <circle cx="7" cy="24" r="4" fill={a?"#fff":"currentColor"} opacity={a?0.75:0.4}/>
      <circle cx="7" cy="24" r="2" fill={a?"#fff":"currentColor"} opacity={a?0.3:0.15}/>
      <circle cx="33" cy="24" r="4" fill={a?"#fff":"currentColor"} opacity={a?0.75:0.4}/>
      <circle cx="33" cy="24" r="2" fill={a?"#fff":"currentColor"} opacity={a?0.3:0.15}/>
    </svg>
  ),
  map: (a) => (
    <svg width={a?22:18} height={a?22:18} viewBox="0 0 40 40" fill="none">
      <path d="M12 34 Q8 26 20 22 Q32 18 28 10" stroke={a?"#fff":"currentColor"} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={a?0.7:0.45}/>
      <circle cx="12" cy="34" r="4" fill={a?"#fff":"currentColor"} opacity={a?0.85:0.55}/>
      <circle cx="20" cy="22" r="3.5" fill={a?"#fff":"currentColor"} opacity={a?0.7:0.4}/>
      <circle cx="28" cy="10" r="4" fill={a?"#fff":"currentColor"} opacity={a?0.9:0.6}/>
      <line x1="28" y1="6" x2="28" y2="2" stroke={a?"#fff":"currentColor"} strokeWidth="1.5" strokeLinecap="round" opacity={a?0.8:0.5}/>
      <path d="M28 2 L35 4 L28 6 Z" fill={a?"#fff":"currentColor"} opacity={a?0.85:0.55}/>
      <path d="M9.5 34 L11.5 36 L15 32" stroke={a?"#0a0a0f":"currentColor"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={a?0.7:0}/>
    </svg>
  ),
  daily: (a) => (
    <svg width={a?22:18} height={a?22:18} viewBox="0 0 40 40" fill="none">
      <rect x="5" y="8" width="30" height="28" rx="4" fill={a?"#fff":"currentColor"} fillOpacity={a?0.1:0.06} stroke={a?"#fff":"currentColor"} strokeWidth="1.8" opacity={a?0.7:0.45}/>
      <rect x="5" y="8" width="30" height="8" rx="4" fill={a?"#fff":"currentColor"} opacity={a?0.25:0.12}/>
      <rect x="13" y="5" width="3" height="7" rx="1.5" fill={a?"#fff":"currentColor"} opacity={a?0.7:0.45}/>
      <rect x="24" y="5" width="3" height="7" rx="1.5" fill={a?"#fff":"currentColor"} opacity={a?0.7:0.45}/>
      {[0,1,2,3].map(c=>[0,1,2].map(r=>{
        const x=11+c*6,y=22+r*5,iT=c===1&&r===1;
        return <circle key={`${c}${r}`} cx={x} cy={y} r={iT?2.5:1.5} fill={a?"#fff":"currentColor"} opacity={iT?(a?0.95:0.6):(a?0.35:0.2)}/>;
      }))}
      <circle cx="17" cy="27" r="5" fill="none" stroke={a?"#fff":"currentColor"} strokeWidth="1.4" opacity={a?0.6:0.3}/>
    </svg>
  ),
  test: (a) => (
    <svg width={a?22:18} height={a?22:18} viewBox="0 0 40 40" fill="none">
      <rect x="3" y="10" width="34" height="22" rx="4" fill={a?"#fff":"currentColor"} fillOpacity={a?0.1:0.06} stroke={a?"#fff":"currentColor"} strokeWidth="1.8" opacity={a?0.7:0.45}/>
      {[7,12,17,22,27].map(x=><rect key={x} x={x} y="14" width="4" height="4" rx="1.2" fill={a?"#fff":"currentColor"} opacity={a?0.55:0.3}/>)}
      {[9,14.5,20,25.5].map(x=><rect key={x} x={x} y="20" width="4" height="4" rx="1.2" fill={a?"#fff":"currentColor"} opacity={a?0.55:0.3}/>)}
      <rect x="11" y="26" width="18" height="4" rx="2" fill={a?"#fff":"currentColor"} opacity={a?0.7:0.4}/>
    </svg>
  ),
};

// ─── Section divider ──────────────────────────────────────────────────────
function Divider({ label, color }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"48px 0 24px"}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/>
      <span style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color,fontWeight:700}}>{label}</span>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}44,transparent)`}}/>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────
function OwnerPageContent() {
  const [confetti, setConfetti] = useState(null);
  // Stable reference so the Confetti component's useEffect (which depends
  // on this callback to know when to clear its own dismiss timer) doesn't
  // see a "new" function on every parent re-render. An inline arrow function
  // here would recreate that timer from zero on every render, which is why
  // the section-unlocked overlay was staying on screen indefinitely instead
  // of clearing itself after a few seconds.
  const dismissConfetti = useCallback(() => setConfetti(null), []);
  const [activeTab, setActiveTab] = useState("map");
  const [activeEffect, setActiveEffect] = useState(null);
  const [wpmVal, setWpmVal] = useState(0);
  const [blinkOn, setBlinkOn] = useState(true);
  const fxBoxRef = useRef(null);
  const fxStyleRef = useRef(null);
  const fxTimerRef = useRef(null);
  const FX_SEL = ".tq-preview-box";

  // blink
  useEffect(()=>{ const t=setInterval(()=>setBlinkOn(b=>!b),500); return ()=>clearInterval(t); },[]);

  // animated WPM bar
  useEffect(()=>{
    let v=0, up=true;
    const t=setInterval(()=>{ v=up?v+1:v-1; if(v>=100)up=false; if(v<=0)up=true; setWpmVal(v); },25);
    return ()=>clearInterval(t);
  },[]);

  const fireEffect = useCallback((eff) => {
    if(fxTimerRef.current) clearTimeout(fxTimerRef.current);
    if(fxStyleRef.current) { fxStyleRef.current.remove(); fxStyleRef.current=null; }
    if(fxBoxRef.current) {
      fxBoxRef.current.style.cssText="";
      const s=document.createElement("style");
      s.textContent = eff.css(FX_SEL);
      document.head.appendChild(s);
      fxStyleRef.current = s;
      setActiveEffect(eff.name);
      fxTimerRef.current = setTimeout(()=>{
        s.remove(); fxStyleRef.current=null;
        if(fxBoxRef.current) fxBoxRef.current.style.cssText="";
        setActiveEffect(null);
      }, 3500);
    }
  },[]);

  return (
    <div style={{minHeight:"100vh",background:"#08080f",color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",padding:"40px 24px",maxWidth:960,margin:"0 auto"}}>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes confettiFall{0%{top:-20px;opacity:1}100%{top:110vh;opacity:0}}
        @keyframes sectionPop{0%{opacity:0;transform:translateX(-50%) scale(0.7)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-14px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #7c6af777}50%{box-shadow:0 0 24px #7c6af7cc,0 0 48px #7c6af744}}
        @keyframes akSpin{to{transform:rotate(360deg)}}
        @keyframes cdpop{0%{transform:scale(1.5);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>

      {confetti && <Confetti sectionName={confetti.name} onDone={dismissConfetti}/>}

      {/* Header */}
      <div style={{marginBottom:40,paddingBottom:20,borderBottom:"1px solid #1e1e30"}}>
        <div style={{fontSize:10,letterSpacing:3,color:"#333",textTransform:"uppercase",marginBottom:6}}>🔒 Owner reference — do not share</div>
        <h1 style={{fontSize:28,fontWeight:900,margin:"0 0 6px",color:"#fff"}}>Asset & Animation Reference</h1>
        <p style={{color:"#444",fontSize:12,margin:0}}>Every reusable component, color, icon, and animation from AccuratKey and TrivQuic.</p>
      </div>

      {/* ══════════════ ACCURATKEY ══════════════ */}
      <Divider label="AccuratKey" color="#7c6af7"/>

      {/* Level colors */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Level colors — {AK_LEVEL_COLORS.length} total — hover to see hex</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {AK_LEVEL_COLORS.map((c,i)=>(
            <div key={i} title={`Lv ${i+1}: ${c}`} style={{width:26,height:26,borderRadius:5,background:c,cursor:"default",transition:"transform 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.4) translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
            />
          ))}
        </div>
      </div>

      {/* KKey icon */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>KKey icon — sizes & brand colors</div>
        <div style={{display:"flex",gap:20,alignItems:"flex-end",flexWrap:"wrap"}}>
          {[14,20,28,40,56].map(s=>(
            <div key={s} style={{textAlign:"center"}}>
              <KKey size={s} color="#7c6af7"/>
              <div style={{fontSize:9,color:"#444",marginTop:4}}>{s}px</div>
            </div>
          ))}
          <div style={{width:1,height:40,background:"#1e1e30"}}/>
          {["#7c6af7","#34d399","#f59e0b","#ef4444","#06b6d4","#ec4899"].map(c=>(
            <KKey key={c} size={28} color={c}/>
          ))}
        </div>
      </div>

      {/* Tab icons */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Tab icons — click to switch active tab</div>
        <div style={{display:"flex",gap:6,background:"#13131f",borderRadius:10,padding:3,border:"1px solid #1e1e30",maxWidth:340}}>
          {["games","map","daily","test"].map(k=>(
            <button key={k} onClick={()=>setActiveTab(k)} style={{
              flex:1,padding:"7px 0",borderRadius:7,border:"none",
              background:activeTab===k?"#7c6af7":"transparent",
              color:activeTab===k?"#fff":"#444",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
            }}>
              {TAB_ICONS[k](activeTab===k)}
              <span style={{fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",fontFamily:"monospace",opacity:activeTab===k?0.9:0.5}}>{k}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level map node states */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Level map node states</div>
        <div style={{display:"flex",gap:28,flexWrap:"wrap",alignItems:"flex-start"}}>
          {[
            {label:"Completed",color:"#10b981",completed:true},
            {label:"Current",color:"#7c6af7",current:true},
            {label:"Unlocked",color:"#f59e0b"},
            {label:"Locked",color:"#2a2a3e",locked:true},
          ].map(({label,color,completed,current,locked})=>(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{
                width:52,height:52,borderRadius:"50%",
                background:completed?color+"22":current?color+"33":locked?"#0a0a15":"#0d0d18",
                border:`3px solid ${locked?"#1e1e30":color}`,
                boxShadow:current?`0 0 20px ${color}77,0 0 40px ${color}33`:"none",
                display:"flex",alignItems:"center",justifyContent:"center",
                position:"relative",margin:"0 auto 8px",
                animation:current?"glow 2s ease-in-out infinite":undefined,
              }}>
                <div style={{width:12,height:12,borderRadius:"50%",background:locked?"#2a2a3e":color,opacity:locked?0.3:1}}/>
                {completed && (
                  <div style={{position:"absolute",bottom:-3,right:-3,width:16,height:16,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #0d0d18"}}>
                    <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5.5L4.2 8 8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                  </div>
                )}
                {current && <div style={{position:"absolute",inset:-6,borderRadius:"50%",border:`2px solid ${color}44`}}/>}
              </div>
              <div style={{fontSize:10,color:"#555"}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section banners */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Section banners — all 11</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {AK_SECTIONS.map((s,i)=>(
            <div key={s.label} style={{
              height:44,borderRadius:10,
              background:`linear-gradient(90deg,${s.color}18,${s.color}06)`,
              border:`1.5px solid ${s.color}${i<4?"55":"33"}`,
              display:"flex",alignItems:"center",gap:10,padding:"0 14px",position:"relative",overflow:"hidden",
            }}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,borderRadius:"10px 0 0 10px",background:s.color,opacity:i<4?0.9:0.35}}/>
              <div style={{width:26,height:26,borderRadius:7,background:i<4?s.color:s.color+"33",display:"flex",alignItems:"center",justifyContent:"center",marginLeft:6,flexShrink:0}}>
                <span style={{color:i<4?"#fff":s.color,fontWeight:900,fontSize:11,fontFamily:"monospace"}}>{s.icon}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:i<4?s.color:s.color+"88",fontWeight:800,fontSize:12}}>{s.label} <span style={{opacity:0.5,fontWeight:400,fontSize:10}}>— lv {s.firstId}+</span></div>
                <div style={{color:"#444",fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.subtitle}</div>
              </div>
              <div style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${s.color}${i<4?"55":"22"}`,color:i<4?s.color:s.color+"44",fontSize:9,fontWeight:700,fontFamily:"monospace",flexShrink:0}}>
                {i<4?"Jump here":"Locked"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WPM bar */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>WPM progress bar (live)</div>
        <div style={{background:"#13131f",borderRadius:10,padding:16,border:"1px solid #1e1e30"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:11,color:"#555"}}>Words per minute</span>
            <span style={{fontSize:16,fontWeight:900,color:"#7c6af7",fontFamily:"monospace"}}>{Math.round(wpmVal*1.35)} WPM</span>
          </div>
          <div style={{height:6,background:"#1e1e30",borderRadius:3,overflow:"hidden",marginBottom:8}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,#7c6af7,#a78bfa)",borderRadius:3,width:wpmVal+"%",transition:"width 0.025s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#444"}}>
            <span>Target: 80 WPM</span>
            <span>Accuracy: {85+Math.round(wpmVal*0.1)}%</span>
          </div>
        </div>
      </div>

      {/* Keyboard layout heatmap (simplified) */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Key heatmap (error heat colors)</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",maxWidth:400}}>
          {[
            ["Q","W","E","R","T","Y","U","I","O","P"],
            ["A","S","D","F","G","H","J","K","L",";"],
            ["Z","X","C","V","B","N","M",",",".","?"],
          ].map((row,ri)=>(
            <div key={ri} style={{display:"flex",gap:4,width:"100%",justifyContent:"center",marginLeft:ri===1?"8px":ri===2?"16px":"0"}}>
              {row.map((k,ki)=>{
                const heat = Math.random();
                const bg = heat>0.7?"#ef4444":heat>0.4?"#f59e0b":heat>0.2?"#10b981":"#1e1e30";
                return (
                  <div key={ki} style={{width:32,height:32,borderRadius:6,background:bg+"44",border:`1px solid ${bg}66`,borderBottom:`3px solid ${bg}55`,display:"flex",alignItems:"center",justifyContent:"center",color:bg,fontSize:11,fontWeight:700}}>
                    {k}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* AccuratKey animations */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>AccuratKey animations</div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
          {/* blink cursor */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:900,color:"#7c6af7",fontFamily:"monospace",marginBottom:6,minWidth:120}}>
              type here<span style={{borderRight:"2px solid #7c6af7",opacity:blinkOn?1:0,marginLeft:2}}>&nbsp;</span>
            </div>
            <div style={{fontSize:10,color:"#444"}}>blink cursor</div>
          </div>
          {/* bounce */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,animation:"bounce 0.6s ease-in-out infinite alternate",display:"inline-block",marginBottom:6}}>🎂</div>
            <div style={{fontSize:10,color:"#444"}}>birthday bounce</div>
          </div>
          {/* node glow */}
          <div style={{textAlign:"center"}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"#7c6af722",border:"3px solid #7c6af7",animation:"glow 2s ease-in-out infinite",margin:"0 auto 6px"}}/>
            <div style={{fontSize:10,color:"#444"}}>current level glow</div>
          </div>
          {/* section unlock confetti */}
          <div style={{textAlign:"center"}}>
            <button onClick={()=>setConfetti({name:"Speed Surge"})} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #7c6af755",background:"#7c6af711",color:"#a78bfa",fontSize:11,fontWeight:700,cursor:"pointer",marginBottom:6,fontFamily:"monospace",display:"block"}}>
              🎉 Section Confetti
            </button>
            <div style={{fontSize:10,color:"#444"}}>section unlock</div>
          </div>
          {/* level pass confetti */}
          <div style={{textAlign:"center"}}>
            <button onClick={()=>setConfetti({name:null})} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #34d39955",background:"#34d39911",color:"#34d399",fontSize:11,fontWeight:700,cursor:"pointer",marginBottom:6,fontFamily:"monospace",display:"block"}}>
              ✓ Level Confetti
            </button>
            <div style={{fontSize:10,color:"#444"}}>level pass</div>
          </div>
          {/* floating icon */}
          <div style={{textAlign:"center"}}>
            <div style={{animation:"float 3s ease-in-out infinite",marginBottom:6,display:"inline-block"}}>
              <KKey size={32} color="#7c6af7"/>
            </div>
            <div style={{fontSize:10,color:"#444"}}>float</div>
          </div>
          {/* spinner */}
          <div style={{textAlign:"center"}}>
            <div style={{width:32,height:32,border:"3px solid #7c6af733",borderTopColor:"#7c6af7",borderRadius:"50%",animation:"akSpin 0.8s linear infinite",margin:"0 auto 6px"}}/>
            <div style={{fontSize:10,color:"#444"}}>loading spin</div>
          </div>
        </div>
      </div>

      {/* ══════════════ TRIVQUIC ══════════════ */}
      <Divider label="TrivQuic" color="#f59e0b"/>

      {/* TQ colors */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Brand color palette</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {TQ_COLORS.map(({hex,name})=>(
            <div key={hex} style={{textAlign:"center"}}>
              <div title={hex} style={{width:44,height:44,borderRadius:8,background:hex,marginBottom:4,border:"1px solid #ffffff11"}}/>
              <div style={{fontSize:9,color:"#888"}}>{name}</div>
              <div style={{fontSize:9,color:"#444"}}>{hex}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer button states */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Answer button states</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxWidth:380}}>
          {[
            {label:"Paris — default",     bg:"#1a1a2e",border:"#2d2d44",color:"#e5e7eb"},
            {label:"London — correct ✓",  bg:"#064e3b",border:"#10b981",color:"#10b981"},
            {label:"Berlin — wrong ✗",    bg:"#450a0a",border:"#ef4444",color:"#ef4444"},
            {label:"Madrid — selected",   bg:"#1a1a2e",border:"#f59e0b",color:"#f59e0b"},
          ].map(({label,bg,border,color})=>(
            <div key={label} style={{background:bg,border:`2px solid ${border}`,borderRadius:14,color,fontSize:14,fontWeight:700,padding:"14px 16px",transition:"all 0.2s"}}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Timer arc */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Timer arc SVG — 4 states</div>
        <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
          {[{pct:100,label:"full"},{pct:66,label:"warn"},{pct:33,label:"danger"},{pct:8,label:"critical"}].map(({pct,label})=>{
            const r=22,circ=2*Math.PI*r,offset=circ*(1-pct/100);
            const col=pct>50?"#10b981":pct>20?"#f59e0b":"#ef4444";
            return (
              <div key={pct} style={{textAlign:"center"}}>
                <svg width={60} height={60} viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r={r} fill="none" stroke="#2d2d44" strokeWidth="4.5"/>
                  <circle cx="30" cy="30" r={r} fill="none" stroke={col} strokeWidth="4.5"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 30 30)"
                    style={{transition:"stroke-dashoffset 0.3s linear,stroke 0.3s"}}/>
                  <text x="30" y="35" textAnchor="middle" fill={col} fontSize="12" fontWeight="bold" fontFamily="monospace">{pct}%</text>
                </svg>
                <div style={{fontSize:10,color:"#444"}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TQ game effects */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Game effects — click any button to preview on the card below</div>
        <div className="tq-preview-box" ref={fxBoxRef} style={{
          background:"linear-gradient(135deg,#1a1a2e,#0f0f1a)",
          border:`2px solid ${activeEffect?"#f59e0b":"#2d2d44"}`,
          borderRadius:16,padding:"24px",textAlign:"center",marginBottom:12,
          fontSize:18,fontWeight:900,color:"#f59e0b",minHeight:80,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"border-color 0.3s",
        }}>
          {activeEffect ? `Effect: ${activeEffect}` : "← Click an effect below"}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {TQ_EFFECTS.map(eff=>(
            <button key={eff.name} onClick={()=>fireEffect(eff)} style={{
              padding:"7px 12px",borderRadius:8,
              border:`1px solid ${eff.color}55`,
              background:activeEffect===eff.name?eff.color+"22":"transparent",
              color:eff.color,fontSize:11,fontWeight:700,cursor:"pointer",
              fontFamily:"monospace",transition:"all 0.15s",
            }}>{eff.label}</button>
          ))}
        </div>
      </div>

      {/* Score & streak */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Score & streak display</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {[{score:0,streak:0},{score:3,streak:2},{score:7,streak:5},{score:10,streak:10}].map(({score,streak})=>(
            <div key={score} style={{background:"#1a1a2e",border:"1px solid #2d2d44",borderRadius:12,padding:"16px 20px",textAlign:"center",minWidth:80}}>
              <div style={{fontSize:30,fontWeight:900,color:"#f59e0b",fontFamily:"monospace"}}>{score}</div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>score</div>
              {streak>0&&<div style={{marginTop:8,fontSize:12,color:"#ef4444",fontWeight:700}}>🔥 ×{streak}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* TQ loading spinner */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Loading spinner (TrivQuic style)</div>
        <div style={{background:"rgba(0,0,0,0.6)",borderRadius:12,padding:"24px",display:"inline-flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{width:56,height:56,border:"5px solid rgba(255,255,255,0.2)",borderTopColor:"#f59e0b",borderRadius:"50%",animation:"akSpin 0.8s linear infinite"}}/>
          <div style={{color:"#fff",fontSize:14,fontWeight:700}}>Loading...</div>
        </div>
      </div>

      {/* Countdown pop */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Countdown animation</div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          {[3,2,1,"GO!"].map((n,i)=>(
            <div key={i} style={{
              fontSize:n==="GO!"?28:40,fontWeight:900,
              color:n==="GO!"?"#10b981":"#f59e0b",
              textShadow:`0 0 20px ${n==="GO!"?"rgba(16,185,129,0.8)":"rgba(245,158,11,0.8)"}`,
              animation:"cdpop 0.3s ease-out",fontFamily:"monospace",
            }}>{n}</div>
          ))}
        </div>
      </div>

      {/* ══════════════ SHARED ══════════════ */}
      <Divider label="Shared Patterns" color="#34d399"/>

      {/* Card pattern */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Dark card with color accent</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {["#7c6af7","#f59e0b","#10b981","#ef4444","#06b6d4","#ec4899"].map(c=>(
            <div key={c} style={{flex:"1 1 140px",background:`linear-gradient(135deg,${c}11,${c}05)`,border:`1px solid ${c}33`,borderLeft:`3px solid ${c}`,borderRadius:12,padding:14}}>
              <div style={{color:c,fontSize:12,fontWeight:700,marginBottom:4}}>Card title</div>
              <div style={{color:"#555",fontSize:11}}>Shared card style</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges & pills */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Status badges & pills</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {[
            {label:"AccuratKey",c:"#7c6af7"},{label:"TrivQuic",c:"#f59e0b"},
            {label:"Live",c:"#10b981"},{label:"YOU",c:"#a78bfa"},
            {label:"NEW",c:"#ef4444"},{label:"BETA",c:"#f97316"},
            {label:"PRO",c:"#facc15"},{label:"SKIP",c:"#06b6d4"},
          ].map(({label,c})=>(
            <span key={label} style={{background:c+"22",color:c,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,border:`1px solid ${c}44`,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace"}}>{label}</span>
          ))}
        </div>
      </div>

      {/* Spinners */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Loading spinners — sizes & colors</div>
        <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
          {[["#7c6af7",36],["#f59e0b",28],["#10b981",22],["#ef4444",16]].map(([c,s])=>(
            <div key={c} style={{textAlign:"center"}}>
              <div style={{width:s,height:s,border:`${Math.max(2,s/8)}px solid ${c}33`,borderTopColor:c,borderRadius:"50%",animation:"akSpin 0.8s linear infinite",margin:"0 auto 4px"}}/>
              <div style={{fontSize:9,color:"#444"}}>{s}px</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradient text */}
      <div style={{marginBottom:40}}>
        <div style={{fontSize:11,color:"#555",marginBottom:10,letterSpacing:1}}>Gradient text styles</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            "linear-gradient(135deg,#fff 30%,#a78bfa 60%,#f59e0b 90%)",
            "linear-gradient(90deg,#7c6af7,#ec4899)",
            "linear-gradient(90deg,#f59e0b,#ef4444)",
            "linear-gradient(135deg,#10b981,#06b6d4)",
          ].map((g,i)=>(
            <div key={i} style={{fontSize:20,fontWeight:900,background:g,WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Inter',sans-serif"}}>
              Build your keyboard skills
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function OwnerPage() {
  return <OwnerPageContent />;
}
