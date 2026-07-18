# Le Retour Chez Soi — API

Backend Node.js / Express / TypeScript pour la plateforme Le Retour Chez Soi.
PostgreSQL via Drizzle ORM, en développement comme en production — la façon
la plus simple de démarrer une instance locale est `docker compose up db`
depuis la racine du dépôt (voir `DEPLOYMENT.md`).

## Démarrage rapide

```bash
# Depuis la racine du dépôt : lance une instance PostgreSQL locale
docker compose up -d db

cd backend
npm install
cp .env.example .env
npm run db:push             # crée le schéma dans la base PostgreSQL
npm run db:seed             # données de démonstration + compte admin
npm run dev                 # démarre l'API sur http://localhost:4000
```

Pas Docker sous la main ? Toute instance PostgreSQL fonctionne — ajustez
simplement `DATABASE_URL` dans `.env`.

Compte administrateur créé par le seed :
`admin@leretourchezsoi.ca` / `ChangeMoi123!` — **à changer immédiatement en production.**

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Démarre l'API en mode développement (rechargement automatique) |
| `npm run build` | Compile le TypeScript vers `dist/` |
| `npm start` | Démarre la version compilée |
| `npm run typecheck` | Vérifie les types sans compiler |
| `npm run db:generate` | Génère une migration SQL à partir du schéma |
| `npm run db:push` | Applique le schéma directement (pratique en développement) |
| `npm run db:migrate` | Applique les migrations générées via le script de production (`src/db/migrate.ts`) |
| `npm run db:seed` | Peuple la base avec des données de démonstration |
| `npm run db:studio` | Ouvre Drizzle Studio pour explorer les données |

## Architecture

```
src/
  app.ts               Assemblage de l'application Express (middlewares, routes)
  index.ts              Point d'entrée (démarre le serveur)
  config/               Variables d'environnement, taux de taxes
  db/
    schema.ts            Schéma Drizzle (15 tables)
    client.ts             Connexion SQLite/Drizzle
    seed.ts                Script de peuplement
  middleware/
    auth.ts                Vérification JWT, contrôle des rôles
    errorHandler.ts          Gestion centralisée des erreurs
  routes/                Une route Express par ressource
  validators/            Schémas Zod pour chaque payload entrant
  services/              Logique métier réutilisable (ex. numérotation des factures)
  utils/                 JWT, mots de passe, erreurs applicatives, identifiants
```

## Rôles et permissions

`super_admin` > `admin` > `employee` / `practitioner` > `client` > `guest`

- Les routes publiques (services, blog publié, événements, témoignages approuvés,
  produits) sont accessibles sans authentification.
- Les routes de rendez-vous et de commandes nécessitent une connexion.
- Les routes de gestion de contenu (créer/modifier des services, articles,
  événements, produits) nécessitent un rôle `employee` ou supérieur.
- Les routes utilisateurs (`/api/users`) nécessitent un rôle `admin` ou supérieur ;
  seul un `super_admin` peut promouvoir un autre compte au rang de `super_admin`.

## Aperçu des routes principales

