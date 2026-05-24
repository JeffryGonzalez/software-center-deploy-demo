import { inject } from '@angular/core';
import { authStore } from './store';
import { Router } from '@angular/router';

export const softwareCenterTeamMember = () => {
  const auth = inject(authStore);
  const router = inject(Router);

  if (auth.isSoftwareCenterTeamMember()) {
    return true;
  } else {
    return router.createUrlTree(['/']); // take me home.
  }
};

export const manager = () => {
  const auth = inject(authStore);
  const router = inject(Router);

  if (auth.isManager()) {
    return true;
  } else {
    return router.createUrlTree(['/']); // rediret to home
  }
};
