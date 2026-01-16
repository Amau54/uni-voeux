# Fonctionnalités de l'Application Uni-Voeux

Ce document décrit les principales fonctionnalités de l'application Uni-Voeux, basées sur l'analyse du code source.

## 1. Workflow de l'Étudiant : Sélection des Vœux

**Fichier clé :** `packages/frontend/src/components/WishSelector.tsx`

Cette fonctionnalité permet aux étudiants de sélectionner et de classer leurs vœux pour une période d'affectation donnée.

- **Affichage des vœux :** Les étudiants peuvent consulter la liste de tous les vœux disponibles. Pour chaque vœu, le nombre de places restantes est affiché.
- **Tri des vœux :** Pour faciliter la recherche, les vœux peuvent être triés par :
    - **Capacité :** Nombre de places disponibles (ordre décroissant).
    - **Ordre alphabétique :** Nom du vœu.
- **Sélection :** Les étudiants peuvent ajouter jusqu'à 9 vœux dans leur panier de sélection.
- **Classement :** Les vœux dans le panier sont automatiquement classés par ordre de sélection, représentant leur priorité (de 1 à 9).
- **Validation :** Une fois la sélection terminée, l'étudiant doit valider ses choix. Cette action enregistre ses vœux dans la base de données et verrouille son profil pour la période d'affectation.

## 2. Tableau de Bord du Professeur/Administrateur

**Fichier clé :** `packages/frontend/src/components/Dashboard.tsx`

Ce tableau de bord offre une vue d'ensemble de l'état du processus d'affectation.

- **Vue des résultats :** Affiche un tableau de tous les étudiants avec les informations suivantes :
    - Nom de l'étudiant.
    - Vœu obtenu (si applicable).
    - Statut de l'affectation (`Validé` ou `NON AFFECTÉ`).
- **Alerte de capacité :** Une alerte visuelle (bannière rouge) s'affiche si la capacité totale de tous les vœux est inférieure au nombre total d'étudiants, signalant un risque que certains étudiants ne reçoivent aucune affectation.
- **Mise en évidence :** Les lignes des étudiants qui n'ont pas été affectés sont surlignées en rouge pour une identification rapide.

## 3. Algorithme d'Affectation (Backend)

**Fichier clé :** `functions/src/index.ts` (`runAllocationAlgorithm`)

Il s'agit du cœur logique de l'application. Cette fonction Cloud est exécutée pour attribuer les vœux aux étudiants.

- **Déclenchement :** La fonction est déclenchée manuellement (via une requête HTTPS), ce qui permet aux administrateurs de lancer l'affectation au moment opportun.
- **Classement des étudiants :** L'algorithme traite les étudiants un par un, en suivant un classement prédéfini (par exemple, par mérite ou ancienneté).
- **Priorité des vœux :** Pour chaque étudiant, l'algorithme examine ses vœux dans l'ordre de priorité qu'il a défini (de 1 à 9).
- **Vérification de la capacité :** Il tente d'assigner le premier vœu de la liste de l'étudiant. Si le vœu a encore des places disponibles, l'étudiant est affecté.
- **Transactions atomiques :** L'opération de vérification de la capacité et d'incrémentation du nombre d'inscrits est atomique (grâce aux transactions Firestore), ce qui empêche les situations de "surbooking".
- **Itération :** Si le vœu le plus prioritaire est complet, l'algorithme passe au vœu suivant dans la liste de l'étudiant, et ce, jusqu'à ce qu'une place soit trouvée.
- **Gestion des non-affectés :** Si aucun des vœux d'un étudiant ne peut être satisfait, son statut est mis à jour à "NON AFFECTÉ".
