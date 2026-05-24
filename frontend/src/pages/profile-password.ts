import { profileService } from '../services/profile.service';
import { Toast } from '../utils/toast';
import { router } from '../main';

export function ProfilePasswordPage(): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className =
    'max-w-xl mx-auto';

  wrapper.innerHTML = `

    <div class="bg-white rounded-xl shadow p-6  dark:bg-gray-800 dark:text-gray-100">

      <h1 class="text-2xl font-bold mb-6">
        Change Password
      </h1>

      <div class="space-y-4">

        <div>
          <label class="block text-sm mb-1">
            Current password
          </label>

          <input
            id="current_password"
            type="password"
            class="w-full border rounded p-2"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">
            New password
          </label>

          <input
            id="password"
            type="password"
            class="w-full border rounded p-2"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">
            Confirm password
          </label>

          <input
            id="password_confirmation"
            type="password"
            class="w-full border rounded p-2"
          />
        </div>

        <button
          id="save"
          class="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Update Password
        </button>

      </div>

    </div>
  `;

  wrapper.querySelector('#save')!
    .addEventListener('click', async () => {

      try {

        const payload = {

          current_password:
            (
              wrapper.querySelector(
                '#current_password'
              ) as HTMLInputElement
            ).value,

          password:
            (
              wrapper.querySelector(
                '#password'
              ) as HTMLInputElement
            ).value,

          password_confirmation:
            (
              wrapper.querySelector(
                '#password_confirmation'
              ) as HTMLInputElement
            ).value,
        };

        await profileService.changePassword(
          payload
        );

        Toast.success(
          'Password updated'
        );

        router.navigate('/profile');

      } catch (e: any) {

        if (e?.response?.status === 422) {
          Toast.error('Validation failed');
          return;
        }

        Toast.error('Update failed');
      }
    });

  return wrapper;
}