import { getErrorMessage, getValidationErrors } from '../utils/api-error';
import { router } from "../main";
import { authService } from "../services/auth.service";
import { authStore } from "../store/auth.store";
import { Toast } from "../utils/toast";

export function RegisterPage(): HTMLElement {
  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <div class="max-w-md mx-auto bg-white p-6 rounded shadow  dark:bg-gray-800 dark:text-gray-100">

      <h1 class="text-xl font-semibold mb-4">Register</h1>

      <input id="name" placeholder="Name" class="border p-2 w-full mb-3" />
      <input id="email" placeholder="Email" class="border p-2 w-full mb-3" />
      <input id="phone" placeholder="Phone" class="border p-2 w-full mb-3" />
      <input id="city" placeholder="City" class="border p-2 w-full mb-3" />
      <input id="password" type="password" placeholder="Password" class="border p-2 w-full mb-3" />
      <input id="password_confirmation" type="password" placeholder="Confirm Password" class="border p-2 w-full mb-3" />

      <button id="registerBtn"
        class="bg-emerald-600 text-white w-full py-2 rounded">
        Register
      </button>

      <p class="text-sm mt-3 text-center">
        Already have account?
        <a href="/login" id="loginLink" class="text-blue-500">Login</a>
      </p>

    </div>
  `;

  const name = wrapper.querySelector('#name') as HTMLInputElement;
  const email = wrapper.querySelector('#email') as HTMLInputElement;
  

  const phone = wrapper.querySelector('#phone') as HTMLInputElement;
  const city = wrapper.querySelector('#city') as HTMLInputElement;
  //const avatar = wrapper.querySelector('#avatar') as HTMLInputElement;

  const password = wrapper.querySelector('#password') as HTMLInputElement;
  const pass_conf = wrapper.querySelector('#password_confirmation') as HTMLInputElement;

  const btn = wrapper.querySelector('#registerBtn')!;

  btn.addEventListener('click', async () => {

    try {

      await authService.register({
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: pass_conf.value,
        phone: phone.value,
        city: city.value
      });

      const user = await authService.me()

      authStore.setUser(user);

      Toast.success('Welcome!');

      router.navigate('/cars');

    } catch (e) {
      Toast.error(Object.values(getValidationErrors(e))[0]?.[0] || getErrorMessage(e));

    }
  });

  return wrapper;
}