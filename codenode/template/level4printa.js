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
  const expected = levelConfig.expectedStructure; // ['start','variable','print']
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
  let combinedOutput = "";

  // 3. Execution Simulation
  wsBlocks.forEach((block, index) => {
    const type = block.dataset.type;
    const value = block.dataset.value;

    output.innerHTML += `<span class="warning">Step ${index + 1}:</span> ${type}<br>`;

    if (type === 'start') {
      output.innerHTML += '🚀 Program initialized...<br>';
    } 
    else if (type === 'variable') {
      // Fixed variable logic: a = 10
      const varValue = value ? Number(value) : 10;
      variables["a"] = varValue;
      output.innerHTML += `🧮 Variable set: <span class="success">a = ${varValue}</span><br>`;
    }
    else if (type === 'print') {
      if (variables["a"] === undefined) {
        output.innerHTML += '<span class="error">❌ Variable a is not defined</span><br>';
        hasError = true;
      } else {
        output.innerHTML += `📢 Output: <span class="success">${variables["a"]}</span><br>`;
        combinedOutput += variables["a"];
      }
    }

    output.innerHTML += '<br>';
  });

  // 4. Final Validation Result
  if (!hasError && combinedOutput === "10") {
    output.innerHTML += '<span class="success">✅ Program executed perfectly!</span><br>';
    validationResult.textContent = 'Success! You printed: 10';
    validationResult.classList.add('validation-success');
    return 1;
  } else {
    output.innerHTML += '<span class="error">❌ Execution halted.</span><br>';
    validationResult.textContent =
      'Validation Failed! Make sure you have: Start → Variable → Print';
    validationResult.classList.add('validation-error');
    return 0;
  }
}