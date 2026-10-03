# Gera os ícones do app (tomatinho em pixel no fundo roxo do site) em pomodoro\icons\
# Uso: powershell -ExecutionPolicy Bypass -File criar-icones.ps1
Add-Type -AssemblyName System.Drawing
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$saida = Join-Path (Split-Path -Parent $aqui) 'icons'
New-Item -ItemType Directory -Force $saida | Out-Null
$tomate = @(
  '......g.g.......',
  '.....ggggg......',
  '....rrrgrrr.....',
  '...rrrrrrrrr....',
  '..rrwwrrrrrrr...',
  '..rwwrrrrrrrrd..',
  '..rwrrrrrrrrrd..',
  '..rrrrrrrrrrrd..',
  '..rrrrrrrrrrdd..',
  '..rrrrrrrrrrdd..',
  '...rrrrrrrddd...',
  '....ddrrrdddd...',
  '......ddddd.....'
)
$cores = @{ r = '#F27A6B'; d = '#C8412F'; g = '#6FAE7C'; w = '#FFE9D6' }
function Icone([int]$tam, [string]$nome, [bool]$cheio) {
  $bmp = New-Object System.Drawing.Bitmap $tam, $tam
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.Clear([System.Drawing.Color]::Transparent)
  $fundo = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#221C33'))
  if ($cheio) { $g.FillRectangle($fundo, 0, 0, $tam, $tam) }   # "maskable": o celular recorta o formato
  else {
    $r = $tam * 0.22; $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.AddArc(0, 0, $r * 2, $r * 2, 180, 90); $p.AddArc($tam - $r * 2, 0, $r * 2, $r * 2, 270, 90)
    $p.AddArc($tam - $r * 2, $tam - $r * 2, $r * 2, $r * 2, 0, 90); $p.AddArc(0, $tam - $r * 2, $r * 2, $r * 2, 90, 90)
    $p.CloseFigure(); $g.FillPath($fundo, $p)
  }
  $g.SmoothingMode = 'None'
  $px = [math]::Floor($tam * ($(if ($cheio) { 0.62 } else { 0.72 })) / 16)
  $ox = [math]::Floor(($tam - 16 * $px) / 2); $oy = [math]::Floor(($tam - 13 * $px) / 2)
  for ($y = 0; $y -lt $tomate.Count; $y++) { for ($x = 0; $x -lt 16; $x++) {
    $ch = [string]$tomate[$y][$x]; if ($ch -eq '.') { continue }
    $b = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($cores[$ch]))
    $g.FillRectangle($b, $ox + $x * $px, $oy + $y * $px, $px, $px); $b.Dispose() } }
  $g.Dispose(); $bmp.Save((Join-Path $saida $nome), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
# ícone da aba do navegador: só o tomatinho, sem fundo, ocupando o quadrado todo (fica nítido em 16 e 32 px)
function IconeAba([int]$tam, [string]$nome) {
  $bmp = New-Object System.Drawing.Bitmap $tam, $tam
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Transparent); $g.SmoothingMode = 'None'
  $px = [math]::Floor($tam / 16); $ox = [math]::Floor(($tam - 16 * $px) / 2); $oy = [math]::Floor(($tam - 13 * $px) / 2)
  for ($y = 0; $y -lt $tomate.Count; $y++) { for ($x = 0; $x -lt 16; $x++) {
    $ch = [string]$tomate[$y][$x]; if ($ch -eq '.') { continue }
    $b = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($cores[$ch]))
    $g.FillRectangle($b, $ox + $x * $px, $oy + $y * $px, $px, $px); $b.Dispose() } }
  $g.Dispose(); $bmp.Save((Join-Path $saida $nome), [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
IconeAba 16 'favicon-16.png'
IconeAba 32 'favicon-32.png'
IconeAba 64 'favicon-64.png'
Icone 192 'icon-192.png' $false
Icone 512 'icon-512.png' $false
Icone 512 'icon-maskable.png' $true
Icone 180 'apple-touch-icon.png' $true
Write-Host "Ícones criados em $saida"
