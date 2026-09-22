import { escapeHtml } from '../utils/helpers';
import { profileService } from '../services/profile.service';
import { router } from '../main';

export async function ProfilePage(): Promise<HTMLElement> {

  const wrapper = document.createElement('div');

  wrapper.className =
    'max-w-2xl mx-auto';

  wrapper.innerHTML = `
    <div class="bg-white rounded-xl shadow p-6  dark:bg-gray-800 dark:text-gray-100">
      Loading profile...
    </div>
  `;

  const user = await profileService.me();

  wrapper.innerHTML = `
  
    <div class="bg-white rounded-xl shadow p-6  dark:bg-gray-800 dark:text-gray-100">

      <div class="flex items-center justify-between mb-6">

        <div>
          <h1 class="text-2xl font-bold">
            My Profile
          </h1>

          <p class="text-gray-500">
            Manage your account
          </p>
        </div>

      </div>

      <div class="space-y-4">

        <div>
          <p class="text-sm text-gray-500">
            Name
          </p>

          <p class="font-medium">
            ${escapeHtml(user.name ?? '-')}
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-500">
            Email
          </p>

          <div class="flex items-center gap-2">

            <p class="font-medium">
              ${escapeHtml(user.email)}
            </p>

            ${
              user.email_verified_at
                ? `
                  <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Verified
                  </span>
                `
                : `
                  <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Not verified
                  </span>
                `
            }

          </div>
        </div>

        <div>
          <p class="text-sm text-gray-500">
            Phone
          </p>

          <p class="font-medium">
            ${escapeHtml(user.phone ?? '-')}
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-500">
            City
          </p>

          <p class="font-medium">
            ${escapeHtml(user.city ?? '-')}
          </p>
        </div>

      </div>

      <div class="border-t mt-6 pt-6 flex flex-col gap-3">

        <button
          id="edit-profile"
          class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Edit Profile
        </button>

        <button
          id="change-password"
          class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded  dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          Change Password
        </button>

        <button
          id="delete-account"
          class="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>

      </div>

    </div>
  `;

  wrapper.querySelector('#edit-profile')!
    .addEventListener('click', () => {
      router.navigate('/profile/edit');
    });

  wrapper.querySelector('#change-password')!
    .addEventListener('click', () => {
      router.navigate('/profile/password');
    });

  wrapper.querySelector('#delete-account')!
    .addEventListener('click', () => {
      router.navigate('/profile/delete');
    });

  return wrapper;
}