#!/bin/bash
# fix-tor-ubuntu.sh
# Script para diagnosticar e corrigir problemas com o Tor no Ubuntu

set -e

echo "=== Diagnóstico e Correção do Tor no Ubuntu ==="
echo ""

# Verifica se está rodando como root
if [ "$EUID" -eq 0 ]; then
    echo "[AVISO] Você está rodando como root."
    echo "  - O Tor Browser não funciona como root."
    echo "  - Execute este script como um usuário normal."
    echo ""
fi

# Detecta versão do Ubuntu
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "[INFO] Sistema: $PRETTY_NAME"
else
    echo "[INFO] Sistema: Ubuntu (versão desconhecida)"
fi
echo ""

# Função para verificar se um pacote está instalado
package_installed() {
    dpkg -l "$1" 2>/dev/null | grep -q "^ii"
}

echo "--- Verificando instalação do Tor ---"

if package_installed tor; then
    TOR_VERSION=$(tor --version 2>/dev/null | head -1 || echo "desconhecida")
    echo "[OK] Pacote 'tor' instalado: $TOR_VERSION"
else
    echo "[ERRO] Pacote 'tor' não está instalado."
    echo "  Instalando o Tor..."
    sudo apt-get update -y
    sudo apt-get install -y tor
    echo "[OK] Tor instalado com sucesso."
fi
echo ""

echo "--- Verificando serviço do Tor ---"

if systemctl is-active --quiet tor; then
    echo "[OK] Serviço Tor está rodando."
else
    echo "[AVISO] Serviço Tor não está ativo. Iniciando..."
    sudo systemctl enable tor
    sudo systemctl start tor
    if systemctl is-active --quiet tor; then
        echo "[OK] Serviço Tor iniciado com sucesso."
    else
        echo "[ERRO] Falha ao iniciar o serviço Tor."
        echo "  Verifique os logs: sudo journalctl -u tor --no-pager -n 50"
    fi
fi
echo ""

echo "--- Verificando Tor Browser ---"

TOR_BROWSER_PATHS=(
    "$HOME/tor-browser"
    "$HOME/tor-browser_pt-BR"
    "$HOME/tor-browser_en-US"
    "$HOME/Desktop/tor-browser"
    "/opt/tor-browser"
)

TOR_BROWSER_FOUND=""
for path in "${TOR_BROWSER_PATHS[@]}"; do
    if [ -d "$path" ]; then
        TOR_BROWSER_FOUND="$path"
        echo "[OK] Tor Browser encontrado em: $path"
        break
    fi
done

if [ -z "$TOR_BROWSER_FOUND" ]; then
    echo "[AVISO] Tor Browser não encontrado nos locais padrão."
    echo "  Para instalar o Tor Browser:"
    echo "  1. Acesse: https://www.torproject.org/download/"
    echo "  2. Baixe o pacote para Linux"
    echo "  3. Extraia o arquivo: tar -xvJf tor-browser-linux64-*.tar.xz"
    echo "  4. Entre na pasta: cd tor-browser"
    echo "  5. Execute: ./start-tor-browser.desktop"
fi
echo ""

echo "--- Verificando dependências do Tor Browser ---"

DEPS=(
    "libgtk-3-0"
    "libdbus-glib-1-2"
    "libxt6"
    "libxrender1"
    "libx11-6"
    "libxcomposite1"
    "libxdamage1"
    "libxfixes3"
    "libxrandr2"
    "libxss1"
    "libxtst6"
)

MISSING_DEPS=()
for dep in "${DEPS[@]}"; do
    if ! package_installed "$dep"; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
    echo "[OK] Todas as dependências estão instaladas."
else
    echo "[AVISO] Dependências faltando: ${MISSING_DEPS[*]}"
    echo "  Instalando dependências..."
    sudo apt-get install -y "${MISSING_DEPS[@]}"
    echo "[OK] Dependências instaladas."
fi
echo ""

echo "--- Verificando permissões ---"

if [ -n "$TOR_BROWSER_FOUND" ]; then
    START_SCRIPT="$TOR_BROWSER_FOUND/start-tor-browser.desktop"
    TOR_BIN="$TOR_BROWSER_FOUND/Browser/start-tor-browser"

    if [ -f "$START_SCRIPT" ]; then
        chmod +x "$START_SCRIPT"
        echo "[OK] Permissão de execução definida em: $START_SCRIPT"
    fi

    if [ -f "$TOR_BIN" ]; then
        chmod +x "$TOR_BIN"
        echo "[OK] Permissão de execução definida em: $TOR_BIN"
    fi
fi
echo ""

echo "--- Verificando conflitos de rede ---"

if ss -tlnp 2>/dev/null | grep -q ":9050 " || netstat -tlnp 2>/dev/null | grep -q ":9050 "; then
    echo "[OK] Porta 9050 (SOCKS do Tor) está em uso — Tor está escutando."
else
    echo "[INFO] Porta 9050 não está em uso."
    echo "  Se o serviço Tor estiver rodando mas a porta fechada, verifique:"
    echo "  sudo cat /etc/tor/torrc"
fi
echo ""

echo "--- Soluções comuns ---"
echo ""
echo "1. Se o Tor Browser não abre (interface gráfica):"
echo "   cd ~/tor-browser && ./start-tor-browser.desktop --detach"
echo ""
echo "2. Se aparecer erro 'cannot run as root':"
echo "   Não execute como root. Use um usuário normal."
echo ""
echo "3. Se o serviço Tor travar:"
echo "   sudo systemctl restart tor"
echo ""
echo "4. Para ver logs de erro:"
echo "   sudo journalctl -u tor -n 100 --no-pager"
echo ""
echo "5. Para reinstalar o Tor completamente:"
echo "   sudo apt-get remove --purge tor && sudo apt-get install tor"
echo ""
echo "=== Diagnóstico concluído ==="
