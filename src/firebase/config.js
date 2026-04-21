import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Current active project config
const firebaseConfig = {
  apiKey: "AIzaSyDRlmKIGPml1Q2z0W6zFpv-4jfbcZSg5qY",
  authDomain: "rentor-eu-speed-99.firebaseapp.com",
  projectId: "rentor-eu-speed-99",
  storageBucket: "rentor-eu-speed-99.firebasestorage.app",
  messagingSenderId: "752294899604",
  appId: "1:752294899604:web:421191e2d09a86e228e981"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Storage
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firestore with Offline Persistence for instant subsequent loads
// Important: persistentLocalCache caches data to device storage
// so the app loads instantly from cache even without internet
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // Fallback if persistence is not supported (e.g. private browsing)
  db = getFirestore(app);
}

export { db };
export default app;
