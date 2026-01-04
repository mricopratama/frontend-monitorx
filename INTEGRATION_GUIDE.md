# Frontend-Backend Integration Guide

## Overview

This document describes the complete integration between the Next.js frontend and Go backend for the MonitorX Website Monitoring Platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (Login, Dashboard, Websites, Alerts, etc.)    │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │          Auth Context (User State Management)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │       API Services (auth, website, monitoring)       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │   API Client (Axios with Interceptors & Auth)       │  │
│  └────────────────────┬─────────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ HTTPS/WebSocket
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                      Go Backend API                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Gin Router + Middleware                 │  │
│  │    (Auth, Rate Limit, CORS, Attack Detection)        │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │   Handlers → Services → Repositories → Database      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install axios
```

### 2. Environment Configuration

Create `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/v1/ws
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG=true
```

For production (`.env.production`):

```env
NEXT_PUBLIC_API_URL=https://api.monitorx.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.monitorx.com/api/v1/ws
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG=false
```

### 3. Start Both Services

**Backend:**
```bash
cd backend
docker-compose up -d  # Start PostgreSQL and Redis
go run cmd/server/main.go
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Core Components

### 1. API Client (`lib/api/client.ts`)

Centralized HTTP client with:
- ✅ Automatic token attachment
- ✅ Token refresh on 401 errors
- ✅ Request/response interceptors
- ✅ Error handling and transformation
- ✅ TypeScript type safety

**Usage Example:**
```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const websites = await apiClient.get('/websites');

// POST request
const newWebsite = await apiClient.post('/websites', {
  name: 'Google',
  url: 'https://google.com',
  monitoring_interval: 60,
  timeout_threshold: 5000
});
```

### 2. API Services

Organized by feature domain:

#### Auth Service (`lib/api/auth.service.ts`)
```typescript
import { authService } from '@/lib/api';

// Register
await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Login
await authService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Get current user
const user = await authService.me();

// Logout
authService.logout();
```

#### Website Service (`lib/api/website.service.ts`)
```typescript
import { websiteService } from '@/lib/api';

// Get all websites
const websites = await websiteService.getAll({
  page: 1,
  page_size: 10
});

// Get by ID
const website = await websiteService.getById('website-id');

// Create
const newWebsite = await websiteService.create({
  name: 'My Site',
  url: 'https://example.com',
  monitoring_interval: 60,
  timeout_threshold: 5000
});

// Update
await websiteService.update('website-id', {
  name: 'Updated Name'
});

// Delete
await websiteService.delete('website-id');
```

#### Alert Service (`lib/api/alert.service.ts`)
```typescript
import { alertService } from '@/lib/api';

// Get all alerts
const alerts = await alertService.getAll({
  severity: 'critical',
  status: 'active',
  page: 1,
  page_size: 20
});

// Mark as read
await alertService.markAsRead('alert-id');

// Resolve alert
await alertService.resolve('alert-id');
```

#### Analytics Service (`lib/api/analytics.service.ts`)
```typescript
import { analyticsService } from '@/lib/api';

// Dashboard summary
const summary = await analyticsService.getSummary();

// Uptime data
const uptime = await analyticsService.getUptime({
  start_date: '2024-01-01',
  end_date: '2024-01-31'
});

// Performance data
const performance = await analyticsService.getPerformance({
  website_id: 'website-id',
  interval: 'hour'
});
```

### 3. Authentication Context

Provides global auth state:

```typescript
'use client';

import { useAuth } from '@/lib/contexts/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Protected Routes

Wrap pages that require authentication:

```typescript
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

For pages that should redirect authenticated users (login/signup):

```typescript
<ProtectedRoute requiredAuth={false} redirectTo="/dashboard">
  <div>Login form</div>
</ProtectedRoute>
```

### 5. WebSocket Integration

Real-time updates for monitoring data:

