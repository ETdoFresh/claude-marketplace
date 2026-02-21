---
name: port-killer
description: >
  Kills processes that are listening on specific network ports. Detects the
  operating system (Windows, macOS, or Linux) and uses the appropriate native
  commands to find PIDs by port and terminate them. Use this skill whenever the
  user wants to free up a port, kill something running on a port, stop a server
  on a port, or mentions that a port is "already in use" or "blocked". Also
  triggers when the user says things like "something is running on port 3000"
  or "I can't start my server because port 8080 is taken". Supports multiple
  ports at once.
allowed-tools: Bash
---

# Port Killer

Kill processes occupying network ports. Works on Windows, macOS, and Linux.

## How It Works

1. Detect the operating system from the platform/shell environment
2. For each requested port, find the PID of the process listening on it
3. Kill each process by PID
4. Report what was killed (PID, port) and any ports that were already free

## OS Detection

Determine the OS using `uname` or environment context:

| OS | Detection |
|----|-----------|
| **Windows** | `uname` returns something containing "MINGW", "MSYS", or "CYGWIN", or the platform is `win32` |
| **macOS** | `uname` returns "Darwin" |
| **Linux** | `uname` returns "Linux" |

If you already know the OS from the environment context (e.g., the system prompt says `Platform: win32`), skip the detection step.

## Finding PIDs by Port

### Windows

Determine whether the shell is **PowerShell** or **Git Bash** from the environment context (the system prompt typically says `Shell: powershell` or `Shell: bash`). Use the matching approach below.

#### PowerShell

`Get-NetTCPConnection` is the cleanest way — it returns structured objects so there's no text parsing needed:

```powershell
# Find PID listening on port 3000
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $conn | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
    Write-Output "Killed PID $($_.OwningProcess) on port 3000"
  }
} else {
  Write-Output "Port 3000 - no process found (already free)"
}
```

If `Get-NetTCPConnection` is unavailable (older systems), fall back to `netstat`:

```powershell
# Fallback: parse netstat output
$line = netstat -ano | Select-String ':3000\s.*LISTENING'
if ($line) {
  $pid = ($line -split '\s+')[-1]
  Stop-Process -Id $pid -Force
  Write-Output "Killed PID $pid on port 3000"
}
```

#### Git Bash / MSYS / Cygwin

Use `netstat` with `grep` and `awk`:

```bash
# Find PID on a port (e.g., 3000)
# Use \s after port number to avoid matching 30001 when looking for 3000
netstat -ano | grep -E ':3000\s' | grep 'LISTENING'
```

The PID is the last column in the output. Extract it with `awk '{print $NF}'` and kill:

```bash
# Extract PID and kill (example for port 3000)
PID=$(netstat -ano | grep -E ':3000\s' | grep 'LISTENING' | awk '{print $NF}' | head -1)
if [ -n "$PID" ]; then
  taskkill //F //PID "$PID"
fi
```

Note: In Git Bash, use `//F //PID` (double slashes) because single slashes get interpreted as paths.

### macOS

Use `lsof` — the `-t` flag outputs just PID(s), and `-i` filters by port:

```bash
# Find PID(s) listening on port 3000
lsof -ti tcp:3000

# Kill all PIDs found
lsof -ti tcp:3000 | xargs kill -9
```

If `lsof` returns nothing, the port is already free.

### Linux

Use `lsof` (most common) or fall back to `ss` + `fuser`:

```bash
# Option 1: lsof (same as macOS)
lsof -ti tcp:3000 | xargs kill -9

# Option 2: fuser (if lsof is not installed)
fuser -k 3000/tcp
```

On some Linux systems, `lsof` may require `sudo` to see processes owned by other users. If `lsof -ti tcp:<port>` returns empty but the port is known to be in use, retry with `sudo`.

## Handling Multiple Ports

When the user provides multiple ports (e.g., "kill 3000, 8080, and 5432"), process each port sequentially. Run the find-and-kill commands for each port one at a time so you can report results clearly.

## Output

After killing, report a brief summary. For example:

```
Killed PID 12345 on port 3000
Killed PID 67890 on port 8080
Port 5432 - no process found (already free)
```

## Edge Cases

- **No process on port**: Report that the port is already free. This is not an error.
- **Permission denied**: If a kill fails due to permissions, suggest running with elevated privileges (`sudo` on macOS/Linux, or running the terminal as Administrator on Windows).
- **Multiple PIDs on one port**: Some ports may have multiple processes (e.g., parent + child). Kill all of them.
- **Port format**: Accept bare numbers (3000), or with context ("port 3000", ":3000"). Strip any non-numeric prefix.
