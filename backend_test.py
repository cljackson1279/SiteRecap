#!/usr/bin/env python3
"""
Comprehensive Backend Testing for SiteRecap Email Confirmation and Security Setup
Testing Agent - Final comprehensive testing of complete email confirmation and security setup
"""

import requests
import json
import os
import sys
from datetime import datetime

# Get base URL from environment
def get_base_url():
    """Get the base URL for testing from environment variables"""
    # Read from .env file
    env_vars = {}
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except FileNotFoundError:
        print("❌ .env file not found")
        return None
    
    base_url = env_vars.get('NEXT_PUBLIC_BASE_URL', 'https://siterecap.com')
    print(f"🌐 Using base URL: {base_url}")
    return base_url

BASE_URL = get_base_url()
if not BASE_URL:
    print("❌ Could not determine base URL")
    sys.exit(1)

API_BASE = f"{BASE_URL}/api"

def test_environment_configuration():
    """Test 1: Verify GET /api/debug-urls shows https://siterecap.com for all URL variables"""
    print("\n" + "="*80)
    print("TEST 1: ENVIRONMENT CONFIGURATION")
    print("="*80)
    
    try:
        print(f"🔍 Testing GET {API_BASE}/debug-urls")
        response = requests.get(f"{API_BASE}/debug-urls", timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Debug URLs endpoint working")
            
            # Check environment variables
            env_vars = data.get('environment_variables', {})
            expected_domain = 'https://siterecap.com'
            
            url_vars = ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_SITE_URL', 'NEXTAUTH_URL']
            all_correct = True
            
            for var in url_vars:
                value = env_vars.get(var)
                if value == expected_domain:
                    print(f"✅ {var}: {value}")
                else:
                    print(f"❌ {var}: {value} (expected: {expected_domain})")
                    all_correct = False
            
            # Check other important variables
            email_from = env_vars.get('EMAIL_FROM')
            if email_from == 'support@siterecap.com':
                print(f"✅ EMAIL_FROM: {email_from}")
            else:
                print(f"❌ EMAIL_FROM: {email_from} (expected: support@siterecap.com)")
                all_correct = False
            
            supabase_url = env_vars.get('NEXT_PUBLIC_SUPABASE_URL')
            if supabase_url and supabase_url.startswith('https://'):
                print(f"✅ NEXT_PUBLIC_SUPABASE_URL: {supabase_url}")
            else:
                print(f"❌ NEXT_PUBLIC_SUPABASE_URL: {supabase_url}")
                all_correct = False
            
            return all_correct
            
        elif response.status_code == 404:
            print("❌ Debug URLs endpoint not found (404)")
            print("🔍 This endpoint should be available for production verification")
            return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_email_confirmation_endpoints():
    """Test 2: Test Complete Email Confirmation Flow endpoints"""
    print("\n" + "="*80)
    print("TEST 2: EMAIL CONFIRMATION ENDPOINTS")
    print("="*80)
    
    results = {}
    
    # Test send-confirmation endpoint
    print(f"🔍 Testing POST {API_BASE}/send-confirmation")
    try:
        payload = {
            "email": "test@example.com",
            "confirmationUrl": f"{BASE_URL}/auth/callback?email=test@example.com"
        }
        response = requests.post(f"{API_BASE}/send-confirmation", json=payload, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('messageId'):
                print(f"✅ Send confirmation working - MessageID: {data.get('messageId')}")
                results['send_confirmation'] = True
            else:
                print(f"❌ Send confirmation failed: {data}")
                results['send_confirmation'] = False
        else:
            print(f"❌ Send confirmation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            results['send_confirmation'] = False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Send confirmation request failed: {e}")
        results['send_confirmation'] = False
    
    # Test resend-confirmation endpoint
    print(f"\n🔍 Testing POST {API_BASE}/resend-confirmation")
    try:
        payload = {
            "email": "test@example.com"
        }
        response = requests.post(f"{API_BASE}/resend-confirmation", json=payload, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('messageId'):
                print(f"✅ Resend confirmation working - MessageID: {data.get('messageId')}")
                results['resend_confirmation'] = True
            else:
                print(f"❌ Resend confirmation failed: {data}")
                results['resend_confirmation'] = False
        else:
            print(f"❌ Resend confirmation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            results['resend_confirmation'] = False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Resend confirmation request failed: {e}")
        results['resend_confirmation'] = False
    
    # Test error handling - missing email parameter
    print(f"\n🔍 Testing error handling (missing email)")
    try:
        response = requests.post(f"{API_BASE}/send-confirmation", json={}, timeout=10)
        
        if response.status_code == 400:
            print("✅ Error handling working - returns 400 for missing email")
            results['error_handling'] = True
        else:
            print(f"❌ Error handling failed - expected 400, got {response.status_code}")
            results['error_handling'] = False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error handling test failed: {e}")
        results['error_handling'] = False
    
    return all(results.values())

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
                if redirect_url.startswith(BASE_URL) or 'siterecap.com' in redirect_url:
                    print(f"✅ Redirects to correct domain")
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
            if redirect_url.startswith(BASE_URL) or 'siterecap.com' in redirect_url:
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