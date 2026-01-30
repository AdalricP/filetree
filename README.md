# filetree

A live-updating file tree viewer for the terminal. Watch your directory change in real-time.

## Installation

```bash
npm install -g
```

Or link locally:
```bash
npm link
```

## Usage

```bash
# View current directory
filetree

# View specific directory
filetree /path/to/directory
```

## Features

- Live updates as files change
- Tree-style visualization
- Hides `node_modules` and `.git`
- Error highlighting (with optional shell hook)

## Error Highlighting (optional)

Add the hook to your `~/.zshrc` to highlight files that caused errors:

```bash
# Source the hook
source /path/to/filetree/src/filetree-hook.zsh
```

The hook tracks files that produce non-zero exit codes when run as scripts.
