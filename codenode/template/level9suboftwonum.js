export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
    output.style.backgroundColor = '#0b1120';
    output.style.color = '#fff';
    output.style.padding = '20px';
    output.style.fontFamily = 'monospace';

    output.innerHTML = '<span style="color: #f59e0b">--- Execution Steps ---</span><br><br>';
    validationResult.innerHTML = '';
    validationResult.className = 'validation-result';

    const wsBlocks = dropzone.querySelectorAll('.workspace-block');

    if (wsBlocks.length === 0) {
        output.innerHTML += '<span style="color: #ef4444">❌ No blocks in workspace</span>';
        validationResult.textContent = 'Add blocks to run the program';
        validationResult.classList.add('validation-error');
        return 0;
    }

    const structure = Array.from(wsBlocks).map(b => b.dataset.type);
    const expected = levelConfig.expectedStructure;

    const isStructureValid = structure.length === expected.length &&
        structure.every((type, i) => {
            if (expected[i] === 'variable' && type === 'variable') return true;
            return type === expected[i];
        });

    if (!isStructureValid) {
        output.innerHTML += `<span style="color: #ef4444">❌ Invalid structure</span><br>
        <span style="color: #94a3b8">Expected: ${expected.join(' → ')}</span>`;
        validationResult.textContent = 'Wrong block order';
        validationResult.classList.add('validation-error');
        return 0;
    }

    let variables = { a: null, b: null, c: null };
    let finalOutput = null;

    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;

        // ✅ FIXED LABEL EXTRACTION
        const spans = block.querySelectorAll('span');
        const label = spans[spans.length - 1].textContent.trim();

        output.innerHTML += `<span style="color: #f59e0b">Step ${index + 1}: ${type}</span><br>`;

        if (type === 'start') {
            output.innerHTML += `🚀 Program initialized...<br><br>`;
        }

        if (type === 'variable') {
            const match = label.match(/([a-zA-Z])\s*=\s*(\d+)/);
            if (match) {
                const varName = match[1];
                const varValue = parseInt(match[2]);
                variables[varName] = varValue;

                output.innerHTML += `📦 ${varName} = ${varValue}<br><br>`;
            }
        }

        if (type === 'operation') {
            if (variables.a !== null && variables.b !== null) {
                // ✅ SUBTRACTION
                variables.c = variables.a - variables.b;

                output.innerHTML += `🧮 c = ${variables.a} - ${variables.b} = ${variables.c}<br><br>`;
            } else {
                output.innerHTML += `⚠️ Error: Variables not defined<br><br>`;
            }
        }

        if (type === 'print') {
            finalOutput = variables.c;
            output.innerHTML += `💬 Printed: ${finalOutput}<br><br>`;
        }
    });

    // ✅ EXPECTED OUTPUT (2 - 3 = -1)
    if (finalOutput === -1) {
        output.innerHTML += '✅ Program executed successfully!';
        validationResult.textContent = 'Success! Output: -1';
        validationResult.style.color = "#22c55e";
        return 1;
    } else {
        output.innerHTML += '❌ Incorrect output';
        validationResult.textContent = 'Expected output: -1';
        validationResult.style.color = "#ef4444";
        return 0;
    }
}