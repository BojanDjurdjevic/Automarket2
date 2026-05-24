import { profileService } from '../services/profile.service';
import { authStore } from '../store/auth.store';
import { router } from '../main';
import { Toast } from '../utils/toast';
import { getErrorMessage, getValidationErrors } from '../utils/api-error';
import { clearFieldErrors, showFieldError } from '../utils/form-errors';

export async function ProfileEditPage(): Promise<HTMLElement> {

  const wrapper = document.createElement('div');

  wrapper.className = 'max-w-xl mx-auto';

  const user = await profileService.me();

  wrapper.innerHTML = `

    <div class="bg-white rounded-xl shadow p-6">

      <h1 class="text-2xl font-bold mb-6">
        Edit Profile
      </h1>

      <div class="space-y-4">

        <div>
          <label class="block text-sm mb-1">
            Name
          </label>

          <input
            id="name"
            type="text"
            value="${user.name ?? ''}"
            class="w-full border rounded p-2"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">
            Email
          </label>

          <input
            disabled
            value="${user.email}"
            class="w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">
            Phone
          </label>

          <input
            id="phone"
            type="text"
            value="${user.phone ?? ''}"
            class="w-full border rounded p-2"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">
            City
          </label>

          <input
            id="city"
            type="text"
            value="${user.city ?? ''}"
            class="w-full border rounded p-2"
          />
        </div>

        <button
          id="save"
          class="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>

      </div>

    </div>
  `;

  wrapper.querySelector('#save')!.addEventListener('click', async () => {
      try {

        const payload = {
          name: (
            wrapper.querySelector('#name') as HTMLInputElement
          ).value,

          phone: (
            wrapper.querySelector('#phone') as HTMLInputElement
          ).value,

          city: (
            wrapper.querySelector('#city') as HTMLInputElement
          ).value,
        };

        const res = await profileService.update(payload);

        authStore.user = res.user;

        Toast.success('Profile updated');

        router.navigate('/profile');

      } catch(e: any) {
        /*
        Toast.error('Update failed');
        */
        clearFieldErrors(wrapper);
        
        if (e?.response?.status === 422) {
        
          const errors = getValidationErrors(e);
        
          Object.entries(errors).forEach(([field, messages]) => {
              const input = wrapper.querySelector( `#${field}`);
        
              if (input) {
                showFieldError(
                  input as HTMLElement,
                  messages[0]
                );
              }
            }
          );
        
          return;
        }
        
        Toast.error(getErrorMessage(e));
      }
    });

  return wrapper;
}