// ============================================================================
// CAMADA DE LÓGICA, BANCO DE DADOS E ADMIN CMS (v5.0 ULTIMATE) - KELDE.DEV
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarPerfilSeguro();
  inicializarFotoPerfil();
  inicializarTemaSeguro();
  inicializarSistemaAuth();
  inicializarPainelAdmin();
  inicializarTelemetria();
  inicializarBlog();
  inicializarRoadmap();
  inicializarProjetos();
  inicializarModal();
  inicializarCommandPalette();
  inicializarCurriculoPDF();
  inicializarBarraProgressoGlobal();
});

// [CIBERSEGURANÇA] 1. Sanitizador Anti-XSS
function escaparHTML(texto) {
  if (typeof texto !== "string") return "";
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return texto.replace(/[&<>"']/g, (c) => mapa[c]);
}

// [CIBERSEGURANÇA] 2. Validador de URLs
function validarURLSegura(url) {
  if (typeof url !== "string") return "#";
  const limpa = url.trim();
  if (limpa.startsWith("https://") || limpa.startsWith("http://") || limpa.startsWith("mailto:")) {
    return limpa;
  }
  return "#";
}

// [CIBERSEGURANÇA] 3. Gerador de Hash Criptográfico com Salt
function gerarHashSenha(senha, email) {
  const salt = "KELDE_SEC_SALT_2026_" + email.toLowerCase().trim();
  const combinacao = salt + "::" + senha;
  let h1 = 0xdeadbeef ^ combinacao.length;
  let h2 = 0x41c6ce57 ^ combinacao.length;
  for (let i = 0, ch; i < combinacao.length; i++) {
    ch = combinacao.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return "ksec_" + (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

// [PARSER AUTOMÁTICO] 4. Converte texto simples do Admin em HTML estruturado
function converterTextoParaHTMLSeguro(textoBruto) {
  const linhas = textoBruto.split(/\r?\n/);
  let htmlFinal = "";
  let emLista = false;

  for (let linha of linhas) {
    const limpa = linha.trim();
    if (!limpa) {
      if (emLista) {
        htmlFinal += "</ul>";
        emLista = false;
      }
      continue;
    }

    if (limpa.startsWith("### ")) {
      if (emLista) {
        htmlFinal += "</ul>";
        emLista = false;
      }
      htmlFinal += `<h3>${escaparHTML(limpa.replace("### ", ""))}</h3>`;
    } else if (limpa.startsWith("- ")) {
      if (!emLista) {
        htmlFinal += "<ul>";
        emLista = true;
      }
      htmlFinal += `<li>${escaparHTML(limpa.replace("- ", ""))}</li>`;
    } else {
      if (emLista) {
        htmlFinal += "</ul>";
        emLista = false;
      }
      htmlFinal += `<p>${escaparHTML(limpa)}</p>`;
    }
  }
  if (emLista) htmlFinal += "</ul>";
  return htmlFinal;
}

// ============================================================================
// MOTOR DE BANCO DE DADOS NOSQL + RBAC ADMIN (KELDE_DB)
// Credencial Mestre Admin: admin@kelde.dev | Senha Mestre: Kelde@2026
// ============================================================================
const EMAIL_ADMIN_MESTRE = "admin@kelde.dev";
const HASH_ADMIN_MESTRE = gerarHashSenha("Kelde@2026", EMAIL_ADMIN_MESTRE);

const KELDE_DB = {
  lerTabela(chave, padrao = []) {
    try {
      const dados = localStorage.getItem(chave);
      return dados ? JSON.parse(dados) : padrao;
    } catch (e) {
      return padrao;
    }
  },
  salvarTabela(chave, dados) {
    try {
      localStorage.setItem(chave, JSON.stringify(dados));
      return true;
    } catch (e) {
      return false;
    }
  },
  obterTodosArtigos() {
    const artigosCustom = this.lerTabela("kelde_db_artigos_admin", null);
    if (!artigosCustom) {
      return DADOS_ARTIGOS;
    }
    return artigosCustom;
  },
  publicarNovoArtigo(titulo, categoria, tagsTexto, resumo, conteudoBruto) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao || sessao.role !== "admin") return false;

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")} ${meses[hoje.getMonth()]} ${hoje.getFullYear()}`;

    const tagsArray = tagsTexto
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const novoArtigo = {
      id: Date.now(),
      titulo: titulo.trim(),
      data: dataFormatada,
      categoria: categoria,
      destaque: true,
      resumo: resumo.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ["Engenharia"],
      conteudo: converterTextoParaHTMLSeguro(conteudoBruto)
    };

    const atuais = [...this.obterTodosArtigos()];
    atuais.unshift(novoArtigo);
    this.salvarTabela("kelde_db_artigos_admin", atuais);
    return novoArtigo;
  },
  excluirArtigo(idArtigo) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao || sessao.role !== "admin") return false;

    const filtrados = this.obterTodosArtigos().filter((a) => Number(a.id) !== Number(idArtigo));
    this.salvarTabela("kelde_db_artigos_admin", filtrados);
    return true;
  },
  obterUsuarioLogado() {
    return this.lerTabela("kelde_sessao_atual", null);
  },
  registrarUsuario(nome, cargo, email, senha) {
    const emailLimpo = email.toLowerCase().trim();
    if (emailLimpo === EMAIL_ADMIN_MESTRE) {
      return { sucesso: false, mensagem: "Este e-mail é reservado ao Administrador. Use a aba Entrar!" };
    }

    const usuarios = this.lerTabela("kelde_db_usuarios", []);
    if (usuarios.some((u) => u.email === emailLimpo)) {
      return { sucesso: false, mensagem: "Este e-mail já possui uma conta cadastrada." };
    }

    const novoUsuario = {
      id: Date.now(),
      nome: nome.trim(),
      cargo: cargo.trim() || "Leitor(a) da Comunidade",
      email: emailLimpo,
      role: "leitor",
      senhaHash: gerarHashSenha(senha, emailLimpo),
      favoritos: [],
      criadoEm: new Date().toLocaleDateString("pt-BR")
    };

    usuarios.push(novoUsuario);
    this.salvarTabela("kelde_db_usuarios", usuarios);

    const sessaoSegura = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      cargo: novoUsuario.cargo,
      email: novoUsuario.email,
      role: "leitor",
      favoritos: novoUsuario.favoritos
    };
    this.salvarTabela("kelde_sessao_atual", sessaoSegura);
    return { sucesso: true, usuario: sessaoSegura };
  },
  autenticarUsuario(email, senha) {
    const emailLimpo = email.toLowerCase().trim();
    const hashTentativa = gerarHashSenha(senha, emailLimpo);

    if (emailLimpo === EMAIL_ADMIN_MESTRE && hashTentativa === HASH_ADMIN_MESTRE) {
      const sessaoAdmin = {
        id: 1,
        nome: DADOS_PERFIL.nomeCompleto || "Mikélder",
        cargo: "Engenheiro & Admin (KELDE)",
        email: EMAIL_ADMIN_MESTRE,
        role: "admin",
        favoritos: this.lerTabela("kelde_admin_favs", [])
      };
      this.salvarTabela("kelde_sessao_atual", sessaoAdmin);
      return { sucesso: true, usuario: sessaoAdmin };
    }

    const usuarios = this.lerTabela("kelde_db_usuarios", []);
    const encontrado = usuarios.find((u) => u.email === emailLimpo && u.senhaHash === hashTentativa);
    if (!encontrado) {
      return { sucesso: false, mensagem: "E-mail ou senha incorretos." };
    }

    const sessaoSegura = {
      id: encontrado.id,
      nome: encontrado.nome,
      cargo: encontrado.cargo,
      email: encontrado.email,
      role: "leitor",
      favoritos: encontrado.favoritos || []
    };
    this.salvarTabela("kelde_sessao_atual", sessaoSegura);
    return { sucesso: true, usuario: sessaoSegura };
  },
  encerrarSessao() {
    try {
      localStorage.removeItem("kelde_sessao_atual");
    } catch (e) {}
  },
  alternarFavorito(idArtigo) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao) return null;

    if (sessao.role === "admin") {
      const favs = sessao.favoritos || [];
      const pos = favs.indexOf(idArtigo);
      if (pos >= 0) favs.splice(pos, 1);
      else favs.push(idArtigo);
      sessao.favoritos = favs;
      this.salvarTabela("kelde_admin_favs", favs);
      this.salvarTabela("kelde_sessao_atual", sessao);
      return favs;
    }

    const usuarios = this.lerTabela("kelde_db_usuarios", []);
    const index = usuarios.findIndex((u) => u.email === sessao.email);
    if (index === -1) return null;

    const favs = usuarios[index].favoritos || [];
    const pos = favs.indexOf(idArtigo);
    if (pos >= 0) favs.splice(pos, 1);
    else favs.push(idArtigo);

    usuarios[index].favoritos = favs;
    sessao.favoritos = favs;
    this.salvarTabela("kelde_db_usuarios", usuarios);
    this.salvarTabela("kelde_sessao_atual", sessao);
    return favs;
  },
  obterComentarios(idArtigo) {
    const base = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
    const salvos = this.lerTabela("kelde_db_comentarios", base);
    return salvos.filter((c) => Number(c.idArtigo) === Number(idArtigo));
  },
  adicionarComentario(idArtigo, texto) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao) return false;

    const base = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
    const todos = this.lerTabela("kelde_db_comentarios", base);
    todos.push({
      idArtigo: Number(idArtigo),
      autor: sessao.role === "admin" ? `👑 ${sessao.nome}` : sessao.nome,
      cargo: sessao.cargo,
      data: new Date().toLocaleDateString("pt-BR"),
      texto: texto.trim()
    });
    this.salvarTabela("kelde_db_comentarios", todos);
    return true;
  }
};

