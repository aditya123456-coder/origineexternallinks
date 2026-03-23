export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
    // Styling the output panel to match your image
    output.style.backgroundColor = '#0b1120';
    output.style.color = '#fff';
    output.style.padding = '20px';
    output.style.fontFamily = 'monospace';
    
    output.innerHTML = '<span style="color: #f59e0b">--- Execution Steps ---</span><br><br>';
    validationResult.innerHTML = '';
    validationResult.className = 'validation-result';

    const wsBlocks = dropzone.querySelectorAll('.workspace-block');

    // 1️⃣ Empty check
    if (wsBlocks.length === 0) {
        output.innerHTML += '<span style="color: #ef4444">❌ No blocks in workspace</span>';
        validationResult.textContent = 'Add blocks to run the program';
        validationResult.classList.add('validation-error');
        return 0;
    }

    const structure = Array.from(wsBlocks).map(b => b.dataset.type);
    const expected = levelConfig.expectedStructure;

    // 2️⃣ Structure validation (allows flexible order for variables)
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

    // 3️⃣ Execution simulation
    wsBlocks.forEach((block, index) => {
        const type = block.dataset.type;
        const labelSpan = block.querySelector('span:not(.block-icon)');
        const label = (labelSpan ? labelSpan.textContent : block.textContent).trim();
        
        output.innerHTML += `<span style="color: #f59e0b">Step ${index + 1}: ${type}</span><br>`;

        if (type === 'start') {
            output.innerHTML += `🚀 <span style="color: #ffffff">Program initialized...</span><br><br>`;
        }

        if (type === 'variable') {
            // Regex to match "a = 2" or "b = 3"
            const match = label.match(/([a-zA-Z])\s*=\s*(\d+)/);
            if (match) {
                const varName = match[1];
                const varValue = parseInt(match[2]);
                variables[varName] = varValue;
                output.innerHTML += `📦 <span style="color: #ffffff">Variable set: </span><span style="color: #2dd4bf">${varName} = ${varValue}</span><br><br>`;
            }
        }

        if (type === 'operation') {
            if (variables.a !== null && variables.b !== null) {
                variables.c = variables.a + variables.b;
                output.innerHTML += `🧮 <span style="color: #ffffff">Operation: </span><span style="color: #2dd4bf">c = ${variables.c}</span><br><br>`;
            } else {
                output.innerHTML += `⚠️ <span style="color: #ef4444">Error: Variables not defined</span><br><br>`;
            }
        }

        if (type === 'print') {
            finalOutput = variables.c;
            output.innerHTML += `💬 <span style="color: #ffffff">Printed: </span><span style="color: #2dd4bf">${finalOutput}</span><br><br>`;
        }
    });

    // 4️⃣ Final validation
    if (finalOutput === 5) {
        output.innerHTML += '<span style="color: #22c55e">✅ Program executed successfully!</span>';
        validationResult.textContent = 'Success! Output: 5';
        validationResult.style.color = "#22c55e";
        return 1;
    } else {
        output.innerHTML += '<span style="color: #ef4444">❌ Incorrect output</span>';
        validationResult.textContent = 'Expected output: 5';
        validationResult.style.color = "#ef4444";
        return 0;
    }
}