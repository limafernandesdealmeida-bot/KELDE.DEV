// ============================================================================
// CAMADA DE LÓGICA E ESTADO (ENGINE) - KELDE.DEV
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarPerfil();
  inicializarTema();
  inicializarBlog();
  inicializarRoadmap();
  inicializarProjetos();
  inicializarModal();
  inicializarBarraProgressoGlobal();
});

// 1. Preenche os dados pessoais de Mikélder na tela
function inicializarPerfil() {
  document.getElementById("nav-marca").textContent = DADOS_PERFIL.marca;
  document.getElementById("nav-sufixo").textContent = DADOS_PERFIL.sufixoMarca;
  document.getElementById("hero-status").textContent = DADOS_PERFIL.statusAtual;
  document.getElementById("hero-nome").textContent = DADOS_PERFIL.nomeCompleto;
  document.getElementById("hero-instituicao").textContent = DADOS_PERFIL.instituicao;
  document.getElementById("hero-headline").textContent = DADOS_PERFIL.headline;
  document.getElementById("hero-subheadline").textContent = DADOS_PERFIL.subheadline;
  document.getElementById("texto-sobre").textContent = DADOS_PERFIL.sobreMim;
  document.getElementById("ano-atual").textContent = new Date().getFullYear();

  const containerContatos = document.getElementById("lista-contatos");
  const c = DADOS_PERFIL.contatos;

  containerContatos.innerHTML = `
    <a href="${c.linkedin}" target="_blank" rel="noopener noreferrer" class="contact-item">
      <span>💼 LinkedIn Profissional</span> <span class="mono-accent">Conectar ↗</span>
    </a>
    <a href="${c.github}" target="_blank" rel="noopener noreferrer" class="contact-item">
      <span>💻 GitHub & Repositórios</span> <span class="mono-accent"> Seguir ↗</span>
    </a>
    <a href="${c.whatsapp}" target="_blank" rel="noopener noreferrer" class="contact-item">
      <span>💬 WhatsApp Direto</span> <span class="mono-accent">Chamar ↗</span>
    </a>
    <a href="${c.email}" class="contact-item">
      <span>✉️ E-mail Acadêmico/Profissional</span> <span class="mono-accent">Enviar ↗</span>
    </a>
    <div class="contact-item">
      <span>📞 Telefone / Contato</span> <span class="mono-accent">${c.telefoneExibicao}</span>
    </div>
  `;

  document.getElementById("modal-link-linkedin").href = c.linkedin;
}

// 2. Algoritmo de Cálculo de Tempo de Leitura (Base: 200 palavras/minuto)
function calcularTempoLeitura(htmlTexto) {
  const textoLimpo = htmlTexto.replace(/<[^>]*>/g, " ");
  const totalPalavras = textoLimpo.trim().split(/\s+/).length;
  const minutos = Math.max(1, Math.ceil(totalPalavras / 200));
  return `${minutos} min de leitura`;
}

// 3. Motor do Blog (Busca em Tempo Real + Filtro por Categorias)
let categoriaAtiva = "Todos";
let termoBusca = "";

