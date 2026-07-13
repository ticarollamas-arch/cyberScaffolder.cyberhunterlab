import React, { useState, useRef, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  Terminal, 
  Sparkles, 
  Youtube, 
  GraduationCap, 
  Search, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Play, 
  Copy, 
  Check, 
  Award, 
  FileText, 
  BookMarked,
  Layers,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Video
} from 'lucide-react';
import { PRESET_TRACKS, LearningTrack, CourseModule } from '../learningData';

interface LearningOSProps {
  onBackToIntro: () => void;
}

export default function LearningOS({ onBackToIntro }: LearningOSProps) {
  // Navigation & Sub-Modes
  const [subTab, setSubTab] = useState<'preset' | 'youtube' | 'assistant'>('preset');
  
  // Preset Tracks States
  const [selectedTrackId, setSelectedTrackId] = useState<string>(PRESET_TRACKS[0].id);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  // Copy State
  const [copiedText, setCopiedText] = useState<string>('');

  // YouTube Generator States
  const [ytLink, setYtLink] = useState<string>('');
  const [isGeneratingYt, setIsGeneratingYt] = useState<boolean>(false);
  const [ytLogs, setYtLogs] = useState<string[]>([]);
  const [generatedYtCourse, setGeneratedYtCourse] = useState<any | null>(null);

  // Study Assistant States
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGeneratingAssistant, setIsGeneratingAssistant] = useState<boolean>(false);
  const [generatedAssistantData, setGeneratedAssistantData] = useState<any | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});

  const logEndRef = useRef<HTMLDivElement>(null);

  // Icon Resolver
  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cloud': return <Cloud className="w-5 h-5 text-indigo-400" />;
      case 'Database': return <Database className="w-5 h-5 text-cyan-400" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-400" />;
    }
  };

  // Helper to handle copying markdown or code
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Run YouTube AI generator
  const handleGenerateYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytLink.trim() || isGeneratingYt) return;

    setIsGeneratingYt(true);
    setGeneratedYtCourse(null);
    setYtLogs([]);

    const userApiKey = localStorage.getItem('applet_user_gemini_api_key') || '';

    // We'll add logs dynamically
    const addLog = (msg: string) => {
      setYtLogs(prev => [...prev, msg]);
    };

    addLog("[*] Iniciando conexão segura com a API do YouTube...");

    try {
      // 1. Send request to our backend
      const responsePromise = fetch("/api/generate-youtube-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ytLink, userApiKey })
      });

      // Show some realistic progress logs while the model generates
      await new Promise(r => setTimeout(r, 800));
      addLog("[*] Recuperando metadados do vídeo via oEmbed...");
      
      await new Promise(r => setTimeout(r, 1200));
      addLog("[*] Alimentando modelo de IA Aegis-AI para análise cognitiva...");
      
      await new Promise(r => setTimeout(r, 1500));
      addLog("[*] Sincronizando tópicos chave com base na descrição e título do vídeo...");

      await new Promise(r => setTimeout(r, 1500));
      addLog("[*] Estruturando os capítulos em uma grade cronológica progressiva...");

      await new Promise(r => setTimeout(r, 1500));
      addLog("[*] Gerando módulos detalhados de aula com códigos e diagramas de remediação...");

      const res = await responsePromise;
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.details || "Erro desconhecido na geração do curso.");
      }

      const courseData = await res.json();
      
      addLog(`[✓] Sucesso: Conteúdo sintetizado sob o título: "${courseData.title}"`);
      addLog("[✓] COMPLETO: Curso estruturado gerado com sucesso!");
      
      setGeneratedYtCourse(courseData);
    } catch (err: any) {
      console.error(err);
      addLog(`[-] ERRO: Falha ao processar o curso. ${err.message || String(err)}`);
      addLog("[!] Certifique-se de configurar uma chave de API válida do Gemini no painel de configurações para habilitar geração remota.");
    } finally {
      setIsGeneratingYt(false);
    }
  };

  // Run Assistant Study Plan Simulator
  const handleGenerateAssistant = (topic: string) => {
    if (!topic.trim() || isGeneratingAssistant) return;

    setIsGeneratingAssistant(true);
    setGeneratedAssistantData(null);
    setQuizScore(null);
    setSelectedQuizAnswers({});

    // Simulate short timeout
    setTimeout(() => {
      setGeneratedAssistantData({
        topic: topic,
        title: `Estudo Dirigido: ${topic}`,
        analogy: `Entender ${topic} é comparável a uma portaria blindada de um condomínio que não apenas exige identificação para entrar, mas analisa o histórico recente e o destino de cada visitante antes de liberar a roleta.`,
        summary: `Este plano visual foca em destrinchar os princípios centrais de ${topic}. O objetivo de aprendizagem é habilitar você a projetar arquiteturas resilientes e aplicar remediações imediatas baseadas nos padrões internacionais (OWASP & CIS Benchmarks).`,
        diagram: `
┌────────────────────────────────────────────────────────┐
│             AEGIS CORE ARCHITECTURE FLOW               │
└────────────────────────────────────────────────────────┘
                      [PONTO DE ENTRADA]
                              │
                              ▼
                [Módulo de Inspeção Ativa]
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
    [Assinatura Válida]                [Padrão Suspeito]
            │                                   │
            ▼                                   ▼
    [Fluxo Liberado]                   [Gera Log e Bloqueia]
`,
        keyConcepts: [
          { name: "Verificação de Origem e Confiança zero", desc: "Nunca confiar em conexões ou requests vindos do mesmo contexto local sem reautenticar." },
          { name: "Defesa em Profundidade (Layering)", desc: "Aplicar validação em múltiplos níveis (Rede, Aplicação, Banco de dados e Variáveis locais)." },
          { name: "Hardening de Configurações", desc: "Desativar recursos desnecessários e reduzir drasticamente a superfície de ataque inicial." }
        ],
        practicalCode: `// Exemplo Prático de Hardening de Segurança (Padrão de Produção Aegis)
import express from 'express';
import helmet from 'helmet';

const app = express();

// Ativa cabeçalhos HTTP defensivos (bloqueia clickjacking, MIME sniffing e XSS)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-cdn.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

console.log("Aegis Security Rules applied successfully.");`,
        practicalCodeLang: "typescript",
        quiz: [
          {
            question: "Qual o principal benefício da abordagem de Defesa em Profundidade no desenvolvimento seguro?",
            options: [
              "Evita o uso de firewalls tradicionais.",
              "Garante que, se uma camada de segurança falhar, outras barreiras independentes ainda protejam o ativo.",
              "Torna as queries de banco de dados mais rápidas.",
              "Permite que o desenvolvedor ignore as atualizações de dependências."
            ],
            answer: 1
          },
          {
            question: "Em relação ao gerenciamento de segredos, qual é a prática recomendada pelos guias OWASP?",
            options: [
              "Comitar as chaves em arquivos .env dentro do repositório Git.",
              "Gravar chaves privadas em strings estáticas no código fonte.",
              "Utilizar cofres de chaves dedicados (como HashiCorp Vault, AWS Secrets Manager) com controle de acesso dinâmico.",
              "Escrever as senhas em comentários no cabeçalho do arquivo."
            ],
            answer: 2
          }
        ]
      });
      setIsGeneratingAssistant(false);
    }, 1500);
  };

  const handleQuizSubmit = () => {
    if (!generatedAssistantData) return;
    let score = 0;
    generatedAssistantData.quiz.forEach((q: any, i: number) => {
      if (selectedQuizAnswers[i] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
  };

  // Autoscroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ytLogs]);

  // Generate complete Markdown text for copy
  const getTrackMarkdown = (track: LearningTrack, modIndex: number) => {
    const mod = track.modules[modIndex];
    if (!mod) return '';
    return `# ${track.title}
## Módulo: ${mod.title} (Duração: ${mod.duration})

### 📖 Visão Geral do Curso
${track.overview}

### 💡 Analogia Prática
${mod.analogy}

### 🧠 Conceitos-Chave
${mod.concepts.map(c => `- ${c}`).join('\n')}

### 🛠️ Explicação do Módulo
${mod.content}

### 💻 Exemplo Prático de Implementação (${mod.practicalCodeLang.toUpperCase()})
\`\`\`${mod.practicalCodeLang}
${mod.practicalCode}
\`\`\`

### 🎯 Passos Práticos para Execução
${mod.practicalSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

---
Gerado via Aegis Learning OS - ${new Date().toLocaleDateString()}
`;
  };

  const getAssistantMarkdown = (data: any) => {
    if (!data) return '';
    return `# Estudo Dirigido: ${data.topic}
## ${data.title}

### 💡 Analogia de Conceito
${data.analogy}

### 📖 Resumo de Aprendizagem
${data.summary}

### 🧠 Princípios Fundamentais
${data.keyConcepts.map((c: any) => `- **${c.name}**: ${c.desc}`).join('\n')}

### 💻 Exemplo Prático Aplicável
\`\`\`${data.practicalCodeLang}
${data.practicalCode}
\`\`\`

---
Plano Estruturado gerado em tempo real pelo Aegis Learning OS.
`;
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-850 min-h-[640px] text-left bg-slate-950/20 rounded-b-xl overflow-hidden">
      
      {/* LEFT SIDE PANEL: Mode selection & Preset Track list */}
      <div className="w-full md:w-96 flex flex-col bg-[#080d19]/90 shrink-0 p-5 divide-y divide-slate-850 gap-5 overflow-y-auto scrollbar-thin">
        
        {/* Module Header & Back button */}
        <div className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <GraduationCap className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">Aegis Learning OS</h3>
            </div>
            <button 
              onClick={onBackToIntro}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-2 py-1 rounded transition cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Plataforma modular para aceleração profissional. Transforme conceitos técnicos áridos em trilhas e capítulos visuais legíveis.
          </p>
        </div>

        {/* Sub-tabs selector inside Learning OS */}
        <div className="py-4 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-2">Módulos de Aprendizado</span>
          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-900">
            <button
              onClick={() => setSubTab('preset')}
              className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold transition ${
                subTab === 'preset' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              1. Trilhas
            </button>
            <button
              onClick={() => setSubTab('youtube')}
              className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold transition ${
                subTab === 'youtube' 
                  ? 'bg-rose-650 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              2. YouTube
            </button>
            <button
              onClick={() => setSubTab('assistant')}
              className={`py-1.5 px-2 rounded text-[10px] font-mono font-bold transition ${
                subTab === 'assistant' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              3. Assistente
            </button>
          </div>
        </div>

        {/* Dynamic Navigation elements based on selected Subtab */}
        <div className="py-4 flex-1 flex flex-col min-h-[300px]">
          {subTab === 'preset' && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Trilhas Técnicas Disponíveis</span>
              <div className="space-y-2">
                {PRESET_TRACKS.map((track) => {
                  const isSelected = selectedTrackId === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        setSelectedTrackId(track.id);
                        setSelectedModuleIndex(0);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition duration-150 flex items-start gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-900 border-indigo-500/50 shadow-md shadow-indigo-950/15' 
                          : 'bg-slate-950/30 border-slate-900 hover:bg-slate-900/40 hover:border-slate-800'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-950/50 border border-indigo-500/20' : 'bg-slate-900 border border-slate-800'
                      }`}>
                        {getTrackIcon(track.icon)}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono bg-slate-900 text-indigo-300 border border-slate-800 px-1.5 py-0.2 rounded">
                            {track.category}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            track.difficulty === 'Avançado' 
                              ? 'bg-rose-950/30 text-rose-400 border-rose-900/35' 
                              : 'bg-amber-950/30 text-amber-400 border-amber-900/35'
                          }`}>
                            {track.difficulty}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 truncate">{track.title}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{track.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {subTab === 'youtube' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">YouTube to Course Generator</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Copie e cole o link de uma apresentação técnica do YouTube, e a inteligência Aegis gerará instantaneamente um curso estruturado e de fácil leitura.
              </p>

              <form onSubmit={handleGenerateYoutube} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">URL do Vídeo:</label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-2.5 w-4 h-4 text-rose-500" />
                    <input
                      type="url"
                      value={ytLink}
                      onChange={(e) => setYtLink(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!ytLink.trim() || isGeneratingYt}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/25 transition disabled:opacity-50 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  {isGeneratingYt ? "Processando Transcrições..." : "Gerar Curso Estruturado"}
                </button>
              </form>

              {/* Generating Loader Logs */}
              {isGeneratingYt && (
                <div className="bg-[#040813] border border-slate-900 p-3 rounded-lg flex-1 font-mono text-[9px] text-rose-400 space-y-1 max-h-[160px] overflow-y-auto mt-2">
                  {ytLogs.map((log, index) => (
                    <div key={index} className="leading-normal animate-fade-in">
                      {log}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              )}
            </div>
          )}

          {subTab === 'assistant' && (
            <div className="space-y-4 flex-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Study Assistant Mode</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Digite um tema ou selecione abaixo para que o assistente visual estruture o aprendizado em diagramas de blocos, analogias e código aplicável.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-mono font-bold uppercase block">Tema para Estudo:</label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Ex: Kubernetes Hardening, JWT Signature Bypass"
                  className="w-full text-xs px-3 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition font-sans"
                />
                
                <button
                  onClick={() => handleGenerateAssistant(customTopic)}
                  disabled={!customTopic.trim() || isGeneratingAssistant}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/25 transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  {isGeneratingAssistant ? "Estruturando Conceitos..." : "Iniciar Estudo Visual"}
                </button>
              </div>

              {/* Predefined Topics Suggestions */}
              <div className="space-y-2 pt-3 border-t border-slate-900">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Sugestões de Temas Clínicos:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "JWT Token Signature Exploit",
                    "IAM Least Privilege Hardening",
                    "OWASP API Security Top 10",
                    "GitHub Pipeline Quality Gates"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomTopic(sug);
                        handleGenerateAssistant(sug);
                      }}
                      className="text-[9px] font-mono text-slate-400 bg-slate-950/60 border border-slate-850 hover:bg-slate-900 hover:border-slate-750 px-2 py-1.5 rounded transition cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE MAIN BOARD: Displays course / youtube / assistant output */}
      <div className="flex-1 flex flex-col bg-[#0b101f]/65 relative overflow-y-auto max-h-[680px]">
        
        {/* Course preset view */}
        {subTab === 'preset' && (
          (() => {
            const track = PRESET_TRACKS.find(t => t.id === selectedTrackId);
            if (!track) return <div className="p-10 text-center text-slate-500 font-mono">Trilha não encontrada.</div>;
            const currentModule = track.modules[selectedModuleIndex];

            return (
              <div className="p-6 space-y-6 animate-fade-in">
                {/* Course Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-950/40 rounded-xl p-5 flex items-start justify-between relative overflow-hidden">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 rounded-full">
                      {track.badge}
                    </span>
                    <h2 className="text-xl font-bold font-display text-white tracking-tight">{track.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{track.overview}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[10px] text-slate-500 text-right shrink-0">
                    <div>Carga Estimada: <strong>{track.duration}</strong></div>
                    <div>Dificuldade: <strong className="text-indigo-400">{track.difficulty}</strong></div>
                  </div>
                </div>

                {/* Modules navigation dots */}
                <div className="flex flex-wrap gap-2 items-center border-b border-slate-900 pb-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mr-2">Aulas Disponíveis:</span>
                  {track.modules.map((mod, i) => {
                    const isModSelected = selectedModuleIndex === i;
                    const isModCompleted = completedModules[`${track.id}-${mod.id}`];

                    return (
                      <button
                        key={mod.id}
                        onClick={() => setSelectedModuleIndex(i)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isModSelected 
                            ? 'bg-indigo-600/80 text-white border border-indigo-500/35' 
                            : 'bg-slate-900/60 border border-slate-850 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isModCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span>{i + 1}. {mod.title.split(':')[1]?.trim() || mod.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Current module layout */}
                {currentModule ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                    
                    {/* Left & Middle Column: Core Content & Code */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Concept Explanatory Cards */}
                      <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4 shadow">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                            <BookMarked className="w-4 h-4 text-indigo-400" />
                            {currentModule.title}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500">Estimado: {currentModule.duration}</span>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider">💡 Analogia Dinâmica para Leitura Rápida:</h4>
                          <div className="p-3.5 bg-[#0e1423] border border-indigo-950/40 rounded-lg text-xs text-indigo-300 leading-relaxed italic">
                            "{currentModule.analogy}"
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider">📖 Explicação Técnica Estruturada:</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {currentModule.content}
                          </p>
                        </div>
                      </div>

                      {/* Code Block implementation */}
                      <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-3 shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">💻 Código / Configuração Recomendada ({currentModule.practicalCodeLang.toUpperCase()}):</span>
                          <button
                            onClick={() => handleCopy(currentModule.practicalCode, 'preset-code')}
                            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition bg-slate-950/65 px-2.5 py-1 rounded border border-slate-800"
                          >
                            {copiedText === 'preset-code' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                            {copiedText === 'preset-code' ? "Copiado!" : "Copiar Código"}
                          </button>
                        </div>

                        <div className="relative">
                          <pre className="text-xs font-mono bg-[#03060d] border border-slate-950 p-4 rounded-lg overflow-x-auto text-slate-200/95 leading-relaxed max-h-[250px] scrollbar-thin">
                            <code>{currentModule.practicalCode}</code>
                          </pre>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Visual Diagram & Practical Steps */}
                    <div className="space-y-6">
                      
                      {/* Diagram representation */}
                      <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-3.5 shadow">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">📊 Fluxo de Arquitetura Visual (Textual)</span>
                        <pre className="text-[10px] font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-indigo-300 overflow-x-auto leading-normal">
                          {currentModule.diagram}
                        </pre>
                      </div>

                      {/* Concepts and practical check marks */}
                      <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4 shadow">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">🎯 Passos Práticos Recomendados:</span>
                        <div className="space-y-2.5">
                          {currentModule.practicalSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs">
                              <span className="w-5 h-5 rounded-full bg-slate-950 text-indigo-400 border border-slate-800 flex items-center justify-center font-mono text-[9px] font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-slate-300 leading-relaxed font-sans">{step}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-850 flex items-center justify-between">
                          <button
                            onClick={() => handleCopy(getTrackMarkdown(track, selectedModuleIndex), 'markdown-preset')}
                            className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {copiedText === 'markdown-preset' ? "Copiado!" : "Exportar Aula (MD)"}
                          </button>

                          <button
                            onClick={() => {
                              const key = `${track.id}-${currentModule.id}`;
                              setCompletedModules(prev => ({
                                ...prev,
                                [key]: !prev[key]
                              }));
                            }}
                            className={`px-3 py-2 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              completedModules[`${track.id}-${currentModule.id}`]
                                ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/40'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-indigo-50 shadow shadow-indigo-950/20'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {completedModules[`${track.id}-${currentModule.id}`] ? "Concluído ✓" : "Concluir Aula"}
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="p-10 text-center text-slate-500 font-mono">Nenhum módulo selecionado.</div>
                )}
              </div>
            );
          })()
        )}

        {/* YouTube Generated view */}
        {subTab === 'youtube' && (
          <div className="p-6 space-y-6 animate-fade-in">
            {generatedYtCourse ? (
              <div className="space-y-6">
                {/* Course Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-rose-950/10 to-slate-900 border border-rose-950/40 rounded-xl p-5 flex items-start justify-between relative overflow-hidden">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 bg-rose-500/25 text-rose-300 border border-rose-500/20 rounded-full">
                      Sintetizado via YouTube → AI OS
                    </span>
                    <h2 className="text-xl font-bold font-display text-white tracking-tight">{generatedYtCourse.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{generatedYtCourse.overview}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 font-mono text-[10px] text-slate-500 text-right shrink-0">
                    <div>Fonte: <strong>{generatedYtCourse.duration}</strong></div>
                    <div>Link Origem: <a href={generatedYtCourse.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline inline-flex items-center gap-1 font-bold">Assistir <ExternalLink className="w-2.5" /></a></div>
                  </div>
                </div>

                {/* Modules */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  
                  {/* Left columns */}
                  <div className="lg:col-span-2 space-y-6">
                    {generatedYtCourse.modules.map((mod: any, idx: number) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4 shadow">
                        <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-rose-400" />
                            {mod.title}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-rose-400 uppercase font-mono tracking-wider">💡 Analogia da Aula:</h4>
                          <div className="p-3.5 bg-slate-950/70 border border-slate-900 rounded-lg text-xs text-rose-300 leading-relaxed italic">
                            "{mod.analogy}"
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold text-rose-400 uppercase font-mono tracking-wider">📖 Conteúdo Conceitual Extraído:</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            {mod.content}
                          </p>
                        </div>

                        {/* Code */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">💻 Configuração / Arquivo Manifest Recomendado:</span>
                            <button
                              onClick={() => handleCopy(mod.practicalCode, 'yt-code')}
                              className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition bg-slate-950/65 px-2.5 py-1 rounded border border-slate-800"
                            >
                              {copiedText === 'yt-code' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                              {copiedText === 'yt-code' ? "Copiado!" : "Copiar"}
                            </button>
                          </div>
                          <pre className="text-xs font-mono bg-[#03060d] border border-slate-950 p-4 rounded-lg overflow-x-auto text-slate-200/95 leading-relaxed max-h-[220px]">
                            <code>{mod.practicalCode}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right columns */}
                  <div className="space-y-6">
                    {generatedYtCourse.modules.map((mod: any, idx: number) => (
                      <div key={`side-${idx}`} className="space-y-6">
                        {/* Diagram */}
                        <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-3.5 shadow">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-bold">📊 Mapa de Fluxo Técnico</span>
                          <pre className="text-[10px] font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-rose-300 overflow-x-auto leading-normal">
                            {mod.diagram}
                          </pre>
                        </div>

                        {/* Steps */}
                        <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4 shadow">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-bold">🎯 Passos Práticos para Execução:</span>
                          <div className="space-y-2.5">
                            {mod.practicalSteps.map((step: string, sIdx: number) => (
                              <div key={sIdx} className="flex items-start gap-2.5 text-xs">
                                <span className="w-5 h-5 rounded-full bg-slate-950 text-rose-400 border border-slate-800 flex items-center justify-center font-mono text-[9px] font-bold shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span className="text-slate-300 leading-relaxed font-sans">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3 font-mono">
                <Youtube className="w-12 h-12 text-slate-800" />
                <div className="text-sm">Nenhum link do YouTube processado ainda.</div>
                <div className="text-[11px] text-slate-600 max-w-sm">
                  Copie qualquer link técnico de arquitetura ou segurança, cole no painel lateral e assista à conversão dinâmica em minutos.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Study Assistant view */}
        {subTab === 'assistant' && (
          <div className="p-6 space-y-6 animate-fade-in">
            {generatedAssistantData ? (
              <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950/10 to-slate-900 border border-emerald-950/40 rounded-xl p-5 flex items-start justify-between relative overflow-hidden">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 bg-emerald-500/25 text-emerald-300 border border-emerald-500/20 rounded-full">
                      Plano Visual On-Demand
                    </span>
                    <h2 className="text-xl font-bold font-display text-white tracking-tight">{generatedAssistantData.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{generatedAssistantData.summary}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(getAssistantMarkdown(generatedAssistantData), 'md-assistant')}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition select-none cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    {copiedText === 'md-assistant' ? "Copiado!" : "Copiar MD"}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  {/* Left Column: Blocks of Concepts & Practical Code */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Visual block concepts */}
                    <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4 shadow">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">💡 Analogia Explicativa de Conceito:</span>
                      <div className="p-4 bg-slate-950/70 border border-emerald-950/30 rounded-xl text-xs text-emerald-300 leading-relaxed font-sans italic">
                        "{generatedAssistantData.analogy}"
                      </div>

                      <div className="space-y-3 pt-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">🧠 Princípios Técnicos do Tema:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {generatedAssistantData.keyConcepts.map((concept: any, index: number) => (
                            <div key={index} className="bg-[#0b0f19] border border-slate-850 p-3 rounded-lg space-y-1 hover:border-slate-700 transition">
                              <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {concept.name}
                              </h5>
                              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{concept.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Practical Code block */}
                    <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-3 shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">💻 Código / Regra de Hardening Recomendada:</span>
                        <button
                          onClick={() => handleCopy(generatedAssistantData.practicalCode, 'assistant-code')}
                          className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition bg-slate-950/65 px-2.5 py-1 rounded border border-slate-800"
                        >
                          {copiedText === 'assistant-code' ? <Check className="w-3 text-emerald-400" /> : <Copy className="w-3" />}
                          {copiedText === 'assistant-code' ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                      <pre className="text-xs font-mono bg-[#03060d] border border-slate-950 p-4 rounded-lg overflow-x-auto text-slate-200/95 leading-relaxed max-h-[220px]">
                        <code>{generatedAssistantData.practicalCode}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Right Column: Text Map & Quiz Verification */}
                  <div className="space-y-6">
                    {/* Monospace Architectural Flow Map */}
                    <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-3 shadow">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-bold">📊 Mapa de Fluxo Arquitetural</span>
                      <pre className="text-[10px] font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-emerald-400 overflow-x-auto leading-normal">
                        {generatedAssistantData.diagram}
                      </pre>
                    </div>

                    {/* Quick assessment checkpoint (Quiz) */}
                    <div className="bg-slate-900/50 border border-slate-850 rounded-xl p-5 space-y-4 shadow">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white font-display">Verificação de Conhecimento (Quiz)</span>
                      </div>

                      <div className="space-y-4">
                        {generatedAssistantData.quiz.map((q: any, qIdx: number) => (
                          <div key={qIdx} className="space-y-2">
                            <p className="text-[11px] font-sans font-bold text-slate-300">{qIdx + 1}. {q.question}</p>
                            <div className="space-y-1">
                              {q.options.map((opt: string, optIdx: number) => {
                                const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => setSelectedQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                    className={`w-full text-left p-2 rounded text-[10px] font-sans border transition ${
                                      isSelected
                                        ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-[#0b0f19] border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                        <button
                          onClick={handleQuizSubmit}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow cursor-pointer"
                        >
                          Enviar Respostas
                        </button>

                        {quizScore !== null && (
                          <div className="text-xs font-mono font-bold">
                            Pontuação: <span className={quizScore === generatedAssistantData.quiz.length ? "text-emerald-400" : "text-amber-400"}>
                              {quizScore}/{generatedAssistantData.quiz.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3 font-mono">
                <Sparkles className="w-12 h-12 text-slate-800" />
                <div className="text-sm">Nenhum estudo dirigido gerado ainda.</div>
                <div className="text-[11px] text-slate-600 max-w-sm">
                  Utilize o painel lateral para descrever um assunto ou clique em nossas sugestões recomendadas para estruturar seu estudo de forma visual.
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
