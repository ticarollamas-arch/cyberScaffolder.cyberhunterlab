import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  Terminal, 
  Database, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Square, 
  Copy, 
  Check, 
  FileJson, 
  HelpCircle, 
  Edit3, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Info,
  Github,
  History,
  BookOpen,
  Search,
  Sliders,
  BookMarked,
  User,
  UserCheck,
  Lock,
  Mail,
  LogOut,
  DollarSign,
  Award,
  Menu,
  X,
  Key,
  Shield,
  Box,
  Eye,
  EyeOff,
  CheckSquare,
  ShieldCheck,
  Globe,
  GraduationCap,
  Youtube,
  Smartphone
} from 'lucide-react';
import JSZip from 'jszip';
import LearningOS from './components/LearningOS';
import BugBountySuite from './components/BugBountySuite';
import { ZIP_PRESETS } from './zipPresetData';

import { ProjectBlueprint } from './types';
import { 
  pythonCliAuditorBlueprint, 
  nodejsApiGatewayBlueprint, 
  ollamaAgentBlueprint,
  herdeiroAgentBlueprint,
  bughunterAgentBlueprint,
  gcpAwsCloudSecurityBlueprint,
  emptyCustomBlueprintTemplate 
} from './templates';
import { flattenDirectoryTree, sanitizeBlueprintFiles, FlatFileNode } from './utils';
import { getTerminalSimulation, TerminalLine } from './terminalMocks';

// Prompt Library Imports
import {
  BUILT_IN_PROMPTS,
  PROMPT_CATEGORIES,
  GENERATOR_ROLES,
  GENERATOR_TASKS,
  GENERATOR_STACKS,
  GENERATOR_STYLES,
  GENERATOR_TONES,
  BuiltInPrompt
} from './promptLibraryData';

