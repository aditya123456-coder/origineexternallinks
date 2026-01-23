export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
    output.innerHTML = '';
    validationResult.innerHTML = '';
    validationResult.className = 'validation-result';

    const wsBlocks = dropzone.querySelectorAll('.workspace-block');

    if (wsBlocks.length === 0) {
        output.innerHTML = '<span class="error">❌ No blocks in workspace</span>';
        validationResult.textContent = 'Please add blocks to the workspace first';
        validationResult.classList.add('validation-error');
        return;
    }

    const structure = Array.from(wsBlocks).map(b => b.dataset.type);
    const expected = levelConfig.expectedStructure; // ['start','variable','loop']

    output.innerHTML += '<span class="warning">--- Execution Steps ---</span><br><br>';

    let x = 0;
    let hasError = false;

    // ---- 1) TOP LEVEL STRUCTURE VALIDATION ----
    if (
        structure.length !== expected.length ||
        !structure.every((val, i) => val === expected[i])
    ) {
        output.innerHTML += `<span class="error">
            ❌ Invalid top-level structure. Expected: ${expected.join(' → ')}
        </span><br><br>`;
        hasError = true;
    }

    // ---- 2) LOOP CONTENT VALIDATION ----
    const loopBlock = wsBlocks[2]; // start, variable, loop

    let hasOperationInsideLoop = false;

    if (loopBlock && loopBlock.dataset.type === 'loop') {
        const nestedContainer = loopBlock.querySelector('.loop-container');
        const nestedBlocks = nestedContainer
            ? nestedContainer.querySelectorAll('.nested-block')
            : [];

        hasOperationInsideLoop = Array.from(nestedBlocks)
            .some(b => b.dataset.type === 'operation');

        if (!hasOperationInsideLoop) {
            output.innerHTML += `<span class="error">
                ❌ Loop must contain at least one "operation" block
            </span><br><br>`;
            hasError = true;
        }
    }

    // ---- 3) EXECUTION ----
    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;

        output.innerHTML += `<span class="warning">Step ${index + 1}:</span> ${type}<br>`;

        if (type === 'start') {
            output.innerHTML += 'Program started<br>';
        }
        else if (type === 'variable') {
            x = parseInt(block.dataset.value || 5);
            output.innerHTML += `Set x = <span class="success">${x}</span><br>`;
        }
        else if (type === 'operation') {
            const val = parseInt(block.dataset.value || 1);
            x = x + val;
            output.innerHTML += `x = x + ${val} → <span class="success">${x}</span><br>`;
        }
        else if (type === 'loop') {
            const times = parseInt(block.dataset.value || 3);
            output.innerHTML += `Loop <span class="success">${times}</span> times<br>`;

            const nestedContainer = block.querySelector('.loop-container');
            const nestedBlocks = nestedContainer
                ? nestedContainer.querySelectorAll('.nested-block')
                : [];

            for (let i = 1; i <= times; i++) {
                output.innerHTML += `  <span class="warning">Iteration ${i}:</span><br>`;

                if (nestedBlocks.length > 0) {
                    nestedBlocks.forEach((nestedBlock, nestedIndex) => {
                        const nestedType = nestedBlock.dataset.type;

                        output.innerHTML += `    Nested block ${nestedIndex + 1}: ${nestedType}<br>`;

                        if (nestedType === 'variable') {
                            const val = parseInt(nestedBlock.dataset.value || 5);
                            x = val;
                            output.innerHTML += `    Set x = <span class="success">${x}</span><br>`;
                        }
                        else if (nestedType === 'operation') {
                            const val = parseInt(nestedBlock.dataset.value || 1);
                            x = x + val;
                            output.innerHTML += `    x = x + ${val} → <span class="success">${x}</span><br>`;
                        }
                    });
                } else {
                    output.innerHTML += `    No blocks inside loop<br>`;
                }
            }
        }

        output.innerHTML += '<br>';
    });

    // ---- 4) FINAL RESULT VALIDATION ----
    const expectedFinalX = 8;

    if (x !== expectedFinalX) {
        output.innerHTML += `<span class="error">
            ❌ Final x must be ${expectedFinalX}, but got ${x}
        </span><br><br>`;
        hasError = true;
    }

    if (!hasError) {
        output.innerHTML += '<span class="success">✅ Structure and logic are correct!</span><br>';
        validationResult.textContent =
            'Validation Successful! Correct order, loop contains operation, and final x = 8.';
        validationResult.classList.add('validation-success');
        return 1;
        
    } else {
        output.innerHTML += '<span class="error">❌ Validation failed!</span><br>';
        validationResult.textContent =
            'Validation Failed! Required: start → variable → loop, operation inside loop, and final x = 8.';
        validationResult.classList.add('validation-error');
        
    }

    output.scrollTop = output.scrollHeight;
    return 0;
}
