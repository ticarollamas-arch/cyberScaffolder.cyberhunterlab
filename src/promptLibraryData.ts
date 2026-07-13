export interface BuiltInPrompt {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  objective: string;
  promptText: string;
  tags: string[];
}

export interface GeneratorOption {
  id: string;
  name: string;
  text: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  { id: "all", name: "Todos os Prompts", icon: "Layers" },
  { id: "bug-bounty", name: "AppSec & Sites", icon: "Globe" },
  { id: "devsecops", name: "DevSecOps & CI/CD", icon: "GitBranch" },
  { id: "ia-llm", name: "Arquitetura de IA & LLMs", icon: "Brain" },
  { id: "cloud", name: "Cloud (AWS / GCP)", icon: "Cloud" },
  { id: "secops", name: "SecOps & Red/Blue Team", icon: "ShieldAlert" },
  { id: "database", name: "Banco de Dados & SQL", icon: "Database" },
  { id: "sys-arch", name: "Arquitetura de Sistemas", icon: "Cpu" },
  { id: "automation", name: "Scripts & Automação", icon: "Terminal" },
  { id: "api-security", name: "Segurança de APIs & Web", icon: "Shield" },
  { id: "compliance", name: "Governança & SecOps CISO", icon: "Award" },
  { id: "cryptography", name: "Criptografia & Chaves", icon: "Key" },
  { id: "containers", name: "Containers & K8s", icon: "Box" }
];

