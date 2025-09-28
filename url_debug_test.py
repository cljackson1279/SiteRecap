#!/usr/bin/env python3
"""
URL Configuration Debug Test for SiteRecap
Tests URL configuration and debug the Vercel redirect issue
"""

import requests
import json
import os
import sys
from urllib.parse import urlparse, parse_qs

# Get base URL from environment
def get_base_url():
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if line.startswith('NEXT_PUBLIC_BASE_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return 'https://siterecap.com'

def get_all_env_vars():
    """Get all environment variables from .env file"""
    env_vars = {}
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except:
        pass
    return env_vars

BASE_URL = get_base_url()
API_BASE = f"{BASE_URL}/api"

print(f"🧪 TESTING URL CONFIGURATION AND VERCEL REDIRECT ISSUE")
print(f"📍 Base URL: {BASE_URL}")
print(f"📍 API Base: {API_BASE}")
print("=" * 80)

def test_debug_urls_endpoint():
    """Test GET /api/debug-urls - Verify all environment variables are set correctly"""
    print("\n🔍 Testing GET /api/debug-urls endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/debug-urls", timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 404:
            print("   ❌ /api/debug-urls endpoint not found")
            print("   📝 Creating debug endpoint test manually...")
            
            # Manually check environment variables since endpoint doesn't exist
            env_vars = get_all_env_vars()
            
            print("\n   📋 Environment Variables Check:")
            required_vars = [
                'NEXT_PUBLIC_BASE_URL',
                'NEXT_PUBLIC_SITE_URL', 
                'NEXTAUTH_URL'
            ]
            
            all_correct = True
            for var in required_vars:
                if var in env_vars:
                    value = env_vars[var]
                    print(f"   {var}: {value}")
                    
                    if value == 'https://siterecap.com':
                        print(f"   ✅ {var} correctly set to https://siterecap.com")
                    else:
                        print(f"   ❌ {var} should be https://siterecap.com, got: {value}")
                        all_correct = False
                else:
                    print(f"   ❌ {var}: Not found")
                    all_correct = False
            
            return all_correct
            
        elif response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check if all URLs point to https://siterecap.com
            expected_url = 'https://siterecap.com'
            url_vars = ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_SITE_URL', 'NEXTAUTH_URL']
            
            all_correct = True
            for var in url_vars:
                if var in data:
                    if data[var] == expected_url:
                        print(f"   ✅ {var} correctly set to {expected_url}")
                    else:
                        print(f"   ❌ {var} should be {expected_url}, got: {data[var]}")
                        all_correct = False
                else:
                    print(f"   ❌ {var} not found in response")
                    all_correct = False
            
            return all_correct
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing debug-urls: {str(e)}")
        return False

def test_auth_callback_redirect_logic():
    """Test GET /auth/callback - Verify redirect logic uses correct base URL"""
    print("\n🔍 Testing GET /auth/callback redirect logic...")
    
    try:
        # Test different scenarios to verify redirect URLs
        test_cases = [
            {
                "name": "No parameters - should redirect to login",
                "url": f"{BASE_URL}/auth/callback",
                "expected_base": BASE_URL
            },
            {
                "name": "Email parameter - should redirect to login with message",
                "url": f"{BASE_URL}/auth/callback?email=test@siterecap.com",
                "expected_base": BASE_URL
            },
            {
                "name": "Invalid code - should redirect to login with error",
                "url": f"{BASE_URL}/auth/callback?code=invalid_test_code",
                "expected_base": BASE_URL
            }
        ]
        
        all_correct = True
        
        for test_case in test_cases:
            print(f"\n   Testing: {test_case['name']}")
            print(f"   URL: {test_case['url']}")
            
            try:
                response = requests.get(test_case['url'], 
                                      allow_redirects=False,
                                      timeout=10)
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code in [301, 302, 307, 308]:
                    redirect_url = response.headers.get('Location', '')
                    print(f"   Redirect: {redirect_url}")
                    
                    # Parse the redirect URL
                    parsed = urlparse(redirect_url)
                    redirect_base = f"{parsed.scheme}://{parsed.netloc}"
                    
                    # Check if redirect uses correct base URL
                    if redirect_base == test_case['expected_base']:
                        print(f"   ✅ Redirect uses correct base URL: {redirect_base}")
                    elif redirect_base == 'https://www.siterecap.com':
                        print(f"   ✅ Redirect uses www subdomain: {redirect_base} (acceptable)")
                    else:
                        print(f"   ❌ Redirect uses wrong base URL: {redirect_base}")
                        print(f"   Expected: {test_case['expected_base']}")
                        all_correct = False
                        
                        # Check if it's a Vercel URL
                        if 'vercel.app' in redirect_base or 'preview' in redirect_base:
                            print(f"   🚨 VERCEL REDIRECT DETECTED: {redirect_base}")
                            print("   This indicates the issue is still present!")
                    
                    # Check if redirecting to expected path
                    if '/login' in redirect_url:
                        print("   ✅ Redirects to login page as expected")
                    elif '/auth/success' in redirect_url:
                        print("   ✅ Redirects to auth success page (valid for successful auth)")
                    else:
                        print(f"   ⚠️  Redirects to unexpected path: {parsed.path}")
                        
                else:
                    print(f"   ❌ Expected redirect status, got {response.status_code}")
                    all_correct = False
                    
            except Exception as e:
                print(f"   ❌ Error in test case: {str(e)}")
                all_correct = False
        
        return all_correct
        
    except Exception as e:
        print(f"   ❌ Error testing auth callback redirect logic: {str(e)}")
        return False

def test_environment_variables():
    """Check environment variables - Confirm all URLs are set to https://siterecap.com"""
    print("\n🔍 Testing Environment Variables Configuration...")
    
    try:
        env_vars = get_all_env_vars()
        
        print("   📋 Current Environment Variables:")
        
        # Check all URL-related environment variables
        url_vars = {
            'NEXT_PUBLIC_BASE_URL': 'https://siterecap.com',
            'NEXT_PUBLIC_SITE_URL': 'https://siterecap.com',
            'NEXTAUTH_URL': 'https://siterecap.com'
        }
        
        all_correct = True
        vercel_urls_found = []
        
        for var, expected in url_vars.items():
            if var in env_vars:
                actual = env_vars[var]
                print(f"   {var}: {actual}")
                
                if actual == expected:
                    print(f"   ✅ {var} correctly set")
                else:
                    print(f"   ❌ {var} should be {expected}")
                    all_correct = False
                    
                    # Check if it's a Vercel URL
                    if 'vercel.app' in actual or 'preview' in actual:
                        vercel_urls_found.append(f"{var}: {actual}")
            else:
                print(f"   ❌ {var}: Not found in environment")
                all_correct = False
        
        # Report Vercel URLs if found
        if vercel_urls_found:
            print("\n   🚨 VERCEL URLs DETECTED:")
            for vercel_url in vercel_urls_found:
                print(f"      {vercel_url}")
            print("   This explains why emails are redirecting to Vercel URLs!")
        
        return all_correct
        
    except Exception as e:
        print(f"   ❌ Error checking environment variables: {str(e)}")
        return False

def test_hardcoded_vercel_urls():
    """Check for hardcoded Vercel URLs in the system"""
    print("\n🔍 Testing for Hardcoded Vercel URLs...")
    
    try:
        files_to_check = [
            '/app/app/auth/callback/route.js',
            '/app/app/api/send-confirmation/route.js',
            '/app/app/api/resend-confirmation/route.js',
            '/app/app/login/page.js'
        ]
        
        vercel_patterns = [
            'vercel.app',
            'preview.emergentagent.com',
            'dailysitereport.preview'
        ]
        
        vercel_urls_found = []
        
        for file_path in files_to_check:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                for pattern in vercel_patterns:
                    if pattern in content:
                        # Find the specific line
                        lines = content.split('\n')
                        for i, line in enumerate(lines, 1):
                            if pattern in line:
                                vercel_urls_found.append(f"{file_path}:{i} - {line.strip()}")
                                
            except FileNotFoundError:
                print(f"   ⚠️  File not found: {file_path}")
            except Exception as e:
                print(f"   ❌ Error reading {file_path}: {str(e)}")
        
        if vercel_urls_found:
            print("   🚨 HARDCODED VERCEL URLs FOUND:")
            for url in vercel_urls_found:
                print(f"      {url}")
            print("   These hardcoded URLs need to be removed or updated!")
            return False
        else:
            print("   ✅ No hardcoded Vercel URLs found in code")
            return True
            
    except Exception as e:
        print(f"   ❌ Error checking for hardcoded Vercel URLs: {str(e)}")
        return False

def test_auth_callback_redirect_to_siterecap():
    """Test auth callback redirect logic - Verify it uses https://siterecap.com for all redirects"""
    print("\n🔍 Testing Auth Callback Redirect to SiteRecap...")
    
    try:
        # Read the auth callback code to verify it uses correct base URL
        with open('/app/app/auth/callback/route.js', 'r') as f:
            callback_content = f.read()
        
        print("   📋 Analyzing auth callback redirect logic...")
        
        # Check how baseUrl is determined
        if 'process.env.NEXT_PUBLIC_BASE_URL' in callback_content:
            print("   ✅ Uses process.env.NEXT_PUBLIC_BASE_URL for redirects")
        else:
            print("   ❌ Does not use process.env.NEXT_PUBLIC_BASE_URL")
        
        # Check for fallback logic
        if 'https://siterecap.com' in callback_content:
            print("   ✅ Has https://siterecap.com as fallback")
        else:
            print("   ❌ No https://siterecap.com fallback found")
        
        # Check redirect patterns
        redirect_patterns = [
            '${baseUrl}/login',
            '${baseUrl}/auth/success'
        ]
        
        for pattern in redirect_patterns:
            if pattern in callback_content:
                print(f"   ✅ Uses dynamic baseUrl for redirects: {pattern}")
            else:
                print(f"   ⚠️  Pattern not found: {pattern}")
        
        # Test actual redirect behavior
        print("\n   🧪 Testing actual redirect behavior...")
        
        test_url = f"{BASE_URL}/auth/callback?email=test@siterecap.com"
        response = requests.get(test_url, allow_redirects=False, timeout=10)
        
        if response.status_code in [301, 302, 307, 308]:
            redirect_url = response.headers.get('Location', '')
            print(f"   Redirect URL: {redirect_url}")
            
            if redirect_url.startswith('https://siterecap.com'):
                print("   ✅ Redirects to https://siterecap.com")
                return True
            elif redirect_url.startswith('https://www.siterecap.com'):
                print("   ✅ Redirects to https://www.siterecap.com (www subdomain)")
                return True
            else:
                print(f"   ❌ Redirects to wrong domain: {redirect_url}")
                return False
        else:
            print(f"   ❌ No redirect response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing auth callback redirects: {str(e)}")
        return False

def test_supabase_dashboard_configuration():
    """Check if the issue might be in Supabase dashboard configuration"""
    print("\n🔍 Testing Supabase Dashboard Configuration...")
    
    try:
        # We can't directly access Supabase dashboard, but we can check the configuration
        # by looking at the auth URLs and testing auth flow
        
        print("   📋 Checking Supabase configuration indicators...")
        
        # Check if login page has hardcoded siterecap.com URLs
        with open('/app/app/login/page.js', 'r') as f:
            login_content = f.read()
        
        if 'https://siterecap.com/auth/callback' in login_content:
            print("   ✅ Login page uses hardcoded https://siterecap.com/auth/callback")
            print("   📝 This means Supabase auth should redirect to siterecap.com")
        else:
            print("   ⚠️  Login page may be using dynamic URLs for auth callback")
        
        # Check environment variables for Supabase
        env_vars = get_all_env_vars()
        
        supabase_vars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY'
        ]
        
        for var in supabase_vars:
            if var in env_vars:
                value = env_vars[var]
                if var == 'NEXT_PUBLIC_SUPABASE_URL':
                    print(f"   ✅ {var}: {value}")
                else:
                    print(f"   ✅ {var}: Present (length: {len(value)})")
            else:
                print(f"   ❌ {var}: Not found")
        
        print("\n   📝 SUPABASE DASHBOARD CHECKLIST:")
        print("   1. Site URL should be set to: https://siterecap.com")
        print("   2. Redirect URLs should include: https://siterecap.com/auth/callback")
        print("   3. No Vercel URLs should be configured in Supabase dashboard")
        print("   4. Email templates should use https://siterecap.com for links")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error checking Supabase configuration: {str(e)}")
        return False

def main():
    """Run all URL configuration and Vercel redirect tests"""
    print("🚀 Starting URL Configuration and Vercel Redirect Debug Tests")
    print("=" * 80)
    
    results = {
        'debug_urls_endpoint': test_debug_urls_endpoint(),
        'environment_variables': test_environment_variables(),
        'auth_callback_redirect_logic': test_auth_callback_redirect_logic(),
        'hardcoded_vercel_urls': test_hardcoded_vercel_urls(),
        'auth_callback_to_siterecap': test_auth_callback_redirect_to_siterecap(),
        'supabase_dashboard_config': test_supabase_dashboard_configuration()
    }
    
    print("\n" + "=" * 80)
    print("📊 URL CONFIGURATION TEST RESULTS")
    print("=" * 80)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    # Critical findings
    print("\n" + "=" * 80)
    print("🔍 CRITICAL FINDINGS - VERCEL REDIRECT ISSUE")
    print("=" * 80)
    
    env_vars = get_all_env_vars()
    
    # Check if environment variables are correct
    url_vars = ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_SITE_URL', 'NEXTAUTH_URL']
    env_correct = all(env_vars.get(var) == 'https://siterecap.com' for var in url_vars)
    
    if env_correct:
        print("✅ All environment variables correctly set to https://siterecap.com")
    else:
        print("❌ Environment variables contain wrong URLs:")
        for var in url_vars:
            value = env_vars.get(var, 'NOT_FOUND')
            if value != 'https://siterecap.com':
                print(f"   {var}: {value} (should be https://siterecap.com)")
    
    # Check for Vercel URLs
    vercel_found = any('vercel' in env_vars.get(var, '') or 'preview' in env_vars.get(var, '') 
                      for var in url_vars)
    
    if vercel_found:
        print("\n🚨 VERCEL URLs DETECTED IN ENVIRONMENT VARIABLES")
        print("   This is the root cause of the redirect issue!")
        print("   Action needed: Update environment variables to use https://siterecap.com")
    else:
        print("\n✅ No Vercel URLs found in environment variables")
        print("   If emails still redirect to Vercel, check Supabase dashboard configuration")
    
    # Summary and recommendations
    print("\n" + "=" * 80)
    print("📋 RECOMMENDATIONS")
    print("=" * 80)
    
    if not env_correct:
        print("1. 🔧 UPDATE ENVIRONMENT VARIABLES:")
        print("   Set all URL variables to https://siterecap.com in .env file")
        
    print("2. 🔧 CHECK SUPABASE DASHBOARD:")
    print("   - Site URL: https://siterecap.com")
    print("   - Redirect URLs: https://siterecap.com/auth/callback")
    print("   - Remove any Vercel URLs from Supabase configuration")
    
    print("3. 🔧 VERIFY EMAIL TEMPLATES:")
    print("   - Ensure custom email templates use https://siterecap.com")
    print("   - Check Supabase email template settings")
    
    if passed >= 4:
        print("\n🎉 URL configuration is mostly correct!")
        if not env_correct:
            print("⚠️  Environment variables need updating")
        return True
    else:
        print("\n❌ URL configuration has significant issues")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)