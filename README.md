# Système MIVIX Central

Espace personnel numérique pour conserver, organiser, enrichir et transmettre ses souvenirs, connaissances, créations et réflexions.

## Ouvrir

Le nouveau shell modulaire se lance avec Vite :

```bash
npm run dev
```

Pour inspecter le rendu visuel sans session privée, ouvrir `http://localhost:5173/?preview=mivix`.
La route normale conserve l’authentification Supabase et `MIVIX Central.html` reste disponible comme fallback local.

## Vérifier la base Supabase

La suite pgTAP comportementale se trouve dans `supabase/tests/rls_core.sql`. Avec la CLI Supabase installée et Docker démarré, lancer :

```bash
npm run test:database
```

Cette commande exécute `supabase test db`, qui applique les migrations puis lance les tests SQL contre la base locale. Si la CLI ou Docker est indisponible, elle affiche explicitement `NOT RUN` et le repli statique à exécuter :

```bash
npm run validate:sql
```

## Univers

- ✍️ Écriture — Histoires, réflexions, citations
- 📚 Bibliothèque du savoir — Livres, articles, apprentissages
- 🧶 Atelier créatif — Crochet, patrons, créations
- 🌳 Généalogie — Arbre familial, archives, documents
- ✈️ Carnet de voyages — Voyages passés et à venir
- 🔮 Cabinet des curiosités — Pierres, collections
- 📖 Journal intime — Émotions, gratitude, réflexions
- ⚡ Notes rapides — Idées et captures à classer

## Fonctionnalités

- Éditeur façon Notion (créer, modifier, supprimer)
- Capture rapide avec classification automatique
- Vue d'ensemble (dashboard live)
- Favoris agrégés tous univers
- Recherche universelle
- Persistance locale (localStorage)
- Compositions abstraites Hilma af Klint animées