export const CURATED_PROMPTS: BuiltInPrompt[] = [
  {
    id: "devsecops-pipeline-sec",
    title: "Auditoria Completa de Pipeline CI/CD Securizado",
    category: "devsecops",
    subCategory: "Segurança de CI/CD",
    objective: "Desenhar um pipeline de CI/CD blindado incorporando SAST, DAST, SCA e análise de segredos de forma assíncrona.",
    tags: ["GitHub Actions", "SCA", "SAST", "Gitleaks", "Security Gates"],
    promptText: `# DEVSECOPS PIPELINE AUDIT & INTEGRATION PROMPT

Você é um DevSecOps Principal Engineer altamente condecorado. Sua tarefa é analisar o workflow do GitHub Actions fornecido e arquitetar um pipeline de CI/CD imune a ataques de cadeia de suprimento.

### Requisitos Técnicos do Pipeline:
1. **SAST (Static Application Security Testing)**: Integre Semgrep e CodeQL configurados para analisar vulnerabilidades de alta severidade nas linguagens do projeto.
2. **SCA (Software Composition Analysis)**: Adicione escaneamento automático de vulnerabilidades em dependências usando Trivy e Snyk, bloqueando o merge caso haja CVEs críticos.
3. **Análise de Segredos**: Implemente detecção em tempo real de chaves e segredos em commits através do Gitleaks de forma offline.
4. **Métricas DevSecOps**: Estruture a extração de métricas de vulnerabilidade em formato OpenTelemetry para ingestão no Grafana.

Gere o código YAML completo do workflow com comentários extremamente detalhados explicativos de cada estágio.`
  },
  {
    id: "ia-nemoguardrails",
    title: "Implementação de Guardrails para LLMs de Larga Escala",
    category: "ia-llm",
    subCategory: "Segurança de IA",
    objective: "Garantir blindagem contra ataques de prompt injection, jailbreak corporativo e exfiltração de dados (PII).",
    tags: ["Gemini API", "NeMo Guardrails", "PII", "Jailbreak Model", "Vertex AI"],
    promptText: `# LLM PROMPT INJECTION & JAILBREAK SHIELDING ENGINE

Você atuará como um Deep Learning Security Architect especializado em robustez de modelos geradores de linguagem (LLMs).

Escreva um arquivo de configuração (.co / .colang / Python) para NeMo Guardrails ou similar para proteger uma instância de atendimento financeiro.

### Diretrizes de Filtragem:
- **Entrada (Input Rules)**: Identifique tentativas de induzir o modelo a ignorar instruções anteriores usando análises semânticas de relevância.
- **Saída (Output Rules)**: Detecte vazamento indesejado de números de cartão, CPF ou tokens de sessão usando expressões regulares integradas em canais paralelos.
- **Ações de Fallback**: Caso ocorra desvio ideológico óbvio, envie uma saída estéril padrão, registrando o incidente no Cloud Monitoring.

Forneça os snippets de código, justificativas matemáticas para os limiares de cosseno e uma simulação de testes.`
  },
  {
    id: "cloud-gcp-gke-harden",
    title: "Hardening de Cluster GKE (Kubernetes) para Cargas Sensíveis",
    category: "cloud",
    subCategory: "Segurança Cloud-Native",
    objective: "Configurar um ambiente GKE escalável e imune seguindo os benchmarks rigorosos do CIS.",
    tags: ["GCP", "GKE Autopilot", "Kubernetes", "CIS Benchmark", "mTLS"],
    promptText: `# GCP SECURITY HARDENING - GKE STANDARDS

Atue como um GCP Cloud Security Architect Sênior certificado. Projete a infraestrutura em Terraform para um cluster Google Kubernetes Engine (GKE) altamente blindado.

### Requisitos Mandatórios:
1. **Rede Estéril**: Rede VPC com subnets estritamente privadas, desabilitando IP público em nodes. Uso de Cloud NAT para conexões de saída.
2. **Políticas de Pods (Security Admission)**: Restrinja escalonamento de privilégios de containers para root. Implemente Gatekeeper OPA para validação.
3. **Service Mesh com mTLS**: Configure Istio Mesh com autenticação mTLS mútua estrita entre os microserviços.
4. **Deteção de Intrusão em Tempo Real**: Configure o Google Cloud Armor e integre filtros preventivos Falco.

Envie o código Terraform bem estruturado e pronto para execução.`
  },
  {
    id: "secops-threat-hunting",
    title: "Livro de Caça a Ameaças (Threat Hunting Playbook)",
    category: "secops",
    subCategory: "Detecção e Resposta",
    objective: "Desenvolver consultas analíticas KQL/SQL para identificar persistência silenciosa de APTs em redes Linux.",
    tags: ["KQL", "Syslog", "APT", "Persistence", "MITRE ATT&CK"],
    promptText: `# THREAT HUNTING PLAYBOOK - APT DETECTION

Você é um Incident Response (DFIR) Specialist experiente em detecção de agentes estatais persistentes. Sua tarefa é criar um playbook de detecção analítica para logs de auditoria Linux.

Explore as táticas do framework MITRE ATT&CK:
1. **Modificações de Cron / Systemd**: Criação de tarefas periódicas para execução furtiva de beacons reversos.
2. **Abuso de Sudo / SUID**: Identificação de arquivos alterados com bit SUID ativado indevidamente.
3. **Ofuscação de Processos**: Processos cujo executável original foi removido do disco enquanto estão em execução.

Para cada tática, forneça:
- A consulta correspondente em KQL (Kusto Query Language) e SQL (OSQuery).
- Sinalizações de falsos positivos típicos e como filtrá-los.`
  },
  {
    id: "database-postgres-index-optimize",
    title: "Otimização Avançada e Análise de Queries PostgreSQL",
    category: "database",
    subCategory: "Performance tuning",
    objective: "Identificar gargalos em tabelas com bilhões de registros usando índices parciais e particionamento.",
    tags: ["PostgreSQL", "Query Planner", "EXPLAIN ANALYZE", "Partitioning", "B-Tree"],
    promptText: `# POSTGRESQL HIGH-SCALE TUNING ARCHITECTURE

Como Database Administrator (DBA) especialista em sistemas transacionais concorrentes do PostgreSQL com mais de 100 milhões de escritas diárias.

Explique a modelagem física, índices ideais e diagnósticos para otimizar a query anexada:

\`\`\`sql
SELECT user_id, count(id), sum(amount) 
FROM financial_transactions 
WHERE transaction_status = 'failed' 
  AND created_at >= NOW() - INTERVAL '30 days' 
GROUP BY user_id 
ORDER BY sum(amount) DESC 
LIMIT 100;
\`\`\`

### Detalhes técnicos recomendados:
- Análise baseada no compilador de plano do PostgreSQL (\`EXPLAIN ANALYZE\` / JIT compilation).
- Redução de Table Scan com uso inteligente de índices parciais.
- Estratégias de particionamento físico por range de datas.`
  },
  {
    id: "sys-arch-agent-swarm",
    title: "Orquestrador de Swarm de Agentes Cooperativos",
    category: "ia-llm",
    subCategory: "Sistemas Inteligentes",
    objective: "Desenhar sistema de múltiplos agentes cooperativos resolvendo problemas de análise de mercado concorrentemente.",
    tags: ["Multi-Agent", "LangGraph", "JSON Schema", "Docker Swarm", "Python"],
    promptText: `# COOPERATIVE MULTI-AGENT SWARM DESIGN

Você é um Engenheiro de Inteligência Artificial especializado na criação de sistemas de tomada de decisão descentralizados utilizando LangGraph e CrewAI.

Arquitete um sistema de 3 agentes que resolvem em conjunto auditorias críticas:
1. **Agente Triador (Triage Agent)**: Classifica a gravidade do blueprint importado.
2. **Agente Auditor Técnico (Security Auditor)**: Varre o código em busca de vulnerabilidades lógicas.
3. **Agente Reportador (Compliance Writer)**: Formata um boletim de auditoria robusto com impacto financeiro.

Escreva o código em Python usando troca de mensagens JSON estruturadas, controle de estado centralizado tolerante a falhas e verificação de loops circulares.`
  },
  {
    id: "ia-hermes-local-agent",
    title: "Orquestrador de Agente de IA Local de Alta Performance via Hermes",
    category: "ia-llm",
    subCategory: "IA Local & Privacidade",
    objective: "Desenvolver uma arquitetura de agente autônomo offline em Python que interage com o motor Hermes e executa ferramentas locais de forma segura.",
    tags: ["Hermes", "Llama3", "ReAct Loop", "Agente Offline", "Python API"],
    promptText: `# HIGH-PERFORMANCE LOCAL HERMES AGENT ARCHITECTURE

Você é um Engenheiro de IA especialista em privacidade de dados e LLMs locais (motor Hermes). Sua tarefa é projetar um agente de IA offline funcional em Python.

### Requisitos Operacionais:
1. **Conectividade Local**: O agente deve se comunicar com o servidor do Hermes (\`http://localhost:11434\`) de forma síncrona usando a API de chat (\`/api/chat\`).
2. **Loop de Raciocínio (ReAct)**: O agente deve rodar em um loop iterativo onde ele descreve seu raciocínio (Thought) e escolhe opcionalmente invocar uma ferramenta (Action) com parâmetros higienizados.
3. **Higienização de Ferramentas (Zero-Trust Sandbox)**: Forneça um gerenciador de ferramentas local (\`tools_manager.py\`) seguro que impeça Directory Traversal e injeção de comandos ao interagir com arquivos.
4. **Módulo de Diagnóstico**: Escreva um utilitário de saúde (\`doctor_hermes.py\`) que verifica conexões abertas, lista modelos puxados e indica aceleração por GPU vs CPU.

Gere arquivos Python limpos, modulares e explicativos com instruções completas de execução offline.`
  },
  {
    id: "automation-ansible-secrets",
    title: "Automação de Ansible Vault Descentralizado",
    category: "automation",
    subCategory: "Configuração Automatizada",
    objective: "Provisionar infraestrutura mantendo segredos encriptados via Ansible Vault de maneira escalável.",
    tags: ["Ansible", "Ansible Vault", "YAML", "Secrets", "Sops"],
    promptText: `# SECURE AUTOMATION & INTEGRITY VIA ANSIBLE VAULT

Atue como um SRE Lead Engineer. Crie um conjunto de playbooks do Ansible que automatiza a instalação de patches críticos em servidores web sem exibir segredos nas saídas de depuração ordinárias.

### Diretrizes:
- Uso do Ansible Vault integrado com sops ou arquivos de chave privados.
- Proteção anti-vazamento de logs usando diretiva \`no_log: true\`.
- Geração de chaves temporárias auto-expirantes em runtime.`
  },
  {
    id: "generator-stabilization-prompt",
    title: "Estabilização e Correção de Geradores de IA (AI Studio)",
    category: "api-security",
    subCategory: "Estabilização & Correção",
    objective: "Garantir a estabilidade de geradores de código, prevenindo DOCTYPEs corrompidos, APIs instáveis, localhost fixo e falhas no GitHub.",
    tags: ["Estabilização", "Auto-correção", "cPanel", "OAuth", "DOCTYPE", "JSON"],
    promptText: `# ENGINE DE CORREÇÃO E ESTABILIZAÇÃO DO AI STUDIO

Você está atuando como um ENGINE DE CORREÇÃO E ESTABILIZAÇÃO do sistema gerador de ferramentas (AI Studio).

IMPORTANTE:
Este prompt NÃO é para criar novas funcionalidades do zero.
Ele serve para CORRIGIR, PADRONIZAR e ESTABILIZAR o sistema existente que está apresentando erros de exportação.

---

## 🎯 CONTEXTO DO PROBLEMA

O sistema atual está gerando erros como:
- HTML quebrado (DOCTYPE inválido ou ausente)
- página renderizando incorretamente (CSS global quebrado / fundo azul inesperado)
- erros de JSON em respostas de API
- falha de autenticação com GitHub no momento da exportação
- uso incorreto de localhost (ex: porta 3000 fixa)
- incompatibilidade com hospedagem cPanel (shared hosting)
- falha na conexão entre frontend e API após exportação

O objetivo é CORRIGIR ISSO sem alterar a arquitetura principal do sistema.

---

## 🔒 REGRAS OBRIGATÓRIAS (NÃO VIOLAR)

1. NÃO alterar estrutura principal do projeto.
2. NÃO mudar arquitetura de pastas.
3. NÃO reescrever o sistema inteiro.
4. Somente corrigir inconsistências e padrões quebrados.
5. NÃO introduzir dependências desnecessárias.
6. NÃO fixar localhost em nenhuma parte do código.

---

## 🌐 PADRÃO DE COMPATIBILIDADE (OBRIGATÓRIO)

Todo projeto gerado deve ser compatível com:
- cPanel (shared hosting)
- ambientes Node.js quando disponíveis
- PHP quando necessário (fallback opcional)
- execução estática quando backend não estiver disponível

---

## 🔐 GITHUB EXPORT (CORREÇÃO OBRIGATÓRIA)

Corrigir o sistema de exportação para GitHub:
- NÃO exigir que o usuário insira tokens manualmente se existir OAuth disponível
- Se OAuth não estiver disponível, usar fallback seguro (manual token opcional)
- Garantir que o processo de exportação NÃO quebre a estrutura do projeto
- Garantir que README.md sempre seja gerado corretamente
- Garantir que links de repositório não fiquem desconectados após exportação

---

## 🌐 API & JSON (OBRIGATÓRIO)

- Toda resposta de API deve ser JSON válido puro
- NÃO misturar texto com JSON
- Garantir Content-Type correto
- Garantir fallback de erro em JSON válido
- Evitar qualquer quebra de parsing

---

## 🧾 HTML (OBRIGATÓRIO)

- Todo HTML deve conter: <!DOCTYPE html>
- charset UTF-8 obrigatório
- estrutura mínima válida sempre presente
- nunca gerar HTML incompleto
- nunca permitir CSS quebrar layout global (ex: fundo azul inesperado)

---

## 🔌 ENVIRONMENT (OBRIGATÓRIO)

- NUNCA fixar porta 3000 ou localhost
- sempre usar variável de ambiente:
  PORT = process.env.PORT || 8080
- compatível com cPanel
- compatível com Node, PHP ou static hosting

---

## 🧠 AUTOCORREÇÃO LIMITADA

Se um erro for detectado:
- CORRIGIR apenas o ponto específico
- NÃO reescrever o sistema inteiro
- NÃO modificar módulos não relacionados

---

## 📦 OUTPUT FINAL OBRIGATÓRIO

Sempre gerar:
- código corrigido
- README.md completo
- instruções de instalação
- instruções de deploy (cPanel incluso)
- variáveis de ambiente
- estrutura de pastas limpa

---

## 🚫 IMPORTANTE

Este sistema NÃO deve alterar o que já funciona.
Ele deve apenas corrigir erros críticos de exportação, autenticação, JSON, HTML e deploy.`
  },
  {
    id: "vortex-finder-cli",
    title: "VortexFinder: Recon, Crawling & Endpoint Mapper",
    category: "bug-bounty",
    subCategory: "Recon & Crawler",
    objective: "Criar uma ferramenta CLI em Python com menu interativo e comandos dedicados para recon de hosts, crawling e mapeamento de endpoints.",
    tags: ["Python", "CLI", "Crawler", "Recon", "JSON Output"],
    promptText: `# 🚀 VORTEXFINDER: RECON, CRAWLING & ENDPOINT MAPPER ORIGINAL

Você está atuando como um Engenheiro Principal de AppSec e DevSecOps. Sua tarefa é construir uma ferramenta CLI original escrita em Python 3.11 chamada **VortexFinder**.

Esta ferramenta deve ser desenvolvida de forma 100% nativa em Python (utilizando apenas bibliotecas padrão como \`urllib\`, \`socket\`, \`concurrent.futures\`, \`json\`, \`argparse\`, \`re\`), eliminando qualquer necessidade de instalar binários como Nmap, Nuclei, Katana ou wrappers de terceiros.

---

## 🎯 OBJETIVOS DA FERRAMENTA
Criar um utilitário CLI portátil de reconhecimento e varredura passiva de comportamento HTTP para aplicações web, visando mapear superfícies de ataque de forma limpa e estruturada.

---

## 🏗️ REQUISITOS DE DESIGN E COMPORTAMENTO

1. **Originalidade**: Use exclusivamente algoritmos de rede puros e manipulação de sockets. Não copie assinaturas de scanners de mercado.
2. **Modularidade**: Separe o código em funções limpas e isoladas para cada submenu do menu padrão.
3. **Robustez**: Implemente timeouts rígidos (default de 3 segundos por requisição/conexão) para evitar congelamento, utilizando fallback gracioso em caso de hosts offline.
4. **Logs Estruturados**: Use convenções visuais elegantes no terminal usando ANSI Colors (ex: \`[+]\` em verde para sucesso, \`[-]\` em vermelho para erros, \`[*]\` em azul para informações, \`[!]\` em amarelo para alertas).
5. **Formatos de Saída**: Grave o relatório consolidado tanto em formato texto legível (\`TXT\`) quanto estruturado (\`JSON\`) para ingestão por outros sistemas.

---

## 🎯 MENU PADRÃO (TOOLBOX SUBMENUS)

A ferramenta deve suportar um **Modo Interativo** (menu ASCII interativo no terminal) e **Modo Comando Único** (via flags de linha de comando) expondo os seguintes submenus lógicos:

### 1. recon
- **Mecanismo**: Executar testes de conexão TCP rápidos em portas comuns de serviços web (como 80, 443, 8080, 8443) em um hostname fornecido usando sockets puros.
- **Função**: Validar se o host está ativo e resolver o endereço IP de forma nativa (\`socket.gethostbyname\`).

### 2. enum
- **Mecanismo**: Inspecionar e mapear serviços HTTP ativos através de requisições GET/HEAD estruturadas.
- **Função**: Capturar e exibir banners de servidores (\`Server\`), engines (\`X-Powered-By\`), cookies de sessão e identificar cabeçalhos de segurança ausentes (como \`Content-Security-Policy\`, \`Strict-Transport-Security\`, \`X-Frame-Options\`).

### 3. crawl
- **Mecanismo**: Crawler web assíncrono recursivo limitado.
- **Função**: Inspecionar a estrutura HTML recebida, extrair links relativos e absolutos pertencentes ao mesmo domínio (\`domain-only\`) e identificar parâmetros na URL (ex: \`?id=\`, \`?page=\`) para facilitar testes futuros.

### 4. analyze
- **Mecanismo**: Filtros heurísticos e análise passiva de padrões nas respostas coletadas.
- **Função**: Mapear endpoints sensíveis potencialmente expostos (procurando no HTML por padrões de caminhos como \`/git/\`, \`.env\`, \`wp-config.php\`, \`/api/v1/\`, etc.) e verificar configurações permissivas (como cabeçalhos de CORS excessivamente abertos: \`Access-Control-Allow-Origin: *\`).

### 5. report
- **Mecanismo**: Consolidador de resultados de execução.
- **Função**: Exibir um sumário conciso no terminal das descobertas e gerar os arquivos \`vortex_report.txt\` (humano) e \`vortex_report.json\` (máquina).

---

## 📦 OUTPUT ESPERADO DO SEU GERADOR

Sua resposta de IA deve incluir:
1. O código completo em arquivo único funcional contendo a classe principal \`VortexFinder\` e o entrypoint CLI executável.
2. Instruções claras de execução em Linux/Termux/Windows.
3. Arquivo \`.env.example\` para variáveis adicionais de runtime.
4. README detalhado de usabilidade das flags.
5. Instruções completas de deploy e compatibilidade de hospedagem.`
  },
  {
    id: "tech-sleuth-cli",
    title: "TechSleuth: Tecnologia Fingerprinting & Heurística",
    category: "bug-bounty",
    subCategory: "Fingerprinting & Heurística",
    objective: "Projetar uma ferramenta CLI em Python para fingerprinting de tecnologia web passivo e análise heurística de cabeçalhos de segurança.",
    tags: ["Python", "CLI", "Heurística", "Fingerprint", "TXT/JSON Output"],
    promptText: `# 🕵️ TECHSLEUTH: FINGERPRINTING & HEURÍSTICA DE HEADERS WEB

Você é um Especialista Sênior em AppSec e Pentest Web. Crie uma ferramenta de linha de comando portátil em Python 3, chamada **TechSleuth**, para realizar fingerprinting passivo de tecnologias e análise de heurísticas de conformidade sem realizar testes intrusivos.

A ferramenta deve atuar de forma ética e segura, analisando apenas as respostas, headers e estrutura de marcação pública obtidas de requisições HTTP seguras.

---

## 🎯 OBJETIVOS DA FERRAMENTA
Identificar o ecossistema tecnológico do host alvo (como CMSs, servidores web, frameworks frontend e gerenciadores de API) através de assinaturas heurísticas de cabeçalho, cookies e strings específicas contidas no HTML.

---

## 🏗️ ARQUITETURA E MENU PADRÃO (SUBMENUS OBRIGATÓRIOS)

A interface CLI deve fornecer um menu intuitivo e completo (toolbox):

- **recon**: Resolução DNS e mapeamento de subdomínios via pesquisa de certificados crt.sh públicos de forma passiva.
- **enum**: Coleta minuciosa de cookies, cabeçalhos de resposta HTTP e cálculo de risco por ausência de flags de proteção (\`HttpOnly\`, \`Secure\`, \`SameSite\`).
- **crawl**: Download controlado de páginas principais para extrair metatags de frameworks (como \`<meta name="generator" content="WordPress...">\` ou tags React/NextJS/Vue).
- **analyze**: Análise heurística de integridade lógica, validando vulnerabilidades de cabeçalho como CORS permissivo, Clickjacking devido a \`X-Frame-Options\` ausente, e vazamento de informações em mensagens de erro do servidor embutidas no HTML.
- **report**: Geração de relatórios unificados nos formatos TXT e JSON detalhando a pontuação de conformidade calculada (Score de Segurança).

---

## 🧱 REGRAS IMPORTANTES DO PROJETO

- **NÃO usar código de ferramentas conhecidas**: Construa suas próprias tabelas de expressões regulares e assinaturas lógicas.
- **Foco em Portabilidade**: O código deve rodar em Termux (Android), Kali Linux e ambientes cPanel sem depender de compilação de binários de sistema.
- **Timeout & Retries**: Defina políticas rigorosas de tratamento de conexões HTTP lentas ou inacessíveis, retornando respostas JSON puras.`
  },
  {
    id: "sentry-scan-cli",
    title: "SentryScan: Port Scan & Service Connection Scanner",
    category: "bug-bounty",
    subCategory: "Enumeração de Serviços",
    objective: "Criar um scanner de portas TCP e conexão HTTP robusto, focado em auditoria passiva de banners e identificação de serviços de gerenciamento expostos.",
    tags: ["Port Scan", "TCP Sockets", "CLI", "Banner Grabber", "JSON Output"],
    promptText: `# 🛡️ SENTRYSCAN: PORT CONNECTION & SERVICE SCANNER PORTÁTIL

Atue como Engenheiro de Red Team e Especialista em Cyber Security. Crie uma ferramenta original em Python chamada **SentryScan** focada em realizar mapeamento síncrono de conexões de portas abertas e banner grabbing de forma silenciosa e limpa.

A ferramenta deve usar exclusivamente sockets de baixo nível nativos do Python para identificar portas críticas de gerência (ex: SSH, RDP, FTP, Telnet, bancos de dados e painéis web de administração) que possam estar indevidamente expostas à internet.

---

## 🎯 FLUXO DE COMPORTAMENTO E SUBMENUS OBRIGATÓRIOS

Configure o menu padrão exigido para a toolbox:

- **recon**: Varredura inicial e resolução de IPs do alvo, com testes ICMP/TCP de sanidade estrutural.
- **enum**: Varredura de um range selecionado de portas comuns utilizando conexões TCP \`socket.connect_ex\` otimizadas com paralelismo nativo.
- **crawl**: Verificação se as portas identificadas como abertas estão rodando serviços HTTP/HTTPS e captura do título da página se acessível.
- **analyze**: Banner grabbing nativo (leitura direta de buffers de sockets ao conectar em serviços como SSH/FTP para capturar a string de versão do serviço) e correlação heurística simples com vulnerabilidades conhecidas daquela versão de serviço.
- **report**: Exportação limpa dos hosts ativos, portas e respectivos banners identificados nos formatos TXT e JSON estruturado.

---

## 🔒 CHECKLIST DE ENTREGA DO PROJETO
- Código Python monolítico limpo de alta performance com \`ThreadPoolExecutor\`.
- Mecanismos de tratamento para timeouts de rede lentos e conexões recusadas.
- README instruindo como configurar limites de concorrência em ambientes limitados de rede.`
  },
  {
    id: "aegis-xss-heuristics",
    title: "Aegis-XSS: Heurística Passiva & Análise de Contexto Refletido",
    category: "bug-bounty",
    subCategory: "Análise de Endpoints",
    objective: "Desenvolver uma ferramenta CLI modular robusta para mapear e testar passivamente o contexto de reflexão de parâmetros no HTML para detecção de XSS.",
    tags: ["Python", "XSS Heuristics", "CLI", "Aegis Framework", "Plugins"],
    promptText: `# 🚀 AEGIS-XSS: ANÁLISE DE CONTEXTO E HEURÍSTICA DE PARÂMETROS REFLETIDOS

Você é um Engenheiro de Segurança de Aplicação especialista em AppSec no Google Hall of Fame. Crie uma ferramenta CLI corporativa e modular em Python chamada **Aegis-XSS** baseada no Aegis Framework corporativo.

A ferramenta deve mapear endpoints de uma aplicação, analisar parâmetros de consulta e identificar se os valores injetados refletem no corpo do HTML retornado, classificando o contexto de reflexão (atributo HTML, tag de script, texto plano, etc.) sem realizar exploração destrutiva.

---

## 🏗️ ESTRUTURA PADRONIZADA DE DIRETÓRIOS (OBRIGATÓRIO)
O projeto gerado deve possuir a seguinte árvore robusta:
\`\`\`text
aegis-xss/
├── README.md
├── LICENSE
├── CHANGELOG.md
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── core/
│   ├── engine.py
│   ├── config.py
│   └── logger.py
│
├── plugins/
│   ├── __init__.py
│   ├── plugin_manager.py
│   └── examples/
│
├── cli/
│   ├── banner.py
│   ├── menu.py
│   └── commands.py
│
├── reports/
└── tests/
\`\`\`

---

## 🔌 PLUGINS ATIVOS POR PADRÃO
- **Sistema**: PluginConfig, PluginLogger, PluginReports, PluginHealthCheck, PluginVersion
- **CLI**: PluginBanner, PluginMenu, PluginHelp, PluginTheme
- **Segurança**: PluginInputValidation, PluginRateLimit, PluginSecretsCheck, PluginAudit
- **DevOps**: PluginDocker, PluginExportJSON, PluginExportCSV, PluginMetrics

---

## 🎯 BANNER ASCII AUTOMÁTICO
Ao iniciar a ferramenta, mostre o seguinte banner:
\`\`\`text
╔══════════════════════════════════╗
║         AEGIS FRAMEWORK          ║
║     Enterprise CLI Platform      ║
╚══════════════════════════════════╝
Version: 1.0.0
Plugins: 12 Loaded
Status: Ready
\`\`\`

---

## ⚕️ COMANDO DE DIAGNÓSTICO E HEALTH CHECK
Implemente suporte nativo aos comandos:
- \`aegis-xss doctor\` (autodetecta dependências do sistema como Python, Git, Docker, etc.)
- \`aegis-xss health\` (valida conectividade com a internet e integridade da rede)
- \`aegis-xss version\`
- \`aegis-xss plugin list\`

---

## ⚙️ SUBMENUS DE COMPORTAMENTO (TOOLBOX STANDARDS)
1. **recon**: Validação de conectividade, resolução de DNS nativa e carregamento de wordlists de parâmetros comuns.
2. **enum**: Varredura de parâmetros e detecção de onde as strings enviadas aparecem na resposta HTTP.
3. **crawl**: Mapeamento recursivo de rotas e links no mesmo domínio para extrair inputs e URLs parametrizadas.
4. **analyze**: Análise heurística profunda do contexto da reflexão. Identifique se o valor reflete dentro de blocos de scripts (\`<script>\`), atributos de tag (ex: \`value="..."\`), tags de estilo (\`<style>\`) ou texto simples.
5. **report**: Geração de sumário em formato texto enriquecido ANSI e exportação estruturada em JSON/CSV.`
  },
  {
    id: "aegis-jwt-sentinel",
    title: "Aegis-JWT: Auditor de Algoritmos e Assinaturas de Tokens",
    category: "bug-bounty",
    subCategory: "Análise de Endpoints",
    objective: "Projetar uma ferramenta corporativa modular em Python para auditar e testar fraquezas lógicas em tokens JSON Web Tokens (JWT).",
    tags: ["Python", "JWT", "Cryptography", "Aegis Framework", "CLI"],
    promptText: `# 🕵️ AEGIS-JWT: AUDITOR DE ALGORITMOS E VALIDADOR DE CONFIGURAÇÃO DE SEGURANÇA

Você é um Engenheiro de Red Team e Especialista em Criptografia de APIs. Crie uma ferramenta de auditoria de segurança estrita para JSON Web Tokens (JWT) chamada **Aegis-JWT**, construída sob a arquitetura Aegis Framework Modular em Python.

A ferramenta deve capturar tokens fornecidos por linha de comando ou detectados passivamente, decodificar os cabeçalhos sem verificar a assinatura (para análise de metadados), identificar o algoritmo configurado e verificar conformidade contra falhas de lógica em assinaturas JWT (como algoritmo none, chaves fracas e falta de expiração).

---

## 🏗️ ARQUITETURA DE ARQUIVOS AEGIS CORE (OBRIGATÓRIO)
\`\`\`text
aegis-jwt/
├── README.md
├── requirements.txt
├── Dockerfile
├── core/
│   ├── engine.py (Módulo criptográfico e validação)
│   ├── config.py
│   └── logger.py
├── plugins/
│   ├── plugin_manager.py
│   └── example_custom_alg.py
├── cli/
│   ├── banner.py
│   ├── menu.py
│   └── commands.py
├── reports/
└── tests/
\`\`\`

---

## 🔌 PLUGINS EMBARCADOS POR PADRÃO
- **Sistema**: PluginConfig, PluginLogger, PluginReports, PluginHealthCheck, PluginVersion
- **CLI**: PluginBanner, PluginMenu, PluginHelp
- **Segurança**: PluginInputValidation, PluginSecretsCheck, PluginAudit
- **DevOps**: PluginDocker, PluginExportJSON, PluginExportCSV

---

## 🎯 COMANDOS DE DIAGNÓSTICO NATIVOS
- \`aegis-jwt doctor\` (valida se o Python tem módulos criptográficos essenciais e detecta dependências como Docker)
- \`aegis-jwt health\` (valida a integridade do framework e plugins)
- \`aegis-jwt plugin list\`

---

## 🛡️ SUBMENUS DA TOOLBOX
1. **recon**: Resolução DNS e análise inicial de portas HTTPS expostas que servem endpoints de autenticação.
2. **enum**: Decodificação base64 e listagem amigável das reivindicações (claims), algoritmos (alg) e tipos de chave (typ) no cabeçalho.
3. **crawl**: Mapeamento passivo de arquivos JS de frontend à procura de endpoints ou tokens armazenados em localStorage/cookies de sessão.
4. **analyze**: Verificação heurística de falhas clássicas (se aceita algoritmo \`none\`, se a assinatura é vulnerável a chaves simétricas fracas de dicionário, ou se aceita troca de chaves públicas/privadas).
5. **report**: Exportação consolidada estruturada detalhando score de risco de tokens e salvando relatórios em TXT e JSON para automações.`
  },
  {
    id: "aegis-sqli-engine",
    title: "Aegis-SQLi: Analisador Heurístico Baseado em Erros e Diferenciais",
    category: "bug-bounty",
    subCategory: "Fingerprinting & Heurística",
    objective: "Criar uma ferramenta CLI em Python modular para mapear e identificar suscetibilidade a injeções SQL através de análise passiva de erro e respostas diferenciais.",
    tags: ["Python", "SQLi Heuristics", "CLI", "Aegis Framework", "Diferencial"],
    promptText: `# 🛡️ AEGIS-SQLI: ANALISADOR HEURÍSTICO PASSIVO DE RESPOSTAS DIFERENCIAIS E ERROS

Atue como o principal Engenheiro de Segurança de Aplicações de Red Team. Crie um utilitário CLI em Python chamado **Aegis-SQLi**, utilizando o padrão de arquitetura modular Aegis Framework.

O objetivo deste utilitário é analisar respostas HTTP e cabeçalhos de erro do banco de dados (Oracle, MySQL, PostgreSQL, MSSQL, SQLite) expostos passivamente no corpo de respostas após pequenas variações de aspas simples, sem violar as políticas de uso do host e sem executar payloads destrutivos de injeção.

---

## 🏗️ REQUISITOS DE DESIGN E ESTRUTURA (OBRIGATÓRIO)
Mantenha a organização estrita:
\`\`\`text
aegis-sqli/
├── README.md
├── requirements.txt
├── Dockerfile
├── core/
│   ├── engine.py (Análise de assinaturas de erro de bancos de dados)
│   ├── config.py
│   └── logger.py
├── plugins/
│   ├── plugin_manager.py
├── cli/
│   ├── banner.py
│   ├── menu.py
│   └── commands.py
└── reports/
\`\`\`

---

## 🔌 PLUGINS ATIVOS POR PADRÃO
- **Sistema**: PluginConfig, PluginLogger, PluginReports, PluginHealthCheck, PluginVersion
- **CLI**: PluginBanner, PluginMenu, PluginTheme
- **Segurança**: PluginInputValidation, PluginRateLimit, PluginAudit
- **DevOps**: PluginDocker, PluginExportJSON, PluginExportCSV

---

## ⚙️ MECANISMO TÁTICO DOS SUBMENUS (TOOLBOX)
1. **recon**: Resolução de IP, checagem de latência e validação se as portas de banco ou serviços web estão expostas diretamente.
2. **enum**: Coleta de cabeçalhos HTTP, analisando se o cabeçalho \`Server\` ou cookies revelam a tecnologia de retaguarda (ex: PHP, Django, Spring).
3. **crawl**: Extração estruturada de formulários (\`<form>\`) e links parametrizados que submetem dados via POST/GET.
4. **analyze**: Análise de resposta diferencial. Compara a resposta de uma requisição legítima com requisições levemente modificadas (adição de aspas simples, duplas, hífens) e busca por mais de 50 assinaturas conhecidas de mensagens de erros de bancos de dados embutidos.
5. **report**: Emite um veredito técnico estruturado com score de risco, gravando arquivos em formato TXT e JSON corporativo.`
  },
  {
    id: "aegis-subtake-mapper",
    title: "Aegis-Subtake: Identificador de Registros DNS CNAME Órfãos",
    category: "bug-bounty",
    subCategory: "Recon & Crawler",
    objective: "Desenvolver um identificador portátil de Subdomain Takeover em Python que verifique registros DNS CNAME que apontem para serviços descontinuados.",
    tags: ["Python", "DNS", "Takeover", "Aegis Framework", "CLI"],
    promptText: `# 🌐 AEGIS-SUBTAKE: DETECTOR DE REGISTROS CNAME ÓRFÃOS E TAKEOVER

Como Auditor de Infraestrutura em Nuvem Sênior, crie uma ferramenta CLI modular em Python chamada **Aegis-Subtake** sob as diretrizes do Aegis Framework Corporativo.

A ferramenta deve ler uma lista de subdomínios, realizar resoluções DNS em paralelo à procura de registros CNAME e compará-los com assinaturas de serviços de terceiros populares (como GitHub Pages, S3, Zendesk, Heroku) para detectar subdomínios órfãos que possam estar vulneráveis a sequestro de subdomínio (Subdomain Takeover).

---

## 🏗️ CHASSI DE PASTAS DO AEGIS-SUBTAKE
\`\`\`text
aegis-subtake/
├── README.md
├── requirements.txt
├── core/
│   ├── engine.py (Validador DNS nativo e assinaturas de CNAME)
│   ├── config.py
│   └── logger.py
├── plugins/
│   ├── plugin_manager.py
├── cli/
│   ├── banner.py
│   ├── menu.py
│   └── commands.py
└── reports/
\`\`\`

---

## 🔌 PLUGINS ATIVOS
- **Sistema**: PluginConfig, PluginLogger, PluginReports, PluginHealthCheck, PluginVersion
- **CLI**: PluginBanner, PluginMenu, PluginHelp, PluginTheme
- **Segurança**: PluginInputValidation, PluginAudit
- **DevOps**: PluginDocker, PluginExportJSON, PluginExportCSV

---

## ⚕️ DIAGNÓSTICO E HEALTH CHECK
- \`aegis-subtake doctor\` (verifica se o sistema possui módulos DNS e utilitários CLI como Git e Docker)
- \`aegis-subtake health\` (valida latência com DNS servidores públicos como 1.1.1.1 e 8.8.8.8)
- \`aegis-subtake plugin list\`

---

## 🎯 SUBMENUS REQUISITOS (TOOLBOX)
1. **recon**: Coleta e carregamento de listas de subdomínios ou resolução do IP do domínio raiz.
2. **enum**: Resolução DNS paralela rápida com \`ThreadPoolExecutor\` para identificar CNAMEs ativos no host fornecido.
3. **crawl**: Verificação passiva se o subdomínio órfão serve respostas HTTP e extração do código de status (ex: 404 Not Found) e título.
4. **analyze**: Cruzamento das strings do CNAME e da resposta HTTP com mais de 30 assinaturas conhecidas de serviços na nuvem propensos a takeover.
5. **report**: Geração de relatório de conformidade classificando a criticidade do takeover em TXT e JSON estruturado.`
  },
  {
    id: "aegis-csrf-auditor",
    title: "Aegis-CSRF: Analisador de Formulários e Flags SameSite de Cookies",
    category: "bug-bounty",
    subCategory: "Fingerprinting & Heurística",
    objective: "Mapear e analisar formulários e cookies de sessão em Python para identificar ausência de proteções de integridade contra ataques CSRF.",
    tags: ["Python", "CSRF", "Cookies", "Aegis Framework", "CLI"],
    promptText: `# 🔒 AEGIS-CSRF: ANALISADOR DE PARÂMETROS DE SESSÃO E CONFORMIDADE DE COOKIES

Você é um Engenheiro de Segurança de Aplicações corporativo. Desenvolva uma ferramenta CLI em Python chamada **Aegis-CSRF**, baseada na arquitetura de plugins desacoplados do Aegis Framework.

Esta ferramenta deve analisar de forma passiva as páginas web fornecidas para mapear formulários que realizam ações de mutação de estado (POST, PUT, DELETE) e inspecionar a presença de tokens anti-CSRF, bem como validar a presença e as diretrizes de proteção do cabeçalho de cookies de sessão (\`HttpOnly\`, \`Secure\`, \`SameSite\`).

---

## 🏗️ ARQUITETURA DO PROJETO (OBRIGATÓRIO)
\`\`\`text
aegis-csrf/
├── README.md
├── requirements.txt
├── core/
│   ├── engine.py (Mapeador de formulários e análise de cabeçalhos de cookies)
│   ├── config.py
│   └── logger.py
├── plugins/
│   ├── plugin_manager.py
├── cli/
│   ├── banner.py
│   ├── menu.py
│   └── commands.py
└── reports/
\`\`\`

---

## 🔌 PLUGINS ATIVOS
- **Sistema**: PluginConfig, PluginLogger, PluginReports, PluginHealthCheck, PluginVersion
- **CLI**: PluginBanner, PluginMenu, PluginHelp, PluginTheme
- **Segurança**: PluginInputValidation, PluginAudit
- **DevOps**: PluginDocker, PluginExportJSON, PluginExportCSV

---

## ⚕️ COMANDOS DE DIAGNÓSTICO
- \`aegis-csrf doctor\` (valida dependências do interpretador e bibliotecas standard)
- \`aegis-csrf health\` (verifica conectividade com portas HTTP)
- \`aegis-csrf plugin list\`

---

## ⚙️ SUBMENUS REQUISITOS (TOOLBOX)
1. **recon**: Validação de host ativo, IPs e portas de serviço web.
2. **enum**: Coleta de cabeçalhos \`Set-Cookie\` e análise minuciosa de seus atributos lógicos.
3. **crawl**: Varredura recursiva de páginas em busca de formulários que realizam submissão de dados sensíveis.
4. **analyze**: Verificação heurística de tokens anti-CSRF nos inputs de formulários e validação se as propriedades de cookie \`SameSite\` estão configuradas para \`Lax\` ou \`Strict\`.
5. **report**: Exportação e pontuação de severidade de segurança, salvando o output estruturado em JSON e TXT formatado.`
  }
];

