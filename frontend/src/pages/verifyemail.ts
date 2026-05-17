import { api } from '../api/axios';
import { Toast } from '../utils/toast';

export function VerifyEmailPage(): HTMLElement {
  const wrapper = document.createElement('div');

  wrapper.className = 'max-w-lg mx-auto mt-20 text-center';

  wrapper.innerHTML = `
    <h1 class="text-2xl font-bold mb-4">Verify your email</h1>

    <p class="text-gray-600 mb-6">
      We sent you a verification link. Please check your inbox.
    </p>

    <button
      id="resend"
      class="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Resend email
    </button>
  `;

  wrapper.querySelector('#resend')!
    .addEventListener('click', async () => {
      try {
        await api.post('/email/verification-notification');
        Toast.success('Verification email sent again');
      } catch {
        Toast.error('Failed to resend email');
      }
    });

  return wrapper;
} 
/*
export async function VerifyEmailPage() {

  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <div class="p-10 text-center">
      Verifying email...
    </div>
  `;

  const params = new URLSearchParams(window.location.search);

  const id = params.get('id');
  const hash = params.get('hash');
  const expires = params.get('expires');
  const signature = params.get('signature');

  try {

    await api.get(
      `/verify-email/${id}/${hash}?expires=${expires}&signature=${signature}`
    );

    wrapper.innerHTML = `
      <div class="p-10 text-center text-green-600">
        Email verified successfully
      </div>
    `;

  } catch {

    wrapper.innerHTML = `
      <div class="p-10 text-center text-red-600">
        Verification failed
      </div>
    `;
  }

  return wrapper;
}*/