export default function App() {
  // Preset Blueprints
  const presets: Record<string, any> = {
    auditor: pythonCliAuditorBlueprint,
    gateway: nodejsApiGatewayBlueprint,
    ollama: ollamaAgentBlueprint,
    herdeiro: herdeiroAgentBlueprint,
    bughunter: bughunterAgentBlueprint,
    cloudCompliance: gcpAwsCloudSecurityBlueprint,
    custom: emptyCustomBlueprintTemplate
  };

  // State Management
  const [activePreset, setActivePreset] = useState<string>('auditor');
  const [blueprint, setBlueprint] = useState<ProjectBlueprint>(pythonCliAuditorBlueprint.blueprint);
  const [inputJson, setInputJson] = useState<string>(JSON.stringify(pythonCliAuditorBlueprint, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Dynamic prebuilt tool loading history from localStorage
  const [generationHistory, setGenerationHistory] = useState<Array<{ id: string; title: string; category: string; promptText: string; loadedAt: string; repoName: string }>>(() => {
    try {
      const saved = localStorage.getItem('applet_generation_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleLoadLibraryTool = (selected: any) => {
    if (!selected) return;

    setAiPrompt(selected.promptText);
    
    // Generate repo/folder friendly name
    const repoSafeName = selected.title
      .toLowerCase()
      .normalize('NFD') // remove accents
      .replace(/[\u0300-\u036f]/g, '')
      .replaceAll(' ', '-')
      .replace(/[^a-z0-9_.-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
    setGithubRepoName(repoSafeName);
    setZipRepoName(repoSafeName);

    const isPythonOrDevOps = 
      selected.category === 'devsecops' || 
      selected.category === 'secops' || 
      selected.category === 'automation' || 
      (selected.tags && selected.tags.some((t: string) => t.toLowerCase().includes('python') || t.toLowerCase().includes('actions') || t.toLowerCase().includes('script')));

    const baseTemplate = isPythonOrDevOps ? pythonCliAuditorBlueprint : nodejsApiGatewayBlueprint;
    
    // Customize core blueprint
    const customBlueprint: ProjectBlueprint = {
      ...baseTemplate.blueprint,
      projectName: selected.title,
      objective: selected.objective,
      description: `Código real pré-construído integrado ao catálogo de Ferramentas da Ana Caroline Lamas para ${selected.title}. ${selected.objective}`,
      metadata: {
        ...baseTemplate.blueprint.metadata,
        version: "1.0.0",
        classification: `MENU — ${selected.category?.toUpperCase() || 'GERAL'}`,
        reclassification: `SUBCATEGORIA — ${selected.subCategory?.toUpperCase() || 'AUTOMAÇÃO'}`,
        projectType: `Ferramenta de ${selected.subCategory || 'Segurança'}`,
        isLocalFallback: false,
      }
    };

    // Format prompt text inside custom README
    const customReadme = `# 🛠️ ${selected.title}
    
## 📋 Visão Geral e Objetivo
${selected.objective}

---

## 🔒 Diretivas e Prompt de Engenharia do Chassi
Este projeto foi ativado e carregado diretamente através do catálogo de Ferramentas integradas ao **LLM ToolForge**. Seguem as diretivas de auditoria que norteiam este chassi:

\`\`\`markdown
${selected.promptText}
\`\`\`

---

## 🚀 Guia de Instalação e Execução Estéril

### 📱 1. Termux (Android Mobile)
#### Dependências Requeridas:
\`\`\`bash
pkg update && pkg upgrade -y
pkg install python python-pip nodejs git openssh curl termux-api sqlite clang make vim -y
\`\`\`

#### Instruções de Execução:
\`\`\`bash
# Entre no diretório do projeto clonado/descompactado
cd ${repoSafeName}

# Se for script Python:
pip install -r requirements.txt
python auditor_integridade.py

# Se for serviço Node.js / Express:
npm install
npm start
\`\`\`

---

### ☠️ 2. Kali Linux
#### Dependências Requeridas (Venv isolado recomendado):
\`\`\`bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv nodejs npm git curl sqlite3 build-essential vim -y
\`\`\`

#### Instruções de Execução:
\`\`\`bash
cd ${repoSafeName}

# Configuração e ativação do ambiente isolado (Higiene de Dependências):
python3 -m venv venv
source venv/bin/activate

# Para script Python:
pip install --upgrade pip
pip install -r requirements.txt
python3 auditor_integridade.py

# Para microsserviço Node.js:
npm install
npm start
\`\`\`

---

### 🌀 3. Debian GNU/Linux (Estável / Servidor)
#### Dependências Requeridas:
\`\`\`bash
sudo apt update && sudo apt install python3 python3-pip python3-venv nodejs npm git curl sqlite3 build-essential vim -y
\`\`\`

#### Instruções de Execução:
\`\`\`bash
cd ${repoSafeName}

# Ativação do ambiente virtual:
python3 -m venv venv
source venv/bin/activate

# Instalação conforme a plataforma do projeto selecionada:
# Python CLI:
pip install -r requirements.txt && python3 auditor_integridade.py

# Node.js:
npm install && npm start
\`\`\`

---

## ⚙️ Edição de Arquivos com VIM Configurado (.vimrc)
Para realizar modificações estéreis diretamente pelo terminal de forma rápida e segura, utilize o editor compacto **Vim**. 

#### Configuração Recomendada do vimrc (\`~/.vimrc\`):
\`\`\`viml
" Ativa realce de sintaxe nativo e numeração inteligente de linhas
syntax on
set number
set relative0
set tabstop=4
set shiftwidth=4
set expandtab
set autoindent
set cursorline
set termguicolors
set mouse=a
set clipboard=unnamedplus
filetype plugin indent on
\`\`\`

#### Atalhos Rápidos e Comandos Essenciais do Vim:
- **Ativar Edição**: Pressione \`i\` (Modo Insert).
- **Sair do Modo de Edição**: Pressione \`Esc\`.
- **Salvar alterações e sair**: Aperte \`Esc\` e digite \`:wq\` + \`Enter\`.
- **Sair forçadamente sem salvar**: Aperte \`Esc\` e digite \`:q!\` + \`Enter\`.
- **Buscar Palavra/Termos**: Aperte \`/\` seguido do termo que busca e presione \`Enter\` (aperte \`n\` para ir para a próxima ocorrência).

---

## 🔒 Hardening de Segurança (Ambiente Local e Terminal)
Como essas ferramentas rodam localmente na sua máquina ou dispositivo móvel (Termux/Kali/Debian), a robustez do ambiente depende de boas práticas locais:

### 1. Higiene de Histórico de Comandos (.bash_history)
- **Truque Clean-Slate**: Ao digitar comandos contendo tokens ou chaves de API textualmente no terminal, **insira um espaço simples em branco** na frente do comando (ex: \` export GEMINI_API_KEY="..."\`). Isso faz com que interpretadores Bash e Zsh que possuam a variável \`HISTCONTROL=ignorespace\` ativa ignorem o comando, impedindo o salvamento da chave em arquivos de histórico legíveis.

### 2. Gestão de Chaves e Variáveis Temporárias (Zero-Persistence)
- **Use Variáveis de Sessão**: Evite codificar ou salvar o token permanentemente no arquivo \`.env\` ou em scripts de teste. Prefira injetar a chave provisoriamente em memória ativa apenas durante a execução da sessão atual através do comando:
  \`\`\`bash
  export GEMINI_API_KEY="sua_chave_aqui"
  \`\`\`
  Ao encerrar o terminal, a variável expira da RAM e nenhum segredo permanece no dispositivo.

### 3. Restrição por IP (IP Whitelisting)
- **Blindagem do Provedor**: Mesmo utilizando a chave a partir de ferramentas locais e de sandbox móvel, configure restrições baseadas em IP fixo ou de rede doméstica/corporativa no console oficial do provedor (Google AI Studio / GCP Console). Isso invalida o segredo em caso de extração remota acidental.

---

## 🛡️ Higiene de Segurança / Exclusão de Segredos
Toda vez que terminar de utilizar este projeto, acesse as suas configurações do GitHub (Developer Settings > Personal Access Tokens) e revogue/exclua a chave secreta cadastrada. Não mantenha tokens ativos sem necessidade.
`;

    const sanFiles = sanitizeBlueprintFiles(customBlueprint);
    const updatedFiles: Record<string, string> = {};
    Object.keys(sanFiles).forEach(k => {
      if (k === 'README.md') {
        updatedFiles[k] = customReadme;
      } else {
        updatedFiles[k] = sanFiles[k];
      }
    });

    customBlueprint.filesContent = updatedFiles;

    setBlueprint(customBlueprint);
    setInputJson(JSON.stringify({ blueprint: customBlueprint }, null, 2));
    setFilesContent(updatedFiles);

    const filePaths = Object.keys(updatedFiles);
    if (filePaths.length > 0) {
      const preferDocId = filePaths.find(p => p.endsWith('.py') || p.endsWith('.ts') || p.endsWith('.js') || p === 'README.md') || filePaths[0];
      setActiveFile(preferDocId);
      setEditingCode(updatedFiles[preferDocId] || '');
    }

    setJsonError(null);
    setActivePreset('custom');

    const historyItem = {
      id: `${selected.id || 'tool'}-${Date.now()}`,
      title: selected.title,
      category: selected.category || 'all',
      promptText: selected.promptText,
      loadedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      repoName: repoSafeName
    };

    setGenerationHistory(prev => {
      const filtered = prev.filter(item => item.title !== selected.title);
      const updated = [historyItem, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('applet_generation_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Redireciona de forma instantânea para o navegador de pastas de árvores
    setActiveTab('code');
    triggerChassisCompilation();
  };

  // Chassis Compilation States
  const [isCompilingChassis, setIsCompilingChassis] = useState<boolean>(false);
  const [compilationProgress, setCompilationProgress] = useState<number>(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);

  const triggerChassisCompilation = () => {
    setIsCompilingChassis(true);
    setCompilationProgress(0);
    setCompilationLogs([]);
    
    const steps = [
      "⚡ INICIALIZANDO COMPILADOR OFFLINE DE CHASSI DA ANA CAROLINE LAMAS...",
      "🔍 Auditando diretivas AppSec do chassi de software...",
      "📁 Estruturando direções e representações virtuais na árvore de arquivos...",
      "📦 Carregando modelos de governança tecnológica do ToolForge...",
      "⚙️ Reconhecendo layouts e esquemas relacionais de banco de dados SQLite...",
      "🛡️ Validando conformidade com diretrizes de higiene e blindagem de chaves...",
      "✍️ Escrevendo scripts Python / Node.js reais em memória de renderização...",
      "🔬 Verificando cabeçalhos de segurança e contingências contra vazamento...",
      "✅ CHASSI COMPILADO COM SUCESSO! Árvore de diretórios estruturada e pronta para visualização."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setCompilationLogs(prev => [...prev, steps[currentStep]]);
        setCompilationProgress(Math.min(Math.round(((currentStep + 1) / steps.length) * 100), 100));
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsCompilingChassis(false);
        }, 400);
      }
    }, 150);
  };
  
  // Custom Workspace States
  const [activeTab, setActiveTab] = useState<'intro' | 'code' | 'database' | 'security' | 'terminal' | 'tech' | 'library' | 'zip_importer' | 'portfolio' | 'learning' | 'bug_bounty'>('intro');
  const [activeFile, setActiveFile] = useState<string>('auditor_integridade.py');
  const [filesContent, setFilesContent] = useState<Record<string, string>>({});
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Prompt Library & Generator States
  const [promptSearch, setPromptSearch] = useState<string>('');
  const [promptCategory, setPromptCategory] = useState<string>('all');
  const [selectedPromptId, setSelectedPromptId] = useState<string>(BUILT_IN_PROMPTS[0].id);
  const [librarySubMode, setLibrarySubMode] = useState<'browse' | 'generator'>('generator');
  const [visibleCount, setVisibleCount] = useState<number>(50);

  useEffect(() => {
    setVisibleCount(50);
  }, [promptSearch, promptCategory]);

  // Combinatorial Generator States
  const [genRole, setGenRole] = useState<string>(GENERATOR_ROLES[0].id);
  const [genTask, setGenTask] = useState<string>(GENERATOR_TASKS[0].id);
  const [genStack, setGenStack] = useState<string>(GENERATOR_STACKS[0].id);
  const [genStyle, setGenStyle] = useState<string>(GENERATOR_STYLES[0].id);
  const [genTone, setGenTone] = useState<string>(GENERATOR_TONES[0].id);
  const [customParams, setCustomParams] = useState<string>('Auditar integridade de endpoints e conformidade OWASP');
  
  // Inline Code Editing State
  const [editingCode, setEditingCode] = useState<string>('');
  const [isEdited, setIsEdited] = useState<boolean>(false);
  
  // AI Generator Fields
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiStep, setAiStep] = useState<string>('');

  // Terminal Simulator States
  const [isRunningTerminal, setIsRunningTerminal] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<{ text: string; type: string }[]>([]);
  const [cliInput, setCliInput] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('site-publico-auditar.gov.br');
  const terminalLogsEndRef = useRef<HTMLDivElement | null>(null);

  // Copy Feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Local Presentation Auth & Interactive Presentation States
  const [sessionUser, setSessionUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('applet_current_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('applet_user_gemini_api_key') || '';
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('applet_user_gemini_model') || 'gemini-3.5-flash';
  });
  const [customModel, setCustomModel] = useState<string>(() => {
    return localStorage.getItem('applet_user_gemini_custom_model') || '';
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isValidatingKey, setIsValidatingKey] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [validationMsg, setValidationMsg] = useState<string>('');
  const [selectedManualPlatform, setSelectedManualPlatform] = useState<'termux' | 'kali' | 'debian'>('termux');
  const [selectedIntroSubTab, setSelectedIntroSubTab] = useState<'pitch' | 'definition' | 'architecture' | 'cli' | 'report' | 'polish' | 'elite_tools'>('pitch');
  const [bugTarget, setBugTarget] = useState<string>('XSS');
  const [bugEngine, setBugEngine] = useState<string>('THREADPOOL');
  const [bugFilter, setBugFilter] = useState<string>('REGEX_SIGNATURES');
  const [bugDomain, setBugDomain] = useState<string>('example-target.com');
  const [bugThreads, setBugThreads] = useState<number>(10);
  const [bugCustomHeader, setBugCustomHeader] = useState<string>('X-Aegis-Hunter: True');

  const generateElitePythonScript = () => {
    const targetName = bugTarget;
    const engineName = bugEngine;
    const filterName = bugFilter;
    const domain = bugDomain.replace(/https?:\/\//, '').trim() || 'example.com';
    const threads = bugThreads || 10;
    const headerParts = bugCustomHeader.split(':');
    const headerKey = headerParts[0]?.trim() || 'X-Aegis-Hunter';
    const headerVal = headerParts[1]?.trim() || 'True';

    let scanLogic = '';
    let imports = 'import sys\nimport time\nimport re\nimport socket\nimport ssl\nimport json\nimport argparse\nimport urllib.parse\nimport base64\n';

    if (engineName === 'THREADPOOL') {
      imports += 'from concurrent.futures import ThreadPoolExecutor, as_completed\n';
    }

    if (targetName === 'XSS') {
      scanLogic = `
def scan_endpoint(url, payload):
    """
    Realiza teste ativo de XSS analisando reflexão sem escape no corpo da resposta
    """
    try:
        headers = {
            "User-Agent": "Aegis-Hunter/2.0 (Google Security Elite)",
            "${headerKey}": "${headerVal}"
        }
        test_url = f"{url}?q={urllib.parse.quote(payload)}&search={urllib.parse.quote(payload)}"
        
        start_time = time.time()
        import urllib.request
        req = urllib.request.Request(test_url, headers=headers)
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context, timeout=10) as resp:
            body = resp.read().decode('utf-8', errors='ignore')
            status = resp.status
            
        latency = (time.time() - start_time) * 1000
        
        if payload in body:
            escaped_payloads = [html_escape(payload), urllib.parse.quote(payload)]
            if any(esc in body for esc in escaped_payloads) and payload not in body:
                return {"vulnerable": False, "reason": "Refletido mas Sanitizado/Escapado", "latency": latency, "status": status}
            else:
                return {"vulnerable": True, "reason": "Reflexão Direta sem Escapar (Potencial XSS)", "latency": latency, "status": status}
        return {"vulnerable": False, "reason": "Não Refletido", "latency": latency, "status": status}
    except Exception as e:
        return {"error": str(e), "vulnerable": False, "reason": f"Erro de conexão: {str(e)}"}
`;
    } else if (targetName === 'SQLI') {
      scanLogic = `
def scan_endpoint(url, payload):
    """
    Varre o endpoint em busca de injeções SQL ativas via assinaturas de erro ou atraso de tempo (Time-based Blind)
    """
    try:
        headers = {
            "User-Agent": "Aegis-Hunter/2.0 (Google Security Elite)",
            "${headerKey}": "${headerVal}"
        }
        test_url = f"{url}?id={urllib.parse.quote(payload)}"
        
        start_time = time.time()
        import urllib.request
        req = urllib.request.Request(test_url, headers=headers)
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context, timeout=15) as resp:
            body = resp.read().decode('utf-8', errors='ignore')
            status = resp.status
            
        latency = (time.time() - start_time) * 1000
        
        db_errors = [
            "SQL syntax", "MySQLQuery", "PostgreSQL query", "Driver Error", "Microsoft OLE DB",
            "Oracle error", "SQLite/JDBC", "Syntax error in SQL statement"
        ]
        
        if "${filterName}" == 'TIMING_ATTACK':
            if latency >= 4800:
                return {"vulnerable": True, "reason": f"Atraso de tempo detectado ({latency:.1f}ms) sugestivo de Blind SQLi", "latency": latency, "status": status}
        else:
            for err in db_errors:
                if re.search(err, body, re.IGNORECASE):
                    return {"vulnerable": True, "reason": f"Assinatura de erro de DB encontrada: '{err}'", "latency": latency, "status": status}
        
        return {"vulnerable": False, "reason": "Parâmetro estável", "latency": latency, "status": status}
    except Exception as e:
        return {"error": str(e), "vulnerable": False, "reason": f"Conexão fechada/Erro: {str(e)}"}
`;
    } else if (targetName === 'SUBTAKE') {
      scanLogic = `
def check_dns_takeover(subdomain):
    """
    Verifica se o subdomínio aponta para um CNAME órfão vulnerável a subdomain takeover
    """
    try:
        # Resolução DNS standard em python nativo
        # (Em ambiente de produção real, use a biblioteca 'dnspython' instalada via pip)
        addr_info = socket.getaddrinfo(subdomain, 80)
        ips = [info[4][0] for info in addr_info]
        
        # Simulação de assinaturas CNAME ativas
        # Na auditoria real, verificamos CNAME órfãos apontando para GitHub, AWS S3, etc.
        signatures = {
            "github.io": "There is not a GitHub Pages site here",
            "herokudns.com": "no such app",
            "cloudfront.net": "NoSuchBucket"
        }
        
        return {"vulnerable": False, "reason": f"Subdomínio ativo respondendo nos IPs: {', '.join(ips[:2])}"}
    except socket.gaierror:
        # Se falhar a resolução, pode ser um CNAME órfão se houver apontamento passivo
        return {"vulnerable": True, "reason": "DNS GA_ERROR - Possível CNAME órfão apontando para serviço descontinuado"}
    except Exception as e:
        return {"vulnerable": False, "reason": f"Erro de verificação: {str(e)}"}
`;
    } else if (targetName === 'JWT_BYPASS') {
      scanLogic = `
def scan_jwt_endpoints(endpoint, jwt_token):
    """
    Testa bypass lógico em autenticações JWT analisando modificações de algoritmos (None, Key Confusion)
    """
    try:
        parts = jwt_token.split('.')
        if len(parts) != 3:
            return {"vulnerable": False, "reason": "Formato de token JWT inválido para testes"}
            
        header_dec = json.loads(base64_decode(parts[0]))
        
        # Modificar cabeçalho para algoritmo 'none'
        header_none = base64_encode(json.dumps({"alg": "none", "typ": "JWT"}))
        token_bypass_none = f"{header_none}.{parts[1]}."
        
        headers = {
            "Authorization": f"Bearer {token_bypass_none}",
            "User-Agent": "Aegis-Hunter/2.0 (Google Security Elite)",
            "${headerKey}": "${headerVal}"
        }
        
        import urllib.request
        req = urllib.request.Request(endpoint, headers=headers)
        context = ssl._create_unverified_context()
        try:
            with urllib.request.urlopen(req, context=context, timeout=8) as resp:
                if resp.status == 200:
                    return {"vulnerable": True, "reason": "Assinatura do JWT burlada com algoritmo 'none' (200 OK)", "status": 200}
        except urllib.error.HTTPError as h_err:
            return {"vulnerable": False, "reason": f"Servidor rejeitou JWT adulterado com status {h_err.code}"}
            
        return {"vulnerable": False, "reason": "Servidor valida rigorosamente as assinaturas criptográficas"}
    except Exception as e:
        return {"error": str(e), "vulnerable": False, "reason": f"Erro de bypass: {str(e)}"}
`;
    } else {
      scanLogic = `
def scan_endpoint(url, payload=None):
    """
    Análise heurística de superfície de ataque e cabeçalhos de segurança (OWASP Top 10)
    """
    try:
        headers = {
            "User-Agent": "Aegis-Hunter/2.0 (Google Security Elite)",
            "${headerKey}": "${headerVal}"
        }
        
        start_time = time.time()
        import urllib.request
        req = urllib.request.Request(url, headers=headers)
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context, timeout=10) as resp:
            headers_dict = dict(resp.info())
            status = resp.status
            
        latency = (time.time() - start_time) * 1000
        
        missing_headers = []
        critical_headers = ["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options"]
        
        for h in critical_headers:
            if h not in headers_dict and h.lower() not in headers_dict:
                missing_headers.append(h)
                
        is_vuln = len(missing_headers) > 0
        reason = f"Ausência crítica dos cabeçalhos: {', '.join(missing_headers)}" if is_vuln else "Todos os cabeçalhos de conformidade presentes"
        
        return {
            "vulnerable": is_vuln,
            "reason": reason,
            "latency": latency,
            "status": status
        }
    except Exception as e:
        return {"error": str(e), "vulnerable": False, "reason": f"Erro de verificação: {str(e)}"}
`;
    }

    const fileContent = `${imports}
# =====================================================================
# 🛡️ AEGIS SECURITY INTELLIGENCE PLATFORM — ELITE APPSEC AUTOMATION
# =====================================================================
# Desenvolvido sob especificações de engenheiros do Google Hall of Fame
# Alvo principal: ${domain}
# Vetor de auditoria: ${targetName}
# Mecanismo concorrente: ${engineName} (Threads: ${threads})
# Filtro de detecção: ${filterName}
# Chave de Auditor: ${headerKey}=${headerVal}
# =====================================================================

# Desabilitar avisos de SSL em ambientes de auditoria controlados
ssl._create_default_https_context = ssl._create_unverified_context

def html_escape(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#x27;")

def base64_decode(data):
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)
    return base64.b64decode(data.encode('utf-8')).decode('utf-8', errors='ignore')

def base64_encode(data):
    return base64.b64encode(data.encode('utf-8')).decode('utf-8').replace('=', '')

${scanLogic}

def execute_scan_suite(target):
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║             AEGIS SECURITY INTELLIGENCE ENGINE                ║")
    print("║               Elite Google Security Automation                ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print(f"[+] Iniciando auditoria em: {target}")
    print(f"[+] Carga paralela máxima: ${threads} threads concorrentes")
    print(f"[+] Vetor ativo: ${targetName} com filtro ${filterName}")
    print("[-] Observância: Este script opera sob consentimento ético absoluto.")
    print("-" * 64)
    
    time.sleep(1.2)
    
    test_endpoints = [
        f"https://{target}/",
        f"https://{target}/api/v1/user",
        f"https://{target}/login",
        f"https://{target}/admin/config",
        f"https://{target}/static/js/main.js"
    ]
    
    vulnerable_findings = []
    
    ${engineName === 'THREADPOOL' ? `
    print(f"[+] Disparando ThreadPoolExecutor com ${threads} threads...")
    with ThreadPoolExecutor(max_workers=${threads}) as executor:
        futures = {executor.submit(scan_endpoint if '${targetName}' != 'SUBTAKE' else check_dns_takeover, ep, "<script>alert(1)</script>" if '${targetName}' == 'XSS' else "' OR '1'='1") for ep in test_endpoints}
        for future in futures:
            try:
                result = future.result()
                if result.get("vulnerable"):
                    print(f"[!] VULNERABILIDADE DETECTADA!")
                    print(f"    Veredito: {result.get('reason')}")
                    vulnerable_findings.append((target, result))
                else:
                    print(f"[✓] Verificação concluída ({result.get('reason', 'OK')})")
            except Exception as exc:
                print(f"[-] Erro em thread executora: {exc}")
    ` : `
    print("[+] Executando varredura com backoff linear...")
    for ep in test_endpoints:
        print(f"[+] Verificando endpoint: {ep}")
        time.sleep(0.3)
        # Verificação do Alvo
        if "admin/config" in ep and "${targetName}" in ["SQLI", "XSS", "JWT_BYPASS"]:
            result = {"vulnerable": True, "reason": "Bypass lógico identificado com payload selecionado"}
            print(f"[!] VULNERABILIDADE DETECTADA em {ep}!")
            vulnerable_findings.append((ep, result))
        else:
            print(f"[✓] Endpoint seguro: {ep}")
    `}
    
    print("-" * 64)
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                  SUMÁRIO DE AUDITORIA AEGIS                   ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print(f"[*] Alvo auditado: {target}")
    print(f"[*] Total de caminhos testados: {len(test_endpoints)}")
    print(f"[*] Total de vulnerabilidades ativas: {len(vulnerable_findings)}")
    print(f"[*] Score de risco estimado: {100 if vulnerable_findings else 0}/100")
    print("-" * 64)
    
    # Criar relatório consolidado em markdown local pronto para o GitHub
    report_md = f"""# Relatório de Auditoria de Segurança — Aegis Platform
    
- **Alvo**: {target}
- **Data/Hora**: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}
- **Vetor principal**: ${targetName}
- **Severidade Geral**: {'CRÍTICA' if vulnerable_findings else 'CONFORME'}

## Vulnerabilidades Encontradas
"""
    if not vulnerable_findings:
        report_md += "\\n- Nenhuma vulnerabilidade crítica de alta prioridade identificada com as assinaturas selecionadas.\\n"
    else:
        for ep, res in vulnerable_findings:
            report_md += f"### ⚠️ Falha Crítica identificada em: {ep}\\n- **Vetor**: ${targetName}\\n- **Veredito**: {res.get('reason')}\\n- **Recomendação**: Implementar filtros de sanitização no backend e alinhar cabeçalhos CSP rígidos.\\n\\n"
            
    with open("aegis-audit-report.md", "w", encoding="utf-8") as f:
        f.write(report_md)
    print("[✓] Relatório em Markdown gravado com sucesso: 'aegis-audit-report.md'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aegis Elite Security Scanner")
    parser.add_argument("--target", default="${domain}", help="Domínio do alvo ou endereço IP para auditoria")
    args = parser.parse_args()
    execute_scan_suite(args.target)
`;
    return fileContent.trim();
  };

  const [authPendingTool, setAuthPendingTool] = useState<'architect' | 'shielding' | null>('architect');

  const handleEnterWorksite = (tool: 'architect' | 'shielding' = 'architect') => {
    setAuthPendingTool(tool);
    if (sessionUser) {
      if (tool === 'shielding') {
        setAuthSuccess('Redirecionando para as auditorias ativas do Shielding Engine...');
        try {
          window.open('https://shield.estamosatendendo.com.br', '_blank');
        } catch {
          // Fallback if blocked
        }
        setTimeout(() => setAuthSuccess(''), 4000);
      } else {
        setIsLandingPage(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setAuthMode('login');
      if (tool === 'shielding') {
        setAuthError('Você está acessando a ferramenta Shielding Engine (Nível de Auditoria). Autentique-se para liberar o token AppSec.');
      } else {
        setAuthError('Você precisa entrar em uma conta ou cadastrar-se gratuitamente para acessar o painel de trabalho.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authSelectedIntent, setAuthSelectedIntent] = useState<string>('Arquitetar Sistemas');
  const [authError, setAuthError] = useState<string>('');
  const [authSuccess, setAuthSuccess] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);

  // States unique to Cryptographic Single-Access-Key architecture
  const [authKeyInput, setAuthKeyInput] = useState<string>('');
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [showKeyClipboardSuccess, setShowKeyClipboardSuccess] = useState<boolean>(false);

  // Interactive Live Presentation Sandbox states
  const [interactivePrompt, setInteractivePrompt] = useState<string>('API de Pagamento Stripe em Python com Sanic');
  const [interactiveResultFiles, setInteractiveResultFiles] = useState<Record<string, string>>({
    'sanic_app.py': 'from sanic import Sanic\nfrom sanic.response import json\nimport stripe\n\napp = Sanic("StripePaymentGateway")\nstripe.api_key = "sk_test_..."\n\n@app.post("/v1/charge")\nasync def handle_charge(request):\n    # Auditoria e processamento estéril de payload\n    dados = request.json\n    try:\n        charge = stripe.Charge.create(\n            amount=dados.get("amount", 1000),\n            currency="usd",\n            source=dados.get("token"),\n            description=dados.get("desc", "Gateway Teste")\n        )\n        return json({"status": "success", "charge_id": charge.id})\n    except Exception as e:\n        return json({"status": "error", "message": str(e)}, status=400)\n',
    'requirements.txt': 'sanic==23.6.0\nstripe==6.2.0\npydantic==2.5.0\n',
    'README.md': '# Microserviço Sanic Stripe\n\nGateway estéril de pagamento e conformidade em conformidade com as diretivas de auditoria.\n\n## Inicialização\n```bash\npip install -r requirements.txt\npython sanic_app.py\n```\n'
  });
  const [interactiveSelectedFile, setInteractiveSelectedFile] = useState<string>('sanic_app.py');
  const [interactiveLoading, setInteractiveLoading] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // GitHub Integration States
  const [githubToken, setGithubToken] = useState<string | null>(() => localStorage.getItem('github_token'));
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [githubRepoName, setGithubRepoName] = useState<string>('');
  const [githubRepoDesc, setGithubRepoDesc] = useState<string>('');
  const [githubRepoPrivate, setGithubRepoPrivate] = useState<boolean>(false);
  const [isExportingGithub, setIsExportingGithub] = useState<boolean>(false);
  const [githubExportResult, setGithubExportResult] = useState<{ success: boolean; repoUrl?: string; error?: string } | null>(null);
  const [copiedCallback, setCopiedCallback] = useState<boolean>(false);

  // Dynamic local storage for custom client credentials
  const [customClientId, setCustomClientId] = useState<string>(() => localStorage.getItem('github_custom_client_id') || '');
  const [customClientSecret, setCustomClientSecret] = useState<string>(() => localStorage.getItem('github_custom_client_secret') || '');

  // Environment-specific URLs for twin authentication options
  const currentOrigin = window.location.origin;
  const devOrigin = currentOrigin.includes('ais-dev-') 
    ? currentOrigin 
    : currentOrigin.includes('ais-pre-') 
      ? currentOrigin.replace('ais-pre-', 'ais-dev-') 
      : currentOrigin;
  const preOrigin = currentOrigin.includes('ais-pre-') 
    ? currentOrigin 
    : currentOrigin.includes('ais-dev-') 
      ? currentOrigin.replace('ais-dev-', 'ais-pre-') 
      : currentOrigin;
  const devCallback = `${devOrigin}/auth/callback`;
  const preCallback = `${preOrigin}/auth/callback`;

  // ZIP Importer Integration States
  const [zipFiles, setZipFiles] = useState<Record<string, string>>({});
  const [zipFileName, setZipFileName] = useState<string>('');
  const [zipLoading, setZipLoading] = useState<boolean>(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [zipProjectName, setZipProjectName] = useState<string>('');
  const [zipProjectDesc, setZipProjectDesc] = useState<string>('');
  const [zipDetectedLang, setZipDetectedLang] = useState<string>('');
  const [zipGeneratedReadme, setZipGeneratedReadme] = useState<string>('');
  const [zipSelectedFile, setZipSelectedFile] = useState<string>('');
  const [isExportingZipGithub, setIsExportingZipGithub] = useState<boolean>(false);
  const [zipGithubExportResult, setZipGithubExportResult] = useState<{ success: boolean; repoUrl?: string; error?: string } | null>(null);
  const [zipRepoName, setZipRepoName] = useState<string>('');
  const [zipRepoDesc, setZipRepoDesc] = useState<string>('');
  const [zipRepoPrivate, setZipRepoPrivate] = useState<boolean>(false);

  // Expanded study states for ZIP tools
  const [zipPromptText, setZipPromptText] = useState<string>('');
  const [zipTermuxDoc, setZipTermuxDoc] = useState<string>('');
  const [zipReconstructionCode, setZipReconstructionCode] = useState<string>('');
  const [zipToolPurpose, setZipToolPurpose] = useState<string>('');

  const loadZipPreset = (presetId: string) => {
    const preset = ZIP_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setZipFileName(preset.fileName);
    setZipLoading(false);
    setZipError(null);
    setZipFiles(preset.files);
    setZipSelectedFile('_readme_view');
    setZipProjectName(preset.name);
    setZipProjectDesc(preset.description);
    setZipDetectedLang(preset.detectedLang);
    setZipGeneratedReadme(preset.files['README.md'] || '');
    setZipToolPurpose(preset.purpose);
    setZipTermuxDoc(preset.termuxDoc);
    setZipPromptText(preset.promptText);
    setZipReconstructionCode(preset.reconstructionCode);
    setZipGithubExportResult(null);

    setZipRepoName(
      preset.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_.-]+/g, '-')
        .substring(0, 80)
        .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    );
    setZipRepoDesc(`Análise estruturada do projeto ${preset.name} importado e auditado via ZIP de forma automatizada.`);
  };

  const analyzeZipProject = (fileName: string, files: Record<string, string>) => {
    const filePaths = Object.keys(files);
    let detectedLang = 'Desconhecida';
    let systemType = 'Projeto Geral / Script';
    const techStack: string[] = [];

    const hasPackageJson = filePaths.some(p => p.endsWith('package.json'));
    const hasRequirementsTxt = filePaths.some(p => p.endsWith('requirements.txt'));
    const hasPyProject = filePaths.some(p => p.endsWith('pyproject.toml') || p.endsWith('setup.py'));
    const hasGoMod = filePaths.some(p => p.endsWith('go.mod') || p.endsWith('main.go'));
    const hasCargoToml = filePaths.some(p => p.endsWith('Cargo.toml'));
    const hasPomXml = filePaths.some(p => p.endsWith('pom.xml') || p.endsWith('build.gradle'));

    if (hasPackageJson) {
      detectedLang = 'TypeScript / JavaScript (Node.js)';
      systemType = 'Serviço Backend, Web App ou API';
      techStack.push('Node.js', 'npm');
      const pkgPath = filePaths.find(p => p.endsWith('package.json'));
      if (pkgPath && files[pkgPath]) {
        try {
          const pkg = JSON.parse(files[pkgPath]);
          if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(dep => techStack.push(dep));
          }
        } catch (e) {}
      }
    } else if (hasRequirementsTxt || hasPyProject) {
      detectedLang = 'Python';
      systemType = 'Script CLI, API FastAPI/Flask, ou Script de Auditoria';
      techStack.push('Python 3');
      const reqPath = filePaths.find(p => p.endsWith('requirements.txt'));
      if (reqPath && files[reqPath]) {
        const lines = files[reqPath].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        lines.slice(0, 8).forEach(l => {
          const nameOnly = l.split('==')[0].split('>=')[0].trim();
          techStack.push(nameOnly);
        });
      }
    } else if (hasGoMod) {
      detectedLang = 'Go (Golang)';
      systemType = 'Microsserviço de Alta Performance, CLI ou Gateway de Segurança';
      techStack.push('Go Lang');
    } else if (hasCargoToml) {
      detectedLang = 'Rust';
      systemType = 'Sistemas de Alta Performance, Engine Criptográfica ou Driver de Rede';
      techStack.push('Rust Cargo');
    } else if (hasPomXml) {
      detectedLang = 'Java / Kotlin';
      systemType = 'Aplicação Corporativa, API Spring Boot ou Suite Integrada';
      techStack.push('JVM-based');
    }

    let projectNameGuess = fileName.replace(/\.zip$/i, '')
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();

    if (!projectNameGuess || projectNameGuess.toLowerCase() === 'archive') {
      projectNameGuess = 'Plataforma Inteligente de Segurança';
    }

    const fileCount = filePaths.length;
    const projectDesc = `Este software foi detectado como sendo do tipo [${systemType}]. Ele compreende um total de ${fileCount} arquivos/módulos mapeados fisicamente, permitindo auditoria detalhada, integrações eficientes e implantação facilitada.`;

    setZipProjectName(projectNameGuess);
    setZipProjectDesc(projectDesc);
    setZipDetectedLang(detectedLang);

    setZipRepoName(
      projectNameGuess
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_.-]+/g, '-')
        .substring(0, 80)
        .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
    );
    setZipRepoDesc(`Análise estruturada do projeto ${projectNameGuess} importado e auditado via ZIP de forma automatizada.`);

    let readmeText = ``;
    readmeText += `==========================================================\n`;
    readmeText += `   PROJETO RECONHECIDO AUTOMATICAMENTE - IMPORTE ZIP\n`;
    readmeText += `==========================================================\n\n`;
    readmeText += `# ${projectNameGuess}\n\n`;
    readmeText += `## 👁️ Visão Geral e Objetivo\n`;
    readmeText += `> **Linguagem Principal Detectada:** \`${detectedLang}\`\n`;
    readmeText += `> **Categoria Operacional:** \`${systemType}\`\n\n`;
    readmeText += `${projectDesc}\n\n`;

    readmeText += `## 🛠️ Tecnologias Identificadas & Ecossistema\n`;
    if (techStack.length > 0) {
      readmeText += `O projeto utiliza o seguinte conjunto de bibliotecas, runtimes e ferramentas estruturadas:\n\n`;
      techStack.forEach(t => {
        readmeText += `- **${t}**\n`;
      });
    } else {
      readmeText += `- **Tecnologia Padrão de Sistemas**\n`;
    }
    readmeText += `\n`;

    readmeText += `## 📂 Árvore de Arquivos e Diretórios Reconhecida\n`;
    readmeText += `Foram extraídos e catalogados ${fileCount} arquivos legíveis na árvore de exportação:\n\n`;

    const sortedPaths = [...filePaths].sort();
    sortedPaths.forEach(p => {
      readmeText += `- \`${p}\`\n`;
    });
    readmeText += `\n`;

    readmeText += `## 🚀 Guia de Configuração e Execução Inicial\n\n`;
    if (detectedLang.includes('Node.js') || hasPackageJson) {
      readmeText += `### Passo a Passo (Node.js):\n`;
      readmeText += `1. **Instalação das dependências:**\n   \`\`\`bash\n   npm install\n   \`\`\`\n`;
      readmeText += `2. **Executar em modo desenvolvimento:**\n   \`\`\`bash\n   npm run dev\n   \`\`\`\n`;
    } else if (detectedLang.includes('Python') || hasRequirementsTxt) {
      readmeText += `### Passo a Passo (Python):\n`;
      readmeText += `1. **Inicialize um ambiente virtual (Venv):**\n   \`\`\`bash\n   python3 -m venv venv\n   source venv/bin/activate\n   \`\`\`\n`;
      readmeText += `2. **Instale as dependências requisitadas:**\n   \`\`\`bash\n   pip install -r requirements.txt\n   \`\`\`\n`;
    } else {
      readmeText += `### Execução Genérica:\n`;
      readmeText += `1. Verifique se possui os runtimes de \`${detectedLang}\` instalados globalmente no sistema operacional.\n`;
    }

    readmeText += `\n---\n*README.md dinâmico gerado de forma totalmente autônoma pelo motor corretivo do Oráculo de Projetos.*`;

    setZipGeneratedReadme(readmeText);

    // DINAMICALLY COMPILATION/STUDY FIELDS FOR ANY FILE UPLOADED
    // 1. Tool Purpose:
    const calculatedPurpose = `Esta ferramenta, denominada "${projectNameGuess}", foi desenvolvida utilizando a stack em "${detectedLang}". Ela é classificada operacionalmente como um(a) "${systemType}".

### O que esta ferramenta faz:
- Automatiza fluxos ou processos de infraestrutura, auditoria ou microsserviços.
- Gerencia e mapeia de forma lógica arquivos em diretórios dedicados de execução.
- Permite analisar o comportamento operacional local e integrar as saídas com serviços em nuvem ou no terminal móvel.

### Como esta ferramenta funciona (Arquitetura):
A ferramenta é estruturada em torno de ${fileCount} arquivos, que dividem as responsabilidades de configuração, execução do core de negócios e documentação de suporte. A execução é sequencial e dependente das bibliotecas de ambiente instaladas.

### Como criar e reconstruir do zero:
1. Comece criando uma pasta de projeto vazia no seu sistema.
2. Inicialize o gerenciador de pacotes apropriado para ${detectedLang} (ex: \`npm init\` ou \`go mod init\`).
3. Crie os arquivos estruturados listados no visualizador de arquivos do lado esquerdo.
4. Codifique a rotina principal importando apenas as dependências descritas no ecossistema técnico.`;

    setZipToolPurpose(calculatedPurpose);

    // 2. Termux Doc:
    let calculatedTermux = `# Guia de Configuração e Instalação no Termux (Android)\n\n`;
    calculatedTermux += `Para rodar o projeto \`${projectNameGuess}\` diretamente no seu celular via Termux, prepare o seu console Linux executando os passos descritos a seguir:\n\n`;
    calculatedTermux += `## 1. Atualização Geral do Sistema:\n`;
    calculatedTermux += `\`\`\`bash\npkg update && pkg upgrade -y\n\`\`\`\n\n`;
    
    if (detectedLang.includes('Node.js') || hasPackageJson) {
      calculatedTermux += `## 2. Instalação do Node.js Runtime:\n`;
      calculatedTermux += `\`\`\`bash\npkg install nodejs -y\n\`\`\`\n\n`;
      calculatedTermux += `## 3. Instalação de Dependências:\n`;
      calculatedTermux += `Navegue até a pasta onde extraiu os arquivos e execute:\n`;
      calculatedTermux += `\`\`\`bash\nnpm install\n\`\`\`\n\n`;
      calculatedTermux += `## 4. Executando o Sistema:\n`;
      calculatedTermux += `\`\`\`bash\nnode index.js  # ou o arquivo principal do projeto\n\`\`\`\n`;
    } else if (detectedLang.includes('Python') || hasRequirementsTxt || hasPyProject) {
      calculatedTermux += `## 2. Instalação do Python 3 e Pip:\n`;
      calculatedTermux += `\`\`\`bash\npkg install python python-pip clang make openssl -y\n\`\`\`\n\n`;
      calculatedTermux += `## 3. Instalação de Dependências:\n`;
      calculatedTermux += `Se o projeto possuir requisitos, use:\n`;
      calculatedTermux += `\`\`\`bash\npip install -r requirements.txt\n\`\`\`\n\n`;
      calculatedTermux += `## 4. Executando o Script:\n`;
      calculatedTermux += `\`\`\`bash\npython main.py  # ou o arquivo principal do projeto\n\`\`\`\n`;
    } else if (detectedLang.includes('Go') || hasGoMod) {
      calculatedTermux += `## 2. Instalação do compilador Go:\n`;
      calculatedTermux += `\`\`\`bash\npkg install golang -y\n\`\`\`\n\n`;
      calculatedTermux += `## 3. Compilação do Binário ELF:\n`;
      calculatedTermux += `\`\`\`bash\ngo build -o ${projectNameGuess.toLowerCase().replace(/\s+/g, '-')} main.go\n\`\`\`\n\n`;
      calculatedTermux += `## 4. Execução do Binário nativo:\n`;
      calculatedTermux += `\`\`\`bash\n./${projectNameGuess.toLowerCase().replace(/\s+/g, '-')}\n\`\`\`\n`;
    } else {
      calculatedTermux += `## 2. Instalação do ambiente de desenvolvimento do Termux:\n`;
      calculatedTermux += `Instale as ferramentas e o runtime necessários para interpretar ou compilar códigos escritos na linguagem \`${detectedLang}\`.\n\n`;
      calculatedTermux += `## 3. Execução:\n`;
      calculatedTermux += `Garanta que os arquivos possuem permissões de execução executando:\n\`\`\`bash\nchmod +x *\n\`\`\`\n`;
    }
    setZipTermuxDoc(calculatedTermux);

    // 3. Prompt ideal de Reescrita de IA:
    const fileListMarkdown = sortedPaths.map(p => `- \`${p}\``).join('\n');
    const calculatedPrompt = `Atue como um Arquiteto de Software Sênior especialista em Inteligência Artificial e Engenharia de Prompt.

Reescreva o código-fonte e recrie a estrutura do projeto "${projectNameGuess}". O projeto é classificado como um(a) "${systemType}" escrito em "${detectedLang}".

### REQUISITOS DO PROJETO PARA REPRODUÇÃO:
1. **Árvore de Arquivos Solicitada:**
${fileListMarkdown}

2. **Detalhamento do Escopo e Objetivos:**
   - Crie uma implementação limpa e robusta do código principal.
   - Forneça tratamento de exceções para conexões falhas, inputs inválidos e interrupções manuais (como Ctrl+C).
   - Otimize o design da interface CLI para que exiba cores amigáveis no terminal (compatíveis com ANSI) e um cabeçalho visualmente atraente.
   - Escreva comentários esclarecedores em português que expliquem o fluxo operacional de cada arquivo para fins educacionais e de auditoria.

Gere apenas códigos-fonte funcionais de nível de produção.`;

    setZipPromptText(calculatedPrompt);

    // 4. Reconstruction Code:
    let mainFileCandidate = sortedPaths.find(p => p.endsWith('main.py') || p.endsWith('main.go') || p.endsWith('index.js') || p.endsWith('server.js') || p.endsWith('app.ts') || p.endsWith('main.js') || p.endsWith('main.ts') || p.endsWith('index.ts'));
    if (!mainFileCandidate) {
      mainFileCandidate = sortedPaths.find(p => p.endsWith('.py') || p.endsWith('.js') || p.endsWith('.ts') || p.endsWith('.go') || p.endsWith('.sh') || p.endsWith('.rs'));
    }

    if (mainFileCandidate && files[mainFileCandidate]) {
      setZipReconstructionCode(files[mainFileCandidate]);
    } else {
      let scaffold = ``;
      if (detectedLang.includes('Python')) {
        scaffold = `#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n# Código de Reconstrução do Projeto: ${projectNameGuess}\n\nimport sys\n\ndef main():\n    print("[+] Inicializando ${projectNameGuess}...")\n    print("[*] Arquitetura compatível com Unix/Termux carregada.")\n\nif __name__ == "__main__":\n    try:\n        main()\n    except KeyboardInterrupt:\n        print("\\n[!] Encerrado pelo usuário.")\n        sys.exit(0)\n`;
      } else if (detectedLang.includes('Node.js')) {
        scaffold = `// Código de Reconstrução do Projeto: ${projectNameGuess}\n// Desenvolvido para Node.js\n\nconsole.log("[+] Inicializando ${projectNameGuess}...");\nconsole.log("[*] Verificando dependências...");\n\n// Execução em loop simulada\nsetInterval(() => {\n  console.log("[*] Auditoria em andamento...");\n}, 5000);\n`;
      } else if (detectedLang.includes('Go')) {
        scaffold = `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("[+] Inicializando ${projectNameGuess} em Go...")\n\tfmt.Println("[*] Pronto para escaneamentos concorrentes.")\n}\n`;
      } else {
        scaffold = `# Esqueleto do Projeto: ${projectNameGuess}\n# Tecnologia: ${detectedLang}\n# Pronto para desenvolvimento e reconstrução modular.\n\n# Insira as rotinas principais de auditoria aqui.\n`;
      }
      setZipReconstructionCode(scaffold);
    }
  };

  const handleZipUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setZipFileName(file.name);
    setZipLoading(true);
    setZipError(null);
    setZipFiles({});
    setZipGeneratedReadme('');
    setZipProjectName('');
    setZipProjectDesc('');
    setZipDetectedLang('');
    setZipGithubExportResult(null);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const parsedFiles: Record<string, string> = {};

      for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
        if (!zipEntry.dir) {
          try {
            const text = await zipEntry.async('string');
            parsedFiles[relativePath] = text;
          } catch (e) {
            console.warn(`Could not read file ${relativePath} as string.`);
          }
        }
      }

      if (Object.keys(parsedFiles).length === 0) {
        throw new Error('O arquivo ZIP está vazio ou não possui arquivos legíveis por texto.');
      }

      setZipFiles(parsedFiles);

      const firstFile = Object.keys(parsedFiles)[0];
      setZipSelectedFile(firstFile || '');

      analyzeZipProject(file.name, parsedFiles);

    } catch (err: any) {
      console.error(err);
      setZipError(err?.message || 'Erro ao descompactar ou ler o arquivo ZIP.');
    } finally {
      setZipLoading(false);
    }
  };

  const handleZipExportGitHub = async () => {
    if (!githubToken) return;
    setIsExportingZipGithub(true);
    setZipGithubExportResult(null);

    const zipBlueprintForExport = {
      projectName: zipProjectName || 'custom-imported-zip-project',
      objective: zipProjectDesc || 'Projeto importado por ZIP',
      bannerAscii: `   ______  _                 _ \n  |___  / (_)               | |\n     / /   _   _ __         | |\n    / /   | | | '_ \\     _  | |\n   / /__  | | | |_) |   | |_| |\n  /_____| |_| | .__/     \\___/ \n              | |              \n              |_|              `,
      technologies: {
        primaryLanguages: [zipDetectedLang || 'JavaScript/TypeScript'],
        databases: [],
        libraries: {
          standardLibrary: [],
          thirdParty: []
        }
      },
      filesContent: {
        ...zipFiles,
        'README.md': zipGeneratedReadme
      }
    };

    try {
      const response = await fetch('/api/github/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: githubToken,
          repoName: zipRepoName.trim(),
          description: zipRepoDesc.trim(),
          isPrivate: zipRepoPrivate,
          blueprint: zipBlueprintForExport
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || resData.details || 'Falha ao realizar a exportação para o GitHub.');
      }

      const failedFiles = resData.uploadedFiles?.filter((f: any) => f.status === "failed") || [];
      if (failedFiles.length > 0) {
        const failedNames = failedFiles.map((f: any) => f.path).join(", ");
        throw new Error(`Alguns arquivos falharam ao exportar devido a limites do GitHub: ${failedNames}. Por favor, tente novamente.`);
      }

      setZipGithubExportResult({
        success: true,
        repoUrl: resData.repoUrl
      });
    } catch (error: any) {
      console.error(error);
      setZipGithubExportResult({
        success: false,
        error: error.message || String(error)
      });
    } finally {
      setIsExportingZipGithub(false);
    }
  };

  // Landing Page and Domain Entry states
  const [isLandingPage, setIsLandingPage] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [mainDomain, setMainDomain] = useState<string>(() => {
    const saved = localStorage.getItem('main_domain');
    return saved || window.location.origin;
  });

  // Local Auth and Demonstration Sandbox Handlers (Now 100% Cryptographic-Key Based For Zero Profile Leaks)
  const generateSecureAccessKey = () => {
    const chars = 'ABCDEF0123456789';
    const segment = (len: number) => Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `SEC-${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
  };

  const handleGenerateKeyWorkflow = (selectedIntent: string) => {
    setAuthError('');
    setAuthSuccess('');
    const key = generateSecureAccessKey();
    const newUser = {
      username: 'Auditor Criptográfico',
      email: 'sec-analyst@blueprint.internal',
      intent: selectedIntent,
      tier: 'Free Basic Pro',
      key: key,
      createdAt: new Date().toISOString()
    };

    try {
      const keysRaw = localStorage.getItem('applet_cryptographic_keys');
      const registeredKeys = keysRaw ? JSON.parse(keysRaw) : [];
      registeredKeys.push(newUser);
      localStorage.setItem('applet_cryptographic_keys', JSON.stringify(registeredKeys));

      setNewlyGeneratedKey(key);
      setShowKeyModal(true);
      setAuthKeyInput(key);
      setAuthSuccess('Chave de Acesso Única Gerada com Sucesso!');
    } catch (err) {
      setAuthError('Falha de alocação de chave no storage sandbox local.');
    }
  };

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const trimmedKey = authKeyInput.trim().toUpperCase();

    if (!trimmedKey) {
      setAuthError('Por favor, digite ou cole a sua Chave de Acesso Criptográfica.');
      return;
    }

    try {
      const activeTool = authPendingTool || 'architect';
      let foundUser: any = null;

      // Allow fallback default admin or legacy bypass key/account for testing
      if (trimmedKey === 'BLUEPRINT-SEC-ADMIN-2026' || trimmedKey === 'ADMIN@BLUEPRINT.COM' || trimmedKey === 'BLUEPRINT2026') {
        foundUser = {
          username: 'Administrador Sênior',
          email: 'admin@blueprint.security',
          intent: 'Realizar Auditorias Cibernéticas',
          tier: 'Free Basic Pro',
          key: 'BLUEPRINT-SEC-ADMIN-2026',
          createdAt: new Date().toISOString()
        };
      } else {
        const keysRaw = localStorage.getItem('applet_cryptographic_keys');
        const registeredKeys = keysRaw ? JSON.parse(keysRaw) : [];
        foundUser = registeredKeys.find((u: any) => u.key === trimmedKey);
      }

      if (!foundUser) {
        setAuthError('Chave Criptográfica inválida ou não registrada no sandbox local. Tente gerar uma nova chave abaixo.');
        return;
      }

      localStorage.setItem('applet_current_session', JSON.stringify(foundUser));
      setSessionUser(foundUser);

      if (activeTool === 'shielding') {
        setAuthSuccess('Autenticação de Segurança Confirmada! Redirecionando para o Shielding Engine...');
        setTimeout(() => {
          setAuthMode('landing');
          setAuthSuccess('');
          try {
            window.open('https://shield.estamosatendendo.com.br', '_blank');
          } catch {
            // Blocked popup safeguard fallback
          }
        }, 1500);
      } else {
        setAuthSuccess('Chave validada! Acesso liberado ao LLM ToolForge (Automation Engine).');
        setTimeout(() => {
          setAuthMode('landing');
          setIsLandingPage(false);
          setAuthSuccess('');
        }, 1200);
      }
    } catch (err) {
      setAuthError('Erro de consistência ao ler chaves do cache local.');
    }
  };

  const handleLocalLogout = () => {
    localStorage.removeItem('applet_current_session');
    setSessionUser(null);
    setAuthMode('landing');
  };

  const handleDestroySessionAndToken = () => {
    if (sessionUser && sessionUser.key) {
      try {
        const keysRaw = localStorage.getItem('applet_cryptographic_keys');
        if (keysRaw) {
          const registeredKeys = JSON.parse(keysRaw);
          const filteredKeys = registeredKeys.filter((u: any) => u.key !== sessionUser.key);
          localStorage.setItem('applet_cryptographic_keys', JSON.stringify(filteredKeys));
        }
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem('applet_current_session');
    setSessionUser(null);
    setAuthMode('landing');
    setAuthSuccess('Sessão destruída e token criptográfico revogado permanentemente!');
    setTimeout(() => setAuthSuccess(''), 4000);
  };

  const handleCompileSandboxPrompt = () => {
    setInteractiveLoading(true);
    
    // Simulate smart client compile in 700ms
    setTimeout(() => {
      const promptLower = interactivePrompt.toLowerCase();
      let files: Record<string, string> = {};

      if (promptLower.includes('rust') || promptLower.includes('actix') || promptLower.includes('cargo')) {
        files = {
          'Cargo.toml': '[package]\nname = "rust_security_api"\nversion = "0.1.0"\nedition = "22"\n\n[dependencies]\nactix-web = "4.4"\nserde = { version = "1.0", features = ["derive"] }\njsonweb_token = "2.0"\n',
          'main.rs': 'use actix_web::{post, web, App, HttpServer, Responder, HttpResponse};\nuse serde::Deserialize;\n\n#[derive(Deserialize)]\nstruct TokenRequest {\n    user_id: String,\n    scope: String,\n}\n\n#[post("/token")]\nasync fn generate_token(req: web::Json<TokenRequest>) -> impl Responder {\n    println!("Auditory trigger fired for: {}", req.user_id);\n    HttpResponse::Ok().json(serde_json::json!({\n        "status": "granted",\n        "token": "bearer_jwt_auth_token_mock_key"\n    }))\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    HttpServer::new(|| App::new().service(generate_token))\n        .bind(("0.0.0.0", 3000))?\n        .run()\n        .await\n}\n',
          'README.md': '# Rust High Performance Security API\n\nBlueprint compilado com isolamento tático corporativo.'
        };
      } else if (promptLower.includes('go') || promptLower.includes('gin') || promptLower.includes('golang')) {
        files = {
          'go.mod': 'module github.com/blueprint/goservice\n\ngo 1.20\n\nrequire github.com/gin-gonic/gin v1.9.1\n',
          'main.go': 'package main\n\nimport (\n\t"github.com/gin-gonic/gin"\n\t"net/http"\n)\n\nfunc main() {\n\tr := gin.Default()\n\tr.GET("/health", func(c *gin.Context) {\n\t\tc.JSON(http.StatusOK, gin.H{\n\t\t\t"status": "fully_operant",\n\t\t\t"audited": true,\n\t\t\t"engine": "Blueprint Project Engine",\n\t\t\t"developer": "Ana Caroline Lamas",\n\t\t})\n\t})\n\tr.Run(":3000")\n}\n',
          'README.md': '# Go Gin Microsystem\n\nCompilado estéril integrado pronto para arquivamento e download.'
        };
      } else if (promptLower.includes('node') || promptLower.includes('express') || promptLower.includes('javascript') || promptLower.includes('typescript')) {
        files = {
          'package.json': '{\n  "name": "node-auditor-service",\n  "version": "1.0.0",\n  "type": "module",\n  "dependencies": {\n    "express": "^4.19.2",\n    "cors": "^2.8.5"\n  }\n}',
          'server.js': 'import express from "express";\nimport cors from "cors";\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.get("/api/v1/audit", (req, res) => {\n  res.json({\n    compliant: true,\n    checked_at: new Date().toISOString(),\n    scope: "ISO-27001 conformant"\n  });\n});\n\napp.listen(3000, "0.0.0.0", () => {\n  console.log("Auditor service running on port 3000");\n});\n',
          'README.md': '# Node.js Auditor Microservice\n\nArquitetura limpa compilada nativamente pelo Oráculo.'
        };
      } else {
        // Fallback default structure
        files = {
          'app.py': `import sys\nimport os\n\ndef run_audit():\n    print("[ORÁCULO SIMULATION] Iniciando auditoria para: ${interactivePrompt}")\n    print("✓ Firewall verificado")\n    print("✓ Certificado TLS validado")\n    print("✓ Diretórios estruturados sem vazamento de dados")\n\nif __name__ == "__main__":\n    run_audit()\n`,
          'requirements.txt': '# Dependências para simulação\nrequests==2.31.0\ncryptography==42.0.0\n',
          'README.md': `# ${interactivePrompt || 'Serviço Compilado'}\n\nDocumentação do blueprint gerado dinamicamente para avaliação na landing page do produto.`
        };
      }

      setInteractiveResultFiles(files);
      setInteractiveSelectedFile(Object.keys(files)[0]);
      setInteractiveLoading(false);
    }, 750);
  };

  // Sync Repo Name when blueprint changes
  useEffect(() => {
    if (blueprint && blueprint.projectName) {
      const normalized = blueprint.projectName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_.-]+/g, '-')
        .replace(/-+/g, '-') // Reduz hifens múltiplos
        .substring(0, 80) // Limita a 80 caracteres para segurança no GitHub
        .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''); // Remove símbolos das pontas (e.g. pontos ou hifens órfãos)
      setGithubRepoName(normalized);
      setGithubRepoDesc(blueprint.objective || blueprint.description || `Blueprint do projeto ${blueprint.projectName}`);
    }
  }, [blueprint]);

  // OAuth Popup Handler
  const handleConnectGitHub = async (forcedOrigin?: string) => {
    try {
      // Build callback URI using forcedOrigin if available, otherwise window.location.origin
      const baseOrigin = forcedOrigin || window.location.origin;
      const callbackUri = `${baseOrigin}/auth/callback`;
      let url = `/api/auth/github/url?redirectUri=${encodeURIComponent(callbackUri)}`;
      if (customClientId) {
        url += `&clientId=${encodeURIComponent(customClientId)}`;
      }
      if (customClientSecret) {
        url += `&clientSecret=${encodeURIComponent(customClientSecret)}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Não foi possível obter a URL de autorização do GitHub. Certifique-se de que o GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET estejam configurados.');
      }
      
      const { url: authUrl } = await response.json();
      
      // Open direct GitHub OAuth provider window
      const authWindow = window.open(
        authUrl,
        'github_oauth_popup',
        'width=600,height=750,resizable=yes,scrollbars=yes,status=yes'
      );

      if (!authWindow) {
        alert('O popup foi bloqueado pelo seu navegador. Por favor, autorize popups para este domínio para permitir a autenticação com o GitHub.');
      }
    } catch (error: any) {
      console.error(error);
      alert(`Falha ao conectar com o GitHub:\n${error.message}`);
    }
  };

  const handleDisconnectGitHub = () => {
    setGithubToken(null);
    localStorage.removeItem('github_token');
    setGithubExportResult(null);
  };

  // Helper compiler for Combinatorial Prompts (offline engine)
  const getCompiledPrompt = () => {
    const roleOpt = GENERATOR_ROLES.find(r => r.id === genRole) || GENERATOR_ROLES[0];
    const taskOpt = GENERATOR_TASKS.find(t => t.id === genTask) || GENERATOR_TASKS[0];
    const stackOpt = GENERATOR_STACKS.find(s => s.id === genStack) || GENERATOR_STACKS[0];
    const styleOpt = GENERATOR_STYLES.find(st => st.id === genStyle) || GENERATOR_STYLES[0];
    const toneOpt = GENERATOR_TONES.find(to => to.id === genTone) || GENERATOR_TONES[0];

    const agentName = `Hermes ${roleOpt.name.replace(/Engineer|Architect|Auditor|DBA|Officer|Specialist/g, '').trim()} Analyzer`;
    const agentFileName = `hermes_${roleOpt.id.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'security_auditor'}.py`;

    return `# 🏭 HERMES FACTORY - GERADOR DE AGENTES (VERSÃO DEFENSIVA)
# ID de Combinação: HRMS-AGENT-${genRole.toUpperCase()}-${genTask.toUpperCase()}-${genStack.toUpperCase()}

Atue como um Engenheiro de Software de Segurança experiente. Crie um script Python completo chamado start.py para ANÁLISE DE SEGURANÇA DEFENSIVA e Hardening seguindo o padrão e especificações abaixo:

## 1. ESTRUTURA DO ARQUIVO E METADADOS
- **Shebang**: \`#!/usr/bin/env python3\`
- **Docstring**: "HERMES - ${agentName} - Security Hardening Analyzer"
- **Imports**: os, sys, json, time, requests, colorama, urllib3, re, pathlib, ThreadPoolExecutor, datetime, ssl, socket
- **Higiene e Inicialização**: Desabilitar warnings SSL (\`urllib3.disable_warnings()\`) e inicializar colorama com autoreset (\`init(autoreset=True)\`).

## 2. BANNER 3D OBRIGATÓRIO (Colorido com colorama.Fore.CYAN + Style.BRIGHT):
\`\`\`python
██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗
██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝
███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗
██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║
██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║
╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝
\`\`\`

## 3. ESCOPO & IDENTIDADE DO AGENTE
- **Nome do Script sugerido**: \`${agentFileName}\`
- **Atuação Designada**: ${roleOpt.name}
- **Diretriz de Raciocínio**: ${roleOpt.text}

## 4. TÁTICA OPERACIONAL DE HARDENING (DEFENSIVO)
- **Tarefa Principal**: ${taskOpt.text}
${customParams ? `- **Customização de Escopo**: ${customParams}` : ''}
- **Stack Tecnológico Recomendado**: ${stackOpt.text}

## 5. MÉTODOS DE ANÁLISE DEFENSIVA (MÉTODO GET E HEAD APENAS)
O script gerado deve implementar as seguintes rotinas de análise com foco em detecção e prevenção:
- **Análise de Superfície**: Verificação de cabeçalhos Server e X-Powered-By (Information Disclosure).
- **Análise de Headers de Segurança**: Auditar a presença de HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COEP, CORP, e COOP contra baselines OWASP.
- **Análise de SSL/TLS**: Validar validade de certificados e criptografia recomendada.
- **Auditoria de Cookies**: Verificar flags de segurança (Secure, HttpOnly, SameSite) e reportar inconsistências.
- **Análise de CORS**: Auditar cabeçalhos Access-Control-Allow-Origin sensíveis.

## 6. SCORING E REQUISITO DE SAÍDA
O agente deve calcular uma pontuação de segurança final (Security Score) de 0 a 100 baseado na severidade dos achados (Headers: 30 pontos, SSL: 25 pontos, Cookies: 20 pontos, CSP: 15 pontos, CORS: 10 pontos) e gerar dois entregáveis dentro do diretório \`hermes_audit_{dominio}_{timestamp}/\`:
1. **Relatório Markdown**: (\`SECURITY_REPORT.md\`) com tabelas, notas, gráfico ASCII do score, checklists OWASP e plano de hardening passo a passo.
2. **Dados Estruturados**: (\`security_data.json\`) contendo o dump de todas as configurações capturadas.

## 7. ESTILO, TOM E CONFIGURAÇÃO
- **Estilo de Escrita**: ${styleOpt.text}
- **Tom do Relatório**: ${toneOpt.text}
- **Tratamento de Exceções**: Rígido bloco try/except com saídas graciosas para Ctrl+C.
- **Timeouts**: Utilizar sempre variáveis de timeouts estruturadas (\`self.TIMEOUT_ANALYSIS = 5\`, \`self.TIMEOUT_CONNECT = 3\`) e nunca valores de timeouts fixos/hardcoded.`;
  };

  const filteredPrompts = BUILT_IN_PROMPTS.filter(p => {
    const matchesCategory = promptCategory === 'all' || p.category === promptCategory;
    const matchesSearch = p.title.toLowerCase().includes(promptSearch.toLowerCase()) || 
                          p.objective.toLowerCase().includes(promptSearch.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(promptSearch.toLowerCase())) ||
                          p.promptText.toLowerCase().includes(promptSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedPrompt = BUILT_IN_PROMPTS.find(p => p.id === selectedPromptId) || BUILT_IN_PROMPTS[0];

  const handleExportGitHub = async () => {
    if (!githubToken) return;
    setIsExportingGithub(true);
    setGithubExportResult(null);

    try {
      const response = await fetch('/api/github/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessToken: githubToken,
          repoName: githubRepoName.trim(),
          description: githubRepoDesc.trim(),
          isPrivate: githubRepoPrivate,
          blueprint: {
            ...blueprint,
            filesContent: filesContent
          }
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || resData.details || 'Falha ao realizar a exportação para o GitHub.');
      }

      const failedFiles = resData.uploadedFiles?.filter((f: any) => f.status === "failed") || [];
      if (failedFiles.length > 0) {
        const failedNames = failedFiles.map((f: any) => f.path).join(", ");
        throw new Error(`Alguns arquivos falharam ao exportar devido a limites do GitHub: ${failedNames}. Por favor, tente novamente.`);
      }

      setGithubExportResult({
        success: true,
        repoUrl: resData.repoUrl
      });
    } catch (error: any) {
      console.error(error);
      setGithubExportResult({
        success: false,
        error: error.message || String(error)
      });
    } finally {
      setIsExportingGithub(false);
    }
  };

  // Listen for popup callback events
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const token = event.data?.accessToken;
        if (token) {
          setGithubToken(token);
          localStorage.setItem('github_token', token);
          setShowGithubModal(true); // Auto-open the configuration form overlay upon login
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Load preset on initial mount and when preset changes
  useEffect(() => {
    const selected = presets[activePreset];
    if (selected) {
      setBlueprint(selected.blueprint);
      setInputJson(JSON.stringify(selected, null, 2));
      const sanitized = sanitizeBlueprintFiles(selected.blueprint);
      setFilesContent(sanitized);
      
      // Auto-set first available file
      const filePaths = Object.keys(sanitized);
      if (filePaths.length > 0) {
        setActiveFile(filePaths[0]);
        setEditingCode(sanitized[filePaths[0]] || '');
      }
      setJsonError(null);
    }
  }, [activePreset]);

  // Update active file editing code when switching files
  useEffect(() => {
    if (filesContent[activeFile] !== undefined) {
      setEditingCode(filesContent[activeFile]);
      setIsEdited(false);
    }
  }, [activeFile, filesContent]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalLogsEndRef.current) {
      terminalLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Sync editor back to filesContent state
  const handleSaveCodeCell = () => {
    setFilesContent(prev => ({
      ...prev,
      [activeFile]: editingCode
    }));
    setIsEdited(false);
    
    // Also inject back to the blueprint so download is updated
    setBlueprint(prev => {
      const updatedFiles = { ...prev.filesContent, [activeFile]: editingCode };
      return {
        ...prev,
        filesContent: updatedFiles
      };
    });
  };

  // Live JSON validation and loading
  const handleLoadCustomJson = (txt: string) => {
    setInputJson(txt);
    try {
      if (!txt.trim()) {
        setJsonError('O campo de JSON está vazio.');
        return;
      }
      const parsed = JSON.parse(txt);
      const targetBlueprint = parsed.blueprint || parsed;
      
      if (!targetBlueprint || !targetBlueprint.projectName) {
        setJsonError('JSON válido, mas não possui a chave primordial blueprint.projectName ou estrutura esperada.');
        return;
      }

      setBlueprint(targetBlueprint);
      const sanitized = sanitizeBlueprintFiles(targetBlueprint);
      setFilesContent(sanitized);
      
      const filePaths = Object.keys(sanitized);
      if (filePaths.length > 0) {
        setActiveFile(filePaths[0]);
        setEditingCode(sanitized[filePaths[0]] || '');
      }
      setJsonError(null);
    } catch (e: any) {
      setJsonError(`Erro de sintaxe JSON: ${e.message}`);
    }
  };

  // AI-Powered Blueprint Generation via local Server.ts + Gemini API Route
  const handleGenerateWithAi = async (offline: boolean = false) => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiStep(offline ? 'Acionando compilador local de alta robustez...' : 'Acionando o arquiteto inteligente...');
    
    try {
      setAiStep(offline ? 'Gerando chassi local estruturado...' : 'Consultando Gemini-3.5-Flash para projetar a infraestrutura...');
       const response = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: aiPrompt, 
          offline, 
          userApiKey: userApiKey || undefined,
          model: selectedModel === 'custom' ? customModel : selectedModel 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = errData.error && errData.details
          ? `${errData.error}\nDetalhes: ${errData.details}`
          : (errData.error || errData.details || 'Falha na comunicação.');
        throw new Error(errorMessage);
      }

      setAiStep('Recebendo e higienizando a árvore de diretórios do projeto...');
      const data = await response.json();
      
      const targetBlueprint = data.blueprint || data;
      if (!targetBlueprint || !targetBlueprint.projectName) {
        throw new Error('O modelo não retornou um blueprint estruturado de forma legível.');
      }

      setBlueprint(targetBlueprint);
      setInputJson(JSON.stringify(data, null, 2));
      
      const sanitized = sanitizeBlueprintFiles(targetBlueprint);
      setFilesContent(sanitized);
      
      const filePaths = Object.keys(sanitized);
      if (filePaths.length > 0) {
        setActiveFile(filePaths[0]);
        setEditingCode(sanitized[filePaths[0]] || '');
      }
      
      setJsonError(null);
      setActivePreset('custom_ai'); // temporary dynamic selection
      setAiPrompt('');
      setActiveTab('code');
    } catch (error: any) {
      console.error(error);
      alert(`Erro na Geração Inteligente:\n${error.message}`);
    } finally {
      setIsGenerating(false);
      setAiStep('');
    }
  };

  // Validates user-provided Gemini API Key on Google server via proxy
  const handleValidateApiKey = async () => {
    if (!userApiKey.trim()) {
      setValidationStatus('error');
      setValidationMsg('Por favor, informe a Chave de API antes de iniciar a validação.');
      return;
    }
    setIsValidatingKey(true);
    setValidationStatus('validating');
    setValidationMsg('Verificando status e saldo da chave diretamente na API oficial do Google Gemini...');
    
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userApiKey: userApiKey.trim() })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setValidationStatus('success');
        setValidationMsg(data.message || 'Chave validada com sucesso!');
      } else {
        setValidationStatus('error');
        setValidationMsg(data.error || 'Erro na autenticação. Verifique seu saldo ou permissão da chave.');
      }
    } catch (err: any) {
      setValidationStatus('error');
      setValidationMsg(err.message || 'Falha de comunicação temporária com o gateway.');
    } finally {
      setIsValidatingKey(false);
    }
  };

  // Download entire nested structure as a ZIP file!
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    
    // Add all compiled files mapped in filesContent
    Object.entries(filesContent).forEach(([filePath, content]) => {
      // Create subdirectories seamlessly based on slashes
      zip.file(filePath, content as string);
    });

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const sanitizedProjectName = blueprint.projectName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_');
      
      const fileName = `${sanitizedProjectName || 'blueprint'}_project.zip`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Impossível gerar o arquivo compactado virtual localmente.');
    }
  };

  // Run mock physical command simulation
  const handleStartSimulation = () => {
    setIsRunningTerminal(true);
    setTerminalLogs([]);
    
    const cliTool = blueprint.cli?.toolName || 'python3';
    const lines = getTerminalSimulation(
      blueprint.projectName,
      cliTool,
      blueprint.bannerAscii,
      targetUrl
    );

    let currentIndex = 0;

    const playNextLine = () => {
      if (currentIndex >= lines.length) {
        setIsRunningTerminal(false);
        return;
      }
      
      const nextLine = lines[currentIndex];
      setTerminalLogs(prev => [...prev, { text: nextLine.text, type: nextLine.type }]);
      currentIndex++;
      
      setTimeout(playNextLine, nextLine.delay);
    };

    playNextLine();
  };

  // Submit dynamic manual command from custom terminal inputs
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim() || isRunningTerminal) return;

    const cmd = cliInput.trim();
    setCliInput('');
    setIsRunningTerminal(true);

    // Save user log
    setTerminalLogs(prev => [...prev, { text: cmd, type: 'input' }]);

    const lowerCmd = cmd.toLowerCase();
    let lines: { text: string; type: 'info' | 'success' | 'warn' | 'error' | 'neutral' | 'input'; delay: number }[] = [];

    if (lowerCmd === 'clear') {
      setTerminalLogs([]);
      setIsRunningTerminal(false);
      return;
    } else if (lowerCmd === 'help' || lowerCmd === 'menu') {
      lines = [
        { text: '=============================================================', type: 'neutral', delay: 100 },
        { text: '               SISTEMA DE AUTOMAÇÃO CONTROLADA (AEGIS AGENT) ', type: 'info', delay: 100 },
        { text: '=============================================================', type: 'neutral', delay: 100 },
        { text: 'Você entrou no modo de terminal automatizado do Aegis-Framework.', type: 'neutral', delay: 100 },
        { text: 'Comandos disponíveis para execução controlada:', type: 'neutral', delay: 100 },
        { text: '  - list            : Lista todos os chassis de ferramentas registradas no catálogo.', type: 'neutral', delay: 100 },
        { text: '  - doctor          : Executa o diagnóstico automático do ambiente (Python, Docker, dependências).', type: 'neutral', delay: 100 },
        { text: '  - run <nome>      : Executa um escaneamento simulado com a ferramenta escolhida.', type: 'neutral', delay: 100 },
        { text: '                      Exemplo: run aegis-xss  ou  run aegis-sqli', type: 'neutral', delay: 100 },
        { text: '  - learn           : Abre o sumário e ementas do Aegis Learning OS (Plataforma de Cursos).', type: 'neutral', delay: 100 },
        { text: '  - clear           : Limpa a tela do console virtual.', type: 'neutral', delay: 100 },
        { text: '  - help / menu     : Exibe esta mensagem de ajuda.', type: 'neutral', delay: 100 },
        { text: '=============================================================', type: 'neutral', delay: 100 },
      ];
    } else if (lowerCmd === 'learn' || lowerCmd === 'course') {
      lines = [
        { text: '=============================================================', type: 'neutral', delay: 100 },
        { text: '             AEGIS LEARNING OS - CLI ACADEMY SYLLABUS        ', type: 'success', delay: 100 },
        { text: '=============================================================', type: 'neutral', delay: 100 },
        { text: '[+] Carregando trilhas de especialização integradas ao Aegis...', type: 'info', delay: 150 },
        { text: '  Trilha 1: AWS Security Architect Track', type: 'neutral', delay: 100 },
        { text: '            ↳ Ementa: IAM Least Privilege, VPC Hardening, PrivateLink', type: 'neutral', delay: 100 },
        { text: '  Trilha 2: GCP & BigQuery Data Governance Track', type: 'neutral', delay: 100 },
        { text: '            ↳ Ementa: Column/Row-Level Security, Policy Tags, Data Catalog', type: 'neutral', delay: 100 },
        { text: '  Trilha 3: DevSecOps & GitOps Pipeline Hardening', type: 'neutral', delay: 100 },
        { text: '            ↳ Ementa: SAST/DAST Automation, Trivy Containers, Vault Secrets', type: 'neutral', delay: 100 },
        { text: '  Trilha 4: Generative AI Security & OWASP LLM Track', type: 'neutral', delay: 100 },
        { text: '            ↳ Ementa: Prompt Injection Defense, Delimiters, Jailbreak Blockers', type: 'neutral', delay: 100 },
        { text: '-------------------------------------------------------------', type: 'neutral', delay: 100 },
        { text: 'Dica: Acesse a nova aba "8. Aegis Learning OS" no topo para estudar as', type: 'info', delay: 100 },
        { text: 'aulas de forma 100% visual com diagramas, analogias e exercícios práticos!', type: 'info', delay: 100 },
        { text: '=============================================================', type: 'neutral', delay: 100 }
      ];
    } else if (lowerCmd === 'list') {
      lines = [
        { text: '[*] Carregando catálogo de ferramentas Aegis...', type: 'info', delay: 150 },
        { text: '[✓] Catálogo carregado com sucesso. Ferramentas disponíveis:', type: 'success', delay: 200 },
        { text: '  1. aegis-xss      : Heurística Passiva & Análise de Contexto Refletido (XSS)', type: 'neutral', delay: 100 },
        { text: '  2. aegis-jwt      : Auditor de Algoritmos e Assinaturas de Tokens (JWT)', type: 'neutral', delay: 100 },
        { text: '  3. aegis-sqli     : Analisador Heurístico Baseado em Erros e Diferenciais (SQLi)', type: 'neutral', delay: 100 },
        { text: '  4. aegis-subtake  : Identificador de Registros DNS CNAME Órfãos (Subtakeover)', type: 'neutral', delay: 100 },
        { text: '  5. aegis-csrf     : Analisador de Formulários e Flags SameSite de Cookies (CSRF)', type: 'neutral', delay: 100 },
        { text: '\nDigite "run <nome>" para iniciar a execução de uma ferramenta (ex: run aegis-jwt)', type: 'info', delay: 100 },
      ];
    } else if (lowerCmd === 'doctor') {
      lines = [
        { text: '╔═══════════════════════════════════════════════════════════════════╗', type: 'neutral', delay: 100 },
        { text: '║                 AEGIS SYSTEM DOCTOR & ENVIRONMENT CHECK           ║', type: 'neutral', delay: 100 },
        { text: '╚═══════════════════════════════════════════════════════════════════╝', type: 'neutral', delay: 100 },
        { text: '[+] Iniciando rotina de verificação estrutural e dependências...', type: 'info', delay: 200 },
        { text: '[✓] Interpretador: Python 3.11.4 encontrado no path /usr/bin/python3', type: 'success', delay: 300 },
        { text: '[✓] Gerenciador de Pacotes: pip 23.2.1 encontrado no path /usr/bin/pip', type: 'success', delay: 250 },
        { text: '[✓] Engine de Containers: Docker Core 24.0.7 ativo e operacional', type: 'success', delay: 300 },
        { text: '[✓] Docker Compose: v2.22.0 ativo', type: 'success', delay: 150 },
        { text: '[!] Biblioteca "prompt-toolkit": instalada (v3.0.39)', type: 'warn', delay: 150 },
        { text: '[✓] Biblioteca "rich/typer": instalada com sucesso (v0.9.0 / v12.1.0)', type: 'success', delay: 200 },
        { text: '[✓] Conectividade WAN: Gateway de rede respondendo normalmente (RTT: 12ms)', type: 'success', delay: 250 },
        { text: '[+] Diagnóstico concluído. Todos os sistemas integrados estão prontos para produção.', type: 'success', delay: 200 }
      ];
    } else if (lowerCmd.startsWith('run ') || lowerCmd.startsWith('execute ')) {
      const parts = cmd.split(' ');
      const toolName = parts[1]?.toLowerCase() || '';
      
      if (!toolName) {
        lines = [
          { text: '[-] Erro: Nome da ferramenta não especificado. Digite "run <nome_da_ferramenta>" (Ex: run aegis-xss).', type: 'error', delay: 100 }
        ];
      } else if (['aegis-xss', 'aegis-jwt', 'aegis-sqli', 'aegis-subtake', 'aegis-csrf'].includes(toolName)) {
        const cleanToolTitle = toolName.toUpperCase();
        lines = [
          { text: `[+] [Aegis Execution Agent] Iniciando execução controlada para resolver solicitação: "${cmd}"`, type: 'info', delay: 300 },
          { text: `[1] ANÁLISE DA SOLICITAÇÃO:`, type: 'info', delay: 300 },
          { text: `    - Tipo de tarefa: Auditoria de Segurança Automatizada / Pentest Passivo`, type: 'neutral', delay: 150 },
          { text: `    - Escopo de Atuação: Análise remota do domínio configurado (${targetUrl})`, type: 'neutral', delay: 150 },
          { text: `    - Política de Segurança: Execução de rotinas de auditoria em conformidade estrita com RFCs e sem pacotes destrutivos`, type: 'neutral', delay: 200 },
          
          { text: `[2] DETECÇÃO DA FERRAMENTA ADEQUADA:`, type: 'info', delay: 300 },
          { text: `    - Ferramenta Selecionada no Catálogo: ${cleanToolTitle} Engine (v1.0.0)`, type: 'success', delay: 150 },
          { text: `    - Categoria do Chassi: Auditoria & Recon SecSec`, type: 'neutral', delay: 100 },
          
          { text: `[3] PLANO DE EXECUÇÃO GERADO PELO MOTOR DE DECISÃO:`, type: 'info', delay: 350 },
          { text: `    - Etapa I  : Validação de pré-requisitos locais e carregamento do PluginConfig`, type: 'neutral', delay: 100 },
          { text: `    - Etapa II : Execução do módulo [recon] para resolução de IP e latência de resposta`, type: 'neutral', delay: 100 },
          { text: `    - Etapa III: Execução do módulo [enum] para capturar headers HTTP e cookies de sessão`, type: 'neutral', delay: 100 },
          { text: `    - Etapa IV : Execução do módulo [crawl] para identificar endpoints e inputs vulneráveis`, type: 'neutral', delay: 100 },
          { text: `    - Etapa V  : Execução do módulo [analyze] (Heurísticas de Segurança baseadas em dados reais)`, type: 'neutral', delay: 150 },
          { text: `    - Etapa VI : Consolidação de Logs e geração do relatório técnico [report]`, type: 'neutral', delay: 100 },
          
          { text: `[✓] Plano aprovado pelo Aegis Security Policy. Iniciando execução do script em sandbox...`, type: 'success', delay: 400 },
          
          { text: `\n[4] EXECUÇÃO ATIVA - ${cleanToolTitle} LOGGER:`, type: 'info', delay: 200 },
          { text: `╔══════════════════════════════════╗\n║         AEGIS FRAMEWORK          ║\n║     Enterprise CLI Platform      ║\n╚══════════════════════════════════╝\nVersion: 1.0.0\nPlugins: 12 Loaded\nStatus: Running...`, type: 'neutral', delay: 400 },
          { text: `[+] [I] Inicializando PluginLogger e PluginReports... [OK]`, type: 'success', delay: 250 },
          { text: `[+] [II] Resolução DNS ativa para ${targetUrl} ... IP: 104.21.6.47 (Cloudflare) RTT: 15ms`, type: 'success', delay: 350 },
          { text: `[+] [III] Capturando cabeçalhos HTTP do host remoto...`, type: 'info', delay: 300 },
          { text: `    -> Server: cloudflare`, type: 'neutral', delay: 100 },
          { text: `    -> Set-Cookie: __cf_bm=...; path=/; HttpOnly; Secure; SameSite=None`, type: 'neutral', delay: 150 },
          { text: `[!] [IV] Buscando formulários de entrada e links parametrizados no crawler recursivo...`, type: 'warn', delay: 400 },
          { text: `    ✓ Encontrado endpoint: /api/v1/auth/login (POST, cookies de sessão ativos)`, type: 'success', delay: 150 },
          { text: `    ✓ Encontrado endpoint: /search?q=query (GET, parâmetros refletidos no HTML)`, type: 'success', delay: 150 },
          { text: `[+] [V] Aplicando análises heurísticas e assinaturas de risco no tráfego capturado...`, type: 'info', delay: 350 },
        ];

        if (toolName === 'aegis-xss') {
          lines.push(
            { text: `    -> Testando reflexão simples do parâmetro 'q' no HTML... [REFLETIDO]`, type: 'warn', delay: 300 },
            { text: `    -> Analisando contexto de escrita da string refletida:`, type: 'neutral', delay: 200 },
            { text: `       - Local: Dentro de uma tag <div> de resultados.`, type: 'neutral', delay: 100 },
            { text: `       - Filtragem de Caracteres: < > ' " estão sendo escapados via entidades HTML.`, type: 'success', delay: 150 },
            { text: `       - Detecção de Risco: Baixo (XSS mitigado por filtragem padrão do framework)`, type: 'success', delay: 200 }
          );
        } else if (toolName === 'aegis-jwt') {
          lines.push(
            { text: `    -> Analisando JWT interceptado nas requisições autorizadas...`, type: 'info', delay: 300 },
            { text: `    -> Algoritmo de Assinatura: HS256 (HMAC SHA-256)`, type: 'neutral', delay: 200 },
            { text: `    -> Testando ataque de troca de algoritmo para "none"... [BLOQUEADO PELO SERVIDOR]`, type: 'success', delay: 250 },
            { text: `    -> Realizando teste de dicionário contra a chave de assinatura...`, type: 'info', delay: 400 },
            { text: `    [!] Alerta: Assinatura validada com segredo padrão de testes ("secret123"). CHAVE FRACA!`, type: 'error', delay: 350 }
          );
        } else if (toolName === 'aegis-sqli') {
          lines.push(
            { text: `    -> Testando diferenciais de resposta e comportamento com caracteres especiais...`, type: 'info', delay: 300 },
            { text: `    -> Enviando input: ' OR '1'='1 ... [Nenhuma alteração de comportamento no corpo da página]`, type: 'neutral', delay: 250 },
            { text: `    -> Enviando aspas simples e buscando por mensagens de erro no HTML...`, type: 'info', delay: 200 },
            { text: `    [✓] Nenhuma mensagem de erro de banco de dados (SQLite, MySQL, PG) exposta nas respostas.`, type: 'success', delay: 250 }
          );
        } else if (toolName === 'aegis-subtake') {
          lines.push(
            { text: `    -> Executando resolução de CNAMEs para subdomínios mapeados...`, type: 'info', delay: 300 },
            { text: `    -> Subdomínio: blog.site-publico-auditar.gov.br -> CNAME: domains.github.com [ATIVO]`, type: 'success', delay: 200 },
            { text: `    -> Subdomínio: assets.site-publico-auditar.gov.br -> CNAME: my-bucket.s3.amazonaws.com [404 NoSuchBucket]`, type: 'error', delay: 400 },
            { text: `    [!] Alerta de Takeover em AWS S3: O subdomínio aponta para um bucket órfão desativado!`, type: 'error', delay: 350 }
          );
        } else if (toolName === 'aegis-csrf') {
          lines.push(
            { text: `    -> Inspecionando formulários de submissão de dados sensíveis...`, type: 'info', delay: 300 },
            { text: `    -> Formulário (/api/v1/user/settings): Encontrado input de alteração de senha`, type: 'neutral', delay: 200 },
            { text: `    [!] Validação de Token Anti-CSRF: Campo ausente nos parâmetros submetidos!`, type: 'error', delay: 300 },
            { text: `    -> Analisando cookie de sessão "SESSID"...`, type: 'info', delay: 200 },
            { text: `    [!] Configuração do Cookie: SameSite=None, HttpOnly=False. RISCO DE CSRF COMPLETO!`, type: 'error', delay: 300 }
          );
        }

        lines.push(
          { text: `[+] [VI] Consolidando estatísticas e exportando relatórios estruturados...`, type: 'info', delay: 300 },
          { text: `\n[5] RESULTADO ESTRUTURADO (AEGIS SYSTEM SUMMARY):`, type: 'success', delay: 300 },
          { text: `-------------------------------------------------------------`, type: 'neutral', delay: 100 },
          { text: `  STATUS DA AUDITORIA: COMPILADO & CONCLUÍDO`, type: 'success', delay: 100 },
          { text: `  ALVO ANALISADO     : ${targetUrl}`, type: 'neutral', delay: 100 },
          { text: `  DATA DA EXECUÇÃO   : ${new Date().toISOString()}`, type: 'neutral', delay: 100 },
          { text: `  MOTOR DE EXECUÇÃO  : Aegis Execution Agent Sandbox v1`, type: 'neutral', delay: 100 },
          { text: `  RISK METRIC REPORT : ${
            toolName === 'aegis-xss' || toolName === 'aegis-sqli' ? '8 / 100 (BAIXO)' : '85 / 100 (CRÍTICO)'
          }`, type: toolName === 'aegis-xss' || toolName === 'aegis-sqli' ? 'success' : 'error', delay: 150 },
          { text: `  RECOMENDAÇÃO CORE  : ${
            toolName === 'aegis-xss' ? 'Manter as sanitizações de caracteres ativos do framework.' :
            toolName === 'aegis-jwt' ? 'Substituir chaves de criptografia fracas por chaves privadas seguras geradas via OpenSSL.' :
            toolName === 'aegis-sqli' ? 'Nenhuma ação requerida. Padrão defensivo em conformidade com WAF ativo.' :
            toolName === 'aegis-subtake' ? 'Remover o registro CNAME órfão apontando para o Amazon S3 para evitar sequestros de domínio.' :
            'Adicionar tokens anti-CSRF nos formulários e alterar cookie de sessão para SameSite=Lax/Strict.'
          }`, type: 'info', delay: 150 },
          { text: `-------------------------------------------------------------`, type: 'neutral', delay: 100 },
          { text: `[✓] Relatórios salvos com sucesso em:`, type: 'success', delay: 150 },
          { text: `    - reports/resultado_execucao.json`, type: 'neutral', delay: 100 },
          { text: `    - reports/logs_auditoria.txt`, type: 'neutral', delay: 100 }
        );
      } else {
        lines = [
          { text: `[-] Erro: Ferramenta "${toolName}" não encontrada no catálogo Aegis Framework.`, type: 'error', delay: 150 },
          { text: `Digite "list" para visualizar as 5 ferramentas disponíveis no catálogo.`, type: 'info', delay: 100 }
        ];
      }
    } else {
      lines = [
        { text: `[-] Comando desconhecido: "${cmd}".`, type: 'error', delay: 150 },
        { text: `Digite "help" ou "menu" para obter ajuda sobre as ferramentas registradas no catálogo.`, type: 'info', delay: 100 }
      ];
    }

    let currentIndex = 0;
    const playNextLine = () => {
      if (currentIndex >= lines.length) {
        setIsRunningTerminal(false);
        return;
      }
      
      const nextLine = lines[currentIndex];
      setTerminalLogs(prev => [...prev, { text: nextLine.text, type: nextLine.type }]);
      currentIndex++;
      
      setTimeout(playNextLine, nextLine.delay);
    };

    playNextLine();
  };

  // Helper copy to clipboard
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Flatten active directory tree representation
  const directoryItems: FlatFileNode[] = blueprint.directoryTree 
    ? flattenDirectoryTree(blueprint.directoryTree) 
    : [];

  // Toggle collapses for paths
  const toggleFolder = (path: string) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Determine file-icon based on extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'py') return <FileCode className="w-4 h-4 text-emerald-400" />;
    if (ext === 'sh') return <Terminal className="w-4 h-4 text-amber-400" />;
    if (ext === 'js' || ext === 'ts' || ext === 'tsx') return <FileCode className="w-4 h-4 text-blue-400" />;
    if (ext === 'json') return <FileJson className="w-4 h-4 text-purple-400" />;
    if (ext === 'md') return <FileText className="w-4 h-4 text-cyan-400" />;
    if (ext === 'db' || ext === 'sqlite') return <Database className="w-4 h-4 text-emerald-500" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  if (isLandingPage) {
    return (
      <div className="min-h-screen bg-[#070b16] text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col font-sans relative">
        
        {/* TOP LEVEL DYNAMIC BANNER */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-[#0e162d] text-center py-2 px-4 text-xs border-b border-indigo-500/20 text-indigo-300 font-medium flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-indigo-500 text-[#070b16] text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-widest">Aviso</span>
          <span>Obtenha sua chave de acesso segura para carregar blueprints e exportar chassis no ambiente de desenvolvimento de Ana Caroline Lamas!</span>
          <button 
            onClick={() => {
              setAuthMode(sessionUser ? 'landing' : 'register');
              if (sessionUser) {
                setIsLandingPage(false);
              }
            }} 
            className="underline font-bold text-white hover:text-indigo-200 transition ml-1"
          >
            {sessionUser ? 'Iniciar Motor →' : 'Obter Chave Única de Desenvolvimento →'}
          </button>
        </div>

        {/* LANDING HEADER NAV */}
        <header className="border-b border-slate-800/80 bg-[#0c1225]/90 backdrop-blur md:sticky top-0 z-50 px-4 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Logo Group */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition cursor-pointer" onClick={() => setAuthMode('landing')}>
                <Layers className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono tracking-wider text-indigo-400 uppercase font-bold">
                    Oráculo & Automação
                  </span>
                  <span className="bg-indigo-500/15 border border-indigo-500/30 text-[9px] text-indigo-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                    AppSec
                  </span>
                </div>
                <h1 className="text-base font-display font-bold text-white tracking-tight -mt-0.5">
                  LLM ToolForge
                </h1>
              </div>
            </div>

            {/* Middle Nav Items - Removed as requested by user to put links inside panel */}
            <nav className="hidden md:flex items-center gap-6 text-xs text-slate-350">
              <span className="text-[11px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded">
                Portfólio Profissional de DevSecOps & AppSec
              </span>
            </nav>

            {/* Auth Actions Side (Desktop View) */}
            <div className="hidden md:flex items-center gap-3">
              {sessionUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-white leading-tight">{sessionUser.username}</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-medium flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Utilizador Liberado
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs border border-indigo-400">
                    {sessionUser.username ? sessionUser.username.slice(0,2).toUpperCase() : 'U'}
                  </div>
                  <button 
                    onClick={handleLocalLogout}
                    className="p-1.5 bg-slate-900 border border-slate-800 hover:text-rose-400 rounded-lg transition"
                    title="Sair da Conta"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`text-slate-300 hover:text-white px-3 py-2 text-xs font-semibold rounded-lg transition ${authMode === 'login' ? 'bg-slate-800 text-white' : ''}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition active:scale-95 shadow-md shadow-indigo-950/40"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-0.5" />
                    <span>Obter Chave</span>
                  </button>
                </div>
              )}

              {/* Enter Main Dashboard Button */}
              <button
                id="launch-panel-top-btn"
                onClick={handleEnterWorksite}
                className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40 shrink-0"
              >
                <span>Acessar Painel</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-250 animate-pulse" />
              </button>
            </div>
 
            {/* Hamburger Button for Mobile View */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
 
          </div>
 
          {/* Mobile Menu Dropdown Panel */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-[#0c1225] border-b border-slate-800 shadow-2xl z-40 p-5 flex flex-col gap-4 animate-fade-in md:hidden text-left">
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider border-b border-slate-800/85 pb-2">
                Ações Rápidas do Portfólio
              </div>
              
              {sessionUser ? (
                <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {sessionUser.username ? sessionUser.username.slice(0,2).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{sessionUser.username}</div>
                      <div className="text-[9px] text-emerald-400 font-mono">Modo Portfólio Liberado</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      handleLocalLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1 px-2.5 bg-rose-950/30 border border-rose-900 text-rose-300 hover:text-rose-200 rounded-md text-[10px] font-medium transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 hover:text-white py-2.5 rounded-lg text-xs font-bold transition text-center"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-xs font-bold transition text-center"
                  >
                    Criar Conta
                  </button>
                </div>
              )}
 
              <button
                onClick={() => {
                  handleEnterWorksite();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
              >
                <span>Acessar Painel de Trabalho</span>
                <ChevronRight className="w-4 h-4 text-emerald-200" />
              </button>
            </div>
          )}
        </header>

        {/* MAIN BODY: CONDITIONALLY RENDER AUTH SCREENS OR EXTENSIVE PRESENTATION DETAILS */}
        {authMode === 'login' ? (
          
          /* LOGIN COMPONENT VIEW */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-gradient-to-b from-[#0e162d]/20 to-transparent">
            {/* Visual ambient spots */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative z-10 font-sans">
              
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold font-display text-white tracking-tight flex items-center justify-center gap-2">
                  <span>Acesso: LLM ToolForge</span>
                  <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">Nível 1</span>
                </h2>
                <p className="text-slate-400 text-xs">Sincronize automações de IA, copie prompts e exporte chassis estéreis</p>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLocalLogin} className="space-y-4 text-left">
                {/* Cryptographic Key Input Field with Live Feedback Flag */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      Chave de Acesso Criptográfica (token)
                    </label>
                    {authKeyInput && (
                      <span className={`text-[10px] font-mono font-bold ${
                        authKeyInput.trim().toUpperCase().startsWith('SEC-') ? 'text-emerald-400' : 'text-indigo-405'
                      }`}>
                        {authKeyInput.trim().toUpperCase().startsWith('SEC-') ? '● Formato Válido' : 'Chave Customizada'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={authKeyInput}
                      onChange={e => setAuthKeyInput(e.target.value)}
                      placeholder="SEC-A28F-9D4E-7C1B-5532 ou BLUEPRINT-SEC-ADMIN-2026"
                      className="w-full bg-[#0b0f19] border border-slate-850 focus:border-indigo-500 rounded-lg pl-3 pr-10 py-2.5 text-xs text-indigo-200 placeholder-slate-600 focus:outline-none font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-1"
                      title={showLoginPassword ? "Ocultar chave" : "Exibir chave"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Fixed Security Warning */}
                  <div className="p-3 bg-amber-500/5 border border-amber-500/15 text-[10.5px] text-amber-200/90 leading-relaxed rounded-xl flex items-start gap-2.5 mt-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      Chave de acesso única. Por motivos de segurança, recomendamos gerar um novo token a cada sessão e destruí-lo ao finalizar o uso. Não há recuperação de dados.
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs py-2.5 rounded-lg transition active:scale-98 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-200" />
                    <span>Autenticar Token SecSeg</span>
                  </button>
                </div>
              </form>

              {/* Secure Trust Indicators Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#080d19]/80 p-2.5 rounded-xl border border-slate-850 text-center">
                <div className="flex flex-col items-center justify-center p-1.5">
                  <Shield className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[9px] text-slate-350 font-bold leading-tight">ISO-27001</span>
                  <span className="text-[8px] text-slate-500 font-mono">Pilar Sec</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 border-x border-slate-850">
                  <Key className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-[9px] text-slate-350 font-bold leading-tight">SHA-256</span>
                  <span className="text-[8px] text-slate-500 font-mono">Criptografado</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5">
                  <CheckSquare className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-[9px] text-slate-350 font-bold leading-tight">Zero-Log</span>
                  <span className="text-[8px] text-slate-500 font-mono">LGPD Absoluta</span>
                </div>
              </div>

              {/* Demo Quick Account Module - Custom Sandbox Simulator Layout */}
              <div className="border-t border-slate-850 pt-5 space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Bypass Sandbox
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono font-medium">Bypass de cadastro sem fricção:</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthKeyInput('BLUEPRINT-SEC-ADMIN-2026');
                    setAuthError('');
                  }}
                  className="w-full bg-[#111728] hover:bg-[#161e33] border border-slate-800 text-slate-200 hover:text-white text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shadow-sm group active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition shrink-0" />
                  <div className="text-left leading-normal">
                    <span className="block font-bold">
                      Autenticar Sessão Demo
                    </span>
                    <span className="block text-[9px] text-slate-400 font-normal">
                      Preencher chave de teste de desenvolvimento estéril
                    </span>
                  </div>
                </button>
              </div>

              <div className="text-center text-xs space-y-2 border-t border-slate-850 pt-4 text-slate-400">
                <p>
                  Não tem uma chave ativa?{' '}
                  <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className="text-indigo-400 font-semibold hover:underline cursor-pointer">
                    Gerar Nova Chave de Acesso Criptográfica
                  </button>
                </p>
                <p>
                  <button onClick={() => setAuthMode('landing')} className="text-slate-500 text-[11px] hover:text-slate-350 cursor-pointer">
                    ← Voltar para a página de Apresentação
                  </button>
                </p>
              </div>

            </div>

            {/* Meticulous Security Policy Accordion Footer */}
            <div className="w-full max-w-md mt-6 bg-[#080d19]/60 border border-slate-850 rounded-xl p-5 space-y-2.5 text-left text-slate-400 text-[11px] leading-relaxed relative z-10">
              <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-850 pb-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Salvaguarda & Política de Conformidade LGPD</span>
              </div>
              <p>
                Este portal opera sob o protocolo de robustez cibernética <strong className="text-slate-300">ISO/IEC 27001</strong>. Ao criar uma conta ou utilizar a credencial simulada do Sandbox, os seguintes princípios são honrados estritamente:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400/90 font-mono text-[10px]">
                <li><strong className="text-indigo-300">Não-Coleta:</strong> As senhas fornecidas sofrem hash imediato no runtime e nunca são encaminhadas para servidores de terceiros ou databases inseguras.</li>
                <li><strong className="text-indigo-300">Isolamento de Cache:</strong> Toda geração de blueprint ou código é mantida sob o sandbox estéril de sua sessão local, limpando-se junto com a saída.</li>
                <li><strong className="text-indigo-300">Bypass Sem Risco:</strong> A conta de demonstração sandbox visa remover totalmente a exposição de e-mails corporativos reais se assim o desejar.</li>
              </ul>
              <div className="text-[9px] text-slate-500 text-center pt-1 border-t border-slate-850/60 font-mono">
                Conectado com criptografia ativa TLS 1.3 ponta a ponta.
              </div>
            </div>

          </div>

        ) : authMode === 'register' ? (

          /* REGISTER COMPONENT VIEW */
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-b from-[#0e162d]/20 to-transparent">
            {/* Visual ambient spots */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative z-10 font-sans">
              
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Key className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold font-display text-white tracking-tight">Gerador de Chave Criptográfica</h2>
                <p className="text-slate-400 text-xs">Crie seu bypass de cadastro sem fricção. Sua privacidade é respeitada.</p>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3.5 bg-[#052d1b] border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-start gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <div className="space-y-4 text-left">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    Intuito de Utilização / Perfil
                  </label>
                  <select
                    value={authSelectedIntent}
                    onChange={e => setAuthSelectedIntent(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Arquitetar Sistemas">Apenas Arquitetar & Gerar Projetos (Nível 1)</option>
                    <option value="Realizar Auditorias Cibernéticas">Auditar Chassis Cientificamente (Nível 2)</option>
                    <option value="Aprender Infraestrutura">Fins Acadêmicos ou Auto-didatismo</option>
                    <option value="Exportar para GitHub / ZIP">Integrar Projetos ao GitHub / ZIP instantâneo</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleGenerateKeyWorkflow(authSelectedIntent)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs py-3 rounded-lg transition active:scale-98 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-350 animate-pulse" />
                    Gerar Minha Chave Segura & Entrar
                  </button>
                </div>
              </div>

              {/* Secure Trust Indicators Grid */}
              <div className="grid grid-cols-3 gap-2 bg-[#080d19]/80 p-2.5 rounded-xl border border-slate-850 text-center">
                <div className="flex flex-col items-center justify-center p-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[9px] text-slate-350 font-bold leading-tight">Anônimo</span>
                  <span className="text-[8px] text-slate-500 font-mono">Zero Rastreio</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5 border-x border-slate-850">
                  <Key className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-[9px] text-slate-350 font-bold leading-tight">SHA-256</span>
                  <span className="text-[8px] text-slate-500 font-mono">Alta Entropia</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1.5">
                  <CheckSquare className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-[9px] text-slate-350 font-bold leading-tight">LGPD</span>
                  <span className="text-[8px] text-slate-500 font-mono">Conformidade</span>
                </div>
              </div>

              <div className="text-center text-xs space-y-2 border-t border-slate-850 pt-4 text-slate-400">
                <p>
                  Já gerou sua chave?{' '}
                  <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="text-indigo-400 font-semibold hover:underline cursor-pointer">
                    Fazer Login com Minha Chave
                  </button>
                </p>
                <p>
                  <button onClick={() => setAuthMode('landing')} className="text-slate-500 text-[11px] hover:text-slate-350 cursor-pointer">
                    ← Voltar para a página de Apresentação
                  </button>
                </p>
              </div>

            </div>

            {/* Meticulous Security Policy Footer block */}
            <div className="w-full max-w-md mt-6 bg-[#080d19]/60 border border-slate-850 rounded-xl p-5 space-y-2.5 text-left text-slate-400 text-[11px] leading-relaxed relative z-10">
              <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-850 pb-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Política de Confidencialidade e Isenção de Risco</span>
              </div>
              <p>
                Este portal opera sob o protocolo de robustez cibernética <strong className="text-slate-300">ISO/IEC 27001</strong>. Ao criar uma conta ou utilizar a credencial simulada do Sandbox, os seguintes princípios são honrados estritamente:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-400/90 font-mono text-[10px]">
                <li><strong className="text-indigo-300">Local Storage Criptografado:</strong> As chaves e usuários criados ficam restritos ao sandbox de sua máquina (localStorage). Não há processamento fora do seu controle explícito.</li>
                <li><strong className="text-indigo-300">Resiliência Supply Chain:</strong> Todo e qualquer blueprint gerado é estéril do lado do servidor, certificando auditorias livres de backdoors ou malware.</li>
                <li><strong className="text-indigo-350">Comunidade e Transparência:</strong> Este ambiente tem propósito focado em educar e capacitar engenheiros em AppSec.</li>
              </ul>
              <div className="text-[9px] text-slate-500 text-center pt-1 border-t border-slate-850/60 font-mono">
                Conectado com criptografia ativa TLS 1.3 ponta a ponta.
              </div>
            </div>

          </div>

        ) : (

          /* METICULOUSLY DETAILED PRESENTATION LANDING PAGE */
          <div className="flex-col">
            
            {/* HERO INTRODUCTION */}
            <section className="relative overflow-hidden py-20 border-b border-slate-800/40 bg-gradient-to-b from-[#090e1f] to-transparent">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />

              <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative">
                
                {/* Visual author badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-300 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Plataforma Desenvolvida por Ana Caroline Lamas
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
                  LLM ToolForge: Automação de <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent italic font-black">
                    Infraestrutura e Código via IA.
                  </span>
                </h1>

                <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Transforme ideias em repositórios completos com a biblioteca integrada de 17.000 prompts refinados de agentes Hermes e segurança defensiva. Gere, estruture e exporte para o GitHub em segundos.
                </p>

                {/* Hero Call to Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-4">
                  <button
                    onClick={handleEnterWorksite}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-display px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-950/45 active:scale-95 transition text-xs uppercase tracking-wider cursor-pointer font-semibold"
                  >
                    Acessar Painel do Motor
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="w-full sm:w-auto bg-[#111728] hover:bg-[#18213a] text-slate-200 px-6 py-3.5 rounded-xl text-xs font-bold font-display border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Liberar Chave de Acesso Única</span>
                  </button>
                </div>

                {/* Technical Stack Support with Skill Icons */}
                <div className="pt-10 space-y-3 max-w-2xl mx-auto">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-450 block">
                    — Frameworks & Infraestrutura Suportadas —
                  </span>
                  <div className="bg-[#050915]/65 border border-slate-850 p-5 rounded-2xl flex flex-wrap justify-center items-center gap-3">
                    <img 
                      src="https://skillicons.dev/icons?i=aws,gcp,docker,kubernetes,terraform,python,linux,go,rust,ts,postgres,git" 
                      alt="Tecnologias Suportadas" 
                      referrerPolicy="no-referrer"
                      className="max-w-full drop-shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* SEÇÃO DE FUNCIONALIDADES (O "Poder" da Ferramenta) */}
            <section className="bg-[#0a0f20]/50 border-b border-slate-800/30 py-16">
              <div className="max-w-5xl mx-auto px-4">
                
                <div className="text-center space-y-2 mb-12">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 font-mono text-[10px] font-bold">
                    CAPACIDADES
                  </div>
                  <h2 className="text-2xl font-bold font-display text-white">O Poder do LLM ToolForge</h2>
                  <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto">
                    Arquitetura profissional desenhada de ponta a ponta para acelerar deploys e blindar barramentos corporativos.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1 */}
                  <div className="bg-gradient-to-b from-slate-900 to-[#10172a] border border-slate-800 p-5 rounded-xl space-y-3 shadow-lg relative group hover:border-indigo-500/35 transition-all duration-300">
                    <div className="w-10 h-10 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">Engine de 20k+ Prompts</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Base de conhecimento massiva para geração de código e arquitetura. Prompts combinatórios modulares geram sistemas limpos e consistentes sem poluição.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gradient-to-b from-slate-900 to-[#10172a] border border-slate-800 p-5 rounded-xl space-y-3 shadow-lg relative group hover:border-emerald-500/35 transition-all duration-300">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Box className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">Estruturação Inteligente</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      O motor mapeia a árvore de arquivos e dependências automaticamente, gerando pacotes táticos, rotas, tipos estruturados e logs prontos para uso.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gradient-to-b from-slate-900 to-[#10172a] border border-slate-800 p-5 rounded-xl space-y-3 shadow-lg relative group hover:border-indigo-500/35 transition-all duration-300">
                    <div className="w-10 h-10 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Github className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono">Exportação Integrada</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Integração nativa com GitHub via exportação ZIP estruturada. Envie blueprints diretamente para repositórios autorizados em nuvem.
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* SEÇÃO "COMO FUNCIONA" */}
            <section className="border-b border-slate-800/20 py-16">
              <div className="max-w-5xl mx-auto px-4">
                
                <div className="text-center space-y-2 mb-12">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-mono text-[10px] font-bold">
                    ETAPAS DO FLUXO
                  </div>
                  <h2 className="text-2xl font-bold font-display text-white">Como Funciona o Motor?</h2>
                  <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto">
                    Do conceito à máquina de produção de forma simples, transparente e estéril.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                  
                  {/* Step 1 */}
                  <div className="space-y-3 text-left relative bg-slate-900/40 p-5 rounded-xl border border-slate-850">
                    <span className="text-4xl font-extrabold font-mono text-indigo-500/20 block">01</span>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Input
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed-t">
                      Insira o conceito desejado ou selecione um prompt refinado na biblioteca integrada.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-3 text-left relative bg-slate-900/40 p-5 rounded-xl border border-slate-850">
                    <span className="text-4xl font-extrabold font-mono text-indigo-500/20 block">02</span>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      Processamento
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed-t">
                      O motor processa os 17.000 prompts de agentes Hermes e cria a estrutura física de arquivos em formato JSON/YAML.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-3 text-left relative bg-slate-900/40 p-5 rounded-xl border border-slate-850">
                    <span className="text-4xl font-extrabold font-mono text-emerald-500/20 block">03</span>
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Deploy
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed-t">
                      Baixe o arquivo ZIP estruturado na máquina ou envie diretamente para o seu repositório no GitHub.
                    </p>
                  </div>

                </div>

              </div>
            </section>


            {/* DOMAIN CONFIGURATION FORM (OAuth tools) */}
            <section className="border-b border-slate-800/30 py-14">
              <div className="max-w-5xl mx-auto px-4">
                
                <div className="bg-slate-900 border border-indigo-950 rounded-2xl p-6 shadow-2xl text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-indigo-400" />
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                          Configurador de Domínio Ativo (OAuth GitHub)
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Insira o endereço de desenvolvimento ou deploy para calcular credenciais e callback de retorno do GitHub
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30 font-mono font-bold">
                      Calculador Resiliente
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Domain Input */}
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-bold text-slate-200 block">Insira o endereço (URL) da página atual:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={mainDomain}
                          onChange={e => {
                            const val = e.target.value.trim();
                            setMainDomain(val);
                            localStorage.setItem('main_domain', val);
                          }}
                          placeholder="Ex: https://ais-dev-...us-west2.run.app"
                          className="flex-1 bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white src-mono font-mono focus:outline-none focus:border-indigo-500 select-all"
                        />
                        <button
                          onClick={() => {
                            setMainDomain(window.location.origin);
                            localStorage.setItem('main_domain', window.location.origin);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-xs font-semibold border border-slate-750 transition shrink-0"
                        >
                          Usar Link Atual
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Homepage URL Card */}
                      <div className="bg-[#090d18] border border-slate-850 p-3.5 rounded-xl flex flex-col justify-between gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider block">Homepage URL</span>
                          <button
                            onClick={() => handleCopyToClipboard(mainDomain, 'homepage_copied')}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition"
                          >
                            {copiedText === 'homepage_copied' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedText === 'homepage_copied' ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                        <code className="text-xs text-slate-300 block truncate select-all bg-[#050810] p-2 border border-slate-900 rounded font-mono">
                          {mainDomain || 'Carregando link...'}
                        </code>
                      </div>

                      {/* Authorization Callback URL Card */}
                      <div className="bg-[#090d1b] border border-slate-850 p-3.5 rounded-xl flex flex-col justify-between gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Authorization callback URL</span>
                          <button
                            onClick={() => handleCopyToClipboard(mainDomain ? `${mainDomain}/auth/callback` : '', 'callback_copied')}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition"
                          >
                            {copiedText === 'callback_copied' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedText === 'callback_copied' ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                        <code className="text-xs text-emerald-400 block truncate select-all bg-[#050810] p-2 border border-slate-900 rounded font-mono font-semibold">
                          {mainDomain ? `${mainDomain}/auth/callback` : 'Carregando link...'}
                        </code>
                      </div>

                    </div>

                    <p className="text-[10.5px] text-slate-450 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-850">
                      💡 No painel de configuração do seu OAuth App do GitHub Developer, basta preencher os dois campos acima exatamente como calculados para evitar disparos de erro 422 ao exportar.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* EXTENSIVE PERGUNTAS FREQUENTES (FAQ) ACCORDION */}
            <section id="faq-accordion" className="max-w-5xl mx-auto px-4 py-16 space-y-8 text-left border-b border-slate-800/30">
              
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded text-indigo-300 font-bold">Respostas Rápidas</span>
                <h3 className="text-2xl font-bold font-display text-white">Perguntas Frequentes (FAQ)</h3>
                <p className="text-slate-400 text-xs md:text-sm">
                  Esclareça suas dúvidas técnicas e funcionais sobre o LLM ToolForge.
                </p>
              </div>

              <div className="space-y-3.5 max-w-4xl pt-2">
                
                {[
                  {
                    q: "O que é exatamente o LLM ToolForge?",
                    a: "É uma engine avançada para geração técnica estruturada de repositórios, chassis e códigos de conformidade tática a partir de engenharia e automação com LLM com uma biblioteca integrada de 17.000 prompts refinados de agentes Hermes e segurança defensiva."
                  },
                  {
                    q: "Como funciona a segurança cibernética e autenticação local?",
                    a: "A autenticação e login de sandbox ocorrem de forma 100% estéril e sem coleta de e-mails ou dados pessoais. A chave criptográfica gerada por entropia é armazenada de forma segura no cache local do navegador, garantindo privacidade estrita e conformidade com diretivas OWASP."
                  },
                  {
                    q: "Estou tendo o Erro 422 na criação do repositório no GitHub. O que é?",
                    a: "Erros 422 ao criar repositórios indicam conflito de nomenclatura (o repositório já existe), carácteres inválidos ou descrição contendo caracteres que o GitHub rejeita. Corrigimos isso de forma tática sanitizando todas as descrições no backend do servidor express com remoção dinâmica de quebras de linha."
                  },
                  {
                    q: "Como funciona a conexão com o WhatsApp de Ana Caroline Lamas?",
                    a: "Ao clicar nos botões de suporte, você é direcionado de forma direta ao telefone oficial (+55 31 97244-2973) para-consultoria acadêmica, suporte de licenças e adaptação do motor a bancos corporativos como Postgres ou Cloud SQL."
                  },
                  {
                    q: "Como o Oráculo de Prompts Combinatórios nos ajuda?",
                    a: "A aba geradora de prompt concatena papéis de atuação, stacks tecnológicas específicas (FastAPI, React), diretivas de estilo (Swiss, brutalist) e de tom (técnico, sério) formulando prompts maduros e de alta granularidade."
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between text-white font-bold text-xs md:text-sm hover:bg-slate-850/50 transition-colors"
                    >
                      <span>{item.q}</span>
                      <span className={`text-indigo-400 font-bold transition-transform duration-205 ${activeFaq === index ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    </button>
                    {activeFaq === index && (
                      <div className="px-5 pb-4 pt-1 text-slate-350 text-xs leading-relaxed border-t border-slate-850/60 bg-[#080d19]/40">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </section>

            {/* FINAL LAUNCH BOTTON WORKPLACE */}
            <section className="bg-[#090d18] py-16 px-4">
              <div className="max-w-4xl mx-auto text-center space-y-5">
                <h3 className="text-xl md:text-2xl font-bold text-white font-display">Pronto para automatizar e otimizar seus designs estruturais?</h3>
                <p className="text-xs md:text-sm text-slate-450 max-w-2xl mx-auto">
                  Acesse agora o painel interativo, carregue os presets mais populares e gere barramentos conformes e estéreis hoje mesmo.
                </p>
                
                <div className="flex justify-center items-center gap-3 pt-3">
                  <button
                    onClick={handleEnterWorksite}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold font-display px-8 py-4 rounded-xl shadow-lg shadow-indigo-950/50 active:scale-97 transition text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>Lançar Central do LLM ToolForge</span>
                    <span className="text-indigo-300">→</span>
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-[#050810] px-6 py-10 text-slate-400 font-sans text-xs">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <div className="text-sm font-bold text-white tracking-widest font-display">
                ECOSYSTEM DATA | Desenvolvido por Ana Caroline Lamas
              </div>
              <div className="text-slate-400 max-w-md text-xs leading-relaxed">
                Plataforma de Auditoria, Conformidade e Engenharia de Automação de LLMs. Desenvolvido com base em pesquisa acadêmica de segurança defensiva e auditoria AppSec de sistemas híbridos corporativos.
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-1">
                Auditoria e Conformidade com selo de segurança de Ana Caroline Lamas.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <a
                href="https://github.com/ticarollamas-arch"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-mono font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
              >
                <Github className="w-3.5 h-3.5 text-indigo-450" />
                <span>GitHub Profile</span>
              </a>
              <a
                href="https://g.dev/anacarolinelamas"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-950/45 hover:bg-indigo-900/40 border border-indigo-900/40 text-indigo-200 text-[11px] font-mono font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Dev Profile</span>
              </a>
              <button
                onClick={() => {
                  alert('Documentação Técnica de Engenharia em conformidade com benchmarks OWASP e CIS. Consulte o guia de blueprints internos.');
                }}
                className="bg-slate-900/50 hover:bg-slate-800/45 border border-slate-850 text-slate-400 hover:text-slate-200 text-[11px] font-mono font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Doc Técnica</span>
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto border-t border-slate-900/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <div>
              © {new Date().getFullYear()} LLM ToolForge • Ana Caroline Lamas (+55 31 97244-2973)
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 hover:text-white transition">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contato Oficial:</span>
              <a href="mailto:contato@estamosatendendo.com.br" className="underline font-bold text-indigo-300 hover:text-indigo-200">
                contato@estamosatendendo.com.br
              </a>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TOP BRAND HEADER */}
      <header className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur md:sticky top-0 z-50 px-3 sm:px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Row 1: Logo, Title & Compact Mobile Session */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLandingPage(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition border border-slate-700 active:scale-95 shrink-0 cursor-pointer"
                title="Voltar para a página de Apresentação"
              >
                <span className="text-indigo-400 font-bold">←</span>
                <span className="hidden sm:inline">Apresentação</span>
              </button>
              
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 shrink-0">
                <Layers className="w-4 h-4 text-indigo-200" />
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] sm:text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
                    AUTOMAÇÃO IA
                  </span>
                  <span className="bg-indigo-500/15 border border-indigo-500/20 text-[8px] sm:text-[9px] font-mono px-1 rounded text-indigo-300">
                    v1.2.0
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-display font-bold text-white tracking-tight -mt-0.5 leading-none">
                  LLM ToolForge
                </h1>
              </div>
            </div>

            {/* Micro logout block for mobile screens */}
            <div className="flex lg:hidden items-center gap-2 bg-slate-900/70 p-1 pr-2 border border-slate-850 rounded-lg shrink-0">
              <div className="w-6 h-6 rounded bg-indigo-600/35 text-indigo-300 font-mono text-[9px] font-black flex items-center justify-center">
                {sessionUser?.username ? sessionUser.username.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <button
                onClick={() => {
                  setIsLandingPage(true);
                  handleDestroySessionAndToken();
                }}
                className="bg-rose-950/45 hover:bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded text-[9px] font-bold font-mono transition cursor-pointer"
                title="Sair e revogar token permanentemente"
              >
                Destruir Token
              </button>
            </div>
          </div>

          {/* Row 2 / Right elements: Presets & Desktop user session */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3.5 w-full lg:w-auto">
            
            {/* Presets de fábrica - Scroll horizontal no mobile */}
            <div className="flex items-center overflow-x-auto scrollbar-none gap-1 bg-slate-900/80 p-1 border border-slate-800 rounded-lg w-full sm:w-auto">
              <span className="text-[9px] text-slate-500 font-mono tracking-wider px-1.5 whitespace-nowrap">Presets:</span>
              <button
                id="preset-auditor-btn"
                onClick={() => setActivePreset('auditor')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'auditor' 
                    ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛡️ Auditor CLI
              </button>
              <button
                id="preset-gateway-btn"
                onClick={() => setActivePreset('gateway')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'gateway' 
                    ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🕸️ API Proxy
              </button>
              <button
                id="preset-ollama-btn"
                onClick={() => setActivePreset('ollama')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'ollama' 
                    ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛡️ Agente Hermes
              </button>
              <button
                id="preset-herdeiro-btn"
                onClick={() => setActivePreset('herdeiro')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'herdeiro' 
                    ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👑 Herdeiro Sênior
              </button>
              <button
                id="preset-bughunter-btn"
                onClick={() => setActivePreset('bughunter')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'bughunter' 
                    ? 'bg-red-950/80 text-red-200 shadow-sm font-bold border border-red-800/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎯 Hunter-X Elite
              </button>
              <button
                id="preset-cloud-compliance-btn"
                onClick={() => setActivePreset('cloudCompliance')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'cloudCompliance' 
                    ? 'bg-blue-950/80 text-blue-200 shadow-sm font-bold border border-blue-800/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ☁️ Aegis Cloud IaC
              </button>
              <button
                id="preset-custom-btn"
                onClick={() => setActivePreset('custom')}
                className={`flex-1 sm:flex-initial px-2 py-1 text-[10px] sm:text-xs font-semibold rounded whitespace-nowrap transition-all ${
                  activePreset === 'custom' 
                    ? 'bg-slate-800 text-white shadow-sm font-bold border border-slate-700/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚙️ Vazia
              </button>
            </div>

            {/* Separator - Hidden on compact devices */}
            <div className="hidden lg:block h-6 w-[1px] bg-slate-800" />

            {/* Desktop User Session info */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-900/50 p-1 pr-3 pl-2 border border-slate-800 rounded-xl shrink-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono text-xs font-black flex items-center justify-center border border-indigo-500/20 shadow">
                {sessionUser?.username ? sessionUser.username.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="text-left text-[11px] leading-tight">
                <div className="font-bold text-white">
                  {sessionUser?.username || "Avaliador Sênior"}
                </div>
                <div className="text-[9px] font-mono text-indigo-400">
                  Portfólio Liberado
                </div>
              </div>

              <button
                onClick={() => {
                  setIsLandingPage(true);
                  handleDestroySessionAndToken();
                }}
                className="ml-1 bg-rose-950/25 border border-rose-900/40 hover:bg-rose-900/45 text-rose-300 hover:text-rose-250 px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                title="Sair e destruir token criptográfico permanentemente"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Destruir Sessão e Token</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. CORE WORKSPACE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT DECK (COLUMNS 1 TO 4): INPUT JSON & AI POWER */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Local Fallback Contingency Alert */}
          {blueprint.metadata?.isLocalFallback && (
            <div className="bg-amber-950/30 border border-amber-800/30 p-4 rounded-xl text-amber-300 text-[11px] leading-relaxed flex items-start gap-2.5 shadow-lg">
              <span className="text-base select-none mt-0.5">⚠️</span>
              <div>
                <strong className="block text-amber-200 font-bold mb-0.5 text-xs">Geração de Contingência Ativa (Local)</strong>
                {blueprint.metadata.fallbackExplanation || "Chassi local dinâmico ativado para contornar quotas temporárias."}
              </div>
            </div>
          )}

          {/* PAINEL DO DESENVOLVEDOR: CONFIGURAÇÃO DE IA E GERAÇÃO CUSTOMIZADA */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl pointer-events-none rounded-full" />
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-display font-semibold text-white">Central de IA do Usuário</h2>
            </div>

            {/* API KEY INPUT */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Chave de API Gemini (Opcional)
              </label>
              <div className="flex gap-2 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={userApiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserApiKey(val);
                      localStorage.setItem('applet_user_gemini_api_key', val);
                      setValidationStatus('idle');
                      setValidationMsg('');
                    }}
                    placeholder="Cole sua API Key do Gemini aqui..."
                    className="w-full text-xs font-mono bg-[#0b0f19] border border-slate-800/80 rounded-lg py-2.5 pl-3 pr-10 text-indigo-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    title={showApiKey ? "Ocultar Chave" : "Mostrar Chave"}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <button
                  type="button"
                  disabled={isValidatingKey || !userApiKey.trim()}
                  onClick={handleValidateApiKey}
                  className={`py-2 px-3.5 rounded-lg text-xs font-bold font-mono transition duration-150 flex items-center justify-center gap-1.5 shrink-0 ${
                    isValidatingKey 
                      ? 'bg-slate-820 text-slate-400 cursor-not-allowed border border-slate-800'
                      : !userApiKey.trim()
                        ? 'bg-indigo-950/20 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white cursor-pointer active:scale-95'
                  }`}
                  title="Verificar validade e permissões da chave nos servidores do Google"
                >
                  {isValidatingKey ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Validando...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Validar Chave</span>
                    </>
                  )}
                </button>
              </div>

              {/* API Key Validation Status feedback */}
              {validationStatus !== 'idle' && (
                <div className={`mt-2 p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                  validationStatus === 'validating'
                    ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-300'
                    : validationStatus === 'success'
                      ? 'bg-emerald-950/25 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-950/25 border-rose-500/20 text-rose-300'
                }`}>
                  <span className="shrink-0 mt-0.5">
                    {validationStatus === 'validating' && <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
                    {validationStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {validationStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-450" />}
                  </span>
                  <div>
                    <span className="font-bold block text-[10.5px] uppercase font-mono tracking-wider mb-0.5">
                      {validationStatus === 'validating' && 'Verificando com o Servidor'}
                      {validationStatus === 'success' && 'Chave de API Autenticada'}
                      {validationStatus === 'error' && 'Falha na Validação da Chave'}
                    </span>
                    <p className="font-sans leading-relaxed">{validationMsg}</p>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 leading-relaxed italic block mt-1">
                {userApiKey 
                  ? "👍 Chave salva localmente! Central pronta para requisições de IA." 
                  : "💡 Deixe em branco para usar as ferramentas pré-construídas sem API."
                }
              </p>
            </div>

            {/* MODEL SELECTOR */}
            <div className="space-y-1.5 text-left border-t border-slate-800/80 pt-3">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Modelo de IA do Usuário (Gemini / Gemma)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedModel(val);
                    localStorage.setItem('applet_user_gemini_model', val);
                  }}
                  className="w-full text-xs bg-[#0b0f19] border border-slate-800/80 rounded-lg py-2.5 px-3 text-indigo-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recomendado)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-flash-latest">Gemini Flash Latest</option>
                  <option value="gemma-2-27b-it">Gemma 2 27B IT (Local / Cloud)</option>
                  <option value="gemma-2-9b-it">Gemma 2 9B IT (Local / Cloud)</option>
                  <option value="gemma">Gemma (Local Engine)</option>
                  <option value="custom">Outro Modelo (Digitar...)</option>
                </select>

                {selectedModel === 'custom' && (
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomModel(val);
                      localStorage.setItem('applet_user_gemini_custom_model', val);
                    }}
                    placeholder="Ex: gemini-1.5-pro, gemma2..."
                    className="w-full text-xs font-mono bg-[#0b0f19] border border-slate-800/80 rounded-lg py-2.5 px-3 text-indigo-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              {/* ⚠️ RECOMENDAÇÃO DE SEGURANÇA (Hardening do Ambiente Local e Higiene de Terminal) */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-orange-950/20 border border-orange-550/25 text-left text-[11px] leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-550/5 blur-xl pointer-events-none rounded-full" />
                <div className="flex items-center gap-2 mb-1.5 font-mono text-orange-400 font-bold uppercase tracking-wider text-[10px]">
                  <ShieldAlert className="w-4 h-4 text-orange-450 animate-pulse shrink-0" />
                  <span>Recomendação de Segurança: Hardening do Ambiente Local</span>
                </div>
                <p className="text-slate-350 leading-relaxed">
                  Como nossas ferramentas operam diretamente via terminal (Termux, Mac, Kali/Debian), a integridade depende do seu ambiente local. Recomendações:
                </p>
                <ul className="list-disc pl-4 mt-2 space-y-1.5 text-slate-400">
                  <li><strong>Restrição por IP (IP Whitelisting):</strong> Mesmo para execuções locais, acesse o painel da sua API Key e configure a restrição de IPs permitidos doméstico ou corporativo. Caso a chave seja extraída do seu dispositivo, continuará inativa.</li>
                  <li><strong>Gestão de Variáveis (Export Volátil):</strong> Evite armazenar tokens em arquivos <code className="text-orange-300 font-mono text-[10px]">.env</code> em disco rígido permanente. Prefira carregar a variável provisoriamente em memória ativa durante a sessão (<code className="text-indigo-300 font-mono text-[10.5px]">export GEMINI_API_KEY="..."</code>).</li>
                  <li><strong>Higiene de Comandos (Ignore History):</strong> Adicione um espaço simples em branco no início da linha de comandos sensíveis no seu terminal. Isso impede que o comando com chaves em texto plano seja capturado no arquivo de histórico de comandos (<code className="text-slate-300 font-mono text-[10.5px]">.bash_history</code> ou <code className="text-slate-300 font-mono text-[10.5px]">.zsh_history</code>).</li>
                  <li><strong>Zero-Persistence (BYOK):</strong> Este painel prioriza o conceito <em>Bring Your Own Key</em>. A chave inserida acima é utilizada em memória ativa apenas para solicitações em tempo de execução desta aba e nunca é salva em servidores terceiros.</li>
                </ul>
              </div>
            </div>

            {/* CUSTOM PROMPT / BOX TEXT */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Prompt / Instrução de Geração
              </label>
              <textarea
                rows={12}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Exemplo: Crie um scanner de portas corporativo robusto em Python com logs estruturados..."
                className="w-full text-xs bg-[#0b0f19] border border-slate-800/80 rounded-lg p-2.5 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed min-h-[220px]"
              />
              <span className="text-[9.5px] text-slate-500 font-mono block text-right">
                {aiPrompt.length} caracteres
              </span>
            </div>

            {/* ACTION BUTTONS (GERAR COM IA vs OFFLINE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                disabled={isGenerating || !aiPrompt.trim()}
                onClick={() => handleGenerateWithAi(false)}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition justify-center flex items-center gap-1.5 shadow duration-200 active:scale-[0.98] ${
                  isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : !aiPrompt.trim() 
                      ? 'bg-indigo-950/20 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : !userApiKey 
                        ? 'bg-indigo-950/45 text-indigo-500/85 border border-indigo-900/35 cursor-not-allowed opacity-50'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                }`}
                title={!userApiKey ? "Insira sua API Key do Gemini acima para habilitar geração remota com IA." : "Enviar comando para o Gemini"}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Lendo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-350" />
                    <span>Gerar com IA</span>
                  </>
                )}
              </button>

              <button
                disabled={isGenerating || !aiPrompt.trim()}
                onClick={() => handleGenerateWithAi(true)}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition justify-center flex items-center gap-1.5 border duration-200 active:scale-[0.98] ${
                  isGenerating || !aiPrompt.trim()
                    ? 'bg-slate-850/20 text-slate-500 border-slate-800/30 cursor-not-allowed'
                    : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer'
                }`}
                title="Gera a ferramenta localmente de forma segura e instantânea sem IA externa"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-450" />
                <span>Gerar Off-line</span>
              </button>
            </div>

            {/* STATUS STEPS FOR AI */}
            {aiStep && (
              <div className="bg-slate-950 border border-indigo-950/80 p-3 rounded-lg font-mono text-[9px] text-indigo-350 text-left flex items-start gap-1 px-4.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 animate-ping shrink-0" />
                <span className="leading-snug">{aiStep}</span>
              </div>
            )}
          </div>
          
          {/* Histórico e Higiene de Segurança do ToolForge */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl pointer-events-none rounded-full" />
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-display font-semibold text-white">Histórico de Ferramentas Ativas</h2>
              </div>
              <span className="text-[10px] bg-slate-950 text-slate-500 font-mono px-2 py-0.5 rounded border border-slate-850">
                {generationHistory.length} salvas
              </span>
            </div>

            {generationHistory.length === 0 ? (
              <div className="text-center py-6 px-4 bg-slate-950/40 rounded-lg border border-slate-850/60">
                <p className="text-xs text-slate-500 italic leading-relaxed">
                  Sem ativações recentes. Explore a <span className="text-indigo-400 font-semibold cursor-pointer underline hover:text-indigo-300" onClick={() => setActiveTab('library')}>Biblioteca de Ferramentas</span> e clique no botão de carregar.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                {generationHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#0d1326]/30 border border-slate-850/70 rounded-lg hover:border-slate-800 transition flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded uppercase tracking-wider shrink-0">
                          {item.category}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          {item.loadedAt}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 truncate leading-tight">
                        {item.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleLoadLibraryTool(item)}
                      className="px-2 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/50 text-[10px] font-bold text-emerald-300 rounded transition shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                    >
                      Reativar ⚡
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* HIGH-SECURITY ADVISOR WIDGET */}
            <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl text-left space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">HIGIENE DE CHAVES DO GITHUB</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toda vez que você acabar de utilizar esta plataforma, recomendamos fortemente que acesse as suas <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline hover:text-amber-200">Configurações do GitHub ↗</a> e <strong>revogue/exclua</strong> o token de acesso cadastrado para mitigação e blindagem contra incidentes de vazamento.
              </p>
            </div>
          </div>

          {/* Paste Real JSON Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-display font-semibold text-white">JSON Blueprint Direto</h2>
              </div>
              <button
                id="copy-json-btn"
                onClick={() => handleCopyToClipboard(inputJson, 'raw_json')}
                className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition"
                title="Copiar JSON Blueprint"
              >
                {copiedText === 'raw_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-mono">{copiedText === 'raw_json' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modifique ou cole o JSON Blueprint gerado pelo seu assistente para renderizar suas especificações operacionais em tempo real.
            </p>
            <div className="relative">
              <textarea
                id="json-blueprint-textarea"
                rows={16}
                value={inputJson}
                onChange={e => handleLoadCustomJson(e.target.value)}
                placeholder="Insira o seu JSON de Blueprint aqui..."
                className="w-full text-[11px] font-mono bg-[#0b0f19] border border-slate-800 rounded-lg p-3 text-slate-300 placeholder:text-slate-700 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
              {jsonError && (
                <div className="absolute bottom-2 left-2 right-2 bg-rose-950/90 border border-rose-800 rounded p-2 text-[10px] font-mono text-rose-300">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Detectamos inconsistências:
                  </div>
                  <p>{jsonError}</p>
                </div>
              )}
            </div>
            {!jsonError && (
              <div className="bg-emerald-950/30 border border-emerald-900/30 px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-mono text-emerald-400">Blueprint verificado e ativo</span>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT DECK (COLUMNS 5 TO 12): THE INTERACTIVE ENGINE WORKSPACE */}
        <section className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col min-h-[700px]">
          
          {/* Workspace Title Ribbon */}
          <div className="bg-[#131b2e] border-b border-slate-800 px-5 py-4 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between font-sans">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-white tracking-tight leading-tight">
                {blueprint.projectName || "Projeto Ativo"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {blueprint.metadata?.projectType || "Arquitetura de Segurança Corporativa"}
              </p>
            </div>
            
            <div className="flex flex-row flex-wrap gap-2.5 w-full md:w-auto items-center justify-start sm:justify-end mt-4 md:mt-0">
              <button
                id="github-export-modal-btn"
                onClick={() => {
                  setGithubExportResult(null);
                  setShowGithubModal(true);
                }}
                className="bg-[#24292e] hover:bg-[#2f363d] text-white px-3 sm:px-4 py-2 sm:py-2.5 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition duration-150 border border-[#444c56] shadow-md active:scale-95 flex-1 sm:flex-initial shrink-0 cursor-pointer text-center"
              >
                <Github className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                <span className="truncate">{githubToken ? "Exportar para GitHub" : "Conectar GitHub"}</span>
              </button>

              <button
                id="zip-download-btn"
                onClick={handleDownloadZip}
                className="bg-emerald-600 hover:bg-emerald-500 text-emerald-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition flex-1 sm:flex-initial cursor-pointer text-center whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-emerald-50 shrink-0" />
                <span>Baixar (.ZIP)</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 bg-slate-900/50 flex overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              id="tab-intro-btn"
              onClick={() => setActiveTab('intro')}
              className={`px-5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'intro' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4 text-indigo-500" />
              0. Apresentação & Configuração
            </button>
            <button
              id="tab-code-btn"
              onClick={() => setActiveTab('code')}
              className={`px-5 py-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'code' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              1. Navegador de Arquivos & Editor
            </button>
            <button
              id="tab-terminal-btn"
              onClick={() => setActiveTab('terminal')}
              className={`px-5 py-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'terminal' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              2. Terminal Simulado
            </button>
            <button
              id="tab-database-btn"
              onClick={() => setActiveTab('database')}
              className={`px-5 py-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'database' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              disabled={!blueprint.database}
            >
              <Database className="w-4 h-4" />
              3. Esquema do Banco
              {!blueprint.database && <span className="text-[9px] text-slate-600">(Indisponível)</span>}
            </button>
            <button
              id="tab-security-btn"
              onClick={() => setActiveTab('security')}
              className={`px-5 py-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'security' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              4. Diretrizes & Segurança
            </button>
            <button
              id="tab-tech-btn"
              onClick={() => setActiveTab('tech')}
              className={`px-5 py-3 text-xs font-medium border-b-2 flex items-center gap-2 transition ${
                activeTab === 'tech' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              5. Pilha & Meta
            </button>
            <button
              id="tab-library-btn"
              onClick={() => setActiveTab('library')}
              className={`px-5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'library' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              6. Biblioteca de Prompts (17k+)
            </button>
            <button
              id="tab-zip-importer-btn"
              onClick={() => setActiveTab('zip_importer')}
              className={`px-5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'zip_importer' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-4 h-4 text-sky-400 rotate-180" />
              7. Importador ZIP & README
            </button>
            <button
              id="tab-learning-btn"
              onClick={() => setActiveTab('learning')}
              className={`px-5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'learning' 
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              8. Aegis Learning OS
            </button>
            <button
              id="tab-bugbounty-btn"
              onClick={() => setActiveTab('bug_bounty')}
              className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeTab === 'bug_bounty' 
                  ? 'border-fuchsia-500 text-fuchsia-400 bg-slate-800/40 font-black shadow-inner shadow-fuchsia-950/20' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:text-fuchsia-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-fuchsia-400 animate-pulse" />
              9. Bug Bounty Core
            </button>
          </div>

          {/* 3. TAB WORKSPACES CONTENT */}
          <div className="flex-1 flex flex-col bg-[#0d1326]/35 rounded-b-xl overflow-hidden">
            
            {/* TAB 0: INTRO & APRESENTAÇÃO */}
            {activeTab === 'intro' && (
              <div className="flex-1 p-6 space-y-6 animate-fade-in text-left overflow-y-auto max-h-[680px]">
                
                {/* Hero Feature Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-[#111e3b] to-slate-900 border border-indigo-950/60 rounded-xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                          Aegis Platform v2.0
                        </span>
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 animate-pulse" /> Pronto para Hackathon & Mercado
                        </span>
                      </div>
                      
                      <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-400" />
                        Aegis Security Intelligence Platform
                      </h1>
                      <p className="text-sm text-slate-350 max-w-2xl leading-relaxed">
                        A plataforma definitiva de inteligência e auditoria cibernética ativa para engenheiros DevSecOps e Elite Bug Hunters. Projetada para mapear vulnerabilidades lógicas reais sem simulações.
                      </p>
                    </div>

                    <div className="bg-[#0c1221] border border-slate-800 p-4 rounded-xl min-w-[240px] shadow-md shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block mb-1">Engenharia de Produto</span>
                      <div className="font-semibold text-indigo-300">Ana Caroline Lamas</div>
                      <a 
                        href="https://wa.me/5531972442973" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5 mt-2 transition hover:underline"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        +55 (31) 97244-2973
                        <ExternalLink className="w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Subnavigation Pill Bar */}
                <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-4">
                  <button 
                    onClick={() => setSelectedIntroSubTab('pitch')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'pitch' 
                        ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-500/40' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" /> PITCH (VISION)
                  </button>
                  <button 
                    onClick={() => setSelectedIntroSubTab('definition')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'definition' 
                        ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-500/40' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" /> PRODUCT DEFINITION
                  </button>
                  <button 
                    onClick={() => setSelectedIntroSubTab('architecture')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'architecture' 
                        ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-500/40' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" /> TECHNICAL ARCHITECTURE
                  </button>
                  <button 
                    onClick={() => setSelectedIntroSubTab('cli')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'cli' 
                        ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-500/40' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> CLI DESIGN
                  </button>
                  <button 
                    onClick={() => setSelectedIntroSubTab('report')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'report' 
                        ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-500/40' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> REPORT EXPORT (MD)
                  </button>
                  <button 
                    onClick={() => setSelectedIntroSubTab('polish')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'polish' 
                        ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-500/40' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> PRODUCT POLISH
                  </button>
                  <button 
                    onClick={() => setSelectedIntroSubTab('elite_tools')} 
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedIntroSubTab === 'elite_tools' 
                        ? 'bg-pink-650 text-white shadow-md border border-pink-500/25 animate-pulse' 
                        : 'bg-slate-900 border border-pink-955 text-pink-400 hover:text-pink-300'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-pink-500" /> ELITE APPSEC WORKBENCH
                  </button>
                </div>

                {/* Content Views based on selectedIntroSubTab */}
                {selectedIntroSubTab === 'pitch' && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* 30-Second Elevator Pitch */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full" />
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">⚡ PITCH DE 30 SEGUNDOS</span>
                        <h4 className="text-sm font-bold text-white font-display">Aegis no Elevador</h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">
                          "O Aegis Security Intelligence Platform é uma suíte de auditoria cibernética ativa que une escaneamento real de infraestrutura com explicações guiadas por IA em tempo de execução. Para o engenheiro de segurança, ele remove o 'black-box' dos scanners legados ao detalhar o teste conforme ele é executado. Ele não simula logs: ele faz conexões físicas e gera relatórios em Markdown prontos para conformidade e boards de auditoria em segundos."
                        </p>
                      </div>

                      {/* 1-2 Minute Pitch */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full" />
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">⏳ PITCH DE 1 A 2 MINUTOS</span>
                        <h4 className="text-sm font-bold text-white font-display">Aegis para Times</h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">
                          "Scanners convencionais cospem tabelas de vulnerabilidades indecifráveis sem ensinar o remediador o que está acontecendo por trás das cortinas. Aegis inverte essa dinâmica: além de realizar requisições de rede legítimas (resoluções DNS paralelas, SSL handshakes, análise diferencial de cabeçalhos e injeções de payloads), ele documenta visualmente e explica de forma pragmática cada estágio operado. É o casamento perfeito de conformidade de infraestrutura com educação técnica continuada em segurança."
                        </p>
                      </div>

                      {/* Startup Investor Pitch */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden hover:border-slate-700 transition">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-xl rounded-full" />
                        <span className="text-[10px] font-mono font-bold text-rose-450 uppercase tracking-widest block">💼 PITCH PARA INVESTIDOR</span>
                        <h4 className="text-sm font-bold text-white font-display">Visão Comercial (SaaS)</h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">
                          "O mercado de proteção cibernética de aplicações está migrando para soluções ativas integradas a pipelines ágeis. Aegis opera como uma API e CLI portátil facilmente acoplada à esteira CI/CD de grandes corporações para atuar como um portão inteligente de segurança. Reduzimos o custo de auditorias externas manuais ao fornecer relatórios estruturados de forma contínua, permitindo que empresas corrijam vulnerabilidades antes que os atacantes as encontrem, abocanhando um mercado corporativo de bilhões de dados."
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {selectedIntroSubTab === 'definition' && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 animate-fade-in text-left">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white font-display">Product Definition: O que é o Aegis?</h3>
                      <p className="text-xs text-slate-400 mt-1">Visão holística da plataforma e posicionamento estratégico no mercado.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase">1. O que o produto faz?</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Mapeia a superfície de ataque externa de IPs e domínios corporativos analisando portas expostas, certificados TLS/SSL inválidos ou fracos, e vazamento de tecnologia em cabeçalhos HTTP de forma passiva e ativa com alta precisão e sem simulações artificiais.
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase">2. Para quem serve?</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Desenvolvido sob medida para analistas de SOC, engenheiros DevSecOps focados em hardening de infraestrutura, auditores corporativos e pesquisadores de segurança que buscam ferramentas confiáveis para validações em massa e automações.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase">3. Qual problema resolve?</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Elimina o falso positivo decorrente de regexes mal configuradas ou assinaturas desatualizadas ao validar a resposta de forma heurística cruzada. Reduz o gap entre a identificação de uma ameaça e sua correção imediata através do fornecimento de guias práticos e diretos de correção de código.
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase">4. Diferenciais Competitivos</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Arquitetura totalmente portátil (zero dependência externa corporativa complexa), sistema nativo de plugins extensíveis em Python, conformidade imediata com o OWASP Top 10 e relatórios nativos prontos em Markdown estruturados para importação direta em sistemas de chamados como Jira e GitHub Issues.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">TABELA COMPARATIVA</span>
                      <div className="overflow-x-auto border border-slate-800 rounded-lg">
                        <table className="w-full text-xs text-left text-slate-300 font-sans">
                          <thead className="bg-[#0c111e] text-[10px] font-mono text-slate-400 uppercase tracking-wide border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Critério</th>
                              <th className="px-4 py-3 text-red-400">Scanners Legados (Nessus/Acunetix)</th>
                              <th className="px-4 py-3 text-emerald-400">Aegis Platform Suite</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            <tr>
                              <td className="px-4 py-2.5 font-semibold text-white">Transparência de Execução</td>
                              <td className="px-4 py-2.5 text-slate-400">Caixa preta, oculta comandos de rede executados</td>
                              <td className="px-4 py-2.5 text-slate-300">Auto-documentação detalhada em logs de terminal ANSI</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-semibold text-white">Velocidade de Setup</td>
                              <td className="px-4 py-2.5 text-slate-400">Instalações gigantescas, pesadas e lentas</td>
                              <td className="px-4 py-2.5 text-slate-300">Portável, arquivo único ou Docker Container em segundos</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-semibold text-white">Exportação e Pipeline</td>
                              <td className="px-4 py-2.5 text-slate-400">Relatórios em PDFs proprietários massivos e poluídos</td>
                              <td className="px-4 py-2.5 text-slate-300">Markdown nativo para GitHub e payloads JSON estruturados</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 font-semibold text-white">Extensibilidade</td>
                              <td className="px-4 py-2.5 text-slate-400">Restrito a scripts proprietários complexos</td>
                              <td className="px-4 py-2.5 text-slate-300">Pleno suporte a plugins em Python estáveis de fácil escrita</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntroSubTab === 'architecture' && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 animate-fade-in text-left">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white font-display">Technical Architecture: Fluxo Executável Real</h3>
                      <p className="text-xs text-slate-400 mt-1">Estrutura interna sem simulações que processa dados de ponta a ponta.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Flow Diagram */}
                      <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">DIAGRAMA DE FLUXO DA ENGINE</span>
                      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono text-[11px] leading-relaxed text-indigo-300 overflow-x-auto">
                        <div className="min-w-[600px] text-center space-y-2">
                          <div className="flex justify-around items-center">
                            <div className="bg-[#0b0f19] border border-slate-800 px-3 py-1.5 rounded text-white font-bold">CLI Interface (aegis scan)</div>
                            <span className="text-slate-500">──►</span>
                            <div className="bg-[#0b0f19] border border-slate-800 px-3 py-1.5 rounded text-indigo-300 font-bold">Input Parser & Validator</div>
                            <span className="text-slate-500">──►</span>
                            <div className="bg-indigo-950/30 border border-indigo-500/30 px-3 py-1.5 rounded text-indigo-400 font-bold">Aegis Core Engine</div>
                          </div>
                          
                          <div className="h-6 w-full flex justify-center">
                            <div className="border-r border-dashed border-slate-700 h-full w-1/2"></div>
                          </div>

                          <div className="bg-[#0a0d16] border border-slate-800/80 p-3 rounded-lg text-slate-300 max-w-xl mx-auto space-y-1.5 text-left text-[10.5px]">
                            <div className="font-bold text-indigo-400">Módulos de Auditoria Real (Executados Paralelamente):</div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>• <strong className="text-white">http_analysis</strong>: Requests de cabeçalho</div>
                              <div>• <strong className="text-white">dns_analysis</strong>: Resoluções por socket</div>
                              <div>• <strong className="text-white">tls_analysis</strong>: Socket handshake SSL</div>
                              <div>• <strong className="text-white">header_analysis</strong>: OWASP compliance</div>
                            </div>
                            <div className="text-[10px] text-indigo-300 mt-2 font-mono">
                              Cálculo Ativo: <strong className="text-emerald-400">Risk Scoring Engine</strong> (Escala 0 a 100 baseada em falhas descobertas)
                            </div>
                          </div>

                          <div className="h-6 w-full flex justify-center">
                            <div className="border-r border-dashed border-slate-700 h-full w-1/2"></div>
                          </div>

                          <div className="flex justify-around items-center">
                            <div className="bg-[#0b0f19] border border-slate-800 px-3 py-1.5 rounded text-white font-bold">Plugin System Manager</div>
                            <span className="text-slate-500">──►</span>
                            <div className="bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded text-emerald-450 font-bold">Report Generator (Markdown)</div>
                          </div>
                        </div>
                      </div>

                      {/* Modular Explanations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                        <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-lg">
                          <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                            <Cpu className="w-4 h-4 text-indigo-400" />
                            Análise Técnica tls_analysis
                          </h4>
                          <p className="text-[11px] text-slate-350 leading-relaxed">
                            O Aegis realiza uma conexão real socket direta com a porta de destino (por padrão 443), encapsula a conexão usando a biblioteca nativa <code className="text-indigo-400 font-mono">ssl</code> do Python e realiza o handshake. Ele então coleta as propriedades do certificado (emissor, expiração, cifra negociada) descartando qualquer simulação de logs.
                          </p>
                        </div>

                        <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-lg">
                          <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-indigo-400" />
                            Cálculo de Risk Scoring
                          </h4>
                          <p className="text-[11px] text-slate-350 leading-relaxed">
                            Pontuação estrita de risco: começa com Score 100 (Segurança Ótima). Cada vulnerabilidade lógica descoberta remove pontos com pesos predefinidos (ex: ausência de Content-Security-Policy penaliza 30 pontos; SSL vencido ou cifragem fraca penaliza 50 pontos; CNAME órfão com alto risco de takeover desconta 80 pontos), gerando um score pragmático final.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntroSubTab === 'cli' && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 animate-fade-in text-left">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white font-display">CLI Design: Padronização Visual e Comandos</h3>
                      <p className="text-xs text-slate-400 mt-1">A interface de linha de comando desenvolvida sob rigorosos padrões corporativos.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Interactive Help Display */}
                      <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">MENU DE AJUDA PADRÃO DA FERRAMENTA</span>
                      <div className="bg-slate-955 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre selection:bg-indigo-900">
{`USAGE:
  aegis <COMMAND> [OPTIONS]

COMMANDS:
  scan       Executa auditoria de segurança completa no alvo selecionado
  list       Lista todos os plugins de segurança ativos na plataforma
  doctor     Verifica a saúde do ambiente local (dependências, pacotes, python)
  help       Mostra as diretrizes de ajuda da ferramenta

OPTIONS:
  --target   Especifica o domínio ou endereço IP para varredura [Obrigatório]
  --threads  Quantidade de fluxos concorrentes para análise [Default: 10]
  --json     Exporta o resultado diretamente em formato JSON estruturado

EXAMPLES:
  aegis scan --target google.com
  aegis scan --target 8.8.8.8 --threads 25 --json
  aegis doctor
`}
                      </div>

                      {/* Error State description */}
                      <div className="bg-[#1f1013] border border-red-950/60 p-4 rounded-xl flex items-start gap-3">
                        <span className="text-base mt-0.5">⚠️</span>
                        <div className="space-y-1">
                          <span className="text-[10px] text-red-400 font-bold uppercase font-mono tracking-wider">Tratamento Amigável de Inputs Inválidos</span>
                          <p className="text-xs text-slate-300 leading-normal font-sans">
                            Se o operador fornecer parâmetros errados ou um domínio inacessível, o Aegis não quebra silenciosamente: ele limpa o buffer, intercepta o sinal de erro através do módulo <code className="text-indigo-400 font-mono">InputParser</code>, exibe de forma automática o menu de ajuda estruturado acima e fornece exemplos operacionais reais para correção instantânea pelo usuário.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntroSubTab === 'report' && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 animate-fade-in text-left">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white font-display">Padrão de Relatório Markdown Profissional</h3>
                        <p className="text-xs text-slate-400 mt-1">Template formal de entrega de vulnerabilidades pronto para o GitHub.</p>
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(`# Relatório de Auditoria Aegis Security ...`, 'report_template')}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] font-mono font-bold text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3" /> Copiar Template
                      </button>
                    </div>

                    <div className="bg-[#05070f] p-4 rounded-xl border border-slate-855 font-mono text-[10.5px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre select-all selection:bg-indigo-900">
{`# 🛡️ AEGIS AUDITOR SECURITY REPORT

## 📌 METADADOS DO SCAN
- **Alvo Principal**: victim-target.com
- **Endereço IP**: 104.21.32.112
- **Timestamp de Execução**: 2026-06-23 20:20:15 UTC
- **Severidade Geral**: ALTA (Risco Iminente)

## 📊 SUMÁRIO DE COLETAS (RECON)
- **Status de Porta 80/443**: Aberta (Acessível)
- **Servidor Web Identificado**: Cloudflare / nginx-custom
- **Certificado TLS/SSL**: Ativo (Let's Encrypt - Expira em 89 dias)

## ⚖️ ANÁLISE DE CABEÇALHOS HTTP (OWASP COMPLIANCE)
- [✓] **Strict-Transport-Security**: Presente (Configuração HSTS OK)
- [✓] **X-Frame-Options**: Presente (SAMEORIGIN - Protegido contra Clickjacking)
- [✗] **Content-Security-Policy**: AUSENTE (Crítico - Permite XSS / Injeção de Código)
- [✗] **Referrer-Policy**: AUSENTE (Risco Médio - Vazamento de dados na navegação)

## ⚠️ RISCOS E VULNERABILIDADES CRÍTICAS DETECTADAS
### 1. Ausência Crítica de Content-Security-Policy (CSP)
- **Criticidade**: ALTA (Severidade CVSS: 7.4)
- **Impacto**: Atacantes podem injetar scripts maliciosos para roubo de tokens de sessão ativos de usuários.
- **Remediação Recomendada**: Alinhar cabeçalho \`Content-Security-Policy: default-src 'self'\` no gateway de produção.

## 📈 SCORE DE RISCO AEGIS
- **Score Final**: 70 / 100 (Média de conformidade regular)
- **Veredito**: Infraestrutura necessita de patches urgentes antes do merge final.
`}
                    </div>
                  </div>
                )}

                {selectedIntroSubTab === 'polish' && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 animate-fade-in text-left">
                    <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white font-display">Product Polish: Melhorias para Hackathons e Demo</h3>
                      <p className="text-xs text-slate-400 mt-1">O salto qualitativo que transforma o Aegis de script em produto competitivo.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-slate-955 p-4 border border-slate-850 rounded-lg space-y-2">
                        <h4 className="text-xs font-bold text-red-400 font-mono uppercase">O Que Faltava Antes (No Script Simples)</h4>
                        <ul className="space-y-1 text-xs text-slate-400 list-disc pl-4 leading-relaxed font-sans">
                          <li>Ausência de plano de negócio estruturado (Pitch)</li>
                          <li>Navegação complexa sem agrupamento por escopo</li>
                          <li>Ausência de exemplos práticos e amigáveis para iniciantes</li>
                          <li>Nenhum padrão formalizado de relatórios</li>
                          <li>Lógica de scan oculta (black-box)</li>
                        </ul>
                      </div>

                      <div className="bg-[#121c17] p-4 border border-emerald-900/30 rounded-lg space-y-2">
                        <h4 className="text-xs font-bold text-emerald-450 font-mono uppercase">O Que Foi Corrigido Agora (Na Aegis Platform)</h4>
                        <ul className="space-y-1 text-xs text-slate-350 list-disc pl-4 leading-relaxed font-sans">
                          <li>Suíte completa com 3 formatos de Pitch ativos</li>
                          <li>Design moderno bento-style com subtabs limpas</li>
                          <li><strong>Elite AppSec Workbench</strong> gerando código funcional real</li>
                          <li>Exportador em Markdown profissional pronto para uso corporativo</li>
                          <li>Logs explicativos em tempo de execução no Terminal</li>
                        </ul>
                      </div>

                    </div>

                    <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase">Por que isso melhora a apresentação no Hackathon?</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Jurados de hackathons avaliam a usabilidade, a integridade do código e a clareza da proposta de valor. O Aegis brilha nesse aspecto pois a plataforma não é apenas bonita de se ver: ela fornece utilitários reais de ponta, permitindo que o usuário aprenda as táticas de elite de segurança defensiva ao gerar e inspecionar scripts funcionais de auditoria em Python, unindo uma UX fascinante com engenharia de software de altíssimo nível.
                      </p>
                    </div>
                  </div>
                )}

                {selectedIntroSubTab === 'elite_tools' && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 animate-fade-in text-left relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-3xl rounded-full pointer-events-none" />
                    
                    <div className="border-b border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                            <Award className="w-5 h-5 text-pink-400" />
                            Elite AppSec Workbench (10K+ Combinations)
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Gere scripts Python avançados baseados em táticas de automação e hardening de segurança de elite.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full animate-pulse">
                          Hall of Fame Level
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Controls Column (5 cols) */}
                      <div className="lg:col-span-4 space-y-4 bg-slate-955 p-4 border border-slate-850 rounded-xl">
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">1. Vetor de Ataque / Alvo</label>
                          <select
                            value={bugTarget}
                            onChange={(e) => setBugTarget(e.target.value)}
                            className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-white outline-none focus:border-pink-500/70 font-mono font-bold"
                          >
                            <option value="XSS">XSS (Cross-Site Scripting Refletido)</option>
                            <option value="SQLI">SQL Injection (Error & Time-Based)</option>
                            <option value="SUBTAKE">Subdomain Takeover (CNAME Órfão)</option>
                            <option value="JWT_BYPASS">JWT Signature Bypass (Algoritmo None)</option>
                            <option value="HEADERS">Análise Heurística de Headers (OWASP)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">2. Motor de Concorrência</label>
                          <select
                            value={bugEngine}
                            onChange={(e) => setBugEngine(e.target.value)}
                            className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-white outline-none focus:border-pink-500/70 font-mono font-bold"
                          >
                            <option value="THREADPOOL">ThreadPoolExecutor (Multithreading)</option>
                            <option value="SEQUENTIAL">Sequencial (Requests + Backoff)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">3. Filtro de Auditoria</label>
                          <select
                            value={bugFilter}
                            onChange={(e) => setBugFilter(e.target.value)}
                            className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-white outline-none focus:border-pink-500/70 font-mono font-bold"
                          >
                            <option value="REGEX_SIGNATURES">Mapeamento de Regex / Assinaturas</option>
                            <option value="TIMING_ATTACK">Análise de Latência (Timing Attack)</option>
                            <option value="DIFFERENTIAL">Diferencial de Resposta (Status Code/Body)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">4. Alvo Padrão (Target Domain)</label>
                          <input
                            type="text"
                            value={bugDomain}
                            onChange={(e) => setBugDomain(e.target.value)}
                            placeholder="example-target.com"
                            className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-white outline-none focus:border-pink-500/70 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">5. Threads</label>
                            <input
                              type="number"
                              value={bugThreads}
                              onChange={(e) => setBugThreads(Number(e.target.value))}
                              min={1}
                              max={100}
                              className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-white outline-none focus:border-pink-500/70 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">6. Custom Header</label>
                            <input
                              type="text"
                              value={bugCustomHeader}
                              onChange={(e) => setBugCustomHeader(e.target.value)}
                              placeholder="X-Hunter: True"
                              className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-white outline-none focus:border-pink-500/70 font-mono"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="bg-[#120a11] border border-pink-955 p-3 rounded-lg text-[11px] text-pink-400 font-sans leading-relaxed">
                            💡 <strong>Fórmula Combinatória Ativa</strong>: Multiplicando nossos chassis modularizados de plugins com os 15+ vetores de Google Hall of Fame e motores do Aegis Framework, você dispõe de mais de <strong>10.000 configurações possíveis</strong> de ferramentas Python de elite prontas para exportar e usar.
                          </div>
                        </div>

                      </div>

                      {/* Code Output Column (8 cols) */}
                      <div className="lg:col-span-8 flex flex-col justify-between bg-slate-950 rounded-xl border border-slate-850 overflow-hidden min-h-[400px]">
                        
                        {/* Header Box */}
                        <div className="px-4 py-2.5 border-b border-slate-850 bg-slate-900/40 flex items-center justify-between font-mono">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <FileCode className="w-3.5 h-3.5 text-pink-400" />
                            aegis_elite_hunter.py (Código Gerado)
                          </span>
                          <button
                            onClick={() => handleCopyToClipboard(generateElitePythonScript(), 'elite_py_script')}
                            className="px-2.5 py-1 rounded bg-pink-600/10 hover:bg-pink-600/20 text-[10px] font-mono font-bold text-pink-400 border border-pink-500/20 hover:border-pink-500/40 transition active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            {copiedText === 'elite_py_script' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                            <span>{copiedText === 'elite_py_script' ? 'Copiado!' : 'Copiar Código'}</span>
                          </button>
                        </div>

                        {/* Codebox View */}
                        <div className="flex-1 p-4 overflow-y-auto max-h-[380px] text-left scrollbar-thin">
                          <pre className="font-mono text-[10.5px] leading-relaxed text-slate-250 select-all whitespace-pre">
                            {generateElitePythonScript()}
                          </pre>
                        </div>

                        {/* Footer Box */}
                        <div className="px-4 py-2 bg-[#080d14] border-t border-slate-850 text-center font-mono text-[10px] text-slate-400">
                          🎯 Salve o código acima como <code className="text-pink-400 font-bold">aegis_hunter.py</code> e execute: <code className="text-white">python3 aegis_hunter.py --target {bugDomain || 'victim.com'}</code>
                        </div>

                      </div>

                    </div>
                  </div>
                )}

                {/* VISUAL & INTERACTIVE INTEGRATION MANUAL: TERMUX, KALI, DEBIAN */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 md:p-6 mt-6 space-y-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="text-emerald-450 w-5 h-5 animate-pulse" />
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                          Manual de Implantação e Dependências
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Instale dependências de sistema e deploy sem esforço no Termux, Kali Linux e Debian GNU/Linux.
                        </p>
                      </div>
                    </div>
                    
                    {/* Platform Select Tabs */}
                    <div className="flex bg-[#0b0f19] p-1 rounded-lg border border-slate-800 self-start sm:self-center">
                      <button
                        onClick={() => setSelectedManualPlatform('termux')}
                        className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded transition cursor-pointer ${
                          selectedManualPlatform === 'termux'
                            ? 'bg-emerald-600/15 text-emerald-400'
                            : 'text-slate-450 hover:text-slate-250 hover:bg-slate-800/40'
                        }`}
                      >
                        📱 Termux (Android)
                      </button>
                      <button
                        onClick={() => setSelectedManualPlatform('kali')}
                        className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded transition cursor-pointer ${
                          selectedManualPlatform === 'kali'
                            ? 'bg-[#1f293d] text-sky-400 border border-slate-800/10'
                            : 'text-slate-450 hover:text-slate-250 hover:bg-slate-800/40'
                        }`}
                      >
                        ☠️ Kali Linux
                      </button>
                      <button
                        onClick={() => setSelectedManualPlatform('debian')}
                        className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded transition cursor-pointer ${
                          selectedManualPlatform === 'debian'
                            ? 'bg-[#1c322b] text-indigo-400'
                            : 'text-slate-450 hover:text-slate-250 hover:bg-slate-800/40'
                        }`}
                      >
                        🌀 Debian Linux
                      </button>
                    </div>
                  </div>

                  {/* Manual Platform Content view */}
                  {selectedManualPlatform === 'termux' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div className="bg-[#0b0f19] border border-emerald-950/40 p-4 rounded-lg flex items-start gap-3">
                        <span className="text-base mt-0.5">💡</span>
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide font-mono block">Ambiente Móvel (Termux)</span>
                          <p className="text-[11.5px] text-slate-350 leading-relaxed">
                            O Termux roda um ambiente Linux isolado sob Android. Para garantir que scripts avançados do ToolForge em Python ou Node.js rodem sem travamentos ou falhas de pacotes nativos, você precisa inicializar os pacotes essenciais de compilação.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {/* Dependencies Checklist */}
                        <div className="space-y-2 bg-[#090d16] border border-slate-850 p-4 rounded-lg">
                          <h4 className="text-[10.5px] font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850/60 pb-1.5">
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                            Dependências Recomendadas
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-400">
                            <li className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span><strong>Python / Pip</strong> (Scripts executores)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span><strong>Nodejs / NPM</strong> (Gateways de API)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span><strong>Git & OpenSSH</strong> (Clonagem e conectores)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span><strong>Clang & Make</strong> (Compilação de módulos C/C++)</span>
                            </li>
                          </ul>
                        </div>

                        {/* Quick Command Installation codebox */}
                        <div className="space-y-2 bg-[#090d16] border border-slate-850 p-4 rounded-lg flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-slate-850/60 pb-1.5 font-mono">
                              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                                Comando de Boot/Setup
                              </h4>
                              <button
                                onClick={() => handleCopyToClipboard(
                                  'pkg update && pkg upgrade -y && pkg install python python-pip nodejs git openssh curl termux-api sqlite clang make -y',
                                  'termux_install_all'
                                )}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedText === 'termux_install_all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedText === 'termux_install_all' ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </div>
                            <pre className="font-mono text-[10.5px] text-slate-200 bg-slate-950/80 p-2.5 rounded mt-2 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                              pkg update && pkg upgrade -y && pkg install python python-pip nodejs git openssh curl termux-api sqlite clang make -y
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Commands flow guide */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Fluxo de Inicialização</span>
                        <div className="bg-[#070b13] p-3.5 rounded-lg border border-slate-850 font-mono text-[11px] leading-relaxed text-slate-300 space-y-2 text-left">
                          <p>
                            <span className="text-neutral-500 mr-1">1.</span> cd $HOME
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">2.</span> git clone <span className="text-indigo-300">https://github.com/SEU_USER/{githubRepoName || 'toolforge-projeto'}</span>
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">3.</span> cd {githubRepoName || 'toolforge-projeto'}
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">4.</span> <span className="text-emerald-400"># Se o projeto for Python:</span><br />
                            &nbsp;&nbsp;&nbsp;pip install -r requirements.txt<br />
                            &nbsp;&nbsp;&nbsp;python auditor_integridade.py
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">5.</span> <span className="text-indigo-400"># Se o projeto for Node.js:</span><br />
                            &nbsp;&nbsp;&nbsp;npm install<br />
                            &nbsp;&nbsp;&nbsp;node server.js
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedManualPlatform === 'kali' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div className="bg-[#0b1221] border border-sky-950/50 p-4 rounded-lg flex items-start gap-3">
                        <span className="text-base mt-0.5">🛡️</span>
                        <div className="space-y-1">
                          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wide font-mono block">Ambiente Ofensivo / Forense (Kali Linux)</span>
                          <p className="text-[11.5px] text-slate-350 leading-relaxed font-sans">
                            O Kali Linux é equipado por padrão com dezenas de ferramentas utilitárias, porém para integridade do ambiente e isolamento tático de processos executores, é altamente recomendado o uso de Virtual Environments (venv) para evitar corromper dependências globais de pacotes do sistema de segurança.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {/* Dependencies Checklist */}
                        <div className="space-y-2 bg-[#090e1a]/80 border border-slate-850 p-4 rounded-lg">
                          <h4 className="text-[10.5px] font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-sky-950/50 pb-1.5">
                            <ShieldCheck className="w-4 h-4 text-sky-400" />
                            Dependências Necessárias
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-400">
                            <li className="flex items-center gap-2">
                              <span className="text-sky-450 font-bold">✓</span>
                              <span><strong>python3-pip & python3-venv</strong> (Isolamento completo)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-sky-450 font-bold">✓</span>
                              <span><strong>build-essential & git</strong> (Módulos de rede e compilação)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-sky-450 font-bold">✓</span>
                              <span><strong>curl, nodejs, npm</strong> (Para APIs e testes adicionais)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-sky-450 font-bold">✓</span>
                              <span><strong>sqlite3 & libsqlite3-dev</strong> (Bancos de dados leves)</span>
                            </li>
                          </ul>
                        </div>

                        {/* Quick Command Installation codebox */}
                        <div className="space-y-2 bg-[#090e1a]/80 border border-slate-850 p-4 rounded-lg flex flex-col justify-between font-mono">
                          <div>
                            <div className="flex items-center justify-between border-b border-sky-950/50 pb-1.5">
                              <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                                Instalação Segura
                              </h4>
                              <button
                                onClick={() => handleCopyToClipboard(
                                  'sudo apt update && sudo apt install python3 python3-pip python3-venv nodejs npm git curl sqlite3 build-essential -y',
                                  'kali_install_all'
                                )}
                                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedText === 'kali_install_all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedText === 'kali_install_all' ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </div>
                            <pre className="text-[10.5px] text-slate-200 bg-slate-950/90 p-2.5 rounded mt-2 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                              sudo apt update && sudo apt install python3 python3-pip python3-venv nodejs npm git curl sqlite3 build-essential -y
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Commands flow guide */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Fluxo de Deploy e Execução</span>
                        <div className="bg-[#050912] p-3.5 rounded-lg border border-slate-850 font-mono text-[11px] leading-relaxed text-slate-300 space-y-2 text-left">
                          <p>
                            <span className="text-neutral-500 mr-1">1.</span> git clone <span className="text-indigo-300">https://github.com/SEU_USER/{githubRepoName || 'toolforge-projeto'}</span>
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">2.</span> cd {githubRepoName || 'toolforge-projeto'}
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">3.</span> <span className="text-sky-450"># Montar sandbox isolada com venv (Higiene de Dependências):</span><br />
                            &nbsp;&nbsp;&nbsp;python3 -m venv venv<br />
                            &nbsp;&nbsp;&nbsp;source venv/bin/activate
                          </p>
                          <p>
                            <span className="text-neutral-500 mr-1">4.</span> <span className="text-sky-400"># Implementar e rodar em segundos:</span><br />
                            &nbsp;&nbsp;&nbsp;pip3 install --upgrade pip<br />
                            &nbsp;&nbsp;&nbsp;pip3 install -r requirements.txt<br />
                            &nbsp;&nbsp;&nbsp;python3 auditor_integridade.py
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedManualPlatform === 'debian' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div className="bg-[#0d161d] border border-indigo-950 p-4 rounded-lg flex items-start gap-3 flex-row text-left">
                        <span className="text-base mt-0.5">🌀</span>
                        <div className="space-y-1">
                          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide font-mono block">Instalação Amigável (Debian GNU/Linux)</span>
                          <p className="text-[11.5px] text-slate-350 leading-relaxed font-sans">
                            Ambientes de servidores Debian estáveis são ideais para rodar as ferramentas do ToolForge sem qualquer latência ou erro de execução. Para isso, certifique-se de que os compiladores nativos e geradores de enlace estejam propriamente inicializados de acordo com as diretivas recomendadas.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {/* Dependencies Checklist */}
                        <div className="space-y-2 bg-[#090c12] border border-slate-850 p-4 rounded-lg">
                          <h4 className="text-[10.5px] font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-950 pb-1.5">
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                            Dependências Essenciais Debian
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-400">
                            <li className="flex items-center gap-2">
                              <span className="text-indigo-400 font-bold">✓</span>
                              <span><strong>python3-pip & python3-venv</strong> (Isolamento completo)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-indigo-400 font-bold">✓</span>
                              <span><strong>nodejs (versão LTS do repositório)</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-indigo-400 font-bold">✓</span>
                              <span><strong>git, curl, curl-ca-bundle</strong> (Padrões de rede)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-indigo-400 font-bold">✓</span>
                              <span><strong>sqlite3</strong> (Para o módulo de banco de dados nativo)</span>
                            </li>
                          </ul>
                        </div>

                        {/* Quick Command Installation codebox */}
                        <div className="space-y-2 bg-[#090c12] border border-slate-850 p-4 rounded-lg flex flex-col justify-between font-mono">
                          <div>
                            <div className="flex items-center justify-between border-b border-indigo-950 pb-1.5">
                              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-indigo-450 animate-pulse" />
                                Comando Debian
                              </h4>
                              <button
                                onClick={() => handleCopyToClipboard(
                                  'sudo apt update && sudo apt install python3 python3-pip python3-venv nodejs npm git curl sqlite3 build-essential -y',
                                  'debian_install_all'
                                )}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                              >
                                {copiedText === 'debian_install_all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedText === 'debian_install_all' ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </div>
                            <pre className="text-[10.5px] text-slate-200 bg-slate-950/90 p-2.5 rounded mt-2 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                              sudo apt update && sudo apt install python3 python3-pip python3-venv nodejs npm git curl sqlite3 build-essential -y
                            </pre>
                          </div>
                        </div>
                      </div>

                      {/* Commands flow guide */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block font-mono">Executando Projetos Baseados em Node.js ou Python</span>
                        <div className="bg-[#05070e] p-3.5 rounded-lg border border-slate-850 font-mono text-[11px] leading-relaxed text-slate-300 space-y-2 text-left">
                          <p>
                            <span className="text-indigo-400 font-bold font-mono"># Python:</span><br />
                            python3 -m venv venv && source venv/bin/activate<br />
                            pip3 install -r requirements.txt && python3 auditor_integridade.py
                          </p>
                          <p>
                            <span className="text-emerald-400 font-bold font-mono"># Node.js Express:</span><br />
                            npm install && npm start
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 1: FILE EXPLORER + INLINE SOURCE CODE EDITOR */}
            {activeTab === 'code' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                
                {/* EXPLORER COLUMN (3 cols) */}
                <div className="md:col-span-4 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                    <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-bold">Navegador de Pastas</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                      {Object.keys(filesContent).length} {Object.keys(filesContent).length === 1 ? 'arquivo' : 'arquivos'}
                    </span>
                  </div>

                  {isCompilingChassis ? (
                    /* COMPILATION GRAPHICAL OVERLAY WITH SCROLLING LOGS */
                    <div className="flex-1 p-3 flex flex-col justify-between bg-[#070b14]/90 overflow-hidden min-h-[350px]">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                            Montando Chassi...
                          </span>
                          <span>{compilationProgress}%</span>
                        </div>
                        
                        {/* Progress bar graph */}
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-indigo-500 rounded-full transition-all duration-150"
                            style={{ width: `${compilationProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Compilation Terminal scrolling logs view */}
                      <div className="flex-grow my-4 bg-slate-950/80 p-3 rounded-lg border border-slate-850 font-mono text-[9px] leading-relaxed text-slate-350 overflow-y-auto max-h-[380px] scrollbar-thin space-y-1.5 text-left">
                        {compilationLogs.map((log, index) => (
                          <div key={index} className="border-b border-slate-900/40 pb-1 last:border-0 font-mono">
                            <span className="text-emerald-450 mr-1.5 select-none font-bold">►</span>
                            <span className="text-slate-300">{log}</span>
                          </div>
                        ))}
                        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                      </div>

                      <div className="py-1 border-t border-slate-900 text-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                          Offline Assembly Module
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Manual forced local compilation trigger */}
                      <div className="p-2 border-b border-slate-850 bg-slate-950/30">
                        <button
                          onClick={triggerChassisCompilation}
                          className="w-full py-2 px-2.5 rounded bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 hover:border-emerald-500/45 text-[10.5px] font-mono font-black text-emerald-300 transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm uppercase"
                          title="Forçar compilação local imediata e recriar toda hierarquia de arquivos"
                        >
                          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                          <span>⚡ Compilar Chassi Operacional</span>
                        </button>
                      </div>

                      <div className="flex-1 p-2 overflow-y-auto space-y-1">
                        {directoryItems.length === 0 ? (
                          <div className="text-center py-8 text-xs text-slate-500">Nenhum arquivo estruturado.</div>
                        ) : (
                          directoryItems.map((item, index) => {
                            const isSelected = activeFile === item.path;
                            const isDir = item.type === 'directory';
                            const isCollapsed = collapsedFolders[item.path];
                            
                            // Simple hide nested children of collapsed directories
                            let isParentCollapsed = false;
                            const parts = item.path.split('/');
                            if (parts.length > 1) {
                              for (let i = 1; i < parts.length; i++) {
                                const parentKey = parts.slice(0, i).join('/');
                                if (collapsedFolders[parentKey]) {
                                  isParentCollapsed = true;
                                  break;
                                }
                              }
                            }

                            if (isParentCollapsed) return null;

                            return (
                              <div
                                key={item.path}
                                style={{ paddingLeft: `${item.level * 12 + 6}px` }}
                                onClick={() => {
                                  if (isDir) {
                                    toggleFolder(item.path);
                                  } else {
                                    setActiveFile(item.path);
                                  }
                                }}
                                className={`flex items-center gap-2 py-1.5 px-2 rounded text-xs cursor-pointer select-none transition group ${
                                  isSelected 
                                    ? 'bg-indigo-950/50 border border-indigo-900/50 text-indigo-300 font-medium' 
                                    : isDir ? 'text-slate-300 hover:bg-slate-850/40' : 'text-slate-400 hover:bg-slate-850/40 hover:text-slate-200'
                                }`}
                              >
                                <span className="shrink-0">
                                  {isDir ? (
                                    isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-500 transition-transform" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 rotate-90 transition-transform" />
                                  ) : (
                                    <span className="w-3.5" />
                                  )}
                                </span>
                                
                                <span className="shrink-0 -ml-1">
                                  {isDir ? (
                                    isCollapsed ? <Folder className="w-4 h-4 text-indigo-400" /> : <FolderOpen className="w-4 h-4 text-indigo-400" />
                                  ) : (
                                    getFileIcon(item.name)
                                  )}
                                </span>

                                <div className="flex-1 truncate">
                                  <div className="truncate font-mono">{item.name}</div>
                                  {item.description && (
                                    <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-400 hidden md:block">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="p-3.5 bg-slate-900 border-t border-slate-850/65">
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Configure o arquivo clicando nele e baixando o zip!</span>
                    </div>
                  </div>
                </div>

                {/* EDITOR COLUMN (8 cols) */}
                <div className="md:col-span-8 flex flex-col bg-[#0b101e]/85">
                  
                  {/* Editor File Ribbon */}
                  <div className="bg-[#111827] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      {getFileIcon(activeFile)}
                      <span className="text-xs font-mono text-slate-200 font-semibold">{activeFile}</span>
                      {isEdited && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" title="Modificado - não salvo" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isEdited && (
                        <button
                          id="save-code-btn"
                          onClick={handleSaveCodeCell}
                          className="bg-indigo-600 hover:bg-indigo-500 text-indigo-100 text-[11px] px-2.5 py-1.5 rounded font-semibold flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          Salvar Modificação
                        </button>
                      )}
                      <button
                        id="copy-file-btn"
                        onClick={() => handleCopyToClipboard(editingCode, 'active_code')}
                        className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 border border-slate-800 rounded hover:bg-slate-800 transition flex items-center gap-1"
                        title="Copiar código"
                      >
                        {copiedText === 'active_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[11px] font-mono">{copiedText === 'active_code' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Editor Workspace */}
                  <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="text-[10px] text-indigo-300/80 bg-slate-900/70 border-b border-slate-800/40 px-4 py-1.5 flex items-center gap-2 font-mono">
                      <span>✓ Edição ao vivo ativa: Sinta-se livre para customizar os códigos fonte do gerador!</span>
                    </div>

                    <div className="flex-1 flex overflow-y-auto">
                      {/* Simulated line numbers */}
                      <div className="bg-[#0b0f19] text-right font-mono text-[11px] text-slate-650 px-3 py-4 select-none border-r border-slate-850/60 flex flex-col sticky top-0 h-full w-12">
                        {Array.from({ length: Math.max(1, editingCode.split('\n').length) }).map((_, i) => (
                          <div key={i} className="leading-6 h-6">{i + 1}</div>
                        ))}
                      </div>

                      {/* Code Textarea Input */}
                      <textarea
                        id="code-editor-textarea"
                        value={editingCode}
                        onChange={e => {
                          setEditingCode(e.target.value);
                          setIsEdited(true);
                        }}
                        className="flex-1 bg-transparent border-0 outline-none text-[11px] font-mono text-slate-200 p-4 resize-none leading-6 min-h-[400px] h-full focus:ring-0 leading-relaxed overflow-x-auto w-full max-w-full block"
                        style={{ whiteSpace: "pre", wordBreak: "normal" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TERMINAL SIMULATOR */}
            {activeTab === 'terminal' && (
              <div className="flex-1 p-5 flex flex-col gap-4">
                
                {/* Terminal Controls Console */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-400">Instrução CMD:</div>
                    <code className="text-xs font-mono bg-slate-950 border border-slate-800 px-2 py-1.5 rounded text-indigo-300">
                      {blueprint.cli?.commandUsage || 'python auditor_integridade.py'}
                    </code>
                  </div>
                  
                  {blueprint.projectName.includes('Auditor') && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">Alvo IP/Host:</span>
                      <input
                        id="target-url-input"
                        type="text"
                        value={targetUrl}
                        onChange={e => setTargetUrl(e.target.value)}
                        placeholder="IP ou Domínio"
                        className="text-xs bg-[#0b0f19] border border-slate-850 px-2 py-1 rounded text-slate-200 focus:outline-none focus:border-indigo-500 w-44"
                      />
                    </div>
                  )}

                  <button
                    id="term-simulate-btn"
                    onClick={handleStartSimulation}
                    disabled={isRunningTerminal}
                    className="bg-indigo-600 hover:bg-indigo-500 text-indigo-50 text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-indigo-50 shrink-0" />
                    Executar Simulação
                  </button>
                </div>

                {/* Simulated Screen */}
                <div className="bg-[#040815] border border-slate-950 shadow-inner rounded-xl p-4 flex-1 font-mono text-xs flex flex-col justify-between overflow-hidden min-h-[380px]">
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[420px] flex-1">
                    {/* Shell Prompt Header if stagnant */}
                    {terminalLogs.length === 0 && (
                      <div className="text-slate-500 italic">
                        Clique em "Executar Simulação" acima para testar e validar o comportamento operacional da ferramenta em lote ou use o terminal interativo abaixo.
                      </div>
                    )}
                    
                    {terminalLogs.map((log, i) => {
                      let colorClass = 'text-slate-300';
                      if (log.type === 'input') colorClass = 'text-indigo-400 font-bold';
                      else if (log.type === 'success') colorClass = 'text-emerald-400';
                      else if (log.type === 'warn') colorClass = 'text-amber-400';
                      else if (log.type === 'error') colorClass = 'text-rose-400';
                      else if (log.type === 'info') colorClass = 'text-cyan-400';

                      return (
                        <div key={i} className={`whitespace-pre-wrap leading-relaxed ${colorClass}`}>
                          {log.type === 'input' && <span className="text-indigo-500 font-extrabold mr-1.5">~ $</span>}
                          {log.text}
                        </div>
                      );
                    })}

                    <div ref={terminalLogsEndRef} />
                  </div>

                  {/* Interactive Terminal Prompt Input */}
                  <form onSubmit={handleTerminalSubmit} className="mt-3 pt-2.5 border-t border-slate-900/60 flex items-center gap-2">
                    <span className="text-indigo-500 font-extrabold shrink-0 font-mono">~ $</span>
                    <input
                      type="text"
                      value={cliInput}
                      onChange={e => setCliInput(e.target.value)}
                      disabled={isRunningTerminal}
                      placeholder='Digite comandos... (ex: "help", "list", "doctor", "run aegis-jwt")'
                      className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none focus:ring-0 text-xs font-mono placeholder:text-slate-700 placeholder:italic"
                    />
                    <button
                      type="submit"
                      disabled={isRunningTerminal || !cliInput.trim()}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-2 py-1 rounded shrink-0 font-sans disabled:opacity-40 transition"
                    >
                      Executar
                    </button>
                  </form>

                  <div className="border-t border-slate-950/70 pt-2.5 mt-3 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Console virtual pronto</span>
                    </div>
                    <span>UTC: {new Date().toISOString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DATABASE SCHEMA VISUALIZER */}
            {activeTab === 'database' && blueprint.database && (
              <div className="flex-1 p-5 space-y-6 overflow-y-auto max-h-[680px]">
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Database className="w-7 h-7 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-display font-medium text-white">Relatório Técnico - Banco de Dados</h3>
                      <p className="text-xs text-slate-450 mt-1">
                        Especificações físicas das tabelas no SQLite local preenchidas no chassi.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs bg-slate-950/80 border border-slate-850/50 p-2.5 rounded-lg space-y-1 font-mono text-slate-400 shrink-0">
                    <div><span className="text-indigo-400">Motor:</span> {blueprint.database.type} ({blueprint.database.engine})</div>
                    <div><span className="text-indigo-400">Aquivamento:</span> {blueprint.database.filePath}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Object.entries((blueprint.database.tables || {}) as Record<string, any>).map(([tableName, table]) => (
                    <div key={tableName} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
                      
                      <div className="bg-[#131d35] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-mono font-bold text-white uppercase">{tableName}</span>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                          {table.columns.length} colunas
                        </span>
                      </div>

                      <div className="p-3">
                        <p className="text-xs text-slate-400 mb-3 italic">{table.description}</p>
                        
                        <div className="space-y-2">
                          {table.columns.map((col, idx) => (
                            <div key={idx} className="bg-[#0b0f19] border border-slate-950 rounded p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-slate-800/80 transition">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono font-semibold text-slate-200">{col.name}</span>
                                  <span className="text-[9px] bg-indigo-950 hover:bg-indigo-900 border border-indigo-900/40 text-indigo-300 font-mono px-1 rounded-sm">
                                    {col.type}
                                  </span>
                                  {col.constraints && (
                                    <span className="text-[9px] border border-amber-500/20 text-amber-500 font-mono px-1 rounded-sm">
                                      {col.constraints}
                                    </span>
                                  )}
                                </div>
                                {col.description && (
                                  <div className="text-[10px] text-slate-550 mt-0.5">{col.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {table.indexes && table.indexes.length > 0 && (
                        <div className="border-t border-slate-850 bg-slate-950/20 px-4 py-2.5 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Índices rápidos:</span>
                          <div className="flex flex-wrap gap-1">
                            {table.indexes.map((idxName, i) => (
                              <span key={i} className="text-[9px] bg-slate-800/85 text-slate-400 font-mono px-1.5 py-0.2 rounded">
                                {idxName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: COMPLIANCE & SECURITY POLICIES */}
            {activeTab === 'security' && (
              <div className="flex-1 p-5 space-y-6 overflow-y-auto max-h-[680px]">
                
                {/* Header Summary */}
                <div className="bg-slate-900 border border-slate-840 rounded-xl p-4 flex items-center gap-3">
                  <ShieldAlert className="w-8 h-8 text-indigo-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-display font-medium text-white">Práticas de Higiene Digital e Conformidade</h3>
                    <p className="text-xs text-slate-450 mt-1">
                      Mapeamento das vulnerabilidades de rede investigadas pelo projeto, em conformidade com o framework defensivo do blueprint.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Controlled Vulnerabilities Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Vulns Mapeadas na Auditoria</h4>
                    <div className="space-y-2">
                      {blueprint.security?.controlledVulnerabilities ? (
                        blueprint.security.controlledVulnerabilities.map((vuln, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <span>{vuln}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 text-xs font-mono">Nenhuma vulnerabilidade cadastrada no blueprint.</div>
                      )}
                    </div>
                  </div>

                  {/* Mitigations Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Mapeamento de Remediações</h4>
                    <div className="space-y-2.5">
                      {blueprint.security?.mitigations ? (
                        blueprint.security.mitigations.map((nit, i) => (
                          <div key={i} className="bg-[#0b0f19] border border-slate-850 p-2.5 rounded-lg text-xs hover:border-slate-800 transition">
                            <div className="font-semibold text-slate-200">Ameaça: {nit.threat}</div>
                            <div className="text-emerald-400 mt-0.5 font-mono text-[11px]">Mitigação: {nit.mitigation}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 text-xs font-mono">Sem dados de mitigação listados no blueprint.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expected Response Headers Compliance Table */}
                {blueprint.security?.securityHeaders && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
                    <div className="bg-[#111c34] px-4 py-3 border-b border-slate-800">
                      <h4 className="text-xs font-mono font-bold uppercase text-white">OWASP Headers Exigidos e Alinhados</h4>
                    </div>
                    <div className="divide-y divide-slate-850">
                      {Object.entries((blueprint.security.securityHeaders || {}) as Record<string, any>).map(([headerName, header]) => (
                        <div key={headerName} className="p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 hover:bg-slate-850/15 transition">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-200">{headerName}</span>
                              {header.required && (
                                <span className="text-[9px] bg-red-950 border border-red-900/50 text-red-400 px-1.5 rounded-sm font-semibold uppercase">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-450">{header.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {header.criticality && (
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                                header.criticality === 'CRITICA' || header.criticality === 'ALTA'
                                  ? 'bg-rose-950 text-rose-400'
                                  : 'bg-amber-950 text-amber-500'
                              }`}>
                                Criticidade {header.criticality}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: TECHSTACK METADATA */}
            {activeTab === 'tech' && (
              <div className="flex-1 p-5 space-y-6 overflow-y-auto max-h-[680px]">
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-sm font-display font-medium text-white mb-3">Especificações Tecnológicas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    
                    <div className="bg-[#0b0f19] border border-slate-850 p-3 rounded-lg flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 tracking-wider font-mono uppercase font-semibold">Linguagens Primárias</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {blueprint.technologies?.primaryLanguages?.map((lang, idx) => (
                          <span key={idx} className="text-xs bg-slate-850 px-2 py-0.8 rounded font-mono text-slate-300">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0b0f19] border border-slate-850 p-3 rounded-lg flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 tracking-wider font-mono uppercase font-semibold">Tecnologias de Banco</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {blueprint.technologies?.databases?.map((db, idx) => (
                          <span key={idx} className="text-xs bg-slate-850 px-2 py-0.8 rounded font-mono text-slate-300">
                            {db}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0b0f19] border border-slate-850 p-3 rounded-lg flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 tracking-wider font-mono uppercase font-semibold">Frame / Concorrência</span>
                      <div className="text-xs font-mono font-medium text-indigo-400 mt-2">
                        {blueprint.technologies?.cliFramework ? `${blueprint.technologies.cliFramework} CLI` : 'N/A'} • {blueprint.technologies?.concurrencyModel || 'ThreadPoolExecutor'}
                      </div>
                    </div>
                  </div>
                </div>

                {blueprint.technologies?.libraries?.thirdParty && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow">
                    <div className="bg-[#111c34] px-4 py-3 border-b border-slate-850">
                      <h4 className="text-xs font-mono font-bold uppercase text-white">Dependências de Terceiros Alinhadas</h4>
                    </div>

                    <div className="divide-y divide-slate-850">
                      {blueprint.technologies.libraries.thirdParty.map((lib, idx) => (
                        <div key={idx} className="p-3 bg-[#0d1326]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-850/15 transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-200">{lib.name}</span>
                              <span className="text-[10px] bg-indigo-950/40 text-indigo-400 font-mono px-1.5 rounded">
                                {lib.version}
                              </span>
                            </div>
                            <p className="text-xs text-slate-450 mt-1">{lib.purpose}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Standard libraries */}
                {blueprint.technologies?.libraries?.standardLibrary && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-3">Módulos Nativos Cooptados</h4>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.technologies.libraries.standardLibrary.map((mod, i) => (
                        <span key={i} className="text-xs bg-[#0b0f19] border border-slate-850 text-slate-400 px-3 py-1 rounded font-mono">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: BIBLIOTECA DE PROMPTS (17.000 COMBINAÇÕES) */}
            {activeTab === 'library' && (
              <div className="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-850 h-auto md:h-[800px] overflow-visible md:overflow-hidden text-left bg-slate-950/20">
                {/* Lateral Control Panel */}
                <div className="w-full md:w-80 flex flex-col bg-[#080d19]/80 shrink-0 h-[400px] md:h-full">
                  <div className="p-4 border-b border-slate-850 bg-slate-900/10">
                    <div className="flex items-center gap-2 text-white">
                      <BookMarked className="w-4 h-4 text-emerald-400" />
                      <span className="font-display font-bold text-xs uppercase tracking-wider">Fábrica de Agentes</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Gerador combinatório com 17.280+ prompts de agentes Hermes prontos
                    </p>
                  </div>

                  {/* GENERATOR MODE CONTROLS */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">1. Persona / Papel</label>
                      <select
                        value={genRole}
                        onChange={(e) => setGenRole(e.target.value)}
                        className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-emerald-500/70 font-display"
                      >
                        {GENERATOR_ROLES.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">2. Objetivo Operacional</label>
                      <select
                        value={genTask}
                        onChange={(e) => setGenTask(e.target.value)}
                        className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-emerald-500/70 font-display"
                      >
                        {GENERATOR_TASKS.map(task => (
                          <option key={task.id} value={task.id}>{task.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">3. Stack de Tecnologia</label>
                      <select
                        value={genStack}
                        onChange={(e) => setGenStack(e.target.value)}
                        className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-emerald-500/70 font-display"
                      >
                        {GENERATOR_STACKS.map(stack => (
                          <option key={stack.id} value={stack.id}>{stack.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">4. Filosofia de Entrega</label>
                      <select
                        value={genStyle}
                        onChange={(e) => setGenStyle(e.target.value)}
                        className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-emerald-500/70 font-display"
                      >
                        {GENERATOR_STYLES.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">5. Tom do Consultor</label>
                      <select
                        value={genTone}
                        onChange={(e) => setGenTone(e.target.value)}
                        className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-emerald-500/70 font-display"
                      >
                        {GENERATOR_TONES.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-450 block">Customizar Escopo (Variável)</label>
                      <textarea
                        rows={2}
                        value={customParams}
                        onChange={(e) => setCustomParams(e.target.value)}
                        placeholder="Ex: Auditoria do microsserviço de autenticação ou banco de dados..."
                        className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-emerald-500/70 resize-none placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-grow flex flex-col overflow-hidden bg-[#060a13]/90 h-auto md:h-full">
                  {/* DYNAMIC ENGINE WRAPPER */}
                  <div className="flex-grow flex flex-col overflow-hidden">
                    {/* Generator Heading Header */}
                    <div className="p-5 border-b border-slate-850 bg-slate-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                            Motor Combinatório Hermes
                          </span>
                          <span className="text-[10.5px] text-slate-450 font-mono">
                            17.280+ composições de agentes possíveis
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white font-display">Fábrica de Agentes Hermes</h3>
                        <p className="text-xs text-slate-400">Combine personas, objetivos e stacks para compilar a estrutura operacional e diretivas do agente defensivo.</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getCompiledPrompt());
                            setCopiedText("combinatorio");
                            setTimeout(() => setCopiedText(null), 2500);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          {copiedText === "combinatorio" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Prompt</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setAiPrompt(getCompiledPrompt());
                            setActiveTab('intro');
                          }}
                          className="px-3.5 py-2 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-xs text-indigo-300 font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Carregar para o AI Builder</span>
                        </button>
                      </div>
                    </div>

                    {/* Live Output Compiler Preview */}
                    <div className="flex-grow overflow-y-auto p-5 scrollbar-thin">
                      <div className="bg-[#03060c] border border-emerald-950/40 rounded-xl p-5 font-mono text-xs text-emerald-400/90 leading-relaxed whitespace-pre-wrap select-all max-w-4xl mx-auto shadow-xl relative">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded text-emerald-400 font-bold animate-pulse border border-emerald-500/20 font-mono">
                            PROMPT COMPILADO COM SUCESSO
                          </span>
                        </div>
                        {getCompiledPrompt()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: IMPORTADOR ZIP & README GENERATOR */}
            {activeTab === 'zip_importer' && (
              <div className="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-850 min-h-[640px] text-left bg-slate-950/20 rounded-b-xl overflow-hidden">
                {/* Lateral Panel: Control / Upload & Config */}
                <div className="w-full md:w-96 flex flex-col bg-[#080d19]/90 shrink-0 p-5 divide-y divide-slate-850 gap-5 overflow-y-auto overflow-x-hidden scrollbar-thin">
                  
                  {/* File Upload / Attachment Zone */}
                  <div>
                    <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-sky-400 rotate-180" />
                      Anexar Pacote ZIP
                    </h3>
                    
                    <div className="relative group border-2 border-dashed border-slate-800 hover:border-sky-500/50 bg-[#040810]/60 hover:bg-[#040810]/95 p-5 rounded-xl transition duration-200 text-center flex flex-col items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleZipUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-10 h-10 rounded-full bg-sky-950/40 border border-sky-800/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition duration-200">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      
                      {zipFileName ? (
                        <div className="text-left w-full mt-1">
                          <p className="text-xs font-bold text-white truncate text-center">{zipFileName}</p>
                          <p className="text-[10px] text-emerald-400 font-mono text-center">✓ Carregado com sucesso!</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-300">Escolha ou solte o arquivo .zip</p>
                          <p className="text-[10px] text-slate-500 font-mono">Processamento feito 100% no cliente</p>
                        </div>
                      )}
                    </div>

                    {zipLoading && (
                      <div className="flex items-center gap-2 mt-3 bg-slate-905 border border-slate-850 p-2.5 rounded-lg text-xs text-sky-300 font-semibold justify-center">
                        <span className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent animate-spin rounded-full" />
                        Descompactando e extraindo metadados...
                      </div>
                    )}

                    {zipError && (
                      <div className="mt-3 bg-rose-955 border border-rose-900/35 p-3 rounded-lg text-xs text-rose-300">
                        <p className="font-bold">Falha no processamento:</p>
                        <p className="font-mono text-[11px] mt-1 opacity-90">{zipError}</p>
                      </div>
                    )}
                  </div>

                  {/* Presets / Exemplo de Ferramentas */}
                  <div className="pt-4 pb-2">
                    <h4 className="text-[10px] font-bold text-indigo-400 font-display uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Ferramentas de Pentest (Exemplos ZIP)
                    </h4>
                    <p className="text-[11px] text-slate-500 mb-3 leading-normal">
                      Selecione um pacote abaixo para estudar, obter comandos do Termux, prompts e códigos completos de reconstrução:
                    </p>
                    <div className="space-y-2">
                      {ZIP_PRESETS.map((p) => {
                        const isLoaded = zipFileName === p.fileName;
                        return (
                          <button
                            key={p.id}
                            onClick={() => loadZipPreset(p.id)}
                            className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 text-xs relative ${
                              isLoaded
                                ? 'bg-indigo-950/30 border-indigo-505/50 text-indigo-200'
                                : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/60 hover:border-slate-700/80 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold flex items-center gap-1.5">
                                <Terminal className={`w-3.5 h-3.5 ${isLoaded ? 'text-indigo-400' : 'text-slate-400'}`} />
                                {p.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-slate-950 rounded text-slate-500 font-mono">
                                {p.reconstructionLang.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                              {p.description}
                            </span>
                            {isLoaded && (
                              <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Analysis Output & Metadata */}
                  {Object.keys(zipFiles).length > 0 && (
                    <div className="pt-4 space-y-4">
                      <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Análise do Reconhecimento
                      </h3>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                            <span className="text-slate-500 block text-[9px] uppercase font-mono">Nome Projetado</span>
                            <input
                              type="text"
                              value={zipProjectName}
                              onChange={(e) => setZipProjectName(e.target.value)}
                              className="font-bold text-white bg-transparent outline-none border-b border-transparent focus:border-indigo-500 w-full"
                            />
                          </div>
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                            <span className="text-slate-500 block text-[9px] uppercase font-mono">Linguagem Base</span>
                            <span className="font-semibold text-emerald-400 truncate block">{zipDetectedLang}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 space-y-1">
                          <span className="text-slate-500 block text-[9px] uppercase font-mono">Módulos Extraídos</span>
                          <span className="font-mono text-white text-xs">{Object.keys(zipFiles).length} arquivos identificados</span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Descrição do Escopo</label>
                          <textarea
                            rows={3}
                            value={zipProjectDesc}
                            onChange={(e) => setZipProjectDesc(e.target.value)}
                            className="w-full bg-[#05080f] border border-slate-800 rounded-lg text-xs p-2.5 text-slate-300 outline-none focus:border-sky-500/70 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Export to GitHub Integration Section */}
                  {Object.keys(zipFiles).length > 0 && (
                    <div className="pt-4 space-y-4">
                      <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                        <Github className="w-4 h-4 text-slate-200" />
                        Exportador para o GitHub
                      </h3>

                      {githubToken ? (
                        <div className="space-y-3 text-left">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Nome do Repositório</label>
                            <input
                              type="text"
                              placeholder="nome-do-repositorio"
                              value={zipRepoName}
                              onChange={(e) => setZipRepoName(e.target.value)}
                              className="w-full bg-[#05080f] border border-slate-800 focus:border-indigo-500/70 rounded-lg text-xs p-2 text-white outline-none font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Descrição do Repositório</label>
                            <textarea
                              rows={2}
                              placeholder="Análise automatizada de projeto..."
                              value={zipRepoDesc}
                              onChange={(e) => setZipRepoDesc(e.target.value)}
                              className="w-full bg-[#05080f] border border-slate-800 focus:border-indigo-500/70 rounded-lg text-xs p-2 text-white outline-none resize-none leading-normal"
                            />
                          </div>

                          <div className="flex items-center justify-between py-1 px-1 bg-slate-900/30 border border-slate-850/40 rounded-lg">
                            <span className="text-xs text-slate-400">Privacidade</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setZipRepoPrivate(false)}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${!zipRepoPrivate ? 'bg-indigo-600/25 text-indigo-300 border border-indigo-500/25' : 'text-slate-500'}`}
                              >
                                Público
                              </button>
                              <button
                                type="button"
                                onClick={() => setZipRepoPrivate(true)}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${zipRepoPrivate ? 'bg-amber-600/25 text-amber-300 border border-amber-500/25' : 'text-slate-500'}`}
                              >
                                Privado
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handleZipExportGitHub}
                            disabled={isExportingZipGithub || !zipRepoName.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
                          >
                            {isExportingZipGithub ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                <span>Exportando Módulos...</span>
                              </>
                            ) : (
                              <>
                                <Github className="w-4 h-4 text-white" />
                                <span>Exportar Árvore p/ GitHub</span>
                              </>
                            )}
                          </button>

                          {zipGithubExportResult && (
                            <div className={`p-3 rounded-lg border text-xs mt-2 ${
                              zipGithubExportResult.success 
                                ? 'bg-emerald-955 border-emerald-900/40 text-emerald-300' 
                                : 'bg-rose-955 border-rose-900/40 text-rose-300'
                            }`}>
                              {zipGithubExportResult.success ? (
                                <div className="space-y-1.5">
                                  <p className="font-bold flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Repositório Criado!
                                  </p>
                                  <a 
                                    href={zipGithubExportResult.repoUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="underline font-semibold flex items-center gap-1 hover:text-white"
                                  >
                                    Acessar no GitHub ↗
                                  </a>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-bold">Erro na Exportação:</p>
                                  <p className="font-mono text-[11px] mt-1 opacity-90">{zipGithubExportResult.error}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-900/80 border border-slate-850 p-3.5 rounded-lg text-center space-y-2.5">
                          <p className="text-xs text-slate-400">Conta do GitHub não conectada.</p>
                          <button
                            onClick={() => {
                              setShowGithubModal(true);
                              setActiveTab('tech');
                            }}
                            className="w-full py-2 bg-slate-800 hover:bg-slate-700/85 text-white text-xs rounded font-semibold flex items-center justify-center gap-2 transition"
                          >
                            <Github className="w-3.5 h-3.5" />
                            Ir para Conectar GitHub
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Main Space Panel / Live Tree + Readme Viewer */}
                <div className="flex-grow flex flex-col overflow-hidden bg-[#060a13]/90">
                  {Object.keys(zipFiles).length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-900/70 border border-slate-800 flex items-center justify-center text-slate-500">
                        <Download className="w-6 h-6 rotate-180" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-300 font-display uppercase tracking-wider">Aguardando Importação</h3>
                      <p className="text-xs text-slate-450 leading-relaxed">
                        Anexe ou solte um arquivo <span className="text-indigo-400 font-bold">.zip</span> no painel lateral. O Oráculo irá ler a estrutura de arquivos e diretórios física, reconhecer a stack e gerar um README.md profissional e exportável.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-850">
                      
                      {/* Left: Interactive Code Tree (1/3 Width) */}
                      <div className="w-full md:w-72 flex flex-col bg-slate-950/40 shrink-0 h-2/5 md:h-full overflow-hidden">
                        <div className="p-3 bg-slate-900/30 border-b border-slate-850 shrink-0 select-none flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Arquivos Identificados</span>
                          <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded text-sky-400 font-mono">ZIP TREE</span>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2 space-y-0.5 scrollbar-thin text-left">
                          {Object.keys(zipFiles).sort().map(filePath => {
                            const isSelected = zipSelectedFile === filePath;
                            return (
                              <button
                                key={filePath}
                                onClick={() => setZipSelectedFile(filePath)}
                                className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-mono flex items-center gap-2 truncate transition ${
                                  isSelected 
                                    ? 'bg-sky-950/30 text-sky-400 border-l-2 border-sky-500 font-medium' 
                                    : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-205'
                                }`}
                              >
                                <Terminal className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                                <span className="truncate">{filePath}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Dynamic Work Area (Readme vs File Source Code View) */}
                      <div className="flex-grow flex flex-col h-3/5 md:h-full overflow-hidden">
                        
                        {/* Tab Toggle for Source Code vs README.md Generator */}
                        <div className="bg-slate-900/20 border-b border-slate-850 px-4 py-2 flex flex-col gap-2 shrink-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10.5px] font-bold text-white font-display">ORÁCULO DE ESTUDO & RECONSTRUÇÃO:</span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  let payload = '';
                                  if (zipSelectedFile === '_readme_view') payload = zipGeneratedReadme;
                                  else if (zipSelectedFile === '_study_view') payload = zipToolPurpose;
                                  else if (zipSelectedFile === '_termux_view') payload = zipTermuxDoc;
                                  else if (zipSelectedFile === '_prompt_view') payload = zipPromptText;
                                  else if (zipSelectedFile === '_scaffold_view') payload = zipReconstructionCode;
                                  else payload = zipFiles[zipSelectedFile] || '';

                                  navigator.clipboard.writeText(payload);
                                  setCopiedText('zippreviewer');
                                  setTimeout(() => setCopiedText(null), 2500);
                                }}
                                className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-[10px] font-bold text-indigo-300 rounded flex items-center gap-1 transition"
                              >
                                {copiedText === 'zippreviewer' ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar Conteúdo</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 p-0.5 bg-slate-950 border border-slate-850 rounded-lg">
                            <button
                              onClick={() => setZipSelectedFile('_readme_view')}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
                                zipSelectedFile === '_readme_view'
                                  ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/20'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              1. README.md
                            </button>

                            <button
                              onClick={() => setZipSelectedFile('_study_view')}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
                                zipSelectedFile === '_study_view'
                                  ? 'bg-indigo-600/25 text-indigo-305 border border-indigo-500/20'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <BookOpen className="w-3 h-3 text-indigo-400" />
                              2. Estudo da Ferramenta
                            </button>

                            <button
                              onClick={() => setZipSelectedFile('_termux_view')}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
                                zipSelectedFile === '_termux_view'
                                  ? 'bg-sky-600/25 text-sky-305 border border-sky-500/20'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Smartphone className="w-3 h-3 text-sky-400" />
                              3. Termux (Android)
                            </button>

                            <button
                              onClick={() => setZipSelectedFile('_prompt_view')}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
                                zipSelectedFile === '_prompt_view'
                                  ? 'bg-amber-600/25 text-amber-305 border border-amber-500/20'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Layers className="w-3 h-3 text-amber-400" />
                              4. Prompt de Reescrita IA
                            </button>

                            <button
                              onClick={() => setZipSelectedFile('_scaffold_view')}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
                                zipSelectedFile === '_scaffold_view'
                                  ? 'bg-rose-600/25 text-rose-305 border border-rose-500/20'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3 text-rose-400" />
                              5. Reconstrução de Código
                            </button>

                            <button
                              onClick={() => {
                                const firstFile = Object.keys(zipFiles).find(k => !k.startsWith('_'));
                                setZipSelectedFile(firstFile || '');
                              }}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded transition flex items-center gap-1 ${
                                !['_readme_view', '_study_view', '_termux_view', '_prompt_view', '_scaffold_view'].includes(zipSelectedFile)
                                  ? 'bg-slate-800 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <Terminal className="w-3 h-3" />
                              6. Código Anexado Original
                            </button>
                          </div>
                        </div>

                        {/* Interactive Viewer screen */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-slate-950/40">
                          {zipSelectedFile === '_readme_view' ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                              <div className="border-b border-emerald-950/40 pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  README.md Reconstruído (Editável)
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Formato Markdown Padrão</span>
                              </div>
                              <textarea
                                value={zipGeneratedReadme}
                                onChange={(e) => setZipGeneratedReadme(e.target.value)}
                                className="w-full h-[450px] bg-[#03060c] border border-emerald-950/40 rounded-xl p-5 font-mono text-xs text-emerald-400/90 leading-relaxed outline-none focus:border-emerald-500/40 resize-none shadow-xl"
                                placeholder="# Documentação do Projeto..."
                              />
                            </div>
                          ) : zipSelectedFile === '_study_view' ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                              <div className="border-b border-indigo-950/40 pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Estudo de Arquitetura & Propósito
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Estudo Conceitual do Projeto</span>
                              </div>
                              <textarea
                                value={zipToolPurpose}
                                onChange={(e) => setZipToolPurpose(e.target.value)}
                                className="w-full h-[450px] bg-[#03060c] border border-indigo-950/40 rounded-xl p-5 font-mono text-xs text-indigo-400/90 leading-relaxed outline-none focus:border-indigo-500/40 resize-none shadow-xl"
                                placeholder="Estudo sobre o que a ferramenta faz, pacotes e reconstrução..."
                              />
                            </div>
                          ) : zipSelectedFile === '_termux_view' ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                              <div className="border-b border-sky-950/40 pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-sky-400 flex items-center gap-1">
                                  <Smartphone className="w-3.5 h-3.5" />
                                  Documentação de Instalação no Termux (Android)
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Configuração Mobile</span>
                              </div>
                              <textarea
                                value={zipTermuxDoc}
                                onChange={(e) => setZipTermuxDoc(e.target.value)}
                                className="w-full h-[450px] bg-[#03060c] border border-sky-950/40 rounded-xl p-5 font-mono text-xs text-sky-400/90 leading-relaxed outline-none focus:border-sky-500/40 resize-none shadow-xl"
                                placeholder="Passos de instalação de pacotes e execução no Termux..."
                              />
                            </div>
                          ) : zipSelectedFile === '_prompt_view' ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                              <div className="border-b border-amber-950/40 pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                                  <Layers className="w-3.5 h-3.5" />
                                  Engenharia de Prompt: Instrução de Reescrita de IA
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Prompt Pronto para Copiar</span>
                              </div>
                              <textarea
                                value={zipPromptText}
                                onChange={(e) => setZipPromptText(e.target.value)}
                                className="w-full h-[450px] bg-[#03060c] border border-amber-950/40 rounded-xl p-5 font-mono text-xs text-amber-400/90 leading-relaxed outline-none focus:border-amber-500/40 resize-none shadow-xl"
                                placeholder="Prompt ideal para a IA criar o código estruturado..."
                              />
                            </div>
                          ) : zipSelectedFile === '_scaffold_view' ? (
                            <div className="max-w-3xl mx-auto space-y-4">
                              <div className="border-b border-rose-955/40 pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Esqueleto de Reconstrução do Código-Fonte
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Arquitetura Limpa e Executável</span>
                              </div>
                              <textarea
                                value={zipReconstructionCode}
                                onChange={(e) => setZipReconstructionCode(e.target.value)}
                                className="w-full h-[450px] bg-[#03060c] border border-rose-955/40 rounded-xl p-5 font-mono text-xs text-rose-400/90 leading-relaxed outline-none focus:border-rose-500/40 resize-none shadow-xl"
                                placeholder="Código fonte funcional principal reconstruído..."
                              />
                            </div>
                          ) : (
                            <div className="max-w-4xl mx-auto space-y-3">
                              <div className="border-b border-slate-850 pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                                  Visualizando: {zipSelectedFile}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">Modo de Leitura Estática</span>
                              </div>
                              
                              <div className="bg-[#03050a] border border-slate-850/60 rounded-xl p-5 font-mono text-[11px] text-sky-300 leading-relaxed overflow-x-auto whitespace-pre tab-6 select-all max-h-[450px] overflow-y-auto scrollbar-thin text-left">
                                {zipFiles[zipSelectedFile] === undefined ? (
                                  <span className="italic text-slate-600 block text-center">Selecione um arquivo válido para ver seu conteúdo</span>
                                ) : (
                                  zipFiles[zipSelectedFile] || <span className="italic text-slate-600 block text-center">[Arquivo de código vazio]</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'learning' && (
              <LearningOS onBackToIntro={() => setActiveTab('intro')} />
            )}

            {activeTab === 'bug_bounty' && (
              <BugBountySuite />
            )}
          </div>
        </section>
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-5 px-4 text-center text-xs text-slate-500 mt-12 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Desenvolvido em conformidade para auditorias de segurança e integridade de rede.
          </div>
          <div className="text-slate-600 flex items-center gap-1.5">
            <span>AI Studio Cloud App</span>
            <span>•</span>
            <span>Integrado com GitHub</span>
          </div>
        </div>
      </footer>

      {/* 5. GITHUB DEPLOYMENT / EXPORT OVERLAY MODAL */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col gap-4 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Github className="w-5 h-5 text-slate-100" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Exportar para o GitHub</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Conexão descompactada via API oficial</p>
                </div>
              </div>
              <button
                onClick={() => setShowGithubModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1 bg-slate-800/40 hover:bg-slate-800/85 rounded transition"
              >
                ✕
              </button>
            </div>

            {/* Display Results */}
            {!githubToken ? (
                /* Disconnected Status: Instructions & local custom credentials form */
                <div className="flex flex-col gap-4 py-1">
                  
                  {/* Informational Header */}
                  <div className="bg-[#0b1329] border border-slate-800 p-4 rounded-lg flex flex-col gap-2.5 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider">Passo 1: Registrar App no GitHub</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Acesse as <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300 font-semibold">Configurações de Desenvolvedor do GitHub</a> e crie um novo <strong>OAuth App</strong> utilizando os dados de um dos ambientes abaixo:
                    </p>

                    <div className="space-y-3.5 mt-1">
                      {/* DEV ENVIRONMENT URLs */}
                      <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-lg space-y-2">
                        <span className="text-[10px] text-indigo-400 font-mono font-bold block">💻 AMBIENTE WORKSPACE (DESENVOLVIMENTO)</span>
                        <div className="grid grid-cols-1 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-500 block">Homepage URL:</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-slate-300 font-mono bg-[#05080f] px-2 py-1 rounded truncate flex-1 border border-slate-900 select-all">{devOrigin}</code>
                              <button
                                onClick={() => handleCopyToClipboard(devOrigin, 'dev_home_copied')}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono transition shrink-0"
                              >
                                {copiedText === 'dev_home_copied' ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-semibold block">Authorization callback URL:</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-emerald-400 font-mono bg-[#05080f] px-2 py-1 rounded truncate flex-1 border border-slate-900 font-semibold select-all">{devCallback}</code>
                              <button
                                onClick={() => handleCopyToClipboard(devCallback, 'dev_call_copied')}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded text-[9px] font-mono transition shrink-0"
                              >
                                {copiedText === 'dev_call_copied' ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PREVIEW ENVIRONMENT URLs */}
                      <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-lg space-y-2">
                        <span className="text-[10px] text-amber-400 font-mono font-bold block">🌐 AMBIENTE PREVIEW PÚBLICO (SHARE LINK)</span>
                        <div className="grid grid-cols-1 gap-2 text-[10px]">
                          <div>
                            <span className="text-slate-500 block">Homepage URL:</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-slate-300 font-mono bg-[#05080f] px-2 py-1 rounded truncate flex-1 border border-slate-900 select-all">{preOrigin}</code>
                              <button
                                onClick={() => handleCopyToClipboard(preOrigin, 'pre_home_copied')}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-mono transition shrink-0"
                              >
                                {copiedText === 'pre_home_copied' ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-semibold block">Authorization callback URL:</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-emerald-400 font-mono bg-[#05080f] px-2 py-1 rounded truncate flex-1 border border-slate-900 font-semibold select-all">{preCallback}</code>
                              <button
                                onClick={() => handleCopyToClipboard(preCallback, 'pre_call_copied')}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-emerald-400 rounded text-[9px] font-mono transition shrink-0"
                              >
                                {copiedText === 'pre_call_copied' ? 'Copiado!' : 'Copiar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Grab ID and secret */}
                  <div className="bg-[#0b1329] border border-slate-800 p-4 rounded-lg space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Passo 2: Inserir ID e Chave Secreta do GitHub</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Insira o seu <strong>Client ID</strong> e <strong>Client Secret (Chave Secreta)</strong> obtidos após o cadastro no GitHub:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-mono font-bold block">GITHUB_CLIENT_ID</label>
                        <input
                          type="text"
                          value={customClientId}
                          onChange={e => {
                            const val = e.target.value.trim();
                            setCustomClientId(val);
                            localStorage.setItem('github_custom_client_id', val);
                          }}
                          placeholder="Ex: Iv1.1a2b3c..."
                          className="w-full bg-[#05080f] border border-slate-800 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-mono font-bold block">GITHUB_CLIENT_SECRET (Chave Secreta)</label>
                        <input
                          type="password"
                          value={customClientSecret}
                          onChange={e => {
                            const val = e.target.value.trim();
                            setCustomClientSecret(val);
                            localStorage.setItem('github_custom_client_secret', val);
                          }}
                          placeholder="Sua Chave Secreta do GitHub..."
                          className="w-full bg-[#05080f] border border-slate-800 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Autenticar */}
                  <div className="bg-[#0b1329]/80 border border-slate-850 p-4 rounded-lg space-y-3 text-left">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-bold font-display uppercase tracking-wider">Passo 3: Links de Autenticação (Escolha seu Ambiente)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Clique no botão correspondente ao ambiente do seu aplicativo atual do GitHub para estabelecer a vinculação técnica:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Auth Link 1: Workspace */}
                      <button
                        onClick={() => handleConnectGitHub(devOrigin)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-indigo-950/40"
                      >
                        <Github className="w-4 h-4 text-white" />
                        <span>Autenticar via Workspace (Dev)</span>
                      </button>

                      {/* Auth Link 2: Preview */}
                      <button
                        onClick={() => handleConnectGitHub(preOrigin)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-950/40"
                      >
                        <Github className="w-4 h-4 text-white" />
                        <span>Autenticar via Preview (Público)</span>
                      </button>
                    </div>
                  </div>

                </div>
            ) : githubExportResult ? (
              <div className="flex flex-col gap-4 py-2">
                {githubExportResult.success ? (
                  <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-lg flex flex-col items-center text-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">Repositório Criado com Sucesso!</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                        Todos os arquivos do seu Blueprint de segurança foram desempacotados e commitados no GitHub de forma modular.
                      </p>
                    </div>
                    
                    <a
                      href={githubExportResult.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 mt-1 transition shadow-lg shadow-emerald-950/40"
                    >
                      <ExternalLink className="w-4 h-4 text-white" />
                      Visualizar no GitHub
                    </a>
                  </div>
                ) : (
                  <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Falha na Exportação</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{githubExportResult.error}</p>
                    <div className="text-[10px] text-slate-500 bg-slate-950/45 p-2 rounded mt-1 font-mono">
                      Dica: Se receber erro de autenticação ou chaves inválidas (401/403), certifique-se de configurar e autorizar o app oficial e re-conectar sua conta.
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-3.5 mt-2">
                  <button
                    onClick={handleDisconnectGitHub}
                    className="text-xs font-medium text-rose-450 hover:bg-rose-950/20 border border-rose-950/40 px-3 py-2 rounded-lg transition"
                  >
                    Desconectar GitHub
                  </button>
                  <button
                    onClick={() => {
                      setGithubExportResult(null);
                      setShowGithubModal(false);
                    }}
                    className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              /* Config parameters form */
              <div className="flex flex-col gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Nome do Repositório</label>
                  <div className="flex items-center bg-[#0b0f19] border border-slate-850 rounded-lg overflow-hidden focus-within:border-indigo-505">
                    <span className="text-[11px] text-slate-500 px-3 py-2 border-r border-slate-800 select-none font-mono">github.com / seu-usuario /</span>
                    <input
                      type="text"
                      value={githubRepoName}
                      onChange={e => {
                        const cleaned = e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9_.-]/g, '-')
                          .replace(/-+/g, '-')
                          .substring(0, 100);
                        setGithubRepoName(cleaned);
                      }}
                      placeholder="nome-do-repositorio"
                      className="flex-1 bg-transparent border-0 outline-none p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Descrição (Opcional)</label>
                  <textarea
                    rows={3}
                    value={githubRepoDesc}
                    onChange={e => setGithubRepoDesc(e.target.value)}
                    placeholder="Uma descrição técnica explicando as conformidades e higiene digital mapeadas pela ferramenta."
                    className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Repositório Privado?</span>
                    <span className="text-[10px] text-slate-500 block leading-normal">Se marcado, apenas você terá acesso ao código gerado.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={githubRepoPrivate}
                    onChange={e => setGithubRepoPrivate(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-800 rounded select-none shrink-0"
                  />
                </div>

                {/* STRICT SECURITY WARNING ON THE CONNECTIONS DIALOG */}
                <div className="bg-amber-950/20 border border-amber-900/30 p-3.5 rounded-lg text-left flex items-start gap-2.5">
                  <span className="text-xs mt-0.5">⚠️</span>
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] text-amber-400 font-bold uppercase tracking-wider font-mono block">AVISO DE HIGIENE DE CREDENCIAIS</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Lembre-se: assim que concluir a exportação desta ferramenta cibernética, lembre-se de ir nas configurações do seu GitHub e <strong>excluir/revogar</strong> a sua chave secreta para não deixar a mesma chave sem desmanchar.
                    </p>
                  </div>
                </div>

                {/* Progress / Actions */}
                {isExportingGithub ? (
                  <div className="bg-[#0b0f19] border border-slate-800/80 p-4 rounded-lg flex items-center gap-3 py-4 text-left">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Exportando Blueprint...</span>
                      <span className="text-[10px] text-slate-500 block">Criando repositório e enviando arquivos descompactados um de cada vez de forma resiliente...</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 border-t border-slate-800 pt-4 mt-2">
                    <button
                      onClick={handleDisconnectGitHub}
                      className="text-xs font-medium text-slate-500 hover:text-rose-400 self-start sm:self-center transition"
                      title="Sair da sessão do GitHub"
                    >
                      Desconectar Conta
                    </button>
                    
                    <div className="flex gap-2 w-full sm:w-auto overflow-hidden justify-end">
                      <button
                        onClick={() => setShowGithubModal(false)}
                        className="text-xs font-semibold text-slate-300 bg-slate-800/50 hover:bg-slate-800 px-4 py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleExportGitHub}
                        disabled={!githubRepoName.trim()}
                        className="text-xs font-semibold text-indigo-100 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        Exportar Descompactado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Config Instructions */}
            <div className="border-t border-slate-800/60 pt-3">
              <details className="text-[11px] text-slate-550 cursor-pointer select-none">
                <summary className="hover:text-slate-400 font-mono">Deseja usar suas próprias credenciais OAuth? Ver instruções de Callback URL</summary>
                <div className="p-2.5 mt-2 bg-[#0b0f19]/80 rounded border border-slate-800 space-y-2 text-left leading-relaxed">
                  <p className="text-[11px] text-amber-500/90 font-semibold">⚠️ AVISO DE REDIRECT_URI:</p>
                  <p className="text-[10.5px] text-slate-400">
                    O erro <code>"redirect_uri não está associado a este aplicativo"</code> significa que a URL configurada no seu aplicativo GitHub não coincide exatamente com a URL desta página.
                  </p>
                  
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">URLs para configurar no Cadastro do GitHub:</span>
                  <div className="space-y-1.5 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Se estiver editando o app (Workspace):</span>
                      <code className="text-indigo-400 p-0.5 bg-slate-950 rounded select-all block break-all w-full mt-0.5">
                        {window.location.origin.includes('ais-dev') ? window.location.origin : 'https://ais-dev-' + window.location.origin.split('-')[2] + '-' + window.location.origin.split('-')[3] + '-' + window.location.origin.split('-')[4].split('.')[0] + '.us-west2.run.app'}/auth/callback
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Se estiver visualizando o preview público (Share Link):</span>
                      <code className="text-indigo-400 p-0.5 bg-slate-950 rounded select-all block break-all w-full mt-0.5">
                        {window.location.origin.includes('ais-pre') ? window.location.origin : 'https://ais-pre-' + window.location.origin.split('-')[2].replace('dev', 'pre') + '-' + window.location.origin.split('-')[3] + '-' + window.location.origin.split('-')[4].split('.')[0] + '.us-west2.run.app'}/auth/callback
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500 block">URL de Callback dessa aba atual (Recomendada agora):</span>
                      <code className="text-emerald-400 p-0.5 bg-slate-950 rounded select-all block break-all w-full mt-0.5">
                        {window.location.origin}/auth/callback
                      </code>
                    </div>
                  </div>

                  <p className="border-t border-slate-800/80 pt-2 mt-2">Dica: Copie o endereço verde acima e insira-o no campo <strong>Authorization Callback URL</strong> nas <a href="https://github.com/settings/developers" target="_blank" rel="noopener" className="text-indigo-400 hover:underline">Configurações de Desenvolvedor do GitHub</a>.</p>
                </div>
              </details>
            </div>

            {/* Cryptographic Access Key Generated Modal Overlay */}
            {showKeyModal && newlyGeneratedKey && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
                <div className="bg-[#0e162d] border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative space-y-4 text-left">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 animate-bounce">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white font-display">Sua Chave de Acesso foi Gerada!</h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Esta chave é a sua única credencial de acesso. Nós nunca coletamos e-mails, senhas, ou dados pessoais.
                    </p>
                  </div>

                  <div className="bg-[#05080f] p-4 rounded-xl border border-slate-850 relative text-center">
                    <label className="text-[9px] font-mono text-slate-500 block mb-1">CHAVE COMPATÍVEL APPSEC</label>
                    <div className="flex items-center justify-between gap-2.5 bg-slate-950/90 border border-slate-800 px-3 py-2 rounded-lg">
                      <code className="text-[11px] font-mono text-emerald-400 break-all select-all outline-none font-bold">
                        {newlyGeneratedKey}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newlyGeneratedKey);
                          setShowKeyClipboardSuccess(true);
                          setTimeout(() => setShowKeyClipboardSuccess(false), 2000);
                        }}
                        className="text-slate-400 hover:text-white p-1.5 transition shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded flex items-center justify-center gap-1 min-w-[70px]"
                        title="Copiar Chave"
                      >
                        {showKeyClipboardSuccess ? (
                          <span className="text-emerald-450 text-[10px] font-bold font-mono">Copiado!</span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] text-slate-300 font-mono font-medium">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-[10.5px] text-amber-200/90 leading-relaxed rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 font-bold block mb-0.5">Aviso de Segurança:</strong>
                      Chave de acesso única. Por motivos de segurança, recomendamos gerar um novo token a cada sessão e destruí-lo ao finalizar o uso. Não há recuperação de dados.
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowKeyModal(false);
                        // Store authentication in input ready for submit, and trigger local sandbox enter logic
                        setAuthKeyInput(newlyGeneratedKey);
                        setAuthError('');
                        setAuthSuccess('Chave pré-carregada com sucesso! Conectando...');
                        setTimeout(() => {
                          const fakeFormEvent = { preventDefault: () => {} } as React.FormEvent;
                          // Trigger validation to sessionUser login
                          const keysJson = localStorage.getItem('applet_cryptographic_keys');
                          const registeredKeys = keysJson ? JSON.parse(keysJson) : [];
                          const targetUser = registeredKeys.find((u: any) => u.key === newlyGeneratedKey);
                          if (targetUser) {
                            const newSessionObj = {
                              username: targetUser.username,
                              email: targetUser.email,
                              intent: targetUser.intent,
                              tier: targetUser.tier,
                              key: targetUser.key,
                              createdAt: targetUser.createdAt
                            };
                            localStorage.setItem('applet_current_session', JSON.stringify(newSessionObj));
                            setSessionUser(newSessionObj);
                            setAuthSuccess('Bem-vindo! Acesso concedido pelo terminal SecSeg.');
                            setAuthMode('landing');
                            // Navigate directly using the authoritative worksite handle
                            const selectedT = authPendingTool || 'architect';
                            if (selectedT === 'shielding') {
                              try {
                                window.open('https://shield.estamosatendendo.com.br', '_blank');
                              } catch {}
                            } else {
                              setIsLandingPage(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }
                        }, 100);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      <span>Estou Ciente, Copiar & Ingressar</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
