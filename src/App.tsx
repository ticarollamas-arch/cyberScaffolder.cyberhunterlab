import { useState, useEffect, useRef } from 'react';
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
  Github
} from 'lucide-react';
import JSZip from 'jszip';

import { ProjectBlueprint } from './types';
import { 
  pythonCliAuditorBlueprint, 
  nodejsApiGatewayBlueprint, 
  emptyCustomBlueprintTemplate 
} from './templates';
import { flattenDirectoryTree, sanitizeBlueprintFiles, FlatFileNode } from './utils';
import { getTerminalSimulation, TerminalLine } from './terminalMocks';

export default function App() {
  // Preset Blueprints
  const presets: Record<string, typeof pythonCliAuditorBlueprint> = {
    auditor: pythonCliAuditorBlueprint,
    gateway: nodejsApiGatewayBlueprint,
    custom: emptyCustomBlueprintTemplate
  };

  // State Management
  const [activePreset, setActivePreset] = useState<string>('auditor');
  const [blueprint, setBlueprint] = useState<ProjectBlueprint>(pythonCliAuditorBlueprint.blueprint);
  const [inputJson, setInputJson] = useState<string>(JSON.stringify(pythonCliAuditorBlueprint, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  
  // Custom Workspace States
  const [activeTab, setActiveTab] = useState<'code' | 'database' | 'security' | 'terminal' | 'tech'>('code');
  const [activeFile, setActiveFile] = useState<string>('auditor_integridade.py');
  const [filesContent, setFilesContent] = useState<Record<string, string>>({});
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  
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
  const [targetUrl, setTargetUrl] = useState<string>('site-publico-auditar.gov.br');
  const terminalLogsEndRef = useRef<HTMLDivElement | null>(null);

  // Copy Feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // GitHub Integration States
  const [githubToken, setGithubToken] = useState<string | null>(() => localStorage.getItem('github_token'));
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [githubRepoName, setGithubRepoName] = useState<string>('');
  const [githubRepoDesc, setGithubRepoDesc] = useState<string>('');
  const [githubRepoPrivate, setGithubRepoPrivate] = useState<boolean>(false);
  const [isExportingGithub, setIsExportingGithub] = useState<boolean>(false);
  const [githubExportResult, setGithubExportResult] = useState<{ success: boolean; repoUrl?: string; error?: string } | null>(null);

  // Dynamic local storage for custom client credentials
  const [customClientId, setCustomClientId] = useState<string>(() => localStorage.getItem('github_custom_client_id') || '');
  const [customClientSecret, setCustomClientSecret] = useState<string>(() => localStorage.getItem('github_custom_client_secret') || '');

  // Sync Repo Name when blueprint changes
  useEffect(() => {
    if (blueprint && blueprint.projectName) {
      const normalized = blueprint.projectName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_.-]+/g, '-');
      setGithubRepoName(normalized);
      setGithubRepoDesc(blueprint.objective || blueprint.description || `Blueprint do projeto ${blueprint.projectName}`);
    }
  }, [blueprint]);

  // OAuth Popup Handler
  const handleConnectGitHub = async () => {
    try {
      // Build callback URI
      const callbackUri = `${window.location.origin}/auth/callback`;
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
          blueprint
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || resData.details || 'Falha ao realizar a exportação para o GitHub.');
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
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiStep('Acionando o arquiteto inteligente...');
    
    try {
      setAiStep('Consultando Gemini-3.5-Flash para projetar a infraestrutura...');
      const response = await fetch('/api/generate-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TOP BRAND HEADER */}
      <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20">
              <Layers className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
                  Executor & Visualizador de Projetos
                </span>
                <span className="bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-mono px-1.5 py-0.2 rounded text-indigo-300">
                  v1.2.0
                </span>
              </div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight -mt-0.5">
                Blueprint Project Engine
              </h1>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs text-slate-400 mr-2 uppercase font-mono tracking-wider hidden lg:block">Presets de fábrica:</span>
            <div className="flex gap-1.5 bg-slate-900/80 p-1 border border-slate-800 rounded-lg">
              <button
                id="preset-auditor-btn"
                onClick={() => setActivePreset('auditor')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activePreset === 'auditor' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛡️ Auditor CLI (Python)
              </button>
              <button
                id="preset-gateway-btn"
                onClick={() => setActivePreset('gateway')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activePreset === 'gateway' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🕸️ API Proxy Gateway
              </button>
              <button
                id="preset-custom-btn"
                onClick={() => setActivePreset('custom')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activePreset === 'custom' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚙️ Estrutura Vazia
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CORE WORKSPACE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT DECK (COLUMNS 1 TO 4): INPUT JSON & AI POWER */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          
          {/* AI Generator Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl pointer-events-none rounded-full" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-display font-semibold text-white">Geração Inteligente via IA</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Descreva um software qualquer (ex: "Sistema de biblioteca em Python" ou "Gerenciador financeiro em Node") e veja a IA criar toda a estrutura física de arquivos, códigos reais e esquemas de banco automaticamente.
            </p>
            <div className="flex gap-2">
              <input
                id="prompt-ia-input"
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Exemplo: Sistema de Inventário em Python..."
                disabled={isGenerating}
                onKeyDown={e => e.key === 'Enter' && handleGenerateWithAi()}
                className="flex-1 text-xs bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                id="generate-ia-btn"
                onClick={handleGenerateWithAi}
                disabled={isGenerating || !aiPrompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-indigo-100 px-4 py-2 text-xs font-semibold rounded-lg shadow disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-100" />
                )}
                Gerar com IA
              </button>
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 bg-slate-955/65 border border-indigo-500/20 p-2.5 rounded-lg">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[11px] font-mono text-indigo-300">{aiStep}</span>
              </div>
            )}
          </div>

          {/* Paste Real JSON Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4.5 h-4.5 text-indigo-400" />
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
          <div className="bg-[#131b2e] border-b border-slate-800 px-5 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <div className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded inline-block mb-1 shadow-sm uppercase">
                {blueprint.metadata?.classification || "MENU 02 — BLUEPRINT ACTOR"}
              </div>
              <h2 className="text-md font-display font-bold text-white tracking-tight">
                {blueprint.projectName || "Projeto Ativo"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {blueprint.metadata?.projectType || "Tipo desconhecido"} • Versão {blueprint.metadata?.version || "1.0.0"}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                id="github-export-modal-btn"
                onClick={() => {
                  setGithubExportResult(null);
                  setShowGithubModal(true);
                }}
                className="bg-[#24292e] hover:bg-[#2f363d] text-white px-4 py-2 font-semibold rounded-lg text-xs flex items-center gap-2 transition duration-150 border border-[#444c56] shadow-md active:scale-95 shrink-0"
              >
                <Github className="w-4 h-4 text-slate-200" />
                <span>{githubToken ? "Exportar para o GitHub" : "Conectar GitHub"}</span>
              </button>

              <button
                id="zip-download-btn"
                onClick={handleDownloadZip}
                className="bg-emerald-600 hover:bg-emerald-500 text-emerald-50 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition"
              >
                <Download className="w-4 h-4 text-emerald-50" />
                Baixar Projeto Completo (.ZIP)
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 bg-slate-900/50 flex overflow-x-auto whitespace-nowrap scrollbar-none">
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
          </div>

          {/* 3. TAB WORKSPACES CONTENT */}
          <div className="flex-1 flex flex-col bg-[#0d1326]/35 rounded-b-xl overflow-hidden">
            
            {/* TAB 1: FILE EXPLORER + INLINE SOURCE CODE EDITOR */}
            {activeTab === 'code' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                
                {/* EXPLORER COLUMN (3 cols) */}
                <div className="md:col-span-4 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-bold">Navegador de Pastas</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 font-mono">
                      {Object.keys(filesContent).length} {Object.keys(filesContent).length === 1 ? 'arquivo' : 'arquivos'}
                    </span>
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
                      <div className="text-slate-655 italic">
                        Clique em "Executar Simulação" acima para testar e validar o comportamento operacional da ferramenta em lote.
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

                  <div className="border-t border-slate-950/70 pt-2.5 mt-4 flex items-center justify-between text-[11px] text-slate-600">
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
              <div className="flex-1 p-5 space-y-6">
                
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
              <div className="flex-1 p-5 space-y-6">
                
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
              <div className="flex-1 p-5 space-y-6">
                
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
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider">Apenas mais um passo</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed text-left">
                    Conecte a sua conta do GitHub para que possamos empacotar cada arquivo do blueprint de segurança de forma descompactada técnica no seu perfil.
                  </p>
                  
                  <button
                    onClick={handleConnectGitHub}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mt-1.5 transition active:scale-95 shadow-lg shadow-indigo-950/40"
                  >
                    <Github className="w-4 h-4 text-white" />
                    Autorizar e Conectar Conta GitHub
                  </button>
                </div>
                
                {/* Advanced Local Config inputs */}
                <div className="bg-slate-950/45 border border-slate-850 p-4 rounded-lg space-y-3">
                  <span className="text-[10px] text-slate-350 font-semibold uppercase tracking-wider block">Credenciais OAuth Locais (Opcional)</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Se você preferir usar as suas próprias credenciais do GitHub sem precisar cadastrar variáveis de ambiente no painel do AI Studio, basta inseri-las abaixo:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-450 font-mono block">GITHUB_CLIENT_ID</label>
                      <input
                        type="text"
                        value={customClientId}
                        onChange={e => {
                          const val = e.target.value.trim();
                          setCustomClientId(val);
                          localStorage.setItem('github_custom_client_id', val);
                        }}
                        placeholder="Ex: Iv1.1a2b3c..."
                        className="w-full bg-[#0b0f19] border border-slate-800 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-450 font-mono block">GITHUB_CLIENT_SECRET</label>
                      <input
                        type="password"
                        value={customClientSecret}
                        onChange={e => {
                          const val = e.target.value.trim();
                          setCustomClientSecret(val);
                          localStorage.setItem('github_custom_client_secret', val);
                        }}
                        placeholder="Ex: 8f9a2b..."
                        className="w-full bg-[#0b0f19] border border-slate-800 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
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
                      <AlertTriangle className="w-4.5 h-4.5" />
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
                      onChange={e => setGithubRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '-'))}
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

          </div>
        </div>
      )}
    </div>
  );
}
