# Le Serment du Sang — Elden Ring

Site de révélation de quête pour le live.

## Structure

```text
elden-ring-quete/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── quest-data.js
│   └── script.js
└── assets/
    ├── images/
    └── audio/
```

## Fonctionnement

- Les scènes sont numérotées séquentiellement de 1 à 5, puis la scène finale.
- La progression est sauvegardée dans `localStorage`.
- La version de sauvegarde est volontairement passée à `3` pour invalider les anciennes progressions incompatibles.
- Les indices sont sauvegardés séparément pour chaque étape.
- La navigation des scènes n'affiche que les scènes déjà atteintes.
- Le bouton de réinitialisation est conservé pour les tests.
