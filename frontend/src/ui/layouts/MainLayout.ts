// src/ui/layouts/MainLayout.ts

import { authStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import { router } from '../../main';
import { Toast } from '../../utils/toast';
import { themeStore } from '../../store/theme.store';

export function MainLayout(content: HTMLElement): HTMLElement {

  const wrapper = document.createElement('div');

  wrapper.className =
    'min-h-screen flex flex-col bg-gray-100  dark:bg-gray-700 dark:text-gray-100';

  wrapper.innerHTML = `
    
    <!-- Navbar -->
    <nav class="bg-white border-b shadow px-4 md:px-6 py-4 relative dark:bg-gray-800 dark:text-gray-100">

    <div class="flex justify-between items-center">

      <!-- Logo -->
      <div
        id="logo"
        class="font-bold text-xl cursor-pointer"
      >
        AutoMarket
      </div>

      <!-- Desktop menu -->
      <div class="hidden md:flex items-center gap-8">

        <div class="flex items-center gap-4">

          <a
            href="#"
            id="nav-cars"
            class="text-gray-700 hover:text-black transition dark:text-gray-100"
          >
            Cars
          </a>

          <a
            href="#"
            id="nav-my-cars"
            class="text-gray-700 hover:text-black transition dark:text-gray-100"
          >
            My Cars
          </a>

          <a
            href="#"
            id="nav-profile"
            class="text-gray-700 hover:text-black transition dark:text-gray-100"
          >
            Profile
          </a>

        </div>

        <div class="flex items-center gap-4">

          <span class="text-gray-600 text-sm dark:text-gray-100"">
            ${authStore.user?.name ?? ''}
          </span>

          <button
            id="login-btn"
            class="bg-emerald-500 hover:bg-emerald-600 transition text-white px-4 py-2 rounded-lg"
          >
            Login
          </button>

          <button
            id="logout-btn"
            class="bg-gray-500 hover:bg-gray-600 transition text-white px-4 py-2 rounded-lg dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Logout
          </button>

        </div>

        

      </div>

      

      <!-- Mobile button -->
      <button
        id="mobile-menu-btn"
        class="md:hidden text-2xl"
      >
        ☰
      </button>

      <button id="theme-toggle">
        ${
          themeStore.theme === 'dark'
            ? '☀️'
            : '🌙'
        }
      </button>

    </div>

    <!-- Mobile menu -->
    <div
      id="mobile-menu"
      class="hidden md:hidden mt-4 border-t pt-4 flex flex-col gap-3"
    >

      <a href="#" id="mobile-cars">
        Cars
      </a>

      <a href="#" id="mobile-my-cars">
        My Cars
      </a>

      <a href="#" id="mobile-profile">
        Profile
      </a>

      <button
        id="mobile-logout"
        class="bg-gray-500 text-white px-3 py-2 rounded"
      >
        Logout
      </button>

    </div>

    

  </nav>

    <!-- Content -->
    <main
      class="flex-1 p-6 max-w-6xl w-full mx-auto dark:bg-gray-700 dark:text-gray-100"
      id="app-content"
    ></main>

    <!-- Footer -->
    <footer class="bg-white border-t mt-10 dark:bg-gray-900 dark:text-gray-100">

      <div class="max-w-6xl mx-auto px-6 py-10">

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

          <!-- Brand -->
          <div>

            <h3 class="text-lg font-semibold mb-3">
              AutoMarket
            </h3>

            <p class="text-sm text-gray-600  dark:text-gray-100 leading-relaxed">
              Modern marketplace for buying and selling cars.
              Built with Laravel, TypeScript and TailwindCSS.
            </p>

          </div>

          <!-- Navigation -->
          <div>

            <h3 class="text-lg font-semibold mb-3">
              Navigation
            </h3>

            <div class="flex flex-col gap-2 text-sm">

              <a
                href="#"
                id="footer-cars"
                class="text-gray-600 hover:text-black transition  dark:text-gray-100"
              >
                Cars
              </a>

              <a
                href="#"
                id="footer-my-cars"
                class="text-gray-600 hover:text-black transition  dark:text-gray-100"
              >
                My Cars
              </a>

              <a
                href="#"
                id="footer-profile"
                class="text-gray-600 hover:text-black transition  dark:text-gray-100"
              >
                Profile
              </a>

            </div>

          </div>

          <!-- Contact -->
          <div>

            <h3 class="text-lg font-semibold mb-3">
              About
            </h3>

            <p class="text-sm text-gray-600 leading-relaxed  dark:text-gray-100">
              This project is currently in MVP phase and
              continuously evolving with new features and UX improvements.
            </p>

          </div>

        </div>

        <!-- Bottom -->
        <div class="border-t mt-8 pt-5 text-center text-sm text-gray-500  dark:text-gray-100">

          Designed by
          <span class="font-medium text-gray-700  dark:text-gray-100">
            Bojan Đurđević
          </span>

        </div>

      </div>

    </footer>
  `;

  const logoutBtn = wrapper.querySelector('#logout-btn')as HTMLButtonElement;

  const loginBtn = wrapper.querySelector('#login-btn') as HTMLButtonElement;

  const myCarsLink = wrapper.querySelector('#nav-my-cars')as HTMLElement;

  const profileLink = wrapper.querySelector('#nav-profile')as HTMLElement;

  const footerMyCars = wrapper.querySelector('#footer-my-cars')as HTMLElement;

  const footerProfile = wrapper.querySelector('#footer-profile')as HTMLElement;

  const mobileBtn = wrapper.querySelector('#mobile-menu-btn') as HTMLButtonElement;

  const mobileMenu = wrapper.querySelector('#mobile-menu') as HTMLElement;

  mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle(
        'hidden'
      );
    }
  );

  

  if (!authStore.isAuthenticated) {

    logoutBtn.style.display = 'none';

    myCarsLink.style.display = 'none';
    profileLink.style.display = 'none';

    footerMyCars.style.display = 'none';
    footerProfile.style.display = 'none';

  } else {

    loginBtn.style.display = 'none';
  }

  const contentEl =
    wrapper.querySelector('#app-content')!;

  contentEl.appendChild(content);

  // Logo
  wrapper.querySelector('#logo')!
    .addEventListener('click', () => {
      router.navigate('/cars');
    });

  // NAVIGATION

  const navigate = (
    selector: string,
    path: string
  ) => {

    wrapper.querySelector(selector)!
      .addEventListener('click', (e) => {

        e.preventDefault();

        router.navigate(path);
      });
  };

  navigate('#nav-cars', '/cars');
  navigate('#nav-my-cars', '/my-cars');
  navigate('#nav-profile', '/profile');

  navigate('#footer-cars', '/cars');
  navigate('#footer-my-cars', '/my-cars');
  navigate('#footer-profile', '/profile');

  navigate('#mobile-cars', '/cars');
  navigate('#mobile-my-cars', '/my-cars');
  navigate('#mobile-profile', '/profile');

  // Logout
  logoutBtn.addEventListener(
    'click',
    async () => {

      await authService.logout();

      authStore.setUser(null);

      Toast.success('Logged out');

      router.navigate('/cars');
    }
  );

  // Mobile logout
  wrapper.querySelector('#mobile-logout')
  ?.addEventListener('click', async () => {

    await authService.logout();

    authStore.setUser(null);

    Toast.success('Logged out');

    router.navigate('/cars');
  });

  // Login
  loginBtn.addEventListener('click', () => {
    router.navigate('/login');
  });

  wrapper.querySelector('#theme-toggle')
  ?.addEventListener('click', () => {
    themeStore.toggle();
  });

  return wrapper;
}