Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Start STK Requirement Server automatically from current folder location
WshShell.Run "cmd /c cd /d """ & scriptDir & """ && npm run dev", 0, False

