# Startet das Schreiblernspiel unter Windows ohne vorinstalliertes Node/npm.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

$Ver = (Get-Content -Raw (Join-Path $Root "scripts\lib\node-version.txt")).Trim()
$Arch = if ($env:PROCESSOR_ARCHITECTURE -match "ARM") { "arm64" } else { "x64" }
$Name = "node-v$Ver-win-$Arch"
$NodeHome = Join-Path $Root ".tools\$Name"
$NodeExe = Join-Path $NodeHome "node.exe"
$NpmCmd = Join-Path $NodeHome "npm.cmd"

if (-not (Test-Path $NodeExe)) {
    $Tools = Join-Path $Root ".tools"
    New-Item -ItemType Directory -Force -Path $Tools | Out-Null
    $Zip = Join-Path $Tools "$Name.zip"
    $Url = "https://nodejs.org/dist/v$Ver/$Name.zip"
    Write-Host "Lade Node.js v$Ver ($Arch) …"
    Invoke-WebRequest -Uri $Url -OutFile $Zip
    Expand-Archive -Path $Zip -DestinationPath $Tools -Force
    Remove-Item $Zip -Force
}

if (-not (Test-Path $NodeExe)) {
    throw "Node-Download unvollständig: $NodeExe"
}

$env:PATH = "$NodeHome;$env:PATH"
Write-Host "Node: $(& $NodeExe -v)  npm: $(& $NpmCmd -v)"
Write-Host "Installiere Abhängigkeiten …"
& $NpmCmd install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Starte Spiel (Browser öffnet sich) …"
& $NpmCmd run dev -- --host 127.0.0.1 --open
exit $LASTEXITCODE
