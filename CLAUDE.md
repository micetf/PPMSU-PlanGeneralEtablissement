# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # dev server (opens browser automatically)
pnpm build      # production build → dist/
pnpm lint       # ESLint
pnpm preview    # preview the production build locally
```

No test runner is configured.

## Architecture

**PPMSU — Atelier Visuel** is a React 19 + Vite 8 SPA for producing annotated aerial maps compliant with the French school emergency plan standard (PPMS Unifié, fascicule 2 Eduscol). No TypeScript; Tailwind CSS v4; no external rendering library.

### State management

All state lives in a single `useReducer` store:

- `src/reducers/appReducer.js` — pure reducer, all `ACTION_TYPES`, `initialState`, type definitions
- `src/contexts/AppProvider.jsx` — wraps the reducer, exposes `{ state, actions }` via context; owns all async side effects (persistence, file I/O)
- `src/contexts/appContext.js` — the bare `createContext` object
- `src/hooks/useApp.js` — consumer shortcut: `const { state, actions } = useApp()`

**State shape** (`AppState`):

```
state.project      — id, name, schoolName, timestamps
state.planGeneral  — { image: { src, naturalWidth, naturalHeight, fileName },
                       legendItems: [], contourPaths: [] }
state.planNiveaux  — { niveaux: [], activeNiveauId: null }
                     Each niveau: { id, nom, rotation, image, legendItems, contourPaths, photos[] }
                     Each photo:  { id, fileName, src (base64) }
state.ui           — moduleActif, selectedTool, selectedSymbolKey, selectedItemId,
                     activeDrawingPathId, zoom, panOffset, isDirty
