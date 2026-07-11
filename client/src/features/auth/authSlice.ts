import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  name: string
  email: string
  campus?: string
  profilePicture?: string
  role?: string
  status?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  authModalView: 'login' | 'register'
  authRedirectPath?: string
}

// Check local storage for initial state
const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isAuthModalOpen: false,
  authModalView: 'login',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    updateUser: (state, action: PayloadAction<User>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    openAuthModal: (state, action: PayloadAction<{ view?: 'login' | 'register'; redirectPath?: string }>) => {
      state.isAuthModalOpen = true
      state.authModalView = action.payload.view || 'login'
      state.authRedirectPath = action.payload.redirectPath
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false
    },
    switchAuthView: (state, action: PayloadAction<'login' | 'register'>) => {
      state.authModalView = action.payload
    },
  },
})

export const { setCredentials, logout, updateUser, openAuthModal, closeAuthModal, switchAuthView } = authSlice.actions
export default authSlice.reducer
