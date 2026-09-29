"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  return <nav className="site-nav" aria-label="Main navigation">
    <div className="nav-inner">
      <Link className="site-brand" href={isSignedIn ? "/dashboard" : "/"}>AI CreditLab<span className="brand-mark">.</span></Link>
      <div className="nav-links"><Link href="/dispute-center">The Letter Lab</Link><Link href="/questionnaire">My game plan</Link></div>
      <div className="nav-account">
        <button type="button" className="nav-account-button" aria-expanded={menuOpen} aria-label={isSignedIn ? "Account menu" : "Sign in menu"} onClick={() => setMenuOpen(!menuOpen)}>{isSignedIn ? "Account" : "Sign in"}<span aria-hidden="true">⌄</span></button>
        {menuOpen && <div className="nav-dropdown">{isSignedIn ? <><Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link><SignOutButton><button type="button">Sign out</button></SignOutButton></> : <Link href="/sign-in" onClick={() => setMenuOpen(false)}>Sign in</Link>}</div>}
      </div>
    </div>
  </nav>;
}
