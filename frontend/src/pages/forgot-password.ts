import { getErrorMessage, getValidationErrors } from '../utils/api-error';
import { api, getCsrfCooke } from '../api/axios';
import { Toast } from '../utils/toast';

export function ForgotPasswordPage(): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className =
    'max-w-md mx-auto mt-20';

  wrapper.innerHTML = `

    <div class="bg-white shadow rounded-xl p-6  dark:bg-gray-800 dark:text-gray-100">

      <h1 class="text-2xl font-bold mb-4">
        Forgot Password
      </h1>

      <p class="text-gray-600 mb-6  dark:text-gray-100">
        Enter your email to receive a password reset link.
      </p>

      <input
        id="email"
        type="email"
        placeholder="Email"
        class="w-full border rounded p-2 mb-4"
      />

      <button
        id="send"
        class="w-full bg-indigo-600 text-white py-2 rounded"
      >
        Send Reset Link
      </button>

    </div>
  `;

    wrapper.querySelector('#send')!.addEventListener('click', async () => {
        try {

            const email = (wrapper.querySelector('#email') as HTMLInputElement).value;

            await getCsrfCooke();
            await api.post('/forgot-password', {email});

            Toast.success('Reset email sent');

        } catch (e) {

            Toast.error(Object.values(getValidationErrors(e))[0]?.[0] || getErrorMessage(e));
        }
    });

  return wrapper;
}
