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

const tabela = document.getElementById("corpoTabelaEstoque");
const vendaSelect = document.getElementById("vendaProduto");

async function carregarProdutos(){

tabela.innerHTML="";
vendaSelect.innerHTML="";

const snapshot = await getDocs(collection(db,"produtos"));

snapshot.forEach((docSnap)=>{

const p = docSnap.data();

tabela.innerHTML+=`
<tr>
<td>${docSnap.id}</td>
<td>${p.nome}</td>
<td>${p.categoria}</td>
<td>${p.tamanho}</td>
<td>${p.cor}</td>
<td>${p.quantidade}</td>
<td>R$ ${p.preco}</td>
<td><button onclick="deletarProduto('${docSnap.id}')">Excluir</button></td>
</tr>
`;

vendaSelect.innerHTML+=`<option value="${docSnap.id}">${p.nome}</option>`;

});

}

window.deletarProduto = async function(id){

await deleteDoc(doc(db,"produtos",id));
carregarProdutos();

};

document.getElementById("formProduto").addEventListener("submit",async(e)=>{

e.preventDefault();

const produto={
nome:produtoNome.value,
categoria:produtoCategoria.value,
tamanho:produtoTamanho.value,
cor:produtoCor.value,
quantidade:parseInt(produtoQuantidade.value),
preco:parseFloat(produtoPreco.value)
};

await addDoc(collection(db,"produtos"),produto);

e.target.reset();
carregarProdutos();

});

document.getElementById("btnFinalizarVenda").addEventListener("click",async()=>{

const id=vendaProduto.value;
const qtd=parseInt(vendaQuantidade.value);

const snapshot = await getDocs(collection(db,"produtos"));

snapshot.forEach(async(docSnap)=>{

if(docSnap.id===id){

const data=docSnap.data();

if(data.quantidade<qtd){

alert("Estoque insuficiente");
return;

}

await updateDoc(doc(db,"produtos",id),{
quantidade:data.quantidade-qtd
});

await addDoc(collection(db,"vendas"),{
produto:data.nome,
quantidade:qtd,
total:qtd*data.preco,
data:serverTimestamp()
});

alert("Venda registrada");
carregarProdutos();

}

});

});

carregarProdutos();
