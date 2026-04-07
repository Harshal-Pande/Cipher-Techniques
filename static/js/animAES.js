window.AnimAES = {
    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;
        
        charStrip.innerHTML = '';
        
        // AES generates too much output to show character to character mapping securely.
        // We will just show a summary hex strip if possible.
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
        
        for (let i = 0; i < Math.min(input.length, 10); i++) {
            const spanIn = document.createElement("span");
            spanIn.innerHTML = input[i] === ' ' ? '&nbsp;' : input[i];
            rowIn.appendChild(spanIn);
        }
        if (input.length > 10) rowIn.innerHTML += "<span>...</span>";

        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;
            
            const card = document.createElement("div");
            card.className = "transform-card";
            card.style.display = "block";
            card.style.fontSize = "13px";
            card.style.padding = "10px";
            card.style.borderLeftColor = "#f59e0b"; // amber color for AES blocks

            let htmlContent = `<span style="color:var(--text-secondary);"><i class="fa-solid fa-cube"></i> ` + steps[i].replace(/^\[\d+\]\s*/, '') + `</span>`;
            
            // Highlight specific AES round operations
            if (steps[i].includes('SubBytes')) {
                htmlContent = htmlContent.replace('SubBytes', '<strong style="color:#ef4444;">SubBytes</strong>');
            } else if (steps[i].includes('ShiftRows')) {
                htmlContent = htmlContent.replace('ShiftRows', '<strong style="color:#3b82f6;">ShiftRows</strong>');
            } else if (steps[i].includes('MixColumns')) {
                htmlContent = htmlContent.replace('MixColumns', '<strong style="color:#10b981;">MixColumns</strong>');
            } else if (steps[i].includes('AddRoundKey')) {
                htmlContent = htmlContent.replace('AddRoundKey', '<strong style="color:#f59e0b;">AddRoundKey</strong>');
            }

            card.innerHTML = htmlContent;

            stepsOutput.appendChild(card);
            stepsOutput.scrollTop = stepsOutput.scrollHeight;
            
            if (window.getBaseDelay() > 0) await window.animDelay();
        }

        // Output hex
        const encBytes = data.encrypted.substring(0, 20).replace(/(.{2})/g, "$1 ").split(' ');
        for (let i = 0; i < Math.min(encBytes.length - 1, 8); i++) {
            const spanOut = document.createElement("span");
            spanOut.innerHTML = encBytes[i];
            spanOut.style.fontSize = "0.7rem";
            spanOut.style.width = "auto";
            spanOut.style.padding = "0 8px";
            rowOut.appendChild(spanOut);
        }
        if (encBytes.length > 8) rowOut.innerHTML += "<span>...</span>";
    }
};
