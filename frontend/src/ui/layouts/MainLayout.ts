import { authStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import { router } from '../../main';
import { Toast } from '../../utils/toast';

export function MainLayout(content: HTMLElement): HTMLElement {
  const wrapper = document.createElement('div');

  wrapper.innerHTML = `
    <div class="min-h-screen bg-gray-100">
      
      <!-- Navbar -->
      <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div class="font-semibold text-lg">
          AutoMarket
        </div>

        <div class="flex items-center gap-4">

          <a href="#" id="nav-cars"
            class="text-gray-700 hover:text-black">
            Cars
          </a>

          <a href="#" id="nav-my-cars"
            class="text-gray-700 hover:text-black">
            My Cars
          </a>

          <a href="#" id="nav-profile"
            class="text-gray-700 hover:text-black">
            Profile
          </a>

        </div>

        <div class="flex items-center gap-4">

          <span class="text-gray-600">
            ${authStore.user?.name ?? ''}
          </span>

          <button id="login-btn"
            class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded">
            Login
          </button>

          <button id="logout-btn"
            class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded">
            Logout
          </button>

        </div>

      </nav>

      <!-- Content -->
      <main class="p-6 max-w-5xl mx-auto" id="app-content"></main>
    </div>
  `;

  const profileLink = wrapper.querySelector('#nav-profile') as HTMLElement;

  const logoutBtn = wrapper.querySelector('#logout-btn') as HTMLButtonElement;
  const loginBtn = wrapper.querySelector('#login-btn') as HTMLButtonElement;

  if(!authStore.isAuthenticated) {
    logoutBtn.style.display = 'none'
  } else {
    loginBtn.style.display = 'none'
  }
  
  const contentEl = wrapper.querySelector('#app-content')!;
  contentEl.appendChild(content);

  //carsPage:

  const carsLink = wrapper.querySelector('#nav-cars') as HTMLElement;
  
  carsLink!
  .addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/cars');
  });

  //my-cars:

  const myCarsLink = wrapper.querySelector('#nav-my-cars') as HTMLElement;
 

  if (!authStore.isAuthenticated) {
    myCarsLink.style.display = 'none';
    profileLink.style.display = 'none';
  }

  wrapper.querySelector('#nav-profile')!
  .addEventListener('click', (e) => {
    e.preventDefault();

    router.navigate('/profile');
  });

  wrapper.querySelector('#nav-my-cars')!
  .addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/my-cars');
  });

  // logout
  wrapper.querySelector('#logout-btn')!
    .addEventListener('click', async () => {
      await authService.logout();
      authStore.setUser(null);
      Toast.success('Logged out');
      router.navigate('/cars');
    });

  loginBtn.addEventListener('click', () => {
    router.navigate('/login')
  });

  return wrapper;
}