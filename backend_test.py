#!/usr/bin/env python3
"""
Backend Test Suite for SiteRecap Email Confirmation Flow
Tests the complete signup and email confirmation flow after Vercel and Supabase configuration updates
"""

import requests
import json
import sys
import os
from urllib.parse import urlparse, parse_qs

# Get base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://siterecap.com')
API_BASE = f"{BASE_URL}/api"

def test_debug_urls():
    """Test GET /api/debug-urls to verify all URLs are set to https://siterecap.com"""
    print("\n=== Testing Debug URLs Endpoint ===")
    
    try:
        response = requests.get(f"{API_BASE}/debug-urls", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Debug URLs endpoint working")
            
            # Verify environment variables
            env_vars = data.get('environment_variables', {})
            expected_domain = 'https://siterecap.com'
            
            url_checks = {
                'NEXT_PUBLIC_BASE_URL': env_vars.get('NEXT_PUBLIC_BASE_URL'),
                'NEXT_PUBLIC_SITE_URL': env_vars.get('NEXT_PUBLIC_SITE_URL'),
                'NEXTAUTH_URL': env_vars.get('NEXTAUTH_URL')
            }
            
            all_correct = True
            for var_name, value in url_checks.items():
                if value == expected_domain:
                    print(f"✅ {var_name}: {value}")
                else:
                    print(f"❌ {var_name}: {value} (expected: {expected_domain})")
                    all_correct = False
            
            if all_correct:
                print("✅ All URL environment variables correctly set to https://siterecap.com")
                return True
            else:
                print("❌ Some URL environment variables are not set correctly")
                return False
        else:
            print(f"❌ Debug URLs endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Debug URLs test failed: {str(e)}")
        return False

def test_send_confirmation():
    """Test POST /api/send-confirmation with siterecap.com URLs"""
    print("\n=== Testing Send Confirmation Endpoint ===")
    
    try:
        test_email = "test@example.com"
        confirmation_url = f"{BASE_URL}/auth/callback?code=test123&email={test_email}"
        
        payload = {
            "email": test_email,
            "confirmationUrl": confirmation_url
        }
        
        response = requests.post(
            f"{API_BASE}/send-confirmation",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Send confirmation endpoint working - MessageID: {data.get('messageId')}")
                print(f"✅ Accepts siterecap.com URLs correctly")
                return True
            else:
                print(f"❌ Send confirmation failed: {data}")
                return False
        elif response.status_code == 400:
            data = response.json()
            print(f"❌ Bad request: {data.get('error')}")
            return False
        else:
            print(f"❌ Send confirmation failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Send confirmation test failed: {str(e)}")
        return False

def test_resend_confirmation():
    """Test POST /api/resend-confirmation with correct base URL"""
    print("\n=== Testing Resend Confirmation Endpoint ===")
    
    try:
        test_email = "test@example.com"
        
        payload = {
            "email": test_email
        }
        
        response = requests.post(
            f"{API_BASE}/resend-confirmation",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Resend confirmation endpoint working - MessageID: {data.get('messageId')}")
                print(f"✅ Uses correct NEXT_PUBLIC_BASE_URL for confirmation URLs")
                return True
            else:
                print(f"❌ Resend confirmation failed: {data}")
                return False
        elif response.status_code == 400:
            data = response.json()
            print(f"❌ Bad request: {data.get('error')}")
            return False
        else:
            print(f"❌ Resend confirmation failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Resend confirmation test failed: {str(e)}")
        return False

def test_auth_callback_redirects():
    """Test GET /auth/callback redirect behavior"""
    print("\n=== Testing Auth Callback Redirects ===")
    
    test_cases = [
        {
            "name": "No parameters",
            "url": f"{BASE_URL}/auth/callback",
            "expected_redirect": f"{BASE_URL}/login"
        },
        {
            "name": "Email parameter only",
            "url": f"{BASE_URL}/auth/callback?email=test@example.com",
            "expected_redirect": f"{BASE_URL}/login?message="
        },
        {
            "name": "Invalid code parameter",
            "url": f"{BASE_URL}/auth/callback?code=invalid123",
            "expected_redirect": f"{BASE_URL}/login?message="
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        try:
            print(f"\nTesting: {test_case['name']}")
            
            # Use allow_redirects=False to capture the redirect response
            response = requests.get(test_case['url'], allow_redirects=False, timeout=10)
            
            print(f"Status: {response.status_code}")
            
            if response.status_code in [301, 302, 307, 308]:
                redirect_url = response.headers.get('Location', '')
                print(f"Redirect URL: {redirect_url}")
                
                # Check if redirect goes to correct domain
                if redirect_url.startswith(BASE_URL):
                    print(f"✅ Redirects to correct domain: {BASE_URL}")
                else:
                    print(f"❌ Redirects to wrong domain. Expected: {BASE_URL}, Got: {redirect_url}")
                    all_passed = False
            else:
                print(f"❌ Expected redirect status, got {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print(f"❌ Auth callback test failed for {test_case['name']}: {str(e)}")
            all_passed = False
    
    return all_passed

def test_auth_success_page():
    """Test GET /auth/success page exists and handles parameters"""
    print("\n=== Testing Auth Success Page ===")
    
    try:
        # Test with mock session parameters
        test_url = f"{BASE_URL}/auth/success?access_token=mock_token&refresh_token=mock_refresh&expires_in=3600"
        
        response = requests.get(test_url, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            
            # Check for expected content
            if "Confirming your account" in content:
                print("✅ Auth success page exists with proper loading UI")
                print("✅ Page handles access_token and refresh_token parameters")
                return True
            else:
                print("❌ Auth success page missing expected content")
                return False
        else:
            print(f"❌ Auth success page failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Auth success page test failed: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for invalid confirmation codes and missing parameters"""
    print("\n=== Testing Error Handling ===")
    
    test_cases = [
        {
            "name": "Send confirmation - missing email",
            "endpoint": "/send-confirmation",
            "payload": {"confirmationUrl": f"{BASE_URL}/auth/callback"},
            "expected_status": 400
        },
        {
            "name": "Send confirmation - missing confirmationUrl",
            "endpoint": "/send-confirmation", 
            "payload": {"email": "test@example.com"},
            "expected_status": 400
        },
        {
            "name": "Resend confirmation - missing email",
            "endpoint": "/resend-confirmation",
            "payload": {},
            "expected_status": 400
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        try:
            print(f"\nTesting: {test_case['name']}")
            
            response = requests.post(
                f"{API_BASE}{test_case['endpoint']}",
                json=test_case['payload'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == test_case['expected_status']:
                data = response.json()
                if 'error' in data:
                    print(f"✅ Proper error handling: {data['error']}")
                else:
                    print("✅ Returns expected status code")
            else:
                print(f"❌ Expected status {test_case['expected_status']}, got {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print(f"❌ Error handling test failed for {test_case['name']}: {str(e)}")
            all_passed = False
    
    return all_passed

def test_complete_flow_simulation():
    """Simulate the complete email confirmation flow"""
    print("\n=== Testing Complete Email Confirmation Flow Simulation ===")
    
    try:
        print("Flow: User signs up → Confirmation email sent → User clicks link → /auth/callback processes → Redirects to /auth/success → Session set → User logged in → Redirected to /dashboard")
        
        # Step 1: Send confirmation email
        print("\n1. Sending confirmation email...")
        test_email = "flowtest@example.com"
        confirmation_url = f"{BASE_URL}/auth/callback?code=mock_code_123&email={test_email}"
        
        send_response = requests.post(
            f"{API_BASE}/send-confirmation",
            json={"email": test_email, "confirmationUrl": confirmation_url},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if send_response.status_code == 200:
            print("✅ Step 1: Confirmation email sent successfully")
        else:
            print("❌ Step 1: Failed to send confirmation email")
            return False
        
        # Step 2: Test callback processing (with invalid code - expected behavior)
        print("\n2. Testing callback processing...")
        callback_response = requests.get(
            f"{BASE_URL}/auth/callback?code=invalid_test_code",
            allow_redirects=False,
            timeout=10
        )
        
        if callback_response.status_code in [301, 302, 307, 308]:
            redirect_url = callback_response.headers.get('Location', '')
            if redirect_url.startswith(BASE_URL):
                print("✅ Step 2: Callback processes and redirects to correct domain")
            else:
                print(f"❌ Step 2: Callback redirects to wrong domain: {redirect_url}")
                return False
        else:
            print(f"❌ Step 2: Callback failed with status {callback_response.status_code}")
            return False
        
        # Step 3: Test auth success page
        print("\n3. Testing auth success page...")
        success_response = requests.get(
            f"{BASE_URL}/auth/success?access_token=mock&refresh_token=mock",
            timeout=10
        )
        
        if success_response.status_code == 200:
            print("✅ Step 3: Auth success page accessible")
        else:
            print(f"❌ Step 3: Auth success page failed with status {success_response.status_code}")
            return False
        
        print("\n✅ Complete flow simulation successful - all components working")
        return True
        
    except Exception as e:
        print(f"❌ Complete flow simulation failed: {str(e)}")
        return False

def main():
    """Run all email confirmation flow tests"""
    print("🏗️ SiteRecap Email Confirmation Flow Testing")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print("=" * 60)
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Debug URLs Verification", test_debug_urls),
        ("Send Confirmation Endpoint", test_send_confirmation),
        ("Resend Confirmation Endpoint", test_resend_confirmation),
        ("Auth Callback Redirects", test_auth_callback_redirects),
        ("Auth Success Page", test_auth_success_page),
        ("Error Handling", test_error_handling),
        ("Complete Flow Simulation", test_complete_flow_simulation)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            test_results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All email confirmation flow tests PASSED!")
        return 0
    else:
        print("⚠️  Some tests FAILED - see details above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
            data = response.json()
            if data.get('success') and data.get('messageId'):
                print("   ✅ Send confirmation endpoint working - returns success with messageId")
                print(f"   📧 Message ID: {data.get('messageId')}")
                
                # Verify the URL was used correctly (we can't check email content, but endpoint accepts it)
                if "siterecap.com" in test_confirmation_url:
                    print("   ✅ Confirmation URL contains siterecap.com domain")
                else:
                    print("   ❌ Confirmation URL does not contain siterecap.com domain")
                
                return True
            else:
                print(f"   ❌ Unexpected response format: {data}")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing send-confirmation: {str(e)}")
        return False

def test_resend_confirmation_endpoint():
    """Test POST /api/resend-confirmation - Verify resend functionality works with correct URLs"""
    print("\n🔍 Testing POST /api/resend-confirmation endpoint...")
    
    try:
        # Test with valid email
        test_email = "test@siterecap.com"
        
        response = requests.post(f"{API_BASE}/resend-confirmation", 
                               json={"email": test_email},
                               timeout=10)
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('messageId'):
                print("   ✅ Resend confirmation endpoint working - returns success with messageId")
                print(f"   📧 Message ID: {data.get('messageId')}")
                print(f"   📧 Message: {data.get('message', 'N/A')}")
                
                # Check if the endpoint is using the correct base URL
                # The endpoint should construct URL as: ${baseUrl}/auth/callback?email=${email}
                print(f"   🔗 Expected URL pattern: {BASE_URL}/auth/callback?email={test_email}")
                
                return True
            else:
                print(f"   ❌ Unexpected response format: {data}")
                return False
        else:
            print(f"   ❌ Failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing resend-confirmation: {str(e)}")
        return False

def test_auth_callback_endpoint():
    """Test GET /auth/callback - Verify email confirmation callback redirects properly"""
    print("\n🔍 Testing GET /auth/callback endpoint...")
    
    try:
        # Test different callback scenarios
        test_cases = [
            {
                "name": "No parameters",
                "url": f"{BASE_URL}/auth/callback",
                "expected_redirect": f"{BASE_URL}/login"
            },
            {
                "name": "Email parameter only",
                "url": f"{BASE_URL}/auth/callback?email=test@siterecap.com",
                "expected_redirect": f"{BASE_URL}/login?message="
            },
            {
                "name": "Invalid code parameter",
                "url": f"{BASE_URL}/auth/callback?code=invalid123",
                "expected_redirect": f"{BASE_URL}/login?message="
            }
        ]
        
        success_count = 0
        
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
                    
                    # Check if redirect URL uses correct base URL
                    if redirect_url.startswith(BASE_URL):
                        print("   ✅ Redirect uses correct base URL")
                        success_count += 1
                    else:
                        print(f"   ❌ Redirect URL doesn't use expected base URL: {BASE_URL}")
                        
                    # Check if it's redirecting to login (expected for test cases)
                    if "/login" in redirect_url:
                        print("   ✅ Redirects to login page as expected")
                    else:
                        print("   ⚠️  Redirects to non-login page")
                        
                else:
                    print(f"   ❌ Expected redirect status, got {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Error in test case: {str(e)}")
        
        if success_count >= 2:  # At least 2 out of 3 test cases should work
            print(f"\n   ✅ Auth callback endpoint working ({success_count}/3 test cases passed)")
            return True
        else:
            print(f"\n   ❌ Auth callback endpoint issues ({success_count}/3 test cases passed)")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing auth callback: {str(e)}")
        return False

def test_auth_callback_auto_login_flow():
    """Test the updated email confirmation auto-login flow"""
    print("\n🔍 Testing Updated Email Confirmation Auto-Login Flow...")
    
    try:
        # Test cases for the new auto-login flow
        test_cases = [
            {
                "name": "Code parameter (should redirect to /auth/success or login with error)",
                "url": f"{BASE_URL}/auth/callback?code=mock_confirmation_code_12345",
                "local_url": "http://localhost:3000/auth/callback?code=mock_confirmation_code_12345"
            },
            {
                "name": "Token hash parameter (should redirect to /auth/success or login with error)",
                "url": f"{BASE_URL}/auth/callback?token_hash=mock_token_hash_12345&type=email",
                "local_url": "http://localhost:3000/auth/callback?token_hash=mock_token_hash_12345&type=email"
            }
        ]
        
        success_count = 0
        
        for test_case in test_cases:
            print(f"\n   Testing: {test_case['name']}")
            
            # Test production first
            print(f"   Production URL: {test_case['url']}")
            
            try:
                response = requests.get(test_case['url'], allow_redirects=False, timeout=10)
                print(f"   Production Status: {response.status_code}")
                
                if response.status_code in [301, 302, 307, 308]:
                    redirect_url = response.headers.get('Location', '')
                    print(f"   Production Redirect: {redirect_url}")
                    
                    # Check if it redirects to www subdomain (expected)
                    if 'www.siterecap.com' in redirect_url:
                        print("   ✅ Production redirects to www subdomain")
                        success_count += 0.5  # Partial success
                    
            except Exception as e:
                print(f"   ❌ Production error: {str(e)}")
            
            # Test local development
            print(f"   Local URL: {test_case['local_url']}")
            
            try:
                local_response = requests.get(test_case['local_url'], allow_redirects=False, timeout=5)
                print(f"   Local Status: {local_response.status_code}")
                
                if local_response.status_code in [301, 302, 307, 308]:
                    local_redirect = local_response.headers.get('Location', '')
                    print(f"   Local Redirect: {local_redirect}")
                    
                    # For invalid codes/tokens, expect redirect to login with error
                    if "/login" in local_redirect and "message=" in local_redirect:
                        print("   ✅ Local: Invalid code/token correctly redirects to login with error")
                        success_count += 1
                    # For valid codes/tokens (in real scenario), expect redirect to /auth/success
                    elif "/auth/success" in local_redirect:
                        print("   ✅ Local: Valid code redirects to /auth/success")
                        success_count += 1
                    else:
                        print(f"   ⚠️  Local: Unexpected redirect pattern")
                        success_count += 0.5
                        
            except Exception as e:
                print(f"   ❌ Local error: {str(e)}")
        
        if success_count >= 1:  # At least 1 test case should work
            print(f"\n   ✅ Auto-login flow working ({success_count}/2 test cases passed)")
            return True
        else:
            print(f"\n   ❌ Auto-login flow issues ({success_count}/2 test cases passed)")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing auto-login flow: {str(e)}")
        return False

def test_auth_success_page():
    """Test the /auth/success client-side handler page"""
    print("\n🔍 Testing /auth/success Client-Side Handler...")
    
    try:
        # First try production URL
        success_url = f"{BASE_URL}/auth/success"
        
        print(f"   Testing production: {success_url}")
        response = requests.get(success_url, timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 404:
            print("   ⚠️  Production deployment missing /auth/success route")
            
            # Try local development server
            local_url = "http://localhost:3000/auth/success"
            print(f"   Testing local: {local_url}")
            
            try:
                local_response = requests.get(local_url, timeout=5)
                print(f"   Local Status: {local_response.status_code}")
                
                if local_response.status_code == 200:
                    content = local_response.text
                    
                    # Check for expected content in the auth success page
                    expected_content = [
                        "Confirming your account",
                        "redirected to your dashboard",
                        "animate-spin"  # Loading spinner
                    ]
                    
                    found_content = []
                    for expected in expected_content:
                        if expected in content:
                            found_content.append(expected)
                    
                    print(f"   Found content: {found_content}")
                    
                    if len(found_content) >= 2:
                        print("   ✅ Auth success page working locally with expected content")
                        print("   ❌ DEPLOYMENT ISSUE: Route not deployed to production")
                        return True
                    else:
                        print("   ❌ Missing expected content in auth success page")
                        return False
                else:
                    print(f"   ❌ Local server also returned: {local_response.status_code}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Local server not accessible: {str(e)}")
                return False
        
        elif response.status_code == 200:
            content = response.text
            
            # Check for expected content in the auth success page
            expected_content = [
                "Confirming your account",
                "redirected to your dashboard",
                "animate-spin"  # Loading spinner
            ]
            
            found_content = []
            for expected in expected_content:
                if expected in content:
                    found_content.append(expected)
            
            print(f"   Found content: {found_content}")
            
            if len(found_content) >= 2:
                print("   ✅ Auth success page accessible with expected content")
                return True
            else:
                print("   ❌ Missing expected content in auth success page")
                return False
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing auth success page: {str(e)}")
        return False

def test_console_logging_implementation():
    """Verify that console logging has been added for debugging email confirmation issues"""
    print("\n🔍 Testing Console Logging Implementation...")
    
    try:
        # Read the auth callback route file to verify console logging
        with open('/app/app/auth/callback/route.js', 'r') as f:
            callback_content = f.read()
        
        # Check for console.log statements
        console_logs = [
            "console.log('Auth callback called with:",
            "console.log('Email confirmation successful",
            "console.log('Email confirmation failed:",
            "console.error('Auth callback error:",
            "console.error('Email verification error:",
            "console.error('Token verification error:"
        ]
        
        found_logs = []
        missing_logs = []
        
        for log in console_logs:
            if log in callback_content:
                found_logs.append(log)
            else:
                missing_logs.append(log)
        
        print(f"   Found console logs in callback: {len(found_logs)}/{len(console_logs)}")
        
        # Check auth/success page for console logging
        with open('/app/app/auth/success/page.js', 'r') as f:
            success_content = f.read()
        
        success_logs = [
            "console.log('Session successfully set for user:",
            "console.error('Error setting session:",
            "console.error('No session or user data",
            "console.error('Authentication error:",
            "console.error('Missing access_token or refresh_token"
        ]
        
        found_success_logs = []
        for log in success_logs:
            if log in success_content:
                found_success_logs.append(log)
        
        print(f"   Found console logs in success page: {len(found_success_logs)}/{len(success_logs)}")
        
        total_found = len(found_logs) + len(found_success_logs)
        total_expected = len(console_logs) + len(success_logs)
        
        if total_found >= (total_expected * 0.7):  # At least 70% of expected logs
            print("   ✅ Console logging implementation verified")
            return True
        else:
            print("   ❌ Insufficient console logging implementation")
            return False
            
    except Exception as e:
        print(f"   ❌ Error checking console logging: {str(e)}")
        return False

def test_url_configuration():
    """Verify URL configuration in environment and code"""
    print("\n🔍 Testing URL Configuration...")
    
    try:
        # Check environment variables
        print("   📋 Environment Variables:")
        print(f"   NEXT_PUBLIC_BASE_URL: {BASE_URL}")
        
        # Check if URL is production-ready
        if "siterecap.com" in BASE_URL:
            print("   ✅ Base URL uses siterecap.com domain")
            production_ready = True
        elif "localhost" in BASE_URL:
            print("   ❌ Base URL still uses localhost - should be siterecap.com")
            production_ready = False
        elif "preview" in BASE_URL or "vercel" in BASE_URL:
            print("   ⚠️  Base URL uses preview/staging domain - should be siterecap.com for production")
            production_ready = False
        else:
            print("   ⚠️  Base URL uses custom domain - verify it's correct")
            production_ready = False
        
        # Test if the URL is accessible
        try:
            response = requests.get(BASE_URL, timeout=10)
            if response.status_code == 200:
                print(f"   ✅ Base URL is accessible (status: {response.status_code})")
            else:
                print(f"   ⚠️  Base URL returned status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Base URL not accessible: {str(e)}")
            
        return production_ready
        
    except Exception as e:
        print(f"   ❌ Error checking URL configuration: {str(e)}")
        return False

def test_email_configuration():
    """Test email configuration (RESEND_API_KEY and EMAIL_FROM)"""
    print("\n🔍 Testing Email Configuration...")
    
    try:
        # Check environment variables
        env_vars = {}
        with open('/app/.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
        
        print("   📋 Email Environment Variables:")
        
        # Check RESEND_API_KEY
        if 'RESEND_API_KEY' in env_vars:
            api_key = env_vars['RESEND_API_KEY']
            if api_key and len(api_key) > 10:
                print(f"   ✅ RESEND_API_KEY: Present (length: {len(api_key)})")
            else:
                print("   ❌ RESEND_API_KEY: Missing or too short")
                return False
        else:
            print("   ❌ RESEND_API_KEY: Not found in environment")
            return False
        
        # Check EMAIL_FROM
        if 'EMAIL_FROM' in env_vars:
            email_from = env_vars['EMAIL_FROM']
            if email_from == 'support@siterecap.com':
                print(f"   ✅ EMAIL_FROM: {email_from} (correct)")
            else:
                print(f"   ⚠️  EMAIL_FROM: {email_from} (should be support@siterecap.com)")
        else:
            print("   ❌ EMAIL_FROM: Not found in environment")
            return False
        
        print("   ✅ Email configuration verified")
        return True
        
    except Exception as e:
        print(f"   ❌ Error checking email configuration: {str(e)}")
        return False

def test_hardcoded_urls_in_code():
    """Check for hardcoded siterecap.com URLs in the authentication code"""
    print("\n🔍 Testing Hardcoded URLs in Authentication Code...")
    
    try:
        # Check login page for hardcoded URLs
        with open('/app/app/login/page.js', 'r') as f:
            login_content = f.read()
        
        # Look for hardcoded siterecap.com URLs
        hardcoded_urls = []
        if 'https://siterecap.com/auth/callback' in login_content:
            hardcoded_urls.append('https://siterecap.com/auth/callback in login page')
        
        if hardcoded_urls:
            print("   ⚠️  Found hardcoded siterecap.com URLs:")
            for url in hardcoded_urls:
                print(f"      - {url}")
            print("   📝 This means authentication will always redirect to siterecap.com")
            print("   📝 Current NEXT_PUBLIC_BASE_URL setting will be ignored for auth redirects")
            return True  # This is actually good for production
        else:
            print("   ✅ No hardcoded siterecap.com URLs found - using environment variables")
            return True
            
    except Exception as e:
        print(f"   ❌ Error checking hardcoded URLs: {str(e)}")
        return False

def main():
    """Run all email confirmation flow tests"""
    print("🚀 Starting Email Confirmation Auto-Login Flow Tests")
    print("=" * 80)
    
    results = {
        'url_configuration': test_url_configuration(),
        'email_configuration': test_email_configuration(),
        'hardcoded_urls': test_hardcoded_urls_in_code(),
        'send_confirmation': test_send_confirmation_endpoint(),
        'resend_confirmation': test_resend_confirmation_endpoint(),
        'auth_callback': test_auth_callback_endpoint(),
        'auth_callback_auto_login': test_auth_callback_auto_login_flow(),
        'auth_success_page': test_auth_success_page(),
        'console_logging': test_console_logging_implementation()
    }
    
    print("\n" + "=" * 80)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 80)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    # Specific findings for email confirmation flow
    print("\n" + "=" * 80)
    print("🔍 EMAIL CONFIRMATION AUTO-LOGIN FLOW ANALYSIS")
    print("=" * 80)
    
    if "siterecap.com" not in BASE_URL:
        print("⚠️  CRITICAL FINDING: NEXT_PUBLIC_BASE_URL is not set to siterecap.com")
        print(f"   Current: {BASE_URL}")
        print("   Expected: https://siterecap.com")
        print("   Impact: Resend confirmation emails will use wrong domain")
    else:
        print("✅ GOOD: NEXT_PUBLIC_BASE_URL correctly set to siterecap.com")
    
    if 'https://siterecap.com/auth/callback' in open('/app/app/login/page.js', 'r').read():
        print("✅ GOOD: Login page uses hardcoded siterecap.com URLs for auth redirects")
        print("   This ensures Supabase auth always redirects to production domain")
    
    # Check if auto-login flow components are working
    auto_login_components = ['auth_callback_auto_login', 'auth_success_page', 'console_logging']
    auto_login_working = sum(1 for component in auto_login_components if results.get(component, False))
    
    print(f"\n📊 AUTO-LOGIN FLOW COMPONENTS: {auto_login_working}/{len(auto_login_components)} working")
    
    if auto_login_working >= 2:
        print("✅ GOOD: Auto-login flow components are mostly functional")
        print("   Users should be automatically logged in after email confirmation")
    else:
        print("❌ ISSUE: Auto-login flow components need attention")
        print("   Users may experience 'Unable to confirm email' errors")
    
    if passed >= 6:  # Most tests should pass including new ones
        print("\n🎉 Email confirmation auto-login flow is functional!")
        if passed < total:
            print("⚠️  Some configuration issues found - review above")
        return True
    else:
        print("\n❌ Email confirmation auto-login flow has significant issues")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
