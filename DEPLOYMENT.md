# Déploiement

## Local, avec Docker Compose (identique à la production)

Prérequis : Docker et Docker Compose.

```bash
cp .env.docker.example .env
docker compose up --build
```

- Frontend : http://localhost:8080
- API : http://localhost:4000
- PostgreSQL : localhost:5432 (utilisateur `retour`, mot de passe `retour`, base `retour_chez_soi`)

Au démarrage, le conteneur backend applique automatiquement les migrations
avant de lancer le serveur (`node dist/db/migrate.js && node dist/index.js`).
Pour peupler la base avec des données de démonstration :

```bash
docker compose exec backend node -e "require('tsx/cjs'); require('./src/db/seed.ts')"
# ou plus simplement, en développement local hors conteneur :
cd backend && npm run db:seed
```

Pour tout réinitialiser :
```bash
docker compose down -v
```

## Production sur Render — déploiement en un clic (Blueprint)

Un fichier `render.yaml` à la racine du dépôt décrit les trois ressources
(base PostgreSQL, API, frontend) en une seule fois. C'est la méthode
recommandée.

### Étapes

1. Poussez ce dépôt sur GitHub, GitLab ou Bitbucket.
2. Dans le tableau de bord Render : **New → Blueprint**, puis sélectionnez
   le dépôt. Render détecte automatiquement `render.yaml`.
3. Render vous demande de renseigner les variables marquées `sync: false`
   (secrets qui ne doivent jamais être écrits dans le fichier) :
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
   - `ADMIN_NOTIFICATION_EMAIL`
4. Cliquez sur **Apply** — Render crée la base de données, construit l'image
   Docker du backend, puis build et déploie le frontend statique, dans le
   bon ordre.

### Comment les deux services se retrouvent l'un l'autre

Render ne permet pas d'interpoler des chaînes directement dans les valeurs
du fichier YAML (ex. impossible d'écrire `"https://" + host` en YAML). Le
Blueprint contourne cette limite de deux façons :

- Le **frontend** reçoit `API_HOST` (nom court du service API) et compose
  `VITE_API_URL` lui-même dans sa commande de build (`buildCommand`), où
  l'interpolation shell classique (`${API_HOST}`) fonctionne normalement.
- Le **backend** reçoit `FRONTEND_HOST` de la même façon, mais comme
  Node.js n'a pas de commande shell à interpoler au démarrage, c'est
  `backend/src/config/env.ts` qui recompose `CLIENT_URL` à partir de
  `FRONTEND_HOST` si `CLIENT_URL` n'est pas défini explicitement.

Les migrations de base de données s'appliquent automatiquement à chaque
déploiement (incluses dans la commande de démarrage du conteneur backend).

### Après le premier déploiement

- **Webhook Stripe** : dans le tableau de bord Stripe, ajoutez un endpoint
  pointant vers `https://<votre-api>.onrender.com/api/webhooks/stripe`,
  écoutez l'événement `checkout.session.completed`, puis copiez le secret
  généré dans la variable `STRIPE_WEBHOOK_SECRET` du service API sur Render.
- **Compte administrateur** : connectez-vous au shell du service API depuis
  le tableau de bord Render et exécutez `node dist/db/seed.js` une fois
  pour créer le compte `admin@leretourchezsoi.ca` — ou créez un compte
  normalement puis promouvez-le au rôle `super_admin` directement en base.

### Déploiement manuel (sans Blueprint)

Si vous préférez tout configurer à la main plutôt que via `render.yaml`,
la marche à suivre reste : un service PostgreSQL, un Web Service Docker
pointant vers `backend/Dockerfile` pour l'API, et un Static Site (ou Web
Service Docker avec `Dockerfile` à la racine) pour le frontend — voir les
variables d'environnement listées dans `backend/.env.example` et
`.env.docker.example`.

## Ce qui a été testé dans cet environnement

- Le backend a été exécuté contre un vrai serveur PostgreSQL (schéma
  appliqué, migrations générées et rejouées, seed exécuté, requêtes
  testées de bout en bout — réservation, prévention des doubles
  réservations, taxes, facturation)
- Le build de production du backend (`npm run build`) a été exécuté puis
  lancé avec la séquence exacte utilisée par le `CMD` du Dockerfile
- Le build de production du frontend a été vérifié avec `VITE_API_URL`
  injectée par variable d'environnement, comme le fait le Dockerfile
- Le fichier `render.yaml` a été validé syntaxiquement (parsing YAML) et
  sa structure a été vérifiée contre la documentation actuelle du Blueprint
  Render ; la logique de repli `FRONTEND_HOST` → `CLIENT_URL` dans
  `env.ts` a été testée directement (les deux branches, avec et sans la
  variable, produisent l'URL attendue)

**Non testé ici** : l'exécution réelle des conteneurs Docker, et le
déploiement réel du Blueprint sur Render (nécessite un compte Render et
un dépôt Git poussé, tous deux hors de portée de cet environnement).
