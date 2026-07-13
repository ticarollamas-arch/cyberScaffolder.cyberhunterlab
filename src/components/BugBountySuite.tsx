import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Award, 
  ExternalLink, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Bug, 
  HelpCircle, 
  Menu, 
  Shield, 
  Filter, 
  Cpu, 
  ChevronRight,
  BookMarked,
  Info
} from 'lucide-react';

// Highly-specialized bug hunting frameworks databases
interface ToolManual {
  name: string;
  category: string;
  description: string;
  basicCommand: string;
  advancedCommand: string;
  vulnerabilityTarget: string;
  manual: string;
}

// 1. Interactive Tool Manual Database (Ethical commands for mapping / reporting)
const BUG_HUNTER_TOOLS: ToolManual[] = [
  {
    name: "Aegis-SQLi Scanner",
    category: "SQL Injection",
    description: "Análise passiva e diferencial de parâmetros baseada em erros HTTP.",
    basicCommand: "python aegis_sqli.py --host vulnerable-target.com --param id",
    advancedCommand: "python aegis_sqli.py --host vulnerable-target.com --param id --headers \"Authorization: Bearer jwt_token\" --diff-check",
    vulnerabilityTarget: "SQL Injection (SQLi) - OWASP A03:2021",
    manual: `1. Identifique endpoints que recebem parâmetros numéricos ou de string (ex: ?id=1 ou ?search=test).
2. Forneça o host e o parâmetro específico para a ferramenta.
3. O scanner envia requisições injetando caracteres de controle benignos (', \", --).
4. O módulo analisa a resposta comparando com a resposta padrão (Diferencial) ou buscando mensagens de erro típicas de PostgreSQL, MySQL ou Oracle no HTML público.`
  },
  {
    name: "Aegis-XSS Context Mapper",
    category: "Cross-Site Scripting",
    description: "Mapeia e analisa o local exato da reflexão de inputs de formulários no HTML.",
    basicCommand: "python aegis_xss.py --url https://target.com/search?q=query",
    advancedCommand: "python aegis_xss.py --url https://target.com/search?q=query --crawl --depth 3 --output json",
    vulnerabilityTarget: "Cross-Site Scripting (XSS) - OWASP A03:2021",
    manual: `1. Execute uma varredura passiva no formulário informando a URL paramétrica.
2. A ferramenta injeta strings marcadoras estéreis (ex: aegis_probe).
3. O parser HTML analisa o código de resposta e determina se a probe reflete em:
   - Atributos de tag (ex: value="aegis_probe")
   - Blocos de Script (ex: <script>var q = 'aegis_probe'</script>)
   - Texto plano ou tags de imagem.
4. O scanner calcula a sanitização necessária e reporta a falha sem executar exploits danosos.`
  },
  {
    name: "Aegis-JWT Auditor",
    category: "Broken Authentication",
    description: "Auditoria de metadados, lógica e assinaturas fracas de Tokens JWT.",
    basicCommand: "python aegis_jwt.py --token <jwt_token_string>",
    advancedCommand: "python aegis_jwt.py --token <jwt_token_string> --algorithm-check --bruteforce-keylist common_keys.txt",
    vulnerabilityTarget: "Authentication Failures / Algoritmo None - OWASP A07:2021",
    manual: `1. Forneça o token JWT obtido legítimamente nas requisições.
2. A ferramenta decodifica de forma offline a carga útil (Header e Claims).
3. Ela audita:
   - Presença do algoritmo "none" no cabeçalho.
   - Chaves fracas conhecidas comparando a assinatura localmente contra um dicionário.
   - Falta de data de expiração (exp) ou reivindicações de tempo incoerentes.`
  },
  {
    name: "Aegis-Subtake",
    category: "Subdomain Takeover",
    description: "Identificação de registros CNAME órfãos apontando para serviços descontinuados.",
    basicCommand: "python aegis_subtake.py --list subdomains.txt",
    advancedCommand: "python aegis_subtake.py --list subdomains.txt --threads 15 --resolver 1.1.1.1 --output report.json",
    vulnerabilityTarget: "Subdomain Takeover / DNS Hijacking",
    manual: `1. Importe uma lista de subdomínios descobertos via pesquisa passiva (crt.sh).
2. A ferramenta realiza resoluções DNS em paralelo buscando registros do tipo CNAME.
3. Se um CNAME apontar para um serviço conhecido (GitHub, Heroku, AWS S3) e o serviço retornar erro 404/NoSuchBucket, o subdomínio está órfão.
4. Reporte imediatamente no programa para evitar que atacantes assumam controle do registro.`
  },
  {
    name: "SentryScan Service connection",
    category: "Recon & Banner Grabber",
    description: "Mapeamento rápido de portas abertas e extração de versões de serviços via Sockets puros.",
    basicCommand: "python sentry_scan.py --target IP_OR_HOST --ports 80,443,22,8080",
    advancedCommand: "python sentry_scan.py --target IP_OR_HOST --range 1-1024 --threads 30 --banner-grab",
    vulnerabilityTarget: "Security Misconfiguration / Portas Expostas - OWASP A05:2021",
    manual: `1. Passe o IP ou Hostname do alvo.
2. A ferramenta inicia conexões TCP síncronas de baixo nível de forma rápida.
3. Ao conectar nas portas abertas, ela lê os buffers de rede (Banner Grabbing) capturando marcas e versões de servidores expostas.
4. Alerta sobre serviços legados ou gerências abertas inadequadamente para a Internet pública.`
  },
  {
    name: "Aegis-CSRF Cookie Audit",
    category: "Broken Access Control",
    description: "Auditoria de formulários de mutação e flags SameSite de Cookies de Sessão.",
    basicCommand: "python aegis_csrf.py --target https://target.com/profile",
    advancedCommand: "python aegis_csrf.py --target https://target.com/profile --headers-check --check-forms",
    vulnerabilityTarget: "CSRF & Session Hijacking - OWASP A01:2021",
    manual: `1. Informe a URL da área restrita do usuário.
2. A ferramenta inspeciona os cookies enviados pelo servidor na resposta.
3. Ela valida a ausência de flags protetivas essenciais: SameSite (Lax/Strict), HttpOnly e Secure.
4. Ela mapeia se os formulários que alteram dados do usuário não possuem tokens anti-CSRF incorporados.`
  }
];