```

### Internal routing

There is no React Router. Navigation is driven exclusively by `state.ui.moduleActif` (`null` | `'planGeneral'` | `'planNiveaux'` | `'coupuresFluides'`). The `AppRouter` component in `App.jsx` switches on this value. To navigate, dispatch `actions.setModule(moduleKey)`.

### Coordinate system

All element positions are stored as **percentages of the image dimensions** (0–100), never pixels. Conversion at render time: `px = (pct / 100) * imageDimension * zoom`.

Symbol `width`/`height` are stored in **native export pixels**. Display size = `item.width * zoom`. The export (`exportCanvas.js`) uses native sizes directly on the Canvas 2D context.

### Workspace rendering layers

**Plan Général** — `WorkspaceCanvas` → absolute-positioned div scaled by `zoom`/`panOffset`:

1. `<img>` — aerial background
2. `<ContourLayer>` — SVG overlay for polygonal contours
3. `<SymbolLayer>` — absolutely-positioned DOM elements (SVG or `<img>`) per legend item

PNG export (`src/utils/exportCanvas.js`) replicates the same render using the Canvas 2D API at native resolution — it does not capture the DOM.

**Plan des Niveaux** — `NiveauWorkspaceCanvas` → same zoom/pan pattern:

1. `<img>` — floor plan background (per-niveau, with optional rotation)
2. `<ContourLayer showLabel={false}>` — ZMS polygonal overlays
3. `<ArrowLayer layerFilter="back">` — arrows explicitly placed below photos
4. `<NiveauSymbolLayer>` — photos planche (SVG `<image>`) + text annotations
5. `<ArrowLayer layerFilter="front">` — arrows above photos (default)

PNG export (`src/utils/exportNiveau.js`) uses the same two-pass order; canvas is expanded to fit photos and arrow points that fall outside image bounds. Coordinates converted via `src/utils/niveauCoords.js`.

### Symbol catalogue

**Plan Général** — `src/constants/ppmsLegend.js` is the single source of truth: `PPMS_SYMBOLS`, `ELEMENT_TYPES`, `PPMS_CATEGORIES`, `CATEGORY_LABELS`, `IMAGE_NATIVE_SIZES`. All symbol images live in `public/symbols/`. `symbolUrl(fileName)` in `src/utils/assetPath.js` prefixes `import.meta.env.BASE_URL` so paths work on both dev (root) and production (sub-directory).

**Plan des Niveaux** — `src/constants/niveauxLegend.js`: `NIVEAUX_SYMBOLS`, `NIVEAUX_ELEMENT_TYPES` (`ZMS_ZONE`, `FLECHE`, `PHOTO`, `TEXTE`), `NIVEAUX_SYMBOLS_BY_CATEGORY`, `getNiveauSymbolByKey(key)`. Item data stored in niveau's `legendItems[]`; photo binaries stored in niveau's `photos[]` (base64, loaded via `actions.addNiveauPhotoFromDataUrl`).

Element types that affect rendering:

- `ELEMENT_TYPES.SYMBOL` with `shape: 'pentagon'` → SVG pentagon (Zone de mise en sûreté)
- `ELEMENT_TYPES.SYMBOL` with `imageFile` → `<img>` from `public/symbols/`
- `ELEMENT_TYPES.TEXTE` → styled `<span>` (yellow text, black shadow)
- `ELEMENT_TYPES.CONTOUR` / `ELEMENT_TYPES.ZONE` → polygonal path via `useContourDraw`
- `ELEMENT_TYPES.COMPOSE` with `shape: 'north_arrow'` → SVG compass rose

### Persistence

- **localStorage** — project metadata index (`ppms_projects`) + full project state (`ppms_project_<id>`)
- **IndexedDB** (`ppms_legende` DB, `images` store) — aerial image data (avoids localStorage quota limits); implemented in `src/utils/imageStore.js`
- **`.ppmsu` file** — self-contained JSON (state + image as base64) for sharing between machines; implemented in `src/utils/projectIO.js`

### Deployment

`.env` sets `VITE_BASE_PATH=/` for dev; `.env.production` sets it to `/PPMSU-AtelierVisuel/`. The Vite `base` option is driven by this variable. Built output goes to `dist/` and is deployed under `/PPMSU-AtelierVisuel/` on the server.

---

## Design System — NavBar MiCetF

The application's navigation bar follows the **design system MiCetF** (micetf.fr). Use the markup and classes below as the canonical reference when creating or modifying the `<NavBar>` component.

### Structure

```
<nav>                          fixed top-0, bg-gray-900, text-white, shadow-lg, z-50
  <div>                        max-w-7xl mx-auto px-4
    <div>                      flex justify-between h-16
      <!-- LEFT: breadcrumb -->
      <div class="flex items-center">
        <a href="https://micetf.fr">MiCetF</a>          font-bold text-lg
        <span> chevron SVG (20×20, currentColor) </span> mx-2
        <span> Titre de l'outil </span>                  font-bold text-lg

      <!-- CENTER/RIGHT mobile: hamburger -->
      <div class="md:hidden flex items-center">
        <button class="text-white p-2"> hamburger SVG (24×24) </button>

      <!-- RIGHT desktop: action buttons -->
      <div class="hidden md:flex md:items-center">
        <!-- Donation PayPal -->
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_s-xclick">
          <input type="hidden" name="hosted_button_id" value="<ID_BOUTON>">
          <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm">
            heart SVG
          </button>
        </form>
        <!-- Contact webmaster -->
        <button class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm">
          mail SVG
        </button>
