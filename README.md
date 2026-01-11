# Bienvenue sur Uni-Voeux (Version Firebase) !

Uni-Voeux est un logiciel d'affectation de vœux étudiants conçu pour être fiable, ergonomique et transparent, et entièrement construit sur la plateforme Firebase.

Ce guide vous expliquera comment installer, configurer et lancer l'application sur votre machine locale en utilisant l'émulateur Firebase.

## 1. Prérequis

Avant de commencer, assurez-vous d'avoir installé les logiciels suivants :

*   **Node.js** : Version 18 ou supérieure. Vous pouvez le télécharger sur [nodejs.org](https://nodejs.org/).
*   **pnpm** : Un gestionnaire de paquets rapide et efficace. Une fois Node.js installé, installez pnpm avec :
    ```bash
    npm install -g pnpm
    ```
*   **Firebase CLI** : L'interface de ligne de commande pour Firebase.
    ```bash
    npm install -g firebase-tools
    ```

## 2. Installation et Configuration

1.  **Clonez le dépôt de code :**
    ```bash
    git clone <URL_DU_DEPOT>
    cd uni-voeux
    ```

2.  **Installez les dépendances :**
    Cette commande installera les dépendances pour le frontend et les Cloud Functions.
    ```bash
    pnpm install
    ```

3.  **Connectez-vous à Firebase :**
    Authentifiez-vous auprès de Firebase pour pouvoir gérer votre projet.
    ```bash
    firebase login
    ```

4.  **Créez un projet Firebase :**
    *   Allez sur la [console Firebase](https://console.firebase.google.com/) et créez un nouveau projet.
    *   Activez **Authentication** (avec le fournisseur Email/Password) et **Firestore Database**.

5.  **Configurez le projet local :**
    *   Associez votre projet local à votre projet Firebase :
        ```bash
        firebase use --add
        ```
        Sélectionnez le projet que vous venez de créer.
    *   Créez un fichier `.env.local` à la racine du dossier `packages/frontend`. Ajoutez-y la configuration de votre application web Firebase (vous pouvez la trouver dans les paramètres de votre projet Firebase > "Vos applications").
        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=...
        ```

## 3. Lancement de l'Application avec l'Émulateur

Pour développer localement sans affecter les données de production, nous utiliserons l'émulateur Firebase.

1.  **Lancez l'Émulateur Firebase :**
    Cette commande démarrera une suite d'émulateurs locaux pour l'authentification, Firestore et les Cloud Functions.
    ```bash
    firebase emulators:start
    ```

2.  **Lancez le Frontend :**
    Ouvrez un **second terminal** et lancez l'application Next.js.
    ```bash
    pnpm dev:frontend
    ```

## 4. Accès à l'Application

*   **Interface Utilisateur :** Ouvrez votre navigateur et allez à `http://localhost:3001` (ou le port indiqué dans le terminal).
*   **UI de l'Émulateur :** Vous pouvez visualiser l'état de votre base de données et de vos fonctions locales à l'adresse `http://localhost:4000`.

Vous pouvez maintenant développer, tester et utiliser Uni-Voeux dans un environnement Firebase entièrement local.
