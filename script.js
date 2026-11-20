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
  if (toggle) {
    toggle.setAttribute("aria-expanded", aberto);
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  }
}

toggle?.addEventListener("click", () => {
  setMenu(!document.body.classList.contains("menu-open"));
});

overlay?.addEventListener("click", () => setMenu(false));

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

/* Fecha a gaveta se a tela crescer além do breakpoint do CSS */
matchMedia("(min-width: 1121px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});

/* ---------- Busca ---------- */
const searchForm = document.querySelector(".search");

function iniciarBusca(form) {
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
    if (e.key === "Escape") fecharBusca();
  });
}

if (searchForm) iniciarBusca(searchForm);

/* Tecla Escape fecha o menu em qualquer página */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* ---------- Autenticação (somente na página de login) ---------- */
function iniciarAutenticacao() {
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  if (!formLogin || !formRegister) return;

  const CHAVE_USUARIOS = "connecta_usuarios";
  const CHAVE_SESSAO = "connecta_sessao";

  const tabs = document.querySelectorAll(".auth-tab");

  const getUsuarios = () => JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || "[]");
  const salvarUsuarios = (lista) => localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));

  const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  /* Gera um hash SHA-256 da senha (exige HTTPS ou localhost) */
  async function hashSenha(senha) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(senha));
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function mostrarMsg(form, texto, tipo = "error") {
    const msg = form.querySelector(".auth-msg");
    msg.textContent = texto;
    msg.className = `auth-msg is-${tipo}`;
  }

  function marcarCampo(input, invalido) {
    input.classList.toggle("is-invalid", invalido);
    input.setAttribute("aria-invalid", String(invalido));
  }

  function setCarregando(form, carregando) {
    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = carregando;
    botao.textContent = carregando ? "Aguarde..." : botao.dataset.texto;
  }

  function ativarAba(nome) {
    tabs.forEach((tab) => {
      const ativa = tab.dataset.tab === nome;
      tab.classList.toggle("is-active", ativa);
      tab.setAttribute("aria-selected", String(ativa));
    });
    formLogin.hidden = nome !== "login";
    formRegister.hidden = nome !== "register";
    mostrarMsg(formLogin, "");
    mostrarMsg(formRegister, "");
  }

  function iniciarSessao(usuario, manterConectado) {
    const sessao = JSON.stringify({ nome: usuario.nome, email: usuario.email });
    if (manterConectado) {
      localStorage.setItem(CHAVE_SESSAO, sessao);
    } else {
      sessionStorage.setItem(CHAVE_SESSAO, sessao);
    }
    window.location.href = "contatos.html";
  }

  /* Guarda o texto original dos botões */
  document.querySelectorAll('.auth-form button[type="submit"]').forEach((b) => {
    b.dataset.texto = b.textContent;
  });

  tabs.forEach((tab) => tab.addEventListener("click", () => ativarAba(tab.dataset.tab)));

  /* Abre direto na aba de cadastro se vier de "?tab=register" */
  if (new URLSearchParams(window.location.search).get("tab") === "register") {
    ativarAba("register");
  }

  /* ----- Login ----- */
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = formLogin.elements.email;
    const senhaInput = formLogin.elements.senha;
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value;

    marcarCampo(emailInput, !emailValido(email));
    marcarCampo(senhaInput, !senha);

    if (!emailValido(email)) return mostrarMsg(formLogin, "Informe um e-mail válido.");
    if (!senha) return mostrarMsg(formLogin, "Informe sua senha.");

    setCarregando(formLogin, true);
    try {
      const hash = await hashSenha(senha);
      const usuario = getUsuarios().find((u) => u.email === email);

      if (!usuario || usuario.senha !== hash) {
        marcarCampo(emailInput, true);
        marcarCampo(senhaInput, true);
        return mostrarMsg(formLogin, "E-mail ou senha incorretos.");
      }

      mostrarMsg(formLogin, "Login realizado! Redirecionando...", "success");
      iniciarSessao(usuario, formLogin.elements.lembrar.checked);
    } finally {
      setCarregando(formLogin, false);
    }
  });

  /* ----- Cadastro ----- */
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { nome: nomeInput, email: emailInput, senha: senhaInput, confirmar: confirmarInput } = formRegister.elements;
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value;
    const confirmar = confirmarInput.value;

    const erros = [
      [nomeInput, nome.length < 2, "Informe seu nome."],
      [emailInput, !emailValido(email), "Informe um e-mail válido."],
      [senhaInput, senha.length < 8, "A senha precisa ter pelo menos 8 caracteres."],
      [confirmarInput, confirmar !== senha, "As senhas não coincidem."],
    ];

    let primeiroErro = null;
    erros.forEach(([input, invalido, msg]) => {
      marcarCampo(input, invalido);
      if (invalido && !primeiroErro) primeiroErro = msg;
    });
    if (primeiroErro) return mostrarMsg(formRegister, primeiroErro);

    if (getUsuarios().some((u) => u.email === email)) {
      marcarCampo(emailInput, true);
      return mostrarMsg(formRegister, "Já existe uma conta com este e-mail.");
    }

    setCarregando(formRegister, true);
    try {
      const usuario = { nome, email, senha: await hashSenha(senha) };
      salvarUsuarios([...getUsuarios(), usuario]);
      mostrarMsg(formRegister, "Conta criada! Redirecionando...", "success");
      iniciarSessao(usuario, true);
    } finally {
      setCarregando(formRegister, false);
    }
  });

  /* Remove o destaque de erro ao digitar */
  formLogin.addEventListener("input", (e) => marcarCampo(e.target, false));
  formRegister.addEventListener("input", (e) => marcarCampo(e.target, false));
}

iniciarAutenticacao();
