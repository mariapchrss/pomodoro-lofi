# Gera pomodoro-site.zip (site oficial, sem os personagens de marcas) na pasta Bot, com as pastas separadas por "/"
$ErrorActionPreference = 'Stop'
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$zip = Join-Path (Split-Path -Parent $aqui) 'pomodoro-site.zip'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $zip) { [IO.File]::Delete($zip) }
$z = [IO.Compression.ZipFile]::Open($zip, 'Create')
Get-ChildItem -LiteralPath $aqui -Recurse -File | Where-Object { $_.Name -ne 'gerar-zip.ps1' -and $_.FullName -notlike '*\ferramentas\*' } | ForEach-Object {
  $rel = $_.FullName.Substring($aqui.Length + 1) -replace '\\', '/'
  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, $_.FullName, $rel)
}
$z.Dispose()
Write-Host "Pronto! pomodoro-site.zip gerado"
