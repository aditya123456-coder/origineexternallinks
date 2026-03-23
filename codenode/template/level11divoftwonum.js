export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {

    // 🎨 TERMINAL UI
    output.style.background = "#020617";
    output.style.color = "#e2e8f0";
    output.style.padding = "20px";
    output.style.fontFamily = "monospace";
    output.style.borderRadius = "10px";
    output.style.lineHeight = "1.6";

    output.innerHTML = `<span style="color:#facc15">--- Execution Steps ---</span><br><br>`;
    validationResult.innerHTML = "";

    const wsBlocks = Array.from(dropzone.querySelectorAll(".workspace-block"));

    if (wsBlocks.length === 0) {
        output.innerHTML += `<span style="color:#ef4444">❌ No blocks in workspace</span>`;
        return 0;
    }

    const structure = wsBlocks.map(b => b.dataset.type);

    // ✅ STRICT STRUCTURE CHECK
    const expected = ['start', 'variable', 'variable', 'operation', 'print'];

    const isExactMatch =
        structure.length === expected.length &&
        structure.every((type, i) => type === expected[i]);

    if (!isExactMatch) {
        output.innerHTML += `
        <span style="color:#ef4444">❌ Invalid structure</span><br>
        <span style="color:#94a3b8">Correct order:</span><br>
        <span style="color:#22c55e">start → variable → variable → operation → print</span>
        `;
        validationResult.textContent = "Wrong block order";
        validationResult.style.color = "#ef4444";
        return 0;
    }

    // 🚀 EXECUTION
    let variables = { a: null, b: null, c: null };
    let finalOutput = null;

    for (let i = 0; i < wsBlocks.length; i++) {
        const block = wsBlocks[i];
        const type = block.dataset.type;

        const spans = block.querySelectorAll("span");
        const label = spans[spans.length - 1].textContent.trim();

        output.innerHTML += `<span style="color:#facc15">Step ${i + 1}:</span> <span style="color:#cbd5f5">${type}</span><br>`;

        // START
        if (type === "start") {
            output.innerHTML += `🚀 Program initialized...<br><br>`;
        }

        // VARIABLE
        if (type === "variable") {
            const match = label.match(/([a-zA-Z])\s*=\s*(\d+)/);
            if (match) {
                variables[match[1]] = parseInt(match[2]);
                output.innerHTML += `📦 Variable set: <span style="color:#22c55e">${match[1]} = ${match[2]}</span><br><br>`;
            }
        }

        // OPERATION (AUTO DETECT)
        if (type === "operation") {

            if (variables.a === null || variables.b === null) {
                output.innerHTML += `⚠️ <span style="color:#ef4444">Variables not defined</span><br><br>`;
                return 0;
            }

            if (label.includes("+")) {
                variables.c = variables.a + variables.b;
            } else if (label.includes("-")) {
                variables.c = variables.a - variables.b;
            } else if (label.includes("*")) {
                variables.c = variables.a * variables.b;
            } else if (label.includes("/")) {
                variables.c = Math.floor(variables.a / variables.b);
            }

            output.innerHTML += `🧮 Operation: <span style="color:#22c55e">c = ${variables.a} ${label.includes('+') ? '+' : label.includes('-') ? '-' : label.includes('*') ? '*' : '/'} ${variables.b} = ${variables.c}</span><br><br>`;
        }

        // PRINT
        if (type === "print") {
            finalOutput = variables.c;

            if (finalOutput === null) {
                output.innerHTML += `⚠️ <span style="color:#ef4444">Nothing to print</span><br><br>`;
                return 0;
            }

            output.innerHTML += `📢 Output: <span style="color:#22c55e">"${finalOutput}"</span><br><br>`;
        }
    }

    // ✅ FINAL SUCCESS
    output.innerHTML += `<span style="color:#22c55e">✔️ Program executed perfectly!</span>`;
    validationResult.textContent = "Success!";
    validationResult.style.color = "#22c55e";

    return 1;
}