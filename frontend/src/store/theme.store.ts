// src/store/theme.store.ts

type Theme = 'light' | 'dark';

class ThemeStore {
  theme: Theme = 'light';

  init() {
    const saved = localStorage.getItem('theme') as Theme | null;

    if (saved) {
      this.theme = saved;
    }

    this.apply();
  }

  toggle() {
    this.theme =
      this.theme === 'light'
        ? 'dark'
        : 'light';

    localStorage.setItem('theme', this.theme);

    this.apply();
  }

  apply() {
    document.documentElement.classList.toggle(
      'dark',
      this.theme === 'dark'
    );
  }
}

export const themeStore = new ThemeStore();