function inicializarBlog() {
  const categorias = ["Todos", ...new Set(DADOS_ARTIGOS.map((a) => a.categoria))];
  const containerFiltros = document.getElementById("filtros-categoria");

  function renderizarBotoesCategoria() {
    containerFiltros.innerHTML = categorias
      .map(
        (cat) => `
        <button class="pill-btn ${cat === categoriaAtiva ? "active" : ""}" data-cat="${cat}">
          ${cat}
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

  document.getElementById("input-busca").addEventListener("input", (e) => {
    termoBusca = e.target.value.toLowerCase();
    renderizarArtigos();
  });

  renderizarBotoesCategoria();
  renderizarArtigos();
}

function renderizarArtigos() {
  const grid = document.getElementById("grid-artigos");

  const artigosFiltrados = DADOS_ARTIGOS.filter((artigo) => {
    const bateCategoria = categoriaAtiva === "Todos" || artigo.categoria === categoriaAtiva;
    const bateBusca =
      artigo.titulo.toLowerCase().includes(termoBusca) ||
      artigo.resumo.toLowerCase().includes(termoBusca) ||
      artigo.tags.some((t) => t.toLowerCase().includes(termoBusca));
    return bateCategoria && bateBusca;
  });

  if (artigosFiltrados.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-secondary);">Nenhum artigo encontrado para essa busca.</p>`;
    return;
  }

  grid.innerHTML = artigosFiltrados
    .map((artigo) => {
      const tempo = calcularTempoLeitura(artigo.conteudo);
      return `
      <article class="article-card" data-id="${artigo.id}" tabindex="0" role="button" aria-label="Ler artigo ${artigo.titulo}">
        <div>
          <div class="card-meta-top">
            <span class="badge-cat">${artigo.categoria}</span>
            <span class="mono-accent">⏱ ${tempo}</span>
          </div>
          <h3 class="card-title">${artigo.titulo}</h3>
          <p class="card-excerpt">${artigo.resumo}</p>
        </div>
        <div>
          <div class="card-tags">
            ${artigo.tags.map((t) => `<span class="tag-chip">#${t}</span>`).join("")}
          </div>
          <div class="card-footer">
            <span>📅 ${artigo.data}</span>
            <span class="read-more-link">Ler artigo completo →</span>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  grid.querySelectorAll(".article-card").forEach((card) => {
    card.addEventListener("click", () => abrirArtigoNoModal(Number(card.getAttribute("data-id"))));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") abrirArtigoNoModal(Number(card.getAttribute("data-id")));
    });
  });
}

// 4. Renderiza a Matriz de Evolução (Roadmap)
function inicializarRoadmap() {
  const grid = document.getElementById("grid-roadmap");
  grid.innerHTML = DADOS_ROADMAP.map(
    (item) => `
    <div class="roadmap-card">
      <span class="roadmap-phase">${item.fase}</span>
      <h3 class="roadmap-title">${item.titulo}</h3>
      <p style="color: var(--text-secondary); font-size: 0.92rem;">${item.descricao}</p>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${item.progresso}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.75rem;">
        <span class="mono-accent">${item.status}</span>
        <strong>${item.progresso}%</strong>
      </div>
      <div class="card-tags">
        ${item.tags.map((t) => `<span class="tag-chip">${t}</span>`).join("")}
      </div>
    </div>
  `
  ).join("");
}

// 5. Renderiza os Estudos de Caso e Laboratório
function inicializarProjetos() {
  const grid = document.getElementById("grid-projetos");
  grid.innerHTML = DADOS_PROJETOS.map(
    (proj) => `
    <div class="project-card">
      <div>
        <div class="card-meta-top">
          <span class="badge-cat">${proj.tipo}</span>
          <span class="mono-accent" style="font-size:0.75rem;">${proj.metricas}</span>
        </div>
        <h3 class="card-title">${proj.titulo}</h3>
        <p style="color: var(--text-secondary); font-size: 0.93rem;">${proj.resumo}</p>
        <div class="project-learning">
          <strong>💡 Engenharia Aplicada:</strong> ${proj.aprendizados}
        </div>
      </div>
      <div class="card-tags">
        ${proj.tags.map((t) => `<span class="tag-chip">${t}</span>`).join("")}
      </div>
    </div>
  `
  ).join("");
}

// 6. Controle do Modal de Leitura Instantânea (SPA)
function abrirArtigoNoModal(idArtigo) {
  const artigo = DADOS_ARTIGOS.find((a) => a.id === idArtigo);
  if (!artigo) return;

  document.getElementById("modal-categoria").textContent = artigo.categoria;
  document.getElementById("modal-data").textContent = artigo.data;
  document.getElementById("modal-tempo").textContent = "⏱ " + calcularTempoLeitura(artigo.conteudo);
  document.getElementById("modal-titulo").textContent = artigo.titulo;
  document.getElementById("modal-tags").innerHTML = artigo.tags
    .map((t) => `<span class="tag-chip">#${t}</span>`)
    .join("");
  document.getElementById("modal-conteudo").innerHTML = artigo.conteudo;

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
    if (e.key === "Escape" && modal.classList.contains("open")) fecharModal();
  });

  scrollArea.addEventListener("scroll", () => {
    const scrollTop = scrollArea.scrollTop;
    const alturaTotal = scrollArea.scrollHeight - scrollArea.clientHeight;
    const porcentagem = alturaTotal > 0 ? (scrollTop / alturaTotal) * 100 : 100;
    barraModal.style.width = `${porcentagem}%`;
  });
}

// 7. Alternador de Tema (Light / Dark Mode) com Memória
function inicializarTema() {
  const html = document.documentElement;
  const btnTema = document.getElementById("btn-tema");
  const icone = document.getElementById("icone-tema");

  const temaSalvo = localStorage.getItem("kelde_tema") || "dark";
  html.setAttribute("data-theme", temaSalvo);
  icone.textContent = temaSalvo === "dark" ? "☀️" : "🌙";

  btnTema.addEventListener("click", () => {
    const atual = html.getAttribute("data-theme");
    const novo = atual === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", novo);
    localStorage.setItem("kelde_tema", novo);
    icone.textContent = novo === "dark" ? "☀️" : "🌙";
  });
}

// 8. Barra de Progresso no Topo da Página
function inicializarBarraProgressoGlobal() {
  const barra = document.getElementById("barra-progresso-topo");
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (scrollTop / alturaTotal) * 100 : 0;
    barra.style.width = `${progresso}%`;
  });
}
