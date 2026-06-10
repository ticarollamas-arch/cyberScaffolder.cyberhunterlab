import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        "gemini-flash-latest",
        "gemini-3.1-flash-lite"
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
