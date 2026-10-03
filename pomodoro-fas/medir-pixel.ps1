# Descobre o tamanho do quadradinho (e onde a grade começa) numa pixel art, pelas mudanças de cor.
# Funciona com e sem linhas de grade. Uso: medir-pixel.ps1 arquivo [menor] [maior]
param([string]$file, [double]$smin = 5, [double]$smax = 45)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($file)
function Changes([bool]$vertical) {
  $pos = @()
  foreach ($frac in 0.25, 0.35, 0.45, 0.55, 0.65, 0.75) {
    if ($vertical) { $x = [int]($b.Width * $frac); $prev = $b.GetPixel($x, 0); for ($y = 1; $y -lt $b.Height; $y++) { $p = $b.GetPixel($x, $y); if ([math]::Abs($p.R-$prev.R)+[math]::Abs($p.G-$prev.G)+[math]::Abs($p.B-$prev.B) -gt 90) { $pos += $y }; $prev = $p } }
    else { $y = [int]($b.Height * $frac); $prev = $b.GetPixel(0, $y); for ($x = 1; $x -lt $b.Width; $x++) { $p = $b.GetPixel($x, $y); if ([math]::Abs($p.R-$prev.R)+[math]::Abs($p.G-$prev.G)+[math]::Abs($p.B-$prev.B) -gt 90) { $pos += $x }; $prev = $p } }
  }
  ,$pos
}
function Phase($pos, $s) { $cx = 0; $cy = 0; foreach ($v in $pos) { $a = 2*[math]::PI*($v / $s); $cx += [math]::Cos($a); $cy += [math]::Sin($a) }; @(([math]::Sqrt($cx*$cx+$cy*$cy)/[math]::Max(1,$pos.Count)), (([math]::Atan2($cy, $cx)/(2*[math]::PI)*$s + $s) % $s)) }
$px = Changes $false; $py = Changes $true
$res = @()
for ($s = $smin; $s -le $smax; $s += 0.02) { $res += ,@($s, ((Phase $px $s)[0] + (Phase $py $s)[0])) }
$max = ($res | ForEach-Object { $_[1] } | Measure-Object -Maximum).Maximum
# metade do tamanho certo também "encaixa" (todo múltiplo de 16 é múltiplo de 8): fica com o MAIOR que encaixa quase igual
$pick = $res | Where-Object { $_[1] -ge $max - 0.06 } | Sort-Object { $_[0] } | Select-Object -Last 1
$bs = $pick[0]; $best = $pick[1]
$ox = (Phase $px $bs)[1]; $oy = (Phase $py $bs)[1]
"{0}: quadradinho {1:N2}px, começo x {2:N1} y {3:N1}, confiança {4:N2}" -f (Split-Path $file -Leaf), $bs, $ox, $oy, ($best/2)
$b.Dispose()