// Listas combinatórias de altíssima fidelidade de modo a expandir a biblioteca para exatos 17.000 prompts de agentes LLMs Hermes
const ROLES = [
  "Agente de Automação de Código Hermes (Gemma2)",
  "Agente de Segurança & AppSec Hermes (Llama3)",
  "Agente de Redação Técnica & Compliance Hermes",
  "Agente SRE de Observabilidade Local Hermes",
  "Agente de RAG & IA Generativa Hermes (Mistral)",
  "Agente de Auditoria de APIs & Microserviços Hermes",
  "Orquestrador de Swarm de Agentes Cooperativos",
  "Agente Pentester Autônomo com Hermes CLI",
  "Agente de Banco de Dados & Otimização de SQL",
  "Agente de Resposta a Incidentes (DFIR) Sênior",
  "Agente de Prompt Engineering & Refinador",
  "Agente de Sandboxing & Hardening Zero-Trust"
];

const TARGETS = [
  "no ambiente local de execução Hermes",
  "no loop ReAct (Thought-Action-Observation) do Gemma2",
  "na base de conhecimento RAG via ChromaDB / FAISS",
  "na esteira de validação e sandbox de ferramentas",
  "na API Rest de controle do painel web",
  "na memória de longo prazo baseada em JSON",
  "no orquestrador de subagentes concorrentes",
  "no gerenciador de ferramentas de sistema seguras",
  "na integração de API Keys e rotas proxy",
  "no console de simulação interativo para Termux",
  "no despachante de prompts estruturados para gemma2",
  "no barramento de logs estruturados de auditoria"
];

