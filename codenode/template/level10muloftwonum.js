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
        output.innerHTML += '<span style="color: #f59e0b">❌ No blocks in workspace</span>';
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
        output.innerHTML += `❌ Invalid structure<br>Expected: ${expected.join(' → ')}`;
        validationResult.textContent = 'Wrong block order';
        validationResult.classList.add('validation-error');
        return 0;
    }

    let variables = { a: null, b: null, c: null };
    let finalOutput = null;

    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;

        // ✅ FIXED LABEL
        const spans = block.querySelectorAll('span');
        const label = spans[spans.length - 1].textContent.trim();

        output.innerHTML += `Step ${index + 1}: ${type}<br>`;

        if (type === 'start') {
            output.innerHTML += `🚀 Program initialized...<br><br>`;
        }

        if (type === 'variable') {
            const match = label.match(/([a-zA-Z])\s*=\s*(\d+)/);
            if (match) {
                variables[match[1]] = parseInt(match[2]);
                output.innerHTML += `📦 ${match[1]} = ${match[2]}<br><br>`;
            }
        }

        if (type === 'operation') {
            if (variables.a !== null && variables.b !== null) {
                // ✅ MULTIPLICATION
                variables.c = variables.a * variables.b;
                output.innerHTML += `🧮 c = ${variables.a} * ${variables.b} = ${variables.c}<br><br>`;
            } else {
                output.innerHTML += `⚠️ Error: Variables not defined<br><br>`;
            }
        }

        if (type === 'print') {
            finalOutput = variables.c;
            output.innerHTML += `💬 Printed: ${finalOutput}<br><br>`;
        }
    });

    // ✅ 2 * 3 = 6
    if (finalOutput === 6) {
        output.innerHTML += '✅ Program executed successfully!';
        validationResult.textContent = 'Success! Output: 6';
        validationResult.style.color = "#22c55e";
        return 1;
    } else {
        output.innerHTML += '❌ Incorrect output';
        validationResult.textContent = 'Expected output: 6';
        validationResult.style.color = "#ef4444";
        return 0;
    }
}