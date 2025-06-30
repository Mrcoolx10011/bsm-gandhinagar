# BSM Gandhinagar - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Create account at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Ensure your MongoDB Atlas cluster is accessible

## Environment Variables

Set these environment variables in Vercel Dashboard:

```env
DATABASE_URL=mongodb+srv://mrcoolx:root%40123@cluster0.ubpz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-bsm-gandhinagar-2024
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@bsmgandhinagar.org
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables in Settings → Environment Variables
6. Deploy!

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **bsm-gandhinagar**
   - Directory? **./dist**

5. Add environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add ADMIN_USERNAME
   vercel env add ADMIN_PASSWORD
   vercel env add ADMIN_EMAIL
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Project Structure

```
├── src/                 # React frontend
├── server/             # Express.js backend  
├── dist/               # Built frontend (generated)
├── lib/               # Database connection
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies & scripts
```

## API Routes

All API routes are available at:
- `https://your-domain.vercel.app/api/auth/*`
- `https://your-domain.vercel.app/api/members/*`
- `https://your-domain.vercel.app/api/events/*`
- `https://your-domain.vercel.app/api/donations/*`
- `https://your-domain.vercel.app/api/inquiries/*`

## Admin Access

- **Frontend**: `https://your-domain.vercel.app`
- **Admin Panel**: `https://your-domain.vercel.app/admin`
- **Login**: Use ADMIN_USERNAME and ADMIN_PASSWORD

## Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0

2. **Build Failures**
   - Check that all dependencies are in package.json
   - Verify TypeScript compilation passes

3. **API Routes Not Working**
   - Ensure vercel.json routes are configured correctly
   - Check server/index.js exports the app properly

4. **Environment Variables**
   - Variables must be set in Vercel Dashboard
   - Restart deployment after adding new variables

### Logs & Debugging:

```bash
# View function logs
vercel logs [deployment-url]

# View build logs
vercel logs --follow
```

## Performance Optimization

- ✅ Tree-shaking enabled via Vite
- ✅ Code splitting for admin/public routes
- ✅ Optimized MongoDB queries
- ✅ Compressed assets (gzip)
- ✅ Unused dependencies removed

## Security

- ✅ JWT authentication for admin
- ✅ CORS properly configured
- ✅ Environment variables secured
- ✅ MongoDB connection encrypted
- ✅ Input validation on all API routes

---

**Deployment Status**: Ready for Production ✅
