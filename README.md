# 👑 LLM ToolForge: Automação de Infraestrutura, Código Resiliente e DevSecOps via IA

O **LLM ToolForge** é uma plataforma de governança corporativa, orquestração técnica e engenharia cognitiva projetada para automatizar com segurança a geração de arquiteturas de nuvem resilientes, códigos limpos e pipelines de infraestrutura programável (IaC) em conformidade técnica rigorosa. 

O sistema resolve um dos principais gargalos de empresas modernas: o atrito entre o design arquitetural inicial e a conformidade de segurança real (Day-0 Compliance). Através de uma biblioteca de mais de **17.000 prompts combinatórios refinados (Agentes Hermes e Segurança Defensiva)**, geradores robustos de blueprints estruturados (Terraform) e uma suíte ativa de mitigação para Bug Hunting, o LLM ToolForge transforma diretrizes abstratas em repositórios funcionais, seguros e auditados em poucos segundos.

---

## ⚡ Links Rápidos de Acesso e Demonstração

Para facilitar a avaliação da infraestrutura, arquitetura e execução em tempo real, utilize os seguintes canais:

*   **🌐 [Demonstração ao Vivo (Production Preview)](https://ais-pre-fcbcsiyoz4sr5bkssovy5v-13767980963.us-west2.run.app)**: Instância de produção ativa executando o portal corporativo e o orquestrador do LLM ToolForge.
*   **⚡ [Remixar e Clonar no Google AI Studio](https://ai.studio/build/44411c09-6c1a-41d6-b9ac-a5a578b38601)**: Clone este espaço de trabalho completo com um clique para executar auditorias de código-fonte em tempo real ou customizar seu próprio gerador.

---

## 🎯 Soluções de Problemas Corporativos (O "Porquê" da Ferramenta)

A plataforma foi concebida sob os pilares de resiliência e segurança do **AWS Well-Architected Framework**, focando em sanar problemas reais enfrentados por times de SRE, DevOps e Segurança de Aplicações:

1.  **Gargalo de Provisionamento Seguro (IaC Drift & Bad Configs)**: 
    *   *Problema*: Desenvolvedores criam infraestruturas do Terraform manualmente ou utilizando inteligência artificial sem validação de regras de segurança básicas, resultando em buckets públicos de armazenamento e grupos de segurança abertos (`0.0.0.0/0`).
    *   *Solução do ToolForge*: Integração nativa de regras estritas do **Open Policy Agent (OPA)** baseadas em políticas Rego que barram deploys fora de conformidade na esteira de CI/CD automaticamente.
2.  **Alucinações e Injeção de Prompt (Prompt Injection & Leaks)**:
    *   *Problema*: Agentes de IA genéricos desviam de contexto, alucinam comandos inexistentes de CLI e vazam instruções internas do sistema (System Prompts).
    *   *Solução do ToolForge*: Implementação de **Sandbox Cognitivo** que envelopa todas as chamadas de API de LLM com metaprompts de blindagem estrita e mitigação contra injeção reversa de comandos.
3.  **Auditoria Ágil e Relatórios de Vulnerabilidades (Bug Bounty Integration)**:
    *   *Problema*: Quando uma vulnerabilidade média, alta ou crítica é encontrada (como um vazamento de credenciais em IaC ou falhas de controle de acesso), times de engenharia levam dias para triar, testar o exploit não invasivo de forma segura e abrir o relatório padronizado (ticket).
    *   *Solução do ToolForge*: O **Bug Bounty Core** fornece geradores de testes de conceito estéreis e modelos markdown de relatórios prontos em conformidade com as exigências do **Google VRP (Bughunter)**, **Bugcrowd** e **HackerOne**.

---

## 🧱 Arquitetura de Referência Cloud-Native (AWS Target)

Abaixo está o design de arquitetura lógica idealizada para a execução resiliente do LLM ToolForge em ambiente AWS de alta disponibilidade:

```
                                      [ REQUISIÇÃO DO CLIENTE / API ]
                                                     │
                                                     ▼
                                        [ AWS WAF (Web App Firewall) ]
                                                     │
                                                     ▼
                                     [ Amazon Route 53 (Global DNS) ]
                                                     │
                                                     ▼
                                        [ Amazon API Gateway (v2) ]
                                                     │
                                                     ▼
                                   [ AWS Lambda (Orquestrador Serverless) ]
                                                     │
                  ┌──────────────────────────────────┴──────────────────────────────────┐
                  │ (Verificação de Assinatura)                                         │ (Geração / Execução)
                  ▼                                                                     ▼
    [ Amazon DynamoDB / Redis ]                                           [ LLM Cognitive Engine (Gemini) ]
     (Idempotência & Cache)                                                             │
                  │                                                                     ▼
                  ▼                                                          [ Circuit Breaker Control ]
         [ SQS DLQ Queue ]                                                              │
         (Eventos Falhos)                                                               ▼
                  │                                                           [ Winston SRE Logging ]
                  │                                                                     │
                  ▼                                                                     ▼
       [ AWS SNS / Webhooks ]                                                  [ Amazon CloudWatch ]
      (Notificação de Deploy)                                                  (Métricas e Alertas)
```

### Detalhamento da Topologia de Solução (Amazon Web Services)

*   **Camada de Entrada (Ingress & Security)**: Toda requisição passa pelo **AWS WAF** para bloquear ataques de OWASP Top 10 tradicionais, sendo roteada pelo **Route 53** para o **Amazon API Gateway**, que controla os limites de chamadas (Rate Limiting) e valida chaves de acesso corporativas.
*   **Camada de Computação Serverless**: Executado em **AWS Lambda** ou contêineres **Amazon ECS via Fargate** (conforme provisionado no Terraform de exemplo da ferramenta), garantindo escala elástica instantânea para lidar com requisições em massa e isolamento completo por transação.
*   **Idempotência & Transações de Estado**: O backend usa o **Amazon DynamoDB** como banco de dados transacional rápido para controlar o estado da esteira de código gerada. Toda chamada de webhook possui checagem de assinatura simétrica de idempotência para evitar ataques de repetição (Replay Attacks).
*   **Circuit Breaker Resiliente**: Se a comunicação com as APIs de inteligência apresentar alta latência (timeout > 5000ms) ou erros de limite de quota (HTTP 429), um middleware inteligente de **Circuit Breaker** entra em estado *Open*, redirecionando as chamadas para instâncias locais em cache de forma transparente para manter a disponibilidade em 99.99%.
*   **Log de Observabilidade SRE**: Integrado via Winston logs, canalizando saídas estruturadas em JSON diretamente para o **Amazon CloudWatch** e **AWS X-Ray** para rastreamento de transações de ponta a ponta.

---

## 🛠️ Stack Tecnológica de Alta Performance

*   **Linguagem & Runtime**: Node.js v18+, TypeScript Estrito (garantindo ausência de erros em tempo de compilação).
*   **Frontend SPA**: React 18, integrado a transições fluidas e feedback tátil de componentes via **Motion** (`motion/react`) e estilização ágil de alta performance baseada em **Tailwind CSS v4**.
*   **Backend & APIs**: Express com tratamento global de exceções, middlewares de proteção de cabeçalho (Helmet) e validadores de payloads integrados.
*   **Icons**: Lucide React para renderização limpa e de alta resolução de todos os elementos visuais.
*   **Build System**: `esbuild` otimizado para bundling do backend em formato CommonJS (`.cjs`), resolvendo todas as dependências locais em tempo de compilação para inicialização acelerada e mitigação de *cold-starts* de container.

---

## ⚡ Funcionalidades e Modulos do LLM ToolForge

O ecossistema divide-se em 4 módulos principais que conversam diretamente entre si:

### 1. Motor IaC Blueprint (Terraform)
Geração automática de arquiteturas seguras prontas para produção:
*   **GCP Module**: Scripts contendo provisionamento de Cloud Run seguro, IAM Roles granulares com menor privilégio, chaves KMS (CMEK) com rotação automática e integração do Security Command Center (SCC) via tópicos de notificação Pub/Sub.
*   **AWS Module**: Provisionamento de trilhas seguras do CloudTrail com validação de log ativa, buckets S3 bloqueados contra acesso público, detecção automática de ameaças baseada em comportamento com o GuardDuty e criptografia ponta a ponta com KMS.

### 2. DevSecOps Scan Integrado (Validação OPA)
*   Integração nativa de políticas estáticas escritas em linguagem declarativa **Rego**.
*   Evita o deployment de infraestruturas inseguras rejeitando chaves vazadas de Service Accounts ou políticas de buckets públicas (`aws_s3_policy.rego` e `gcp_iam_policy.rego`).
*   Pipeline de GitHub Actions configurado para executar auditoria prévia de vulnerabilidades na esteira de CI/CD automaticamente.

### 3. Biblioteca Hermes de Agentes (17.000+ Prompts)
*   Sistemas integrados de geração combinatória de prompts cognitivos de engenharia.
*   Organizados em painéis táticos altamente especializados para testes estruturados em plataformas globais de conformidade cibernética.

### 4. Bug Bounty Suite & Manual de Comandos
*   Manual interativo contendo comandos práticos de auditoria estéril de vulnerabilidades (SQL Injection, Cross-Site Scripting, Broken Access Control, JWT Tokens, etc).
*   Mecanismo de abertura de relatórios automatizados de severidades Médio, Alto e Crítico.
*   Templates de relatórios corporativos completos prontos para submissão no GitHub, Google VRP, Bugcrowd e HackerOne.

---

## 🚀 Como Configurar, Executar e Testar Localmente

### Pré-requisitos
*   **Node.js**: v18.0.0 ou superior instalado.
*   **NPM**: Gerenciador de pacotes padrão.

### 1. Instalar as Dependências
No diretório raiz do projeto, instale os pacotes definidos no manifesto de produção:
```bash
npm install
```

### 2. Executar o Servidor de Desenvolvimento
Inicie o motor local integrado com o painel de visualização estática e o microsserviço Express:
```bash
npm run dev
```
O servidor estará disponível localmente em: `http://localhost:3000`

### 3. Compilar para Produção (Bundle Otimizado)
O script de build utiliza compilação dupla otimizada para nuvem corporativa:
```bash
npm run build
```
Esse comando compila os ativos estáticos do frontend e utiliza o `esbuild` para unificar o backend no arquivo otimizado `dist/server.cjs` com resolução nativa livre de problemas de caminhos relativos em Node.js.

### 4. Iniciar Instância de Produção
Para rodar a ferramenta em produção local ou em contêineres Docker, execute:
```bash
npm start
```

---



Este projeto foi desenhado sob medida para demonstrar as principais competências exigidas de um **Solutions Architect (SA) na Amazon Web Services**:

*   **Segurança em Primeiro Lugar (Security Pillar)**: Demonstração prática do uso do princípio de menor privilégio no IAM, criptografia ponta a ponta baseada em chaves gerenciadas de clientes (AWS KMS / GCP KMS) e auditoria nativa IaC estática (Rego/OPA).
*   **Excelência Operacional & Observabilidade (Operational Excellence)**: Geração centralizada de logs estruturados (Winston) padronizados em formato JSON para fácil indexação e análise SRE no Amazon CloudWatch.
*   **Confiabilidade & Resiliência (Reliability Pillar)**: Arquitetura lógica protegida de falhas em cascata de serviços de terceiros através de Circuit Breaker desacoplados, filas de tratamento de erros (Dead Letter Queues) e arquiteturas desacopladas baseadas em tópicos.
*   **Eficiência de Desempenho (Performance Efficiency)**: Seleção criteriosa de tecnologias rápidas (Node.js/TypeScript compilado de forma limpa, Express modular, React SPA fluido) que garantem carregamento ágil na ponta e baixo tempo de resposta em ambientes sem estado (Serverless).
