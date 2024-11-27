import { createAction, props } from '@ngrx/store';

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{ token: string, user: any }>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');
