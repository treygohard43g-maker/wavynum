import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3XaTvJYhqn5pxRQGFJsFqSRC5WSROKpg",
  authDomain: "wavynum.firebaseapp.com",
  projectId: "wavynum",
  storageBucket: "wavynum.firebasestorage.app",
  messagingSenderId: "705065824605",
  appId: "1:705065824605:web:6a1a3eaa8fea4b101bb8b4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export { app };
