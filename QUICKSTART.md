# Chef SES - Quick Start Guide 🚀

## Get Running in 2 Minutes

### 1. Install Dependencies (30 seconds)
```bash
npm install
```

### 2. Start the Server (5 seconds)
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 3. Open Your Browser
Navigate to: `http://localhost:5000`

You'll see the profile selection screen with two options:
- **Compte Groupe** - For group administrators
- **Compte Site** - For individual site managers

## First Steps

### Create a Group Account
1. Click "Compte Groupe" → "S'inscrire"
2. Fill in the registration form:
   - Name: Your name
   - Email: your@email.com
   - Password: Choose a secure password
   - Account Type: **Groupe** (for central administration)
   - Business Name: Your organization name
3. Click "S'inscrire"

You'll be redirected to the Group Dashboard where you can:
- Create and manage multiple sites
- View all residents across sites
- Manage centralized menus

### Create Your First Site
1. From Group Dashboard, click "+ Créer un site"
2. Enter:
   - Site Name: e.g., "EHPAD Saint-Michel"
   - Type: Select from EHPAD, Hospital, School, etc.
3. Click "Créer"

### Add a Resident
1. Click on your newly created site
2. Go to "Résidents" in the sidebar
3. Click "+ Ajouter un résident"
4. Fill in personal information and nutritional profile
5. Click "Enregistrer"

## What's Already Configured

✅ **Database**: Supabase PostgreSQL with complete schema
✅ **Authentication**: Supabase Auth with JWT tokens
✅ **Security**: Row Level Security (RLS) policies enabled
✅ **API**: RESTful API with Express.js
✅ **Frontend**: Vite with responsive design

## Features Available Out-of-the-Box

### Multi-Site Management
- Create unlimited sites
- Each site type (EHPAD, hospital, school) has specific features
- Centralized administration from group dashboard

### Resident Management
- Comprehensive nutritional profiles
- Allergy tracking with severity levels
- Dietary restrictions (religious, ethical, medical)
- Emergency contact information
- Modification history

### Menu System
- Weekly menu planning
- Synchronization from group to sites
- Site-specific customization

### Security
- Role-based access control (GROUP_ADMIN, SITE_MANAGER, etc.)
- Data isolation between groups and sites
- Secure authentication with HTTP-only cookies

## Optional: Enable AI Features

To enable AI-powered menu and recipe generation:

1. Get an OpenAI API key from https://platform.openai.com/
2. Add to `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the server
4. Use API endpoints:
   - `POST /api/ai/generate-menu` - Generate weekly menus
   - `POST /api/ai/generate-recipe` - Create recipes

## Available Pages

### Public Pages
- `/` - Profile selector
- `/pages/login.html` - Group login
- `/pages/register.html` - Registration
- `/pages/site-login.html` - Site login

### Protected Pages (Requires Login)
- `/pages/group-dashboard.html` - Group administration
- `/pages/site-dashboard.html` - Site management
- `/pages/site-residents.html` - Resident list
- `/pages/add-resident.html` - Add new resident

## API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "role": "groupe",
  "businessName": "My Organization"
}

# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "securepass"
}

# Get current user
GET /api/auth/me
Cookie: token=<jwt-token>
```

### Sites
```bash
# List sites in a group
GET /api/groups/{groupId}/sites

# Create a site
POST /api/groups/{groupId}/sites
Content-Type: application/json
{
  "siteName": "EHPAD Saint-Michel",
  "type": "ehpad"
}

# Get site details
GET /api/sites/{siteId}

# Get site menus
GET /api/sites/{siteId}/menus?yearWeek=2024-W15
```

### Residents
```bash
# List residents in a site
GET /api/residents/site/{siteId}?status=actif&search=dupont

# Create a resident
POST /api/residents
Content-Type: application/json
{
  "first_name": "Marie",
  "last_name": "Dupont",
  "date_of_birth": "1945-03-15",
  "gender": "femme",
  "room_number": "101",
  "siteId": "uuid",
  "groupId": "uuid",
  "nutritional_profile": {
    "allergies": [
      {"allergen": "Arachides", "severity": "sévère"}
    ]
  }
}

# Update a resident
PUT /api/residents/{id}

# Delete (mark inactive)
DELETE /api/residents/{id}
```

## Database Access

Your Supabase database is at:
```
URL: https://0ec90b57d6e95fcbda19832f.supabase.co
```

Tables created:
- `groups` - Organizations
- `sites` - Individual establishments
- `users` - User accounts
- `residents` - People in establishments
- `recipes` - Recipe database
- `menus` - Weekly menus
- `stocks` - Inventory
- `suppliers` - Supplier catalog
- `orders` - Purchase orders

All tables have Row Level Security enabled!

## Troubleshooting

### Server won't start
- Check port 5000 is available
- Run `npm install` again

### Can't login
- Make sure you registered first
- Check browser console for errors
- Clear cookies and try again

### Database errors
- Verify `.env` has correct Supabase credentials
- Check Supabase dashboard for connection status

### Build fails
```bash
npm run build
```
If this fails, check for TypeScript errors or missing dependencies.

## Next Steps

1. **Read SETUP.md** for detailed documentation
2. **Explore the code** in `src/` and `server/`
3. **Test the API** with Postman or curl
4. **Customize** for your needs

## Support

Need help? Check:
- [SETUP.md](./SETUP.md) - Complete documentation
- [README.md](./README.md) - Project overview
- Browser console for frontend errors
- Server console for backend errors

---

Built with ❤️ using Vite, Express, and Supabase
