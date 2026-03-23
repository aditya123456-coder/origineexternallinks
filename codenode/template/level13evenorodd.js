export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
    output.innerHTML = '';
    validationResult.innerHTML = '';
    validationResult.className = 'validation-result';

    const wsBlocks = Array.from(dropzone.querySelectorAll('.workspace-block'));

    if (wsBlocks.length === 0) {
        output.innerHTML = '<span class="error">❌ No blocks in workspace</span>';
        validationResult.textContent = 'Please add blocks to the workspace first';
        validationResult.classList.add('validation-error');
        return 0;
    }

    let hasError = false;
    let variables = {};
    let executedIfs = new Set();
    let finalOutput = "";

    output.innerHTML += '<span class="warning">--- Execution Steps ---</span><br><br>';

    // -------- STRUCTURE CHECK --------
    const types = Array.from(wsBlocks).map(b => b.dataset.type);

    if (types[0] !== 'start') {
        output.innerHTML += '❌ First block must be START<br><br>';
        hasError = true;
    }

    if (!types.includes('variable')) {
        output.innerHTML += '❌ Missing variable block<br><br>';
        hasError = true;
    }

    // -------- EXECUTION --------
    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;
        const value = block.dataset.value;

        output.innerHTML += `<span class="warning">Step ${index + 1}:</span> ${type}<br>`;

        // START
        if (type === 'start') {
            output.innerHTML += '🚀 Program started<br>';
        }

        // VARIABLE
        else if (type === 'variable') {
            variables['a'] = Number(value);
            output.innerHTML += `📦 Variable a = ${variables['a']}<br>`;
        }

        // IF BLOCK
        else if (type === 'if') {
            const condition = value;
            let conditionResult = false;

            try {
                // Evaluate condition dynamically
                const a = variables['a'];
                conditionResult = eval(condition);
            } catch (e) {
                output.innerHTML += `❌ Invalid condition: ${condition}<br>`;
                hasError = true;
            }

            output.innerHTML += `🔍 Checking (${condition}) → ${conditionResult}<br>`;

            if (conditionResult) {
                executedIfs.add(condition);

                const nested = block.querySelectorAll('.nested-block');

                nested.forEach(n => {
                    if (n.dataset.type === 'print') {
                        const val = n.dataset.value;
                        output.innerHTML += `📢 Output: <span class="success">"${val}"</span><br>`;
                        finalOutput = val;
                    }
                });
            }
        }

        output.innerHTML += '<br>';
    });

    // -------- VALIDATION --------

    const expectedConditions = ['a==0', 'a<0', 'a>0'];

    if (executedIfs.size === 0) {
        output.innerHTML += '❌ No IF condition executed<br>';
        hasError = true;
    }

    if (!expectedConditions.every(cond =>
        wsBlocks.some(b => b.dataset.value === cond)
    )) {
        output.innerHTML += '❌ All 3 IF blocks must be present<br>';
        hasError = true;
    }

    // Expected output for a = 10
    const expectedOutput = "a is positive";

    if (!hasError && finalOutput === expectedOutput) {
        output.innerHTML += '<span class="success">✅ Correct Execution!</span><br>';
        validationResult.textContent = 'Success! a is positive';
        validationResult.classList.add('validation-success');
        return 1;
    } else {
        output.innerHTML += '<span class="error">❌ Execution failed</span><br>';
        validationResult.textContent = 'Check IF blocks and logic';
        validationResult.classList.add('validation-error');
        return 0;
    }
}