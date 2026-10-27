// ============================================================================
// CAMADA DE LÓGICA, PÁGINAS CRUD E MENÇÕES DISCORD (v6.0) - KELDE.DEV
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarPerfilSeguro();
  inicializarFotoPerfil();
  inicializarTemaSeguro();
  inicializarSistemaAuth();
  inicializarPainelAdmin();
  inicializarCanaisEPaginas();
  inicializarTelemetria();
  inicializarBlog();
  inicializarRoadmap();
  inicializarProjetos();
  inicializarModal();
  inicializarCommandPalette();
  inicializarCurriculoPDF();
  inicializarEscutaGlobalMencoes();
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

function normalizarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-_]/g, "")
    .trim();
}

// ============================================================================
// MOTOR DE BANCO DE DADOS NOSQL + PÁGINAS CRUD + RBAC ADMIN (KELDE_DB)
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
  obterTodasPaginas() {
    const base = typeof DADOS_PAGINAS !== "undefined" ? DADOS_PAGINAS : [];
    const salvas = this.lerTabela("kelde_db_paginas_admin", null);
    return salvas ? salvas : base;
  },
  salvarOuEditarPagina(idEdicao, titulo, slug, icone, resumo, conteudoBruto) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao || sessao.role !== "admin") return null;

    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    const dataFormatada = `${String(hoje.getDate()).padStart(2, "0")} ${meses[hoje.getMonth()]} ${hoje.getFullYear()}`;
    const slugLimpo = normalizarSlug(slug) || "pagina";

    const paginas = [...this.obterTodasPaginas()];

    if (idEdicao) {
      const idx = paginas.findIndex((p) => Number(p.id) === Number(idEdicao));
      if (idx !== -1) {
        paginas[idx] = {
          ...paginas[idx],
          titulo: titulo.trim(),
          slug: slugLimpo,
          icone: icone.trim() || "📄",
          atualizadoEm: dataFormatada,
          resumo: resumo.trim(),
          conteudoBruto: conteudoBruto
        };
        this.salvarTabela("kelde_db_paginas_admin", paginas);
        return paginas[idx];
      }
    }

    const novaPagina = {
      id: Date.now(),
      slug: slugLimpo,
      icone: icone.trim() || "📄",
      titulo: titulo.trim(),
      atualizadoEm: dataFormatada,
      resumo: resumo.trim(),
      conteudoBruto: conteudoBruto
    };

    paginas.push(novaPagina);
    this.salvarTabela("kelde_db_paginas_admin", paginas);
    return novaPagina;
  },
  excluirPagina(idPagina) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao || sessao.role !== "admin") return false;

    const filtradas = this.obterTodasPaginas().filter((p) => Number(p.id) !== Number(idPagina));
    this.salvarTabela("kelde_db_paginas_admin", filtradas);
    return true;
  },
  obterTodosArtigos() {
    const artigosCustom = this.lerTabela("kelde_db_artigos_admin", null);
    if (!artigosCustom) {
      return DADOS_ARTIGOS;
    }
    return artigosCustom;
  },
  publicarNovoArtigo(titulo, slug, categoria, tagsTexto, resumo, conteudoBruto) {
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
      slug: normalizarSlug(slug) || normalizarSlug(titulo).slice(0, 18),
      titulo: titulo.trim(),
      data: dataFormatada,
      categoria: categoria,
      destaque: true,
      resumo: resumo.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ["Engenharia"],
      conteudo: converterTextoRicoParaHTML(conteudoBruto)
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
  obterComentarios(chaveAlvo) {
    const base = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
    const salvos = this.lerTabela("kelde_db_comentarios", base);
    return salvos.filter(
      (c) => String(c.idArtigo) === String(chaveAlvo) || `artigo_${c.idArtigo}` === String(chaveAlvo)
    );
  },
  adicionarComentario(chaveAlvo, texto) {
    const sessao = this.obterUsuarioLogado();
    if (!sessao) return false;

    const base = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
    const todos = this.lerTabela("kelde_db_comentarios", base);
    todos.push({
      idArtigo: String(chaveAlvo),
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
// MOTOR DE MENÇÕES DISCORD (#canal) & SUPER-ATALHOS DE CURSOS (2-A e 3-B)
// ============================================================================
function obterMapaDeMencoes() {
  const mapa = {
    blog: { rotulo: "📰 Blog & Artigos", tipo: "secao", alvo: "blog" },
    roadmap: { rotulo: "📊 Evolução & Telemetria", tipo: "secao", alvo: "roadmap" },
    projetos: { rotulo: "🧪 Vitrine & Lab", tipo: "secao", alvo: "projetos" },
    sobre: { rotulo: "👤 Sobre & Contato", tipo: "secao", alvo: "sobre" }
  };

  KELDE_DB.obterTodasPaginas().forEach((p) => {
    const s = normalizarSlug(p.slug);
    if (s) {
      mapa[s] = { rotulo: `${p.icone || "📄"} ${p.titulo}`, tipo: "pagina", id: p.id, slug: s };
    }
  });

  KELDE_DB.obterTodosArtigos().forEach((a, idx) => {
    const s = normalizarSlug(a.slug) || `artigo${idx + 1}`;
    mapa[s] = { rotulo: `📖 ${a.categoria}: ${a.titulo.slice(0, 26)}...`, tipo: "artigo", id: a.id, slug: s };
  });

  return mapa;
}

function aplicarMencoesDiscord(htmlTexto) {
  if (typeof htmlTexto !== "string") return "";
  const mapa = obterMapaDeMencoes();

  return htmlTexto.replace(/(^|\s|>|\()\#([a-zA-Z0-9_-]+)/g, (match, prefixo, slugDigitado) => {
    const chave = normalizarSlug(slugDigitado);
    const destino = mapa[chave];
    if (!destino) return match;

    return `${prefixo}<button type="button" class="discord-mention" data-mention-slug="${escaparHTML(chave)}" title="Ir para #${escaparHTML(chave)}"># ${escaparHTML(destino.rotulo)}</button>`;
  });
}

function converterLinhaCursoEmCard(linhaLimpa) {
  if (linhaLimpa.startsWith("[FEITO]")) {
    const partes = linhaLimpa.replace("[FEITO]", "").split("|").map((p) => p.trim());
    const curso = partes[0] || "Curso Concluído";
    const inst = partes[1] || "Instituição";
    const link = partes[2] ? validarURLSegura(partes[2]) : "#";
    const botaoCert =
      link !== "#"
        ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">📜 Ver Certificado ↗</a>`
        : `<span class="tag-chip">📜 Certificado em arquivo</span>`;

    return `
      <div class="course-card course-done">
        <div>
          <span class="course-badge badge-done">✅ CONCLUÍDO & CERTIFICADO</span>
          <div class="course-title">${escaparHTML(curso)}</div>
          <div class="course-inst">🏛️ ${escaparHTML(inst)}</div>
        </div>
        <div>${botaoCert}</div>
      </div>
    `;
  }

  if (linhaLimpa.startsWith("[FAZENDO]")) {
    const partes = linhaLimpa.replace("[FAZENDO]", "").split("|").map((p) => p.trim());
    const curso = partes[0] || "Curso em Andamento";
    const inst = partes[1] || "Instituição";

    return `
      <div class="course-card course-doing">
        <div>
          <span class="course-badge badge-doing">⏳ EM ANDAMENTO</span>
          <div class="course-title">${escaparHTML(curso)}</div>
          <div class="course-inst">🏛️ ${escaparHTML(inst)}</div>
        </div>
        <span class="mono-accent" style="font-size: 0.78rem;">⚡ Estudando agora</span>
      </div>
    `;
  }

  if (linhaLimpa.startsWith("[FUTURO]")) {
    const partes = linhaLimpa.replace("[FUTURO]", "").split("|").map((p) => p.trim());
    const curso = partes[0] || "Curso Planejado";
    const area = partes[1] || "Próximo Passo";

    return `
      <div class="course-card course-future">
        <div>
          <span class="course-badge badge-future">🎯 PLANEJADO (QUERO FAZER)</span>
          <div class="course-title">${escaparHTML(curso)}</div>
          <div class="course-inst">🧭 Foco: ${escaparHTML(area)}</div>
        </div>
        <span class="tag-chip" style="border: 1px solid var(--discord-border); color: var(--discord-text);">💬 Recomende onde fazer nos comentários!</span>
      </div>
    `;
  }

  return null;
}

function converterTextoRicoParaHTML(textoBruto) {
  const linhas = String(textoBruto || "").split(/\r?\n/);
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

    const cardCurso = converterLinhaCursoEmCard(limpa);
    if (cardCurso) {
      if (emLista) {
        htmlFinal += "</ul>";
        emLista = false;
      }
      htmlFinal += cardCurso;
      continue;
    }

    if (limpa.startsWith("### ")) {
      if (emLista) {
        htmlFinal += "</ul>";
        emLista = false;
      }
      htmlFinal += `<h3>${aplicarMencoesDiscord(escaparHTML(limpa.replace("### ", "")))}</h3>`;
    } else if (limpa.startsWith("- ")) {
      if (!emLista) {
        htmlFinal += "<ul>";
        emLista = true;
      }
      htmlFinal += `<li>${aplicarMencoesDiscord(escaparHTML(limpa.replace("- ", "")))}</li>`;
    } else {
      if (emLista) {
        htmlFinal += "</ul>";
        emLista = false;
      }
      htmlFinal += `<p>${aplicarMencoesDiscord(escaparHTML(limpa))}</p>`;
    }
  }
  if (emLista) htmlFinal += "</ul>";
  return htmlFinal;
}

function inicializarEscutaGlobalMencoes() {
  document.addEventListener("click", (e) => {
    const btnMencao = e.target.closest("[data-mention-slug]");
    if (!btnMencao) return;

    e.preventDefault();
    e.stopPropagation();
    const slug = btnMencao.getAttribute("data-mention-slug");
    navegarParaMencaoDiscord(slug);
  });
}

function navegarParaMencaoDiscord(slug) {
  const mapa = obterMapaDeMencoes();
  const destino = mapa[normalizarSlug(slug)];
  if (!destino) return;

  if (destino.tipo === "pagina") {
    abrirPaginaNoModal(destino.id);
  } else if (destino.tipo === "artigo") {
    abrirArtigoNoModal(destino.id);
  } else if (destino.tipo === "secao") {
    document.getElementById("modal-leitura").classList.remove("open");
    document.body.style.overflow = "auto";
    const el = document.getElementById(destino.alvo);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
}

// ============================================================================
// 5. CANAIS DISCORD & PÁGINAS INTERATIVAS (1-C)
// ============================================================================
function inicializarCanaisEPaginas() {
  const barraCanais = document.getElementById("barra-canais-discord");
  const gridPaginas = document.getElementById("grid-paginas");
  const paginas = KELDE_DB.obterTodasPaginas();
  const artigos = KELDE_DB.obterTodosArtigos();

  // 1. Renderiza a Barra de Canais estilo Discord no Hero
  const botoesPaginas = paginas.map(
    (p) => `
      <button type="button" class="discord-channel-pill" data-mention-slug="${escaparHTML(p.slug)}">
        <span>#</span> <span>${escaparHTML(p.icone)} ${escaparHTML(p.slug)}</span>
      </button>
    `
  );

  const botoesArtigos = artigos.map(
    (a, i) => `
      <button type="button" class="discord-channel-pill" data-mention-slug="${escaparHTML(a.slug || `artigo${i + 1}`)}">
        <span>#</span> <span>📖 ${escaparHTML(a.slug || `artigo${i + 1}`)}</span>
      </button>
    `
  );

  barraCanais.innerHTML = [
    ...botoesPaginas,
    ...botoesArtigos,
    `<button type="button" class="discord-channel-pill" data-mention-slug="projetos"><span>#</span> <span>🧪 vitrine-lab</span></button>`,
    `<button type="button" class="discord-channel-pill" data-mention-slug="roadmap"><span>#</span> <span>📊 evolucao</span></button>`
  ].join("");

  // 2. Renderiza os Cards das Páginas Especiais (#cursos, etc.)
  if (paginas.length === 0) {
    gridPaginas.innerHTML = `<p style="color: var(--text-secondary);">Nenhuma página criada ainda. Acesse o KELDE Studio CMS para criar!</p>`;
    return;
  }

  gridPaginas.innerHTML = paginas
    .map((p) => {
      const qtdComentarios = KELDE_DB.obterComentarios(`pagina_${p.id}`).length;
      return `
        <article class="page-card" data-open-page-id="${Number(p.id)}">
          <div>
            <div class="card-meta-top">
              <span class="discord-mention-static">#${escaparHTML(p.slug)}</span>
              <span class="mono-accent">💬 ${qtdComentarios} comentário(s)</span>
            </div>
            <h3 class="card-title"><span class="page-card-icon">${escaparHTML(p.icone)}</span> ${escaparHTML(p.titulo)}</h3>
            <p class="card-excerpt">${escaparHTML(p.resumo)}</p>
          </div>
          <div class="card-footer">
            <span>📅 Atualizado: ${escaparHTML(p.atualizadoEm)}</span>
            <span class="read-more-link">Abrir Página & Comentar →</span>
          </div>
        </article>
      `;
    })
    .join("");

  gridPaginas.querySelectorAll("[data-open-page-id]").forEach((card) => {
    card.addEventListener("click", () => {
      abrirPaginaNoModal(Number(card.getAttribute("data-open-page-id")));
    });
  });
}

function abrirPaginaNoModal(idPagina) {
  const pagina = KELDE_DB.obterTodasPaginas().find((p) => Number(p.id) === Number(idPagina));
  if (!pagina) return;

  const usuario = KELDE_DB.obterUsuarioLogado();
  const btnEditarModal = document.getElementById("btn-editar-direto-modal");

  document.getElementById("modal-categoria").textContent = `${pagina.icone} Página Interativa`;
  document.getElementById("modal-slug-badge").textContent = `#${pagina.slug}`;
  document.getElementById("modal-data").textContent = `Atualizado em ${pagina.atualizadoEm}`;
  document.getElementById("modal-tempo").textContent = "💬 Aberto a recomendações";
  document.getElementById("modal-titulo").textContent = `${pagina.icone} ${pagina.titulo}`;
  document.getElementById("modal-tags").innerHTML = `
    <span class="tag-chip">Mencione em qualquer lugar usando #${escaparHTML(pagina.slug)}</span>
  `;

  document.getElementById("modal-conteudo").innerHTML = converterTextoRicoParaHTML(pagina.conteudoBruto);
  document.getElementById("titulo-secao-comentarios").textContent = `💬 Recomendações & Comentários em #${pagina.slug}`;

  if (usuario && usuario.role === "admin") {
    btnEditarModal.style.display = "inline-flex";
    btnEditarModal.onclick = () => {
      document.getElementById("modal-leitura").classList.remove("open");
      document.body.style.overflow = "auto";
      carregarPaginaNoFormularioAdmin(pagina.id);
    };
  } else {
    btnEditarModal.style.display = "none";
  }

  renderizarComentariosModal(`pagina_${pagina.id}`);

  const modal = document.getElementById("modal-leitura");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

// ============================================================================
// 6. FOTO DE PERFIL E DADOS PESSOAIS
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

  document.getElementById("print-nome").textContent = `${DADOS_PERFIL.nomeCompleto} (${DADOS_PERFIL.marca}${DADOS_PERFIL.sufixoMarca})`;
  document.getElementById("print-instituicao").textContent = DADOS_PERFIL.instituicao;
  document.getElementById("print-headline").textContent = DADOS_PERFIL.headline;
  document.getElementById("print-contatos").textContent = `Portfólio: ${DADOS_PERFIL.urlPublica || "keldedev.vercel.app"} | GitHub: ${DADOS_PERFIL.contatos.github} | Tel: ${DADOS_PERFIL.contatos.telefoneExibicao}`;

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
// 7. TELEMETRIA ACADÊMICA GAMIFICADA
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
// 8. SISTEMA DE AUTENTICAÇÃO E PAINEL ADMIN (KELDE STUDIO CMS v6.0)
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
    btnHero.textContent = "⚡ Abrir KELDE Studio (Gerenciar #cursos & Blog)";
    btnHero.onclick = () => abrirModalAdmin("paginas");

    document.getElementById("btn-abrir-cms-nav").addEventListener("click", () => abrirModalAdmin("paginas"));
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
      abrirModalAdmin("paginas");
    }
  });
}

// ============================================================================
// 9. PAINEL ADMIN v6.0 (PÁGINAS CRUD, MENÇÕES #, LINKEDIN & GITOPS)
// ============================================================================
function renderizarBarrasDeMencoesAdmin() {
  const mapa = obterMapaDeMencoes();
  const chaves = Object.keys(mapa);

  const htmlChips =
    `<span class="mono-accent" style="font-size: 0.74rem;">💬 Mencionar # (1-Clique):</span>` +
    chaves
      .map(
        (slug) =>
          `<button type="button" class="chip-insert-mencao" data-slug-insert="#${escaparHTML(slug)}">#${escaparHTML(slug)}</button>`
      )
      .join("");

  const barraPag = document.getElementById("helper-mencoes-pag");
  const barraArt = document.getElementById("helper-mencoes-art");

  if (barraPag) {
    barraPag.innerHTML = htmlChips;
    barraPag.querySelectorAll(".chip-insert-mencao").forEach((btn) => {
      btn.addEventListener("click", () => {
        const txt = document.getElementById("pag-conteudo");
        txt.value += " " + btn.getAttribute("data-slug-insert") + " ";
        txt.focus();
      });
    });
  }

  if (barraArt) {
    barraArt.innerHTML = htmlChips;
    barraArt.querySelectorAll(".chip-insert-mencao").forEach((btn) => {
      btn.addEventListener("click", () => {
        const txt = document.getElementById("art-conteudo");
        txt.value += " " + btn.getAttribute("data-slug-insert") + " ";
        txt.focus();
      });
    });
  }
}

function carregarPaginaNoFormularioAdmin(idPagina) {
  const pagina = KELDE_DB.obterTodasPaginas().find((p) => Number(p.id) === Number(idPagina));
  if (!pagina) return;

  abrirModalAdmin("paginas");
  document.getElementById("pag-id-edicao").value = String(pagina.id);
  document.getElementById("pag-titulo").value = pagina.titulo;
  document.getElementById("pag-slug").value = pagina.slug;
  document.getElementById("pag-icone").value = pagina.icone || "🎓";
  document.getElementById("pag-resumo").value = pagina.resumo;
  document.getElementById("pag-conteudo").value = pagina.conteudoBruto;

  document.getElementById("btn-salvar-pagina").textContent = `💾 Salvar Alterações em #${pagina.slug}`;
  document.getElementById("btn-cancelar-edicao-pag").style.display = "inline-flex";
  document.getElementById("admin-feedback").style.color = "var(--accent-primary)";
  document.getElementById("admin-feedback").textContent = `✏️ Editando a página #${pagina.slug}. Altere os cursos abaixo e clique em Salvar!`;
}

function limparFormularioPaginaAdmin() {
  document.getElementById("form-nova-pagina").reset();
  document.getElementById("pag-id-edicao").value = "";
  document.getElementById("pag-icone").value = "🎓";
  document.getElementById("btn-salvar-pagina").textContent = "💾 Salvar Nova Página no Sistema";
  document.getElementById("btn-cancelar-edicao-pag").style.display = "none";
}

function gerarTextoLinkedIn(artigo, estilo) {
  if (!artigo) return "";
  const urlSite = DADOS_PERFIL.urlPublica || "https://keldedev.vercel.app";
  const hashtags = artigo.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" ") + " #EngenhariaDeSoftware #Unicesumar #LearningInPublic";

  if (estilo === "aida") {
    return `🚨 A maioria das pessoas na tecnologia ignora este detalhe sobre ${artigo.categoria} — até que o sistema cresce e cobra o preço.

Hoje publiquei uma nova nota técnica no meu laboratório digital (KELDE.dev) intitulada:
👉 "${artigo.titulo}"

💡 O ponto central da discussão:
"${artigo.resumo}"

🔗 Leia o artigo completo e confira minha trilha de estudos direto no meu portal:
${urlSite}

${hashtags}`;
  }

  if (estilo === "executivo") {
    return `📌 Nova publicação técnica no KELDE.dev: "${artigo.titulo}"

Destaques da análise de hoje sobre ${artigo.categoria}:
• Visão sistêmica voltada à escalabilidade e boas práticas de Engenharia de Software;
• Síntese: ${artigo.resumo}

📖 Leitura completa disponível em:
${urlSite}

${hashtags}`;
  }

  return `Construir uma carreira sólida em Engenharia de Software exige muito mais do que decorar comandos: exige entender o "porquê" antes do "como". 🧠💻

Seguindo minha filosofia de Learning in Public durante a graduação na Unicesumar, acabei de publicar um novo artigo no meu portfólio KELDE.dev:

✨ "${artigo.titulo}"

"${artigo.resumo}"

Fica o convite para ler o texto completo e deixar seu comentário direto no site:
🔗 ${urlSite}

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
  const tabPaginas = document.getElementById("tab-admin-paginas");
  const tabEscrever = document.getElementById("tab-admin-escrever");
  const tabLinkedin = document.getElementById("tab-admin-linkedin");
  const tabGerenciar = document.getElementById("tab-admin-gerenciar");

  const formPagina = document.getElementById("form-nova-pagina");
  const formArtigo = document.getElementById("form-novo-artigo");
  const painelLinkedin = document.getElementById("painel-admin-linkedin");
  const painelGerenciar = document.getElementById("painel-admin-gerenciar");

  tabPaginas.classList.toggle("active", aba === "paginas");
  tabEscrever.classList.toggle("active", aba === "escrever");
  tabLinkedin.classList.toggle("active", aba === "linkedin");
  tabGerenciar.classList.toggle("active", aba === "gerenciar");

  formPagina.style.display = aba === "paginas" ? "block" : "none";
  formArtigo.style.display = aba === "escrever" ? "block" : "none";
  painelLinkedin.style.display = aba === "linkedin" ? "block" : "none";
  painelGerenciar.style.display = aba === "gerenciar" ? "block" : "none";

  renderizarBarrasDeMencoesAdmin();

  if (aba === "linkedin") {
    atualizarGeradorLinkedIn(idArtigoParaLinkedIn);
  } else if (aba === "gerenciar" || aba === "paginas") {
    renderizarDadosPainelAdmin();
  }
}

function abrirModalAdmin(abaInicial = "paginas") {
  const usuario = KELDE_DB.obterUsuarioLogado();
  if (!usuario || usuario.role !== "admin") return;

  renderizarDadosPainelAdmin();
  alternarAbaAdmin(abaInicial);
  const modal = document.getElementById("modal-admin");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function renderizarDadosPainelAdmin() {
  const paginas = KELDE_DB.obterTodasPaginas();
  const artigos = KELDE_DB.obterTodosArtigos();
  const usuarios = KELDE_DB.lerTabela("kelde_db_usuarios", []);
  const baseCom = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
  const comentarios = KELDE_DB.lerTabela("kelde_db_comentarios", baseCom);

  document.getElementById("admin-stats-grid").innerHTML = `
    <div class="stat-box">
      <div class="stat-number">${paginas.length}</div>
      <div class="stat-label">Páginas (#canais)</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${artigos.length}</div>
      <div class="stat-label">Artigos no Blog</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${usuarios.length}</div>
      <div class="stat-label">Leitores no Banco</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${comentarios.length}</div>
      <div class="stat-label">Comentários</div>
    </div>
  `;

  // Lista rápida de páginas na Aba 1 (Editar / Excluir)
  const listaPagEl = document.getElementById("lista-admin-paginas-rapida");
  if (listaPagEl) {
    listaPagEl.innerHTML = paginas
      .map(
        (p) => `
      <div class="admin-list-item">
        <div>
          <strong>${escaparHTML(p.icone)} ${escaparHTML(p.titulo)}</strong>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">
            Atalho Discord: <span class="mono-accent">#${escaparHTML(p.slug)}</span> • Atualizado: ${escaparHTML(p.atualizadoEm)}
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn-edit-item" data-edit-pag-id="${Number(p.id)}">✏️ Editar Cursos/Texto</button>
          <button type="button" class="btn-delete-item" data-del-pag-id="${Number(p.id)}">🗑️ Excluir</button>
        </div>
      </div>
    `
      )
      .join("");

    listaPagEl.querySelectorAll("[data-edit-pag-id]").forEach((btn) => {
      btn.addEventListener("click", () => carregarPaginaNoFormularioAdmin(Number(btn.getAttribute("data-edit-pag-id"))));
    });

    listaPagEl.querySelectorAll("[data-del-pag-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        KELDE_DB.excluirPagina(Number(btn.getAttribute("data-del-pag-id")));
        renderizarDadosPainelAdmin();
        inicializarCanaisEPaginas();
      });
    });
  }

  // Lista de artigos na Aba 4
  const listaArtEl = document.getElementById("lista-admin-artigos");
  listaArtEl.innerHTML = artigos
    .map(
      (a, idx) => `
    <div class="admin-list-item">
      <div>
        <strong>${escaparHTML(a.titulo)}</strong>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">
          <span class="mono-accent">#${escaparHTML(a.slug || `artigo${idx + 1}`)}</span> • ${escaparHTML(a.categoria)} • ${escaparHTML(a.data)}
        </div>
      </div>
      <button type="button" class="btn-delete-item" data-del-id="${Number(a.id)}">🗑️ Excluir</button>
    </div>
  `
    )
    .join("");

  listaArtEl.querySelectorAll("[data-del-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-del-id"));
      KELDE_DB.excluirArtigo(id);
      renderizarDadosPainelAdmin();
      inicializarCanaisEPaginas();
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
        <span class="tag-chip">🔒 ${escaparHTML(u.senhaHash)}</span>
      </div>
    `
      )
      .join("");
  }
}

