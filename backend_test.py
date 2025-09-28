#!/usr/bin/env python3
"""
SiteRecap Authentication System Backend Testing
Tests the newly implemented authentication and email confirmation system
"""

import requests
import json
import os
import time
from urllib.parse import urlparse, parse_qs

# Get base URL from environment - use local development server for testing
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

def test_environment_variables():
    """Test that all required environment variables are properly configured"""
    print("\n=== TESTING ENVIRONMENT VARIABLES ===")
    
    # Read .env file
    env_vars = {}
    try:
        with open('/app/.env', 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    except Exception as e:
        print(f"❌ Failed to read .env file: {e}")
        return False
    
    # Check required variables
    required_vars = {
        'RESEND_API_KEY': 'Email service API key',
        'EMAIL_FROM': 'Email sender address',
        'NEXT_PUBLIC_SUPABASE_URL': 'Supabase URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase anonymous key',
        'SUPABASE_SERVICE_KEY': 'Supabase service key',
        'NEXT_PUBLIC_BASE_URL': 'Application base URL'
    }
    
    all_present = True
    for var, description in required_vars.items():
        if var in env_vars and env_vars[var]:
            print(f"✅ {var}: {description} - Present")
            if var == 'EMAIL_FROM':
                if env_vars[var] == 'support@siterecap.com':
                    print(f"✅ EMAIL_FROM correctly set to support@siterecap.com")
                else:
                    print(f"⚠️  EMAIL_FROM is '{env_vars[var]}', expected 'support@siterecap.com'")
            elif var == 'NEXT_PUBLIC_BASE_URL':
                if env_vars[var] == 'https://siterecap.com':
                    print(f"✅ NEXT_PUBLIC_BASE_URL correctly set to https://siterecap.com")
                else:
                    print(f"⚠️  NEXT_PUBLIC_BASE_URL is '{env_vars[var]}', expected 'https://siterecap.com'")
        else:
            print(f"❌ {var}: {description} - Missing or empty")
            all_present = False
    
    return all_present

def test_send_confirmation_endpoint():
    """Test POST /api/send-confirmation endpoint"""
    print("\n=== TESTING /api/send-confirmation ENDPOINT ===")
    
    # Test with valid data
    test_data = {
        "email": "test@example.com",
        "confirmationUrl": f"{BASE_URL}/auth/callback?code=test123"
    }
    
    try:
        response = requests.post(f"{API_BASE}/send-confirmation", 
                               json=test_data, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Send confirmation endpoint working correctly")
                if 'messageId' in data:
                    print(f"✅ Email sent with message ID: {data['messageId']}")
                return True
            else:
                print(f"❌ Send confirmation failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Send confirmation endpoint returned {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test with missing data
    print("\n--- Testing with missing email ---")
    try:
        response = requests.post(f"{API_BASE}/send-confirmation", 
                               json={"confirmationUrl": f"{BASE_URL}/auth/callback"}, 
                               timeout=30)
        
        if response.status_code == 400:
            print("✅ Correctly returns 400 for missing email")
        else:
            print(f"⚠️  Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing missing email: {e}")

def test_resend_confirmation_endpoint():
    """Test POST /api/resend-confirmation endpoint"""
    print("\n=== TESTING /api/resend-confirmation ENDPOINT ===")
    
    # Test with valid email
    test_data = {
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(f"{API_BASE}/resend-confirmation", 
                               json=test_data, 
                               timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Resend confirmation endpoint working correctly")
                if 'messageId' in data:
                    print(f"✅ Email sent with message ID: {data['messageId']}")
                return True
            else:
                print(f"❌ Resend confirmation failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Resend confirmation endpoint returned {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test with missing email
    print("\n--- Testing with missing email ---")
    try:
        response = requests.post(f"{API_BASE}/resend-confirmation", 
                               json={}, 
                               timeout=30)
        
        if response.status_code == 400:
            print("✅ Correctly returns 400 for missing email")
        else:
            print(f"⚠️  Expected 400, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing missing email: {e}")

def test_auth_callback_endpoint():
    """Test GET /auth/callback endpoint"""
    print("\n=== TESTING /auth/callback ENDPOINT ===")
    
    # Test callback endpoint accessibility
    try:
        # Test with no parameters (should redirect to home)
        response = requests.get(f"{BASE_URL}/auth/callback", 
                              allow_redirects=False, 
                              timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [302, 307]:
            redirect_location = response.headers.get('Location', '')
            print(f"✅ Auth callback endpoint accessible, redirects to: {redirect_location}")
            
            if BASE_URL in redirect_location:
                print("✅ Redirect URL contains correct base URL")
                return True
            else:
                print(f"⚠️  Redirect URL might be incorrect: {redirect_location}")
                return True
        else:
            print(f"❌ Auth callback endpoint returned unexpected status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    
    # Test with invalid code parameter
    print("\n--- Testing with invalid code parameter ---")
    try:
        response = requests.get(f"{BASE_URL}/auth/callback?code=invalid_test_code", 
                              allow_redirects=False, 
                              timeout=30)
        
        if response.status_code in [302, 307]:
            redirect_location = response.headers.get('Location', '')
            if 'error=' in redirect_location:
                print("✅ Correctly handles invalid code with error redirect")
            else:
                print(f"⚠️  Redirect without error parameter: {redirect_location}")
        else:
            print(f"Status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing invalid code: {e}")

def test_supabase_configuration():
    """Test Supabase client configuration"""
    print("\n=== TESTING SUPABASE CONFIGURATION ===")
    
    try:
        # Read supabase.js file to verify configuration
        with open('/app/lib/supabase.js', 'r') as f:
            supabase_content = f.read()
        
        # Check for required imports and configurations
        checks = [
            ('createClient import', 'createClient' in supabase_content),
            ('Environment variable usage', 'process.env.NEXT_PUBLIC_SUPABASE_URL' in supabase_content),
            ('Anonymous key usage', 'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY' in supabase_content),
            ('Service key usage', 'process.env.SUPABASE_SERVICE_KEY' in supabase_content),
            ('Client export', 'export const supabase' in supabase_content),
            ('Admin client export', 'export const supabaseAdmin' in supabase_content)
        ]
        
        all_good = True
        for check_name, result in checks:
            if result:
                print(f"✅ {check_name}: Present")
            else:
                print(f"❌ {check_name}: Missing")
                all_good = False
        
        return all_good
        
    except Exception as e:
        print(f"❌ Failed to read supabase.js: {e}")
        return False

def test_email_service_integration():
    """Test email service integration and configuration"""
    print("\n=== TESTING EMAIL SERVICE INTEGRATION ===")
    
    try:
        # Check if Resend is properly imported in the API files
        files_to_check = [
            '/app/app/api/send-confirmation/route.js',
            '/app/app/api/resend-confirmation/route.js'
        ]
        
        all_good = True
        for file_path in files_to_check:
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                checks = [
                    ('Resend import', 'from \'resend\'' in content),
                    ('Resend initialization', 'new Resend(process.env.RESEND_API_KEY)' in content),
                    ('Email FROM configuration', 'process.env.EMAIL_FROM' in content or 'support@siterecap.com' in content),
                    ('HTML email template', 'emailHtml' in content or 'html:' in content)
                ]
                
                print(f"\n--- Checking {file_path} ---")
                for check_name, result in checks:
                    if result:
                        print(f"✅ {check_name}: Present")
                    else:
                        print(f"❌ {check_name}: Missing")
                        all_good = False
                        
            except Exception as e:
                print(f"❌ Failed to read {file_path}: {e}")
                all_good = False
        
        return all_good
        
    except Exception as e:
        print(f"❌ Email service integration test failed: {e}")
        return False

def test_authentication_flow_endpoints():
    """Test authentication flow related endpoints"""
    print("\n=== TESTING AUTHENTICATION FLOW ENDPOINTS ===")
    
    # Test that the main API route handler exists and is accessible
    try:
        response = requests.get(f"{API_BASE}/gemini-health", timeout=30)
        print(f"API Route Handler Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Main API route handler is accessible")
        else:
            print(f"⚠️  Main API route handler returned {response.status_code}")
            
    except Exception as e:
        print(f"❌ Failed to test API route handler: {e}")
    
    # Test that authentication endpoints are properly routed
    auth_endpoints = [
        '/api/send-confirmation',
        '/api/resend-confirmation'
    ]
    
    for endpoint in auth_endpoints:
        try:
            # Test with empty POST to see if endpoint exists
            response = requests.post(f"{BASE_URL}{endpoint}", 
                                   json={}, 
                                   timeout=30)
            
            if response.status_code == 400:
                print(f"✅ {endpoint}: Endpoint exists (returns 400 for empty data)")
            elif response.status_code == 404:
                print(f"❌ {endpoint}: Endpoint not found (404)")
            else:
                print(f"⚠️  {endpoint}: Unexpected status {response.status_code}")
                
        except Exception as e:
            print(f"❌ {endpoint}: Request failed - {e}")

def run_comprehensive_auth_tests():
    """Run all authentication system tests"""
    print("🏗️  SITERECAP AUTHENTICATION SYSTEM TESTING")
    print("=" * 60)
    
    test_results = {
        'Environment Variables': test_environment_variables(),
        'Supabase Configuration': test_supabase_configuration(),
        'Email Service Integration': test_email_service_integration(),
        'Send Confirmation Endpoint': test_send_confirmation_endpoint(),
        'Resend Confirmation Endpoint': test_resend_confirmation_endpoint(),
        'Auth Callback Endpoint': test_auth_callback_endpoint(),
        'Authentication Flow Endpoints': test_authentication_flow_endpoints()
    }
    
    print("\n" + "=" * 60)
    print("🏗️  AUTHENTICATION SYSTEM TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All authentication system tests PASSED!")
    else:
        print(f"⚠️  {total - passed} test(s) FAILED - Review issues above")
    
    return test_results

if __name__ == "__main__":
    run_comprehensive_auth_tests()