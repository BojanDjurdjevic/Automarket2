import { router } from '../main';

export function VerifySuccessPage(): HTMLElement {
  const wrapper = document.createElement('div');

  wrapper.className = 'text-center mt-20';

  wrapper.innerHTML = `
    <h1 class="text-3xl font-bold text-green-600 mb-4">
      Email verified!
    </h1>

    <p class="text-gray-600 mb-6">
      You can now continue using the app.
    </p>

    <button
      id="go"
      class="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Go to dashboard
    </button>
  `;

  wrapper.querySelector('#go')!
    .addEventListener('click', () => {
      router.navigate('/');
    });

  return wrapper;
}