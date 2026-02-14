// Proteção contra carregamento duplo
if (!window.firebaseAppInitialized) {

window.firebaseAppInitialized = true;

import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js").then(async ({ initializeApp }) => {

const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
const authModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

const {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} = firestoreModule;

const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} = authModule;


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsccVCXA7q7ldAlW7EHh6d9yWP92gX16E",
  authDomain: "king-of-stree.firebaseapp.com",
  projectId: "king-of-stree",
  storageBucket: "king-of-stree.firebasestorage.app",
  messagingSenderId: "21535856779",
  appId: "1:21535856779:web:0644a278e7de61b14d9c8e"
};


// INICIALIZA
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);


// ELEMENTOS
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("app");

const btnLogin = document.getElementById("btnLogin");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnLogout = document.getElementById("btnLogout");

const loginEmail = document.getElementById("loginEmail");
const loginSenha = document.getElementById("loginSenha");


// LOGIN
onAuthStateChanged(auth, (user) => {

if (user) {

loginPage.style.display = "none";
appPage.style.display = "block";

} else {

loginPage.style.display = "flex";
appPage.style.display = "none";

}

});


// BOTÕES
btnLogin.onclick = async () => {

try {

await signInWithEmailAndPassword(
auth,
loginEmail.value,
loginSenha.value
);

alert("Login realizado");

} catch (e) {

alert("Erro: " + e.message);

}

};


btnRegistrar.onclick = async () => {

try {

await createUserWithEmailAndPassword(
auth,
loginEmail.value,
loginSenha.value
);

alert("Conta criada");

} catch (e) {

alert("Erro: " + e.message);

}

};


btnLogout.onclick = () => signOut(auth);


});

}
