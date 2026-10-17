# MIVIX Central — Projets, médias et spiritualité

## 1. Vision

MIVIX Central évolue d’un carnet de vie local vers un espace personnel cloud, privé et modulaire. L’application conserve son expérience éditoriale, calme et organique, tout en ajoutant un widget transversal **Projets**, une bibliothèque de médias partagée, une branche **Spiritualité** et des résumés IA déclenchés à la demande.

Le principe directeur est le suivant : une information peut être créée dans un widget, puis reliée à plusieurs endroits de MIVIX sans être dupliquée.

## 2. Périmètre validé

### Socle commun

- Authentification mono-utilisateur par email et mot de passe via Supabase Auth.
- Profil MIVIX principal.
- Profils secondaires pour les proches, créés et reliés uniquement à la demande de l’utilisateur.
- Recherche globale dans les titres, textes, tags, projets, personnes et médias.
- Favoris, liens entre contenus et activité récente.
- Migration des données existantes conservées dans `localStorage`.

### Widget Projets transversal

Chaque idée business devient un projet autonome avec :

- nom, description, couleur et symbole ;
- statut : Idée, À explorer, En préparation, En cours, En pause, Lancé, Archivé ;
- objectifs, tâches et notes ;
- photos et fichiers ;
- personnes ou proches liés ;
- activité récente ;
- résumé IA manuel.

Un projet possède une page dédiée, conçue comme un mini espace MIVIX et non comme un tableau de gestion froid.

### Bibliothèque médias globale

Tous les widgets peuvent recevoir des médias : photos, vidéos, PDF, documents, captures et autres fichiers autorisés.

La bibliothèque permet :

- import de plusieurs fichiers en une fois ;
- progression d’import et reprise des échecs partiels ;
- aperçu galerie ;
- recherche et filtrage par projet, univers, personne ou type ;
- conservation du nom, du format et des métadonnées ;
- rattachement d’un même média à plusieurs éléments ;
- résumé IA manuel d’un fichier ou d’un lot sélectionné.

Les originaux sont conservés dans Supabase Storage. Des versions optimisées peuvent être produites pour l’aperçu.

### Widget Spiritualité

Le widget Spiritualité est une branche visuelle dédiée, plus céleste et symbolique, mais intégrée à la DA MIVIX.

Il permet :

- un profil astrologique principal pour l’utilisateur ;
- des profils astrologiques secondaires pour les proches ;
- import et consultation de cartes du ciel sous forme d’images ;
- saisie ou conservation des données structurées : date, heure, lieu, signes, maisons, aspects et angles ;
- notes et interprétations personnelles ;
- périodes ou cycles importants ;
- liens créés à la demande entre profils, personnes, projets et médias ;
- synthèse IA manuelle.

Les contenus astrologiques sont présentés comme des interprétations ou supports de réflexion, et non comme des diagnostics ou des vérités prédictives.

### IA à la demande

Les actions IA seront explicites : **Résumer**, **Analyser** ou **Comparer** selon le contexte. Aucun appel automatique ne sera effectué après chaque ajout.

Les résultats seront enregistrés dans Supabase, identifiés comme générés par IA, modifiables et supprimables.

Le fournisseur sera abstrait derrière une fonction sécurisée afin de pouvoir utiliser Gemini ou un autre modèle sans modifier les widgets ni exposer de clé secrète dans le navigateur.

## 3. Architecture fonctionnelle

```text
MIVIX Central
├── Accueil
├── Projets
├── Bibliothèque médias
├── Spiritualité
├── Relations
├── Univers personnels existants
└── Recherche globale
```

Le shell principal, la navigation, les cartes, les boutons, les favoris, la recherche et les composants médias sont partagés. Chaque widget reste responsable de son vocabulaire, de ses champs spécifiques et de sa composition visuelle.

## 4. Modèle de données cible

Les tables publiques exposées par Supabase devront activer RLS et appliquer la règle d’appartenance au compte utilisateur.

