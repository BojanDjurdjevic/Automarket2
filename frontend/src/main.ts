import './style.css';

import { Router } from './router/router';
import { initApp } from './app';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { CarsPage } from './pages/cars';
import { CarFormPage } from './pages/car-form';
import { MyCarsPage } from './pages/mycars';
import { CarShowPage } from './pages/car-show';
import { RegisterPage } from './pages/register';
import { VerifyEmailPage } from './pages/verifyemail';
import { VerifySuccessPage } from './pages/verifysuccess';
import { EmailCheckPage } from './pages/emailcheck';
import { ProfilePage } from './pages/profile';
import { ProfileEditPage } from './pages/profile-edit';
import { ProfilePasswordPage } from './pages/profile-password';
import { ProfileDeletePage } from './pages/profile-delete';

const root = document.querySelector('#app') as HTMLElement;

export const router = new Router(root);

router.register({
  path: '/register',
  component: RegisterPage
});
router.register({ 
    path: '/login', 
    component: LoginPage 
});
router.register({ 
    path: '/dashboard', 
    component: DashboardPage 
});

router.register({
  path: '/cars',
  component: CarsPage,
});

router.register({
  path: '/my-cars',
  component: MyCarsPage,
  meta: { auth: true }
});

router.register({
  path: '/cars/create',
  component: CarFormPage,
});

router.register({
  path: '/cars/:id/edit',
  component: CarFormPage,
});

router.register({
  path: '/cars/:id',
  component: CarShowPage
}); 

// User profile things:

router.register({
  path: '/profile',
  component: ProfilePage,
  meta: { auth: true }
});

router.register({
  path: '/verify-email',
  component: VerifyEmailPage
});

router.register({
  path: '/verify-success',
  component: VerifySuccessPage
});

router.register({
  path: '/email-check',
  component: EmailCheckPage,
});

// EDIT user profile:

router.register({
  path: '/profile/edit',
  component: ProfileEditPage,
  meta: { auth: true }
});

router.register({
  path: '/profile/password',
  component: ProfilePasswordPage,
  meta: { auth: true }
});

//DELETE acc:

router.register({
  path: '/profile/delete',
  component: ProfileDeletePage,
  meta: { auth: true }
});


initApp();