```

### Key Tailwind classes

| Zone                | Classes                                                                         |
| ------------------- | ------------------------------------------------------------------------------- |
| `<nav>`             | `fixed top-0 left-0 right-0 bg-gray-900 text-white shadow-lg z-50`              |
| Conteneur intérieur | `max-w-7xl mx-auto px-4`                                                        |
| Rangée principale   | `flex justify-between h-16`                                                     |
| Breadcrumb          | `flex items-center`                                                             |
| Séparateur chevron  | `text-white mx-2` (SVG `viewBox="0 0 20 20"`)                                   |
| Bouton donation     | `bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm`     |
| Bouton contact      | `bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm`         |
| Hamburger (mobile)  | `md:hidden flex items-center`                                                   |
| Boutons (desktop)   | `hidden md:flex md:items-center`                                                |
| Groupe de boutons   | `flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2` |

### Conventions visuelles

- **Fond** : `bg-gray-900` (pas de variante colorée)
- **Hauteur fixe** : `h-16` (64 px)
- **Titre de l'outil** dans le breadcrumb : texte libre, toujours `font-bold text-lg`
- **Bouton donation** : toujours jaune (`yellow-500`), icône cœur SVG, title d'info-bulle présent
- **Bouton contact** : toujours gris (`gray-600`), icône enveloppe SVG, title d'info-bulle présent
- **Responsive** : seul le hamburger est visible en dessous de `md` (768 px) ; les boutons d'action sont masqués (`md:hidden` / `hidden md:flex`)
- Le menu mobile (hamburger) n'a **pas** de comportement JS dans la référence HTML — l'état d'ouverture est à gérer via un `useState` dans le composant React

---

## Référentiel métier — PPMS Unifié

Le PPMS (Plan Particulier de Mise en Sûreté) est le document réglementaire que l'application permet de produire. Se référer à la structure ci-dessous pour toute décision d'UX, de nommage ou de génération de contenu.

### Structure du document PPMS

```
PPMS
├── PARTIE 1 — DESCRIPTION DE L'ÉTABLISSEMENT
│   ├── Fiche — Identification de l'établissement
│   ├── Fiche — Plans de l'établissement          ← module principal de l'appli
│   └── Fiche — Identification des zones de mise en sûreté
│
├── PARTIE 2 — CONDUITES À TENIR ET RÉFLEXES
│   ├── Fiche — Menaces et risques majeurs + conduites à tenir
│   ├── Fiche — Répartition des missions
│   ├── Fiche — Procédure de déclenchement des alarmes
│   ├── Fiche — Missions du responsable de zone
│   └── Fiche — Recensement des personnes présentes
│
└── ANNEXES — DOCUMENTS INTERNES
    ├── Fiche — Annuaire de crise               (confidentiel)
    └── Fiche — Personnes nécessitant une attention particulière (confidentiel)
