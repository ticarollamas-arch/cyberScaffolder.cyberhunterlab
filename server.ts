import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // API router
  app.post("/api/generate-blueprint", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "O campo 'prompt' é obrigatório e deve ser uma string." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "O servidor não possui GEMINI_API_KEY configurado. Adicione este segredo no painel do AI Studio."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `Você é um arquiteto e engenheiro de software sênior. 
A sua missão é gerar um Blueprint técnico completo, realista e polido de um novo projeto com base na solicitação do usuário.
O usuário quer gerar: "${prompt}".

Você DEVE retornar OBRIGATORIAMENTE um objeto JSON válido, sem comentários de código no JSON diretamente (mas comentários dentro dos códigos de arquivos nos blocos de string são bem-vindos).
O JSON gerado DEVE obedecer e preencher a seguinte estrutura:
{
  "blueprint": {
    "metadata": {
      "version": "1.0.0",
      "classification": "MENU 02 — GENERATED PROJECT",
      "projectType": "Tipo do projeto (ex: CLI, API, SPA, Fullstack)",
      "language": "pt-BR",
      "ethicalFramework": "Defensivo e Educacional",
      "complianceStandard": "OWASP / Clean Architecture"
    },
    "projectName": "Nome Humano e Profissional do Projeto",
    "objective": "Objetivo técnico e conciso do projeto",
    "description": "Uma descrição corporativa, elegante e envolvendo de como o sistema auxilia na higiene digital ou na organização de software.",
    "bannerAscii": "Coloque uma arte de texto ASCII estilosa contendo o nome do projeto para compor o cabeçalho do terminal.",
    "technologies": {
      "primaryLanguages": ["Linguagens principais do projeto"],
      "databases": ["Bancos de dados recomendados, se houver"],
      "libraries": {
        "standardLibrary": ["módulos nativos recomendados"],
        "thirdParty": [
          { "name": "nome_biblioteca", "version": "^1.0.0", "purpose": "Explicação do porquê está sendo usada" }
        ]
      }
    },
    "directoryTree": {
      // Exemplo de arquivos e diretórios recursivos. Faça o mapeamento correto.
      "main.py": { "type": "file", "description": "Arquivo de inicialização principal" },
      "config": {
        "type": "directory",
        "description": "Módulo de configurações",
        "children": {
          "settings.json": { "type": "file", "description": "Opções de ambiente" }
        }
      }
    },
    "database": { // Opcional, remova ou preencha se aplicável
      "type": "Banco desejado (ex: SQLite, PostgreSQL)",
      "engine": "Engine",
      "filePath": "caminho/do/db",
      "tables": {
        "nome_tabela": {
          "description": "Para que serve esta tabela",
          "columns": [
            { "name": "id", "type": "INTEGER", "constraints": "PRIMARY KEY AUTOINCREMENT", "description": "ID" }
          ]
        }
      }
    },
    "security": { // Opcional
      "classification": "DEFENSIVO",
      "approach": "Práticas de higiene digital",
      "controlledVulnerabilities": ["Vulnerabilidades mapeadas"],
      "securityHeaders": {
        "X-Frame-Options": { "description": "Proteção anti-clickjacking", "values": ["SAMEORIGIN"], "required": true, "criticality": "ALTA" }
      },
      "complianceStandards": ["Normas cumpridas"],
      "mitigations": [
        { "threat": "Injeção de Scripts", "mitigation": "Uso de sanitização robusta" }
      ]
    },
    "cli": { // Opcional
      "toolName": "Comando de inicialização",
      "commandUsage": "Como rodar",
      "description": "Finalidade de comandos CLI",
      "args": [
        { "name": "--help", "shortcut": "-h", "type": "flag", "required": false, "default": false, "description": "Exibe ajuda", "example": "--help" }
      ]
    },
    "filesContent": {
      // Um dicionário plano (chave: caminho relativo do arquivo correspondente aos arquivos informados no directoryTree, ex: "main.py" ou "config/settings.json")
      // Valor: O código-fonte real, completo, limpo, executável e comentado em português. Não use mockups ou placeholders simplórios tipo '// write your code here'. Desenvolva uma aplicação CLI funcional ou script completo!
    }
  }
}

Importante:
- Garanta que todos os arquivos definidos na directoryTree (exceto pastas ou arquivos auto-gerados como banco de dados) tenham um código fonte relevante associado dentro de 'filesContent'!
- Mantenha os códigos de 'filesContent' curtos, robustos, inteligentes e eficientes para evitar truncamento no limite de tokens do modelo.
- Você DEVE escrever códigos funcionais e realistas.
- Retorne APENAS o JSON válido.`;

      let response = null;
      let lastError = null;
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-3.1-pro-preview",
        "gemini-flash-latest",
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro"
      ];

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Blueprint Server] Solicitando geração de blueprint para: "${prompt}" usando ${modelName}`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: `Gere o JSON Blueprint completo em português do Brasil contendo a estrutura real dos arquivos para o projeto de acordo com o prompt do usuário: ${prompt}`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });
          if (response && response.text) {
            console.log(`[Blueprint Server] Sucesso usando o modelo ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`[Blueprint Server] Falha ao chamar o modelo ${modelName}:`, err.message || err);
          lastError = err;
        }
      }

      if (!response || !response.text) {
         throw new Error(`Incapaz de obter uma resposta válida dos modelos Gemini disponíveis. (Último erro: ${lastError?.message || String(lastError)})`);
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Sem resposta recebida do modelo Gemini.");
      }

      console.log(`[Blueprint Server] Recebeu ${responseText.length} caracteres de resposta.`);

      let cleanedText = responseText.trim();
      
      // Extract content inside triple backticks if present
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
      const match = cleanedText.match(jsonBlockRegex);
      if (match) {
        cleanedText = match[1].trim();
      } else {
        // Safe string cleaners for stray edge ticks
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "");
          cleanedText = cleanedText.replace(/\s*```$/, "");
        }
      }

      cleanedText = cleanedText.trim();

      try {
        const parsed = JSON.parse(cleanedText);
        return res.json(parsed);
      } catch (parseError: any) {
        console.error("[Blueprint Server] Erro ao analisar o JSON gerado pelo Gemini.", parseError);
        console.error("[Blueprint Server] Entrada recebida:", responseText);
        throw new Error(`Inconsistência de formatação no JSON do Blueprint retornado pelo modelo: ${parseError.message}`);
      }
    } catch (error: any) {
      console.error("Erro na geração do blueprint:", error);
      res.status(500).json({
        error: "Falha ao gerar o blueprint através do Gemini AI.",
        details: error?.message || String(error)
      });
    }
  });

  // --- GITHUB INTEGRATION API ROUTES ---

  // 1. Get OAuth authorization URL
  app.get("/api/auth/github/url", (req, res) => {
    const clientId = (req.query.clientId as string) || process.env.GITHUB_CLIENT_ID;
    const clientSecret = (req.query.clientSecret as string) || process.env.GITHUB_CLIENT_SECRET;

    if (!clientId) {
      return res.status(550).json({
        error: "GITHUB_CLIENT_ID não configurado no servidor. Configure esse segredo nas configurações do AI Studio ou use o formulário avançado de configuração do cliente."
      });
    }

    // Determine secure redirect URI
    const clientRedirectUri = (req.query.redirectUri as string) || 
      (process.env.APP_URL ? `${process.env.APP_URL}/auth/callback` : `${req.protocol}://${req.get("host")}/auth/callback`);

    // Pack security keys and exact expected redirectUrl safely in 'state' parameter to avoid hardcoded domain mismatches (such as ais-dev vs ais-pre)
    const stateObj = {
      clientId,
      clientSecret,
      redirectUri: clientRedirectUri
    };
    const stateStr = Buffer.from(JSON.stringify(stateObj)).toString("base64");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: clientRedirectUri,
      scope: "public_repo repo",
      state: stateStr
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // 2. OAuth Callback
  app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
    try {
      const { code, state } = req.query;
      if (!code) {
        throw new Error("Código de autorização ausente na URL de callback do GitHub.");
      }

      console.log("[GitHub OAuth] Trocando código recebido por Token...");
      let clientId = process.env.GITHUB_CLIENT_ID;
      let clientSecret = process.env.GITHUB_CLIENT_SECRET;
      let redirectUri = process.env.APP_URL ? `${process.env.APP_URL}/auth/callback` : `${req.protocol}://${req.get("host")}/auth/callback`;

      if (state && typeof state === "string") {
        try {
          const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
          if (decoded.clientId) clientId = decoded.clientId;
          if (decoded.clientSecret) clientSecret = decoded.clientSecret;
          if (decoded.redirectUri) redirectUri = decoded.redirectUri;
        } catch (e) {
          console.warn("[GitHub OAuth Webflow] Falha ao decodificar parâmetro 'state' do OAuth, usando fallback nativo.");
        }
      }

      if (!clientId || !clientSecret) {
        throw new Error("Credenciais GITHUB_CLIENT_ID ou GITHUB_CLIENT_SECRET não configuradas no servidor ou no formulário do cliente.");
      }

      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Falha na resposta do GitHub: ${errorText}`);
      }

      const tokenData: any = await tokenResponse.json();
      if (tokenData.error) {
        throw new Error(`Erro do GitHub: ${tokenData.error_description || tokenData.error}`);
      }

      const accessToken = tokenData.access_token;
      console.log("[GitHub OAuth] Autenticação realizada com sucesso.");

      // Post message to parent window and close popup (avoiding cookie/iframe cross-origin limits)
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Autenticado</title>
            <style>
              body { font-family: -apple-system, sans-serif; text-align: center; padding: 40px; background-color: #0f172a; color: #f8fafc; margin: 0; }
              .card { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: inline-block; max-width: 400px; text-align: center; }
              h2 { color: #34d399; margin-top: 0; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
              .btn { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; cursor: pointer; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Conexão Estabelecida!</h2>
              <p>O seu GitHub foi conectado com sucesso ao Blueprint Generator. Esta janela se fechará automaticamente para recarregar o app principal.</p>
              <button class="btn" onclick="window.close()">Fechar Janela</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: "OAUTH_AUTH_SUCCESS", 
                  accessToken: ${JSON.stringify(accessToken)}
                }, "*");
                setTimeout(function() { window.close(); }, 1500);
              } else {
                window.location.href = "/";
              }
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("[GitHub OAuth Error] Falha de login:", error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Erro de Autenticação</title>
            <style>
              body { font-family: -apple-system, sans-serif; text-align: center; padding: 40px; background-color: #0f172a; color: #f8fafc; margin: 0; }
              .card { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #e11d48; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); display: inline-block; max-width: 450px; text-align: left; }
              h2 { color: #f43f5e; margin-top: 0; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
              code { background: #0f172a; color: #fda4af; padding: 8px 12px; border-radius: 4px; font-family: monospace; display: block; overflow-x: auto; margin: 15px 0; border: 1px solid #f43f5e33; }
              .btn { background: #334155; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Erro na Conexão</h2>
              <p>Não foi possível completar a autenticação com o GitHub:</p>
              <code>${error?.message || String(error)}</code>
              <button class="btn" onclick="window.close()">Fechar Janela</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  // 3. Export project content to a newly created GitHub repository
  app.post("/api/github/export", async (req, res) => {
    try {
      const { accessToken, repoName, description, isPrivate, blueprint } = req.body;

      if (!accessToken) {
        return res.status(400).json({ error: "Token de acesso do GitHub inválido ou ausente." });
      }
      if (!repoName) {
        return res.status(400).json({ error: "O nome do repositório é obrigatório." });
      }
      if (!blueprint) {
        return res.status(400).json({ error: "Os dados do blueprint são necessários para exportação." });
      }

      const { projectName, objective, bannerAscii, technologies, filesContent } = blueprint;

      // 3.1 Get authenticated user identity
      console.log("[GitHub Export] Solicitando informações do proprietário do token...");
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `token ${accessToken}`,
          "User-Agent": "aistudio-build-app",
          "Accept": "application/vnd.github.v3+json"
        }
      });

      if (!userRes.ok) {
        const errText = await userRes.text();
        return res.status(userRes.status).json({
          error: "Não foi possível validar seu login no GitHub. Talvez o token tenha expirado.",
          details: errText
        });
      }

      const userData: any = await userRes.json();
      const owner = userData.login;
      console.log(`[GitHub Export] Identificado usuário: ${owner}`);

      // 3.2 Create the repository (POST /user/repos)
      console.log(`[GitHub Export] Criando repositório ${owner}/${repoName}...`);
      const createRepoRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          "Authorization": `token ${accessToken}`,
          "User-Agent": "aistudio-build-app",
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: repoName,
          description: description || objective || `Blueprint gerado de software: ${projectName}`,
          private: !!isPrivate,
          auto_init: false
        })
      });

      if (!createRepoRes.ok) {
        const errData = await createRepoRes.json().catch(() => ({}));
        return res.status(createRepoRes.status).json({
          error: errData.message || "Erro de validação ou conflito ao criar o repositório.",
          details: JSON.stringify(errData.errors || errData)
        });
      }

      const repoData: any = await createRepoRes.json();
      const repoUrl = repoData.html_url;
      console.log(`[GitHub Export] Repositório criado com sucesso em: ${repoUrl}`);

      // 3.3 Construct dynamic README.md for the new repository
      const filesToUpload: { [path: string]: string } = { ...filesContent };
      
      let readme = "";
      if (bannerAscii) {
        readme += `\`\`\`\n${bannerAscii}\n\`\`\`\n\n`;
      }
      readme += `# ${projectName || repoName}\n\n`;
      if (objective) {
        readme += `> **Objetivo:** ${objective}\n\n`;
      }
      if (description) {
        readme += `## Sobre o Projeto\n${description}\n\n`;
      }

      if (technologies) {
        readme += `## 🛠️ Tecnologias e Módulos\n\n`;
        if (technologies.primaryLanguages && technologies.primaryLanguages.length > 0) {
          readme += `- **Linguagens principais:** ${technologies.primaryLanguages.join(", ")}\n`;
        }
        if (technologies.databases && technologies.databases.length > 0) {
          readme += `- **Banco de dados recomendado:** ${technologies.databases.join(", ")}\n`;
        }
        if (technologies.libraries) {
          if (technologies.libraries.standardLibrary && technologies.libraries.standardLibrary.length > 0) {
            readme += `- **Módulos nativos recomendados:** ${technologies.libraries.standardLibrary.join(", ")}\n`;
          }
          if (technologies.libraries.thirdParty && technologies.libraries.thirdParty.length > 0) {
            readme += `- **Dependências Externas:**\n`;
            for (const lib of technologies.libraries.thirdParty) {
              readme += `  - \`${lib.name}\` (${lib.version || "especificada"}): ${lib.purpose || ""}\n`;
            }
          }
        }
        readme += `\n`;
      }

      if (blueprint.security) {
        readme += `## 🔒 Configurações de Segurança & Higiene Digital\n\n`;
        if (blueprint.security.classification) {
          readme += `- **Abordagem defensiva:** \`${blueprint.security.classification}\`\n`;
        }
        if (blueprint.security.approach) {
          readme += `- **Práticas de higiene digital:** ${blueprint.security.approach}\n`;
        }
        if (blueprint.security.mitigations && blueprint.security.mitigations.length > 0) {
          readme += `### Medidas de Mitigação Implementadas:\n`;
          for (const mit of blueprint.security.mitigations) {
            readme += `- **Risco / Ameaça:** ${mit.threat} → **Plano de Mitigação:** ${mit.mitigation}\n`;
          }
        }
        readme += `\n`;
      }

      if (blueprint.cli) {
        readme += `## 💻 Interface de Linha de Comando (CLI)\n\n`;
        if (blueprint.cli.toolName) {
          readme += `- **Pre-requisito / Comando:** \`${blueprint.cli.toolName}\`\n`;
        }
        if (blueprint.cli.commandUsage) {
          readme += `- **Instruções de Inicialização:** \`${blueprint.cli.commandUsage}\`\n`;
        }
        if (blueprint.cli.args && blueprint.cli.args.length > 0) {
          readme += `### Argumentos & Flags Configurados:\n`;
          for (const arg of blueprint.cli.args) {
            readme += `- \`${arg.shortcut ? `${arg.shortcut}, ` : ""}${arg.name}\` (${arg.type}): ${arg.description} (Exemplo: \`${arg.example || ""}\`)\n`;
          }
        }
        readme += `\n`;
      }

      readme += `## 📂 Estrutura de Arquivos Criada\n\nEste repositório foi construído de forma limpa e descompactada contendo os seguintes módulos funcionais:\n\n`;
      for (const filePath of Object.keys(filesContent)) {
        readme += `- \`${filePath}\`\n`;
      }

      readme += `\n---\n*Blueprint gerado com orgulho através do Senior Software Architecture Hub no AI Studio.*`;
      
      filesToUpload["README.md"] = readme;

      // 3.4 Sequentially upload files using GitHub contents PUT API
      const uploads = [];
      for (const [filePath, fileContent] of Object.entries(filesToUpload)) {
        try {
          const stringVal = typeof fileContent === "string" ? fileContent : JSON.stringify(fileContent, null, 2);
          const base64Bytes = Buffer.from(stringVal, "utf-8").toString("base64");

          console.log(`[GitHub Export] Enviando arquivo ${filePath}...`);
          const filePutRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
            method: "PUT",
            headers: {
              "Authorization": `token ${accessToken}`,
              "User-Agent": "aistudio-build-app",
              "Accept": "application/vnd.github.v3+json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: `Commit inicial do Blueprint: ${filePath}`,
              content: base64Bytes
            })
          });

          if (!filePutRes.ok) {
            const errJson = await filePutRes.json().catch(() => ({}));
            uploads.push({ path: filePath, status: "failed", error: errJson.message || "Falha HTTP" });
          } else {
            uploads.push({ path: filePath, status: "success" });
          }
        } catch (fileErr: any) {
          console.error(`[GitHub Export] Falha ao codificar/enviar ${filePath}:`, fileErr);
          uploads.push({ path: filePath, status: "failed", error: fileErr.message || String(fileErr) });
        }
      }

      return res.json({
        success: true,
        repoUrl,
        repoName,
        owner,
        uploadedFiles: uploads
      });

    } catch (error: any) {
      console.error("[GitHub Export API Error] Falha de exportação:", error);
      res.status(500).json({
        error: "Erro inesperado ao exportar arquivos para o GitHub.",
        details: error?.message || String(error)
      });
    }
  });

  // Serve static UI assets or use Vite development server

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Blueprint Server] Running on http://localhost:${PORT}`);
    console.log(`[Blueprint Server] Mode: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