// ============================================================================
// 5. FOTO DE PERFIL, DADOS E CABEÇALHO DE IMPRESSÃO A4
// ============================================================================
function inicializarFotoPerfil() {
  const img = document.getElementById("img-foto-perfil");
  const fallback = document.getElementById("fallback-avatar");
  fallback.textContent = DADOS_PERFIL.iniciais || "MK";

  if (!DADOS_PERFIL.fotoPerfil) {
    img.style.display = "none";
    fallback.style.display = "flex";
    return;
  }

  img.src = DADOS_PERFIL.fotoPerfil;
  img.onerror = () => {
    img.style.display = "none";
    fallback.style.display = "flex";
  };
  img.onload = () => {
    img.style.display = "block";
    fallback.style.display = "none";
  };
}

function inicializarPerfilSeguro() {
  document.getElementById("nav-marca").textContent = DADOS_PERFIL.marca;
  document.getElementById("nav-sufixo").textContent = DADOS_PERFIL.sufixoMarca;
  document.getElementById("hero-status").textContent = DADOS_PERFIL.statusAtual;
  document.getElementById("hero-nome").textContent = DADOS_PERFIL.nomeCompleto;
  document.getElementById("hero-instituicao").textContent = DADOS_PERFIL.instituicao;
  document.getElementById("hero-headline").textContent = DADOS_PERFIL.headline;
  document.getElementById("hero-subheadline").textContent = DADOS_PERFIL.subheadline;
  document.getElementById("texto-sobre").textContent = DADOS_PERFIL.sobreMim;
  document.getElementById("ano-atual").textContent = new Date().getFullYear();

  // Cabeçalho do Currículo em PDF
  document.getElementById("print-nome").textContent = `${DADOS_PERFIL.nomeCompleto} (${DADOS_PERFIL.marca}${DADOS_PERFIL.sufixoMarca})`;
  document.getElementById("print-instituicao").textContent = DADOS_PERFIL.instituicao;
  document.getElementById("print-headline").textContent = DADOS_PERFIL.headline;
  document.getElementById("print-contatos").textContent = `Portfólio: ${DADOS_PERFIL.urlPublica || "kelde.dev"} | GitHub: ${DADOS_PERFIL.contatos.github} | Tel: ${DADOS_PERFIL.contatos.telefoneExibicao}`;

  const containerContatos = document.getElementById("lista-contatos");
  const c = DADOS_PERFIL.contatos;

  containerContatos.innerHTML = `
    <a href="${validarURLSegura(c.linkedin)}" target="_blank" rel="noopener noreferrer" class="contact-item">
      <span>💼 LinkedIn Profissional</span> <span class="mono-accent">Conectar ↗</span>
    </a>
    <a href="${validarURLSegura(c.github)}" target="_blank" rel="noopener noreferrer" class="contact-item">
      <span>💻 GitHub & Repositórios</span> <span class="mono-accent">Seguir ↗</span>
    </a>
    <a href="#contato-protegido" id="btn-whatsapp-seguro" class="contact-item">
      <span>💬 WhatsApp Direto</span> <span class="mono-accent">Desbloquear & Chamar ↗</span>
    </a>
    <a href="#contato-protegido" id="btn-email-seguro" class="contact-item">
      <span>✉️ E-mail Acadêmico/Profissional</span> <span class="mono-accent">Enviar ↗</span>
    </a>
    <div id="box-telefone-seguro" class="contact-item" style="cursor: pointer;">
      <span>📞 Telefone / Contato</span> <span id="texto-tel-ofuscado" class="mono-accent">🔒 Clique para revelar</span>
    </div>
  `;

  document.getElementById("btn-whatsapp-seguro").addEventListener("click", (e) => {
    e.preventDefault();
    window.open(validarURLSegura(c.whatsapp), "_blank", "noopener,noreferrer");
  });

  document.getElementById("btn-email-seguro").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = validarURLSegura(c.email);
  });

  document.getElementById("box-telefone-seguro").addEventListener("click", () => {
    document.getElementById("texto-tel-ofuscado").textContent = c.telefoneExibicao;
  });

  document.getElementById("modal-link-linkedin").href = validarURLSegura(c.linkedin);
}

