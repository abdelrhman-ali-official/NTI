# Vercel Deployment Guide

## Prerequisites
- Vercel account ([vercel.com](https://vercel.com))
- Git repository pushed to GitHub, GitLab, or Bitbucket

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Your Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your Git repository

2. **Configure Project**
   - Framework Preset: **Other** (or Angular if available)
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/nti-attendance-frontend/browser`
   - Install Command: `npm install`

3. **Environment Variables** (Important!)
   Add these in Vercel dashboard under Project Settings → Environment Variables:
   ```
   NODE_VERSION=18
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

## Configuration Files

This project includes the following Vercel configuration:

- **vercel.json** - Routing and build configuration
- **.vercelignore** - Files to exclude from deployment

## Important Notes

1. **API Configuration**: Update your environment files to point to your production API:
   - `src/environments/environment.prod.ts`
   - Set the correct `apiUrl` for your backend

2. **Build Output**: The build output is in `dist/nti-attendance-frontend/browser`

3. **Routing**: All routes are redirected to `index.html` for Angular routing to work

4. **CORS**: Ensure your backend API allows requests from your Vercel domain

## Environment Variables

In Vercel dashboard, configure:
- `NODE_VERSION`: 18
- Any other API keys or configuration needed

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Routing Issues (404 on refresh)
- Verify `vercel.json` configuration is present
- Ensure rewrites redirect to `/index.html`

### API Connection Issues
- Check CORS settings on backend
- Verify API URL in `environment.prod.ts`
- Ensure environment variables are set in Vercel

## Local Build Test

Test your production build locally before deploying:

```bash
npm run build:prod
```

The output will be in `dist/nti-attendance-frontend/browser`

## Useful Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]
```

## Support

For more information:
- [Vercel Documentation](https://vercel.com/docs)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
