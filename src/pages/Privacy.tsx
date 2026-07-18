import LegalPage from "../components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Politique"
      title="Politique de confidentialité"
      updated="16 juillet 2026"
      sections={[
        {
          heading: "Renseignements que nous recueillons",
          body: "Nous recueillons les renseignements que vous nous fournissez directement (nom, courriel, informations de réservation et de paiement) ainsi que des données techniques limitées liées à l'utilisation du site.",
        },
        {
          heading: "Utilisation des renseignements",
          body: "Vos renseignements servent à gérer vos rendez-vous, traiter vos paiements, communiquer avec vous et améliorer nos services. Ils ne sont jamais vendus à des tiers.",
        },
        {
          heading: "Conformité à la Loi 25 et au RGPD",
          body: "Conformément à la Loi 25 du Québec et, le cas échéant, au RGPD, vous pouvez en tout temps demander l'accès, la rectification ou la suppression de vos renseignements personnels depuis votre espace membre ou en nous contactant directement.",
        },
        {
          heading: "Conservation et sécurité",
          body: "Les données sont conservées de façon sécurisée, chiffrées en transit, et supprimées lorsqu'elles ne sont plus nécessaires aux fins pour lesquelles elles ont été recueillies.",
        },
        {
          heading: "Nous contacter",
          body: "Pour toute question relative à cette politique ou pour exercer vos droits, écrivez-nous à confidentialite@leretourchezsoi.ca.",
        },
      ]}
    />
  );
}
