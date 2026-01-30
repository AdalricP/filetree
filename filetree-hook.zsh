# Filetree error hook
# Add this to your ~/.zshrc

# File to store errors
FILETREE_ERROR_LOG="$HOME/.filetree-errors"

# Function to extract file from command
_extract_file_from_cmd() {
    local cmd="$1"
    # Match common patterns: python file.py, node file.js, cargo run, etc.
    if [[ "$cmd" =~ '(python|python3|node|deno|bun|ruby|rb|perl|php|go run|rustc|cargo run|javac|java)\s+([^\s]+)' ]]; then
        echo "${match[2]}"
    elif [[ "$cmd" =~ '\./([^\s]+)' ]]; then
        echo "${match[1]}"
    elif [[ "$cmd" =~ '([^\s]+\.(py|js|ts|jsx|tsx|go|rs|java|rb|php|pl|sh|bash|zsh))' ]]; then
        echo "${match[1]}"
    fi
}

# Hook that runs after each command
filetree_precmd() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        # Get the last command from history
        local cmd="$(fc -ln -1)"
        local file="$(_extract_file_from_cmd "$cmd")"
        if [[ -n "$file" ]]; then
            # Get full path if relative
            if [[ "$file" != /* ]]; then
                file="$(pwd)/$file"
            fi
            # Log the error (avoid duplicates)
            grep -qx "$file" "$FILETREE_ERROR_LOG" 2>/dev/null || echo "$file" >> "$FILETREE_ERROR_LOG"
        fi
    fi
}

# Setup hook
autoload -Uz add-zsh-hook
add-zsh-hook precmd filetree_precmd
