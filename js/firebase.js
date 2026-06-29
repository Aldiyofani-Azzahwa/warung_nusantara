/* ======================================================
   Restoran Nusantara
   File: js/firebase.js
   Deskripsi: Konfigurasi Firebase dan export Firestore
====================================================== */

/*
   CARA MENGISI FIREBASE CONFIG:

   1. Buka Firebase Console
   2. Masuk ke Project Settings
   3. Pilih Web App
   4. Copy firebaseConfig
   5. Tempelkan ke object firebaseConfig di bawah ini
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

/* ======================================================
   Firebase Config
   Ganti isi object ini dengan config project Firebase milikmu
====================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCMHsNNj6eqS2BiTMJpjcmpSHwecQEiOew",
  authDomain: "restoran-nusantara.firebaseapp.com",
  projectId: "restoran-nusantara",
  storageBucket: "restoran-nusantara.firebasestorage.app",
  messagingSenderId: "581010844302",
  appId: "1:581010844302:web:3f3290192f7e27c3b1b7df"
};

/* ======================================================
   Firebase Initialize
====================================================== */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ======================================================
   Export
   Supaya bisa digunakan oleh app.js dan seed.js
====================================================== */

export {
    app,
    db,
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch
};