// src/router/router.ts

import { authStore } from '../store/auth.store';
import { MainLayout } from '../ui/layouts/MainLayout';

type Route = {
  path: string;

  component: (
    params?: Record<string, string>
  ) => HTMLElement | Promise<HTMLElement>;

  meta?: {
    auth?: boolean;
    guest?: boolean;
  }
};

export class Router {
  private routes: Route[] = [];
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;

    window.addEventListener('popstate', () => {
      this.render();
    });
  }

  register(route: Route) {
    this.routes.push(route);
  }

  navigate(path: string) {
    history.pushState({}, '', path);

    this.render();
  }

  private match(
    path: string
  ): { route: Route; params: Record<string, string> } | null {

    for (const route of this.routes) {

      const paramNames: string[] = [];

      const regexPath = route.path.replace(
        /:([^/]+)/g,
        (_, name) => {
          paramNames.push(name);

          return '([^/]+)';
        }
      );

      const regex = new RegExp(`^${regexPath}$`);

      const match = path.match(regex);

      if (match) {

        const params: Record<string, string> = {};

        paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        return {
          route,
          params
        };
      }
    }

    return null;
  }

  async render() {

    const path = window.location.pathname;

    // HOME redirect
    if (path === '/' || path === '') {
      this.navigate('/cars');
      return;
    }

    const result = this.match(path);

    // INVALID route redirect
    if (!result) {
      this.navigate('/cars');
      return;
    }

    this.root.innerHTML = '';

    const { route, params } = result;

    // AUTH check
    if (
      route.meta?.auth &&
      !authStore.isAuthenticated
    ) {
      this.navigate('/login');
      return;
    }

    // GUEST ONLY check
    if (
      route.meta?.guest &&
      authStore.isAuthenticated
    ) {
      this.navigate('/cars');
      return;
    }

    // EMAIL VERIFY check
    if (
      authStore.isAuthenticated &&
      authStore.user &&
      !authStore.user.email_verified_at
    ) {

      const isAllowed =
        path === '/verify-email' ||
        path === '/verify-success' ||
        path.startsWith('/email-check');

      if (!isAllowed) {
        this.navigate('/verify-email');
        return;
      }
    }

    const page = await route.component(params);

    this.root.appendChild(
      MainLayout(page)
    );
  }
}