// ============================================================================
// 6. TELEMETRIA ACADÊMICA GAMIFICADA
// ============================================================================
function inicializarTelemetria() {
  const grid = document.getElementById("grid-telemetria");
  if (!grid || typeof DADOS_TELEMETRIA === "undefined") return;

  grid.innerHTML = DADOS_TELEMETRIA.map((t) => {
    const pct = Math.min(100, Math.max(0, Math.round((Number(t.valorAtual) / Number(t.valorMeta)) * 100)));
    const exibicaoValor =
      t.unidade === "%"
        ? `${Number(t.valorAtual)}%`
        : `${Number(t.valorAtual)} / ${Number(t.valorMeta)} ${escaparHTML(t.unidade)}`;

    return `
      <div class="telemetry-card">
        <div class="telemetry-top">
          <span class="telemetry-label">${escaparHTML(t.rotulo)}</span>
          <span class="telemetry-value">${exibicaoValor}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <p class="telemetry-detail">${escaparHTML(t.detalhe)} (${pct}%)</p>
      </div>
    `;
  }).join("");
}

// ============================================================================
// 7. SISTEMA DE AUTENTICAÇÃO E PAINEL ADMIN (KELDE STUDIO CMS v5.0)
// ============================================================================
function atualizarInterfaceUsuario() {
  const areaNav = document.getElementById("area-usuario-nav");
  const btnHero = document.getElementById("btn-hero-login");
  const usuario = KELDE_DB.obterUsuarioLogado();

  if (usuario && usuario.role === "admin") {
    areaNav.innerHTML = `
      <div class="user-logged-pill">
        <span>👑 <strong>Admin</strong></span>
        <button id="btn-abrir-cms-nav" class="btn-admin-cms" type="button">⚡ Studio CMS</button>
        <button id="btn-sair-conta" class="btn-logout-mini" type="button">(Sair)</button>
      </div>
    `;
    btnHero.textContent = "⚡ Abrir KELDE Studio (Artigos & LinkedIn)";
    btnHero.onclick = () => abrirModalAdmin("escrever");

    document.getElementById("btn-abrir-cms-nav").addEventListener("click", () => abrirModalAdmin("escrever"));
    document.getElementById("btn-sair-conta").addEventListener("click", () => {
      KELDE_DB.encerrarSessao();
      atualizarInterfaceUsuario();
      inicializarBlog();
    });
  } else if (usuario) {
    areaNav.innerHTML = `
      <div class="user-logged-pill">
        <span>🟢 Olá, <strong>${escaparHTML(usuario.nome.split(" ")[0])}</strong></span>
        <button id="btn-sair-conta" class="btn-logout-mini" type="button">(Sair)</button>
      </div>
    `;
    btnHero.textContent = `⭐ Ver Meus Favoritos (${(usuario.favoritos || []).length})`;
    btnHero.onclick = () => {
      categoriaAtiva = "⭐ Meus Favoritos";
      inicializarBlog();
      document.getElementById("blog").scrollIntoView({ behavior: "smooth" });
    };

    document.getElementById("btn-sair-conta").addEventListener("click", () => {
      KELDE_DB.encerrarSessao();
      if (categoriaAtiva === "⭐ Meus Favoritos") categoriaAtiva = "Todos";
      atualizarInterfaceUsuario();
      inicializarBlog();
    });
  } else {
    areaNav.innerHTML = `
      <button id="btn-abrir-auth-nav" class="btn-nav-auth" type="button">
        <span>👤</span> Entrar
      </button>
    `;
    btnHero.textContent = "🔐 Área do Leitor / Login";
    btnHero.onclick = () => abrirModalAuth("login");
    document.getElementById("btn-abrir-auth-nav").addEventListener("click", () => abrirModalAuth("login"));
  }
}