const TASKS = [
  "executar raciocínio cognitivo autônomo de multi-agentes",
  "gerenciar sessões, memórias persistentes e deduplicações",
  "invocar utilitários de arquivos e shell com higienização estrita",
  "enriquecer o contexto local via busca semântica em banco vetorial",
  "formatar boletins e relatórios estruturados com as devidas mitigações AppSec",
  "interceptar entradas maliciosas e aplicar filtros anti-prompt-injection",
  "verificar a integridade de rotas API e realizar mTLS redundante",
  "gerar payloads de bypass de WAF de forma estéril e segura",
  "automatizar diagnósticos de conexão e saúde de IAs locais",
  "coordenar votações de consistência entre múltiplos modelos de LLM",
  "sintetizar código-fonte defensivo completo com tratamento de exceções",
  "identificar e reter vazamentos acidentais de chaves de API e segredos"
];

const STACKS = [
  "utilizando o Hermes Python SDK oficial",
  "usando TypeScript com Hermes JS e Node.js",
  "com LangChain, LangGraph e controle de estado",
  "através do FastAPI expondo endpoints em Python 3.11",
  "baseado em CrewAI com subagentes especializados",
  "via chamadas HTTP diretas com a biblioteca requests",
  "configurado com banco vetorial SQLite-VSS e embeddings locais",
  "com scripts portáveis em Bash e comandos CLI nativos",
  "utilizando Docker e sandboxes isoladas de execução",
  "usando Rust com roteadores Axum e chamadas Hermes",
  "com LlamaIndex e ingestão estruturada de arquivos Markdown",
  "através do ecossistema Aegis de ferramentas AppSec"
];