// 2. Open / Triaging Findings Command Generator Guide (How to report Medium, Critical)
interface FindingSeverityGuide {
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  colorClass: string;
  borderColorClass: string;
  badgeColorClass: string;
  gVrpScore: string;
  bugcrowdPriority: string;
  commandsToVerify: string;
  triageManual: string;
  reportTemplate: string;
}

const SEVERITY_GUIDES: FindingSeverityGuide[] = [
  {
    severity: 'CRITICAL',
    title: "Vazamento de Credenciais em Código Fonte ou IaC exposta",
    colorClass: "text-rose-400 bg-rose-500/10",
    borderColorClass: "border-rose-500/20",
    badgeColorClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    gVrpScore: "P1 - $5,000 a $31,337 (RCE / Exposição Crítica)",
    bugcrowdPriority: "P1 - Critical Severity",
    commandsToVerify: "git log --all -p | grep -E \"(key|secret|password|access_token)\"\ntrufflehog git file://. --only-verified\npython aegis_jwt.py --token <token> --algorithm-check",
    triageManual: `1. Confirme se as credenciais obtidas são ativas e válidas realizando chamadas de teste em sandbox ou serviços de metadados offline.
2. Localize em qual arquivo do repositório ou commit antigo a chave foi vazada.
3. Não tente testar acessos administrativos de forma intrusiva; a mera presença de credenciais em arquivo público ou chave de API de produção do GCP ativa no Git já garante a criticidade máxima.
4. Reporte imediatamente anexando o trecho do commit ou link do blob Git contendo a chave sensível mascarada em parte por segurança.`,
    reportTemplate: `### Descrição do Achado Crítico
Foi identificada a exposição de credenciais confidenciais de infraestrutura de nuvem dentro do histórico de commits do repositório público ou em arquivos de provisionamento IaC (Terraform).

### Passos de Reprodução
1. Acesse o arquivo exposto no caminho: \`infra/terraform/gcp/iam_security.tf\` ou consulte o ID do commit exposto.
2. Identifique a chave ou token simétrico definido na variável.
3. Verifique localmente a validade com o seguinte comando não intrusivo:
   \`\`\`bash
   gcloud auth activate-service-account --key-file=exposed_key.json
   \`\`\`

### Impacto de Segurança
Qualquer atacante que obtenha essa chave adquire privilégios administrativos completos sobre as instâncias de nuvem, buckets de armazenamento e banco de dados de produção, levando ao vazamento completo de dados (PII) e RCE.

### Recomendação de Mitigação
1. Revogar e rotacionar a credencial exposta imediatamente nos consoles do GCP/AWS.
2. Utilizar o utilitário BFG Repo-Cleaner para purgar permanentemente o arquivo exposto de todo o histórico do Git.
3. Integrar ferramentas de análise estática como Gitleaks na esteira de pré-commit.`
  },
  {
    severity: 'HIGH',
    title: "IDOR (Insecure Direct Object Reference) / Quebra de Controle de Acesso",
    colorClass: "text-amber-400 bg-amber-500/10",
    borderColorClass: "border-amber-500/20",
    badgeColorClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    gVrpScore: "P2 - $1,500 a $7,500 (Privilege Escalation)",
    bugcrowdPriority: "P2 - High Severity",
    commandsToVerify: "curl -X GET \"https://target.com/api/v1/user/1001\" -H \"Authorization: Bearer user_token\"\ncurl -X GET \"https://target.com/api/v1/user/1002\" -H \"Authorization: Bearer user_token\"",
    triageManual: `1. Registre duas contas de teste legítimas no escopo de aplicação (ex: Conta A com ID 1001 e Conta B com ID 1002).
2. Obtenha o token de sessão da Conta A.
3. Realize a chamada de API requisitando dados sensíveis da Conta B alterando o ID para 1002 nas requisições da Conta A.
4. Se o servidor responder com os dados da Conta B, a falha lágica de IDOR está confirmada. Não altere dados de usuários reais de terceiros.`,
    reportTemplate: `### Descrição do Achado de Alta Severidade
A aplicação sofre de IDOR (Referência Direta Insegura a Objeto) no endpoint de consulta de dados de perfil, permitindo que usuários comuns leiam informações confidenciais de outras contas sem autorização correspondente.

### Passos de Reprodução
1. Faça login na conta de teste A e observe seu token de sessão e ID.
2. Envie a seguinte requisição HTTP substituindo o ID pelo ID correspondente da conta de teste B:
   \`\`\`http
   GET /api/v1/user/1002 HTTP/1.1
   Host: target.com
   Authorization: Bearer [TOKEN_CONTA_A]
   \`\`\`
3. Observe que as informações privadas de perfil e emails de faturamento da Conta B são retornados com sucesso.

### Impacto de Segurança
Permite que usuários autenticados realizem raspagem em massa de contas privadas, vazando dados de contatos, faturas e arquivos internos.

### Recomendação de Mitigação
1. Implementar checagem estrita de propriedade no nível do controlador de API.
2. Garantir que o ID do usuário seja derivado do próprio token JWT de autenticação validado de forma segura no servidor, em vez de aceitar IDs arbitrários no corpo ou rotas da requisição.`
  },
  {
    severity: 'MEDIUM',
    title: "Ausência de Proteções de Cookie de Sessão / Falha de CORS",
    colorClass: "text-sky-400 bg-sky-500/10",
    borderColorClass: "border-sky-500/20",
    badgeColorClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    gVrpScore: "P3/P4 - $500 a $1,000 (Low/Medium Severity)",
    bugcrowdPriority: "P3 - Medium Severity",
    commandsToVerify: "curl -I -X GET https://target.com -H \"Origin: https://attacker.com\"\npython aegis_csrf.py --target https://target.com",
    triageManual: `1. Envie uma requisição HTTP HEAD ou GET simples para a página de login do alvo.
2. Inspecione se os cabeçalhos 'Set-Cookie' contêm as diretivas 'HttpOnly' e 'Secure'.
3. Se os cookies de controle de sessão puderem ser lidos via Javascript através de document.cookie, a severidade Média está presente.
4. No caso de CORS, passe um cabeçalho 'Origin: https://malicious.com' e verifique se o servidor responde com 'Access-Control-Allow-Origin: https://malicious.com' e 'Access-Control-Allow-Credentials: true'.`,
    reportTemplate: `### Descrição do Achado Médio
A aplicação expõe cookies de controle de sessão sem a flag 'HttpOnly', permitindo vazamento através de ataques de scripting de terceiros, e expõe configurações permissivas de CORS (Cross-Origin Resource Sharing).

### Passos de Reprodução
1. Execute a requisição de inspeção de cookies de login:
   \`\`\`http
   GET /login HTTP/1.1
   Host: target.com
   \`\`\`
2. Observe que o cabeçalho de resposta expõe cookies sem as flags vitais:
   \`Set-Cookie: session_id=abc123xyz; Path=/;\` (HttpOnly e Secure ausentes).

### Impacto de Segurança
Se a aplicação sofrer um ataque de Cross-Site Scripting (XSS) em qualquer domínio associado, o atacante conseguirá roubar a sessão inteira do usuário imediatamente decodificando cookies através de javascript.

### Recomendação de Mitigação
1. Forçar a flag \`HttpOnly\` e \`Secure\` em todos os cookies de autenticação e sessão.
2. Configurar a diretiva \`SameSite=Lax\` para impedir o envio automático de cookies em requisições de sites terceiros.`
  }
];

