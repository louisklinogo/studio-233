param(
    [string]$Source = 'C:\Users\louis\Projects\studio+233',
    [string]$Destination = 'D:\louis\Developer\new\studio+233'
)

if (-not (Test-Path -Path $Destination)) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
}

$log = Join-Path $env:TEMP ("copy-studio233-{0}.log" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))

robocopy $Source $Destination /E /XD node_modules .git /R:2 /W:2 /LOG:$log

$exitCode = $LASTEXITCODE
Write-Host "robocopy exit code: $exitCode"
Write-Host "Copy finished. Log file: $log"

exit $exitCode