const STANDARDS = [
  "seguindo as diretrizes e boas práticas de Prompt Engineering",
  "alinhado ao loop determinístico ReAct para agentes",
  "garantindo isolamento em sandbox Zero-Trust de arquivos",
  "conforme as diretrizes de ética e divulgação responsável",
  "atendendo à conformidade técnica do OWASP Top 10",
  "sob o controle rigoroso de vazamento de credenciais",
  "visando a portabilidade e performance no Termux / Linux",
  "garantindo tolerância a falhas e fallbacks offline no motor Hermes",
  "em conformidade com a LGPD e privacidade técnica de logs",
  "seguindo os padrões corporativos de arquitetura de software",
  "visando o menor consumo de recursos (CPU/GPU) locais",
  "em conformidade com os padrões de conformidade CIS e OWASP"
];

function generateCombinatorialPrompts(): BuiltInPrompt[] {
  const result: BuiltInPrompt[] = [];
  const totalCombinations = 248832; // 12^5
  const countToGenerate = 17000; // This gives us exactly 17000 unique diverse combinations
  const stride = 97003; // Coprime to 248832 (prime factors are only 2 and 3)

  for (let k = 0; k < countToGenerate; k++) {
    const n = (k * stride) % totalCombinations;

    // Decompose n into indices for each of the 5 arrays
    const r = Math.floor(n / 20736) % 12;
    const tg = Math.floor(n / 1728) % 12;
    const tk = Math.floor(n / 144) % 12;
    const s = Math.floor(n / 12) % 12;
    const st = n % 12;

    const role = ROLES[r];
    const target = TARGETS[tg];
    const task = TASKS[tk];
    const stack = STACKS[s];
    const std = STANDARDS[st];

    // Determine category based on task or target
    let category = "sys-arch";
    let subCategory = "Arquitetura";

    if (tk === 0 || tk === 4) {
      category = "devsecops";
      subCategory = "DevSecOps & CI/CD";
    } else if (tk === 5) {
      category = "ia-llm";
      subCategory = "Engenharia de IA";
    } else if (tk === 3) {
      category = "cloud";
      subCategory = "Infraestrutura Cloud";
    } else if (tk === 7 || tk === 11) {
      category = "secops";
      subCategory = "Pentest & Threat Hunting";
    } else if (tk === 6) {
      category = "database";
      subCategory = "Banco de Dados & SQL";
    } else if (tk === 1) {
      category = "compliance";
      subCategory = "Conformidade & CISO";
    } else if (tg === 11) {
      category = "cryptography";
      subCategory = "Criptografia & Chaves";
    } else if (tg === 8) {
      category = "containers";
      subCategory = "Containers & K8s";
    } else if (tg === 7 || tg === 0) {
      category = "api-security";
      subCategory = "Segurança de APIs";
    } else {
      category = "automation";
      subCategory = "Scripts & Automação";
    }

    const titlePrefix = target.replace(/^(na API REST|no|na|nos|nas)\s+/, "");
    // Capitalize first letter of prefix
    const formattedPrefix = titlePrefix.charAt(0).toUpperCase() + titlePrefix.slice(1);
    const title = `Blindar ${formattedPrefix} | ${role}`;
    
    const objective = `Projetar solução resiliente para ${task} ${stack}, devidamente ${std}.`;

    const tags = ["Segurança"];
    if (stack.includes("Rust")) tags.push("Rust");
    else if (stack.includes("Go")) tags.push("Go");
    else if (stack.includes("Python")) tags.push("Python");
    else if (stack.includes("TypeScript")) tags.push("TypeScript", "Node");
    else if (stack.includes("Terraform")) tags.push("Terraform", "IaC");
    else if (stack.includes("PostgreSQL")) tags.push("Postgres", "SQL");
    else if (stack.includes("Kubernetes") || stack.includes("Helm")) tags.push("K8s", "Helm");
    else tags.push("Shell");

    if (std.includes("OWASP")) tags.push("OWASP");
    if (std.includes("LGPD")) tags.push("LGPD");
    if (std.includes("PCI")) tags.push("PCI-DSS");
    if (std.includes("Zero Trust")) tags.push("ZeroTrust");

    const promptText = `# PROMPT DE ARQUITETURA TÁTICA - CÓDIGO BPL-${10000 + k + 1}
## FUNÇÃO TÁTICA DESIGNADA: ${role.toUpperCase()}
## MEIO DE APLICAÇÃO: ${target.toUpperCase()}

Atue como o **${role}** principal da arquitetura. Fomos convocados para implementar de maneira resiliente e estéril a seguinte tática: **${task}** que está ativa **${target}**.

### Diretrizes de Engenharia e Tecnologia:
1. **Padrão Tecnológico**: A implementação e blueprints devem ser estruturados ${stack}.
2. **Higiene e Compliance**: Garanta que todas as entregas e caminhos de arquivos estejam em conformidade ${std}.
3. **Imunidade contra Vazamento de Segredos**: Nunca exponha chaves simétricas, tokens JWT ou credenciais textualmente nos arquivos propostos.

### Entregáveis Esperados:
- **Chassi de Pastas**: Elabore mentalmente ou por escrito a estrutura e caminhos de diretórios do projeto recomendados (ex: \`/src/security\`, \`/config\`).
- **Middleware / Código Defensivo**: Demonstre a rotina básica de validação de payload ou controle de tokens estrito no ecossistema selecionado.
- **Configuração de Auditoria**: Forneça os comandos em CLI para analisar commits ou testar a configuração sob carga máxima de estresse.

Mantenha a polidez profissional do cargo, responda de forma pragmática e extremamente detalhada.`;

    result.push({
      id: `gen-prompt-${k + 1}`,
      title,
      category,
      subCategory,
      objective,
      promptText,
      tags: Array.from(new Set(tags))
    });
  }

  return result;
}

