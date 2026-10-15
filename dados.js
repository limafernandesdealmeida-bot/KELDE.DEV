// ============================================================================
// ARQUIVO DE DADOS (CMS LOCAL) - KELDE.DEV (Mikélder)
// Para atualizar o site, basta editar os textos abaixo mantendo as aspas!
// ============================================================================

const DADOS_PERFIL = {
  marca: "KELDE",
  sufixoMarca: ".dev",
  nomeCompleto: "Mikélder",
  instituicao: "Engenharia de Software @ Unicesumar",
  statusAtual: "Disponível para Networking, Pesquisa & Projetos",
  
  // Headline otimizada com Neuromarketing (Autoridade Prospectiva)
  headline: "Documentando a ciência por trás do software: da Engenharia de Requisitos à Arquitetura, Dados, IA e Automação.",
  
  subheadline: "Construindo uma base sólida na graduação com visão de longo prazo voltada à pesquisa científica (Mestrado & Doutorado). Bem-vindo ao meu laboratório público de estudos.",

  sobreMim: "Meus tios me chamam de 'Kelde' porque achavam difícil pronunciar Mikélder — e decidi transformar esse apelido familiar na identidade do meu laboratório digital. Sou estudante de Engenharia de Software na Unicesumar e acredito no conceito de Learning in Public (aprender em público). Mesmo enquanto construo minha base em programação, meu foco é enxergar a computação de forma sistêmica: como arquitetar sistemas resilientes, extrair inteligência de dados, aplicar metodologias ágeis e automatizar infraestruturas.",

  // Seus contatos (Substitua os '#' pelos seus links e números reais quando quiser)
  contatos: {
    linkedin: "https://linkedin.com/in/seu-perfil",
    github: "https://github.com/seu-usuario",
    email: "mailto:mikelder.contato@email.com",
    whatsapp: "https://wa.me/5500900000000?text=Ol%C3%A1%20Mik%C3%A9lder!%20Vi%20seu%20portf%C3%B3lio%20KELDE.dev",
    telefoneExibicao: "+55 (00) 90000-0000"
  }
};

// ============================================================================
// MATRIZ DE EVOLUÇÃO & ROADMAP ACADÊMICO (Seção 3-D)
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
    titulo: "Lógica, Arquitetura, Dados & Infraestrutura",
    status: "Em Laboratório Ativo",
    progresso: 45,
    descricao: "Transição da teoria para a prática: estruturação modular web, exploração de modelos de IA locais, fundamentos de bancos de dados e cultura DevOps.",
    tags: ["Arquitetura", "IA & LLMs", "Dados", "DevOps"]
  },
  {
    fase: "Fase 03 • Horizonte de Longo Prazo",
    titulo: "Especialização, Mestrado & Doutorado",
    status: "Visão de Futuro",
    progresso: 15,
    descricao: "Pesquisa acadêmica avançada em Ciência da Computação, unindo Inteligência Artificial, Arquitetura de Sistemas Distribuídos e Automação em larga escala.",
    tags: ["Stricto Sensu", "Pesquisa Científica", "Sistemas Complexos"]
  }
];

// ============================================================================
// VITRINE DE ESTUDOS DE CASO E LABORATÓRIO (Sem depender de código complexo)
// ============================================================================
const DADOS_PROJETOS = [
  {
    id: 1,
    tipo: "Engenharia & Agilidade",
    titulo: "Modelagem Ágil de Sistemas com Scrum e XP",
    resumo: "Estudo prático de aplicação de artefatos do Scrum combinados com práticas de Extreme Programming (XP) para garantir qualidade desde a concepção do software.",
    aprendizados: "Levantamento de requisitos, criação de Product Backlog, definição de Pronto (DoD) e mitigação de riscos em projetos acadêmicos.",
    metricas: "100% focado em Processos & Qualidade",
    tags: ["Scrum", "XP", "Requisitos", "Gestão Ágil"]
  },
  {
    id: 2,
    tipo: "Laboratório & IA",
    titulo: "Execução e Otimização de LLMs Locais",
    resumo: "Experimento prático de infraestrutura doméstica rodando modelos de linguagem quantizados localmente, analisando consumo de memória RAM/VRAM e desempenho de hardware.",
    aprendizados: "Compreensão prática da relação entre hardware (placa-mãe, frequência de memória em MT/s) e inferência de Inteligência Artificial.",
    metricas: "Consumo otimizado em ~4.5 GB",
    tags: ["IA Local", "Hardware", "Performance", "Infraestrutura"]
  },
  {
    id: 3,
    tipo: "Arquitetura Web",
    titulo: "Ecossistema KELDE.dev (Este Portfólio)",
    resumo: "Projeto arquitetado sob o princípio de Separation of Concerns (SoC), separando camada de dados, apresentação e lógica para permitir manutenção ágil.",
    aprendizados: "Estruturação de arquivos modulares (HTML5, CSS3 com Design Tokens e JavaScript Vanilla) e aplicação de Neuromarketing na interface.",
    metricas: "Zero dependências externas • Carregamento instantâneo",
    tags: ["Arquitetura", "UI/UX", "Neuromarketing", "Clean Design"]
  }
];

