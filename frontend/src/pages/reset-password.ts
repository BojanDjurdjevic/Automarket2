import { getErrorMessage, getValidationErrors } from '../utils/api-error';
import { api, getCsrfCooke } from '../api/axios';
import { router } from '../main';
import { Toast } from '../utils/toast';

export function ResetPasswordPage(
  params?: Record<string, string>
): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className =
    'max-w-md mx-auto mt-20';

  wrapper.innerHTML = `

    <div class="bg-white shadow rounded-xl p-6  dark:bg-gray-800 dark:text-gray-100">

      <h1 class="text-2xl font-bold mb-6">
        Reset Password
      </h1>

      <input
        id="password"
        type="password"
        placeholder="New password"
        class="w-full border rounded p-2 mb-4"
      />

      <input
        id="password_confirmation"
        type="password"
        placeholder="Confirm password"
        class="w-full border rounded p-2 mb-4"
      />

      <button
        id="reset"
        class="w-full bg-indigo-600 text-white py-2 rounded"
      >
        Reset Password
      </button>

    </div>
  `;

  wrapper.querySelector('#reset')!.addEventListener('click', async () => {

      try {

        const password = (wrapper.querySelector('#password') as HTMLInputElement).value;

        const password_confirmation = (wrapper.querySelector('#password_confirmation') as HTMLInputElement).value;

        const email = new URLSearchParams(window.location.search).get('email');

        await getCsrfCooke();
        await api.post('/reset-password', {

          token: params?.token,

          email,

          password,
          password_confirmation,
        });

        Toast.success('Password reset successful');

        router.navigate('/login');

      } catch (e) {

        Toast.error(Object.values(getValidationErrors(e))[0]?.[0] || getErrorMessage(e));
      }
    });

  return wrapper;
}