| Méthode | Route | Accès |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET  | `/api/auth/me` | Connecté |
| GET  | `/api/services` | Public |
| POST/PATCH/DELETE | `/api/services` | Personnel |
| GET  | `/api/appointments/availability?serviceId&date` | Public |
| POST | `/api/appointments` | Connecté |
| POST | `/api/appointments/:id/checkout` | Titulaire du rendez-vous (dépôt ou paiement complet) |
| PATCH | `/api/appointments/:id/status` | Propriétaire (annulation) ou personnel |
| GET  | `/api/blog` | Public (articles publiés) |
| POST/PATCH/DELETE | `/api/blog` | Personnel |
| GET  | `/api/events` | Public |
| GET  | `/api/testimonials` | Public (approuvés) |
| POST | `/api/testimonials` | Connecté (attend l'approbation) |
| GET  | `/api/products` | Public |
| POST | `/api/orders` | Connecté — calcule TPS/TVQ et génère une facture |
| POST | `/api/contact` | Public |
| POST | `/api/newsletter` | Public |
| GET/PATCH | `/api/users` | Admin |
| POST | `/api/webhooks/stripe` | Stripe (signature vérifiée) |
| POST | `/api/admin/reminders/run` | Personnel (déclenchement manuel du rappel 24h) |
| GET | `/api/calendar/google/status` | Personnel |
| GET | `/api/calendar/google/connect` | Personnel (redirection OAuth) |
| GET | `/api/calendar/google/callback` | Public (Google uniquement, signature du flux OAuth) |
| DELETE | `/api/calendar/google` | Personnel |

## Ce qui est déjà fonctionnel

- Inscription/connexion avec JWT (cookie httpOnly + en-tête `Authorization`)
- Réservation avec vérification des heures d'ouverture, des jours bloqués,
  et prévention des chevauchements (avec tampon configurable)
- Calcul automatique des taxes (TPS 5 % + TVQ 9,975 %) et numérotation
  séquentielle des factures (`FACT-2026-000001`)
- Contrôle d'accès par rôle sur toutes les routes de gestion
- Limitation de débit (globale + stricte sur `/api/auth`)
- Validation stricte de toutes les entrées via Zod
- **Stripe Checkout** : la commande boutique crée une vraie session de
  paiement hébergée par Stripe ; un webhook (`POST /api/webhooks/stripe`)
  marque la commande et la facture comme payées à la réception de
  l'événement `checkout.session.completed`
- **Resend** : courriels transactionnels envoyés à l'inscription, à la
  réservation, à l'annulation, au contact (accusé + notification interne),
  à l'infolettre, et au reçu de paiement
- **Rappel automatique 24h avant un rendez-vous** : un planificateur
  (`node-cron`) vérifie toutes les 15 minutes les rendez-vous `pending`/
  `confirmed` qui débutent dans 23 à 25 heures et n'ont pas encore reçu leur
  rappel, envoie le courriel, puis marque `reminderSentAt` pour ne jamais
  le renvoyer deux fois. Testé de bout en bout (envoi confirmé, puis
  ré-exécution confirmée idempotente). Déclenchement manuel possible via
  `POST /api/admin/reminders/run` (réservé au personnel) pour tester sans
  attendre le prochain passage du planificateur.
- **Synchronisation Google Calendar** : une fois connecté (OAuth2, voir
  ci-dessous), chaque réservation crée automatiquement un événement dans le
  calendrier ; son annulation le supprime. Un problème de synchronisation
  n'empêche jamais la réservation elle-même — testé et confirmé (réservation
  réussie avec `googleEventId: null` quand rien n'est connecté, sans erreur
  journalisée).
- **Paiement de dépôt ou en totalité pour les rendez-vous** : depuis le
  tableau de bord, la personne peut payer un dépôt (30 % du prix par
  défaut, ajustable dans `backend/src/config/payment.ts`) ou le montant
  complet via Stripe Checkout. Le paiement confirmé (webhook) passe
  automatiquement le rendez-vous au statut `confirmed` et envoie un reçu.
  Testé de bout en bout : calcul du dépôt avec taxes vérifié (120 $ → dépôt
  de 41,39 $ taxes incluses), un rendez-vous déjà payé refuse toute
  nouvelle tentative (409), et seul le titulaire du rendez-vous peut le
  payer (403 sinon).
- Panneau d'administration complet (services, blog, événements, boutique,
  témoignages, rendez-vous, calendrier, utilisateurs) — voir le README du
  frontend

### Configurer Google Calendar

1. Dans la [Google Cloud Console](https://console.cloud.google.com/), créez
   un projet, activez l'API **Google Calendar**, puis configurez l'écran de
   consentement OAuth (type Externe suffit pour un usage interne restreint).
2. Créez des identifiants **OAuth 2.0 Client ID** de type « Application Web ».
   Ajoutez `http://localhost:4000/api/calendar/google/callback` (et l'URL de
   production équivalente) comme URI de redirection autorisée.
3. Copiez le Client ID et le Client Secret dans `GOOGLE_CLIENT_ID` et
   `GOOGLE_CLIENT_SECRET`.
4. Depuis le panneau d'administration → Calendrier, cliquez sur
   « Connecter Google Calendar » et autorisez l'accès avec le compte Google
   dont vous voulez utiliser le calendrier.

Sans ces variables, la section reste visible dans l'administration mais
affiche clairement qu'elle n'est pas configurée — rien ne plante.

Sans clé API configurée (`STRIPE_SECRET_KEY` / `RESEND_API_KEY` vides),
les deux services se dégradent proprement : les courriels sont journalisés
dans la console plutôt qu'envoyés, et la commande boutique reste enregistrée
avec un message expliquant que le paiement carte n'est pas encore actif —
rien ne plante en développement.

## Ce qui reste à brancher

- **Interac** : dépend de l'intégration bancaire choisie (le flux de
  commande et de facturation est déjà prêt à recevoir cette méthode).
- **Webhook Stripe en local** : utiliser `stripe listen --forward-to
  localhost:4000/api/webhooks/stripe` (Stripe CLI) pour tester les
  événements en développement, et copier le secret affiché dans
  `STRIPE_WEBHOOK_SECRET`.
