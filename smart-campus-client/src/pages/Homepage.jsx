import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// ── Unsplash image URLs ────────────────────────────────────────────────────────
const IMAGES = {
  hero:      "https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=80",
  resources: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  booking:   "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
  tickets:   "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80",
  campus1:   "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=700&q=80",
  campus2:   "https://cms.uic.edu/wp-content/uploads/2015/06/campus-resources_technology.jpg",
  campus3:   "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=700&q=80",
  team:      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
  about:     "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80",
};

// ── Navbar ─────────────────────────────────────────────────────────────────────
function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className={`font-bold text-lg tracking-tight ${scrolled ? "text-gray-900" : "text-white"}`}>
              Smart Campus
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "Features", href: "#features" },
              { label: "About", href: "#about" },
              { label: "Contact", href: "#contact" },
            ].map(link => (
              <a key={link.label} href={link.href}
                className={`text-sm font-medium transition-colors hover:text-teal-500 ${
                  scrolled ? "text-gray-600" : "text-white/90"
                }`}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                scrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}>
              Sign In
            </Link>
            <Link to="/register"
              className="text-sm font-semibold px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? "text-gray-700" : "text-white"}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-xl border border-gray-100 mb-4 p-4">
            <div className="space-y-1 mb-4">
              {["Home", "Features", "About", "Contact"].map(item => (
                <a key={item} href={item === "Home" ? "/" : `#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={IMAGES.hero} alt="SLIIT Campus"
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-800/75 to-teal-700/50" />
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-32 right-20 w-64 h-64 border border-white/10 rounded-full" />
      <div className="absolute top-48 right-32 w-40 h-40 border border-white/10 rounded-full" />
      <div className="absolute bottom-20 left-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            SLIIT Faculty of Computing — 2026
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Smart Campus
            <span className="block text-teal-400">Operations Hub</span>
          </h1>

          <p className="text-lg text-white/75 leading-relaxed mb-8 max-w-lg">
            The all-in-one platform for managing facilities, bookings,
            and incident reports across SLIIT campus. Streamline your
            university experience today.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-900/40 text-sm">
              Get Started Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20 backdrop-blur-sm text-sm">
              Sign In
            </Link>
          </div>
          
          {/* Stats */}
          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { value: "500+", label: "Resources Available" },
              { value: "2,000+", label: "Active Students" },
              { value: "24/7", label: "System Uptime" },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-white/60 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cards preview */}
      <div className="absolute right-8 lg:right-20 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
        {[
          { icon: "📅", title: "Lab A101 Booked", sub: "Tomorrow, 10:00 AM", color: "bg-white/95" },
          { icon: "✅", title: "Booking Approved", sub: "Conference Room B", color: "bg-teal-500" },
          { icon: "🎫", title: "Ticket #045 Resolved", sub: "Projector fixed", color: "bg-white/95" },
        ].map((card, i) => (
          <div key={i}
            style={{ animationDelay: `${i * 0.15}s` }}
            className={`${card.color} rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl backdrop-blur-md border border-white/20 min-w-[220px] animate-[slideIn_0.5s_ease_forwards]`}>
            <span className="text-2xl">{card.icon}</span>
            <div>
              <p className={`text-sm font-bold ${card.color === "bg-teal-500" ? "text-white" : "text-gray-800"}`}>
                {card.title}
              </p>
              <p className={`text-xs ${card.color === "bg-teal-500" ? "text-teal-100" : "text-gray-500"}`}>
                {card.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

// ── Features Section ───────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: "🏛️",
      title: "Facilities Catalogue",
      description: "Browse and search all campus resources — lecture halls, labs, equipment and meeting rooms with real-time availability.",
      image: IMAGES.resources,
      tag: "Module A",
      color: "teal",
    },
    {
      icon: "📅",
      title: "Smart Booking System",
      description: "Request and manage bookings with automatic conflict detection. Admins approve or reject with full visibility.",
      image: IMAGES.booking,
      tag: "Module B",
      color: "blue",
    },
    {
      icon: "🎫",
      title: "Incident Ticketing",
      description: "Report facility issues with photo evidence. Track status from OPEN to RESOLVED with technician assignments.",
      image: IMAGES.tickets,
      tag: "Module C",
      color: "amber",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full mb-4">
            Platform Features
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Everything you need,
            <span className="text-teal-600"> in one place</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            A unified platform built specifically for SLIIT students, staff,
            and administrators to manage campus operations effortlessly.
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-20">
          {features.map((f, i) => (
            <div key={f.title}
              className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 items-center`}>

              {/* Image */}
              <div className="lg:w-1/2">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img src={f.image} alt={f.title}
                    className="w-full h-72 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">
                      {f.tag}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2">
                <div className="text-5xl mb-5">{f.icon}</div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-lg mb-6">
                  {f.description}
                </p>
                <ul className="space-y-3">
                  {f.title === "Facilities Catalogue" && [
                    "Search by type, capacity, and building",
                    "Real-time availability status",
                    "Detailed resource information",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                  {f.title === "Smart Booking System" && [
                    "Automatic time conflict detection",
                    "PENDING → APPROVED workflow",
                    "Email notifications on status change",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                  {f.title === "Incident Ticketing" && [
                    "Upload up to 3 photo attachments",
                    "Priority levels: LOW to CRITICAL",
                    "Full comment thread per ticket",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors">
                  Get Started →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { step: "01", icon: "📝", title: "Register", desc: "Request access with your SLIIT email. Admin approves your account." },
    { step: "02", icon: "🔐", title: "Sign In", desc: "Log in with Google OAuth using your institutional email address." },
    { step: "03", icon: "🔍", title: "Browse", desc: "Explore the facilities catalogue and find the resource you need." },
    { step: "04", icon: "✅", title: "Book & Go", desc: "Submit a booking request and get notified when it's approved." },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-4xl font-black text-gray-900">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-teal-300 to-transparent z-0" />
              )}
              <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative z-10">
                <div className="text-xs font-black text-teal-500 mb-4 tracking-widest">{s.step}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Campus Gallery ─────────────────────────────────────────────────────────────
function GallerySection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full mb-4">
            Our Campus
          </span>
          <h2 className="text-4xl font-black text-gray-900">
            World-class facilities
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        {/* Left Image */}
        <div className="col-span-12 lg:col-span-6 rounded-3xl overflow-hidden">
            <img 
            src={IMAGES.campus1} 
            alt="Campus"
            className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-700"
            />
        </div>

        {/* Right Images */}
        <div className="col-span-12 lg:col-span-6 grid grid-rows-2 gap-4">
            
            <div className="rounded-3xl overflow-hidden">
            <img 
                src={IMAGES.campus2} 
                alt="Campus"
                className="w-full h-[145px] object-cover hover:scale-105 transition-transform duration-700"
            />
            </div>

            <div className="rounded-3xl overflow-hidden">
            <img 
                src={IMAGES.campus3} 
                alt="Campus"
                className="w-full h-[145px] object-cover hover:scale-105 transition-transform duration-700"
            />
            </div>

        </div>
        </div>
      </div>
    </section>
  );
}

// ── Roles Section ──────────────────────────────────────────────────────────────
function RolesSection() {
  const roles = [
    {
      role: "Student / Staff",
      icon: "🎓",
      color: "bg-teal-600",
      perks: [
        "Browse all campus resources",
        "Book labs and lecture halls",
        "Report facility issues",
        "Track booking status",
        "Get real-time notifications",
      ],
    },
    {
      role: "Administrator",
      icon: "🛡️",
      color: "bg-slate-800",
      perks: [
        "Manage all campus resources",
        "Approve or reject bookings",
        "Assign maintenance technicians",
        "View analytics dashboard",
        "Manage user registrations",
      ],
    },
    {
      role: "Technician",
      icon: "🔧",
      color: "bg-amber-600",
      perks: [
        "View assigned tickets",
        "Update ticket status",
        "Add resolution notes",
        "Upload repair evidence",
        "Communicate with reporters",
      ],
    },
  ];

  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-teal-400 uppercase tracking-widest bg-teal-900/50 px-4 py-2 rounded-full mb-4">
            For Everyone
          </span>
          <h2 className="text-4xl font-black text-white mb-4">
            Built for every role
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Whether you're a student, admin, or technician — Smart Campus
            has the tools you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(r => (
            <div key={r.role} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className={`w-14 h-14 ${r.color} rounded-2xl flex items-center justify-center text-2xl mb-5`}>
                {r.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{r.role}</h3>
              <ul className="space-y-3">
                {r.perks.map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-gray-400 text-sm">
                    <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About Section ──────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image collage */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src={IMAGES.team} alt="SLIIT Team"
                className="w-full h-80 object-cover" />
            </div>
            {/* Floating info card */}
            <div className="absolute -bottom-6 -right-6 bg-teal-600 text-white rounded-2xl px-6 py-5 shadow-xl">
              <p className="text-3xl font-black">IT3030</p>
              <p className="text-teal-200 text-sm">PAF Assignment 2026</p>
            </div>
            {/* Small badge */}
            <div className="absolute top-4 left-4 bg-white rounded-xl px-4 py-3 shadow-lg">
              <p className="text-xs font-bold text-gray-500">BUILT WITH</p>
              <div className="flex gap-2 mt-1">
                {["Spring Boot", "React", "MySQL"].map(t => (
                  <span key={t} className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-md">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Text content */}
          <div>
            <span className="inline-block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full mb-6">
              About the Project
            </span>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Modernising campus operations at SLIIT
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Smart Campus Operations Hub is a production-inspired web system
              developed as part of the IT3030 Programming Applications and
              Frameworks module at SLIIT Faculty of Computing.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Our platform replaces manual booking sheets and scattered
              maintenance requests with a unified digital system — giving
              everyone from students to administrators a seamless experience.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "5", label: "Core Modules" },
                { value: "8+", label: "Team Members" },
                { value: "30+", label: "API Endpoints" },
                { value: "100%", label: "Cloud Ready" },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-3xl font-black text-teal-600">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ─────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 bg-teal-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
          Ready to simplify
          <br />campus management?
        </h2>
        <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Join thousands of SLIIT students and staff already using
          Smart Campus to manage their university experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register"
            className="px-8 py-4 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-lg text-sm">
            Request Access →
          </Link>
          <Link to="/login"
            className="px-8 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-400 transition-colors border border-teal-400 text-sm">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Contact Section ────────────────────────────────────────────────────────────
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left */}
          <div>
            <span className="inline-block text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-4 py-2 rounded-full mb-6">
              Contact Us
            </span>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Get in touch
            </h2>
            <p className="text-gray-500 leading-relaxed mb-10">
              Have questions about Smart Campus? Reach out to our team
              and we'll get back to you as soon as possible.
            </p>
            <div className="space-y-5">
              {[
                { icon: "📍", label: "Location", value: "SLIIT, Malabe, Sri Lanka" },
                { icon: "📧", label: "Email", value: "smartcampus@sliit.lk" },
                { icon: "📞", label: "Phone", value: "+94 11 754 4801" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                    <p className="text-gray-700 font-medium text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-3xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm">We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Send a message</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => handle("name", e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handle("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => handle("message", e.target.value)}
                    placeholder="How can we help you?"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
                <button type="submit"
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Smart Campus Hub</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              A modern campus management system built for SLIIT Faculty of
              Computing — IT3030 PAF Assignment 2026.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              {["Browse Resources", "My Bookings", "Report Issue", "Notifications"].map(l => (
                <li key={l}><a href="#" className="hover:text-teal-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {["Sign In", "Register", "Dashboard", "Settings"].map(l => (
                <li key={l}><Link to={`/${l.toLowerCase().replace(" ", "")}`} className="hover:text-teal-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © 2026 Smart Campus Hub — SLIIT Faculty of Computing. IT3030 Group Assignment.
          </p>
          <div className="flex gap-2">
            {["Spring Boot", "React.js", "MySQL", "Tailwind CSS"].map(t => (
              <span key={t} className="text-xs bg-white/5 border border-white/10 text-gray-500 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Home Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="font-sans">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <PublicNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GallerySection />
      <RolesSection />
      <AboutSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </div>
  );
}