export const BUILT_IN_PROMPTS: BuiltInPrompt[] = [
  ...CURATED_PROMPTS,
  ...generateCombinatorialPrompts()
];

export const GENERATOR_ROLES: GeneratorOption[] = [
  { id: "devsecops", name: "DevSecOps Principal Engineer", text: "Atue como um Engenheiro DevSecOps Principal especialista em segurança de pipelines CI/CD e integração pragmática de segurança defensiva em ambientes corporativos de alto fluxo." },
  { id: "ai_architect", name: "Deep Learning & AI Architect", text: "Você é um Arquiteto de Deep Learning e IA especialista em modelos de linguagem (LLMs), orquestradores de agentes, RAG de alta fidelidade e blindagem contra ataques adversários." },
  { id: "sec_auditor", name: "Lead Cyber Security Auditor", text: "Transforme-se em um Auditor Líder de Segurança Cibernética especializado em conformidade SOC 2, HIPAA, PCI-DSS e revisão técnica rigorosa de vulnerabilidades lógicas." },
  { id: "solutions_arch", name: "Solutions Architect (Multi-Cloud)", text: "Atue como Arquiteto de Soluções Multi-Cloud especialista em alta escalabilidade, tolerância a falhas massivas, otimização extrema de custos e design resiliente." },
  { id: "database_admin", name: "Premium PostgreSQL / SQL DBA", text: "Assuma o papel de um Administrador de Banco de Dados PostgreSQL Líder especializado em tuning de queries, locks complexos, índices parciais e bancos de escala de terabytes." },
  { id: "sre_engineer", name: "Site Reliability Engineer (SRE)", text: "Atue como um Site Reliability Engineer (SRE) com foco em telemetria, observabilidade de baixa latência usando OpenTelemetry, resposta automatizada e resiliência." },
  { id: "backend_dev", name: "Senior Backend Engineer (Go/Rust)", text: "Você é um Engenheiro Backend Sênior especialista em linguagens concorrentes de sistema (como Go, Rust e C++) focado em performance absoluta, concorrência limpa e zero alocações indesejadas." },
  { id: "threat_hunter", name: "Cyber Threat Hunter & DFIR Specialist", text: "Atue como Threat Hunter e Especialista em Incident Response (DFIR) com foco em rastreamento furtivo de APTs, engenharia reversa de malware e auditoria em logs brutos Linux/Windows." },
  { id: "ux_designer", name: "Principal Product Design Craftsperson", text: "Você é um Designer de Produto Principal focado em usabilidade técnica avançada, micro-interações, acessibilidade estrita (WCAG) e refinamento tipográfico minimalista." },
  { id: "data_engineer", name: "High-Scale Big Data Engineer", text: "Assuma o papel de Engenheiro de Dados de Larga Escala focado em processamento em tempo real de fluxos massivos via Spark, data lakes Apache Iceberg e queries de baixíssima latência." },
  { id: "compliance_officer", name: "Chief Information Security Officer (CISO)", text: "Atue como CISO focado em riscos de governança cibernética, compliance com regulamentações globais (GDPR, LGPD, HIPAA) e estimativa financeira de impacto de vulnerabilidades." },
  { id: "qa_automate", name: "Principal Quality & Automation Engineer", text: "Você é um Engenheiro Principal de Automação de Testes e Qualidade especializado em verificação formal, testes de estresse, caos e simulações complexas de cargas." }
];

