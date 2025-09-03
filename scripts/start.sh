
#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🎯 =====================================${NC}"
echo -e "${PURPLE}🚀     SaberAngola Startup Script     ${NC}"
echo -e "${PURPLE}🎯 =====================================${NC}"

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Função para matar processos na porta
kill_port_processes() {
    local port=$1
    echo -e "${YELLOW}🔄 Liberando porta $port...${NC}"
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Limpar processos existentes
echo -e "${YELLOW}🧹 Limpando processos existentes...${NC}"
pkill -f "tsx|vite|node" 2>/dev/null || true
sleep 3

# Verificar e limpar portas
for port in 3001 5000; do
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Porta $port em uso, liberando...${NC}"
        kill_port_processes $port
    else
        echo -e "${GREEN}✅ Porta $port livre${NC}"
    fi
done

# Verificar dependências
echo -e "${BLUE}📦 Verificando dependências...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Instalando dependências...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependências OK${NC}"
fi

# Criar diretórios necessários
mkdir -p logs
mkdir -p dist

echo -e "${GREEN}🎉 Ambiente preparado com sucesso!${NC}"
echo -e "${BLUE}🚀 Iniciando aplicação...${NC}"

# Iniciar aplicação
npm run dev
