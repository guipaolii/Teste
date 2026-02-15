# ============================================================
# Oh My Posh - Configuracao para PowerShell com Fonte Colorida
# ============================================================
# Execute este script no PowerShell como Administrador

# --- PASSO 1: Instalar uma Nerd Font ---
# Nerd Fonts incluem icones e glifos necessarios para o Oh My Posh.
# Opcoes recomendadas: "MesloLGM Nerd Font", "FiraCode Nerd Font", "CaskaydiaCove Nerd Font"

# Instalar via Oh My Posh (metodo mais facil, requer Oh My Posh ja instalado):
# oh-my-posh font install meslo
# oh-my-posh font install firacode
# oh-my-posh font install cascadiacode

# Ou baixe manualmente em: https://www.nerdfonts.com/font-downloads

# --- PASSO 2: Configurar a fonte no terminal ---
# No Windows Terminal:
#   1. Abra Configuracoes (Ctrl + ,)
#   2. Va em Perfis > PowerShell > Aparencia
#   3. Em "Tipo de fonte", selecione a Nerd Font instalada (ex: "MesloLGM Nerd Font")
#   4. Salve

# --- PASSO 3: Instalar Oh My Posh ---
# Via winget (recomendado):
winget install JanDeDobbeleer.OhMyPosh -s winget

# Ou via PowerShell (alternativa):
# Install-Module oh-my-posh -Scope CurrentUser -Force

# --- PASSO 4: Configurar o perfil do PowerShell ---
# Abra o perfil do PowerShell para edicao:
# notepad $PROFILE
# Ou crie se nao existir:
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
}

# --- PASSO 5: Adicionar Oh My Posh ao perfil ---
# Adicione a linha abaixo ao seu $PROFILE:
$profileContent = @'

# Oh My Posh - Prompt colorido
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\atomic.omp.json" | Invoke-Expression

'@

# Descomente a linha abaixo para adicionar automaticamente ao perfil:
# Add-Content -Path $PROFILE -Value $profileContent

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Oh My Posh - Guia de Configuracao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para completar a configuracao:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Instale uma Nerd Font:" -ForegroundColor Green
Write-Host "   oh-my-posh font install meslo" -ForegroundColor White
Write-Host ""
Write-Host "2. Configure a fonte no Windows Terminal:" -ForegroundColor Green
Write-Host "   Configuracoes > Perfis > PowerShell > Aparencia > Tipo de fonte" -ForegroundColor White
Write-Host "   Selecione: 'MesloLGM Nerd Font'" -ForegroundColor White
Write-Host ""
Write-Host "3. Adicione ao seu perfil PowerShell:" -ForegroundColor Green
Write-Host "   notepad `$PROFILE" -ForegroundColor White
Write-Host ""
Write-Host "   Cole esta linha:" -ForegroundColor White
Write-Host '   oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\atomic.omp.json" | Invoke-Expression' -ForegroundColor White
Write-Host ""
Write-Host "4. Recarregue o perfil:" -ForegroundColor Green
Write-Host "   . `$PROFILE" -ForegroundColor White
Write-Host ""
Write-Host "5. Para listar todos os temas disponiveis:" -ForegroundColor Green
Write-Host "   Get-ChildItem `$env:POSH_THEMES_PATH" -ForegroundColor White
Write-Host ""
Write-Host "6. Para visualizar cada tema no terminal:" -ForegroundColor Green
Write-Host '   Get-ChildItem $env:POSH_THEMES_PATH/*.omp.json | ForEach-Object { Write-Host "`nTema: $($_.BaseName)" -ForegroundColor Cyan; oh-my-posh print primary --config $_.FullName }' -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Temas populares coloridos:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  - jandedobbeleer  (padrao, colorido)" -ForegroundColor White
Write-Host "  - paradox         (moderno)" -ForegroundColor White
Write-Host "  - atomic          (vibrante)" -ForegroundColor White
Write-Host "  - powerlevel10k_rainbow (muito colorido)" -ForegroundColor White
Write-Host "  - night-owl       (tons escuros)" -ForegroundColor White
Write-Host "  - catppuccin      (tons pasteis)" -ForegroundColor White
Write-Host ""
Write-Host "Para usar outro tema, troque o caminho no perfil:" -ForegroundColor Yellow
Write-Host '  oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\<nome-do-tema>.omp.json" | Invoke-Expression' -ForegroundColor White
Write-Host ""
