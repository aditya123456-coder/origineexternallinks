export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
  output.innerHTML = '';
  validationResult.innerHTML = '';
  validationResult.className = 'validation-result';

  const wsBlocks = dropzone.querySelectorAll('.workspace-block');

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

  // STRUCTURE CHECK
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

  // IF VALIDATION
  const ifBlocks = Array.from(wsBlocks).filter(b => b.dataset.type === 'if');

  if (ifBlocks.length !== 2) {
    output.innerHTML += `<span class="error">❌ You must use exactly 2 IF blocks</span><br>`;
    hasError = true;
  }

  let foundPrints = [];

  ifBlocks.forEach((ifBlock, index) => {
    const container = ifBlock.querySelector('.loop-container');
    const nestedPrint = container ? container.querySelector('.nested-block') : null;

    output.innerHTML += `<span class="warning">Checking IF ${index + 1}</span><br>`;

    if (!nestedPrint) {
      output.innerHTML += `<span class="error">❌ IF block is empty</span><br><br>`;
      hasError = true;
      return;
    }

    const printValue = nestedPrint.dataset.value;
    foundPrints.push(printValue);

    output.innerHTML += `<span class="success">✔ Found: ${printValue}</span><br><br>`;
  });

  // FINAL CHECK
  if (!foundPrints.includes('a is largest')) {
    output.innerHTML += `<span class="error">❌ Missing: "a is largest"</span><br>`;
    hasError = true;
  }

  if (!foundPrints.includes('b is largest')) {
    output.innerHTML += `<span class="error">❌ Missing: "b is largest"</span><br>`;
    hasError = true;
  }

  // RESULT
  if (!hasError) {
    output.innerHTML += `<span class="success">🎉 Perfect Solution!</span>`;
    validationResult.textContent = 'Success! You solved it correctly';
    validationResult.classList.add('validation-success');
    return 1;
  } else {
    output.innerHTML += `<span class="error">❌ Validation Failed</span>`;
    validationResult.textContent = 'Fix the errors and try again';
    validationResult.classList.add('validation-error');
    return 0;
  }
}