- `profiles` : profil MIVIX principal.
- `contacts` : proches et personnes liées.
- `projects` : projets, statuts, identité visuelle et métadonnées.
- `content_items` : notes, idées, citations, entrées et textes issus des univers.
- `media_assets` : métadonnées des fichiers stockés dans Supabase Storage.
- `entity_links` : relations entre projets, contacts, contenus et médias.
- `astrology_profiles` : données structurées des profils astrologiques.
- `ai_summaries` : résultats générés, source, date et type d’action.

Les fichiers seront stockés dans des buckets privés. Le navigateur utilisera uniquement la clé publique et les sessions authentifiées. La clé `service_role` ne sera jamais intégrée au client.

## 5. Parcours principaux

### Créer un projet

1. L’utilisateur ouvre Projets.
2. Il crée une idée avec un nom, un statut, une couleur et une description.
3. Il ajoute une ou plusieurs photos, notes ou pièces jointes.
4. Il peut rattacher des proches, des médias ou des contenus existants.
5. Il peut demander un résumé IA lorsque le contenu est suffisant.

### Importer un lot de médias

1. L’utilisateur sélectionne plusieurs fichiers.
2. MIVIX affiche la progression et les erreurs éventuelles.
3. Les fichiers sont envoyés dans un bucket privé.
4. Une fiche `media_assets` est créée pour chaque fichier.
5. L’utilisateur peut appliquer un projet, un univers, une personne ou un tag à plusieurs éléments.
6. Les médias apparaissent dans la bibliothèque globale et dans les fiches liées.

### Créer un profil spirituel

1. L’utilisateur ouvre Spiritualité.
2. Il choisit son profil principal ou crée le profil d’un proche.
3. Il ajoute une carte astrologique, des données structurées et des notes.
4. Il demande éventuellement une synthèse IA.
5. Il crée un lien explicite avec un proche, un projet ou un média.

## 6. Direction artistique

La DA actuelle de MIVIX reste la référence :

- fond crème texturé ;
- cartes arrondies, larges et aérées ;
- palette terracotta, sauge, rose poudré, lavande, ambre et prune ;
- formes géométriques organiques et compositions abstraites ;
- typographie éditoriale élégante ;
- navigation discrète, boutons flottants et rythme contemplatif.

Le widget Projets reprend la logique des cartes existantes avec une composition d’atelier : identité du projet, progression, aperçu média et activité.

Le widget Spiritualité introduit une variation céleste avec bleu nuit doux, prune, lavande, rose astral, doré, orbites, constellations et symboles planétaires. Cette variation doit rester une branche de MIVIX, pas une application visuellement indépendante.

## 7. Sécurité et robustesse

- Authentification email + mot de passe avec récupération par email.
- RLS sur toutes les tables accessibles par l’API.
- Buckets Storage privés et politiques d’accès liées à l’utilisateur authentifié.
- Appels IA côté serveur uniquement.
- Validation des tailles et formats de fichiers.
- Progression et reprise des imports par lots.
- Détection des doublons avant import lorsque possible.
- Copie de sécurité des données locales avant migration.
- Aucun contenu existant supprimé pendant la migration.

## 8. Ordre de construction

1. Préparer le projet Supabase et l’authentification.
2. Mettre en place le modèle commun et les règles de sécurité.
3. Migrer les données locales existantes.
4. Construire le widget Projets transversal.
5. Construire la bibliothèque médias et l’import en masse.
6. Ajouter les pièces jointes dans les widgets existants.
7. Construire le widget Spiritualité et les profils liés.
8. Ajouter les résumés IA à la demande.
9. Vérifier les parcours sur ordinateur et mobile.

## 9. Critères de validation

La première version sera considérée comme fonctionnelle lorsque l’utilisateur pourra :

- se connecter et récupérer son mot de passe ;
- retrouver ses données actuelles après migration ;
- créer et faire évoluer un projet entre les sept statuts ;
- importer un lot de photos et un document ;
- retrouver ces médias dans la bibliothèque globale ;
- rattacher un média à plusieurs fiches ;
- ajouter son profil astrologique et celui d’un proche ;
- créer un lien explicite entre un proche, un projet et un média ;
- demander un résumé IA manuel ;
- conserver une expérience visuelle cohérente avec la DA MIVIX.