function exportarArquivoDadosJS() {
  const paginasAtuais = KELDE_DB.obterTodasPaginas();
  const artigosAtuais = KELDE_DB.obterTodosArtigos();
  const baseCom = typeof COMENTARIOS_INICIAIS !== "undefined" ? COMENTARIOS_INICIAIS : [];
  const comentariosAtuais = KELDE_DB.lerTabela("kelde_db_comentarios", baseCom);
  const telemetriaAtual = typeof DADOS_TELEMETRIA !== "undefined" ? DADOS_TELEMETRIA : [];

  const conteudoArquivo = `// ============================================================================
// ARQUIVO DE DADOS GERADO PELO KELDE STUDIO CMS (v6.0 ULTIMATE)
// ============================================================================

const DADOS_PERFIL = ${JSON.stringify(DADOS_PERFIL, null, 2)};

const DADOS_PAGINAS = ${JSON.stringify(paginasAtuais, null, 2)};

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
  const tabPaginas = document.getElementById("tab-admin-paginas");
  const tabEscrever = document.getElementById("tab-admin-escrever");
  const tabLinkedin = document.getElementById("tab-admin-linkedin");
  const tabGerenciar = document.getElementById("tab-admin-gerenciar");

  const formPagina = document.getElementById("form-nova-pagina");
  const formArtigo = document.getElementById("form-novo-artigo");
  const feedback = document.getElementById("admin-feedback");
  const btnExportar = document.getElementById("btn-exportar-dados");
  const btnCopiarLinkedin = document.getElementById("btn-copiar-linkedin");
  const btnCancelarEdicaoPag = document.getElementById("btn-cancelar-edicao-pag");

  btnFechar.addEventListener("click", () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });

  tabPaginas.addEventListener("click", () => {
    feedback.textContent = "";
    alternarAbaAdmin("paginas");
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

  // Botões de inserção rápida de cursos [FEITO], [FAZENDO], [FUTURO]
  document.querySelectorAll(".chip-insert-pag").forEach((btn) => {
    btn.addEventListener("click", () => {
      const txt = document.getElementById("pag-conteudo");
      txt.value += btn.getAttribute("data-insert");
      txt.focus();
    });
  });

  btnCancelarEdicaoPag.addEventListener("click", () => {
    limparFormularioPaginaAdmin();
    feedback.textContent = "";
  });

  formPagina.addEventListener("submit", (e) => {
    e.preventDefault();
    const idEdicao = document.getElementById("pag-id-edicao").value;
    const titulo = document.getElementById("pag-titulo").value;
    const slug = document.getElementById("pag-slug").value;
    const icone = document.getElementById("pag-icone").value;
    const resumo = document.getElementById("pag-resumo").value;
    const conteudo = document.getElementById("pag-conteudo").value;

    const paginaSalva = KELDE_DB.salvarOuEditarPagina(idEdicao, titulo, slug, icone, resumo, conteudo);
    if (paginaSalva) {
      limparFormularioPaginaAdmin();
      inicializarCanaisEPaginas();
      renderizarDadosPainelAdmin();
      renderizarBarrasDeMencoesAdmin();
      feedback.style.color = "var(--success-color)";
      feedback.textContent = `✅ Página #${paginaSalva.slug} salva com sucesso! Para atualizar na Vercel, baixe o dados.js na Aba 4.`;
    }
  });

  formArtigo.addEventListener("submit", (e) => {
    e.preventDefault();
    const titulo = document.getElementById("art-titulo").value;
    const slug = document.getElementById("art-slug").value;
    const categoria = document.getElementById("art-categoria").value;
    const tags = document.getElementById("art-tags").value;
    const resumo = document.getElementById("art-resumo").value;
    const conteudo = document.getElementById("art-conteudo").value;

    const novo = KELDE_DB.publicarNovoArtigo(titulo, slug, categoria, tags, resumo, conteudo);
    if (novo) {
      formArtigo.reset();
      categoriaAtiva = "Todos";
      inicializarCanaisEPaginas();
      inicializarBlog();
      renderizarDadosPainelAdmin();
      feedback.style.color = "var(--success-color)";
      feedback.textContent = `✅ Artigo #${novo.slug} publicado! Confira a copy para LinkedIn abaixo:`;
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
    feedback.textContent = "📦 Arquivo dados.js v6.0 baixado! Suba no seu GitHub para atualizar na Vercel.";
  });
}

