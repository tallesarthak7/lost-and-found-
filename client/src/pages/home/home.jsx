import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import FloatingLines from "../../components/floatingLines/FloatingLines.jsx";


// ── Mobile drawer ─────────────────────────────────────────────────────
const MobileMenu = ({ open, onClose }) => (
  <div
    className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
      open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div
      className={`absolute top-0 right-0 h-full w-64 bg-indigo-900/95 border-l border-white/10 p-8 flex flex-col gap-5 transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button onClick={onClose} className="self-end text-white/50 hover:text-white text-xl">✕</button>
      {["Home", "About", "Contact"].map((item) => (
        <Link
          key={item}
          to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
          onClick={onClose}
          className="text-white/70 hover:text-white text-base font-medium transition"
        >
          {item}
        </Link>
      ))}
      <div className="mt-auto flex flex-col gap-3">
        <Link to="/login" onClick={onClose}>
          <button className="w-full py-2.5 border border-white/30 rounded-xl text-white text-sm hover:bg-white/10 transition">
            Login
          </button>
        </Link>
        <Link to="/signup" onClick={onClose}>
          <button className="w-full py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────
const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col relative"
      style={{
        background: "linear-gradient(135deg, #312e81 0%, #4f46e5 40%, #7c3aed 100%)",
      }}
    >

      {/* ── FloatingLines — fills entire screen ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingLines
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={8}
          lineDistance={8}
          bendRadius={8}
          bendStrength={-2}
          interactive
          parallax={true}
          animationSpeed={1}
          gradientStart="#a78bfa"
          gradientMid="#818cf8"
          gradientEnd="#c4b5fd"
        />
      </div>

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.25) 0%, transparent 70%)",
        }}
      />

      {/* ── All content above lines ── */}
      <div className="relative z-10 flex flex-col h-full">

        {/* ── Navbar ── */}
        <nav className="flex items-center justify-between px-6 md:px-10 py-4 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <span className="font-black text-xl text-white tracking-tight">
              Campus L&F
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {["Home", "About", "Contact"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="text-white/70 hover:text-white text-sm font-medium transition"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <button className="px-5 py-2 text-sm font-medium text-white border border-white/30 rounded-xl hover:bg-white/10 transition">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-5 py-2 text-sm font-bold bg-white text-indigo-700 rounded-xl hover:bg-indigo-100 transition shadow-lg shadow-indigo-900/30">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col gap-1.5 p-2"
          >
            <span className="w-6 h-0.5 bg-white rounded" />
            <span className="w-4 h-0.5 bg-white rounded" />
            <span className="w-6 h-0.5 bg-white rounded" />
          </button>
        </nav>

        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* ── Hero — takes remaining height ── */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-8">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-white/10 text-white/80 text-xs font-semibold tracking-widest uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse" />
            Smart Campus System
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-white mb-4 max-w-3xl">
            Lost Something
            <br />
            <span className="text-indigo-200">on Campus?</span>
          </h1>

          {/* Sub */}
          <p className="text-white/60 text-sm md:text-base max-w-lg leading-relaxed mb-8">
            Smart matching connects lost items with their owners — fast,
            secure, and verified by campus admins.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link to="/login">
              <button className="px-7 py-3 bg-white text-indigo-700 rounded-2xl font-bold text-sm hover:bg-indigo-100 transition shadow-xl shadow-indigo-900/30 hover:-translate-y-0.5 duration-200">
                Report Lost Item
              </button>
            </Link>
            <Link to="/login">
              <button className="px-7 py-3 border border-white/30 rounded-2xl font-bold text-sm text-white hover:bg-white/10 hover:-translate-y-0.5 transition duration-200">
                Report Found Item
              </button>
            </Link>
          </div>

          {/* Feature pills — 3 compact cards in one row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
            {[
              { title: "Smart Matching",   desc: "AI-powered item matching" },
              { title: "Verified Claims",  desc: "Admin-reviewed recovery"  },
              { title: "Secure Messaging", desc: "Safe communication"       },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 text-left hover:bg-white/15 transition"
              >
                <span className="text-xl">{}</span>
                <p className="text-white font-bold text-sm mt-1">{title}</p>
                <p className="text-white/50 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="text-center py-3 text-white/30 text-xs shrink-0">
          © 2026 Smart Campus Lost & Found System
        </footer>

      </div>
    </div>
  );
};

export default Home;