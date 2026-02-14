#!/usr/bin/env bash
# Falha imediata em qualquer erro
set -o errexit
set -o pipefail

echo "=== [FLUX BUILD] Iniciando Build da Plataforma ==="

# 0. Depuração de ambiente
echo "--- Diretório atual: $(pwd)"
echo "--- Conteúdo do diretório:"
ls -la

# 1. Verificação de integridade
if [ ! -f "package.json" ]; then
  echo "❌ ERRO CRÍTICO: package.json não encontrado na raiz!"
  exit 1
fi

# 2. Instalar dependências (inclui devDependencies para o Vite)
echo "=== [FLUX BUILD] Instalando dependências ==="
npm install --include=dev

# 3. Limpar build antigo
echo "=== [FLUX BUILD] Limpando artefatos antigos ==="
rm -rf dist

# 4. Build do frontend (React + Vite)
echo "=== [FLUX BUILD] Compilando frontend ==="
npm run build

# 5. Verificação final
if [ ! -d "dist" ]; then
  echo "❌ ERRO: pasta 'dist' não foi gerada. Build inválido."
  exit 1
fi

echo "=== [FLUX BUILD] Build finalizado com sucesso! ==="
