"use client";
import { useState, useEffect, useRef } from "react";

// ── Particle field background ─────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
      color: ["#7c6af7","#34d399","#f59e0b","#f472b6","#06b6d4"][Math.floor(Math.random()*5)],
      o: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.o;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Draw faint connection lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#7c6af7";
            ctx.globalAlpha = (1 - dist/120) * 0.08;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }} />;
}

// ── Typing animation for hero text ────────────────────────────────────────
function TypeWriter({ texts, speed = 60 }) {
  const [display, setDisplay] = useState("");
  const [ti, setTi] = useState(0);
  const [ci, setCi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = texts[ti];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (ci < current.length) { setDisplay(current.slice(0, ci+1)); setCi(ci+1); }
        else { setTimeout(() => setDeleting(true), 1800); }
      } else {
        if (ci > 0) { setDisplay(current.slice(0, ci-1)); setCi(ci-1); }
        else { setDeleting(false); setTi((ti+1) % texts.length); }
      }
    }, deleting ? speed/2 : speed);
    return () => clearTimeout(timeout);
  }, [ci, deleting, ti, texts, speed]);
  return (
    <span>
      {display}
      <span style={{ animation:"blink 1s step-end infinite", borderRight:"2px solid #7c6af7", marginLeft:2 }}>&nbsp;</span>
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = Date.now();
        const tick = () => {
          const progress = Math.min((Date.now()-start)/duration, 1);
          const ease = 1 - Math.pow(1-progress, 3);
          setVal(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Section reveal hook ───────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── App card with live iframe ─────────────────────────────────────────────
function AppCard({ name, tag, tagColor, url, description, stats, features, accentColor, side }) {
  const [ref, visible] = useReveal();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFrame, setShowFrame] = useState(false);

  return (
    <div ref={ref} style={{
      display:"flex",
      flexDirection:"column",
      gap:40,
      padding:"80px 0",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(48px)",
      transition:"opacity 0.8s ease, transform 0.8s ease",
    }}>
      {/* Text side */}
      <div>
        {/* Tag pill */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{
            background: tagColor + "22", color: tagColor, fontSize:11, fontWeight:700,
            letterSpacing:2, textTransform:"uppercase", padding:"4px 12px", borderRadius:99,
            border:`1px solid ${tagColor}44`,
          }}>{tag}</span>
        </div>
        <h2 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:900, margin:"0 0 16px", lineHeight:1.1, color:"#fff" }}>{name}</h2>
        <p style={{ fontSize:16, color:"#aaa", lineHeight:1.7, margin:"0 0 28px", maxWidth:480 }}>{description}</p>

        {/* Stats row */}
        <div style={{ display:"flex", gap:24, marginBottom:32, flexWrap:"wrap" }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize:28, fontWeight:900, color:accentColor, fontFamily:"'JetBrains Mono',monospace" }}>
                <Counter target={s.value} suffix={s.suffix||""} />
              </div>
              <div style={{ fontSize:11, color:"#666", letterSpacing:1, textTransform:"uppercase", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:36 }}>
          {features.map(f => (
            <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink:0, marginTop:3 }}>
                <circle cx="8" cy="8" r="7" fill={accentColor} opacity="0.2"/>
                <path d="M5 8.5L7 10.5L11 6" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span style={{ fontSize:14, color:"#ccc", lineHeight:1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:10,
          background:`linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
          color:"#fff", padding:"13px 28px", borderRadius:12,
          fontWeight:700, fontSize:15, textDecoration:"none",
          boxShadow:`0 8px 32px ${accentColor}44`,
          transition:"transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 12px 40px ${accentColor}66`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 8px 32px ${accentColor}44`;}}
        >
          Open {name}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      {/* Preview side */}
      <div style={{ position:"relative" }}>
        {/* Glow behind frame */}
        <div style={{
          position:"absolute", inset:-24, borderRadius:24,
          background:`radial-gradient(ellipse at center, ${accentColor}18 0%, transparent 70%)`,
          pointerEvents:"none",
        }}/>
        {/* Frame wrapper */}
        <div style={{
          borderRadius:16, overflow:"hidden", border:`1px solid ${accentColor}33`,
          boxShadow:`0 0 0 1px ${accentColor}22, 0 24px 80px #00000088`,
          background:"#0d0d1a", position:"relative",
          height:520,
        }}>
          {/* Browser chrome bar */}
          <div style={{
            height:36, background:"#111120", borderBottom:`1px solid ${accentColor}22`,
            display:"flex", alignItems:"center", padding:"0 14px", gap:8,
          }}>
            <div style={{ display:"flex", gap:5 }}>
              {["#ff5f57","#febc2e","#28c840"].map(c=>(
                <div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c, opacity:0.8 }}/>
              ))}
            </div>
            <div style={{
              flex:1, background:"#1a1a2e", borderRadius:6, height:22,
              display:"flex", alignItems:"center", padding:"0 10px",
              fontSize:11, color:"#555", fontFamily:"monospace",
            }}>{url.replace("https://","")}</div>
          </div>
          {/* Iframe or load button */}
          {showFrame ? (
            <div style={{ position:"relative", height:"calc(100% - 36px)" }}>
              {!iframeLoaded && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#0d0d1a" }}>
                  <div style={{ width:32, height:32, border:`3px solid ${accentColor}44`, borderTopColor:accentColor, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                </div>
              )}
              <iframe
                src={url + "?embed=1"} style={{ width:"100%", height:"100%", border:"none", display:"block" }}
                onLoad={()=>setIframeLoaded(true)}
                title={name}
              />
            </div>
          ) : (
            <div style={{
              height:"calc(100% - 36px)", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:16,
              background:`linear-gradient(160deg, #0d0d1a 0%, ${accentColor}08 100%)`,
              cursor:"pointer",
            }} onClick={()=>setShowFrame(true)}>
              {/* App icon SVG placeholder */}
              <div style={{
                width:72, height:72, borderRadius:20,
                background:`linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
                border:`2px solid ${accentColor}44`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  {tag === "AccuratKey" ? (
                    // Keyboard icon
                    <>
                      <rect x="4" y="14" width="40" height="26" rx="5" stroke={accentColor} strokeWidth="2" fillOpacity="0"/>
                      {[8,15,22,29,36].map(x=><rect key={x} x={x} y="18" width="5" height="5" rx="1.5" fill={accentColor} opacity="0.7"/>)}
                      {[10,17.5,25,32.5].map(x=><rect key={x} x={x} y="25" width="5" height="5" rx="1.5" fill={accentColor} opacity="0.5"/>)}
                      <rect x="16" y="32" width="16" height="5" rx="2" fill={accentColor} opacity="0.7"/>
                    </>
                  ) : (
                    // Quiz/trivia icon — question mark in circle with lightning
                    <>
                      <circle cx="24" cy="24" r="18" stroke={accentColor} strokeWidth="2" fillOpacity="0"/>
                      <path d="M18 18C18 14.7 20.7 12 24 12C27.3 12 30 14.7 30 18C30 21 27 22.5 24 24V26" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="24" cy="32" r="2" fill={accentColor}/>
                    </>
                  )}
                </svg>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Click to preview</div>
                <div style={{ color:"#555", fontSize:12, marginTop:4 }}>Live embed — opens in frame</div>
              </div>
              <div style={{
                padding:"8px 20px", borderRadius:8, border:`1px solid ${accentColor}55`,
                color:accentColor, fontSize:12, fontWeight:700,
              }}>Load preview</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Changelog entry ───────────────────────────────────────────────────────
const CHANGELOG = [
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 18 2026", items:["SVG tab icons: joystick, map path, calendar grid, keyboard","Section banners with Jump here scroll, 11 sections across 165 levels","Section unlock confetti — 120 pieces + animated popup"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 18 2026", items:["Redesigned levels 61–75 icons: runner, DNA helix, terminal window, vinyl record, campfire, hurricane, bomb","Section banners insert into level map above each section's first level","Free Run section (66–99) with no WPM targets"] },
  { app:"TrivQuic", tag:"trivquic", color:"#f59e0b", date:"Jun 18 2026", items:["Google login — shows display name in nav","Firebase Firestore sessions per UID saved","Personal best tracking, profile modal, leaderboard by UID"] },
  { app:"AccuratKey", tag:"accuratkey", color:"#7c6af7", date:"Jun 15 2026", items:["165-level progression system","Multi-profile support (Netflix-style)","Keys currency, star ratings, streak tracking"] },
  { app:"TrivQuic", tag:"trivquic", color:"#f59e0b", date:"Jun 13 2026", items:["38 games across 10 categories","Daily challenge with global leaderboard","Streak multipliers and score tracking"] },
];

// ── Main page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [activeFilter, setActiveFilter] = useState("all");
  const heroRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(()=>{
    const onScroll = ()=>setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive:true });
    return ()=>window.removeEventListener("scroll", onScroll);
  },[]);

  const filtered = activeFilter==="all" ? CHANGELOG : CHANGELOG.filter(e=>e.tag===activeFilter);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        ::selection { background:#7c6af744; }
        ::-webkit-scrollbar { width:6px } ::-webkit-scrollbar-track { background:#0a0a0f }
        ::-webkit-scrollbar-thumb { background:#2a2a3e; border-radius:3px }
        html { scroll-behavior:smooth }
      `}</style>

      <ParticleField />

      {/* ── Nav ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrollY>40 ? "#08080fdd" : "transparent",
        backdropFilter: scrollY>40 ? "blur(16px)" : "none",
        borderBottom: scrollY>40 ? "1px solid #1e1e3044" : "none",
        transition:"all 0.3s",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 clamp(20px,5vw,80px)", height:64,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Logo mark — two overlapping key caps */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="5" width="16" height="16" rx="4" fill="#7c6af7" opacity="0.9"/>
            <rect x="11" y="9" width="16" height="16" rx="4" fill="#f59e0b" opacity="0.85"/>
            <rect x="5" y="10" width="6" height="1.5" rx="0.75" fill="#fff" opacity="0.5"/>
            <rect x="5" y="13" width="4" height="1.5" rx="0.75" fill="#fff" opacity="0.35"/>
          </svg>
          <span style={{ fontWeight:800, fontSize:16, color:"#fff", letterSpacing:0.3 }}>ChrisProjects</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <a href="https://accuratkey.vercel.app" target="_blank" rel="noopener noreferrer" style={{
            padding:"6px 14px", borderRadius:8, background:"#7c6af722",
            border:"1px solid #7c6af744", color:"#a78bfa", fontSize:12, fontWeight:700,
            textDecoration:"none", transition:"background 0.2s",
          }}>AccuratKey</a>
          <a href="https://trivquic.vercel.app" target="_blank" rel="noopener noreferrer" style={{
            padding:"6px 14px", borderRadius:8, background:"#f59e0b22",
            border:"1px solid #f59e0b44", color:"#fbbf24", fontSize:12, fontWeight:700,
            textDecoration:"none", transition:"background 0.2s",
          }}>TrivQuic</a>
        </div>
      </nav>

      <main style={{ position:"relative", zIndex:1 }}>

        {/* ── Hero ── */}
        <section style={{
          minHeight:"100vh", display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          padding:"80px clamp(20px,5vw,80px) 60px",
          textAlign:"center",
        }}>
          {/* Animated gradient orbs */}
          <div style={{ position:"absolute", top:"20%", left:"15%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,#7c6af722 0%,transparent 70%)", pointerEvents:"none", animation:"float 8s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", top:"30%", right:"12%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,#f59e0b18 0%,transparent 70%)", pointerEvents:"none", animation:"float 10s ease-in-out infinite 2s" }}/>

          <div style={{ marginBottom:20, display:"inline-flex", alignItems:"center", gap:8, background:"#1a1a2e", border:"1px solid #2a2a4e", borderRadius:99, padding:"6px 16px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 8px #34d399" }}/>
            <span style={{ fontSize:12, color:"#888", fontWeight:600 }}>ChrisProjects — two web apps by chris0622ha</span>
          </div>

          <h1 style={{
            fontSize:"clamp(42px,8vw,96px)", fontWeight:900, margin:"0 0 20px",
            lineHeight:1.0, letterSpacing:-2,
            background:"linear-gradient(135deg,#fff 30%,#a78bfa 60%,#f59e0b 90%)",
            backgroundClip:"text", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundSize:"200% 200%", animation:"gradientShift 6s ease infinite",
          }}>
            Build your<br/>best skills
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,20px)", color:"#888", maxWidth:560, margin:"0 0 12px", lineHeight:1.6 }}>
            Two web apps — one for typing mastery, one for trivia.
          </p>
          <div style={{ fontSize:"clamp(16px,2.5vw,22px)", color:"#bbb", fontFamily:"'JetBrains Mono',monospace", fontWeight:700, minHeight:32 }}>
            <TypeWriter texts={["165 levels of typing","38 trivia games","Track WPM and accuracy","One-tap trivia battles","Compete on leaderboards"]} />
          </div>

          <div style={{ display:"flex", gap:14, marginTop:40, flexWrap:"wrap", justifyContent:"center" }}>
            <a href="#accuratkey" style={{
              padding:"14px 32px", borderRadius:12,
              background:"linear-gradient(135deg,#7c6af7,#a78bfa)",
              color:"#fff", fontWeight:800, fontSize:16, textDecoration:"none",
              boxShadow:"0 8px 32px #7c6af744",
            }}>AccuratKey</a>
            <a href="#trivquic" style={{
              padding:"14px 32px", borderRadius:12,
              background:"linear-gradient(135deg,#f59e0b,#fbbf24)",
              color:"#111", fontWeight:800, fontSize:16, textDecoration:"none",
              boxShadow:"0 8px 32px #f59e0b44",
            }}>TrivQuic</a>
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop:80, display:"flex", flexDirection:"column", alignItems:"center", gap:8, opacity:0.4 }}>
            <span style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#888" }}>Scroll</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <rect x="5" y="2" width="6" height="12" rx="3" stroke="#888" strokeWidth="1.5"/>
              <circle cx="8" cy="7" r="1.5" fill="#888" style={{ animation:"float 1.5s ease-in-out infinite" }}/>
            </svg>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section style={{
          background:"linear-gradient(90deg,#0d0d1a,#12101f,#0d0d1a)",
          borderTop:"1px solid #1e1e30", borderBottom:"1px solid #1e1e30",
          padding:"40px clamp(20px,5vw,80px)",
          display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:32,
        }}>
          {[
            { n:165, s:"", label:"Typing Levels" },
            { n:38, s:"", label:"Trivia Games" },
            { n:10, s:"", label:"Keyboard Layouts" },
            { n:100, s:"%", label:"Free to Play" },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:40, fontWeight:900, color:"#fff", fontFamily:"'JetBrains Mono',monospace" }}>
                <Counter target={s.n} suffix={s.s} />
              </div>
              <div style={{ fontSize:12, color:"#555", textTransform:"uppercase", letterSpacing:1.5, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── AccuratKey section ── */}
        <section id="accuratkey" style={{ padding:"0 clamp(20px,5vw,80px)", maxWidth:1280, margin:"0 auto" }}>
          <AppCard
            name="AccuratKey"
            tag="AccuratKey"
            tagColor="#7c6af7"
            url="https://accuratkey.vercel.app"
            accentColor="#7c6af7"
            side="left"
            description="A serious keyboard training app with 165 levels across 11 sections — from home-row basics to impossible long-word gauntlets. Multi-profile, WPM tracking, streak system, and daily challenges."
            stats={[
              { value:165, label:"Levels" },
              { value:10, label:"Layouts" },
              { value:11, label:"Sections" },
            ]}
            features={[
              "165 levels across Foundations, Word Power, Literature, Legend Tier and more",
              "10 keyboard layouts including Colemak, Dvorak, QWERTZ, and Korean",
              "Multi-profile system — one account, multiple family members",
              "Stars, WPM personal bests, combo multipliers, and Keys currency",
              "Section confetti and unlock animations when you reach new territory",
              "Daily challenge with global leaderboard — new words every day",
            ]}
          />
        </section>

        {/* ── Divider ── */}
        <div style={{ height:1, background:"linear-gradient(90deg,transparent,#2a2a4e,transparent)", margin:"0 clamp(20px,5vw,80px)" }}/>

        {/* ── TrivQuic section ── */}
        <section id="trivquic" style={{ padding:"0 clamp(20px,5vw,80px)", maxWidth:1280, margin:"0 auto" }}>
          <AppCard
            name="TrivQuic"
            tag="TrivQuic"
            tagColor="#f59e0b"
            url="https://trivquic.vercel.app"
            accentColor="#f59e0b"
            side="right"
            description="A one-tap trivia app with 38 games across 10 categories. Answer fast, climb the leaderboard, and take on daily challenges — built for speed and competition."
            stats={[
              { value:38, label:"Games" },
              { value:10, label:"Categories" },
              { value:1, suffix:" tap", label:"to answer" },
            ]}
            features={[
              "38 trivia games across Science, History, Pop Culture, Geography and more",
              "Google sign-in with per-UID stats saved in Firebase Firestore",
              "Personal best tracking and profile page",
              "Daily challenge — one new trivia set every day",
              "Global leaderboard by username",
              "Streak multipliers and score tracking",
            ]}
          />
        </section>

        {/* ── Changelog ── */}
        <section style={{ padding:"80px clamp(20px,5vw,80px)", maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"#555", marginBottom:12 }}>What's new</div>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, margin:"0 0 12px", color:"#fff" }}>Changelog</h2>
            <p style={{ color:"#666", fontSize:15 }}>Updated every 2 additions across both apps</p>
          </div>

          {/* Filter tabs */}
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:40 }}>
            {[["all","All"],["accuratkey","AccuratKey"],["trivquic","TrivQuic"]].map(([v,l])=>(
              <button key={v} onClick={()=>setActiveFilter(v)} style={{
                padding:"7px 18px", borderRadius:99, border:`1px solid ${activeFilter===v?"#7c6af7":"#1e1e30"}`,
                background:activeFilter===v?"#7c6af722":"transparent",
                color:activeFilter===v?"#a78bfa":"#666", fontSize:12, fontWeight:700,
                cursor:"pointer", transition:"all 0.2s", letterSpacing:0.5,
              }}>{l}</button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {filtered.map((entry, i) => (
              <div key={i} style={{
                background:"#0d0d1a", border:`1px solid ${entry.color}33`,
                borderLeft:`3px solid ${entry.color}`, borderRadius:12,
                padding:"20px 24px",
                transition:"transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateX(4px)";e.currentTarget.style.boxShadow=`0 0 24px ${entry.color}18`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.boxShadow="none";}}
              >
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <span style={{ background:entry.color+"22", color:entry.color, fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:99, letterSpacing:1, textTransform:"uppercase" }}>{entry.app}</span>
                  <span style={{ color:"#444", fontSize:12, fontFamily:"monospace" }}>{entry.date}</span>
                </div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:7 }}>
                  {entry.items.map((item,j)=>(
                    <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink:0, marginTop:3 }} fill="none">
                        <circle cx="7" cy="7" r="6" fill={entry.color} opacity="0.2"/>
                        <path d="M4.5 7.5L6 9L9.5 5.5" stroke={entry.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ color:"#bbb", fontSize:14, lineHeight:1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          borderTop:"1px solid #1e1e30", padding:"40px clamp(20px,5vw,80px)",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect x="1" y="5" width="16" height="16" rx="4" fill="#7c6af7" opacity="0.9"/>
              <rect x="11" y="9" width="16" height="16" rx="4" fill="#f59e0b" opacity="0.85"/>
            </svg>
            <span style={{ color:"#444", fontSize:13 }}>ChrisProjects — chris0622ha</span>
          </div>
          <div style={{ display:"flex", gap:20 }}>
            <a href="https://accuratkey.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color:"#555", fontSize:13, textDecoration:"none" }}>AccuratKey</a>
            <a href="https://trivquic.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color:"#555", fontSize:13, textDecoration:"none" }}>TrivQuic</a>
            <a href="https://github.com/chris0622ha" target="_blank" rel="noopener noreferrer" style={{ color:"#555", fontSize:13, textDecoration:"none" }}>GitHub</a>
          </div>
        </footer>

      </main>
    </>
  );
}
