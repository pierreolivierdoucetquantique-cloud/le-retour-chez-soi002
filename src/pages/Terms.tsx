import LegalPage from "../components/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Conditions"
      title="Conditions d'utilisation"
      updated="16 juillet 2026"
      sections={[
        {
          heading: "Acceptation des conditions",
          body: "En utilisant ce site et en réservant nos services, vous acceptez les présentes conditions d'utilisation dans leur intégralité.",
        },
        {
          heading: "Réservations et paiements",
          body: "Les réservations sont confirmées automatiquement après paiement complet ou partiel. Les prix affichés sont en dollars canadiens et incluent les taxes applicables (TPS/TVQ).",
        },
        {
          heading: "Annulation et remboursement",
          body: "Les rendez-vous peuvent être annulés gratuitement jusqu'à 24 heures avant l'heure prévue. Passé ce délai, des frais peuvent s'appliquer, sauf circonstances exceptionnelles évaluées au cas par cas.",
        },
        {
          heading: "Propriété intellectuelle",
          body: "L'ensemble du contenu du site (textes, images, vidéos, formations) est protégé par le droit d'auteur et ne peut être reproduit sans autorisation écrite.",
        },
        {
          heading: "Limitation de responsabilité",
          body: "Nos services d'accompagnement ne remplacent pas un suivi médical ou psychologique professionnel. Consultez un professionnel de la santé pour toute question relevant de ce champ.",
        },
      ]}
    />
  );
}
