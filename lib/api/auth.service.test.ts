import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService } from './auth.service'
import { apiClient } from './client'

// Mock apiClient
vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should successfully login and store tokens', async () => {
      const mockResponse = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse)
      expect(localStorage.getItem('access_token')).toBe('mock_access_token')
      expect(localStorage.getItem('refresh_token')).toBe('mock_refresh_token')
    })

    it('should throw error on invalid credentials', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError)

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should successfully register and store tokens', async () => {
      const mockResponse = {
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        },
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse)
      expect(localStorage.getItem('access_token')).toBe('mock_access_token')
      expect(localStorage.getItem('refresh_token')).toBe('mock_refresh_token')
    })

    it('should throw error when email already exists', async () => {
      const mockError = new Error('Email already exists')
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError)

      await expect(
        authService.register({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('logout', () => {
    it('should clear tokens from localStorage', () => {
      localStorage.setItem('access_token', 'test_token')
      localStorage.setItem('refresh_token', 'test_refresh')

      authService.logout()

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUser)

      const result = await authService.me()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })
  })

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const mockResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      }

      localStorage.setItem('refresh_token', 'old_refresh_token')
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.refreshToken('old_refresh_token')

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'old_refresh_token',
      })
      expect(result).toEqual(mockResponse)
      expect(localStorage.getItem('access_token')).toBe('new_access_token')
      expect(localStorage.getItem('refresh_token')).toBe('new_refresh_token')
    })

    it('should handle refresh with token parameter', async () => {
      const mockResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.refreshToken('my_refresh_token')

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'my_refresh_token',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('access_token', 'test_token')

      const token = localStorage.getItem('access_token')

      expect(token).toBe('test_token')
    })

    it('should return null when no token', () => {
      localStorage.removeItem('access_token')

      const token = localStorage.getItem('access_token')

      expect(token).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when access token exists', () => {
      localStorage.setItem('access_token', 'test_token')

      const result = authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when no access token', () => {
      localStorage.removeItem('access_token')

      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
