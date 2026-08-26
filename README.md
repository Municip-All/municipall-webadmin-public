# Municip'All — Web Admin

Interface d'**administration plateforme** pour l'équipe interne Municip'All. Permet de gérer l'infrastructure, les communes partenaires, les utilisateurs globaux et la base de données sur l'ensemble du SaaS.

## Vue d'ensemble

| Élément | Détail |
|---------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Cartes / graphiques | Leaflet, Recharts |
| Audience | Équipe Municip'All (interne) |
| Port Docker | `5000` |
| Auth | Code d'accès + clé plateforme API |

## Rôle dans l'écosystème

```
┌─────────────────────┐     ┌─────────────────────┐
│   Web Admin         │     │   Web Backoffice    │
│   (ce projet)       │     │   (mairie)          │
│   Toutes les villes │     │   Une commune       │
│   Infra + onboarding│     │   Opérations daily  │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          └───────────┬───────────────┘
                      ▼
            municipall-backend API
            (routes /admin + /api/v1)
```

## Pages et routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard global (KPIs, infra VPS, activité) |
| `/cities` | Gestion des communes partenaires (CRUD, contrats, features) |
| `/users` | Utilisateurs cross-plateforme |
| `/agents` | Invitations agents pour communes partenaires |
| `/monitoring` | Monitoring Docker / serveur |
| `/database` | Explorateur de tables, console SQL, seed démo |

## Fonctionnalités

- **Dashboard** — Statistiques globales, métriques système, fil d'activité
- **Gestion des communes** — Wizard de création, contrats, activation de features
- **Utilisateurs** — CRUD global, actions administratives
- **Infrastructure** — État des conteneurs Docker, monitoring VPS
- **Base de données** — Navigation tables, requêtes SQL, données de démo
- **Environnements** — Bascule DEV / PROD dans l'interface
- **Rôles internes** — chief, tech, sales, support (permissions UI)

## Structure du projet

```
app/
├── layout.tsx
├── page.tsx              # Dashboard
├── cities/page.tsx
├── users/                # page + layout
├── agents/page.tsx
├── monitoring/page.tsx
└── database/             # page + layout

components/
├── cities/               # CityCreateWizard, CitySettingsModal
├── users/                # UserEditModal, UserActionsMenu
└── database/             # DemoSeedPanel

context/                  # PanelRole, Toast, ConfirmDialog
lib/
├── adminApi.ts           # Appels API avec x-platform-admin-key
├── environment.ts        # Bascule DEV/PROD
├── panelPermissions.ts
└── platformRoles.ts
```

## Prérequis

- Node.js 18+
- npm
- Backend Municip'All en cours d'exécution
- Clé plateforme (`PLATFORM_ADMIN_KEY` côté backend)

## Installation

```bash
npm install
```

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=https://api.municipall.dev
NEXT_PUBLIC_API_URL_DEV=https://dev.api.municipall.dev
PLATFORM_ADMIN_KEY=votre_cle_plateforme
```

> La clé doit correspondre à `PLATFORM_ADMIN_KEY` du backend.

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | API production | `https://api.municipall.dev` |
| `NEXT_PUBLIC_API_URL_DEV` | API développement | `https://dev.api.municipall.dev` |
| `PLATFORM_ADMIN_KEY` | Clé header `x-platform-admin-key` | — |

L'environnement actif (DEV/PROD) est aussi stocké dans `localStorage` (`municipall_env`).

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (http://localhost:3000) |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |

## Authentification

1. **Code d'accès** — Saisi au premier lancement (`AccessCodeGuard`)
2. **Rôle panel** — Sélection du rôle interne (chief, tech, sales, support)
3. **Clé API** — Toutes les requêtes `/admin` portent `x-platform-admin-key`

Les pages sont protégées par `RequirePermission` selon le rôle sélectionné.

## Déploiement Docker

```bash
docker compose up -d
```

Le service écoute sur le port **5000**. Les variables sont passées en build args dans le `Dockerfile`.

## Écosystème Municip'All

| Projet | Rôle |
|--------|------|
| [municipall-backend-public](../municipall-backend-public) | API REST |
| [municipall-frontend-public](../municipall-frontend-public) | Site vitrine |
| [municipall-mobile-public](../municipall-mobile-public) | App mobile citoyenne |
| [municipall-web-backoffice-public](../municipall-web-backoffice-public) | Backoffice mairie |

## Licence

Projet privé
