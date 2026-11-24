Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\RUDRA PATEL\.gemini\antigravity\scratch\atlas-ai"
WshShell.Run "cmd.exe /c ""set PATH=C:\Program Files\nodejs;%PATH% && npm.cmd run dev""", 0, False
WScript.Sleep 3500
WshShell.Run "http://localhost:3000/dashboard"
