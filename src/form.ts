import { form as copy } from './content';
import { validateEmail } from './email';

/** Validates the email on submit and shows a success state. Nothing is sent or stored. */
export function bindForm(root: HTMLFormElement): void {
  const input = root.querySelector<HTMLInputElement>('input[type="email"]');
  const msg = root.querySelector<HTMLElement>('.notify__msg');
  if (!input || !msg) return;

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = validateEmail(input.value);
    if (!result.ok) {
      input.setAttribute('aria-invalid', 'true');
      msg.classList.add('is-error');
      msg.textContent = result.reason === 'empty' ? copy.errorEmpty : copy.errorInvalid;
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    msg.classList.remove('is-error');
    msg.textContent = copy.success;
    root.classList.add('is-done');
    input.value = '';
    input.disabled = true;
    root.querySelector('button')?.setAttribute('disabled', '');
  });

  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid')) {
      input.removeAttribute('aria-invalid');
      msg.textContent = '';
    }
  });
}
