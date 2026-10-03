"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    function dismiss(event: PointerEvent) { if (!menu.current?.contains(event.target as Node)) setMenuOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setMenuOpen(false); }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, []);
  const links = isSignedIn
    ? [["/dashboard", "My workspace"], ["/questionnaire", "My plan"], ["/dispute-center", "Letter Lab"]]
    : [["/#how-it-works", "How it works"], ["/dispute-center", "Letter Lab"], ["/#plans", "Plans"]];
  return <nav ref={menu} className="site-nav" aria-label="Main navigation">
    <div className="nav-inner">
      <Link className="site-brand" href={isSignedIn ? "/dashboard" : "/"}>AI CreditLab<span className="brand-mark">.</span></Link>
      <div className="nav-links">{links.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</div>
      <div className="nav-actions">
        {isSignedIn ? <div className="desktop-account"><SignOutButton><button className="nav-text-button" type="button">Sign out</button></SignOutButton></div> : <><Link className="nav-signin" href="/sign-in">Sign in</Link><Link className="nav-start" href="/questionnaire">Start free</Link></>}
        <button type="button" className="nav-menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}><span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span></button>
      </div>
    </div>
    {menuOpen && <div id="mobile-navigation" className="mobile-navigation">{links.map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}{isSignedIn ? <SignOutButton><button type="button">Sign out</button></SignOutButton> : <Link href="/sign-in" onClick={() => setMenuOpen(false)}>Sign in</Link>}</div>}
  </nav>;
}
