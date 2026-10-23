import { beforeEach, describe, expect, it } from 'vitest';
import { form as copy } from './content';
import { bindForm } from './form';

function setup(): { form: HTMLFormElement; input: HTMLInputElement; msg: HTMLElement } {
  document.body.innerHTML = `<form class="notify" novalidate>
    <input type="email"><button type="submit">Go</button><p class="notify__msg"></p></form>`;
  const form = document.querySelector<HTMLFormElement>('form') as HTMLFormElement;
  bindForm(form);
  return {
    form,
    input: form.querySelector('input') as HTMLInputElement,
    msg: form.querySelector('.notify__msg') as HTMLElement,
  };
}

describe('notify form', () => {
  beforeEach(() => localStorage.clear());

  it('shows an error for an empty or invalid email', () => {
    const { form, input, msg } = setup();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(msg.textContent).toBe(copy.errorEmpty);
    input.value = 'nope';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(msg.textContent).toBe(copy.errorInvalid);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows the success state and stores nothing', () => {
    const { form, input, msg } = setup();
    input.value = 'me@example.com';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(msg.textContent).toBe(copy.success);
    expect(form.classList.contains('is-done')).toBe(true);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
