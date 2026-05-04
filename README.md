# PPMS — Plan Général de l'Établissement

Outil de légendage de plan d'établissement scolaire, conforme au **fascicule 2**
du PPMS Unifié (Eduscol).

## Fonctionnalités

- Chargement d'une vue aérienne (JPG, PNG, WebP — 10 Mo max)
- Catalogue officiel de 14 symboles répartis en 9 catégories
- Placement et déplacement des pictogrammes
- Tracé polygonal : délimitation du site et zones de mise en sûreté
- Panneau de propriétés : taille, rotation, opacité, étiquette
- Sauvegarde locale (IndexedDB + localStorage)
- Export du plan légendé en PNG à la résolution native
- Export/import de projet au format .ppmsu (partage entre postes)

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
# Dossier dist/ à déposer sur le serveur
```

Adapter `base` dans `vite.config.js` selon le sous-répertoire de déploiement.

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

| Touche          | Action                                            |
| --------------- | ------------------------------------------------- |
| `Échap`         | _(à implémenter)_ Annuler le tracé en cours       |
| `Suppr`         | _(à implémenter)_ Supprimer l'élément sélectionné |
| `Alt + glisser` | Déplacer la vue (pan)                             |
| `Molette`       | Zoom centré sur le curseur                        |

## Référence

Fascicule 2 — PPMS Unifié, Eduscol
https://eduscol.education.fr/
