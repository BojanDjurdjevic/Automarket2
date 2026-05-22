import { api } from '../api/axios';
import { router } from '../main';
import { Toast } from '../utils/toast';

export function ResetPasswordPage(
  params?: Record<string, string>
): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className =
    'max-w-md mx-auto mt-20';

  wrapper.innerHTML = `

    <div class="bg-white shadow rounded-xl p-6">

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
        class="w-full bg-blue-500 text-white py-2 rounded"
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

        await api.post('/reset-password', {

          token: params?.token,

          email,

          password,
          password_confirmation,
        });

        Toast.success('Password reset successful');

        router.navigate('/login');

      } catch {

        Toast.error('Reset failed');
      }
    });

  return wrapper;
}