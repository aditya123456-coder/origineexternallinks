export function runAndValidate({ dropzone, output, validationResult, levelConfig }) {
  output.innerHTML = '';
  validationResult.innerHTML = '';
  validationResult.className = 'validation-result';

  const wsBlocks = Array.from(dropzone.querySelectorAll('.workspace-block'));

  // 1. EMPTY CHECK
  if (wsBlocks.length === 0) {
    output.innerHTML = '<span class="error">❌ No blocks in workspace</span>';
    validationResult.textContent = 'Please add blocks';
    validationResult.classList.add('validation-error');
    return 0;
  }

  let hasError = false;

  output.innerHTML += `<span class="warning">--- Validation Start ---</span><br><br>`;

  // 2. START CHECK
  if (wsBlocks[0].dataset.type !== 'start') {
    output.innerHTML += `<span class="error">❌ First block must be START</span><br>`;
    hasError = true;
  } else {
    output.innerHTML += `<span class="success">✔ Start block correct</span><br>`;
  }

  // 3. VARIABLE CHECK (str + b must exist, order doesn't matter)
  let hasStr = false;
  let hasB = false;

  wsBlocks.forEach(b => {
    if (b.dataset.type === 'variable') {
      if (b.dataset.value === 'welcome') hasStr = true;
      if (b.dataset.value == 0) hasB = true;
    }
  });

  if (!hasStr) {
    output.innerHTML += `<span class="error">❌ Missing string initialization</span><br>`;
    hasError = true;
  } else {
    output.innerHTML += `<span class="success">✔ String initialized</span><br>`;
  }

  if (!hasB) {
    output.innerHTML += `<span class="error">❌ Missing b = 0</span><br>`;
    hasError = true;
  } else {
    output.innerHTML += `<span class="success">✔ Counter initialized</span><br>`;
  }

  // 4. LOOP CHECK
  const loopBlock = wsBlocks.find(b => b.dataset.type === 'loop');

  if (!loopBlock) {
    output.innerHTML += `<span class="error">❌ Loop block missing</span><br>`;
    hasError = true;
  } else {
    output.innerHTML += `<span class="warning">Checking Loop</span><br>`;

    const container = loopBlock.querySelector('.loop-container');
    const nestedBlocks = container ? Array.from(container.querySelectorAll('.nested-block')) : [];

    if (nestedBlocks.length < 2) {
      output.innerHTML += `<span class="error">❌ Loop must contain 2 operations</span><br>`;
      hasError = true;
    } else {
      const first = nestedBlocks[0];
      const second = nestedBlocks[1];

      // FIRST = increment b
      if (first.dataset.type !== 'operation') {
        output.innerHTML += `<span class="error">❌ First must be increment operation</span><br>`;
        hasError = true;
      } else {
        output.innerHTML += `<span class="success">✔ Step 1: increment</span><br>`;
      }

      // SECOND = swap
      if (
        second.dataset.type !== 'operation' ||
        !second.innerText.toLowerCase().includes('swap')
      ) {
        output.innerHTML += `<span class="error">❌ Second must be swap operation</span><br>`;
        hasError = true;
      } else {
        output.innerHTML += `<span class="success">✔ Step 2: swap</span><br>`;
      }

      if (nestedBlocks.length > 2) {
        output.innerHTML += `<span class="error">❌ Only 2 blocks allowed inside loop</span><br>`;
        hasError = true;
      }
    }
  }

  // 5. PRINT CHECK (LAST)
  const lastBlock = wsBlocks[wsBlocks.length - 1];

  if (lastBlock.dataset.type !== 'print' || lastBlock.dataset.value !== 'str') {
    output.innerHTML += `<span class="error">❌ Last block must be print(str)</span><br>`;
    hasError = true;
  } else {
    output.innerHTML += `<span class="success">✔ Final print correct</span><br>`;
  }

  // 6. RESULT
  if (!hasError) {
    output.innerHTML += `<span class="success">🎉 Perfect! String reverse logic is correct</span>`;
    validationResult.textContent = 'Success!';
    validationResult.classList.add('validation-success');
    return 1;
  } else {
    output.innerHTML += `<span class="error">❌ Validation Failed</span>`;
    validationResult.textContent = 'Fix errors and try again';
    validationResult.classList.add('validation-error');
    return 0;
  }
}