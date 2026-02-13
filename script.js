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

const firebaseConfig = {
apiKey: "COLE_AQUI",
authDomain: "COLE_AQUI",
projectId: "COLE_AQUI",
storageBucket: "COLE_AQUI",
messagingSenderId: "COLE_AQUI",
appId: "COLE_AQUI"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, user => {
if(user){
loginPage.style.display="none";
app.style.display="block";
carregarTudo();
}else{
loginPage.style.display="flex";
app.style.display="none";
}
});

btnLogin.onclick = ()=> signInWithEmailAndPassword(auth, loginEmail.value, loginSenha.value);
btnRegistrar.onclick = ()=> createUserWithEmailAndPassword(auth, loginEmail.value, loginSenha.value);
btnLogout.onclick = ()=> signOut(auth);

formProduto.addEventListener("submit", async(e)=>{
e.preventDefault();

await addDoc(collection(db,"produtos"),{
nome:produtoNome.value,
categoria:produtoCategoria.value,
quantidade:parseInt(produtoQuantidade.value),
preco:parseFloat(produtoPreco.value)
});

e.target.reset();
carregarTudo();
});

btnVenda.onclick = async()=>{

const id = vendaProduto.value;
const qtd = parseInt(vendaQuantidade.value);

const snapshot = await getDocs(collection(db,"produtos"));

snapshot.forEach(async(docSnap)=>{

if(docSnap.id === id){

const data = docSnap.data();

if(qtd <= 0) return alert("Quantidade inválida");

if(data.quantidade < qtd){
alert("⚠ Estoque insuficiente!");
return;
}

// Baixa inteligente
await updateDoc(doc(db,"produtos",id),{
quantidade: data.quantidade - qtd
});

await addDoc(collection(db,"vendas"),{
produto:data.nome,
quantidade:qtd,
total:qtd*data.preco,
data:serverTimestamp()
});

alert("Venda registrada com baixa automática!");
carregarTudo();

}

});

};

async function carregarTudo(){
carregarProdutos();
carregarDashboard();
}

async function carregarProdutos(){

tabelaEstoque.innerHTML="";
vendaProduto.innerHTML="";

const snapshot = await getDocs(collection(db,"produtos"));

snapshot.forEach(docSnap=>{

const p = docSnap.data();

let status = p.quantidade <= 5 
? "<span class='low-stock'>Estoque Baixo</span>" 
: "Normal";

tabelaEstoque.innerHTML += `
<tr>
<td>${p.nome}</td>
<td>${p.quantidade}</td>
<td>R$ ${p.preco}</td>
<td>${status}</td>
<td><button onclick="deletar('${docSnap.id}')">Excluir</button></td>
</tr>
`;

vendaProduto.innerHTML += `<option value="${docSnap.id}">${p.nome}</option>`;

});

}

window.deletar = async(id)=>{
await deleteDoc(doc(db,"produtos",id));
carregarTudo();
};

async function carregarDashboard(){

const produtos = await getDocs(collection(db,"produtos"));
const vendas = await getDocs(collection(db,"vendas"));

totalProdutos.innerText = produtos.size;
totalVendas.innerText = vendas.size;

let total = 0;
vendas.forEach(v=> total += v.data().total || 0);
faturamentoTotal.innerText = "R$ " + total.toFixed(2);

}
