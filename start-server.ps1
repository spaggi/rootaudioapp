$port = 8000
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notlike "169.254.*"
} | Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host ""
Write-Host "Root Audio App - lokaler Server"
Write-Host "--------------------------------"
Write-Host "Auf dem iPhone (im selben WLAN) in Safari oeffnen:"
Write-Host ""
Write-Host "  http://$($ip):$port" -ForegroundColor Cyan
Write-Host ""
Write-Host "Zum Beenden: Strg+C"
Write-Host ""

Set-Location $PSScriptRoot
python -m http.server $port --bind 0.0.0.0
