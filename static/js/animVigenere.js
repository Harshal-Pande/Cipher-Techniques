window.AnimVigenere = {
    parseStep: function(step) {
        // Vigenere usually logs: [1] 'H' + key 'S' (pos 7 + 18 = 25) -> 'Z'
        const match = step.match(/'(.+?)'.*?(?:→|->|to).*?'(.+?)'$/);
        if (!match) return null;
        
        let keyChar = null;
        const keyMatch = step.match(/key\s*'(.+?)'/);
        if (keyMatch) keyChar = keyMatch[1];
        
        return { from: match[1], to: match[2], key: keyChar };
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

            if (parsed) {
                // Vigenere Specific Card
                card.innerHTML = `
                    <div class="char">${parsed.from}</div>
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">Key: ${parsed.key || '?'}</span>
                        <div class="arrow">↓</div>
                    </div>
                    <div class="char result">${parsed.to}</div>
                `;
                
                // Add to char strip dynamically
                const spanIn = document.createElement("span");
                spanIn.innerHTML = parsed.from === ' ' ? '&nbsp;' : parsed.from;
                rowIn.appendChild(spanIn);
                
                if (parsed.key) {
                    const spanKey = document.createElement("span");
                    spanKey.style.background = "transparent";
                    spanKey.style.border = "none";
                    spanKey.style.height = "auto";
                    spanKey.innerText = `+${parsed.key}`;
                    rowKey.appendChild(spanKey);
                }
                
                const spanOut = document.createElement("span");
                spanOut.innerHTML = parsed.to === ' ' ? '&nbsp;' : parsed.to;
                rowOut.appendChild(spanOut);
                
            } else {
                card.style.display = "block";
                card.style.fontSize = "14px";
                card.style.padding = "15px";
                const cleanStr = steps[i].replace(/^\[\d+\]\s*/, '');
                card.innerHTML = `<span style="color:var(--text-secondary);">${cleanStr}</span>`;
            }

            stepsOutput.appendChild(card);
            stepsOutput.scrollTop = stepsOutput.scrollHeight;
            
            if (window.getBaseDelay() > 0) await window.animDelay();
        }
    }
};
