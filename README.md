# PPMSU — Atelier Visuel

Outil de production des visuels destinés au Plan Particulier de Mise en Sûreté
Unifié (PPMS), conforme au **fascicule 2** Eduscol.

## Modules disponibles

- **Plan Général de l'École** — légendage d'une vue aérienne selon la légende
  officielle du fascicule 2
- **Plans des Niveaux** — annotation des plans d'intervention par niveau de
  bâtiment : zones ZMS polygonales, flèches de circulation multi-points, photos
  planche et annotations texte, export PNG par niveau
- **Coupures de Fluides** _(en développement)_ — annotation des photos des
  systèmes de coupure d'eau, gaz et électricité

## Fonctionnalités (module Plan Général)

- Chargement d'une vue aérienne (JPG, PNG, WebP — 10 Mo max)
- Catalogue officiel de 14 symboles répartis en 9 catégories
- Placement et déplacement des pictogrammes
- Tracé polygonal : délimitation du site et zones de mise en sûreté
- Panneau de propriétés : taille, rotation, opacité, étiquette
- Sauvegarde locale (IndexedDB + localStorage)
- Export du plan légendé en PNG à la résolution native
- Export/import de projet au format .ppmsu (partage entre postes)

## Fonctionnalités (module Plans des Niveaux)

- Gestion de plusieurs niveaux de bâtiment (sidebar avec liste et navigation)
- Chargement d'une image par niveau (JPG, PNG, WebP — 10 Mo max)
- Tracé des zones ZMS (polygones colorés avec remplissage réglable)
- Flèches de circulation multi-points (polyligne, double-clic pour terminer)
- Photos planche : déposées librement hors du plan, redimensionnables, pivotables
- Annotations texte libres (couleur, taille de police, rotation)
- Positionnement des flèches au-dessus ou en dessous des photos
- Panneau de propriétés glissable : couleur, épaisseur, opacité
- Export PNG du niveau annoté (canvas étendu aux éléments hors image)
- Sauvegarde locale intégrée au projet (même persistance que Plan Général)

## Stack technique

- React 19 + Vite 8 (sans TypeScript)
- Tailwind CSS v4
- Persistance : localStorage (métadonnées) + IndexedDB (images)
- Aucune dépendance de rendu externe (Canvas 2D natif)

## Installation

```bash
pnpm install
pnpm dev
```

## Déploiement

```bash
pnpm build
# Dossier dist/ à déposer dans /PPMSU-AtelierVisuel/ sur le serveur
```

## Pictogrammes officiels

Les images dans `public/symbols/` sont extraites du document `legendes.docx`
fourni par l'autorité pédagogique (fascicule 2, Eduscol).

```bash
# Pour les régénérer depuis le docx officiel :
bash scripts/copy-symbols.sh legendes.docx
```

## Format de projet .ppmsu

Fichier JSON auto-contenu (état + image en base64).
Permet le partage entre postes sans infrastructure serveur.

## Raccourcis clavier

| Touche          | Action                           |
| --------------- | -------------------------------- |
| `Alt + glisser` | Déplacer la vue (pan)            |
| `Molette`       | Zoom centré sur le curseur       |
| `Suppr`         | Supprimer l'élément sélectionné  |
| `Échap`         | Annuler le tracé en cours        |

## Référence

Fascicule 2 — PPMS Unifié, Eduscol
https://eduscol.education.fr/