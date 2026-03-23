export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {

    // ✅ TERMINAL STYLE UI
    output.style.background = "linear-gradient(to right, #020617, #020617)";
    output.style.color = "#e2e8f0";
    output.style.padding = "20px";
    output.style.fontFamily = "monospace";
    output.style.borderRadius = "10px";
    output.style.lineHeight = "1.6";

    output.innerHTML = `<span style="color:#facc15">--- Execution Steps ---</span><br><br>`;
    validationResult.innerHTML = "";
    validationResult.className = "validation-result";

    const wsBlocks = dropzone.querySelectorAll(".workspace-block");

    if (wsBlocks.length === 0) {
        output.innerHTML += `<span style="color:#ef4444">❌ No blocks in workspace</span>`;
        return 0;
    }

    let variables = { a: null, b: null, c: null };
    let finalOutput = null;

    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;

        // ✅ FIX LABEL
        const spans = block.querySelectorAll("span");
        const label = spans[spans.length - 1].textContent.trim();

        // STEP TITLE
        output.innerHTML += `<span style="color:#facc15">Step ${index + 1}:</span> <span style="color:#cbd5f5">${type}</span><br>`;

        // START
        if (type === "start") {
            output.innerHTML += `🚀 <span style="color:#e2e8f0">Program initialized...</span><br><br>`;
        }

        // VARIABLE
        if (type === "variable") {
            const match = label.match(/([a-zA-Z])\s*=\s*(\d+)/);
            if (match) {
                const varName = match[1];
                const varValue = parseInt(match[2]);

                variables[varName] = varValue;

                output.innerHTML += `📦 <span style="color:#e2e8f0">Variable set:</span> <span style="color:#22c55e">${varName} = ${varValue}</span><br><br>`;
            }
        }

        // OPERATION (AUTO DETECT 🔥)
        if (type === "operation") {
            if (variables.a !== null && variables.b !== null) {

                if (label.includes("+")) {
                    variables.c = variables.a + variables.b;
                    output.innerHTML += `🧮 <span style="color:#e2e8f0">Operation:</span> <span style="color:#22c55e">c = ${variables.a} + ${variables.b} = ${variables.c}</span><br><br>`;
                }

                else if (label.includes("-")) {
                    variables.c = variables.a - variables.b;
                    output.innerHTML += `🧮 <span style="color:#e2e8f0">Operation:</span> <span style="color:#22c55e">c = ${variables.a} - ${variables.b} = ${variables.c}</span><br><br>`;
                }

                else if (label.includes("*")) {
                    variables.c = variables.a * variables.b;
                    output.innerHTML += `🧮 <span style="color:#e2e8f0">Operation:</span> <span style="color:#22c55e">c = ${variables.a} * ${variables.b} = ${variables.c}</span><br><br>`;
                }

                else if (label.includes("/")) {
                    variables.c = Math.floor(variables.a / variables.b);
                    output.innerHTML += `🧮 <span style="color:#e2e8f0">Operation:</span> <span style="color:#22c55e">c = ${variables.a} / ${variables.b} = ${variables.c}</span><br><br>`;
                }

            } else {
                output.innerHTML += `⚠️ <span style="color:#ef4444">Error: Variables not defined</span><br><br>`;
            }
        }

        // PRINT
        if (type === "print") {
            finalOutput = variables.c !== null ? variables.c : label;

            output.innerHTML += `📢 <span style="color:#e2e8f0">Output:</span> <span style="color:#22c55e">"${finalOutput}"</span><br><br>`;
        }

    });

    // ✅ FINAL SUCCESS STYLE (LIKE YOUR IMAGE)
    if (finalOutput !== null) {
        output.innerHTML += `<span style="color:#22c55e">✔️ Program executed perfectly!</span>`;
        return 1;
    } else {
        output.innerHTML += `<span style="color:#ef4444">❌ Execution failed</span>`;
        return 0;
    }
}
