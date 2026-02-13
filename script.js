import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const auth = getAuth(appFirebase);

/* =========================
   ELEMENTOS DOM
========================= */
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("app");

const btnLogin = document.getElementById("btnLogin");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnLogout = document.getElementById("btnLogout");

const loginEmail = document.getElementById("loginEmail");
const loginSenha = document.getElementById("loginSenha");

const formProduto = document.getElementById("formProduto");
const produtoNome = document.getElementById("produtoNome");
const produtoCategoria = document.getElementById("produtoCategoria");
const produtoQuantidade = document.getElementById("produtoQuantidade");
const produtoPreco = document.getElementById("produtoPreco");

const btnVenda = document.getElementById("btnVenda");
const vendaProduto = document.getElementById("vendaProduto");
const vendaQuantidade = document.getElementById("vendaQuantidade");

const tabelaEstoque = document.getElementById("tabelaEstoque");

const totalProdutos = document.getElementById("totalProdutos");
const totalVendas = document.getElementById("totalVendas");
const faturamentoTotal = document.getElementById("faturamentoTotal");

/* =========================
   AUTENTICAÇÃO
========================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginPage.style.display = "none";
    appPage.style.display = "block";
    carregarTudo();
  } else {
    loginPage.style.display = "flex";
    appPage.style.display = "none";
  }
});

btnLogin.onclick = async () => {
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginSenha.value);
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
};

btnRegistrar.onclick = async () => {
  try {
    await createUserWithEmailAndPassword(auth, loginEmail.value, loginSenha.value);
    alert("Conta criada com sucesso!");
  } catch (error) {
    alert("Erro ao registrar: " + error.message);
  }
};

btnLogout.onclick = () => signOut(auth);

/* =========================
   PRODUTOS
========================= */
formProduto.addEventListener("submit", async (e) => {
  e.preventDefault();

  await addDoc(collection(db, "produtos"), {
    nome: produtoNome.value,
    categoria: produtoCategoria.value,
    quantidade: parseInt(produtoQuantidade.value),
    preco: parseFloat(produtoPreco.value)
  });

  formProduto.reset();
  carregarTudo();
});

/* =========================
   VENDA (BAIXA INTELIGENTE)
========================= */
btnVenda.onclick = async () => {
  const id = vendaProduto.value;
  const qtd = parseInt(vendaQuantidade.value);

  if (qtd <= 0) return alert("Quantidade inválida");

  const produtosSnap = await getDocs(collection(db, "produtos"));

  produtosSnap.forEach(async (docSnap) => {
    if (docSnap.id === id) {
      const data = docSnap.data();

      if (data.quantidade < qtd) {
        alert("⚠ Estoque insuficiente!");
        return;
      }

      await updateDoc(doc(db, "produtos", id), {
        quantidade: data.quantidade - qtd
      });

      await addDoc(collection(db, "vendas"), {
        produto: data.nome,
        quantidade: qtd,
        total: qtd * data.preco,
        data: serverTimestamp()
      });

      alert("Venda registrada com baixa automática!");
      carregarTudo();
    }
  });
};

/* =========================
   CARREGAMENTO GERAL
========================= */
async function carregarTudo() {
  await carregarProdutos();
  await carregarDashboard();
}

/* =========================
   CARREGAR PRODUTOS
========================= */
async function carregarProdutos() {
  tabelaEstoque.innerHTML = "";
  vendaProduto.innerHTML = "";

  const snapshot = await getDocs(collection(db, "produtos"));

  snapshot.forEach((docSnap) => {
    const p = docSnap.data();

    let status =
      p.quantidade <= 5
        ? "<span class='low-stock'>Estoque Baixo</span>"
        : "Normal";

    tabelaEstoque.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.quantidade}</td>
        <td>R$ ${p.preco.toFixed(2)}</td>
        <td>${status}</td>
        <td><button onclick="deletar('${docSnap.id}')">Excluir</button></td>
      </tr>
    `;

    vendaProduto.innerHTML += `
      <option value="${docSnap.id}">${p.nome}</option>
    `;
  });
}

/* =========================
   DELETAR
========================= */
window.deletar = async (id) => {
  await deleteDoc(doc(db, "produtos", id));
  carregarTudo();
};

/* =========================
   DASHBOARD
========================= */
async function carregarDashboard() {
  const produtos = await getDocs(collection(db, "produtos"));
  const vendas = await getDocs(collection(db, "vendas"));

  totalProdutos.innerText = produtos.size;
  totalVendas.innerText = vendas.size;

  let total = 0;
  vendas.forEach((v) => (total += v.data().total || 0));

  faturamentoTotal.innerText = "R$ " + total.toFixed(2);
}