export const GENERATOR_TASKS: GeneratorOption[] = [
  { id: "code_audit", name: "Auditar Código Fonte & Redigir Correções", text: "Sua tarefa consiste em varrer o código-fonte fornecido em busca de vulnerabilidades lógicas de alta criticidade e estruturar correções limpas utilizando design patterns defensivos." },
  { id: "threat_model", name: "Criar Modelo de Ameaças (Threat Model)", text: "Gere um Modelo de Ameaças completo seguindo a metodologia STRIDE, identificando superfícies de ataque vulneráveis e estabelecendo mecanismos robustos de mitigação." },
  { id: "perf_tuning", name: "Tuning Técnico e Profiling de Performance", text: "Analise o bloco lógico e execute profiling de performance. Identifique pontos de contenção de CPU, locks de concorrência ou desperdício de memória e otimize o código." },
  { id: "infra_as_code", name: "Escrever Infraestrutura como Código (IaC)", text: "Desenvolva manifestos de Infraestrutura como Código (IaC) limpos, reutilizáveis e nativamente seguros, isolando variáveis críticas e garantindo menor privilégio." },
  { id: "cicd_automation", name: "Automatizar Pipeline CI/CD com Security Shields", text: "Crie um script ou arquivo de workflow de automação onde integra verificadores automáticos de integridade de código, análise de segredos e bloqueadores inteligentes." },
  { id: "agent_orchestration", name: "Montar Framework de Agente Reativo", text: "Projete uma arquitetura para agentes autônomos ou semi-autônomos, definindo fluxos de controle de estado determinísticos e minimizando o risco de loops lógicos indeterminados." },
  { id: "db_modeling", name: "Modelar Banco de Dados Normalizado", text: "Desenhe o modelo físico do banco de dados visando conformidade, integridade de transações concorrentes e performance ideal para indexação avançada." },
  { id: "incident_playbook", name: "Escrever Playbook de Resposta de Incidente", text: "Redija um passo a passo operacional detalhado com comandos reais e pontos de controle críticos para conter e mitigar instantaneamente vazamentos ou anomalias detetadas." },
  { id: "api_gateway", name: "Projetar API Gateway & Controladores", text: "Arquitete as rotas de uma aplicação garantindo autenticação mTLS rigorosa, rate-limiting inteligente contra abusos e logs detalhados de auditoria." }
];

