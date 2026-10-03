# Lê uma pixel art em grade e gera as linhas do personagem (letras) + a paleta.
# cw/ch = tamanho do quadradinho, x0/y0 = onde começa a grade. Fundo branco/cinza-claro (acima de bgMin) vira '.'.
param([string]$file, [double]$cw, [double]$ch, [double]$x0 = 0, [double]$y0 = 0, [int]$tol = 40, [string]$crop = '', [int]$bgMin = 225, [string]$bgHex = '', [int]$bgTol = 40)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($file)
$cols = [int][math]::Floor(($b.Width - $x0) / $cw); $rows = [int][math]::Floor(($b.Height - $y0) / $ch)
$letters = 'abcdfghjkmnpqrstuvxyzABCDEFGHJKLMNPQRSTUVWXYZ'.ToCharArray()
$clusters = New-Object System.Collections.ArrayList
$grid = @()
for ($r = 0; $r -lt $rows; $r++) {
  $line = ''
  for ($c = 0; $c -lt $cols; $c++) {
    $rs = @(); $gs = @(); $bs = @(); $as = @()
    foreach ($fx in 0.3, 0.5, 0.7) { foreach ($fy in 0.3, 0.5, 0.7) {
      $px = [int]($x0 + ($c + $fx) * $cw); $py = [int]($y0 + ($r + $fy) * $ch)
      if ($px -ge $b.Width -or $py -ge $b.Height) { continue }
      $p = $b.GetPixel($px, $py); $rs += $p.R; $gs += $p.G; $bs += $p.B; $as += $p.A } }
    $cR = [int]($rs | Sort-Object)[4]; $cG = [int]($gs | Sort-Object)[4]; $cB = [int]($bs | Sort-Object)[4]
    $mx = [math]::Max($cR, [math]::Max($cG, $cB)); $mn = [math]::Min($cR, [math]::Min($cG, $cB))
    # fundo transparente (PNG)
    if ([int]($as | Sort-Object)[4] -lt 128) { $line += '.'; continue }
    # fundo: branco/cinza-claro, ou a cor dada em bgHex (ex.: 000000 para fundo preto)
    if ($bgHex) { $h = [Convert]::ToInt32($bgHex, 16); $dR = $cR - ($h -shr 16); $dG = $cG - (($h -shr 8) -band 255); $dB = $cB - ($h -band 255)
      if ([math]::Sqrt($dR*$dR + $dG*$dG + $dB*$dB) -lt $bgTol) { $line += '.'; continue } }
    elseif ($mn -gt $bgMin -and ($mx - $mn) -lt 25) { $line += '.'; continue }
    $best = $null; $bd = 1e9
    foreach ($k in $clusters) { $d = [math]::Sqrt(($cR-$k.R)*($cR-$k.R) + ($cG-$k.G)*($cG-$k.G) + ($cB-$k.B)*($cB-$k.B)); if ($d -lt $bd) { $bd = $d; $best = $k } }
    if ($best -eq $null -or $bd -gt $tol) { $best = [pscustomobject]@{L=$letters[$clusters.Count]; R=$cR; G=$cG; B=$cB; n=0}; [void]$clusters.Add($best) }
    $best.n++
    $line += $best.L
  }
  $grid += $line
}
$b.Dispose()
# fundo de dentro do contorno vira 'w' (na cor do fundo; só o que liga na borda da imagem é transparente)
$H = $grid.Count; $W = $grid[0].Length
$cells = $grid | ForEach-Object { ,($_.ToCharArray()) }
$out = New-Object 'bool[,]' $H, $W
$q = New-Object System.Collections.Queue
for ($yy = 0; $yy -lt $H; $yy++) { foreach ($xx in 0, ($W - 1)) { if ($cells[$yy][$xx] -eq '.') { $out[$yy, $xx] = $true; $q.Enqueue(@($yy, $xx)) } } }
for ($xx = 0; $xx -lt $W; $xx++) { foreach ($yy in 0, ($H - 1)) { if ($cells[$yy][$xx] -eq '.' -and -not $out[$yy, $xx]) { $out[$yy, $xx] = $true; $q.Enqueue(@($yy, $xx)) } } }
while ($q.Count) {
  $cur = $q.Dequeue()
  foreach ($d in @(@(1,0), @(-1,0), @(0,1), @(0,-1))) {
    $ny = $cur[0] + $d[0]; $nx = $cur[1] + $d[1]
    if ($ny -ge 0 -and $ny -lt $H -and $nx -ge 0 -and $nx -lt $W -and -not $out[$ny, $nx] -and $cells[$ny][$nx] -eq '.') { $out[$ny, $nx] = $true; $q.Enqueue(@($ny, $nx)) }
  }
}
$whites = 0
for ($yy = 0; $yy -lt $H; $yy++) { for ($xx = 0; $xx -lt $W; $xx++) { if ($cells[$yy][$xx] -eq '.' -and -not $out[$yy, $xx]) { $cells[$yy][$xx] = 'w'; $whites++ } } }
$grid = $cells | ForEach-Object { -join $_ }
"brancos de dentro: $whites (w = #FFFFFF)"
# recorta no tamanho do desenho
$nonEmpty = @(); for ($i = 0; $i -lt $grid.Count; $i++) { if ($grid[$i] -match '[^.]') { $nonEmpty += $i } }
$top = $nonEmpty[0]; $bot = $nonEmpty[-1]
$left = ($grid | ForEach-Object { if ($_ -match '[^.]') { $_.IndexOf(($_.TrimStart('.'))[0]) } } | Measure-Object -Minimum).Minimum
$right = ($grid | ForEach-Object { $t = $_.TrimEnd('.'); if ($t.Length) { $t.Length - 1 } } | Measure-Object -Maximum).Maximum
"grade $cols x $rows, desenho linhas $top-$bot, colunas $left-$right"
for ($i = $top; $i -le $bot; $i++) { "{0,3} {1}" -f $i, $grid[$i].Substring($left, $right - $left + 1) }
$clusters | ForEach-Object { "{0} = #{1:X2}{2:X2}{3:X2}  ({4})" -f $_.L, $_.R, $_.G, $_.B, $_.n }
if ($crop) {
  # salva a grade inteira (sem recorte) e a paleta num JSON para o script de montagem
  $pal = @{}; $clusters | ForEach-Object { $pal[[string]$_.L] = "#{0:X2}{1:X2}{2:X2}" -f $_.R, $_.G, $_.B }; $pal['w'] = if ($bgHex) { '#' + $bgHex } else { '#FFFFFF' }
  @{grid = $grid; pal = $pal} | ConvertTo-Json -Depth 4 | Set-Content -Path $crop -Encoding UTF8
}
