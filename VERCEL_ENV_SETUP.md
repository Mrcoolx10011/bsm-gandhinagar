# Vercel Environment Variables Setup

Before deploying to Vercel, you need to set up the following environment variables in your Vercel dashboard:

## Required Environment Variables

1. **DATABASE_URL**
   - Value: `mongodb+srv://mrcoolx:root%40123@cluster0.ubpz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - Description: MongoDB Atlas connection string

2. **JWT_SECRET**
   - Value: `your-super-secret-jwt-key-here-bsm-gandhinagar-2024`
   - Description: Secret key for JWT token generation

3. **ADMIN_USERNAME**
   - Value: `admin`
   - Description: Default admin username

4. **ADMIN_PASSWORD**
   - Value: `admin123`
   - Description: Default admin password

5. **ADMIN_EMAIL**
   - Value: `admin@bsmgandhinagar.org`
   - Description: Default admin email

## How to Set Environment Variables in Vercel

### Method 1: Using Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables"
4. Add each variable with its value
5. Make sure to select "Production", "Preview", and "Development" for each variable

### Method 2: Using Vercel CLI
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_EMAIL
```

## Security Note
⚠️ **Important**: Never commit your `.env` file to version control. The actual values should only be set in Vercel's environment variables.
