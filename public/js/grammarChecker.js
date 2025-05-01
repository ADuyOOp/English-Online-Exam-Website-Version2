document.addEventListener("DOMContentLoaded", function () {
    const grammarApiUrl = "https://api.languagetool.org/v2/check";
    let debounceTimer;

    const tenseRuleIds = new Set([
        "TENSE_SIMPLE", "TENSE_AGREEMENT", "TENSE_SEQUENCE", "VERB_TENSE",
        "VERB_FORM", "INCORRECT_VERB_TENSE", "WRONG_VERB_TENSE",
        "SEQUENCE_OF_TENSES", "VERB_TENSE_CONSISTENCY", "VERB_USAGE",
        "TIME_FRAME", "VERB_CONJUGATION", "VERB_TENSE_MISMATCH", "HE_VERB_AGR", "EN_A_VS_AN", "BEEN_PART_AGREEMENT",
        "PERS_PRONOUN_AGREEMENT", "WROTE", "AUXILIARY_DO_WITH_INCORRECT_VERB_FORM", "PERS_PRONOUN_AGREEMENT", "PRP_MD_NN",
        "MD_BASEFORM", "YO_TO", "HAVE_PART_AGREEMENT", "I_AM_VB", "MANY_NN", "A_NNS", "BASE_FORM", "NON3PRS_VERB"
    ]);


    function getCaretPosition(element) {
        let selection = window.getSelection();
        if (!selection.rangeCount) return 0;
        let range = selection.getRangeAt(0);
        let preRange = range.cloneRange();
        preRange.selectNodeContents(element);
        preRange.setEnd(range.startContainer, range.startOffset);
        return preRange.toString().length;
    }

    function setCaretPosition(element, position) {
        let range = document.createRange();
        let selection = window.getSelection();
        let currentLength = 0;

        function traverseNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                let textLength = node.textContent.length;
                if (currentLength + textLength >= position) {
                    range.setStart(node, position - currentLength);
                    range.collapse(true);
                    return true;
                }
                currentLength += textLength;
            } else {
                for (let child of node.childNodes) {
                    if (traverseNodes(child)) return true;
                }
            }
            return false;
        }

        traverseNodes(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    // Function to check grammar using LanguageTool API
    async function checkGrammar(inputElement) {
        const text = inputElement.innerText.trim();
        if (!text) return;

        try {
            const customErrors = detectCustomTenseErrors(text);
            const response = await fetch(grammarApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ language: "en-US", text }),
            });

            const data = await response.json();
            console.log("API Full Response:", JSON.stringify(data, null, 2));
            // underlineErrors(inputElement, data.matches, customErrors);
            underlineErrors(inputElement, data.matches, customErrors);
        } catch (error) {
            console.error("Grammar check failed:", error);
        }
    }

    // Function to detect custom tense errors and provide suggestions
    function detectCustomTenseErrors(text) {
        const passiveVoiceRegex = /\b(is|are)\s+(\w+ed)\b/gi; 
    
        let errors = [];
        let match;
    
        // Detect passive voice constructions
        while ((match = passiveVoiceRegex.exec(text)) !== null) {
            const auxiliary = match[1]; 
            const pastParticiple = match[2]; 
            const fullMatch = match[0]; 
            const startIndex = match.index; 
            const endIndex = startIndex + fullMatch.length; 
    
            // Check if the passive voice construction is followed by "by"
            const textAfterMatch = text.slice(endIndex).trim();
            if (!textAfterMatch.startsWith("by")) {
                
                errors.push({
                    message: "Incorrect passive voice construction. Use 'by' to indicate the agent.",
                    offset: startIndex, 
                    length: fullMatch.length, 
                    rule: { id: "PASSIVE_VOICE_ERROR", category: { id: "TENSE" } },
                    replacements: [{ value: `${auxiliary} ${pastParticiple} by` }] 
                });
            }
        }
    
        return errors;
    }

    // Function to underline errors and display suggestions
    function underlineErrors(inputElement, matches, customErrors = []) {
        let text = inputElement.innerText;
        let caretPos = getCaretPosition(inputElement);
        const fontFamily = window.getComputedStyle(inputElement).fontFamily;
    
        // Reset to plain text before applying new underlines
        inputElement.innerHTML = text;
    
        if (!matches.length && !customErrors.length) {
            removeErrorDisplay(inputElement);
            setCaretPosition(inputElement, caretPos);
            return;
        }
    
        let formattedText = document.createDocumentFragment();
        let lastIndex = 0;
    
        // Combine and sort errors
        const allErrors = matches.concat(customErrors).sort((a, b) => a.offset - b.offset);
    
        allErrors.forEach(match => {
            let issueDescription = match.message;
            let start = match.offset;
            let end = start + match.length;
            let errorWord = text.substring(start, end);
    
            if (start < lastIndex) return;
    
            // Append normal text before the error
            if (lastIndex < start) {
                formattedText.appendChild(document.createTextNode(text.substring(lastIndex, start)));
            }
    
            // Determine underline color based on error type
            let underlineStyle = "2px solid blue"; // Default for grammar errors
            if (match.rule.category.id === "TYPOS") {
                underlineStyle = "2px solid red"; // Spelling mistakes
            } else if (tenseRuleIds.has(match.rule.id) || match.rule.id === "PASSIVE_VOICE_ERROR") {
                underlineStyle = "2px solid orange"; // Tense-related errors
            }
    
            // Create span for the underlined error
            let span = document.createElement("span");
            span.textContent = errorWord;
            span.style.borderBottom = underlineStyle;
            span.style.fontFamily = fontFamily; // Apply consistent font family
            span.title = issueDescription;
    
            // Click event for error details
            span.addEventListener("click", (e) => {
                e.stopPropagation();
                const replacements = match.replacements || [];
                showErrorTooltip(span, issueDescription, underlineStyle, replacements, inputElement);
            });
    
            formattedText.appendChild(span);
            lastIndex = end;
        });
    
        // Append remaining text after last error
        if (lastIndex < text.length) {
            formattedText.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
    
        // Replace content safely
        inputElement.innerHTML = "";
        inputElement.appendChild(formattedText);
        setCaretPosition(inputElement, caretPos);
    }

    // Function to compute Levenshtein Distance (edit distance)
    function levenshteinDistance(a, b) {
        const dp = Array(a.length + 1)
            .fill(null)
            .map(() => Array(b.length + 1).fill(null));

        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // Deletion
                    dp[i][j - 1] + 1, // Insertion
                    dp[i - 1][j - 1] + cost // Substitution
                );
            }
        }
        return dp[a.length][b.length];
    }

    // Function to filter valid suggestions and sort by closest match
    function filterAndSortSuggestions(originalWord, replacements) {
        return replacements
            .map(rep => rep.value)
            .filter(word => {
                // Exclude all-uppercase words (e.g., "THS", "NHS", "TCS")
                if (/^[A-Z]+$/.test(word)) return false;

                // Exclude words containing numbers or special characters
                if (!/^[a-zA-Z]+$/.test(word)) return false;

                // Ensure words are meaningful (length > 1)
                return word.length > 1;
            })
            .map(word => ({ word, distance: levenshteinDistance(originalWord.toLowerCase(), word.toLowerCase()) }))
            .sort((a, b) => a.distance - b.distance) // Sort by closest match
            .slice(0, 5) // Keep only top 5 closest suggestions
            .map(entry => entry.word);
    }

    // Function to show the error tooltip with filtered suggestions
    function showErrorTooltip(element, message, underlineStyle, replacements, inputElement) {
        removeErrorTooltip(); // Remove any existing tooltip first

        // Get filtered & sorted top 5 closest words
        const originalWord = element.innerText.trim();
        const filteredReplacements = filterAndSortSuggestions(originalWord, replacements);

        // Apply background color to highlight the error
        element.style.backgroundColor = underlineStyle.split(" ")[2];
        element.style.cursor = "pointer";

        // Create tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "error-tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "#fff";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.padding = "5px";
        tooltip.style.borderRadius = "3px";
        tooltip.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
        tooltip.style.zIndex = "1000";
        tooltip.style.fontSize = "14px";
        tooltip.style.maxWidth = "200px";

        // Error message
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        tooltip.appendChild(messageElement);

        // Display filtered suggestions
        if (filteredReplacements.length > 0) {
            const suggestionsTitle = document.createElement("div");
            suggestionsTitle.textContent = "Suggestions:";
            suggestionsTitle.style.marginTop = "5px";
            suggestionsTitle.style.fontWeight = "bold";
            tooltip.appendChild(suggestionsTitle);

            filteredReplacements.forEach(replacement => {
                const suggestion = document.createElement("div");
                suggestion.textContent = replacement;
                suggestion.style.cursor = "pointer";
                suggestion.style.padding = "2px 5px";
                suggestion.style.marginTop = "2px";
                suggestion.style.borderRadius = "3px";
                suggestion.style.backgroundColor = "#f0f0f0";
                suggestion.style.display = "inline-block";
                suggestion.style.marginRight = "5px";
                suggestion.addEventListener("click", () => {
                    replaceErrorWord(element, replacement, inputElement);
                    removeErrorTooltip();
                });
                tooltip.appendChild(suggestion);
            });
        } else {
            // No valid suggestions
            const noSuggestions = document.createElement("div");
            noSuggestions.textContent = "No valid suggestions found.";
            noSuggestions.style.color = "#999";
            tooltip.appendChild(noSuggestions);
        }

        // Position the tooltip correctly
        const rect = element.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(tooltip);

        // Close tooltip when clicking outside
        document.addEventListener("click", closeTooltipOnClickOutside, true);
    }

    // Function to replace the misspelled word with the selected suggestion
    function replaceErrorWord(element, replacement, inputElement) {
        const text = inputElement.innerText;
        const errorWord = element.textContent;
        const startIndex = text.indexOf(errorWord);
        const endIndex = startIndex + errorWord.length;

        // Replace the error word with the selected suggestion
        const newText = text.substring(0, startIndex) + replacement + text.substring(endIndex);
        inputElement.innerText = newText;

        // Re-check grammar after replacement
        checkGrammar(inputElement);
    }

    // Function to remove the error tooltip
    function removeErrorTooltip() {
        const tooltip = document.querySelector(".error-tooltip");
        if (tooltip) {
            tooltip.remove();
        }
        // Remove highlight from all error spans
        document.querySelectorAll("span[style*='border-bottom']").forEach(span => {
            span.style.backgroundColor = "";
        });
    }

    // Function to close the tooltip when clicking outside
    function closeTooltipOnClickOutside(e) {
        if (!e.target.closest(".error-tooltip") && !e.target.closest("span[style*='border-bottom']")) {
            removeErrorTooltip();
            document.removeEventListener("click", closeTooltipOnClickOutside, true);
        }
    }

    // Function to remove the error display
    function removeErrorDisplay(inputElement) {
    }

    // Function to make textarea element editable
    function makeTextAreaEditable(input) {
        const div = document.createElement("div");
        div.contentEditable = true;
        div.innerText = input.value;
        div.dataset.originalInput = input.name; // Store original input name
        div.style.cssText = `
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 4px 4px #323232;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            resize: vertical;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            overflow: auto;
            
            width: ${input.clientWidth}px;
            height: ${input.clientHeight}px;
            padding: ${window.getComputedStyle(input).padding};
            border: ${window.getComputedStyle(input).border};
            font-family: ${window.getComputedStyle(input).fontFamily};
            font-size: ${window.getComputedStyle(input).fontSize};
            line-height: ${window.getComputedStyle(input).lineHeight};
            background-color: ${window.getComputedStyle(input).backgroundColor};
        `;

        // Handle original display:none state
        if (window.getComputedStyle(input).display === 'none') {
            div.style.display = 'none';
        } else {
            div.style.display = 'block'; 
        }
    
        input.style.display = "none"; // Hide the original input
        input.dataset.originalDisplay = window.getComputedStyle(input).display;
        input.parentElement.insertBefore(div, input);
    
        // Add placeholder if empty
        if (!input.value && input.placeholder) {
            div.innerText = input.placeholder;
            div.style.color = '#999';
            div.style.fontStyle = 'italic';
        }
    
        // Clear placeholder on focus
        const originalFocus = div.onfocus;
        div.addEventListener('focus', function(e) {
            if (div.innerText === input.placeholder) {
                div.innerText = '';
                div.style.color = '';
                div.style.fontStyle = '';
            }
            originalFocus && originalFocus(e);
        });
    
        // Restore placeholder on blur if empty
        const originalBlur = div.onblur;
        div.addEventListener('blur', function(e) {
            if (!div.innerText.trim() && input.placeholder) {
                div.innerText = input.placeholder;
                div.style.color = '#999';
                div.style.fontStyle = 'italic';
            }
            originalBlur && originalBlur(e);
        });

        // Add hover effect
        div.addEventListener('mouseenter', function() {
            div.style.borderColor = '#ff6f00';
        });
        div.addEventListener('mouseleave', function() {
            if (document.activeElement !== div) {  
                div.style.borderColor = window.getComputedStyle(input).borderColor;
            }
        });

        // Add focus effect
        div.addEventListener('focus', function() {
            div.style.borderColor = '#ff6f00';
            div.style.outline = 'none';
            div.style.boxShadow = '0 0 8px rgba(251, 110, 2, 0.5)';
        });
        div.addEventListener('blur', function() {
            div.style.boxShadow = '4px 4px #323232';
            div.style.borderColor = window.getComputedStyle(input).borderColor;
        });

        // Auto-scroll and overflow handling
        div.style.overflowY = 'auto';
        div.style.minHeight = input.clientHeight + 'px'; 

        // Auto-scroll to bottom when content grows (but not when first created)
        let isFirstInput = true;
        div.addEventListener('input', function() {
            if (!isFirstInput && div.scrollHeight > div.clientHeight) {
                div.scrollTop = div.scrollHeight;
            }
            isFirstInput = false;
        });

        // Preserve scroll position when content is modified in the middle
        let lastScrollTop = 0;
        div.addEventListener('keydown', function(e) {
            lastScrollTop = div.scrollTop;
        });

        div.addEventListener('keyup', function(e) {
            // Don't auto-scroll if user is editing in the middle
            if (div.scrollTop !== lastScrollTop) {
                div.scrollTop = lastScrollTop;
            }
        });
    
        //check grammar on input
        div.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => checkGrammar(div), 500);
        });
    
        return div;
    }

    // Function to make textarea element editable for grammar checker
    function makeTextAreaEditable2(input) {
        const div = document.createElement("div");
        div.contentEditable = true;
        div.innerText = input.value;
        div.dataset.originalInput = input.name; // Store original input name
        div.style.cssText = `
            margin: 10px 0;
            border-radius: 8px;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            resize: vertical;
            white-space: pre-wrap;
            overflow-wrap: break-word;
            overflow: auto;
            
            width: ${input.clientWidth}px;
            height: ${input.clientHeight}px;
            padding: ${window.getComputedStyle(input).padding};
            border: ${window.getComputedStyle(input).border};
            font-family: ${window.getComputedStyle(input).fontFamily};
            font-size: ${window.getComputedStyle(input).fontSize};
            line-height: ${window.getComputedStyle(input).lineHeight};
            background-color: ${window.getComputedStyle(input).backgroundColor};
        `;

        // Handle original display:none state
        if (window.getComputedStyle(input).display === 'none') {
            div.style.display = 'none';
        } else {
            div.style.display = 'block'; 
        }
    
        input.style.display = "none"; // Hide the original input
        input.dataset.originalDisplay = window.getComputedStyle(input).display;
        input.parentElement.insertBefore(div, input);
    
        // Add placeholder if empty
        if (!input.value && input.placeholder) {
            div.innerText = input.placeholder;
            div.style.color = '#999';
            div.style.fontStyle = 'italic';
        }
    
        // Clear placeholder on focus
        const originalFocus = div.onfocus;
        div.addEventListener('focus', function(e) {
            if (div.innerText === input.placeholder) {
                div.innerText = '';
                div.style.color = '';
                div.style.fontStyle = '';
            }
            originalFocus && originalFocus(e);
        });
    
        // Restore placeholder on blur if empty
        const originalBlur = div.onblur;
        div.addEventListener('blur', function(e) {
            if (!div.innerText.trim() && input.placeholder) {
                div.innerText = input.placeholder;
                div.style.color = '#999';
                div.style.fontStyle = 'italic';
            }
            originalBlur && originalBlur(e);
        });

        // Add hover effect
        div.addEventListener('mouseenter', function() {
            div.style.borderColor = '#ff6f00';
        });
        div.addEventListener('mouseleave', function() {
            if (document.activeElement !== div) {  
                div.style.borderColor = window.getComputedStyle(input).borderColor;
            }
        });

        // Add focus effect
        div.addEventListener('focus', function() {
            div.style.borderColor = '#ff6f00';
            div.style.outline = 'none';
            div.style.boxShadow = '0 0 8px rgba(251, 110, 2, 0.5)';
        });
        div.addEventListener('blur', function() {
            div.style.boxShadow = '4px 4px #323232';
            div.style.borderColor = window.getComputedStyle(input).borderColor;
        });

        // Auto-scroll and overflow handling
        div.style.overflowY = 'auto';
        div.style.minHeight = input.clientHeight + 'px'; 

        // Auto-scroll to bottom when content grows (but not when first created)
        let isFirstInput = true;
        div.addEventListener('input', function() {
            if (!isFirstInput && div.scrollHeight > div.clientHeight) {
                div.scrollTop = div.scrollHeight;
            }
            isFirstInput = false;
        });

        // Preserve scroll position when content is modified in the middle
        let lastScrollTop = 0;
        div.addEventListener('keydown', function(e) {
            lastScrollTop = div.scrollTop;
        });

        div.addEventListener('keyup', function(e) {
            // Don't auto-scroll if user is editing in the middle
            if (div.scrollTop !== lastScrollTop) {
                div.scrollTop = lastScrollTop;
            }
        });
    
        //check grammar on input
        div.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => checkGrammar(div), 500);
        });
    
        return div;
    }

    function makeInputEditable(input) {
        const div = document.createElement("div");
        div.contentEditable = true;
        div.innerText = input.value;
        div.dataset.originalInput = input.name;
        div.style.cssText = `
            margin: 10px 0;
            border-radius: 8px;
            box-shadow: 4px 4px rgb(0, 0, 0);
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            white-space: nowrap; /* Prevent wrapping */
            overflow: hidden; /* Hide overflow */
            
            width: ${input.clientWidth}px;
            height: ${input.clientHeight}px;
            padding: ${window.getComputedStyle(input).padding};
            border: ${window.getComputedStyle(input).border};
            font-family: ${window.getComputedStyle(input).fontFamily};
            font-size: ${window.getComputedStyle(input).fontSize};
            line-height: ${window.getComputedStyle(input).lineHeight};
            background-color: ${window.getComputedStyle(input).backgroundColor};
        `;

        // Prevent line breaks on paste
        div.addEventListener('paste', async (e) => {
            e.preventDefault();
            try {
                const text = (await navigator.clipboard.readText()).replace(/[\r\n]+/g, ' ');
                const selection = window.getSelection();
                if (selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    range.setStartAfter(range.endContainer);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } catch (err) {
                // Fallback for browsers that don't support Clipboard API
                const text = e.clipboardData.getData('text/plain').replace(/[\r\n]+/g, ' ');
                document.execCommand('insertText', false, text);
            }
        });
    
        // Prevent Enter key from creating new lines
        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                div.blur(); 
            }
        });

        // Add placeholder if empty
        if (!input.value && input.placeholder) {
            div.innerText = input.placeholder;
            div.style.color = '#999';
            div.style.fontStyle = 'italic';
        }
    
        // Clear placeholder on focus
        const originalFocus = div.onfocus;
        div.addEventListener('focus', function(e) {
            if (div.innerText === input.placeholder) {
                div.innerText = '';
                div.style.color = '';
                div.style.fontStyle = '';
            }
            originalFocus && originalFocus(e);
        });
    
        // Restore placeholder on blur if empty
        const originalBlur = div.onblur;
        div.addEventListener('blur', function(e) {
            if (!div.innerText.trim() && input.placeholder) {
                div.innerText = input.placeholder;
                div.style.color = '#999';
                div.style.fontStyle = 'italic';
            }
            originalBlur && originalBlur(e);
        });

        // Add hover effect
        div.addEventListener('mouseenter', function() {
            div.style.borderColor = '#ff6f00';
        });
        div.addEventListener('mouseleave', function() {
            if (document.activeElement !== div) {  
                div.style.borderColor = window.getComputedStyle(input).borderColor;
            }
        });

        // Add focus effect
        div.addEventListener('focus', function() {
            div.style.borderColor = '#ff6f00';
            div.style.outline = 'none';
            div.style.boxShadow = '0 0 8px rgba(251, 110, 2, 0.5)';
        });
        div.addEventListener('blur', function() {
            div.style.boxShadow = '4px 4px #323232';
            div.style.borderColor = window.getComputedStyle(input).borderColor;
        });
    
        input.style.display = "none";
        input.parentElement.insertBefore(div, input);
        div.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => checkGrammar(div), 500);
        });
    
        return div;
    }

    // Initialize the editable text areas
    document.querySelectorAll("textarea[name='text'], textarea[name='question']").forEach(input => {
        const editableDiv = makeTextAreaEditable(input);
        input.form.addEventListener("submit", function () {
            input.value = editableDiv.innerText; // Sync back the corrected text
        });
    });

    document.querySelectorAll("input[name='opt']").forEach(input => {
        const editableDiv = makeInputEditable(input);
        input.form.addEventListener("submit", function () {
            input.value = editableDiv.innerText; // Sync back the corrected text
        });
    });

    document.querySelectorAll("textarea[name='writing']").forEach(input => {
        const editableDiv = makeTextAreaEditable2(input);
        input.form.addEventListener("submit", function () {
            input.value = editableDiv.innerText; // Sync back the corrected text
        });
    });
});