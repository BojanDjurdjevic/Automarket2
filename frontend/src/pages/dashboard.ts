import { authStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { router } from '../main';
import { Toast } from '../utils/toast';

export function DashboardPage(): HTMLElement {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="p-6  dark:bg-gray-800 dark:text-gray-100">
      <h1 class="text-2xl mb-4">
        Welcome ${authStore.user?.name}
      </h1>

      <button id="logout"
        class="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2">
        Logout
      </button>
    </div>
  `;

  div.querySelector('#logout')!
    .addEventListener('click', async () => {
      let name = authStore.user?.name
      await authService.logout();
      authStore.setUser(null);
      Toast.success(`Good bye ${name} !`)
      router.navigate('/cars');
    });

  return div;
}