// ============================================================================
// 10. COMMAND PALETTE (CTRL + K) INTEGRADO COM PÁGINAS (#)
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
    const paginasCmd = KELDE_DB.obterTodasPaginas().map((p) => ({
      titulo: `${p.icone} Abrir Página: ${p.titulo}`,
      detalhe: `#${p.slug}`,
      acao: () => abrirPaginaNoModal(p.id)
    }));

    const base = [
      {
        titulo: "👑 Abrir KELDE Studio CMS (Gerenciar Páginas & Artigos)",
        detalhe: "Admin",
        acao: () => {
          const usr = KELDE_DB.obterUsuarioLogado();
          if (usr && usr.role === "admin") abrirModalAdmin("paginas");
          else abrirModalAuth("login");
        }
      },
      {
        titulo: "📄 Gerar Currículo Executivo em PDF (A4)",
        detalhe: "Impressão",
        acao: () => window.print()
      },
      {
        titulo: "🌗 Alternar Tema Claro / Escuro",
        detalhe: "UI/UX",
        acao: () => document.getElementById("btn-tema").click()
      }
    ];

    const artigosCmd = KELDE_DB.obterTodosArtigos().map((a, idx) => ({
      titulo: `📖 Ler Artigo: ${a.titulo}`,
      detalhe: `#${a.slug || `artigo${idx + 1}`}`,
      acao: () => abrirArtigoNoModal(a.id)
    }));

    return [...paginasCmd, ...base, ...artigosCmd];
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
      listaCmd.innerHTML = `<div style="padding: 1rem; color: var(--text-secondary);">Nenhum comando ou #canal encontrado.</div>`;
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
        executarComando(Number(el.getAttribute("data-cmd-idx")));
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