function abrirModalAuth(aba = "login") {
  const modal = document.getElementById("modal-auth");
  const tabLogin = document.getElementById("tab-login");
  const tabCad = document.getElementById("tab-cadastro");
  const formLogin = document.getElementById("form-login");
  const formCad = document.getElementById("form-cadastro");
  const feedback = document.getElementById("auth-feedback");

  feedback.textContent = "";

  if (aba === "cadastro") {
    tabCad.classList.add("active");
    tabLogin.classList.remove("active");
    formCad.style.display = "block";
    formLogin.style.display = "none";
  } else {
    tabLogin.classList.add("active");
    tabCad.classList.remove("active");
    formLogin.style.display = "block";
    formCad.style.display = "none";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function inicializarSistemaAuth() {
  atualizarInterfaceUsuario();

  const modal = document.getElementById("modal-auth");
  const btnFechar = document.getElementById("btn-fechar-auth");
  const tabLogin = document.getElementById("tab-login");
  const tabCad = document.getElementById("tab-cadastro");
  const formLogin = document.getElementById("form-login");
  const formCad = document.getElementById("form-cadastro");
  const feedback = document.getElementById("auth-feedback");

  function fecharAuth() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  btnFechar.addEventListener("click", fecharAuth);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharAuth();
  });

  tabLogin.addEventListener("click", () => abrirModalAuth("login"));
  tabCad.addEventListener("click", () => abrirModalAuth("cadastro"));

  formCad.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("cad-nome").value;
    const cargo = document.getElementById("cad-cargo").value;
    const email = document.getElementById("cad-email").value;
    const senha = document.getElementById("cad-senha").value;

    const res = KELDE_DB.registrarUsuario(nome, cargo, email, senha);
    if (!res.sucesso) {
      feedback.style.color = "var(--danger-color)";
      feedback.textContent = "⚠️ " + res.mensagem;
      return;
    }

    formCad.reset();
    fecharAuth();
    atualizarInterfaceUsuario();
    inicializarBlog();
  });

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    const res = KELDE_DB.autenticarUsuario(email, senha);
    if (!res.sucesso) {
      feedback.style.color = "var(--danger-color)";
      feedback.textContent = "⚠️ " + res.mensagem;
      return;
    }

    formLogin.reset();
    fecharAuth();
    atualizarInterfaceUsuario();
    inicializarBlog();

    if (res.usuario.role === "admin") {
      abrirModalAdmin("escrever");
    }
  });
}

// ============================================================================
// 8. GERADOR DE COPY MAGNÉTICA PARA LINKEDIN & PAINEL ADMIN
// ============================================================================
function gerarTextoLinkedIn(artigo, estilo) {
  if (!artigo) return "";
  const urlSite = DADOS_PERFIL.urlPublica || "https://limafernandesdealmeida-bot.github.io/KELDE.DEV/";
  const hashtags = artigo.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" ") + " #EngenhariaDeSoftware #Unicesumar #LearningInPublic";

  if (estilo === "aida") {
    return `🚨 A maioria das pessoas na tecnologia ignora este detalhe sobre ${artigo.categoria} — até que o sistema cresce e cobra o preço.

Hoje publiquei uma nova nota técnica no meu laboratório digital (KELDE.dev) intitulada:
👉 "${artigo.titulo}"

💡 O ponto central da discussão:
"${artigo.resumo}"

Como estudante de Engenharia de Software na Unicesumar, tenho documentado minha jornada pública unindo rigor acadêmico, arquitetura de sistemas e prática contínua.

🔗 Leia o artigo completo (com tempo de leitura de ${calcularTempoLeitura(artigo.conteudo)}) direto no meu portal:
${urlSite}

E para você: qual é o maior desafio quando o assunto é ${artigo.categoria}? Vamos debater nos comentários! 👇

${hashtags}`;
  }

  if (estilo === "executivo") {
    return `📌 Nova publicação técnica no KELDE.dev: "${artigo.titulo}"

Destaques da análise de hoje sobre ${artigo.categoria}:
• Visão sistêmica voltada à escalabilidade e boas práticas de Engenharia de Software;
• Síntese: ${artigo.resumo}
• Conexão entre fundamentos acadêmicos e aplicação no mercado real.

📖 Leitura completa disponível em:
${urlSite}

${hashtags}`;
  }

  // Estilo padrão: Storytelling Acadêmico
  return `Construir uma carreira sólida em Engenharia de Software exige muito mais do que decorar comandos: exige entender o "porquê" antes do "como". 🧠💻

Seguindo minha filosofia de Learning in Public (aprender em público) durante a graduação na Unicesumar, acabei de publicar um novo artigo no meu portfólio KELDE.dev:

✨ "${artigo.titulo}"

Nele, compartilho minha visão sobre ${artigo.categoria} e por que acredito que:
"${artigo.resumo}"

Fica o convite para ler o texto completo, testar a arquitetura do meu portal e até deixar seu comentário direto no banco de dados do site:
🔗 ${urlSite}

Toda crítica construtiva ou troca de experiência será muito bem-vinda! 🚀

${hashtags}`;
}

function atualizarGeradorLinkedIn(idSelecionado = null) {
  const selectArtigo = document.getElementById("select-artigo-linkedin");
  const selectEstilo = document.getElementById("estilo-copy-linkedin");
  const textareaCopy = document.getElementById("textarea-copy-linkedin");
  const todos = KELDE_DB.obterTodosArtigos();

  if (todos.length === 0) return;

  selectArtigo.innerHTML = todos
    .map((a) => `<option value="${Number(a.id)}">${escaparHTML(a.titulo)}</option>`)
    .join("");

  if (idSelecionado) {
    selectArtigo.value = String(idSelecionado);
  }

  function regerar() {
    const idAtual = Number(selectArtigo.value);
    const artigoEscolhido = todos.find((a) => Number(a.id) === idAtual) || todos[0];
    textareaCopy.value = gerarTextoLinkedIn(artigoEscolhido, selectEstilo.value);
  }

  selectArtigo.onchange = regerar;
  selectEstilo.onchange = regerar;
  regerar();
}

