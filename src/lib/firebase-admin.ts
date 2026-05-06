import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS;
  if (!credentials) {
    throw new Error("FIREBASE_ADMIN_CREDENTIALS env variable is not set");
  }

  adminApp = initializeApp({
    credential: cert(JSON.parse(credentials)),
  });

  return adminApp;
}

export const adminDb = getFirestore(getAdminApp());
