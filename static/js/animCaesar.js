window.AnimCaesar = {
    parseStep: function(step) {
        // Matches Encryption: [1] 'H' → pos 7 + shift 3 = pos 10 → 'K'
        // Matches Decryption: [1] 'K' → pos 10 - shift 3 = pos 7 → 'H'
        const mathMatch = step.match(/'(.+?)' → pos (\d+) ([+-]) shift (\d+) = pos (\d+) → '(.+?)'/);
        if (mathMatch) {
            return {
                type: 'math',
                from: mathMatch[1],
                origPos: mathMatch[2],
                op: mathMatch[3],
                shift: mathMatch[4],
                newPos: mathMatch[5],
                to: mathMatch[6]
            };
        }
        
        // Matches Non-alphabetic: [1] ' ' → non-alphabetic, kept as-is
        // or: [1] ' ' → kept as-is
        const keepMatch = step.match(/'(.+?)' → .*kept as-is/);
        if (keepMatch) {
            return {
                type: 'keep',
                char: keepMatch[1]
            };
        }
        return null; // For standard text output lines
    },

    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;
        
        charStrip.innerHTML = '';
        const rowIn = document.createElement("div");
        rowIn.className = "row";
        const arrowDiv = document.createElement("div");
        arrowDiv.style.fontSize = "24px";
        arrowDiv.style.color = "var(--border-color)";
        arrowDiv.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
        const rowOut = document.createElement("div");
        rowOut.className = "row";
        rowOut.style.marginBottom = "20px";
        
        charStrip.appendChild(rowIn);
        charStrip.appendChild(arrowDiv);
        charStrip.appendChild(rowOut);

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;
            
            const parsed = this.parseStep(steps[i]);
            const card = document.createElement("div");
            card.className = "transform-card";

            if (parsed && parsed.type === 'math') {
                // Highly detailed math animations
                card.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <span style="font-size:0.7rem; color:var(--text-secondary);">Index</span>
                        <div class="char">${parsed.from}</div>
                        <span style="font-size:0.85rem; font-weight:bold; color:var(--accent);">${parsed.origPos}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <span style="font-size:0.7rem; color:var(--text-secondary);">Shift Op</span>
                        <div style="font-weight:bold; font-size: 1.2rem; background:rgba(0,0,0,0.2); padding:5px 15px; border-radius:5px; border: 1px dashed var(--border-color);">
                            ${parsed.origPos} <span style="color:${parsed.op === '+' ? 'var(--success)' : 'var(--error)'}">${parsed.op}</span> ${parsed.shift}
                        </div>
                        <i class="fa-solid fa-arrow-right arrow" style="font-size:16px;"></i>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                        <span style="font-size:0.7rem; color:var(--text-secondary);">Result</span>
                        <div class="char result" style="background:var(--success);">${parsed.to}</div>
                        <span style="font-size:0.85rem; font-weight:bold; color:var(--success); border-bottom: 2px solid var(--success); padding-bottom: 2px;">${parsed.newPos}</span>
                    </div>
                `;
                
                // Add to char strip dynamically
                const spanIn = document.createElement("span");
                spanIn.innerHTML = parsed.from === ' ' ? '&nbsp;' : parsed.from;
                rowIn.appendChild(spanIn);
                
                const spanOut = document.createElement("span");
                spanOut.innerHTML = parsed.to === ' ' ? '&nbsp;' : parsed.to;
                rowOut.appendChild(spanOut);
                
            } else if (parsed && parsed.type === 'keep') {
                card.innerHTML = `
                    <div class="char" style="background:transparent; border:1px solid var(--border-color);">${parsed.char === ' ' ? '&nbsp;' : parsed.char}</div>
                    <div class="arrow" style="color:var(--text-secondary);">→ <span style="font-size:0.7rem;">(Skip)</span> →</div>
                    <div class="char" style="background:transparent; border:1px solid var(--border-color);">${parsed.char === ' ' ? '&nbsp;' : parsed.char}</div>
                `;
                
                const spanIn = document.createElement("span");
                spanIn.innerHTML = parsed.char === ' ' ? '&nbsp;' : parsed.char;
                rowIn.appendChild(spanIn);
                
                const spanOut = document.createElement("span");
                spanOut.innerHTML = parsed.char === ' ' ? '&nbsp;' : parsed.char;
                rowOut.appendChild(spanOut);

            } else {
                card.style.display = "block";
                card.style.fontSize = "14px";
                card.style.lineHeight = "1.4";
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
                // To show proper numbering additions, add a micro-delay inside the card before showing the result
                const ops = card.querySelectorAll("div > div");
                if (ops.length >= 3) {
                    ops[1].style.opacity = "0";
                    ops[2].parentElement.style.opacity = "0";
                    setTimeout(() => { ops[1].style.opacity = "1"; ops[1].style.transition = "opacity 0.2s"; }, window.getBaseDelay() * 0.3);
                    setTimeout(() => { ops[2].parentElement.style.opacity = "1"; ops[2].parentElement.style.transition = "opacity 0.3s"; }, window.getBaseDelay() * 0.6);
                }
                await window.animDelay();
            }
        }
    }
};