function alternarAbaAdmin(aba, idArtigoParaLinkedIn = null) {
  const tabEscrever = document.getElementById("tab-admin-escrever");
  const tabLinkedin = document.getElementById("tab-admin-linkedin");
  const tabGerenciar = document.getElementById("tab-admin-gerenciar");

  const formArtigo = document.getElementById("form-novo-artigo");
  const painelLinkedin = document.getElementById("painel-admin-linkedin");
  const painelGerenciar = document.getElementById("painel-admin-gerenciar");

  tabEscrever.classList.toggle("active", aba === "escrever");
  tabLinkedin.classList.toggle("active", aba === "linkedin");
  tabGerenciar.classList.toggle("active", aba === "gerenciar");

  formArtigo.style.display = aba === "escrever" ? "block" : "none";
  painelLinkedin.style.display = aba === "linkedin" ? "block" : "none";
  painelGerenciar.style.display = aba === "gerenciar" ? "block" : "none";

  if (aba === "linkedin") {
    atualizarGeradorLinkedIn(idArtigoParaLinkedIn);
  } else if (aba === "gerenciar") {
    renderizarDadosPainelAdmin();
  }
}

function abrirModalAdmin(abaInicial = "escrever") {
  const usuario = KELDE_DB.obterUsuarioLogado();
  if (!usuario || usuario.role !== "admin") return;

  renderizarDadosPainelAdmin();
  alternarAbaAdmin(abaInicial);
  const modal = document.getElementById("modal-admin");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function renderizarDadosPainelAdmin() {
  const artigos = KELDE_DB.obterTodosArtigos();
  const usuarios = KELDE_DB.lerTabela("kelde_db_usuarios", []);
  const baseCom = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
  const comentarios = KELDE_DB.lerTabela("kelde_db_comentarios", baseCom);

  document.getElementById("admin-stats-grid").innerHTML = `
    <div class="stat-box">
      <div class="stat-number">${artigos.length}</div>
      <div class="stat-label">Artigos Publicados</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${usuarios.length}</div>
      <div class="stat-label">Leitores Cadastrados</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${comentarios.length}</div>
      <div class="stat-label">Comentários no Banco</div>
    </div>
  `;

  const listaArtEl = document.getElementById("lista-admin-artigos");
  listaArtEl.innerHTML = artigos
    .map(
      (a) => `
    <div class="admin-list-item">
      <div>
        <strong>${escaparHTML(a.titulo)}</strong>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">
          <span class="mono-accent">${escaparHTML(a.categoria)}</span> • ${escaparHTML(a.data)}
        </div>
      </div>
      <button type="button" class="btn-delete-item" data-del-id="${Number(a.id)}">🗑️ Excluir</button>
    </div>
  `
    )
    .join("");

  listaArtEl.querySelectorAll(".btn-delete-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-del-id"));
      KELDE_DB.excluirArtigo(id);
      renderizarDadosPainelAdmin();
      inicializarBlog();
    });
  });

  const listaUsrEl = document.getElementById("lista-admin-usuarios");
  if (usuarios.length === 0) {
    listaUsrEl.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-secondary);">Nenhum leitor externo cadastrado ainda neste navegador.</p>`;
  } else {
    listaUsrEl.innerHTML = usuarios
      .map(
        (u) => `
      <div class="admin-list-item">
        <div>
          <strong>${escaparHTML(u.nome)}</strong> (${escaparHTML(u.email)})
          <div style="font-size: 0.76rem; color: var(--text-secondary);">
            Cargo: ${escaparHTML(u.cargo)} • Criado em: ${escaparHTML(u.criadoEm)}
          </div>
        </div>
        <span class="tag-chip" title="Hash Criptográfico Salvo no Banco">🔒 ${escaparHTML(u.senhaHash)}</span>
      </div>
    `
      )
      .join("");
  }
}

function exportarArquivoDadosJS() {
  const artigosAtuais = KELDE_DB.obterTodosArtigos();
  const baseCom = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
  const comentariosAtuais = KELDE_DB.lerTabela("kelde_db_comentarios", baseCom);
  const telemetriaAtual = typeof DADOS_TELEMETRIA !== "undefined" ? DADOS_TELEMETRIA : [];

  const conteudoArquivo = `// ============================================================================
// ARQUIVO DE DADOS GERADO PELO KELDE STUDIO CMS (v5.0 ULTIMATE)
// ============================================================================

const DADOS_PERFIL = ${JSON.stringify(DADOS_PERFIL, null, 2)};

const DADOS_TELEMETRIA = ${JSON.stringify(telemetriaAtual, null, 2)};

const DADOS_ROADMAP = ${JSON.stringify(DADOS_ROADMAP, null, 2)};

const DADOS_PROJETOS = ${JSON.stringify(DADOS_PROJETOS, null, 2)};

const DADOS_ARTIGOS = ${JSON.stringify(artigosAtuais, null, 2)};

const COMENTARIOS_INICIAIS = ${JSON.stringify(comentariosAtuais, null, 2)};
`;

  const blob = new Blob([conteudoArquivo], { type: "application/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dados.js";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function inicializarPainelAdmin() {
  const modal = document.getElementById("modal-admin");
  const btnFechar = document.getElementById("btn-fechar-admin");
  const tabEscrever = document.getElementById("tab-admin-escrever");
  const tabLinkedin = document.getElementById("tab-admin-linkedin");
  const tabGerenciar = document.getElementById("tab-admin-gerenciar");
  const formArtigo = document.getElementById("form-novo-artigo");
  const feedback = document.getElementById("admin-feedback");
  const btnExportar = document.getElementById("btn-exportar-dados");
  const btnCopiarLinkedin = document.getElementById("btn-copiar-linkedin");

  btnFechar.addEventListener("click", () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });

  tabEscrever.addEventListener("click", () => {
    feedback.textContent = "";
    alternarAbaAdmin("escrever");
  });
  tabLinkedin.addEventListener("click", () => {
    feedback.textContent = "";
    alternarAbaAdmin("linkedin");
  });
  tabGerenciar.addEventListener("click", () => {
    feedback.textContent = "";
    alternarAbaAdmin("gerenciar");
  });

  formArtigo.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("art-titulo").value;
    const categoria = document.getElementById("art-categoria").value;
    const tags = document.getElementById("art-tags").value;
    const resumo = document.getElementById("art-resumo").value;
    const conteudo = document.getElementById("art-conteudo").value;

    const novo = KELDE_DB.publicarNovoArtigo(titulo, categoria, tags, resumo, conteudo);
    if (novo) {
      formArtigo.reset();
      categoriaAtiva = "Todos";
      inicializarBlog();
      renderizarDadosPainelAdmin();
      feedback.style.color = "var(--success-color)";
      feedback.textContent = "✅ Artigo publicado! Aqui está a copy pronta para você postar no LinkedIn:";
      alternarAbaAdmin("linkedin", novo.id);
    }
  });

  btnCopiarLinkedin.addEventListener("click", () => {
    const txt = document.getElementById("textarea-copy-linkedin");
    txt.select();
    navigator.clipboard.writeText(txt.value).catch(() => {});
    feedback.style.color = "var(--success-color)";
    feedback.textContent = "📋 Post copiado com sucesso! Agora é só colar (Ctrl+V) no seu LinkedIn.";
  });

  btnExportar.addEventListener("click", () => {
    exportarArquivoDadosJS();
    feedback.style.color = "var(--accent-primary)";
    feedback.textContent = "📦 Arquivo dados.js atualizado foi baixado! Basta substituí-lo na sua pasta e no GitHub.";
  });
}

