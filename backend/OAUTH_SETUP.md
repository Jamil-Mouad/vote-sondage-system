# Configuration Google OAuth

Si vous souhaitez activer l'authentification avec Google, suivez ces étapes :

## 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Donnez-lui un nom (ex: "NeoVote")

## 2. Activer l'API Google+

1. Dans le menu latéral, allez dans **APIs & Services** > **Library**
2. Recherchez "Google+ API"
3. Cliquez sur **Enable**

## 3. Créer des identifiants OAuth 2.0

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Si demandé, configurez l'écran de consentement OAuth :
   - Type : External
   - Nom de l'application : NeoVote
   - Email de support : votre email
   - Domaines autorisés : localhost
   - Email de contact : votre email

4. Pour le Client ID :
   - Type d'application : **Application Web**
   - Nom : NeoVote Web Client
   - **Origines JavaScript autorisées** :
     - `http://localhost:3000`
     - `http://localhost:5000`
   - **URIs de redirection autorisées** :
     - `http://localhost:5000/api/auth/google/callback`

5. Cliquez sur **Create**

## 4. Copier les credentials

Vous recevrez :
- Un **Client ID** (ressemble à : `123456789-abcdefg.apps.googleusercontent.com`)
- Un **Client Secret** (ressemble à : `GOCSPX-xxxxxxxxxxxxxx`)

## 5. Mettre à jour le fichier .env

Ouvrez `backend/.env` et remplacez :

```env
GOOGLE_CLIENT_ID=votre_client_id_ici
GOOGLE_CLIENT_SECRET=votre_client_secret_ici
```

## 6. Redémarrer le serveur

```bash
npm start
```

## ⚠️ Important pour la production

En production, vous devrez :
- Ajouter votre domaine de production dans les origines autorisées
- Mettre à jour `GOOGLE_CALLBACK_URL` dans le .env avec votre URL de production
- Configurer l'écran de consentement OAuth en mode "Production" (nécessite une vérification)

## Désactiver Google OAuth

Pour désactiver Google OAuth, laissez simplement `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` vides dans le `.env`.
