"use strict";

/* Contatos de exemplo (troque pelos seus dados reais depois) */
const CONTATOS = [
  { nome: "Ana Carolina", email: "ana.c@email.com" },
  { nome: "Bruno Almeida", email: "bruno@email.com" },
  { nome: "Carlos Eduardo", email: "carlos@email.com" },
];

/* ---------- Menu mobile ---------- */
const toggle = document.querySelector(".menu-toggle");
const overlay = document.querySelector(".overlay");

function setMenu(aberto) {
  document.body.classList.toggle("menu-open", aberto);
  toggle.setAttribute("aria-expanded", aberto);
  toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
}

toggle.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});

overlay.addEventListener("click", () => setMenu(false));

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

/* Fecha a gaveta se a tela crescer além do breakpoint do CSS */
matchMedia("(min-width: 1121px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});

/* ---------- Busca ---------- */
const form = document.querySelector(".search");
const input = form.querySelector("input");
const resultados = form.querySelector(".search-results");

/* Ignora acentos e maiúsculas: "joao" encontra "João" */
const normalizar = (texto) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function criarItem(titulo, detalhe) {
  const li = document.createElement("li");
  const strong = document.createElement("strong");
  strong.textContent = titulo;
  li.append(strong);

  if (detalhe) {
    const small = document.createElement("small");
    small.textContent = detalhe;
    li.append(small);
  }
  return li;
}

function fecharBusca() {
  resultados.hidden = true;
}

function buscar(termo) {
  const consulta = normalizar(termo.trim());
  if (!consulta) return fecharBusca();

  const achados = CONTATOS.filter(({ nome, email }) =>
    normalizar(`${nome} ${email}`).includes(consulta)
  );

  const itens = achados.length
    ? achados.map(({ nome, email }) => criarItem(nome, email))
    : [criarItem("Nenhum contato encontrado")];

  resultados.replaceChildren(...itens);
  resultados.hidden = false;
}

input.addEventListener("input", () => buscar(input.value));
form.addEventListener("submit", (e) => e.preventDefault());

document.addEventListener("click", (e) => {
  if (!form.contains(e.target)) fecharBusca();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  setMenu(false);
  fecharBusca();
});