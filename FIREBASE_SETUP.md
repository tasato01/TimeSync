# Firebase Setup Instructions

TimeSync uses Firebase for real-time data syncing. Please follow these steps to configure it:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click "Add project" and create a new project (e.g., "timesync-app").
3. Once created, click the Web icon (</>) to add a web app.
4. Name it "TimeSync" and register.
5. You will see a `firebaseConfig` object. Copy the values into a new file named `.env.local` in this folder.

The `.env.local` file should look like this:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

6. Note: Go to "Build" -> "Firestore Database" in the console sidebar.
7. Click "Create Database". Start in **Test Mode** (allows read/write) for now.
8. Choose a location (e.g., `asia-northeast1` for Tokyo).

Once done, the app will be able to connect!
