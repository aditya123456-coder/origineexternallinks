export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
  output.innerHTML = '';
  validationResult.innerHTML = '';
  validationResult.className = 'validation-result';

  const wsBlocks = dropzone.querySelectorAll('.workspace-block');

  // 1. Basic Check
  if (wsBlocks.length === 0) {
    output.innerHTML = '<span class="error">❌ No blocks in workspace</span>';
    validationResult.textContent = 'Please add blocks to the workspace first';
    validationResult.classList.add('validation-error');
    return 0;
  }

  const structure = Array.from(wsBlocks).map(b => b.dataset.type);
  const expected = levelConfig.expectedStructure;
  let hasError = false;

  output.innerHTML += '<span class="warning">--- Execution Steps ---</span><br><br>';

  // 2. Structure Validation
  if (
    structure.length !== expected.length ||
    !structure.every((val, i) => val === expected[i])
  ) {
    output.innerHTML += `<span class="error">
      ❌ Invalid structure. Expected: ${expected.join(' → ')}
    </span><br><br>`;
    hasError = true;
  }

  let variables = {};
  let finalOutput = '';

  // 3. Execution Simulation
  wsBlocks.forEach((block, index) => {
    const type = block.dataset.type;
    const value = block.dataset.value;

    output.innerHTML += `<span class="warning">Step ${index + 1}:</span> ${type}<br>`;

    if (type === 'start') {
      output.innerHTML += '🚀 Program initialized...<br>';
    }

    else if (type === 'variable') {
      if (value === 'hello') {
        variables.a = value;
        output.innerHTML += `📦 Variable set: <span class="success">a = "hello"</span><br>`;
      } 
      else if (value === 'john') {
        variables.b = value;
        output.innerHTML += `📦 Variable set: <span class="success">b = "john"</span><br>`;
      }
    }

    else if (type === 'operation') {
      if (variables.a === undefined || variables.b === undefined) {
        output.innerHTML += '<span class="error">❌ Variables a or b not defined</span><br>';
        hasError = true;
      } else {
        variables.c = `${variables.a} ${variables.b}`;
        output.innerHTML += `🧮 Operation: <span class="success">c = "${variables.c}"</span><br>`;
      }
    }

    else if (type === 'print') {
      if (variables.c === undefined) {
        output.innerHTML += '<span class="error">❌ Variable c not defined</span><br>';
        hasError = true;
      } else {
        output.innerHTML += `🖨️ Output: <span class="success">${variables.c}</span><br>`;
        finalOutput = variables.c;
      }
    }

    output.innerHTML += '<br>';
  });

  // 4. Final Validation Result
  if (!hasError && finalOutput === 'hello john') {
    output.innerHTML += '<span class="success">✅ Program executed perfectly!</span><br>';
    validationResult.textContent = 'Success! You printed: hello john';
    validationResult.classList.add('validation-success');
    return 1;
  } else {
    output.innerHTML += '<span class="error">❌ Execution failed.</span><br>';
    validationResult.textContent = 'Validation Failed! Expected output: hello john';
    validationResult.classList.add('validation-error');
    return 0;
  }
}
