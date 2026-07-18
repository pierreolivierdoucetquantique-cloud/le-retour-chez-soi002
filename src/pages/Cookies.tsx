import LegalPage from "../components/LegalPage";

export default function Cookies() {
  return (
    <LegalPage
      eyebrow="Politique"
      title="Politique de cookies"
      updated="16 juillet 2026"
      sections={[
        {
          heading: "Ce que sont les cookies",
          body: "Les cookies sont de petits fichiers déposés sur votre appareil pour permettre au site de fonctionner correctement et d'analyser son utilisation de façon agrégée.",
        },
        {
          heading: "Types de cookies utilisés",
          body: "Nous utilisons des cookies essentiels (connexion, panier, préférences), des cookies de mesure d'audience et, avec votre consentement seulement, des cookies liés aux communications marketing.",
        },
        {
          heading: "Votre consentement",
          body: "Un bandeau de consentement vous permet, dès votre première visite, d'accepter ou de refuser les cookies non essentiels. Vous pouvez modifier ce choix en tout temps depuis le pied de page du site.",
        },
      ]}
    />
  );
}
