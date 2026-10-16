// ============================================================================
// ARQUIVO DE DADOS (CMS LOCAL v5.0 ULTIMATE) - KELDE.DEV (Mikélder)
// ============================================================================

const DADOS_PERFIL = {
  marca: "KELDE",
  sufixoMarca: ".dev",
  nomeCompleto: "Mikélder",
  iniciais: "MK",
  fotoPerfil: "foto.jpg",
  urlPublica: "urlPublica: "https://keldedev.vercel.app",",

  instituicao: "Engenharia de Software @ Unicesumar",
  statusAtual: "Disponível para Networking, Pesquisa & Projetos",
  
  headline: "Documentando a ciência por trás do software: da Engenharia de Requisitos à Arquitetura, Dados, IA e Automação.",
  
  subheadline: "Construindo uma base sólida na graduação com visão de longo prazo voltada à pesquisa científica (Mestrado & Doutorado). Pressione Ctrl + K para navegar por comandos rápidos!",

  sobreMim: "Meus tios me chamam de 'Kelde' porque achavam difícil pronunciar Mikélder — e decidi transformar esse apelido familiar na identidade do meu laboratório digital. Sou estudante de Engenharia de Software na Unicesumar e acredito no conceito de Learning in Public (aprender em público). Mesmo enquanto construo minha base em programação, meu foco é enxergar a computação de forma sistêmica: como arquitetar sistemas resilientes, extrair inteligência de dados, aplicar metodologias ágeis e automatizar infraestruturas.",

  contatos: {
    linkedin: "https://linkedin.com/in/seu-perfil",
    github: "https://github.com/limafernandesdealmeida-bot",
    email: "mailto:mikelder.contato@email.com",
    whatsapp: "https://wa.me/5500900000000?text=Ol%C3%A1%20Mik%C3%A9lder!%20Vi%20seu%20portf%C3%B3lio%20KELDE.dev",
    telefoneExibicao: "+55 (00) 90000-0000"
  }
};

// ============================================================================
// TELEMETRIA ACADÊMICA GAMIFICADA (Métricas Reais de Disciplina & Progresso)
// ============================================================================
const DADOS_TELEMETRIA = [
  {
    rotulo: "Extensão Universitária",
    valorAtual: 50,
    valorMeta: 340,
    unidade: "horas",
    detalhe: "50h concluídas de 340h exigidas na matriz curricular"
  },
  {
    rotulo: "Projetos Acadêmicos (MAPA)",
    valorAtual: 100,
    valorMeta: 100,
    unidade: "%",
    detalhe: "Entregas práticas de Engenharia de Software 100% em dia"
  },
  {
    rotulo: "Base Ágil & Científica",
    valorAtual: 90,
    valorMeta: 100,
    unidade: "%",
    detalhe: "Domínio teórico em Scrum, XP e Metodologia da Pesquisa"
  }
];

// ============================================================================
// MATRIZ DE EVOLUÇÃO & ROADMAP ACADÊMICO
// ============================================================================
const DADOS_ROADMAP = [
  {
    fase: "Fase 01 • Base Consolidada",
    titulo: "Fundamentos de Engenharia & Metodologia",
    status: "Em Domínio Contínuo",
    progresso: 85,
    descricao: "Engenharia de Requisitos, Metodologias Ágeis (Scrum e Extreme Programming - XP), Produção do Conhecimento Científico e Visão Sistêmica de Software.",
    tags: ["Scrum", "XP", "Engenharia de Software", "Metodologia Científica"]
  },
  {
    fase: "Fase 02 • Foco de Estudo Atual",
    titulo: "Arquitetura, Dados, IA & DevSecOps",
    status: "Em Laboratório Ativo",
    progresso: 55,
    descricao: "Transição da teoria para a prática: arquitetura modular web, autenticação segura, inferência de LLMs locais, modelagem de dados e automação.",
    tags: ["Arquitetura", "IA & LLMs", "Banco de Dados", "DevSecOps"]
  },
  {
    fase: "Fase 03 • Horizonte de Longo Prazo",
    titulo: "Especialização, Mestrado & Doutorado",
    status: "Visão de Futuro",
    progresso: 20,
    descricao: "Pesquisa acadêmica avançada em Ciência da Computação, unindo Inteligência Artificial, Arquitetura de Sistemas Distribuídos e Automação em larga escala.",
    tags: ["Stricto Sensu", "Pesquisa Científica", "Sistemas Complexos"]
  }
];

