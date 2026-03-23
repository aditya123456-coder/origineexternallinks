export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
    output.innerHTML = '';
    validationResult.innerHTML = '';
    validationResult.className = 'validation-result';

    const wsBlocks = dropzone.querySelectorAll('.workspace-block');

    // 1. EMPTY CHECK
    if (wsBlocks.length === 0) {
        output.innerHTML = '<span class="error">❌ No blocks in workspace</span>';
        validationResult.textContent = 'Please add blocks';
        validationResult.classList.add('validation-error');
        return 0;
    }

    const structure = Array.from(wsBlocks).map(b => b.dataset.type);
    const expected = levelConfig.expectedStructure;

    let hasError = false;

    output.innerHTML += `<span class="warning">--- Validation Start ---</span><br><br>`;

    // 2. STRUCTURE CHECK
    if (
        structure.length !== expected.length ||
        !structure.every((val, i) => val === expected[i])
    ) {
        output.innerHTML += `<span class="error">
      ❌ Invalid structure. Expected: ${expected.join(' → ')}
    </span><br><br>`;
        hasError = true;
    } else {
        output.innerHTML += `<span class="success">✅ Structure is correct</span><br><br>`;
    }

    // 3. LOOP VALIDATION
    // 3. LOOP VALIDATION (ORDER STRICT)
    const loopBlock = Array.from(wsBlocks).find(b => b.dataset.type === 'loop');

    if (!loopBlock) {
        output.innerHTML += `<span class="error">❌ Loop block is missing</span><br>`;
        hasError = true;
    } else {
        output.innerHTML += `<span class="warning">Checking Loop Block</span><br>`;

        const container = loopBlock.querySelector('.loop-container');
        const nestedBlocks = container ? Array.from(container.querySelectorAll('.nested-block')) : [];

        if (nestedBlocks.length < 2) {
            output.innerHTML += `<span class="error">❌ Loop must contain operation → print</span><br>`;
            hasError = true;
        } else {
            const first = nestedBlocks[0];
            const second = nestedBlocks[1];

            // CHECK FIRST = OPERATION
            if (first.dataset.type !== 'operation') {
                output.innerHTML += `<span class="error">❌ First block must be operation (a = a + 1)</span><br>`;
                hasError = true;
            } else {
                output.innerHTML += `<span class="success">✔ Step 1 correct: operation</span><br>`;
            }

            // CHECK SECOND = PRINT
            if (second.dataset.type !== 'print' || second.dataset.value !== 'a') {
                output.innerHTML += `<span class="error">❌ Second block must be print(a)</span><br>`;
                hasError = true;
            } else {
                output.innerHTML += `<span class="success">✔ Step 2 correct: print(a)</span><br>`;
            }

            // EXTRA BLOCKS CHECK (optional strict)
            if (nestedBlocks.length > 2) {
                output.innerHTML += `<span class="error">❌ Only 2 blocks allowed inside loop</span><br>`;
                hasError = true;
            }
        }

        output.innerHTML += `<br>`;
    }

    // 4. FINAL RESULT
    if (!hasError) {
        output.innerHTML += `<span class="success">🎉 Perfect! This will print 1 to 100</span>`;
        validationResult.textContent = 'Success! Loop logic is correct';
        validationResult.classList.add('validation-success');
        return 1;
    } else {
        output.innerHTML += `<span class="error">❌ Validation Failed</span>`;
        validationResult.textContent = 'Fix the loop logic and try again';
        validationResult.classList.add('validation-error');
        return 0;
    }
}