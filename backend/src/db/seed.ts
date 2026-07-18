import { db, sql } from "./client";
import {
  users,
  services,
  availabilities,
  testimonials,
  events,
  articles,
  products,
} from "./schema";
import { hashPassword } from "../utils/password";
import { newId } from "../utils/id";

async function seed() {
  console.log("Semis de la base de données...");

  const adminPassword = await hashPassword("ChangeMoi123!");
  await db.insert(users).values({
    id: newId(),
    email: "admin@leretourchezsoi.ca",
    passwordHash: adminPassword,
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    isActive: true,
    emailVerifiedAt: new Date(),
  });

  const serviceRows = [
    {
      id: newId(),
      slug: "seances-energetiques",
      title: "Séances énergétiques",
      description:
        "Un accompagnement en douceur pour relâcher les tensions accumulées et retrouver un état d'équilibre intérieur.",
      longDescription:
        "La séance se déroule allongé·e, dans un espace calme et chauffé. Par un travail énergétique doux, nous accompagnons le corps à relâcher les tensions accumulées.",
      includes: JSON.stringify([
        "Entretien d'accueil de 10 minutes",
        "Séance énergétique de 45 minutes",
        "Temps d'intégration et conseils personnalisés",
      ]),
      relatedSlugs: JSON.stringify(["coaching-individuel", "retraites"]),
      durationMinutes: 60,
      priceCents: 12000,
      isActive: true,
    },
    {
      id: newId(),
      slug: "coaching-individuel",
      title: "Coaching individuel",
      description:
        "Des rencontres sur mesure pour clarifier vos objectifs et avancer avec confiance vers ce qui compte vraiment.",
      longDescription:
        "Un espace de parole structuré, sans jugement, pour nommer ce qui bloque et construire un plan d'action réaliste.",
      includes: JSON.stringify([
        "Bilan initial approfondi (75 minutes)",
        "Séances de suivi de 50 minutes",
        "Résumé écrit et pistes concrètes après chaque rencontre",
      ]),
      relatedSlugs: JSON.stringify(["seances-energetiques", "formations"]),
      durationMinutes: 50,
      priceCents: 15000,
      isActive: true,
    },
    {
      id: newId(),
      slug: "retraites",
      title: "Retraites",
      description:
        "Des séjours immersifs en nature, pensés pour se recentrer loin du bruit du quotidien.",
      longDescription:
        "Trois à cinq jours en petit groupe, dans un lieu entouré de nature, pour ralentir vraiment.",
      includes: JSON.stringify([
        "Hébergement et repas complets",
        "Ateliers guidés quotidiens",
        "Temps libre et accompagnement individuel sur demande",
      ]),
      relatedSlugs: JSON.stringify(["seances-energetiques", "formations"]),
      durationMinutes: 2880,
      priceCents: 45000,
      isActive: true,
    },
    {
      id: newId(),
      slug: "formations",
      title: "Formations",
      description:
        "Des parcours d'apprentissage en ligne pour approfondir votre pratique à votre rythme.",
      longDescription:
        "Des formations en ligne composées de modules vidéo, de documents à télécharger et d'exercices pratiques, accessibles à vie une fois achetées.",
      includes: JSON.stringify([
        "Accès à vie aux modules vidéo",
        "Documents et fiches pratiques téléchargeables",
        "Certificat de complétion",
      ]),
      relatedSlugs: JSON.stringify(["coaching-individuel", "retraites"]),
      durationMinutes: 180,
      priceCents: 28000,
      isActive: true,
    },
  ];
  for (const s of serviceRows) await db.insert(services).values(s);

  // Disponibilités : lundi à vendredi, 9h à 17h, tampon de 15 minutes
  for (let day = 1; day <= 5; day++) {
    await db.insert(availabilities).values({
      id: newId(),
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      bufferMinutes: 15,
    });
  }

  const testimonialRows = [
    { id: newId(), name: "Marie-Ève L.", quote: "J'ai retrouvé une paix que je ne pensais plus possible.", serviceId: serviceRows[0].id, isApproved: true },
    { id: newId(), name: "Simon T.", quote: "Un accompagnement humain, sans jugement, qui m'a aidé à voir clair.", serviceId: serviceRows[1].id, isApproved: true },
    { id: newId(), name: "Josée B.", quote: "La retraite d'automne a changé ma façon d'habiter mon corps.", serviceId: serviceRows[2].id, isApproved: true },
  ];
  for (const t of testimonialRows) await db.insert(testimonials).values(t);

  const eventRows = [
    { id: newId(), title: "Cercle de pleine lune", location: "Studio de Québec", startsAt: new Date("2026-08-09T23:00:00.000Z") },
    { id: newId(), title: "Retraite d'automne — Charlevoix", location: "Baie-Saint-Paul", startsAt: new Date("2026-09-19T13:00:00.000Z") },
    { id: newId(), title: "Atelier respiration & ancrage", location: "En ligne", startsAt: new Date("2026-10-04T17:00:00.000Z") },
  ];
  for (const e of eventRows) await db.insert(events).values(e);

  const articleRows = [
    {
      id: newId(),
      slug: "cinq-facons-de-revenir-a-soi",
      title: "Cinq façons de revenir à soi en fin de journée",
      excerpt: "De petits rituels simples pour marquer la transition entre le travail et le repos.",
      content: "Contenu complet à venir.",
      status: "published" as const,
      publishedAt: new Date("2026-07-02T12:00:00.000Z"),
    },
    {
      id: newId(),
      slug: "comprendre-le-travail-energetique",
      title: "Comprendre le travail énergétique, sans mysticisme",
      excerpt: "Une explication claire et accessible de ce qui se passe réellement pendant une séance.",
      content: "Contenu complet à venir.",
      status: "published" as const,
      publishedAt: new Date("2026-06-18T12:00:00.000Z"),
    },
  ];
  for (const a of articleRows) await db.insert(articles).values(a);

  const productRows = [
    { id: newId(), slug: "carte-cadeau-100", title: "Carte-cadeau — 100 $", priceCents: 10000, type: "gift_card" as const, isActive: true },
    { id: newId(), slug: "guide-respiration", title: "Guide numérique — Respiration et ancrage", priceCents: 2400, type: "digital" as const, isActive: true },
  ];
  for (const p of productRows) await db.insert(products).values(p);

  console.log("Semis terminé.");
  console.log("Compte administrateur : admin@leretourchezsoi.ca / ChangeMoi123!");
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void sql.end();
  });
