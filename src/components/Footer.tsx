export default function Footer() {
  return (
    <footer className="bg-night text-warmwhite/85 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-12">
          <div>
            <p className="font-display text-2xl text-warmwhite">
              Le Retour Chez Soi
            </p>
            <p className="mt-4 text-sm leading-relaxed text-warmwhite/60 max-w-xs">
              Un espace de transformation personnelle, d'accompagnement
              énergétique et de communauté, ancré au Québec.
            </p>
          </div>

          <div>
            <p className="label-eyebrow text-gold mb-4">Explorer</p>
            <ul className="space-y-2.5 text-sm text-warmwhite/70">
              <li><a href="/services" className="hover:text-warmwhite transition-colors">Services</a></li>
              <li><a href="/evenements" className="hover:text-warmwhite transition-colors">Événements</a></li>
              <li><a href="/blog" className="hover:text-warmwhite transition-colors">Blogue</a></li>
              <li><a href="/boutique" className="hover:text-warmwhite transition-colors">Boutique</a></li>
              <li><a href="/temoignages" className="hover:text-warmwhite transition-colors">Témoignages</a></li>
            </ul>
          </div>

          <div>
            <p className="label-eyebrow text-gold mb-4">Compte</p>
            <ul className="space-y-2.5 text-sm text-warmwhite/70">
              <li><a href="/connexion" className="hover:text-warmwhite transition-colors">Connexion</a></li>
              <li><a href="/inscription" className="hover:text-warmwhite transition-colors">Inscription</a></li>
              <li><a href="/tableau-de-bord" className="hover:text-warmwhite transition-colors">Mon espace</a></li>
              <li><a href="/contact" className="hover:text-warmwhite transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <p className="label-eyebrow text-gold mb-4">Légal</p>
            <ul className="space-y-2.5 text-sm text-warmwhite/70">
              <li><a href="/confidentialite" className="hover:text-warmwhite transition-colors">Politique de confidentialité</a></li>
              <li><a href="/conditions" className="hover:text-warmwhite transition-colors">Conditions d'utilisation</a></li>
              <li><a href="/cookies" className="hover:text-warmwhite transition-colors">Politique de cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-warmwhite/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warmwhite/50">
          <p>© {new Date().getFullYear()} Le Retour Chez Soi. Tous droits réservés.</p>
          <p>Conforme à la Loi 25 du Québec</p>
        </div>
      </div>
    </footer>
  );
}
