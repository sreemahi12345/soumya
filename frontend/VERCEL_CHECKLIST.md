# ✅ Vercel Deployment Checklist

## Pre-Deployment Checklist

### Code & Dependencies
- [ ] All code is committed to GitHub
- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds without warnings
- [ ] No console errors when running `npm run dev`

### Environment & Configuration
- [ ] `.env.local` is created from `.env.example`
- [ ] `NEXT_PUBLIC_API_BASE_URL` is set for development
- [ ] Backend API is running and accessible

### Testing
- [ ] Mobile view tested (DevTools device emulation)
- [ ] Desktop view tested (full-screen browser)
- [ ] Navigation works on both layouts
- [ ] Admin login page accessible
- [ ] Images display correctly
- [ ] Forms can be submitted

### Responsive Design
- [ ] Hamburger menu shows on mobile
- [ ] Full navigation shows on desktop
- [ ] Product grid is 1 column on mobile, 3 on desktop
- [ ] Text is readable on all screen sizes
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets are at least 44x44px

---

## Vercel Deployment Steps

### Step 1: GitHub Setup
```bash
# Stage all changes
git add .

# Commit with clear message
git commit -m "Add responsive design and Vercel configuration"

# Push to GitHub
git push origin main
```

### Step 2: Create Vercel Project
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in (or create free account)
- [ ] Click "New Project"
- [ ] Select GitHub repository containing frontend code
- [ ] Click "Import"

### Step 3: Configure Project Settings
- [ ] Project name looks good (e.g., "sowmyakka")
- [ ] Framework preset is "Next.js" (auto-selected)
- [ ] Root directory is "frontend" (if monorepo)
- [ ] Build command is "next build" (auto)
- [ ] Output directory is ".next" (auto)

### Step 4: Add Environment Variables
1. Scroll to "Environment Variables" section
2. Add variable:
   - **Name:** `NEXT_PUBLIC_API_BASE_URL`
   - **Value:** Your backend API URL (e.g., `http://localhost:8000` or `https://api.yourdomain.com`)
   - **Environments:** Select all (Production, Preview, Development)
3. Click "Add"
4. Add more variables if needed:
   - Any other `NEXT_PUBLIC_*` variables
   - Note: Only `NEXT_PUBLIC_*` variables are accessible in browser

### Step 5: Deploy
- [ ] Click "Deploy" button
- [ ] Monitor build progress in console
- [ ] Wait for "Deployment Complete" message (usually 2-3 minutes)
- [ ] Click on preview link to verify deployment

---

## Post-Deployment Verification

### Basic Functionality
- [ ] Website loads without errors
- [ ] Page title shows correctly
- [ ] Navigation works
- [ ] Homepage displays properly
- [ ] Product list loads
- [ ] Images display

### Mobile Testing (After Deployment)
1. Go to your Vercel deployment URL
2. Use DevTools mobile emulation or test on actual phone
3. Verify:
   - [ ] Hamburger menu appears and works
   - [ ] Content is readable
   - [ ] All buttons are tappable
   - [ ] Forms are usable
   - [ ] No horizontal scrolling

### Desktop Testing (After Deployment)
1. Open on desktop browser
2. Verify:
   - [ ] Full navigation displays
   - [ ] Product grid shows 3 columns
   - [ ] Content properly spaced
   - [ ] No layout issues

### API Connection
- [ ] Admin login page loads
- [ ] Try logging in (should work if backend is running)
- [ ] Check browser console for API errors

---

## Troubleshooting During Deployment

### Build Fails
**Check:**
- [ ] Push all changes to GitHub
- [ ] No syntax errors in code
- [ ] `npm run build` works locally
- [ ] Check build logs in Vercel dashboard

### Pages Look Wrong After Deploy
**Check:**
- [ ] Viewport settings in `layout.tsx` are present
- [ ] CSS is loading (check Network tab)
- [ ] No conflicting browser extensions
- [ ] Clear browser cache and hard refresh (Ctrl+Shift+Del)

### API Not Responding
**Check:**
- [ ] `NEXT_PUBLIC_API_BASE_URL` is set in environment variables
- [ ] Backend API is running and accessible
- [ ] CORS headers are configured on backend
- [ ] Check browser console for error details

### Images Not Loading
**Check:**
- [ ] Image URLs are correct
- [ ] Backend server is accessible
- [ ] CORS headers are set (if on different domain)
- [ ] Check Network tab to see response status codes

---

## Continuous Deployment

Once deployed, every time you push to GitHub:
1. Vercel automatically detects the push
2. Rebuilds the project
3. Deploys if build succeeds
4. Shows build status on GitHub

---

## Custom Domain (Optional)

To use your own domain instead of `vercel.app`:

1. In Vercel Dashboard → Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `sowmyakka.com`)
4. Follow instructions for DNS setup
5. Usually takes 5-48 hours to propagate

---

## Environment Variables for Production

When ready to go live with your backend:

1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_BASE_URL` to production URL:
   ```
   https://api.yourdomain.com
   ```
4. Select "Production" environment only
5. Save and redeploy

---

## Monitoring & Analytics

After deployment:

- [ ] Check Vercel Analytics (if enabled)
- [ ] Monitor build times
- [ ] Check deployment logs for issues
- [ ] Set up email notifications for failed builds

---

## Rollback (If Needed)

If something goes wrong:

1. Go to Vercel Dashboard
2. Go to "Deployments"
3. Find previous working deployment
4. Click "Promote to Production"
5. Website reverts to that version

---

## Quick Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Project Settings | https://vercel.com/dashboard/[project-name]/settings |
| Environment Variables | https://vercel.com/dashboard/[project-name]/settings/environment-variables |
| Deployments | https://vercel.com/dashboard/[project-name]/deployments |
| Vercel Docs | https://vercel.com/docs |

---

## 🎉 Success!

Once all checks pass, your website is live and accessible to everyone!

**Live URL:** `https://your-project.vercel.app`

---

**Need help?** Check DEPLOYMENT.md and RESPONSIVE_DESIGN.md for detailed guides.
