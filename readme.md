# API RONI (ENSO – El Niño / La Niña)

API Node.js / Express qui télécharge l'indice **RONI** (*Relative Oceanic Niño Index*) publié par la NOAA, le stocke dans une base **PostgreSQL** et l'expose via une API REST.

Le projet suit une **Clean Architecture** (couches séparées : présentation, infrastructure, etc.).

---

## Sommaire

1. [Prérequis](#prérequis)
2. [Stack technique](#stack-technique)
3. [Structure du projet](#structure-du-projet)
4. [Installation pas à pas](#installation-pas-à-pas)
5. [Configuration (.env)](#configuration-env)
6. [Docker : base de données et Adminer](#docker--base-de-données-et-adminer)
7. [Initialisation : table et données](#initialisation--table-et-données)
8. [Démarrer l'API](#démarrer-lapi)
9. [Endpoints](#endpoints)
10. [Tests](#tests)
11. [Modèle de données](#modèle-de-données)
12. [Pipeline d'import](#pipeline-dimport)
13. [Commandes utiles](#commandes-utiles)
14. [Dépannage](#dépannage)

---

## Prérequis

| Outil | Version conseillée |
|---|---|
| Node.js | 20 ou supérieur (le `fetch` natif et le top-level `await` sont utilisés) |
| npm | fourni avec Node.js |
| Docker + Docker Compose | version récente |

---

## Stack technique

- **Node.js** en modules ES (`import` / `export`)
- **Express** pour l'API HTTP, **cors** pour le CORS
- **PostgreSQL 18** (via Docker) et le driver **pg**
- **dotenv** pour la configuration
- **Vitest** pour les tests
- **Adminer** pour consulter la base dans le navigateur

---

## Structure du projet

```
.
├── docker-compose.yml        # PostgreSQL + Adminer
├── .env                      # variables d'environnement (à créer, voir plus bas)
├── sql/
│   └── 001_init.sql          # création de la table roni
├── src/
│   ├── app.js                # configuration Express (middlewares, routes, 404)
│   ├── server.js             # point d'entrée : démarre le serveur
│   ├── 3_InfraStructure/
│   │   └── database/
│   │       └── database.js   # pool de connexion PostgreSQL
│   ├── 4_Presentation/
│   │   └── routes/
│   │       └── oni.route.js  # routes /oni
│   └── scripts/ (ingestion)
│       ├── migrate.js        # exécute sql/001_init.sql
│       ├── fetchData.js      # orchestre le téléchargement + l'import
│       ├── fetcher.js        # téléchargement du fichier NOAA
│       ├── parser.js         # parsing du fichier RONI.ascii.txt
│       ├── validation.js     # validation de l'en-tête, des lignes, du volume
│       ├── repository.js     # upsert en base (ON CONFLICT)
│       └── constants.js      # liste des saisons (DJF, JFM, ...)
└── __tests__/
    └── 01_helloWorld.test.js # test de vérification de Vitest
```

> Adapte les chemins ci-dessus si ton arborescence diffère légèrement.

---

## Installation pas à pas

### 1. Récupérer le projet et installer les dépendances

```bash
npm install
```

### 2. Créer le fichier `.env`

Copie le contenu de `env.txt` dans un fichier nommé `.env` à la racine du projet :

```bash
cp env.txt .env
```

### 3. Lancer la base de données avec Docker

```bash
docker compose up -d
```

### 4. Créer la table et télécharger les données

```bash
npm run init
```

### 5. Démarrer l'API

```bash
npm run start
```

L'API est alors disponible sur `http://localhost:3000`.

---

## Configuration (.env)

```env
RONI_URL=https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=admin
DB_NAME=enso
```

| Variable | Rôle |
|---|---|
| `RONI_URL` | URL du fichier texte RONI publié par la NOAA |
| `PORT` | Port d'écoute de l'API |
| `DB_HOST` / `DB_PORT` | Adresse de PostgreSQL |
| `DB_USER` / `DB_PASSWORD` | Identifiants de la base |
| `DB_NAME` | Nom de la base (`enso`) |

> ⚠️ Les identifiants `admin / admin` sont destinés au **développement local uniquement**. Ne les utilise jamais en production et ne commite pas ton `.env` (ajoute-le au `.gitignore`).

---

## Docker : base de données et Adminer

Le fichier `docker-compose.yml` démarre deux services :

| Service | Conteneur | Port | Description |
|---|---|---|---|
| `postgres` | `rncp` | 5432 | Base PostgreSQL 18, base `enso`, utilisateur `admin` |
| `adminer` | `adminer` | 8080 | Interface web d'administration de la base |

Le service PostgreSQL possède un **healthcheck** (`pg_isready`) : Adminer attend que la base soit prête avant de démarrer. Les données sont conservées dans le volume Docker `postgres_data`.

### Commandes Docker

```bash
# Démarrer en arrière-plan
docker compose up -d

# Vérifier l'état (la colonne STATUS doit afficher "healthy")
docker compose ps

# Voir les logs de la base
docker compose logs -f postgres

# Arrêter les conteneurs (les données sont conservées)
docker compose down

# Arrêter ET supprimer les données (repart de zéro)
docker compose down -v
```

### Utiliser Adminer

1. Ouvre `http://localhost:8080`
2. Renseigne :
   - **Système** : PostgreSQL
   - **Serveur** : `postgres`
   - **Utilisateur** : `admin`
   - **Mot de passe** : `admin`
   - **Base de données** : `enso`

---

## Initialisation : table et données

```bash
npm run init
```

Cette commande enchaîne deux étapes :

1. **Migration** (`migrate.js`) : exécute `sql/001_init.sql` et crée la table `roni` si elle n'existe pas (`CREATE TABLE IF NOT EXISTS`, donc sans risque de la relancer).
2. **Import** (`fetchData.js`) : télécharge le fichier NOAA, le valide, le parse et l'insère en base.

Sortie attendue (exemple) :

```
Migration OK (table roni prête).
Téléchargement : https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt
900 lignes lues (0 doublon(s) dans le fichier).
Terminé : 900 insérées, 0 mises à jour, 0 inchangées.
```

La commande est **idempotente** : tu peux la relancer à tout moment pour récupérer les dernières valeurs publiées par la NOAA. Seules les lignes nouvelles ou révisées sont écrites.

---

## Démarrer l'API

```bash
npm run start
```

Console :

```
Server running on port 3000
```

Vérification rapide :

```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

---

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/health` | Vérifie que l'API répond |
| `*` | `/oni/...` | Routes de consultation des données RONI (voir `4_Presentation/routes/oni.route.js`) |

Toute route inconnue renvoie une erreur 404 au format :

```json
{ "error": { "code": "NOT_FOUND", "message": "Route not found" } }
```

---

## Tests

Les tests sont écrits avec **Vitest** et se trouvent dans le dossier `__tests__/`.

```bash
# Lancer tous les tests une fois
npm test

# Équivalent direct avec Vitest
npx vitest run

# Mode watch (relance à chaque modification)
npx vitest
```

Le fichier `01_helloWorld.test.js` est un test de vérification qui confirme que Vitest est correctement installé et configuré :

```js
import { describe, it, expect } from "vitest";

describe("hello World - vitest is Working", () => {
    it("Proof That Vitest is Working ", () => {
        expect(1 + 1).toBe(2);
    });
});
```

### Ajouter un test

Crée un fichier `__tests__/NN_nom.test.js`, par exemple pour le parser :

```js
import { describe, it, expect } from "vitest";
import { parseRoni } from "../src/scripts/parser.js";

describe("parseRoni", () => {
    it("parse une ligne valide", () => {
        const text = "SEAS YR ANOM\nDJF 2020 0.50";
        const { rows } = parseRoni(text);
        expect(rows[0]).toMatchObject({ season: "DJF", year: 2020, month: 1, anom: 0.5 });
    });
});
```

---

## Modèle de données

Table `roni` (`sql/001_init.sql`) :

| Colonne | Type | Description |
|---|---|---|
| `id` | `BIGSERIAL` | Clé primaire |
| `season` | `CHAR(3)` | Saison de 3 mois : `DJF`, `JFM`, `FMA`, `MAM`, `AMJ`, `MJJ`, `JJA`, `JAS`, `ASO`, `SON`, `OND`, `NDJ` |
| `year` | `SMALLINT` | Année (colonne `YR` du fichier NOAA) |
| `month` | `SMALLINT` | Numéro du mois central (1 à 12) |
| `center_month` | `DATE` | Mois central de la saison (1er du mois) |
| `anom` | `NUMERIC(5,2)` | Anomalie RONI en °C |
| `created_at` | `TIMESTAMPTZ` | Date de création |
| `updated_at` | `TIMESTAMPTZ` | Date de dernière mise à jour |

Contraintes :
- `UNIQUE (season, year)` : une seule ligne par saison et par année (contrôle des doublons)
- `CHECK` sur `season` : seules les 12 saisons valides sont acceptées
- Index sur `center_month` pour accélérer les requêtes par période

### Lecture d'une anomalie

| Valeur de `anom` | Interprétation habituelle |
|---|---|
| ≥ +0,5 | Conditions **El Niño** |
| ≤ −0,5 | Conditions **La Niña** |
| entre −0,5 et +0,5 | Neutre |

---

## Pipeline d'import

Le script `fetchData.js` exécute les étapes suivantes, avec des garde-fous à chaque niveau :

1. **Téléchargement** (`fetcher.js`) : vérifie le code HTTP, le `content-type` (`text/plain`), refuse un fichier vide ou supérieur à 10 Mo.
2. **Validation de l'en-tête** (`validation.js`) : la première ligne doit être `SEAS YR ANOM`, sinon le format NOAA a probablement changé.
3. **Parsing** (`parser.js`) : lit chaque ligne avec une expression régulière stricte, calcule `month` et `center_month`, dédoublonne dans le fichier (la dernière occurrence gagne). Toute ligne invalide **interrompt l'import** : pas de données corrompues silencieuses.
4. **Validation des valeurs** : année entre 1950 et l'année suivante, anomalie dans ±5 °C, saison connue.
5. **Contrôle du volume** : au moins 100 lignes, sinon l'import est annulé.
6. **Upsert transactionnel** (`repository.js`) : une seule transaction avec `INSERT ... ON CONFLICT (season, year) DO UPDATE`.
   - ligne absente → **insérée**
   - ligne présente avec une anomalie différente (révision NOAA) → **mise à jour**
   - ligne identique → **ignorée**
   - en cas d'erreur → `ROLLBACK`

---

## Commandes utiles

| Commande | Effet |
|---|---|
| `npm install` | Installe les dépendances |
| `npm run init` | Crée la table et importe les données NOAA |
| `npm run start` | Démarre l'API |
| `npm test` | Lance les tests Vitest |
| `docker compose up -d` | Démarre PostgreSQL et Adminer |
| `docker compose down` | Arrête les conteneurs |
| `docker compose down -v` | Arrête et supprime les données |

---

## Dépannage

**`ECONNREFUSED 127.0.0.1:5432`**
La base n'est pas démarrée. Lance `docker compose up -d` et attends que `docker compose ps` affiche `healthy`.

**`Port 5432 is already allocated`**
Un autre PostgreSQL local utilise déjà le port. Arrête-le ou change le port exposé dans `docker-compose.yml` (et `DB_PORT` dans `.env`).

**`Migration échouée` ou `password authentication failed`**
Vérifie que les valeurs de `.env` correspondent à celles du `docker-compose.yml`. Si tu as modifié les identifiants après la première création, supprime le volume : `docker compose down -v`.

**`En-tête inattendu ... Format NOAA modifié ?`**
La NOAA a changé le format du fichier. Vérifie `RONI_URL` et adapte `parser.js` / `validation.js`.

**`Type de contenu inattendu`**
Le serveur NOAA n'a pas renvoyé `text/plain` (page d'erreur, redirection...). Ouvre `RONI_URL` dans un navigateur pour vérifier.

**`PORT` non défini au démarrage**
Le fichier `.env` est absent. Crée-le à partir de `env.txt`.

---

## Source des données

Indice RONI : [NOAA Climate Prediction Center](https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt)
