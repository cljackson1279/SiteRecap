# Production Deployment Checklist for SiteRecap

## 🚨 CRITICAL: Vercel Environment Variables

The application is working perfectly locally but failing in production because the **Vercel Dashboard environment variables are still set to old URLs**.

### 1. Update Vercel Dashboard Environment Variables

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

**Delete these old variables (if they exist):**
- Any variables containing `site-recap-exaw.vercel.app`
- Any variables containing `dailysitereport.preview.emergentagent.com`
- Old NEXT_PUBLIC_BASE_URL values

**Set these Production Environment Variables:**
```
NEXT_PUBLIC_BASE_URL=https://siterecap.com
NEXT_PUBLIC_SITE_URL=https://siterecap.com  
NEXTAUTH_URL=https://siterecap.com
```

**Important:** Make sure these are set for the **Production** environment specifically.

### 2. Supabase Dashboard Configuration

**Go to Supabase Dashboard → Authentication → URL Configuration**

**Site URL:**
```
https://siterecap.com
```

**Redirect URLs (replace all existing URLs with these):**
```
https://siterecap.com/auth/callback
https://siterecap.com/auth/success
https://siterecap.com/login
https://siterecap.com/dashboard
```

**Email Templates:**
- Confirm signup: `{{ .SiteURL }}/auth/callback`
- Magic Link: `{{ .SiteURL }}/auth/callback`

### 3. Deploy to Production

After updating environment variables:

```bash
# Option 1: Push to main branch (triggers auto-deploy)
git add .
git commit -m "Update environment variables for production"
git push origin main

# Option 2: Manual deployment via Vercel CLI
vercel --prod
```

### 4. Verify Production Deployment

**Test these URLs after deployment:**
- https://siterecap.com/api/debug-urls (should show correct environment variables)
- https://siterecap.com/auth/success (should load without 404)
- Complete signup flow should redirect to siterecap.com (not Vercel URL)

## 🔒 Database Security (RLS) Setup

### Apply RLS Policies to Supabase

1. **Go to Supabase Dashboard → SQL Editor**
2. **Run the RLS setup script:**
   - Copy contents of `/app/database-rls-policies.sql`
   - Execute in SQL Editor
   - This will secure all tables with proper Row Level Security

### Verify RLS is Working

Test that users can only access their own data:
- Create test accounts
- Verify users can't see other users' projects
- Confirm organization isolation works

## 📋 Complete Email Confirmation Flow Test

After deployment, test the complete flow:

1. **Sign up new account** at https://siterecap.com/login
2. **Check email** - confirmation link should use https://siterecap.com
3. **Click confirmation link** - should redirect to siterecap.com (not Vercel)
4. **Automatic login** - should be logged in without manual login step
5. **Dashboard access** - should land at https://siterecap.com/dashboard?confirmed=true

## 🎯 Expected Results

**Before Fix:**
- Email confirmation links redirect to `site-recap-exaw.vercel.app`
- Users get "Unable to confirm email" errors
- 404 errors on auth/success page

**After Fix:**
- All redirects use `https://siterecap.com`
- Seamless signup → email confirmation → auto-login → dashboard
- No 404 errors or wrong domain redirects

## 🔧 Troubleshooting

**If still getting Vercel URLs:**
1. Check Vercel environment variables again
2. Verify Supabase Site URL is correct
3. Clear browser cache
4. Wait 5-10 minutes for Vercel cache to clear
5. Try incognito/private browsing mode

**If 404 errors on auth/success:**
1. Verify production deployment includes latest code
2. Check that files exist in production build
3. Test locally first to confirm functionality

**If environment variables not updating:**
1. Make sure variables are set for "Production" environment in Vercel
2. Redeploy after changing environment variables
3. Use `vercel env ls` to verify variables are set

## ✅ Success Criteria

- [ ] Vercel environment variables updated to https://siterecap.com
- [ ] Supabase Site URL set to https://siterecap.com
- [ ] Production deployment includes latest code
- [ ] /api/debug-urls shows correct environment variables
- [ ] Email confirmation flow works end-to-end
- [ ] Users automatically logged in after email confirmation
- [ ] All redirects use https://siterecap.com domain
- [ ] RLS policies applied and users can only access their own data