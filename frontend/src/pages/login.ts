import { getErrorMessage, getValidationErrors } from '../utils/api-error';
import { authService } from '../services/auth.service';
import { authStore } from '../store/auth.store';
import { router } from '../main';
import { Toast } from '../utils/toast';
import { hideLoading, showLoading } from '../ui/layouts/Overlay';

export function LoginPage(): HTMLElement {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="min-h-screen flex items-center justify-center  dark:bg-gray-700 dark:text-gray-100">
      <div class="bg-white p-6 rounded shadow w-80  dark:bg-gray-800 dark:text-gray-100">
        <h2 class="text-xl mb-4">Login</h2>

        <input id="email" placeholder="Email"
          class="border p-2 w-full mb-2" />

        <input id="password" type="password" placeholder="Password"
          class="border p-2 w-full mb-4" />

        <button id="login-btn"
          class="bg-indigo-600 text-white px-4 py-2 w-full">
          Login
        </button>

        <p class="text-sm mt-3 text-center">
          Don't have account?
          <a href="/register" id="registerLink" class="text-blue-500">
            Register
          </a>
        </p>

        <p class="text-sm mt-3 text-center">
          Forgot Password?
          <a href="/forgot-password" id="forgotPassLink" class="text-red-500">
            Password reset
          </a>
        </p>
      </div>

      
    </div>
  `;

  const btn = div.querySelector('#login-btn') as HTMLButtonElement;

  btn.addEventListener('click', async () => {
    const email = (div.querySelector('#email') as HTMLInputElement).value;
    const password = (div.querySelector('#password') as HTMLInputElement).value;

    showLoading()

    try {
      const user = await authService.login(email, password);

      authStore.setUser(user);

      Toast.success('Welcome back!');

      router.navigate('/dashboard');
    } catch (e) {
      Toast.error(Object.values(getValidationErrors(e))[0]?.[0] || getErrorMessage(e));

    } finally {
      hideLoading()
    }
  });

  return div;
}