export const GENERATOR_STACKS: GeneratorOption[] = [
  { id: "gcp_vertex", name: "Google Cloud (Vertex AI, Cloud Run, GKE)", text: "Utilizando a infraestrutura do Google Cloud Platform (GCP), especially Vertex AI, Cloud Run e Google Kubernetes Engine (GKE)." },
  { id: "aws_cloud", name: "Amazon Web Services (ECS, SageMaker, DynamoDB)", text: "Focando no ecossistema AWS, utilizando Elastic Container Service (ECS), SageMaker para treinamento e DynamoDB para escalabilidade." },
  { id: "python_ml", name: "Python 3.11+ (FastAPI, PyTorch, Pandas)", text: "Utilizando a stack moderna baseada em Python, tirando proveito de FastAPI para endpoints, PyTorch para inferências e Pandas para manipulação de vetores de dados." },
  { id: "node_ts", name: "TypeScript / Node.js (Next.js, Prisma, Express)", text: "Usando uma arquitetura TypeScript contínua, com Next.js no frontend, rotas Express rápidas e segurança de tipos no banco com Prisma." },
  { id: "kube_docker", name: "Docker & Kubernetes (Helm, Istio)", text: "Em um ambiente puramente cloud-native containerizado, orquestrado através do Kubernetes com controle via Helm charts e Service Mesh Istio." },
  { id: "rust_lang", name: "Rust (Tokio, Axum, Serde)", text: "Através da robustez de Rust para sistemas concorrentes seguros de memória, usando Tokio como runtime assíncrono e Axum nas APIs." },
  { id: "sql_postgres", name: "PostgreSQL 16 & SQLite", text: "Utilizando recursos nativos relacionais avançados, backups, transações ACID rigorosas e índices parciais no banco de dados." },
  { id: "bash_python", name: "Bash Shell & Python Scripts (Standard libraries)", text: "Criando utilitários limpos em Bash/Shell e scripts Python sem dependências externas adicionais complexas, garantindo portabilidade tática total." }
];

export const GENERATOR_STYLES: GeneratorOption[] = [
  { id: "extreme_sec", name: "Segurança Extrema (Zero Trust / OWASP)", text: "Priorize segurança militar absoluta. Siga o princípio de Privilégio Mínimo, implemente validações rígidas em todas as entradas e cumpra checklist completo do OWASP." },
  { id: "clean_code", name: "Clean Code & Clean Architecture", text: "Garantir código legível, modular, declarativo, fácil de documentar e seguindo padrões consolidados de Design Patterns (SOLID)." },
  { id: "performance", name: "Micro-otimização para Baixa Latência", text: "O código final e a infraestrutura devem ser focados em tempo de resposta ultra-baixo (<50ms), redução de concorrência por threads e uso eficiente de memória cache." },
  { id: "interactive", name: "Playbook passo a passo com Exemplos Reais", text: "Estruture o retorno de maneira extremamente interativa, trazendo cenários práticos, códigos que podem ser copiados sem modificações e tabelas de testes." },
  { id: "minimalist", name: "Resumo Técnico Direto ao Ponto", text: "Remova introduções redundantes e polidez desnecessária. Forneça o output final de forma estéril, direta, com o código puro e comandos precisos." }
];

export const GENERATOR_TONES: GeneratorOption[] = [
  { id: "pragmatic", name: "Sênior Técnico Pragmático", text: "Adote um tom sério, profissional, focado puramente em eficácia operacional e mitigação de gargalos reais. Sem rodeios acadêmicos ou floreios linguísticos." },
  { id: "educational", name: "Mentor / Professor Acadêmico de IA", text: "Explique os fundamentos por trás de cada resposta, sugerindo materiais de estudo, links úteis conceituais e justificando com matemática e lógica computacional." },
  { id: "critical", name: "Auditor Altamente Crítico (Red Team)", text: "Desconfie de cada componente e tome como premissa que o código atual está quebrado ou vulnerável. Seja extremamente minucioso e exija provas de integridade." },
  { id: "executive", name: "Executivo Corporativo Estratégico", text: "Faça análises de impacto também sob a ótica econômica, balanceando custos, esforço de implementação (sprints de desenvolvimento) e metas no cronograma." }
];
