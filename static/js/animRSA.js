window.AnimRSA = {
    execute: async function(input, data, stepsOutput, charStrip) {
        const steps = data.steps;
        if (!steps || steps.length === 0) return;
        
        charStrip.innerHTML = '';
        
        for (let i = 0; i < steps.length; i++) {
            if (!steps[i]) continue;
            
            const card = document.createElement("div");
            card.className = "transform-card";
            card.style.display = "block";
            card.style.fontSize = "13px";
            card.style.padding = "12px";
            card.style.borderLeftColor = "#8b5cf6"; // purple for RSA

            let htmlContent = steps[i];
            
            // Highlight specific RSA terms
            if (htmlContent.includes('Prime p :')) {
                htmlContent = htmlContent.replace('Prime p :', '<strong style="color:#d946ef;"><i class="fa-solid fa-key"></i> Prime p :</strong>');
            } else if (htmlContent.includes('Prime q :')) {
                htmlContent = htmlContent.replace('Prime q :', '<strong style="color:#d946ef;"><i class="fa-solid fa-key"></i> Prime q :</strong>');
            } else if (htmlContent.includes('Modulus n :')) {
                htmlContent = htmlContent.replace('Modulus n :', '<strong style="color:#ec4899;"><i class="fa-solid fa-circle-nodes"></i> Modulus (n) :</strong>');
            } else if (htmlContent.includes('Public Key e :')) {
                htmlContent = htmlContent.replace('Public Key e :', '<strong style="color:#10b981;"><i class="fa-solid fa-lock-open"></i> Public Key (e) :</strong>');
            } else if (htmlContent.includes('Private Key d :')) {
                htmlContent = htmlContent.replace('Private Key d :', '<strong style="color:#ef4444;"><i class="fa-solid fa-user-lock"></i> Private Key (d) :</strong>');
            } else {
                htmlContent = `<span style="color:var(--text-secondary);"><i class="fa-solid fa-square-root-variable"></i> ${steps[i]}</span>`;
            }

            card.innerHTML = htmlContent;

            stepsOutput.appendChild(card);
            stepsOutput.scrollTop = stepsOutput.scrollHeight;
            
            if (window.getBaseDelay() > 0) await window.animDelay();
        }

        // Output formatting
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

        const spanOut = document.createElement("span");
        spanOut.innerHTML = "RSA INT DATA";
        spanOut.style.width = "auto";
        spanOut.style.padding = "0 15px";
        spanOut.style.borderColor = "#8b5cf6";
        spanOut.style.color = "#8b5cf6";
        spanOut.style.backgroundColor = "rgba(139, 92, 246, 0.2)";
        rowOut.appendChild(spanOut);
    }
};
