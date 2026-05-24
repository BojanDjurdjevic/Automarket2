export function clearFieldErrors(
  form: HTMLElement
) {

  form.querySelectorAll('.field-error')
    .forEach(el => el.remove());
}

export function showFieldError(
  input: HTMLElement,
  message: string
) {

  const error = document.createElement('div');

  error.className =
    'field-error text-red-500 text-sm mt-1';

  error.textContent = message;

  input.insertAdjacentElement(
    'afterend',
    error
  );
}