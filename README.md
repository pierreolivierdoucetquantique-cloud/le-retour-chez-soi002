# Le Retour Chez Soi

Plateforme complète (frontend + backend) pour le coaching, l'accompagnement
énergétique, les retraites et la communauté en ligne.

## Structure du projet

```
le-retour-chez-soi/
├── src/                Frontend — React + TypeScript + Tailwind + Framer Motion
├── backend/             API — Node.js + Express + TypeScript + Drizzle ORM
└── .env.example         Variables d'environnement du frontend
```

## Démarrage rapide

### Option A — Docker Compose (recommandé, identique à la production)

```bash
cp .env.docker.example .env
docker compose up --build
```

Frontend sur http://localhost:8080, API sur http://localhost:4000. Voir
`DEPLOYMENT.md` pour le déploiement en production (Render).

### Option B — en local, sans Docker

**Terminal 1 — API** (nécessite une base PostgreSQL locale)
```bash
cd backend
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev            # http://localhost:4000
```

**Terminal 2 — Frontend**
```bash
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:4000/api par défaut
npm run dev             # http://localhost:5173
```

Ouvrez http://localhost:5173 — le frontend est entièrement branché sur
l'API réelle (plus aucune donnée fictive), y compris le panneau
d'administration complet (services, blog, événements, boutique,
témoignages, rendez-vous, calendrier, utilisateurs).

Compte administrateur de démonstration (créé par `npm run db:seed`) :
`admin@leretourchezsoi.ca` / `ChangeMoi123!`

## État actuel du projet

**Frontend** — 20 pages construites (accueil, services + réservation,
blogue, événements, témoignages, FAQ, boutique, contact, connexion/
inscription, tableau de bord, administration, pages légales).

**Backend** — API REST complète sur **PostgreSQL** : authentification JWT
par rôles, réservation avec gestion des disponibilités et prévention des
doubles réservations, blogue, événements, témoignages, boutique avec
paiement **Stripe Checkout** réel et calcul des taxes (TPS/TVQ), **paiement
de dépôt ou en totalité pour les rendez-vous**, courriels transactionnels
via **Resend**, rappel automatique 24h avant un rendez-vous,
**synchronisation Google Calendar**, facturation séquentielle. Voir
`backend/README.md` pour le détail des routes et la configuration.

**Déploiement** — Dockerfiles pour le backend et le frontend, orchestrés
par `docker-compose.yml` (PostgreSQL + API + frontend) pour le local, et
`render.yaml` pour un déploiement en un clic sur Render. Guide complet
dans `DEPLOYMENT.md`.

**Prochaines étapes suggérées** :
1. Interac — la seule pièce du cahier des charges initial qui dépend
   entièrement d'identifiants externes (banque) que je n'ai pas ; le flux
   de commande et de facturation est déjà prêt à la recevoir
2. Déploiement effectif sur Render en suivant `DEPLOYMENT.md`
