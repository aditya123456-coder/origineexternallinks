export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
    output.innerHTML = '';
    validationResult.innerHTML = '';
    validationResult.className = 'validation-result';

    const wsBlocks = dropzone.querySelectorAll('.workspace-block');

    // 1️⃣ Empty check
    if (wsBlocks.length === 0) {
        output.innerHTML = '❌ No blocks in workspace';
        validationResult.textContent = 'Add blocks to run the program';
        validationResult.classList.add('validation-error');
        return 0;
    }

    const structure = Array.from(wsBlocks).map(b => b.dataset.type);
    const expected = levelConfig.expectedStructure;

    // 2️⃣ Structure validation
    if (
        structure.length !== expected.length ||
        !structure.every((type, i) => type === expected[i])
    ) {
        output.innerHTML = `❌ Invalid structure<br>
        Expected: ${expected.join(' → ')}`;
        validationResult.textContent = 'Wrong block order';
        validationResult.classList.add('validation-error');
        return 0;
    }

    output.innerHTML += '<b>--- Execution ---</b><br><br>';

    let finalOutput = '';

    // 3️⃣ Execution simulation
    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;
        const value = block.dataset.value;

        output.innerHTML += `Step ${index + 1}: ${type}<br>`;

        if (type === 'start') {
            output.innerHTML += '🚀 Program started<br><br>';
        }

        if (type === 'print') {
            finalOutput += value;
            output.innerHTML += `🖨️ Printed: <b>${value}</b><br><br>`;
        }
    });

    // 4️⃣ Final validation
    if (finalOutput === 'hello') {
        output.innerHTML += '✅ Program executed successfully!';
        validationResult.textContent = 'Success! Output: hello';
        validationResult.classList.add('validation-success');
        return 1;
    } else {
        output.innerHTML += '❌ Incorrect output';
        validationResult.textContent = 'Expected output: hello';
        validationResult.classList.add('validation-error');
        return 0;
    }
}