// ============================================================================
// 9. COMMAND PALETTE (CTRL + K / ESTILO VALE DO SILÍCIO)
// ============================================================================
function inicializarCommandPalette() {
  const modalCmd = document.getElementById("modal-cmd");
  const inputCmd = document.getElementById("input-cmd");
  const listaCmd = document.getElementById("lista-cmd");
  const btnAbrirCmd = document.getElementById("btn-cmd-k");
  const btnFecharCmd = document.getElementById("btn-fechar-cmd");

  let indiceSelecionado = 0;
  let comandosFiltrados = [];

  function obterListaComandos() {
    const base = [
      {
        titulo: "📚 Ir para Blog & Artigos",
        detalhe: "Navegação",
        acao: () => document.getElementById("blog").scrollIntoView({ behavior: "smooth" })
      },
      {
        titulo: "📊 Ver Telemetria Acadêmica & Evolução",
        detalhe: "Métricas Unicesumar",
        acao: () => document.getElementById("roadmap").scrollIntoView({ behavior: "smooth" })
      },
      {
        titulo: "🧪 Ir para Vitrine de Projetos & Lab",
        detalhe: "Estudos de Caso",
        acao: () => document.getElementById("projetos").scrollIntoView({ behavior: "smooth" })
      },
      {
        titulo: "📄 Gerar Currículo Executivo em PDF (A4)",
        detalhe: "Impressão Instantânea",
        acao: () => window.print()
      },
      {
        titulo: "🌗 Alternar Tema Claro / Escuro",
        detalhe: "UI/UX",
        acao: () => document.getElementById("btn-tema").click()
      },
      {
        titulo: "👑 Abrir Painel Admin / Login (KELDE Studio)",
        detalhe: "CMS & LinkedIn",
        acao: () => {
          const usr = KELDE_DB.obterUsuarioLogado();
          if (usr && usr.role === "admin") abrirModalAdmin("escrever");
          else abrirModalAuth("login");
        }
      }
    ];

    const artigos = KELDE_DB.obterTodosArtigos().map((a) => ({
      titulo: `📖 Ler Artigo: ${a.titulo}`,
      detalhe: a.categoria,
      acao: () => abrirArtigoNoModal(a.id)
    }));

    return [...base, ...artigos];
  }

  function renderizarComandos() {
    const termo = inputCmd.value.trim().toLowerCase();
    const todos = obterListaComandos();
    comandosFiltrados = todos.filter(
      (c) => c.titulo.toLowerCase().includes(termo) || c.detalhe.toLowerCase().includes(termo)
    );

    if (indiceSelecionado >= comandosFiltrados.length) {
      indiceSelecionado = 0;
    }

    if (comandosFiltrados.length === 0) {
      listaCmd.innerHTML = `<div style="padding: 1rem; color: var(--text-secondary);">Nenhum comando encontrado.</div>`;
      return;
    }

    listaCmd.innerHTML = comandosFiltrados
      .map(
        (cmd, idx) => `
      <div class="cmd-item ${idx === indiceSelecionado ? "selected" : ""}" data-cmd-idx="${idx}" role="option">
        <span>${escaparHTML(cmd.titulo)}</span>
        <span class="kbd-badge">${escaparHTML(cmd.detalhe)}</span>
      </div>
    `
      )
      .join("");

    listaCmd.querySelectorAll(".cmd-item").forEach((el) => {
      el.addEventListener("click", () => {
        const i = Number(el.getAttribute("data-cmd-idx"));
        executarComando(i);
      });
    });
  }

  function executarComando(idx) {
    const item = comandosFiltrados[idx];
    if (!item) return;
    fecharCmd();
    item.acao();
  }

  function abrirCmd() {
    inputCmd.value = "";
    indiceSelecionado = 0;
    renderizarComandos();
    modalCmd.classList.add("open");
    modalCmd.setAttribute("aria-hidden", "false");
    setTimeout(() => inputCmd.focus(), 50);
  }

  function fecharCmd() {
    modalCmd.classList.remove("open");
    modalCmd.setAttribute("aria-hidden", "true");
  }

  btnAbrirCmd.addEventListener("click", abrirCmd);
  btnFecharCmd.addEventListener("click", fecharCmd);
  modalCmd.addEventListener("click", (e) => {
    if (e.target === modalCmd) fecharCmd();
  });

  inputCmd.addEventListener("input", () => {
    indiceSelecionado = 0;
    renderizarComandos();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (modalCmd.classList.contains("open")) fecharCmd();
      else abrirCmd();
      return;
    }

    if (!modalCmd.classList.contains("open")) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (comandosFiltrados.length > 0) {
        indiceSelecionado = (indiceSelecionado + 1) % comandosFiltrados.length;
        renderizarComandos();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (comandosFiltrados.length > 0) {
        indiceSelecionado = (indiceSelecionado - 1 + comandosFiltrados.length) % comandosFiltrados.length;
        renderizarComandos();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      executarComando(indiceSelecionado);
    }
  });
}