function inicializarCurriculoPDF() {
  const btnPdf = document.getElementById("btn-cv-pdf");
  if (!btnPdf) return;
  btnPdf.addEventListener("click", () => window.print());
}

// ============================================================================
// 11. MOTOR DO BLOG, ROADMAP, PROJETOS E MODAL COM MENÇÕES DISCORD NOS COMENTÁRIOS
// ============================================================================
let categoriaAtiva = "Todos";
let termoBusca = "";

function calcularTempoLeitura(htmlTexto) {
  const textoLimpo = String(htmlTexto || "").replace(/<[^>]*>/g, " ");
  const totalPalavras = textoLimpo.trim().split(/\s+/).length;
  const minutos = Math.max(1, Math.ceil(totalPalavras / 200));
  return `${minutos} min`;
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
    .map((artigo, idx) => {
      const tempo = calcularTempoLeitura(artigo.conteudo);
      const ehFav = listaFavs.includes(artigo.id);
      const slugExibicao = artigo.slug || `artigo${idx + 1}`;
      return `
      <article class="article-card" data-id="${Number(artigo.id)}">
        <div>
          <div class="card-meta-top">
            <span class="badge-cat">${escaparHTML(artigo.categoria)}</span>
            <span class="discord-mention-static">#${escaparHTML(slugExibicao)}</span>
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

function renderizarComentariosModal(chaveAlvo) {
  const listaEl = document.getElementById("lista-comentarios-modal");
  const areaForm = document.getElementById("area-form-comentario");
  const comentarios = KELDE_DB.obterComentarios(chaveAlvo);
  const usuario = KELDE_DB.obterUsuarioLogado();

  if (comentarios.length === 0) {
    listaEl.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.9rem;">Seja o primeiro a deixar um comentário ou recomendação aqui!</p>`;
  } else {
    listaEl.innerHTML = comentarios
      .map(
        (c) => `
      <div class="comment-item">
        <div class="comment-header">
          <strong>${escaparHTML(c.autor)} <span class="mono-accent" style="font-weight:400;">• ${escaparHTML(c.cargo)}</span></strong>
          <span style="color: var(--text-muted);">${escaparHTML(c.data)}</span>
        </div>
        <p style="font-size: 0.94rem;">${aplicarMencoesDiscord(escaparHTML(c.texto))}</p>
      </div>
    `
      )
      .join("");
  }

  if (usuario) {
    areaForm.innerHTML = `
      <form id="form-novo-comentario">
        <textarea id="texto-novo-comentario" class="comment-textarea" required maxlength="400" placeholder="Escreva seu comentário ou recomendação como ${escaparHTML(usuario.nome)} (use #cursos, #arquitetura para mencionar)..."></textarea>
        <button type="submit" class="btn btn-primary btn-sm">Publicar Comentário →</button>
      </form>
    `;
    document.getElementById("form-novo-comentario").addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = document.getElementById("texto-novo-comentario").value;
      if (txt.trim()) {
        KELDE_DB.adicionarComentario(chaveAlvo, txt);
        renderizarComentariosModal(chaveAlvo);
        inicializarCanaisEPaginas();
      }
    });
  } else {
    areaForm.innerHTML = `
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <span style="font-size: 0.9rem; color: var(--text-secondary);">🔐 Faça login rápido para deixar uma recomendação ou comentário!</span>
        <button id="btn-login-comentar" type="button" class="btn btn-secondary btn-sm">Entrar / Criar Conta</button>
      </div>
    `;
    document.getElementById("btn-login-comentar").addEventListener("click", () => abrirModalAuth("login"));
  }
}

function abrirArtigoNoModal(idArtigo) {
  const artigo = KELDE_DB.obterTodosArtigos().find((a) => Number(a.id) === Number(idArtigo));
  if (!artigo) return;

  document.getElementById("btn-editar-direto-modal").style.display = "none";
  document.getElementById("modal-categoria").textContent = artigo.categoria;
  document.getElementById("modal-slug-badge").textContent = `#${artigo.slug || "artigo"}`;
  document.getElementById("modal-data").textContent = artigo.data;
  document.getElementById("modal-tempo").textContent = "⏱ " + calcularTempoLeitura(artigo.conteudo);
  document.getElementById("modal-titulo").textContent = artigo.titulo;
  document.getElementById("modal-tags").innerHTML = artigo.tags
    .map((t) => `<span class="tag-chip">#${escaparHTML(t)}</span>`)
    .join("");
  document.getElementById("modal-conteudo").innerHTML = aplicarMencoesDiscord(artigo.conteudo);
  document.getElementById("titulo-secao-comentarios").textContent = "💬 Discussão & Comentários da Comunidade";

  renderizarComentariosModal(`artigo_${idArtigo}`);

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
