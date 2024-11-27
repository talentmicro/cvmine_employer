import { createReducer, on } from '@ngrx/store';
import { loginSuccess, loginFailure, logout } from '../actions/auth.actions';

export interface AuthState {
    token: string | null;
    user: any | null;
    error: string | null;
}

export const initialState: AuthState = {
    token: null,
    user: null,
    error: null,
};

export const authReducer = createReducer(
    initialState,
    on(loginSuccess, (state, { token, user }) => ({
        ...state,
        token,
        user,
        error: null,
    })),
    on(loginFailure, (state, { error }) => ({
        ...state,
        token: null,
        user: null,
        error: error ? error.message : 'Login failed',
    })),
    on(logout, (state) => ({
        ...state,
        token: null,
        user: null,
        error: null,
    }))
);