// ============================================================================
// 10. CURRÍCULO EXECUTIVO EM PDF (1-CLICK PRINT ENGINE)
// ============================================================================
function inicializarCurriculoPDF() {
  const btnPdf = document.getElementById("btn-cv-pdf");
  if (!btnPdf) return;
  btnPdf.addEventListener("click", () => {
    window.print();
  });
}

// ============================================================================
// 11. MOTOR DO BLOG, ROADMAP, PROJETOS E MODAL DE LEITURA
// ============================================================================
let categoriaAtiva = "Todos";
let termoBusca = "";

function calcularTempoLeitura(htmlTexto) {
  const textoLimpo = htmlTexto.replace(/<[^>]*>/g, " ");
  const totalPalavras = textoLimpo.trim().split(/\s+/).length;
  const minutos = Math.max(1, Math.ceil(totalPalavras / 200));
  return `${minutos} min de leitura`;
}

function inicializarBlog() {
  const todosArtigos = KELDE_DB.obterTodosArtigos();
  const categorias = [
    "Todos",
    "⭐ Meus Favoritos",
    ...new Set(todosArtigos.map((a) => a.categoria))
  ];
  const containerFiltros = document.getElementById("filtros-categoria");

  function renderizarBotoesCategoria() {
    containerFiltros.innerHTML = categorias
      .map(
        (cat) => `
        <button class="pill-btn ${cat === categoriaAtiva ? "active" : ""}" data-cat="${escaparHTML(cat)}">
          ${escaparHTML(cat)}
        </button>
      `
      )
      .join("");

    containerFiltros.querySelectorAll(".pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        categoriaAtiva = btn.getAttribute("data-cat");
        renderizarBotoesCategoria();
        renderizarArtigos();
      });
    });
  }

  const inputBusca = document.getElementById("input-busca");
  inputBusca.oninput = (e) => {
    termoBusca = e.target.value.slice(0, 80).toLowerCase();
    renderizarArtigos();
  };

  renderizarBotoesCategoria();
  renderizarArtigos();
}

function renderizarArtigos() {
  const grid = document.getElementById("grid-artigos");
  const todosArtigos = KELDE_DB.obterTodosArtigos();
  const usuario = KELDE_DB.obterUsuarioLogado();
  const listaFavs = usuario ? usuario.favoritos || [] : [];

  if (categoriaAtiva === "⭐ Meus Favoritos" && !usuario) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; background: var(--bg-card); padding: 2rem; border-radius: 14px; border: 1px solid var(--border-color); text-align: center;">
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">🔐 Faça login ou crie sua conta gratuita para salvar seus artigos favoritos!</p>
        <button id="btn-login-favs" class="btn btn-primary btn-sm">Entrar / Criar Conta Agora</button>
      </div>
    `;
    document.getElementById("btn-login-favs").addEventListener("click", () => abrirModalAuth("cadastro"));
    return;
  }

  const artigosFiltrados = todosArtigos.filter((artigo) => {
    const bateCategoria =
      categoriaAtiva === "Todos"
        ? true
        : categoriaAtiva === "⭐ Meus Favoritos"
        ? listaFavs.includes(artigo.id)
        : artigo.categoria === categoriaAtiva;

    const bateBusca =
      artigo.titulo.toLowerCase().includes(termoBusca) ||
      artigo.resumo.toLowerCase().includes(termoBusca) ||
      artigo.tags.some((t) => t.toLowerCase().includes(termoBusca));

    return bateCategoria && bateBusca;
  });

  if (artigosFiltrados.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-secondary);">Nenhum artigo encontrado nesta visualização.</p>`;
    return;
  }

  grid.innerHTML = artigosFiltrados
    .map((artigo) => {
      const tempo = calcularTempoLeitura(artigo.conteudo);
      const ehFav = listaFavs.includes(artigo.id);
      return `
      <article class="article-card" data-id="${Number(artigo.id)}">
        <div>
          <div class="card-meta-top">
            <span class="badge-cat">${escaparHTML(artigo.categoria)}</span>
            <button class="btn-fav-star ${ehFav ? "favorited" : ""}" data-fav-id="${Number(artigo.id)}" title="Salvar nos meus favoritos">
              ${ehFav ? "★ Salvo" : "☆ Favoritar"}
            </button>
          </div>
          <div class="card-clickable-area" data-open-id="${Number(artigo.id)}">
            <h3 class="card-title">${escaparHTML(artigo.titulo)}</h3>
            <p class="card-excerpt">${escaparHTML(artigo.resumo)}</p>
          </div>
        </div>
        <div>
          <div class="card-tags">
            ${artigo.tags.map((t) => `<span class="tag-chip">#${escaparHTML(t)}</span>`).join("")}
          </div>
          <div class="card-footer" data-open-id="${Number(artigo.id)}">
            <span>📅 ${escaparHTML(artigo.data)} • ⏱ ${tempo}</span>
            <span class="read-more-link">Ler →</span>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  grid.querySelectorAll("[data-open-id]").forEach((el) => {
    el.addEventListener("click", () => abrirArtigoNoModal(Number(el.getAttribute("data-open-id"))));
  });

  grid.querySelectorAll(".btn-fav-star").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute("data-fav-id"));
      if (!KELDE_DB.obterUsuarioLogado()) {
        abrirModalAuth("login");
        return;
      }
      KELDE_DB.alternarFavorito(id);
      atualizarInterfaceUsuario();
      renderizarArtigos();
    });
  });
}

function inicializarRoadmap() {
  const grid = document.getElementById("grid-roadmap");
  grid.innerHTML = DADOS_ROADMAP.map(
    (item) => `
    <div class="roadmap-card">
      <span class="roadmap-phase">${escaparHTML(item.fase)}</span>
      <h3 class="roadmap-title">${escaparHTML(item.titulo)}</h3>
      <p style="color: var(--text-secondary); font-size: 0.92rem;">${escaparHTML(item.descricao)}</p>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${Math.min(100, Math.max(0, Number(item.progresso)))}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.75rem;">
        <span class="mono-accent">${escaparHTML(item.status)}</span>
        <strong>${Number(item.progresso)}%</strong>
      </div>
      <div class="card-tags">
        ${item.tags.map((t) => `<span class="tag-chip">${escaparHTML(t)}</span>`).join("")}
      </div>
    </div>
  `
  ).join("");
}