// ============================================================================
// VITRINE DE ESTUDOS DE CASO E LABORATÓRIO
// ============================================================================
const DADOS_PROJETOS = [
  {
    id: 1,
    tipo: "Engenharia & Agilidade",
    titulo: "Projeto Acadêmico MAPA & Modelagem Ágil (Scrum/XP)",
    resumo: "Desenvolvimento completo de avaliação prática de Engenharia de Software combinando artefatos do Scrum com práticas de Extreme Programming (XP).",
    aprendizados: "Levantamento de requisitos, estruturação de Product Backlog, rigor metodológico e visão de qualidade desde a concepção.",
    metricas: "100% Concluído • Rigor Acadêmico",
    tags: ["MAPA", "Scrum", "XP", "Requisitos"]
  },
  {
    id: 2,
    tipo: "Laboratório & IA",
    titulo: "Inferência e Otimização de LLMs Locais (27B Q1_0 GGUF)",
    resumo: "Experimento prático de infraestrutura doméstica executando modelos de linguagem quantizados via LM Studio, calibrando consumo de memória RAM (3200 MT/s).",
    aprendizados: "Análise prática da relação entre arquitetura de hardware, largura de banda de memória e eficiência computacional em IA.",
    metricas: "Consumo estabilizado em ~4.50 GB",
    tags: ["IA Local", "GGUF", "Hardware", "Performance"]
  },
  {
    id: 3,
    tipo: "Arquitetura Full-Feature",
    titulo: "Plataforma KELDE.dev v5.0 Ultimate",
    resumo: "Aplicação web modular com Command Palette (Ctrl+K), CMS Admin com RBAC, gerador automático de copy para LinkedIn, currículo em PDF e proteção Anti-XSS.",
    aprendizados: "Padrão Separation of Concerns (SoC), persistência NoSQL local, criptografia de senhas por Hash+Salt e Neurodesign.",
    metricas: "v5.0 • Command Palette + CMS + DevSecOps",
    tags: ["Arquitetura", "Cibersegurança", "CMS", "Neuromarketing"]
  }
];