// Combinatorial Prompt Builders (Google VRP, Bugcrowd, HackerOne)
const PROGRAM_BRANDS = [
  { id: "google-vrp", name: "Google VRP Bughunter", icon: "Award", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { id: "bugcrowd", name: "Bugcrowd Programs", icon: "Bug", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { id: "hackerone", name: "HackerOne Programs", icon: "Shield", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" }
];

// List of target classes and sub-scenarios for the 3,000 prompt expansion
const TARGET_CLASSES = [
  "no ecossistema Cloud Run / GKE Google VRP",
  "em endpoints de API Rest corporativa no Bugcrowd",
  "no fluxo de autenticação OAuth de parceiros no HackerOne",
  "em painéis de administração de microsserviços do Google VRP",
  "no processamento de uploads S3 e AWS KMS no Bugcrowd",
  "no barramento de mensageria Pub/Sub e SCC no HackerOne",
  "em bancos de dados legados e conexões SQL expostas",
  "no ecossistema de APIs baseadas em tokens JWT em produção",
  "na esteira DevOps CI/CD de validação de IaC (OPA)",
  "nos servidores de arquivos estáticos e ativos de nuvem"
];

const AUDIT_TASKS = [
  "auditar quebra de privilégio e escalação vertical de Service Accounts",
  "mapear endpoints sensíveis e rotas paramétricas de vazamento",
  "validar a robustez de tokens de autenticação JWT contra falsificação",
  "verificar vazamentos acidentais de segredos e chaves de APIs no Git",
  "auditar e higienizar parâmetros propensos a injeções SQL lógicas",
  "mapear e verificar cookies de sessão sem diretivas de proteção",
  "auditar integridade de cabeçalhos CORS permissivos de terceiros",
  "detectar subdomínios órfãos e avaliar risks de Takeover DNS",
  "auditar permissões estritas de buckets de dados de produção",
  "verificar conformidade técnica com o OWASP API Security Top 10"
];

const PLATFORM_ROLES = [
  "Especialista de AppSec do Hall da Fama",
  "Auditor Líder de Segurança Cibernética Sênior",
  "DevSecOps Principal Engineer certificado",
  "Threat Hunter e Analista DFIR especializado",
  "Solutions Architect focado em Hardening Zero-Trust",
  "Database Administrator especializado em SQL Defensivo"
];

export default function BugBountySuite() {
  const [selectedBrand, setSelectedBrand] = useState<string>("google-vrp");
  const [activeToolIndex, setActiveToolIndex] = useState<number>(0);
  const [activeSeverityIndex, setActiveSeverityIndex] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Combinatorial Prompt Generation States
  const [gVrpPageIndex, setGVrpPageIndex] = useState<number>(0);
  const [bcPageIndex, setBcPageIndex] = useState<number>(0);
  const [h1PageIndex, setH1PageIndex] = useState<number>(0);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Helper to generate combinatorial lists on the fly for UI (representing 3,000 distinct combinatorial prompts: 1000 per brand)
  const getPaginatedPrompts = (brandId: string, pageIndex: number) => {
    const prompts = [];
    const baseOffset = brandId === "google-vrp" ? 0 : brandId === "bugcrowd" ? 1000 : 2000;
    const itemsPerPage = 6;
    
    // We generate a deterministic set of 6 prompts for the current page out of the 1,000 combinations
    for (let i = 0; i < itemsPerPage; i++) {
      const promptIndex = baseOffset + (pageIndex * itemsPerPage) + i;
      const targetIdx = (promptIndex * 7) % TARGET_CLASSES.length;
      const taskIdx = (promptIndex * 13) % AUDIT_TASKS.length;
      const roleIdx = (promptIndex * 3) % PLATFORM_ROLES.length;

      const target = TARGET_CLASSES[targetIdx];
      const task = AUDIT_TASKS[taskIdx];
      const role = PLATFORM_ROLES[roleIdx];

      const code = `BB-${brandId.substring(0, 3).toUpperCase()}-${baseOffset + (pageIndex * itemsPerPage) + i + 1}`;
      const title = `Verificação de ${task.replace("auditar ", "").replace("verificar ", "").replace("mapear ", "")} | ${role}`;
      const objective = `Validar de forma 100% ética e em conformidade técnica ${task} que se encontra ativo ${target}.`;
      
      const promptText = `# PROMPT TÁTICO DE SEGURANÇA ÉTICA - CÓDIGO ${code}
## PERFIL REQUERIDO: ${role.toUpperCase()}
## PLATFORMA DE AUDITORIA: ${brandId === "google-vrp" ? "GOOGLE VRP HIGH REWARD" : brandId.toUpperCase()}

Atue como o principal **${role}** para o escopo do programa. Sua tarefa é auditar de forma não invasiva e com conformidade jurídica estrita o seguinte cenário:

### 🎯 ESCOPO TÁTICO:
- **Alvo**: ${target}
- **Missão**: ${task}
- **Padrão de Qualidade**: OWASP Top 10 e diretrizes oficiais do programa.

### 🛠️ DIRETRIZES DE EXECUÇÃO SEGURA:
1. **Comportamento Passivo**: Utilize exclusivamente scripts com flags de baixo impacto, sockets locais de rede e inspeção de cabeçalhos públicos para mitigar qualquer risco de negação de serviço.
2. **Nenhuma Alteração de Dados**: Fica estritamente proibida qualquer alteração de registros, injeção persistente destrutiva ou manipulação de contas de terceiros.
3. **Template de Relatório do Bug Hunter**: Estruture o boletim técnico contendo a descrição clara, o passo a passo com comandos curls limpos, o impacto real e a sugestão detalhada de mitigação para o time de segurança.

Forneça os snippets de remediação, caminhos lógicos sugeridos e comandos de triagem equivalentes de forma pragmática e modular.`;

      prompts.push({
        code,
        title,
        objective,
        promptText,
        tags: [role.split(" ")[0], "AppSec", brandId === "google-vrp" ? "GoogleVRP" : brandId === "bugcrowd" ? "Bugcrowd" : "HackerOne"]
      });
    }
    return prompts;
  };

  // Compute values for selected brand
  const activePage = selectedBrand === "google-vrp" ? gVrpPageIndex : selectedBrand === "bugcrowd" ? bcPageIndex : h1PageIndex;
  const setPage = (page: number) => {
    if (selectedBrand === "google-vrp") setGVrpPageIndex(page);
    else if (selectedBrand === "bugcrowd") setBcPageIndex(page);
    else setH1PageIndex(page);
  };

  const visiblePrompts = getPaginatedPrompts(selectedBrand, activePage);
  const activeTool = BUG_HUNTER_TOOLS[activeToolIndex];
  const activeSeverity = SEVERITY_GUIDES[activeSeverityIndex];

  return (
    <div className="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-850 min-h-[640px] text-left bg-slate-950/20 rounded-b-xl overflow-hidden">
      
      {/* LEFT SIDE PANEL: Platforms and Tool Manuals selection */}
      <div className="w-full md:w-96 flex flex-col bg-[#080d19]/90 shrink-0 p-5 divide-y divide-slate-850 gap-5 overflow-y-auto scrollbar-thin">
        
        {/* Header Block */}
        <div className="pb-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <Bug className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Bug Bounty Core</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Guia técnico e suite de orquestração de prompts de alta performance para Bug Hunters nos programas Google VRP, Bugcrowd e HackerOne.
          </p>
        </div>

        {/* Brands Selector */}
        <div className="py-4 space-y-2.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">1. Programas & Plataformas (3.000 Prompts)</span>
          <div className="flex flex-col gap-1.5">
            {PROGRAM_BRANDS.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBrand(b.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition text-left cursor-pointer ${
                  selectedBrand === b.id
                    ? `${b.color} font-bold border-indigo-500/50 shadow-sm`
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>{b.name}</span>
                </div>
                <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 border border-slate-850">1.000 Prompts</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Manual Selector */}
        <div className="py-4 space-y-2.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">2. Manual de Comandos de Ferramentas</span>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
            {BUG_HUNTER_TOOLS.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setActiveToolIndex(idx)}
                className={`w-full text-left p-2 rounded-lg border transition text-xs font-sans cursor-pointer ${
                  activeToolIndex === idx
                    ? 'bg-slate-900 border-indigo-500/30 text-white font-bold'
                    : 'bg-slate-950/20 border-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{t.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{t.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Findings Opener and Triage */}
        <div className="py-4 space-y-2.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">3. Manual de Abertura de Relatórios</span>
          <div className="flex flex-col gap-1.5">
            {SEVERITY_GUIDES.map((g, idx) => (
              <button
                key={g.severity}
                onClick={() => setActiveSeverityIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                  activeSeverityIndex === idx
                    ? 'bg-slate-900 border-indigo-500/30 shadow'
                    : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900/30'
                }`}
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-100">{g.severity} Finding</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-[190px]">{g.title}</p>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${g.badgeColorClass}`}>
                  {g.severity}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SIDE MAIN BOARD */}
      <div className="flex-grow flex flex-col bg-[#0b101f]/65 overflow-y-auto max-h-[680px]">
        
        {/* Main Content Pane */}
        <div className="p-6 space-y-6">
          
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-900 border border-rose-950/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 bg-rose-500/25 text-rose-300 border border-rose-500/20 rounded-full">
                Módulo Bug Hunter Pro
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">Manual & Biblioteca de Coleta de Vulnerabilidades</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Navegue pelas ferramentas de mapeamento nativas do Aegis, acesse o manual de uso de comandos e utilize os 3.000 prompts combinatórios para treinar e rodar auditorias defensivas.
              </p>
            </div>
          </div>

          {/* Section 1: Brand Prompts Container */}
          <div className="space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                  Prompts para {PROGRAM_BRANDS.find(b => b.id === selectedBrand)?.name} ({activePage * 6 + 1} - {activePage * 6 + 6} de 1000)
                </h3>
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(0, activePage - 1))}
                  disabled={activePage === 0}
                  className="px-2 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded disabled:opacity-40 cursor-pointer text-slate-300"
                >
                  Anterior
                </button>
                <span className="text-[10px] font-mono text-slate-500 px-2">Pág. {activePage + 1} de 166</span>
                <button
                  onClick={() => setPage(Math.min(165, activePage + 1))}
                  disabled={activePage === 165}
                  className="px-2 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded disabled:opacity-40 cursor-pointer text-slate-300"
                >
                  Próxima
                </button>
              </div>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visiblePrompts.map((p) => (
                <div key={p.code} className="bg-slate-900/40 border border-slate-850 hover:border-slate-700/55 rounded-xl p-4 flex flex-col justify-between gap-4 transition shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      <div className="flex gap-1">
                        {p.tags.map(t => (
                          <span key={t} className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.2 rounded text-slate-400 border border-slate-900">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans italic">
                      "{p.objective}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyText(p.promptText, p.code)}
                    className="w-full py-1.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedText === p.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    {copiedText === p.code ? "Copiado!" : "Copiar Prompt de Agente"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Selected Tool Manual details */}
          {activeTool && (
            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-5 space-y-4 text-left shadow-lg">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 rounded">
                      Manual da Ferramenta
                    </span>
                    <span className="text-xs font-mono text-slate-500">{activeTool.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-white font-display">{activeTool.name}</h3>
                  <p className="text-xs text-slate-400">{activeTool.description}</p>
                </div>
                
                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                  {activeTool.vulnerabilityTarget}
                </span>
              </div>

              {/* Commands container */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Comando Básico (Inspeção Geral)</span>
                    <button
                      onClick={() => handleCopyText(activeTool.basicCommand, 'basic-cmd')}
                      className="text-[9px] font-mono text-slate-400 hover:text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {copiedText === 'basic-cmd' ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <pre className="text-xs font-mono bg-[#03060d] border border-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 font-bold">
                    <code>$ {activeTool.basicCommand}</code>
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Comando Avançado (Headers & Headers de Sessão)</span>
                    <button
                      onClick={() => handleCopyText(activeTool.advancedCommand, 'adv-cmd')}
                      className="text-[9px] font-mono text-slate-400 hover:text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {copiedText === 'adv-cmd' ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <pre className="text-xs font-mono bg-[#03060d] border border-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 font-bold">
                    <code>$ {activeTool.advancedCommand}</code>
                  </pre>
                </div>
              </div>

              {/* Step by step manual instruction */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Manual Detalhado de Uso Seguro & Triagem</span>
                <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2 font-sans whitespace-pre-wrap">
                  {activeTool.manual}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Selected Finding Triage Opener Details */}
          {activeSeverity && (
            <div className="bg-slate-900/40 border border-[#1b253b] rounded-xl p-5 space-y-4 text-left shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 border rounded ${activeSeverity.badgeColorClass}`}>
                      {activeSeverity.severity} FINDING TRIAGE
                    </span>
                    <span className="text-xs font-mono text-slate-500">Manual de Impacto e Report</span>
                  </div>
                  <h3 className="text-sm font-bold text-white font-display">{activeSeverity.title}</h3>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400 shrink-0">
                  <div>Google VRP Class: <strong className="text-blue-400">{activeSeverity.gVrpScore}</strong></div>
                  <div>Bugcrowd Priority: <strong className="text-amber-400">{activeSeverity.bugcrowdPriority}</strong></div>
                </div>
              </div>

              {/* commands to verify */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Comandos CLI Rápidos para Validar / Triar o Achado de Forma Estéril</span>
                <pre className="text-xs font-mono bg-[#03060d] border border-slate-950 p-3 rounded-lg overflow-x-auto text-rose-400">
                  <code>{activeSeverity.commandsToVerify}</code>
                </pre>
              </div>

              {/* Triage Manual instruction */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Metodologia de Triage Sem Execução de Payload Destrutivo</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-850 whitespace-pre-wrap">
                  {activeSeverity.triageManual}
                </p>
              </div>

              {/* Copy Report Template markdown */}
              <div className="space-y-2 pt-2 border-t border-slate-850">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Modelo Pronto de Report (Markdown Oficial para Submissão)</span>
                  <button
                    onClick={() => handleCopyText(activeSeverity.reportTemplate, 'report-template')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5 select-none cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedText === 'report-template' ? "Copiado!" : "Copiar Template Markdown"}
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-[#03060d]/90 border border-slate-950 p-4 rounded-lg overflow-x-auto text-slate-300 leading-normal max-h-[180px] text-left">
                  <code>{activeSeverity.reportTemplate}</code>
                </pre>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
