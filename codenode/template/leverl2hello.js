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
  const expected = levelConfig.expectedStructure; // ['start', 'print']
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

  // 3. Execution Simulation
  wsBlocks.forEach((block, index) => {
    const type = block.dataset.type;
    output.innerHTML += `<span class="warning">Step ${index + 1}:</span> ${type}<br>`;

    if (type === 'start') {
      output.innerHTML += '🚀 Program initialized...<br>';
    } 
    else if (type === 'print') {
      const message = block.dataset.value || "Hello";

      output.innerHTML += `📢 Output: <span class="success">"${message}"</span><br>`;

      // strict validation for "Hello"
      if (message !== "Hello") {
        hasError = true;
        output.innerHTML += `<span class="error">
          ❌ Wrong output. Expected: "Hello"
        </span><br>`;
      }
    }

    output.innerHTML += '<br>';
  });

  // 4. Final Validation Result
  if (!hasError) {
    output.innerHTML += '<span class="success">✅ Program executed perfectly!</span><br>';
    validationResult.textContent = 'Success! You started the program and printed "Hello".';
    validationResult.classList.add('validation-success');
    return 1;
  } else {
    output.innerHTML += '<span class="error">❌ Execution halted.</span><br>';
    validationResult.textContent = 'Validation Failed! Make sure you have: Start → Print Hello';
    validationResult.classList.add('validation-error');
    return 0;
  }
}