function inicializarProjetos() {
  const grid = document.getElementById("grid-projetos");
  grid.innerHTML = DADOS_PROJETOS.map(
    (proj) => `
    <div class="project-card">
      <div>
        <div class="card-meta-top">
          <span class="badge-cat">${escaparHTML(proj.tipo)}</span>
          <span class="mono-accent" style="font-size:0.75rem;">${escaparHTML(proj.metricas)}</span>
        </div>
        <h3 class="card-title">${escaparHTML(proj.titulo)}</h3>
        <p style="color: var(--text-secondary); font-size: 0.93rem;">${escaparHTML(proj.resumo)}</p>
        <div class="project-learning">
          <strong>💡 Engenharia Aplicada:</strong> ${escaparHTML(proj.aprendizados)}
        </div>
      </div>
      <div class="card-tags">
        ${proj.tags.map((t) => `<span class="tag-chip">${escaparHTML(t)}</span>`).join("")}
      </div>
    </div>
  `
  ).join("");
}

function renderizarComentariosModal(idArtigo) {
  const listaEl = document.getElementById("lista-comentarios-modal");
  const areaForm = document.getElementById("area-form-comentario");
  const comentarios = KELDE_DB.obterComentarios(idArtigo);
  const usuario = KELDE_DB.obterUsuarioLogado();

  if (comentarios.length === 0) {
    listaEl.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.9rem;">Seja o primeiro a comentar neste artigo!</p>`;
  } else {
    listaEl.innerHTML = comentarios
      .map(
        (c) => `
      <div class="comment-item">
        <div class="comment-header">
          <strong>${escaparHTML(c.autor)} <span class="mono-accent" style="font-weight:400;">• ${escaparHTML(c.cargo)}</span></strong>
          <span style="color: var(--text-muted);">${escaparHTML(c.data)}</span>
        </div>
        <p style="font-size: 0.94rem;">${escaparHTML(c.texto)}</p>
      </div>
    `
      )
      .join("");
  }

  if (usuario) {
    areaForm.innerHTML = `
      <form id="form-novo-comentario">
        <textarea id="texto-novo-comentario" class="comment-textarea" required maxlength="400" placeholder="Escreva seu comentário como ${escaparHTML(usuario.nome)}..."></textarea>
        <button type="submit" class="btn btn-primary btn-sm">Publicar Comentário →</button>
      </form>
    `;
    document.getElementById("form-novo-comentario").addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = document.getElementById("texto-novo-comentario").value;
      if (txt.trim()) {
        KELDE_DB.adicionarComentario(idArtigo, txt);
        renderizarComentariosModal(idArtigo);
      }
    });
  } else {
    areaForm.innerHTML = `
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.9rem; color: var(--text-secondary);">🔐 Faça login para deixar um comentário neste artigo.</span>
        <button id="btn-login-comentar" type="button" class="btn btn-secondary btn-sm">Entrar / Criar Conta</button>
      </div>
    `;
    document.getElementById("btn-login-comentar").addEventListener("click", () => abrirModalAuth("login"));
  }
}

function abrirArtigoNoModal(idArtigo) {
  const artigo = KELDE_DB.obterTodosArtigos().find((a) => Number(a.id) === Number(idArtigo));
  if (!artigo) return;

  document.getElementById("modal-categoria").textContent = artigo.categoria;
  document.getElementById("modal-data").textContent = artigo.data;
  document.getElementById("modal-tempo").textContent = "⏱ " + calcularTempoLeitura(artigo.conteudo);
  document.getElementById("modal-titulo").textContent = artigo.titulo;
  document.getElementById("modal-tags").innerHTML = artigo.tags
    .map((t) => `<span class="tag-chip">#${escaparHTML(t)}</span>`)
    .join("");
  document.getElementById("modal-conteudo").innerHTML = artigo.conteudo;

  renderizarComentariosModal(idArtigo);

  const modal = document.getElementById("modal-leitura");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function inicializarModal() {
  const modal = document.getElementById("modal-leitura");
  const btnFechar = document.getElementById("btn-fechar-modal");
  const scrollArea = document.getElementById("modal-scroll-area");
  const barraModal = document.getElementById("barra-progresso-modal");

  function fecharModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "auto";
  }

  btnFechar.addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      fecharModal();
      document.getElementById("modal-auth").classList.remove("open");
      document.getElementById("modal-admin").classList.remove("open");
      document.getElementById("modal-cmd").classList.remove("open");
    }
  });

  scrollArea.addEventListener("scroll", () => {
    const scrollTop = scrollArea.scrollTop;
    const alturaTotal = scrollArea.scrollHeight - scrollArea.clientHeight;
    const porcentagem = alturaTotal > 0 ? (scrollTop / alturaTotal) * 100 : 100;
    barraModal.style.width = `${porcentagem}%`;
  });
}

function inicializarTemaSeguro() {
  const html = document.documentElement;
  const btnTema = document.getElementById("btn-tema");
  const icone = document.getElementById("icone-tema");

  let temaSalvo = "dark";
  try {
    temaSalvo = localStorage.getItem("kelde_tema") || "dark";
  } catch (e) {}

  html.setAttribute("data-theme", temaSalvo);
  icone.textContent = temaSalvo === "dark" ? "☀️" : "🌙";

  btnTema.addEventListener("click", () => {
    const atual = html.getAttribute("data-theme");
    const novo = atual === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", novo);
    icone.textContent = novo === "dark" ? "☀️" : "🌙";
    try {
      localStorage.setItem("kelde_tema", novo);
    } catch (e) {}
  });
}

function inicializarBarraProgressoGlobal() {
  const barra = document.getElementById("barra-progresso-topo");
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (scrollTop / alturaTotal) * 100 : 0;
    barra.style.width = `${progresso}%`;
  });
}
