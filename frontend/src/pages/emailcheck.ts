import { api } from '../api/axios';
import { router } from '../main';
import { Toast } from '../utils/toast';
import { authStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export async function EmailCheckPage(): Promise<HTMLElement> {

  const wrapper = document.createElement('div');

  wrapper.className = 'text-center mt-20';

  wrapper.innerHTML = `
    <p class="text-gray-600  dark:bg-gray-800 dark:text-gray-100">
      Verifying email...
    </p>
  `;

  try {

    const query = new URLSearchParams(
      window.location.search
    );

    const verifyUrl = query.get('verify_url');

    if (!verifyUrl) {
      throw new Error('Missing verify url');
    }

    const backend = new URL(api.defaults.baseURL!, window.location.origin);
    const verification = new URL(verifyUrl, backend);
    if (verification.origin !== backend.origin || verification.username || verification.password ||
        !/^\/verify-email\/\d+\/[a-f0-9]{40}$/.test(verification.pathname)) {
      throw new Error('Invalid verification URL');
    }

    await api.get(verification.href);

    const freshUser = await authService.me();

    authStore.user = freshUser;

    Toast.success('Email verified');

    router.navigate('/verify-success');

  } catch (e) {


    wrapper.innerHTML = `
      <div class="text-red-500">
        Verification failed
      </div>
    `;
  }

  return wrapper;
}