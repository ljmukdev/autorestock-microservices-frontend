# AutoRestock User Service

The User Service is the single source of truth for users/tenants in the AutoRestock microservices system. It handles user onboarding, aliases, external connections (eBay, Gmail), and provides a simple JWT authentication layer.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation
```bash
cd user-service
npm install
```

### Environment Variables
Create a `.env` file in the user-service directory:

```bash
# JWT Secret (required)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### Running the Service
```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Health Check
```http
GET /health
```

### User Management

#### Create User (MVP)
```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Register User (Full Registration)
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-123-4567",
  "businessName": "John's Store",
  "businessType": "small-business",
  "industry": "fashion",
  "platforms": ["ebay", "amazon"],
  "inventorySize": "51-200",
  "timezone": "UTC-5",
  "terms": true,
  "marketing": false
}
```

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <jwt-token>
# OR for MVP testing:
X-User-Email: user@example.com
```

### Alias Management

#### Create Alias
```http
POST /api/v1/tenants/:tenantId/aliases
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "alias": "my-store-alias"
}
```

#### Get Aliases
```http
GET /api/v1/tenants/:tenantId/aliases
Authorization: Bearer <jwt-token>
```

#### Lookup by Alias (Public - for other services)
```http
GET /api/v1/alias/:alias
```

### Connection Management

#### Set eBay Connection
```http
POST /api/v1/connections/ebay
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "connected": true,
  "metadata": {
    "accountId": "ebay-account-123",
    "lastSync": "2024-01-15T10:30:00Z"
  }
}
```

#### Set Gmail Connection
```http
POST /api/v1/connections/gmail
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "connected": true,
  "metadata": {
    "email": "user@gmail.com",
    "lastSync": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Connection Status
```http
GET /api/v1/connections/status
Authorization: Bearer <jwt-token>
```

### Onboarding Status

#### Get Onboarding Status
```http
GET /api/v1/onboarding/status
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "onboarding": {
    "status": "in_progress",
    "completionPercentage": 67,
    "steps": {
      "ebayConnection": {
        "completed": true,
        "required": true
      },
      "gmailConnection": {
        "completed": false,
        "required": true
      },
      "aliasSetup": {
        "completed": true,
        "required": true
      }
    },
    "connections": {
      "ebay": true,
      "gmail": false
    },
    "aliases": [
      {
        "id": "alias-id",
        "alias": "my-store-alias",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

## 🧪 Testing with Postman

### 1. Health Check
```http
GET https://your-user-service-url.up.railway.app/health
```

### 2. Create User
```http
POST https://your-user-service-url.up.railway.app/api/v1/users
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User"
}
```

### 3. Register User (Full)
```http
POST https://your-user-service-url.up.railway.app/api/v1/users/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User",
  "businessName": "Test Business",
  "terms": true
}
```

### 4. Get Current User (with JWT)
```http
GET https://your-user-service-url.up.railway.app/api/v1/users/me
Authorization: Bearer <jwt-token-from-registration>
```

### 5. Get Current User (MVP Mock)
```http
GET https://your-user-service-url.up.railway.app/api/v1/users/me
X-User-Email: test@example.com
```

### 6. Create Alias
```http
POST https://your-user-service-url.up.railway.app/api/v1/tenants/:tenantId/aliases
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "alias": "test-store-alias"
}
```

### 7. Set eBay Connection
```http
POST https://your-user-service-url.up.railway.app/api/v1/connections/ebay
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "connected": true,
  "metadata": {
    "accountId": "test-ebay-account"
  }
}
```

### 8. Get Onboarding Status
```http
GET https://your-user-service-url.up.railway.app/api/v1/onboarding/status
Authorization: Bearer <jwt-token>
```

## 🔧 Data Store

The service uses an in-memory data store with JSON file persistence for MVP. Data is automatically saved to `data/data.json` and loaded on startup.

### Data Structure
```javascript
{
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "tenantId": "tenant-uuid",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "tenants": [
    {
      "id": "tenant-uuid",
      "userId": "user-uuid",
      "name": "John's Business",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "aliases": [
    {
      "id": "alias-uuid",
      "tenantId": "tenant-uuid",
      "alias": "my-store-alias",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "connections": [
    {
      "userId": "user-uuid",
      "type": "ebay",
      "connected": true,
      "metadata": {},
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## 🔐 Authentication

### JWT Authentication
- Uses JWT tokens with configurable secret
- Tokens expire in 7 days
- Include token in `Authorization: Bearer <token>` header

### MVP Mock Authentication
- For testing without full auth flow
- Include `X-User-Email: user@example.com` header
- Creates mock user context

## 🚀 Railway Deployment

### 1. Create Railway Project
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub repo
3. Select the `user-service` directory

### 2. Set Environment Variables
In Railway dashboard, set:
```
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 3. Deploy
Railway will automatically deploy from your GitHub repository.

## 🔗 Integration with Other Services

### Email Ingestion Service
```javascript
// Resolve tenant by alias
const response = await fetch('https://user-service-url/api/v1/alias/my-store-alias');
const { tenantId } = await response.json();
```

### Purchases/Sales Services
```javascript
// Tag records with tenantId from user context
const tenantId = req.user.tenantId;
```

### Settings Service
```javascript
// Fetch settings per tenantId
const tenantId = req.user.tenantId;
```

## 📊 Monitoring

### Health Check
- Endpoint: `/health`
- Returns service status, uptime, and version
- Use for Railway health checks

### Logging
- All operations logged to console
- Errors include stack traces in development
- Production logs available in Railway dashboard

## 🛠️ Development

### Project Structure
```
user-service/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── routes/               # API route definitions
│   ├── users.js
│   ├── aliases.js
│   ├── connections.js
│   └── onboarding.js
├── controllers/          # Business logic
│   ├── userController.js
│   ├── aliasController.js
│   ├── connectionController.js
│   └── onboardingController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── data/                 # Data persistence
│   ├── store.js
│   └── data.json        # Auto-generated data file
└── README.md
```

### Adding New Endpoints
1. Add route in appropriate `routes/*.js` file
2. Add controller method in `controllers/*.js` file
3. Update validation middleware if needed
4. Test with Postman

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` environment variable
   - Ensure frontend domain is included

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration (7 days)
   - Ensure token is in `Authorization: Bearer <token>` format

3. **Data Not Persisting**
   - Check file permissions for `data/data.json`
   - Verify data store initialization

4. **Service Not Starting**
   - Check Railway logs
   - Verify all environment variables are set
   - Check port configuration

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.

## 📝 MVP Definition of Done

- ✅ Service deployed on Railway
- ✅ Can create a user/tenant and alias
- ✅ `/onboarding/status` reflects connections + alias state
- ✅ Email-ingestion can call alias lookup to resolve tenantId
- ✅ JWT authentication working
- ✅ All endpoints tested and functional
- ✅ Data persistence working
- ✅ Health check endpoint responding
