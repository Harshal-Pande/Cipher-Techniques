window.AnimVigenere = {
    parseStep: function(step) {
        // Encyption format: "  [1  ] H        S        18       Z"
        // Decryption format: "  [1] 'Z' - key 'S'(18) → pos 7 → 'H'"
        
        const decMatch = step.match(/'(.+?)' - key '(.+?)'\((\d+)\) → pos (\d+) → '(.+?)'/);
        if (decMatch) {
            return {
                type: 'math',
                op: '-',
                from: decMatch[1],
                key: decMatch[2],
                kval: parseInt(decMatch[3]),
                newPos: parseInt(decMatch[4]),
                to: decMatch[5]
            };
        }

        const keepMatch = step.match(/'(.+?)' → .*kept as-is/);
        if (keepMatch) {
            return { type: 'keep', char: keepMatch[1] };
        }

        // Parse custom table row for encryption: "  [1  ] H        S        18       Z"
        const encMatch = step.match(/\[\d+\s*\]\s+(\S)\s+(\S)\s+(\d+)\s+(\S)$/);
        if (encMatch && encMatch[2] !== '—') {
            return {
                type: 'math',
                op: '+',
                from: encMatch[1],
                key: encMatch[2],
                kval: parseInt(encMatch[3]),
                to: encMatch[4]
            };
        }
        
        // Match dashed non-alpha row: "[2]   —   —   "
        const encDashMatch = step.match(/\[\d+\s*\]\s+(\S)\s+—\s+—\s+(\S)$/);
        if (encDashMatch) {
            return { type: 'keep', char: encDashMatch[1] };
        }

        return null;
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;
        
        charStrip.innerHTML = '';
        const rowIn = document.createElement("div");
        rowIn.className = "row";
        const rowKey = document.createElement("div");
        rowKey.className = "row";
        rowKey.style.fontSize = "0.7rem";
        rowKey.style.color = "var(--text-secondary)";
        const arrowDiv = document.createElement("div");
        arrowDiv.style.fontSize = "24px";
        arrowDiv.style.color = "var(--border-color)";
        arrowDiv.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
        const rowOut = document.createElement("div");
        rowOut.className = "row";
        rowOut.style.marginBottom = "20px";
        
        charStrip.appendChild(rowIn);
        charStrip.appendChild(rowKey);
        charStrip.appendChild(arrowDiv);
        charStrip.appendChild(rowOut);

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;
            
            const parsed = this.parseStep(steps[i]);
            const card = document.createElement("div");
            card.className = "transform-card";

            let activeSpans = [];

            if (parsed && parsed.type === 'math') {
                const isUpper = parsed.from === parsed.from.toUpperCase();
                const base = isUpper ? 65 : 97;
                let origIdx = parsed.from.charCodeAt(0) - base;
                
                // Detailed Math Card
                card.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <span style="font-size:0.7rem; color:var(--text-secondary);">Input(${origIdx})</span>
                        <div class="char">${parsed.from}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <span style="font-size:0.7rem; color:var(--text-secondary);">Poly Shift</span>
                        <div style="font-weight:bold; font-size: 1rem; background:rgba(0,0,0,0.2); padding:5px 10px; border-radius:5px; border: 1px dashed var(--border-color); display:flex; align-items:center; gap:8px;">
                            ${origIdx} 
                            <span style="color:${parsed.op === '+' ? 'var(--success)' : 'var(--error)'}">${parsed.op}</span> 
                            <div class="char" style="padding:2px 8px; border-radius:4px; font-size:0.8rem; background:rgba(255,255,255,0.1); border:1px solid var(--accent); color:var(--accent);">Key ${parsed.key} (${parsed.kval})</div>
                        </div>
                        <i class="fa-solid fa-arrow-right arrow" style="font-size:16px;"></i>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <span style="font-size:0.7rem; color:var(--text-secondary);">Output</span>
                        <div class="char result" style="background:var(--success); color:#fff; box-shadow: 0 0 10px rgba(16,185,129,0.5);">${parsed.to}</div>
                        <span style="font-size:0.85rem; font-weight:bold; color:var(--success); border-bottom: 2px solid var(--success); padding-bottom: 2px;">${parsed.newPos !== undefined ? parsed.newPos : (parsed.op==='+' ? (origIdx + parsed.kval)%26 : '')}</span>
                    </div>
                `;
                
                const spanIn = document.createElement("span");
                spanIn.innerHTML = parsed.from === ' ' ? '&nbsp;' : parsed.from;
                spanIn.classList.add("char-active");
                rowIn.appendChild(spanIn);
                
                const spanKey = document.createElement("span");
                spanKey.style.background = "transparent";
                spanKey.style.border = "none";
                spanKey.style.height = "auto";
                spanKey.innerText = `+${parsed.key}`;
                spanKey.classList.add("char-active");
                rowKey.appendChild(spanKey);

                const spanOut = document.createElement("span");
                spanOut.innerHTML = parsed.to === ' ' ? '&nbsp;' : parsed.to;
                spanOut.classList.add("char-active");
                rowOut.appendChild(spanOut);

                activeSpans.push(spanIn, spanOut, spanKey);
                
            } else if (parsed && parsed.type === 'keep') {
                card.innerHTML = `
                    <div class="char" style="background:transparent; border:1px solid var(--border-color);">${parsed.char === ' ' ? '&nbsp;' : parsed.char}</div>
                    <div class="arrow" style="color:var(--text-secondary);">→ <span style="font-size:0.7rem;">(Skip)</span> →</div>
                    <div class="char" style="background:transparent; border:1px solid var(--border-color);">${parsed.char === ' ' ? '&nbsp;' : parsed.char}</div>
                `;
                
                const spanIn = document.createElement("span");
                spanIn.innerHTML = parsed.char === ' ' ? '&nbsp;' : parsed.char;
                spanIn.classList.add("char-active");
                rowIn.appendChild(spanIn);
                
                const spanKey = document.createElement("span");
                spanKey.style.background = "transparent";
                spanKey.style.border = "none";
                spanKey.style.height = "auto";
                spanKey.innerText = `-`;
                spanKey.classList.add("char-active");
                rowKey.appendChild(spanKey);

                const spanOut = document.createElement("span");
                spanOut.innerHTML = parsed.char === ' ' ? '&nbsp;' : parsed.char;
                spanOut.classList.add("char-active");
                rowOut.appendChild(spanOut);

                activeSpans.push(spanIn, spanOut, spanKey);

            } else {
                card.style.display = "block";
                card.style.fontSize = "14px";
                card.style.padding = "15px";
                const cleanStr = steps[i].replace(/^\[\d+\]\s*/, '');
                card.innerHTML = `<span style="color:var(--text-secondary);">${cleanStr}</span>`;
            }

            // Apply entry animation
            card.style.opacity = "0";
            card.style.transform = "translateY(10px)";
            card.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

            stepsOutput.appendChild(card);
            stepsOutput.scrollTop = stepsOutput.scrollHeight;
            
            // Trigger animation
            requestAnimationFrame(() => {
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            });

            if (window.getBaseDelay() > 0) {
                const cols = card.children; // the top-level columns
                if (cols.length >= 3) {
                    cols[1].style.opacity = "0";
                    cols[2].style.opacity = "0";
                    
                    // Show middle operation block
                    setTimeout(() => { cols[1].style.opacity = "1"; cols[1].style.transition = "opacity 0.2s"; }, window.getBaseDelay() * 0.3);
                    
                    if (window.quizEngine && window.quizEngine.enabled && parsed && parsed.type === 'math') {
                        // Wait a tiny bit for UI update, then trigger quiz
                        await window.animDelay();
                        await window.quizEngine.askVigenereQuestion(parsed, card);
                        // Once answered, reveal the last column
                        cols[2].style.opacity = "1";
                        cols[2].style.transition = "opacity 0.3s";
                    } else {
                        // Normal play mode
                        setTimeout(() => { cols[2].style.opacity = "1"; cols[2].style.transition = "opacity 0.3s"; }, window.getBaseDelay() * 0.6);
                        await window.animDelay();
                    }
                } else {
                    await window.animDelay();
                }
            }
            
            activeSpans.forEach(sp => sp.classList.remove("char-active"));
        }
    }
};
