param(
    [string]$cssDir = "frontend/src/styles/light_theme"
)

$files = @(
    "B_styleHome.css",
    "B_StyleLogin.css",
    "B_stylePerfil.css",
    "B_styleServicio.css"
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cssDirFull = Join-Path $projectRoot $cssDir

function Process-CssFile {
    param([string]$filePath)

    Write-Host "Processing: $filePath"
    $content = Get-Content $filePath
    $result = [System.Collections.ArrayList]::new()

    $braceDepth = 0
    $inKeyframes = $false; $keyframesDepth = -1
    $inSelectorContinuation = $false
    $inMedia = $false; $mediaDepth = -1
    
    for ($i = 0; $i -lt $content.Count; $i++) {
        $line = $content[$i]
        $trimmed = $line.Trim()
        
        $isEmpty = [string]::IsNullOrWhiteSpace($line)
        $isComment = $trimmed -match '^/\*' -or $trimmed -match '^\*/'
        
        # Count braces
        $openBraces = 0; $closeBraces = 0
        for ($j = 0; $j -lt $trimmed.Length; $j++) {
            $c = $trimmed[$j]
            if ($c -eq '{') { $openBraces++ }
            elseif ($c -eq '}') { $closeBraces++ }
        }
        
        # Update depth BEFORE processing
        $braceDepth -= $closeBraces
        if ($braceDepth -lt 0) { $braceDepth = 0 }
        
        if ($trimmed -match '^@keyframes') {
            $inKeyframes = $true; $keyframesDepth = $braceDepth
        }
        if ($trimmed -match '^@media') {
            $inMedia = $true; $mediaDepth = $braceDepth
        }
        
        $isAtRule = $trimmed -match '^@'
        $isCloseBrace = ($trimmed -match '^\}') -and !$isEmpty
        $isRoot = ($trimmed -match '^:root')
        
        # Determine if this line needs [data-theme="claro"] prefix
        $needsPrefix = $false
        
        # Handle :root -> html[data-theme="claro"]
        if ($isRoot) {
            $line = $line -replace '^:root', 'html[data-theme="claro"]'
            $needsPrefix = $false
            $inSelectorContinuation = $false
        }
        elseif ($isEmpty -or $isComment -or $isAtRule -or $isCloseBrace -or $inKeyframes) {
            # Never prefix these
            $needsPrefix = $false
            if ($isCloseBrace) { $inSelectorContinuation = $false }
        }
        else {
            # Check if this line is a CSS selector
            # Strategy:
            # 1. Lines starting with . or # are ALWAYS selectors
            # 2. Lines starting with * (universal selector) at depth 0 are selectors
            # 3. Lines starting with a word are selectors IF they contain { or are part of a selector list
            
            $startsWithClass = $trimmed -match '^\.'
            $startsWithId = $trimmed -match '^#'
            $startsWithUniversal = $trimmed -match '^\*'
            $startsWithWord = $trimmed -match '^[a-zA-Z]'
            $startsWithAttr = $trimmed -match '^\['
            $startsWithPseudo = $trimmed -match '^::?[a-zA-Z]'
            
            $hasOpenBrace = $trimmed -match '\{'
            $endsWithComma = $trimmed -match ',\s*$'
            
            # Check if it looks like a property line (word: space)
            $isPropertyLine = $trimmed -match '^[a-zA-Z-]+:\s' -and !$hasOpenBrace
            
            # Check if it's a property continuation at depth > 0
            # These are lines like "  var(--x) 0%," or "  rgba(0,0,0,0.5)," inside a property value
            $isPropertyValueContinuation = $false
            if ($braceDepth -gt 0 -and !$inSelectorContinuation) {
                $isPropertyValueContinuation = $trimmed -match '^\s*(var\(|rgba?\(|hsla?\(|#[\da-fA-F]|\d|url\(|linear-gradient|radial-gradient|repeating-|conic-gradient)'
                # Also check for value keywords at depth > 0 that are CSS values, not selectors
                if (!$isPropertyValueContinuation -and $startsWithWord -and !$hasOpenBrace) {
                    # At depth > 0, a word-starting line ending with comma or semicolon is a property continuation
                    if ($endsWithComma -or $trimmed -match ';\s*$') {
                        $isPropertyValueContinuation = $true
                    }
                }
            }
            
            # Class and ID selectors: always prefix
            if ($startsWithClass -or $startsWithId -or $startsWithAttr) {
                if (!$isPropertyValueContinuation) {
                    $needsPrefix = $true
                }
            }
            # Universal selector at depth 0
            elseif ($startsWithUniversal -and $braceDepth -eq 0) {
                if ($hasOpenBrace -or $endsWithComma) {
                    $needsPrefix = $true
                }
            }
            # Universal selector at depth > 0 (inside @media)
            elseif ($startsWithUniversal -and $braceDepth -gt 0) {
                if ($hasOpenBrace -or $endsWithComma) {
                    $needsPrefix = $true
                }
            }
            # Word-starting lines: selector if at depth 0, or contains {, or is part of a known selector continuation
            elseif ($startsWithWord) {
                if ($braceDepth -eq 0) {
                    # At depth 0, any word that's not a property is a selector
                    if (!$isPropertyLine -and !$isPropertyValueContinuation) {
                        if ($hasOpenBrace -or $endsWithComma) {
                            $needsPrefix = $true
                        }
                    }
                }
                else {
                    # At depth > 0, word-starting line is a selector ONLY if it contains {
                    # (it's a nested rule inside @media)
                    if ($hasOpenBrace -and !$isPropertyLine) {
                        $needsPrefix = $true
                    }
                    # OR if it's a continuation of a known selector (previous line was selector ending with ,)
                    # Exclude property lines (font-size: ...) and property value continuations
                    elseif ($inSelectorContinuation -and !$isPropertyValueContinuation -and !$isPropertyLine) {
                        $needsPrefix = $true
                    }
                }
            }
            # Pseudo-selectors (:hover, ::before, etc.) at root level
            elseif ($startsWithPseudo -and $braceDepth -eq 0) {
                if ($hasOpenBrace -or $endsWithComma) {
                    $needsPrefix = $true
                }
            }
        }
        
        # Track selector continuation (for multi-line selectors)
        $inSelectorContinuation = ($needsPrefix -and $endsWithComma -and !$hasOpenBrace) -or
                                  ($inSelectorContinuation -and $endsWithComma -and !$hasOpenBrace -and !$isCloseBrace)
        
        # Apply prefix
        if ($needsPrefix) {
            $newLine = $line -replace '(^(\s*))([\.#\*\[a-zA-Z])', '$1[data-theme="claro"] $3'
            $newLine = $newLine -replace '(,\s*)([\.#\*\[a-zA-Z])', '$1[data-theme="claro"] $2'
            
            # Also handle :pseudo selectors (not caught by the above since : is not in [.#*\[a-zA-Z])
            if ($line -eq $newLine) {
                # Try with : in the character class
                $newLine = $line -replace '(^(\s*))([:])', '$1[data-theme="claro"] $3'
            }
            
            [void]$result.Add($newLine)
        }
        else {
            [void]$result.Add($line)
        }
        
        # Update depth AFTER processing (both close and open braces counted)
        $braceDepth += $openBraces
        
        # Reset keyframes/media when depth falls back to where they were declared
        if ($inKeyframes -and $braceDepth -le $keyframesDepth) {
            $inKeyframes = $false; $keyframesDepth = -1
        }
        if ($inMedia -and $braceDepth -le $mediaDepth) {
            $inMedia = $false; $mediaDepth = -1
        }
    }
    
    # Write result
    $outContent = $result -join "`r`n"
    Set-Content -Path $filePath -Value $outContent -NoNewline
    Write-Host "  Done. Wrote $($result.Count) lines."
}

foreach ($file in $files) {
    $path = Join-Path $cssDirFull $file
    if (Test-Path $path) {
        Process-CssFile -filePath $path
    } else {
        Write-Warning "File not found: $path"
    }
}

Write-Host "`nAll files processed."