```typescript
import { useWebSocket } from '@/lib/hooks';

export default function Dashboard() {
  const { isConnected } = useWebSocket({
    onMonitoringUpdate: (data) => {
      console.log('Website status update:', data);
      // Update UI with new monitoring data
    },
    onAlertTriggered: (data) => {
      console.log('New alert:', data);
      // Show notification or update alerts list
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  });

  return (
    <div>
      {isConnected && (
        <span className="text-green-600">● Live</span>
      )}
    </div>
  );
}
```

## API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user |

### Websites

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/websites` | List all websites |
| POST | `/websites` | Create new website |
| GET | `/websites/:id` | Get website details |
| PUT | `/websites/:id` | Update website |
| DELETE | `/websites/:id` | Delete website |

### Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/monitoring/logs` | Get monitoring logs |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alerts` | List alerts |
| PUT | `/alerts/:id` | Update alert |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Dashboard statistics |
| GET | `/analytics/uptime` | Uptime data |
| GET | `/analytics/performance` | Performance metrics |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8080/api/v1/ws` | WebSocket connection |

## Error Handling

### Frontend Error Handling

```typescript
try {
  const websites = await websiteService.getAll();
} catch (error) {
  if (error instanceof Error) {
    // User-friendly error message
    console.error(error.message);
    // Show toast notification
  }
}
```

### Backend Response Format

**Success:**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Considerations

### 1. CORS Configuration (Backend)

```go
// backend/cmd/server/main.go
router.Use(middleware.CORSMiddleware(&config.CORSConfig{
    AllowedOrigins: []string{"http://localhost:3000"},
    AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
    AllowedHeaders: []string{"Authorization", "Content-Type"},
}))
```

### 2. Token Storage

- **Access Token**: Stored in `localStorage` (short-lived: 15min)
- **Refresh Token**: Stored in `localStorage` (long-lived: 7 days)
- Tokens automatically attached to requests via interceptor

### 3. Protected Endpoints

Backend validates JWT on all protected endpoints:

```typescript
// Frontend automatically includes token
const websites = await apiClient.get('/websites');

// Backend extracts and validates token
// Authorization: Bearer <token>
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
docker-compose up -d
go run cmd/server/main.go
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Flow

1. **Register**: Navigate to http://localhost:3000/signup
2. **Login**: Use credentials to login
3. **Dashboard**: View dashboard at http://localhost:3000/dashboard
4. **Add Website**: Create a new monitoring target
5. **Real-time Updates**: Watch WebSocket updates in browser console

## Production Deployment

### Environment Variables

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.monitorx.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.monitorx.com/api/v1/ws
NEXT_PUBLIC_APP_ENV=production
```

**Backend (.env):**
```env
APP_PORT=8080
CORS_ALLOWED_ORIGINS=https://monitorx.com,https://www.monitorx.com
JWT_SECRET=<strong-secret>
```

### Build Commands

**Frontend:**
```bash
npm run build
npm run start
```

**Backend:**
```bash
make build
./bin/server
```

## Troubleshooting

### Issue: CORS Errors

**Solution**: Verify `CORS_ALLOWED_ORIGINS` in backend includes frontend URL

### Issue: 401 Unauthorized

**Solution**: Check token expiry, ensure refresh token is valid

### Issue: WebSocket Connection Failed

**Solution**: 
- Verify WebSocket URL format
- Check authentication token is valid
- Ensure backend WebSocket handler is running

### Issue: API calls failing

**Solution**:
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running on correct port
- Check browser console for detailed errors

## Performance Optimization

1. **API Request Caching**: Implement SWR or React Query
2. **WebSocket Reconnection**: Automatic with exponential backoff
3. **Lazy Loading**: Code-split routes for faster initial load
4. **Token Refresh**: Happens automatically in background

## Next Steps

1. ✅ Test complete user flow
2. ✅ Add loading states and error boundaries
3. ✅ Implement toast notifications
4. ✅ Add charts for analytics visualization
5. ✅ Set up production deployment
6. ✅ Configure SSL/TLS for HTTPS
7. ✅ Set up monitoring and logging

---

## Support

For issues or questions:
1. Check backend logs: `docker-compose logs -f backend`
2. Check browser console for frontend errors
3. Review API documentation in backend/API_DOCUMENTATION.md