// ============================================================================
// MOTOR DO BLOG: SEUS ARTIGOS (Basta copiar um bloco {...} para criar outro!)
// Categorias sugeridas: "Arquitetura", "Dados", "DevOps & Automação"
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
        <li><strong>Camada de Regras e Lógica:</strong> O motor que conecta os dados à tela.</li>
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
    resumo: "Todo mundo fala sobre Inteligência Artificial, mas pouca gente fala sobre a base que alimenta tudo isso: a Engenharia e a Ciência de Dados com rigor científico.",
    tags: ["Dados", "Inteligência Artificial", "Ciência da Computação"],
    conteudo: `
      <p>Costuma-se dizer que "dados são o novo petróleo". Porém, na computação e na metodologia científica, existe um complemento obrigatório para essa frase: <strong>petróleo bruto não move um carro; ele precisa ser refinado.</strong></p>

      <h3>Da coleta bruta à inteligência real</h3>
      <p>Um modelo de Inteligência Artificial ou um painel de decisões empresariais só é tão bom quanto a qualidade dos dados que entram nele. Na ciência da computação, existe um princípio clássico chamado <em>Garbage In, Garbage Out</em> (Lixo entra, Lixo sai).</p>
      <p>Por isso, meu interesse na área de <strong>Dados e IA</strong> passa por entender três pilares fundamentais:</p>
      <ul>
        <li><strong>Integridade e Estruturação:</strong> Como organizar dados para que façam sentido lógico.</li>
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
    resumo: "DevOps não é apenas um cargo ou uma ferramenta: é uma filosofia que une quem constrói o software e quem mantém a infraestrutura funcionando sem dor de cabeça.",
    tags: ["DevOps", "Automação", "Agilidade", "Infraestrutura"],
    conteudo: `
      <p>Ao estudar metodologias ágeis como <strong>Scrum</strong> e <strong>Extreme Programming (XP)</strong>, uma pergunta sempre surge: <em>de que adianta planejar entregas rápidas se, na hora de colocar o sistema no ar, tudo quebra ou demora dias?</em> É exatamente aí que entra a cultura <strong>DevOps e Automação</strong>.</p>

      <h3>A ponte entre Desenvolvimento (Dev) e Operações (Ops)</h3>
      <p>Antigamente, quem criava o programa jogava o pacote "por cima do muro" para a equipe de infraestrutura cuidar. Se desse erro, começava o jogo de empurra. A filosofia DevOps derruba esse muro.</p>
      <ul>
        <li><strong>Automação Inteligente:</strong> Tarefas manuais e repetitivas são fontes constantes de erro humano. Automatizar testes e entregas libera o cérebro humano para o que realmente importa: pensar em soluções criativas.</li>
        <li><strong>Feedback Contínuo:</strong> Saber rapidamente se uma alteração melhorou ou piorou o desempenho do sistema.</li>
        <li><strong>Confiabilidade:</strong> Garantir que o ambiente de estudo ou de produção seja previsível e seguro.</li>
      </ul>

      <h3>Por que estudar isso desde cedo?</h3>
      <p>Entender automação e infraestrutura desde o início da faculdade muda nossa mentalidade. Não queremos apenas sistemas que funcionem "na minha máquina", mas soluções preparadas para o mundo real.</p>
    `
  }
];
