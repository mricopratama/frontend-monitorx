# MonitorX Frontend - Quick Start

## Installation

```bash
cd frontend
npm install
```

## Required Dependencies

Add axios for API calls:

```bash
npm install axios
```

## Environment Setup

1. Copy example environment file:

```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080/api/v1/ws
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## Running the Application

### Development

```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── app/                        # Next.js App Router pages
│   ├── login/                  # Login page
│   ├── signup/                 # Registration page
│   ├── dashboard/              # Protected dashboard routes
│   │   ├── page.tsx           # Main dashboard
│   │   ├── websites/          # Website management
│   │   ├── monitor/           # Website monitoring details
│   │   ├── alerts/            # Alerts management
│   │   └── settings/          # User settings
│   └── layout.tsx             # Root layout with AuthProvider
├── lib/
│   ├── api/                   # API client and services
│   │   ├── client.ts          # Axios client with interceptors
│   │   ├── auth.service.ts    # Authentication API
│   │   ├── website.service.ts # Website API
│   │   ├── alert.service.ts   # Alert API
│   │   ├── monitoring.service.ts # Monitoring API
│   │   └── analytics.service.ts  # Analytics API
│   ├── contexts/              # React contexts
│   │   └── auth-context.tsx   # Authentication context
│   ├── hooks/                 # Custom hooks
│   │   ├── use-websocket.ts   # WebSocket hook
│   │   └── index.ts
│   ├── types/                 # TypeScript types
│   │   └── api.ts             # API response types
│   ├── config.ts              # App configuration
│   └── utils.ts               # Utility functions
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── protected-route.tsx    # Route protection HOC
└── public/                    # Static assets
```

## Key Features Implemented

### ✅ Authentication System
- User registration and login
- JWT token management with auto-refresh
- Protected routes
- Auth context for global state

### ✅ API Integration
- Centralized API client with Axios
- Automatic token attachment
- Error handling and retry logic
- Type-safe API services

### ✅ Real-time Updates
- WebSocket connection for live monitoring
- Automatic reconnection
- Real-time website status updates
- Live alert notifications

### ✅ Dashboard Features
- Website monitoring overview
- Real-time statistics
- Alert management
- Performance analytics

## Usage Examples

### Using Authentication

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

### Making API Calls

```typescript
import { websiteService } from '@/lib/api';

// Get all websites
const websites = await websiteService.getAll({ page: 1, page_size: 10 });

// Create new website
const newWebsite = await websiteService.create({
  name: 'My Website',
  url: 'https://example.com',
  monitoring_interval: 60,
  timeout_threshold: 5000
});
```

### Using WebSocket

```typescript
import { useWebSocket } from '@/lib/hooks';

const { isConnected } = useWebSocket({
  onMonitoringUpdate: (data) => {
    console.log('New monitoring data:', data);
  },
  onAlertTriggered: (alert) => {
    console.log('New alert:', alert);
  },
});
```

### Protecting Routes

```typescript
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content - only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

## Testing the Integration

1. **Start Backend** (in separate terminal):
```bash
cd backend
docker-compose up -d
go run cmd/server/main.go
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Test Flow**:
   - Navigate to http://localhost:3000
   - Click "Sign Up" and create an account
   - Login with your credentials
   - Add a website to monitor
   - View real-time updates on dashboard

## Environment Configuration

### Development
- API URL: `http://localhost:8080/api/v1`
- WebSocket: `ws://localhost:8080/api/v1/ws`

### Production
Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.monitorx.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.monitorx.com/api/v1/ws
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_DEBUG=false
```

## Troubleshooting

### CORS Errors
Ensure backend `CORS_ALLOWED_ORIGINS` includes your frontend URL:
```env
# backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 401 Unauthorized
- Check if backend is running
- Verify JWT_SECRET is configured in backend
- Clear localStorage and login again

### WebSocket Connection Failed
- Verify WebSocket URL is correct
- Check if backend WebSocket handler is running
- Ensure authentication token is valid

## Next Steps

1. Review [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed integration docs
2. Check [backend/API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md) for API reference
3. Customize UI components in `components/ui/`
4. Add additional features as needed

---

**Ready to monitor your websites! 🚀**
