# Chef SES - Setup Guide

## 🎯 Overview

Chef SES is a comprehensive multi-site canteen management system with AI-powered menu generation, built with modern web technologies.

## 🏗️ Architecture

- **Frontend**: Vite + Vanilla JavaScript
- **Backend**: Express.js + Node.js
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 for menu and recipe generation

## 📋 Prerequisites

- Node.js (v16+)
- A Supabase account (already configured with connection details in `.env`)
- OpenAI API key (optional, for AI features)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with Supabase credentials:

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional**: Add your OpenAI API key for AI features:

```env
OPENAI_API_KEY=your-openai-api-key
```

### 3. Database Setup

The database schema is already created in Supabase with the following tables:

- `groups` - Central organizations
- `sites` - Individual establishments
- `users` - User accounts with roles
- `residents` - People in establishments with nutritional profiles
- `recipes` - Recipe database
- `menus` - Weekly menus
- `stocks` - Inventory management
- `suppliers` - Supplier catalog
- `orders` - Purchase orders

All tables have Row Level Security (RLS) enabled for secure data access.

### 4. Start the Development Server

```bash
npm run dev
```

This starts the Express backend on `http://localhost:5000`

The frontend is served through Vite's dev server configured as a proxy.

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## 📁 Project Structure

```
chef-ses/
├── src/                      # Frontend source
│   ├── pages/               # HTML pages
│   │   ├── index.html       # Profile selector
│   │   ├── login.html       # Group login
│   │   ├── register.html    # Registration
│   │   ├── site-login.html  # Site login
│   │   ├── group-dashboard.html
│   │   ├── site-dashboard.html
│   │   ├── site-residents.html
│   │   └── add-resident.html
│   └── styles/
│       └── main.css         # Main stylesheet
│
├── server/                  # Backend source
│   ├── index.js            # Express server
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   └── residentController.js
│   ├── routes/            # API routes
│   │   ├── authRoutes.js
│   │   ├── siteRoutes.js
│   │   ├── residentRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── recipeRoutes.js
│   │   └── aiRoutes.js
│   ├── middleware/        # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   └── services/          # Business logic
│       ├── supabase.js    # Supabase client
│       └── openaiService.js
│
├── .env                    # Environment variables
├── package.json
├── vite.config.js
└── README.md
```

## 🔐 Authentication Flow

### Group Account
1. Navigate to `/pages/login.html`
2. Login with group admin credentials
3. Access group dashboard to manage multiple sites

### Site Account
1. Navigate to `/pages/site-login.html`
2. Login with site manager credentials
3. Access site dashboard to manage residents and view menus

## 👥 User Roles

- **GROUP_ADMIN**: Manage multiple sites, create sites, centralized view
- **SITE_MANAGER**: Manage individual site, residents, local operations
- **CHEF**: Menu and recipe management
- **NUTRITIONIST**: Nutritional profile management
- **SUPPLIER**: Product and catalog management
- **VIEWER**: Read-only access

## 🔒 Security Features

### Row Level Security (RLS)
All Supabase tables have RLS policies that:
- Restrict data access based on user's group/site membership
- Ensure users can only see and modify authorized data
- Group admins can access all sites in their group
- Site managers can only access their assigned site

### Authentication
- Supabase Auth with email/password
- JWT tokens stored in HTTP-only cookies
- Session management with automatic refresh

## 🍽️ Key Features

### 1. Multi-Site Management
- Create and manage multiple sites from group dashboard
- Each site has its own managers and configuration
- Centralized reporting and oversight

### 2. Resident Management
- Comprehensive nutritional profiles
- Allergies and intolerances tracking with severity levels
- Dietary restrictions (religious, ethical, medical)
- Medical conditions and texture preferences
- Emergency contact information
- Modification history tracking

### 3. Menu Synchronization
- Create menus at group level
- Auto-sync to all sites
- Site-specific overrides possible
- Weekly menu planning

### 4. AI-Powered Features (Requires OpenAI API Key)
- **Menu Generation**: Generate weekly menus based on:
  - Establishment type (EHPAD, hospital, school, etc.)
  - Number of people
  - Dietary restrictions
  - Allergies
  - Nutritional requirements

- **Recipe Generation**: Create recipes from:
  - Available ingredients
  - Dietary restrictions
  - Serving sizes

### 5. Stock Management
- Track inventory by site
- Low stock alerts
- Expiration date monitoring
- Supplier integration

## 🎨 Establishment Types

The system supports multiple establishment types:
- **EHPAD**: Specialized care homes
- **Hôpital**: Hospitals with therapeutic diets
- **École**: School canteens with child-friendly menus
- **Maison de retraite**: Retirement homes
- **Cantine d'entreprise**: Corporate cafeterias
- **Collectivité**: Multi-establishment organizations

Each type has specific menu requirements and nutritional considerations.

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups/:groupId/sites` - List group sites
- `POST /api/groups/:groupId/sites` - Create site

### Sites
- `GET /api/sites/:siteId` - Get site details
- `GET /api/sites/:siteId/menus` - Get site menus

### Residents
- `POST /api/residents` - Create resident
- `GET /api/residents/site/:siteId` - List site residents
- `GET /api/residents/group/:groupId` - List group residents
- `GET /api/residents/:id` - Get resident details
- `PUT /api/residents/:id` - Update resident
- `DELETE /api/residents/:id` - Mark resident as inactive

### AI
- `POST /api/ai/generate-menu` - Generate AI menu
- `POST /api/ai/generate-recipe` - Generate AI recipe

## 📊 Database Schema

### Groups
```sql
id, name, code, contact_email, settings, is_active, subscription
```

### Sites
```sql
id, group_id, site_name, type, address, contact, managers,
sync_mode, is_active, settings, last_sync_at, sync_status
```

### Users
```sql
id, name, email, roles[], group_id, site_id, business_name,
establishment_type, phone, address, created_at
```

### Residents
```sql
id, first_name, last_name, date_of_birth, gender, phone, email,
address, room_number, nutritional_profile (JSONB), emergency_contact,
status, site_id, group_id, created_by, modification_history
```

## 🐛 Troubleshooting

### Server won't start
- Check that port 5000 is available
- Verify `.env` file exists with Supabase credentials

### Database errors
- Verify Supabase credentials in `.env`
- Check RLS policies allow your user to access data
- Ensure migrations have been applied

### AI features not working
- Add `OPENAI_API_KEY` to `.env`
- Verify OpenAI API key is valid
- Check OpenAI API quota/limits

### Authentication fails
- Clear browser cookies and localStorage
- Verify Supabase auth is enabled
- Check user exists in Supabase Auth and `users` table

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set these in production:
```env
NODE_ENV=production
PORT=5000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key (optional)
```

### Hosting Recommendations
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Netlify, Vercel, Cloudflare Pages
- **Database**: Supabase (already configured)

## 📝 Notes

- Email confirmation is disabled by default
- Session tokens expire after 7 days
- All timestamps use UTC timezone
- Default pagination limit: 50 items per page
- File uploads not yet implemented

## 🤝 Support

For issues or questions:
1. Check this setup guide
2. Review Supabase documentation
3. Check browser console for errors
4. Verify API responses in Network tab

## 📄 License

ISC
