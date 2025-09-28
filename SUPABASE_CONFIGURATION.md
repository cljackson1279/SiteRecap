# Supabase Configuration for Production Domain

## ⚠️ CRITICAL: Supabase Dashboard Configuration Required

The email confirmation redirects are still not working because the **Supabase project settings** need to be updated in the Supabase dashboard. The application code is correct, but Supabase itself needs to know about the production domain.

## Required Steps in Supabase Dashboard:

### 1. Update Auth Redirect URLs

Go to your Supabase project dashboard:
1. Navigate to **Authentication** → **URL Configuration**
2. Update the following URLs:

**Site URL:**
```
https://siterecap.com
```

**Redirect URLs (add these):**
```
https://siterecap.com/auth/callback
https://siterecap.com/auth/success
https://siterecap.com/login
https://siterecap.com/dashboard
```

**⚠️ CRITICAL: Remove ALL old URLs:**
- Remove: `http://localhost:3000/auth/callback`
- Remove: `https://dailysitereport.preview.emergentagent.com/auth/callback`
- Remove: `https://site-recap-exaw.vercel.app/auth/callback`
- Remove: `https://site-recap-exaw.vercel.app/login`
- Remove: ANY Vercel URLs (*.vercel.app)
- Remove: ANY preview URLs (*.emergentagent.com)

### 2. Email Templates Configuration

In **Authentication** → **Email Templates**:

**Confirm signup template:**
- Make sure the redirect URL uses: `{{ .SiteURL }}/auth/callback`
- This will automatically use the Site URL you configured above

**Magic Link template:**
- Make sure the redirect URL uses: `{{ .SiteURL }}/auth/callback`

### 3. Verify Domain in Supabase

1. Go to **Authentication** → **Providers** → **Email**
2. Ensure the domain `siterecap.com` is listed as an allowed domain
3. If using a custom SMTP provider, verify it's configured correctly

## Current Code Configuration

The application code has been updated to use the correct URLs:

✅ **Signup redirect:** `https://siterecap.com/auth/callback`
✅ **Magic link redirect:** `https://siterecap.com/auth/callback`  
✅ **Auth callback handling:** Redirects to `https://siterecap.com/login` or `https://siterecap.com/dashboard`
✅ **Environment variables:** `NEXT_PUBLIC_BASE_URL=https://siterecap.com`

## Testing After Configuration

1. Create a new account at `https://siterecap.com/login`
2. Check email for confirmation link
3. Click the confirmation link
4. Verify it redirects to `https://siterecap.com/login` with success message
5. Log in with your credentials
6. Verify you're redirected to the dashboard

## Troubleshooting

If redirects still don't work after updating Supabase:

1. **Check Supabase logs:** Go to Logs → Auth to see any errors
2. **Clear browser cache:** The old redirect URLs might be cached
3. **Check email templates:** Ensure they're using `{{ .SiteURL }}`
4. **Verify SSL certificate:** Ensure `https://siterecap.com` has valid SSL

## Support

If issues persist after following these steps:
1. Check Supabase project settings match exactly what's listed above
2. Verify the Site URL is set to `https://siterecap.com` (no trailing slash)
3. Ensure all redirect URLs include the full domain with `https://`