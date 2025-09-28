#!/usr/bin/env python3
"""
Create and test a debug-urls endpoint to verify URL configuration
"""

import requests
import json
import os

def get_base_url():
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if line.startswith('NEXT_PUBLIC_BASE_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return 'https://siterecap.com'

BASE_URL = get_base_url()
API_BASE = f"{BASE_URL}/api"

print(f"🧪 TESTING DEBUG-URLS ENDPOINT CREATION AND URL VERIFICATION")
print(f"📍 Base URL: {BASE_URL}")
print(f"📍 API Base: {API_BASE}")
print("=" * 80)

def test_create_debug_urls_endpoint():
    """Create a debug-urls endpoint in the API routes"""
    print("\n🔧 Creating debug-urls endpoint...")
    
    try:
        # Read the current API routes file
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            content = f.read()
        
        # Check if debug-urls endpoint already exists
        if '/debug-urls' in content:
            print("   ✅ Debug-urls endpoint already exists")
            return True
        
        # Add debug-urls endpoint function
        debug_function = '''
// GET /api/debug-urls
async function debugUrls() {
  try {
    const envVars = {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      NODE_ENV: process.env.NODE_ENV
    }
    
    return NextResponse.json({
      success: true,
      environment_variables: envVars,
      timestamp: new Date().toISOString(),
      message: "URL configuration debug information"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}'''
        
        # Find the GET function and add the debug-urls case
        get_function_start = content.find('export async function GET(request) {')
        if get_function_start == -1:
            print("   ❌ Could not find GET function in API routes")
            return False
        
        # Find the switch statement in GET function
        switch_start = content.find('switch (path) {', get_function_start)
        if switch_start == -1:
            print("   ❌ Could not find switch statement in GET function")
            return False
        
        # Find the first case after switch
        first_case = content.find("case '/", switch_start)
        if first_case == -1:
            print("   ❌ Could not find first case in switch statement")
            return False
        
        # Insert the debug-urls case
        debug_case = "    case '/debug-urls':\n      return debugUrls()\n    "
        
        # Insert the function before the main route handler
        function_insert_point = content.find('// Main route handler')
        if function_insert_point == -1:
            function_insert_point = get_function_start
        
        new_content = (content[:function_insert_point] + 
                      debug_function + '\n\n' + 
                      content[function_insert_point:first_case] + 
                      debug_case + 
                      content[first_case:])
        
        # Write the updated content
        with open('/app/app/api/[[...path]]/route.js', 'w') as f:
            f.write(new_content)
        
        print("   ✅ Debug-urls endpoint added to API routes")
        return True
        
    except Exception as e:
        print(f"   ❌ Error creating debug-urls endpoint: {str(e)}")
        return False

def test_debug_urls_endpoint():
    """Test the debug-urls endpoint"""
    print("\n🔍 Testing GET /api/debug-urls endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/debug-urls", timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check environment variables
            env_vars = data.get('environment_variables', {})
            
            expected_url = 'https://siterecap.com'
            url_vars = ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_SITE_URL', 'NEXTAUTH_URL']
            
            all_correct = True
            for var in url_vars:
                if var in env_vars:
                    value = env_vars[var]
                    if value == expected_url:
                        print(f"   ✅ {var}: {value}")
                    else:
                        print(f"   ❌ {var}: {value} (should be {expected_url})")
                        all_correct = False
                else:
                    print(f"   ❌ {var}: Not found")
                    all_correct = False
            
            # Check other important variables
            if 'EMAIL_FROM' in env_vars:
                email_from = env_vars['EMAIL_FROM']
                if email_from == 'support@siterecap.com':
                    print(f"   ✅ EMAIL_FROM: {email_from}")
                else:
                    print(f"   ⚠️  EMAIL_FROM: {email_from} (expected: support@siterecap.com)")
            
            return all_correct
            
        else:
            print(f"   ❌ Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing debug-urls: {str(e)}")
        return False

def test_email_confirmation_urls():
    """Test what URLs are actually being generated in confirmation emails"""
    print("\n🔍 Testing Email Confirmation URL Generation...")
    
    try:
        # Test send-confirmation endpoint with different scenarios
        test_cases = [
            {
                "name": "Standard confirmation URL",
                "email": "user@siterecap.com",
                "confirmationUrl": "https://siterecap.com/auth/callback?code=test123"
            },
            {
                "name": "Confirmation URL with token_hash",
                "email": "user@siterecap.com", 
                "confirmationUrl": "https://siterecap.com/auth/callback?token_hash=abc123&type=email"
            }
        ]
        
        for test_case in test_cases:
            print(f"\n   Testing: {test_case['name']}")
            
            response = requests.post(f"{API_BASE}/send-confirmation",
                                   json={
                                       "email": test_case["email"],
                                       "confirmationUrl": test_case["confirmationUrl"]
                                   },
                                   timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Success: {data.get('success')}")
                print(f"   📧 Message ID: {data.get('messageId')}")
                
                # Check if the URL contains siterecap.com
                if "siterecap.com" in test_case["confirmationUrl"]:
                    print("   ✅ Confirmation URL uses siterecap.com domain")
                else:
                    print("   ❌ Confirmation URL does not use siterecap.com domain")
            else:
                print(f"   ❌ Failed: {response.text}")
        
        # Test resend-confirmation to see what URL it generates
        print(f"\n   Testing resend-confirmation URL generation...")
        
        response = requests.post(f"{API_BASE}/resend-confirmation",
                               json={"email": "user@siterecap.com"},
                               timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {data.get('success')}")
            print(f"   📧 Message ID: {data.get('messageId')}")
            print(f"   📧 Message: {data.get('message')}")
            
            # The resend endpoint should construct URL as: ${baseUrl}/auth/callback?email=${email}
            # Where baseUrl comes from process.env.NEXT_PUBLIC_BASE_URL
            expected_pattern = f"{BASE_URL}/auth/callback?email=user@siterecap.com"
            print(f"   🔗 Expected URL pattern: {expected_pattern}")
            
            if BASE_URL == "https://siterecap.com":
                print("   ✅ Base URL is correct for resend confirmation")
            else:
                print(f"   ❌ Base URL issue: {BASE_URL}")
        else:
            print(f"   ❌ Failed: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error testing email confirmation URLs: {str(e)}")
        return False

def test_auth_callback_detailed():
    """Test auth callback with detailed analysis"""
    print("\n🔍 Testing Auth Callback Detailed Analysis...")
    
    try:
        # Test different auth callback scenarios
        test_cases = [
            {
                "name": "No parameters",
                "url": f"{BASE_URL}/auth/callback",
                "expected_redirect_pattern": "/login"
            },
            {
                "name": "Email only",
                "url": f"{BASE_URL}/auth/callback?email=user@siterecap.com",
                "expected_redirect_pattern": "/login"
            },
            {
                "name": "Invalid code",
                "url": f"{BASE_URL}/auth/callback?code=invalid123",
                "expected_redirect_pattern": "/login"
            }
        ]
        
        for test_case in test_cases:
            print(f"\n   Testing: {test_case['name']}")
            print(f"   URL: {test_case['url']}")
            
            response = requests.get(test_case['url'], allow_redirects=False, timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code in [301, 302, 307, 308]:
                redirect_url = response.headers.get('Location', '')
                print(f"   Redirect: {redirect_url}")
                
                # Parse redirect URL
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(redirect_url)
                
                print(f"   Domain: {parsed.netloc}")
                print(f"   Path: {parsed.path}")
                
                # Check if it's redirecting to the right domain
                if parsed.netloc in ['siterecap.com', 'www.siterecap.com']:
                    print("   ✅ Redirects to correct domain")
                else:
                    print(f"   ❌ Redirects to wrong domain: {parsed.netloc}")
                
                # Check if it's redirecting to expected path
                if test_case['expected_redirect_pattern'] in parsed.path:
                    print(f"   ✅ Redirects to expected path: {parsed.path}")
                else:
                    print(f"   ⚠️  Unexpected redirect path: {parsed.path}")
                
                # Check query parameters
                if parsed.query:
                    query_params = parse_qs(parsed.query)
                    print(f"   Query params: {dict(query_params)}")
            else:
                print(f"   ❌ No redirect response")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error in detailed auth callback test: {str(e)}")
        return False

def main():
    """Run debug URL tests"""
    print("🚀 Starting Debug URLs and URL Configuration Tests")
    print("=" * 80)
    
    results = {
        'create_debug_endpoint': test_create_debug_urls_endpoint(),
        'debug_urls_endpoint': test_debug_urls_endpoint(),
        'email_confirmation_urls': test_email_confirmation_urls(),
        'auth_callback_detailed': test_auth_callback_detailed()
    }
    
    print("\n" + "=" * 80)
    print("📊 DEBUG URL TEST RESULTS")
    print("=" * 80)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    return passed >= 3

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)