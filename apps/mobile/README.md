# COTH Mobile App (React Native)

## 📱 Placeholder for Frontend Development

This directory is reserved for the **React Native mobile application** that will be developed by the frontend team.

### Technology Stack (Proposed)

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: TBD (Redux/Zustand/Context)
- **Navigation**: React Navigation
- **API Client**: Axios or Fetch
- **Authentication**: JWT with secure storage

### API Integration

The mobile app will connect to the COTH API at:
- **Base URL**: `http://localhost:3006/api/v1` (development)
- **Production URL**: TBD

### API Endpoints Available

See the API documentation at `/apps/api/README.md` for complete endpoint list.

Key endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /profile` - User profile
- `GET /activity/feed` - Activity feed
- `GET /quota` - Quota information

### Setup Instructions (For Frontend Team)

```bash
# Navigate to mobile directory
cd apps/mobile

# Install dependencies
npm install

# Start development server
npm run dev

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Environment Variables

Create a `.env` file:
```
API_URL=http://localhost:3006/api/v1
GOOGLE_CLIENT_ID=your_google_client_id
```

### Folder Structure (Suggested)

```
apps/mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   └── constants/        # Constants and config
├── assets/               # Images, fonts, etc.
├── App.tsx              # Root component
└── package.json
```

### Notes for Frontend Team

1. **API Connection**: The backend API is already implemented and running on port 3006
2. **Authentication**: Use JWT tokens (access + refresh) for authentication
3. **Data Models**: Refer to `/apps/api/prisma/schema.prisma` for data structure
4. **API Documentation**: Swagger docs available at `http://localhost:3006/api/v1/docs`
5. **Shared Database**: The API connects to the same database as EasyMate (no data migration needed)

### Contact

For API questions or integration issues, contact the backend team.

---

**Status**: Placeholder - Ready for Frontend Implementation
