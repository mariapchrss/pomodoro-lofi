# Monta a cópia dos fãs: pega o site oficial (..\pomodoro), acrescenta os personagens de jogos (fas.js)
# e gera ..\pomodoro-fas-site.zip. O site oficial não é alterado.
$ErrorActionPreference = 'Stop'
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$oficial = Join-Path $aqui '..\pomodoro'
$site = Join-Path $aqui 'site'
$zip = Join-Path $aqui '..\pomodoro-fas-site.zip'

if (Test-Path $site) { Remove-Item $site -Recurse -Force -Confirm:$false }
Copy-Item $oficial $site -Recurse
Copy-Item (Join-Path $aqui 'fas.js') (Join-Path $site 'js\fas.js')
$extra = Join-Path $site 'gerar-zip.ps1'; if (Test-Path -LiteralPath $extra) { [IO.File]::Delete($extra) }
$ferr = Join-Path $site 'ferramentas'; if (Test-Path -LiteralPath $ferr) { Get-ChildItem -LiteralPath $ferr -File | ForEach-Object { [IO.File]::Delete($_.FullName) }; [IO.Directory]::Delete($ferr) }

$idx = Join-Path $site 'index.html'
$html = [IO.File]::ReadAllText($idx)
if (-not $html.Contains('<script src="js/pets.js"></script>')) { throw 'nao achei o pets.js no index.html' }
$html = $html.Replace('<script src="js/pets.js"></script>', "<script src=""js/pets.js""></script>`n<script src=""js/fas.js""></script>")
[IO.File]::WriteAllText($idx, $html, (New-Object Text.UTF8Encoding $false))

Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
if (Test-Path $zip) { Remove-Item $zip -Force -Confirm:$false }
$root = (Resolve-Path $site).Path
$z = [IO.Compression.ZipFile]::Open($zip, 'Create')
Get-ChildItem $site -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, $_.FullName, $rel)
}
$z.Dispose()
Write-Host "Pronto! Copia dos fas em pomodoro-fas\site e o zip em pomodoro-fas-site.zip"
