# Auto-reconnecting tunnel daemon for ATLAS AI
while ($true) {
  Write-Host "[ATLAS Tunnel] Connecting to public gateway..."
  ssh.exe -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:3000 serveo.net
  Write-Host "[ATLAS Tunnel] Session completed or timed out. Reconnecting in 3 seconds..."
  Start-Sleep -Seconds 3
}