// ============================================================================
// MOTOR DO BLOG: SEUS ARTIGOS
// ============================================================================
const DADOS_ARTIGOS = [
  {
    id: 101,
    titulo: "Por que a Arquitetura de Software vem antes da primeira linha de código?",
    data: "15 Out 2026",
    categoria: "Arquitetura",
    destaque: true,
    resumo: "Muitos iniciantes acham que desenvolver software é apenas digitar comandos. Na Engenharia de Software, aprendemos que o segredo de um sistema duradouro está na planta, não apenas nos tijolos.",
    tags: ["Arquitetura", "Engenharia de Software", "Boas Práticas"],
    conteudo: `
      <p>Quando começamos a estudar tecnologia, a ansiedade natural é querer sair digitando código imediatamente. Mas, à medida que me aprofundo na graduação em <strong>Engenharia de Software</strong>, percebo uma verdade fundamental: <em>programar é apenas uma etapa da construção; arquitetar é o que garante que o sistema continue de pé amanhã.</em></p>
      
      <h3>O que é, de fato, Arquitetura de Software?</h3>
      <p>Pense na construção de um edifício. Você pode ter os melhores pedreiros do mundo, mas se não houver um cálculo estrutural e uma planta clara dividindo a rede elétrica da rede hidráulica, qualquer reforma futura vai derrubar uma parede essencial.</p>
      <p>No software, nós aplicamos conceitos como <strong>Separation of Concerns (Separação de Responsabilidades)</strong>. É exatamente o padrão utilizado para construir este próprio site que você está lendo agora:</p>
      <ul>
        <li><strong>Camada de Dados:</strong> Onde as informações e textos ficam guardados de forma limpa.</li>
        <li><strong>Camada de Visualização (UI):</strong> Onde definimos a estética, tipografia e acessibilidade.</li>
        <li><strong>Camada de Regras, Segurança e Persistência:</strong> O motor que conecta os dados, o login e o banco de dados à tela.</li>
      </ul>

      <h3>A visão de um futuro pesquisador</h3>
      <p>Estudar arquitetura antes mesmo de dominar todas as linguagens de programação me dá uma vantagem estratégica: quando eu olhar para um problema real ou iniciar uma pesquisa de mestrado, minha primeira pergunta nunca será <em>"qual ferramenta está na moda?"</em>, mas sim <strong>"qual estrutura resolve esse problema com menor custo de manutenção e maior escalabilidade?"</strong>.</p>
    `
  },
  {
    id: 102,
    titulo: "Dados e IA: O novo petróleo não serve para nada sem uma refinaria",
    data: "12 Out 2026",
    categoria: "Dados",
    destaque: false,
    resumo: "Todo mundo fala sobre Inteligência Artificial, mas pouca gente fala sobre a base que alimenta tudo isso: a Engenharia, os Bancos de Dados e a Ciência de Dados com rigor científico.",
    tags: ["Dados", "Inteligência Artificial", "Banco de Dados"],
    conteudo: `
      <p>Costuma-se dizer que "dados são o novo petróleo". Porém, na computação e na metodologia científica, existe um complemento obrigatório para essa frase: <strong>petróleo bruto não move um carro; ele precisa ser refinado.</strong></p>

      <h3>Da coleta bruta à inteligência real</h3>
      <p>Um modelo de Inteligência Artificial ou um painel de decisões empresariais só é tão bom quanto a qualidade dos dados que entram nele. Na ciência da computação, existe um princípio clássico chamado <em>Garbage In, Garbage Out</em> (Lixo entra, Lixo sai).</p>
      <p>Por isso, meu interesse na área de <strong>Dados e IA</strong> passa por entender três pilares fundamentais:</p>
      <ul>
        <li><strong>Modelagem e Bancos de Dados:</strong> Como estruturar usuários, permissões e registros para que façam sentido lógico e seguro.</li>
        <li><strong>Metodologia Científica:</strong> Testar hipóteses com base em evidências, evitando vieses cognitivos na interpretação de métricas.</li>
        <li><strong>Eficiência Computacional:</strong> Como processar informações e rodar modelos (inclusive localmente) consumindo o mínimo de recursos de hardware.</li>
      </ul>

      <h3>O próximo passo</h3>
      <p>Unir a visão rigorosa da Engenharia de Software com a capacidade analítica de Dados é um dos caminhos mais promissores tanto para o mercado quanto para a pesquisa acadêmica avançada.</p>
    `
  },
  {
    id: 103,
    titulo: "Cultura DevOps e Automação: Se você faz algo repetitivo três vezes, automatize",
    data: "08 Out 2026",
    categoria: "DevOps & Automação",
    destaque: false,
    resumo: "DevOps não é apenas um cargo ou uma ferramenta: é uma filosofia que une quem constrói o software, quem protege os dados e quem mantém a infraestrutura funcionando.",
    tags: ["DevOps", "Automação", "Agilidade", "Infraestrutura"],
    conteudo: `
      <p>Ao estudar metodologias ágeis como <strong>Scrum</strong> e <strong>Extreme Programming (XP)</strong>, uma pergunta sempre surge: <em>de que adianta planejar entregas rápidas se, na hora de colocar o sistema no ar, tudo quebra ou demora dias?</em> É exatamente aí que entra a cultura <strong>DevOps e Automação</strong>.</p>

      <h3>A ponte entre Desenvolvimento (Dev), Segurança (Sec) e Operações (Ops)</h3>
      <p>Antigamente, quem criava o programa jogava o pacote "por cima do muro" para a equipe de infraestrutura cuidar. Se desse erro, começava o jogo de empurra. A filosofia DevOps derruba esse muro.</p>
      <ul>
        <li><strong>Automação Inteligente:</strong> Tarefas manuais e repetitivas são fontes constantes de erro humano. Automatizar testes e entregas libera o cérebro humano para pensar em soluções criativas.</li>
        <li><strong>Feedback Contínuo:</strong> Saber rapidamente se uma alteração melhorou ou piorou o desempenho do sistema.</li>
        <li><strong>Confiabilidade e Segurança:</strong> Garantir que o ambiente de estudo ou de produção seja previsível, blindado e seguro.</li>
      </ul>

      <h3>Por que estudar isso desde cedo?</h3>
      <p>Entender automação e infraestrutura desde o início da faculdade muda nossa mentalidade. Não queremos apenas sistemas que funcionem "na minha máquina", mas soluções preparadas para o mundo real.</p>
    `
  }
];

const COMENTARIOS_INICIAIS = [
  {
    idArtigo: 101,
    autor: "Prof. Convidado (Demo)",
    cargo: "Pesquisador em Computação",
    data: "15 Out 2026",
    texto: "Excelente reflexão, Mikélder! Começar a graduação já pensando em Arquitetura e Separação de Responsabilidades coloca você muitos passos à frente."
  }
];
