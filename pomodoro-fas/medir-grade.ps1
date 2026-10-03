# Mede a grade de uma imagem de pixel art: acha as linhas da grade (pixels mais escuros que o fundo)
# numa faixa só de fundo e calcula o espaçamento.
param([string]$file, [int]$y = -1, [int]$x = -1)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($file)
function Lum($p) { 0.299 * $p.R + 0.587 * $p.G + 0.114 * $p.B }
function Lines([int[]]$vals) {
  # posições onde a luminosidade cai bastante em relação aos vizinhos (linha fina da grade)
  $pos = @()
  for ($i = 2; $i -lt $vals.Count - 2; $i++) {
    $m = ($vals[$i-2] + $vals[$i+2]) / 2
    if ($vals[$i] -lt $m - 12 -and $vals[$i] -le $vals[$i-1] -and $vals[$i] -le $vals[$i+1]) { $pos += $i }
  }
  $pos
}
if ($y -lt 0) { $y = 3 }
if ($x -lt 0) { $x = 3 }
$row = 0..($b.Width - 1) | ForEach-Object { [int](Lum $b.GetPixel($_, $y)) }
$col = 0..($b.Height - 1) | ForEach-Object { [int](Lum $b.GetPixel($x, $_)) }
$px = Lines $row; $py = Lines $col
$dx = @(); for ($i = 1; $i -lt $px.Count; $i++) { $dx += $px[$i] - $px[$i-1] }
$dy = @(); for ($i = 1; $i -lt $py.Count; $i++) { $dy += $py[$i] - $py[$i-1] }
"$([IO.Path]::GetFileName($file)) ${($b.Width)}x$($b.Height)"
"  linhas x: " + (($px | Select-Object -First 12) -join ',') + " ... dif: " + (($dx | Group-Object | Sort-Object Count -Descending | Select-Object -First 3 | ForEach-Object { "$($_.Name)x$($_.Count)" }) -join ' ')
"  linhas y: " + (($py | Select-Object -First 12) -join ',') + " ... dif: " + (($dy | Group-Object | Sort-Object Count -Descending | Select-Object -First 3 | ForEach-Object { "$($_.Name)x$($_.Count)" }) -join ' ')
"  n linhas x=$($px.Count) primeira=$($px[0]) ultima=$($px[-1]) | y=$($py.Count) primeira=$($py[0]) ultima=$($py[-1])"
$b.Dispose()
