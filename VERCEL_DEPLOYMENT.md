# Vercel Deployment Guide for BSM Gandhinagar NGO Platform

## 🚀 Deploy to Vercel

### Prerequisites
- Vercel account ([sign up here](https://vercel.com))
- Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Prepare Your Repository

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)
   ```bash
   git init
   git add .
   git commit -m "Initial commit - BSM NGO Platform"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - What's your project's name? **bsm-gandhinagar** (or your preferred name)
   - In which directory is your code located? **./**

#### Option B: Using Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your Git repository**
4. **Configure the project:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-for-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@bsmgandhinagar.org
NODE_ENV=production
```

### Step 4: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

## 📁 Project Structure for Vercel

```
project/
├── api/                    # Vercel Serverless Functions
│   ├── auth.js            # Authentication API
│   ├── members.js         # Members management API
│   ├── events.js          # Events management API
│   ├── donations.js       # Donations API
│   ├── inquiries.js       # Inquiries API
│   └── stats.js           # Statistics API
├── src/                   # Frontend React app
├── lib/                   # Database utilities
│   ├── prisma.js          # Database adapter
│   └── serverless-db.js   # Serverless database init
├── vercel.json            # Vercel configuration
└── package.json
```

## 🌐 API Endpoints (After Deployment)

Your APIs will be available at:
- `https://your-app.vercel.app/api/auth`
- `https://your-app.vercel.app/api/members`
- `https://your-app.vercel.app/api/events`
- `https://your-app.vercel.app/api/donations`
- `https://your-app.vercel.app/api/inquiries`
- `https://your-app.vercel.app/api/stats`

## 🗄️ Database

This setup uses SQLite with serverless functions. For production, consider:

### Option 1: Keep SQLite (Simple)
- ✅ Works out of the box
- ✅ No additional setup required
- ⚠️ Data is temporary (resets on each deployment)

### Option 2: Upgrade to Serverless Database (Recommended for Production)

**PlanetScale (MySQL)**
```env
DATABASE_URL=mysql://username:password@host:3306/database
```

**Supabase (PostgreSQL)**
```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

**MongoDB Atlas**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database
```

## 🔧 Troubleshooting

### Build Issues
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify environment variables are set

### API Issues
- Check function logs in Vercel dashboard
- Ensure database connection is working
- Verify API routes are accessible

### Database Issues
- For persistent data, use external database service
- Check database connection strings
- Ensure proper environment variables

## 📊 Monitoring

- **Analytics**: Available in Vercel dashboard
- **Logs**: Check function logs for debugging
- **Performance**: Monitor Core Web Vitals

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up proper CORS policies
- [ ] Use environment variables for sensitive data

## 📈 Performance Optimization

- [ ] Enable Edge Caching for static assets
- [ ] Optimize images and assets
- [ ] Use CDN for faster global delivery
- [ ] Monitor function execution times

## 🆙 Updates and Maintenance

1. **Auto-deployments**: Connected Git repository will auto-deploy on push
2. **Manual deployments**: Use `vercel --prod` for manual deployments
3. **Rollbacks**: Use Vercel dashboard to rollback to previous versions

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **BSM Platform Issues**: Create an issue in your repository
- **General Support**: admin@bsmgandhinagar.org

---

**🎉 Your BSM Gandhinagar NGO Platform is now live on Vercel!**
