import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Boutique", href: "/boutique" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-panel backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-5">
        <Link to="/" className="font-display text-2xl text-wood-deep tracking-tight">
          Le Retour Chez Soi
        </Link>

        <ul className="hidden md:flex items-center gap-9 font-label text-[0.8rem] uppercase tracking-[0.1em] text-stone">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link to={l.href} className="hover:text-sage-deep transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/tableau-de-bord"
                className="font-label text-[0.8rem] uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
              >
                {user.firstName}
              </Link>
              <button
                onClick={() => logout()}
                className="font-label text-[0.8rem] uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/connexion"
              className="font-label text-[0.8rem] uppercase tracking-[0.1em] text-stone hover:text-sage-deep transition-colors"
            >
              Connexion
            </Link>
          )}
          <Link
            to="/services"
            className="rounded-full bg-sage-deep text-warmwhite px-5 py-2.5 font-label text-[0.8rem] uppercase tracking-[0.1em] hover:bg-wood transition-colors"
          >
            Prendre RDV
          </Link>
        </div>

        <button
          className="md:hidden text-wood-deep"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass bg-panel border-t border-sand px-6 py-6 flex flex-col gap-5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="font-label uppercase tracking-[0.1em] text-sm text-stone"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/services"
            className="rounded-full bg-sage-deep text-warmwhite px-5 py-3 text-center font-label text-sm uppercase tracking-[0.1em]"
          >
            Prendre RDV
          </Link>
        </div>
      )}
    </header>
  );
}
