window.AnimSHA = {
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
            card.style.padding = "10px";
            card.style.borderLeftColor = "#14b8a6"; // teal for SHA

            let htmlContent = `<span style="color:var(--text-secondary);"><i class="fa-solid fa-hashtag"></i> ` + steps[i].replace(/^\[\d+\]\s*/, '') + `</span>`;
            
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

        const encBytes = data.encrypted.substring(0, 32).match(/.{1,4}/g);
        for (let i = 0; i < Math.min(encBytes.length, 6); i++) {
            const spanOut = document.createElement("span");
            spanOut.innerHTML = encBytes[i];
            spanOut.style.fontSize = "0.7rem";
            spanOut.style.width = "auto";
            spanOut.style.padding = "0 8px";
            spanOut.style.borderColor = "#14b8a6";
            spanOut.style.color = "#14b8a6";
            spanOut.style.backgroundColor = "rgba(20, 184, 166, 0.2)";
            rowOut.appendChild(spanOut);
        }
        rowOut.innerHTML += '<span style="border:none;background:transparent;width:auto;">...</span>';
    }
};
