const form = document.querySelector('#classify-form');
const message = document.querySelector('#message');
const charCount = document.querySelector('#char-count');
const submitButton = document.querySelector('#submit-button');
const errorMessage = document.querySelector('#error-message');
const emptyState = document.querySelector('#empty-state');
const resultState = document.querySelector('#result-state');

message.addEventListener('input', () => {
  charCount.textContent = `${message.value.length.toLocaleString()} / 10,000`;
});

document.querySelectorAll('.example').forEach((button) => {
  button.addEventListener('click', () => {
    message.value = button.dataset.example;
    message.dispatchEvent(new Event('input'));
    message.focus();
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  submitButton.disabled = true;
  submitButton.querySelector('.button-copy').textContent = 'Classifying…';

  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message.value })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Could not classify this message.');
    showResult(payload);
  } catch (error) {
    errorMessage.textContent = error.message === 'Failed to fetch'
      ? 'Could not reach the API. Make sure the server is running and try again.'
      : error.message;
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector('.button-copy').textContent = 'Classify message';
  }
});

function showResult(result) {
  const category = ['Complaint', 'Query', 'Feedback', 'Other'].includes(result.category)
    ? result.category
    : 'Other';
  const confidence = Math.max(0, Math.min(1, Number(result.confidence) || 0));
  emptyState.hidden = true;
  resultState.hidden = false;
  const badge = document.querySelector('#category-badge');
  badge.textContent = category;
  badge.className = `category-badge ${category.toLowerCase()}`;
  document.querySelector('#confidence-value').textContent = `${Math.round(confidence * 100)}%`;
  document.querySelector('#confidence-fill').style.width = `${confidence * 100}%`;
  document.querySelector('#confidence-note').textContent = result.classificationMode === 'local-rules'
    ? 'Estimated from local keyword rules; this is not an AI model score.'
    : result.confidenceEstimated
      ? 'Estimated because the model did not provide a confidence score.'
      : 'Model-reported confidence';
  document.querySelector('#response-time').textContent = `${Number(result.responseTimeMs) || 0} ms`;
}
