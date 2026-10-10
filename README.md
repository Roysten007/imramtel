# 🎬 Imran Tel — Portfolio Officiel // Monteur Vidéo YouTube & Rétention

> Site vitrine et portfolio haute performance pour créateurs YouTube, marques et agences.
> Déployable instantanément sur **Vercel** avec fonction Serverless pour l'assistant IA intégré.

---

## ⚡ Fonctionnalités Clés

- **Hero 3D Panorama & Effets Visuels** : Carrousel 3D dynamique en cylindre infini, micro-interactions, typographies éditoriales (`Syne`, `Bebas Neue`, `Plus Jakarta Sans`).
- **Portfolio Vidéo Haute Rétention (3x5 Grille Alignée)** : 15 réalisations vidéo verticales (9:16) optimisées pour le web, lecture vidéo dynamique et lecteur plein écran avec son.
- **Engagements & Roadmap (5 engagements concrets)** : Gros créateurs YouTube, sous-titres zéro faute & bilingue FR/EN, respect scrupuleux des délais, facturation micro-entreprise, formation continue.
- **Processus de Production (4 étapes)** : Brief, Dérushage & Montage, Post-Production & Color Grading, Livraison Master 4K.
- **Tarifs & Témoignages** : Présentation éditoriale sans tarif standard (sur-mesure) et captures d'avis clients avec agrandissement.
- **FAQ Interactive & Contact Direct** : Questions fréquentes sticky split et formulaires de contact rapides (WhatsApp direct, Instagram, Téléphone, E-mail).
- **Assistant IA "Cut-Bot" Intégré** : Assistant de qualification de projet alimenté par les modèles NVIDIA NIM (`meta/llama-3.2-11b-vision-instruct` / `openai/gpt-oss-20b`), compatible en local et en Serverless sur Vercel (`/api/chat`).

---

## 🚀 Déploiement sur Vercel

### Option 1 : Déploiement automatique via GitHub (Recommandé)

1. Connectez-vous sur [Vercel](https://vercel.com).
2. Cliquez sur **"Add New..."** > **"Project"**.
3. Importez le dépôt Git : `https://github.com/Roysten007/imramtel`.
4. Configurez les variables d'environnement (optionnel si vous souhaitez votre propre clé NVIDIA) :
   - `NVIDIA_API_KEY` : Clé API NVIDIA NIM pour l'assistant IA.
5. Cliquez sur **"Deploy"**.
6. Vercel déploiera le site en quelques secondes sur un domaine sécurisé en HTTPS (ex: `imramtel.vercel.app`).

### Option 2 : Déploiement via Vercel CLI

```bash
# Installer Vercel CLI (si ce n'est pas déjà fait)
npm install -g vercel

# Déployer en production
vercel --prod
```

---

## 💻 Lancer le projet en Local

1. Cloner le dépôt :
```bash
git clone https://github.com/Roysten007/imramtel.git
cd imramtel
```

2. Lancer le serveur local :
```bash
npm start
# ou
node server.js
```

3. Ouvrir votre navigateur sur [http://localhost:5173](http://localhost:5173).

---

## 📁 Architecture du Projet

```
├── api/
│   └── chat.js                 # Fonction Serverless Vercel (Assistant Cut-Bot IA)
├── assets/
│   ├── images/reviews/         # Captures d'écrans des avis clients
│   └── projets/
│       ├── posters/            # Affiches de prévisualisation WebP (16 projets)
│       └── videos/             # Fichiers vidéos MP4 compressés pour le web (16 projets)
├── css/
│   └── style.css               # Feuilles de styles CSS modernes & responsives
├── js/
│   ├── ai-assistant.js         # Logique du chat assistant IA (Cut-Bot)
│   ├── before-after.js         # Comparateur avant/après
│   ├── main.js                 # Contrôleur audio Web Audio API, GSAP et navigation
│   └── scrubber.js             # Moteur de scrubbing vidéo
├── index.html                  # Page d'accueil et structure complète
├── package.json                # Définition du projet et scripts npm
├── server.js                   # Serveur Node.js local avec routage statique et API
├── vercel.json                 # Configuration de cache et routage Vercel
└── .gitignore                  # Exclusion des fichiers lourds (>100MB) et secrets
```

---

## 📞 Contact Officiel

- **Monteur** : Imran Tel
- **Téléphone** : [06 15 25 47 92](tel:0615254792)
- **WhatsApp** : [Discuter sur WhatsApp](https://wa.me/33615254792)
- **Instagram** : [@imran.tel.ve](https://www.instagram.com/imran.tel.ve/?next=%2F)
- **E-mail** : [imrantel.pro@gmail.com](mailto:imrantel.pro@gmail.com)

---

© 2026 Imran Tel. Tous droits réservés.
