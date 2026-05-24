import { profileService } from '../services/profile.service';
import { authStore } from '../store/auth.store';
import { router } from '../main';
import { Toast } from '../utils/toast';
import { confirmModal } from '../ui/components/ConfirmModal';

export function ProfileDeletePage(): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className =
    'max-w-xl mx-auto';

  wrapper.innerHTML = `

    <div class="bg-white rounded-xl shadow p-6  dark:bg-gray-800 dark:text-gray-100">

      <h1 class="text-2xl font-bold text-red-600 mb-4">
        Delete Account
      </h1>

      <p class="text-gray-600 mb-6 dark:text-gray-100">
        This action is permanent.
        All your cars and images will be deleted.
      </p>

      <button
        id="delete"
        class="bg-red-600 text-white px-4 py-2 rounded"
      >
        Delete My Account
      </button>

    </div>
  `;

  wrapper.querySelector('#delete')!
    .addEventListener('click', async () => {

      const confirmed = await confirmModal(
        'Are you sure you want to permanently delete your account?'
      );

      if (!confirmed) return;

      try {

        await profileService.deleteAccount();

        authStore.setUser(null);

        Toast.success(
          'Account deleted'
        );

        router.navigate('/cars');

      } catch {

        Toast.error(
          'Delete failed'
        );
      }
    });

  return wrapper;
}