```

### Légende standardisée des plans (Fiche Plans)

Ces catégories sont **obligatoires** sur les plans produits par l'application. Elles correspondent directement aux `PPMS_CATEGORIES` de `ppmsLegend.js`.

| Catégorie                     | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| Accès au site — véhicules     | Accès principal véhicule / accès secondaire véhicule |
| Accès au site — piétons       | Accès principal piéton / accès secondaire piéton     |
| Accès au bâtiment — piétons   | Accès principal / accès secondaire                   |
| Accès au bâtiment — véhicules | Accès principal / accès secondaire                   |
| Sorties de secours            | Sortie de secours (du bâtiment)                      |
| Zones de mise en sûreté       | Point de rassemblement **extérieur** inclus          |
| Annotations                   | Texte libre positionnable                            |
| Délimitation du site          | Contour polygonal                                    |
| Orientation du plan           | Rose des vents (nord)                                |

> La vue satellite recommandée par le référentiel est **Géoportail** (IGN), en conservant les proportions du site dans sa totalité.

### Zones de mise en sûreté

Structure type d'une zone (modèle collège de référence — 6 zones) :

| Champ                         | Description                                                              |
| ----------------------------- | ------------------------------------------------------------------------ |
| Numéro de zone                | Zone 1 à N                                                               |
| Lieux constituant la zone     | Salles, couloirs, CDI, gymnase…                                          |
| Lieux d'origine des personnes | Classes ou services d'origine                                            |
| Capacité d'accueil            | Nombre de personnes                                                      |
| Observations                  | Ex. : « cellule de crise », « point de rassemblement alerte à la bombe » |

> Les zones et leur localisation sont **confidentielles** : communiquées aux personnels uniquement, jamais diffusées publiquement.

### Types de menaces et conduites à tenir

| Menace                                                      | Conduite réglementaire                                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Alerte à la bombe / objet suspect                           | **Évacuation** — Point de rassemblement extérieur ; appel 17                                   |
| Menaces ou violences à proximité                            | **Mise à l'abri simple** — Fermer les accès, regrouper en zones                                |
| Intrusion / agression / attentat au sein de l'établissement | **S'échapper** puis **se cacher en se barricadant** si fuite impossible ; alerter le 17 ou 114 |

### Types de risques naturels et technologiques

| Risque                         | Conduite réglementaire                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Séisme                         | Rester et se protéger (mur porteur, meuble solide)                                      |
| Inondation (lente ou rapide)   | Mise à l'abri simple ou évacuation vers un point haut                                   |
| Mouvements de terrain          | Rester et se protéger ou évacuer vers une zone stable                                   |
| Retrait gonflement des argiles | Idem mouvements de terrain                                                              |
| Radon                          | Aérer les pièces                                                                        |
| Accident nucléaire             | Mise à l'abri améliorée (fermer ouvrants, couper ventilation) puis évacuation sur ordre |
| Risque technologique (TMD)     | Mise à l'abri améliorée puis évacuation sur ordre                                       |

### Alarmes réglementaires

| Nature             | Signal sonore                                                           | Points de déclenchement                                          | Qui peut déclencher                               |
| ------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Risque majeur      | 3 cycles (son montant/descendant, 1 min 41 s, silence 5 s entre chaque) | Loge, Vie scolaire                                               | Chef d'établissement, adjoint, secrétaire général |
| Attentat-intrusion | 3 sonneries + message vocal précisant la menace                         | Loge, Vie scolaire, tout téléphone interne (code 300 → touche 3) | Tout le monde                                     |
| Alerte à la bombe  | 3 sonneries + message d'évacuation générale                             | Loge, Vie scolaire                                               | Chef d'établissement, adjoint, secrétaire général |
| Incendie (mémoire) | Sonnerie répétée stridente                                              | Loge ou déclenchement manuel                                     | Tout le monde                                     |

### Fiche Annuaire de crise — champs obligatoires

```
Ligne directe de l'établissement (à communiquer aux secours)
Adresse + accès des secours (portail, accès pompiers)
Secours : Police/Gendarmerie (17), Pompiers (18), SAMU (15)
Éducation nationale : Rectorat (cabinet + cellule de crise académique + référent sûreté)
                      DSDEN (cabinet + cellule de crise + référent sûreté + IEN)
Préfecture (cabinet + SIDPC)
Collectivité/Mairie (cabinet du maire + service éducation + astreinte)
Interne : chef d'établissement, adjoint, secrétaire général, CPE, agent d'accueil,
          responsable technique, infirmier, formateur secourisme
```

> L'annuaire de crise est **confidentiel** : réservé au chef d'établissement et à la cellule de crise.

### Fiche PAP/PAI — Personnes nécessitant une attention particulière

Champs par personne : `classe | nom-prénom | pathologie | trousse urgence (oui/non) | traitement | conduite à tenir`

Pathologies fréquentes dans la base de référence : asthme, allergie alimentaire (arachide, fruits exotiques, fruits rouges, tomate…), diabète insulino-dépendant sous pompe, épilepsie (crises tonico-cloniques), troubles du comportement/attention (TDAH), troubles alimentaires, problème de motricité, céphalées/migraines, problèmes ophtalmologiques.

> Cette liste est **confidentielle** : réservée au chef d'établissement et à la cellule de crise.

### Éléments à communiquer aux secours (applicable partout dans le PPMS)

Lors de tout appel au 17/18/15, transmettre dans l'ordre :

1. Nom et statut de l'appelant
2. Localisation du bâtiment
3. Nature et localisation de l'événement
4. Réactions et positionnement des élèves et personnels
5. Localisation du point d'accueil des secours
6. Toute précision utile

> Ne jamais raccrocher avant d'y avoir été invité — un complément d'information peut être demandé.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
