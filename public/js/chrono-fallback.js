// Simple fallback for chrono-node library
// This provides a minimal implementation when the full library isn't available

(function() {
    // Only create if chrono doesn't already exist
    if (typeof window.chrono === 'undefined') {
        console.log("Creating chrono fallback");
        
        // Create a simple parser that looks for common time expressions
        window.chrono = {
            parse: function(text) {
                const results = [];
                
                // Simple patterns for common time indicators
                const patterns = [
                    // Yesterday, today, tomorrow
                    { regex: /\b(yesterday|today|tomorrow)\b/gi, type: 'relative' },
                    // Next/last week/month/year
                    { regex: /\b(next|last)\s+(week|month|year)\b/gi, type: 'relative' },
                    // X days/weeks/months ago/from now
                    { regex: /\b(\d+)\s+(day|days|week|weeks|month|months|year|years)\s+(ago|from now)\b/gi, type: 'duration' },
                    // This morning/afternoon/evening
                    { regex: /\b(this)\s+(morning|afternoon|evening|night)\b/gi, type: 'relative' },
                    // Simple date formats
                    { regex: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, type: 'date' },
                    { regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?(,?\s+\d{4})?\b/gi, type: 'date' }
                ];
                
                // Find matches for each pattern
                patterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.regex.exec(text)) !== null) {
                        const matchText = match[0];
                        
                        // Create a simple result object similar to chrono's format
                        const result = {
                            text: matchText,
                            index: match.index,
                            start: {
                                date: function() {
                                    // Simple date determination
                                    const now = new Date();
                                    
                                    if (/yesterday/i.test(matchText)) {
                                        const yesterday = new Date(now);
                                        yesterday.setDate(now.getDate() - 1);
                                        return yesterday;
                                    } else if (/tomorrow/i.test(matchText)) {
                                        const tomorrow = new Date(now);
                                        tomorrow.setDate(now.getDate() + 1);
                                        return tomorrow;
                                    } else if (/last/i.test(matchText)) {
                                        const past = new Date(now);
                                        if (/week/i.test(matchText)) past.setDate(now.getDate() - 7);
                                        else if (/month/i.test(matchText)) past.setMonth(now.getMonth() - 1);
                                        else if (/year/i.test(matchText)) past.setFullYear(now.getFullYear() - 1);
                                        return past;
                                    } else if (/next/i.test(matchText)) {
                                        const future = new Date(now);
                                        if (/week/i.test(matchText)) future.setDate(now.getDate() + 7);
                                        else if (/month/i.test(matchText)) future.setMonth(now.getMonth() + 1);
                                        else if (/year/i.test(matchText)) future.setFullYear(now.getFullYear() + 1);
                                        return future;
                                    } else if (/ago/i.test(matchText)) {
                                        const past = new Date(now);
                                        const amount = parseInt(matchText.match(/\d+/)[0]);
                                        if (/day/i.test(matchText)) past.setDate(now.getDate() - amount);
                                        else if (/week/i.test(matchText)) past.setDate(now.getDate() - (amount * 7));
                                        else if (/month/i.test(matchText)) past.setMonth(now.getMonth() - amount);
                                        else if (/year/i.test(matchText)) past.setFullYear(now.getFullYear() - amount);
                                        return past;
                                    } else if (/from now/i.test(matchText)) {
                                        const future = new Date(now);
                                        const amount = parseInt(matchText.match(/\d+/)[0]);
                                        if (/day/i.test(matchText)) future.setDate(now.getDate() + amount);
                                        else if (/week/i.test(matchText)) future.setDate(now.getDate() + (amount * 7));
                                        else if (/month/i.test(matchText)) future.setMonth(now.getMonth() + amount);
                                        else if (/year/i.test(matchText)) future.setFullYear(now.getFullYear() + amount);
                                        return future;
                                    }
                                    
                                    // Default to current date
                                    return now;
                                }
                            }
                        };
                        
                        results.push(result);
                    }
                });
                
                return results;
            }
        };
    }
})();
