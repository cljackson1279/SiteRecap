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

def test_auth_callback_scenarios():
    """Test 3: Test auth callback scenarios and error handling"""
    print("\n" + "="*80)
    print("TEST 3: AUTH CALLBACK SCENARIOS")
    print("="*80)
    
    results = {}
    
    # Test 1: No parameters - should redirect to login
    print(f"🔍 Testing GET {BASE_URL}/auth/callback (no parameters)")
    try:
        response = requests.get(f"{BASE_URL}/auth/callback", allow_redirects=False, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code in [302, 307]:
            location = response.headers.get('Location', '')
            if '/login' in location and BASE_URL in location:
                print(f"✅ No parameters redirect working: {location}")
                results['no_params'] = True
            else:
                print(f"❌ Unexpected redirect location: {location}")
                results['no_params'] = False
        else:
            print(f"❌ Expected redirect, got status {response.status_code}")
            results['no_params'] = False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ No parameters test failed: {e}")
        results['no_params'] = False
    
    # Test 2: Email parameter only - should redirect to login with info
    print(f"\n🔍 Testing GET {BASE_URL}/auth/callback?email=test@example.com")
    try:
        response = requests.get(f"{BASE_URL}/auth/callback?email=test@example.com", allow_redirects=False, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code in [302, 307]:
            location = response.headers.get('Location', '')
            if '/login' in location and 'message=' in location and BASE_URL in location:
                print(f"✅ Email parameter redirect working: {location}")
                results['email_param'] = True
            else:
                print(f"❌ Unexpected redirect location: {location}")
                results['email_param'] = False
        else:
            print(f"❌ Expected redirect, got status {response.status_code}")
            results['email_param'] = False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Email parameter test failed: {e}")
        results['email_param'] = False
    
    # Test 3: Invalid code - should redirect to login with error
    print(f"\n🔍 Testing GET {BASE_URL}/auth/callback?code=invalid_code")
    try:
        response = requests.get(f"{BASE_URL}/auth/callback?code=invalid_code", allow_redirects=False, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code in [302, 307]:
            location = response.headers.get('Location', '')
            if '/login' in location and 'error' in location and BASE_URL in location:
                print(f"✅ Invalid code redirect working: {location}")
                results['invalid_code'] = True
            else:
                print(f"❌ Unexpected redirect location: {location}")
                results['invalid_code'] = False
        else:
            print(f"❌ Expected redirect, got status {response.status_code}")
            results['invalid_code'] = False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Invalid code test failed: {e}")
        results['invalid_code'] = False
    
    return all(results.values())

def test_auth_success_page():
    """Test 4: Test /auth/success page accessibility"""
    print("\n" + "="*80)
    print("TEST 4: AUTH SUCCESS PAGE")
    print("="*80)
    
    try:
        print(f"🔍 Testing GET {BASE_URL}/auth/success")
        response = requests.get(f"{BASE_URL}/auth/success", timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            # Check for key elements that should be in the auth success page
            if 'Confirming your account' in content and 'redirected to your dashboard' in content:
                print("✅ Auth success page accessible with correct content")
                return True
            else:
                print("❌ Auth success page accessible but missing expected content")
                print("Expected: 'Confirming your account' and 'redirected to your dashboard'")
                return False
        elif response.status_code == 404:
            print("❌ Auth success page not found (404)")
            print("🔍 This page is required for the email confirmation flow")
            return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Auth success page test failed: {e}")
        return False

def test_security_features():
    """Test 5: Test security features and database schema"""
    print("\n" + "="*80)
    print("TEST 5: SECURITY FEATURES")
    print("="*80)
    
    results = {}
    
    # Check if database schema file exists
    print("🔍 Checking database schema updates")
    try:
        with open('/app/database-updates.sql', 'r') as f:
            schema_content = f.read()
            
        # Check for RLS policies
        if 'ROW LEVEL SECURITY' in schema_content.upper() or 'RLS' in schema_content.upper():
            print("✅ RLS policies found in database schema")
            results['rls_policies'] = True
        else:
            print("❌ No RLS policies found in database schema")
            results['rls_policies'] = False
        
        # Check for user profiles table
        if 'profiles' in schema_content.lower():
            print("✅ User profiles table found in schema")
            results['user_profiles'] = True
        else:
            print("❌ User profiles table not found in schema")
            results['user_profiles'] = False
        
        # Check for organizations table
        if 'organizations' in schema_content.lower():
            print("✅ Organizations table found in schema")
            results['organizations'] = True
        else:
            print("❌ Organizations table not found in schema")
            results['organizations'] = False
            
    except FileNotFoundError:
        print("❌ Database schema file not found")
        results['rls_policies'] = False
        results['user_profiles'] = False
        results['organizations'] = False
    
    # Test Supabase configuration
    print("\n🔍 Testing Supabase configuration")
    try:
        with open('/app/lib/supabase.js', 'r') as f:
            supabase_config = f.read()
            
        # Check for required imports and exports
        required_elements = [
            'createClient',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY',
            'export'
        ]
        
        all_present = True
        for element in required_elements:
            if element in supabase_config:
                print(f"✅ {element} found in Supabase config")
            else:
                print(f"❌ {element} missing from Supabase config")
                all_present = False
        
        results['supabase_config'] = all_present
        
    except FileNotFoundError:
        print("❌ Supabase configuration file not found")
        results['supabase_config'] = False
    
    return all(results.values())

def test_production_readiness():
    """Test 6: Production readiness check"""
    print("\n" + "="*80)
    print("TEST 6: PRODUCTION READINESS")
    print("="*80)
    
    results = {}
    
    # Check environment variables
    print("🔍 Checking environment variables")
    try:
        with open('/app/.env', 'r') as f:
            env_content = f.read()
            
        required_vars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_KEY',
            'RESEND_API_KEY',
            'EMAIL_FROM',
            'NEXT_PUBLIC_BASE_URL',
            'GEMINI_API_KEY'
        ]
        
        all_present = True
        for var in required_vars:
            if f"{var}=" in env_content:
                print(f"✅ {var} present")
            else:
                print(f"❌ {var} missing")
                all_present = False
        
        results['env_vars'] = all_present
        
    except FileNotFoundError:
        print("❌ .env file not found")
        results['env_vars'] = False
    
    # Check package.json for dependencies
    print("\n🔍 Checking package.json dependencies")
    try:
        with open('/app/package.json', 'r') as f:
            package_data = json.load(f)
            
        dependencies = package_data.get('dependencies', {})
        required_deps = [
            '@supabase/supabase-js',
            'resend',
            '@google/generative-ai',
            'next'
        ]
        
        all_deps_present = True
        for dep in required_deps:
            if dep in dependencies:
                print(f"✅ {dep} dependency present")
            else:
                print(f"❌ {dep} dependency missing")
                all_deps_present = False
        
        results['dependencies'] = all_deps_present
        
    except FileNotFoundError:
        print("❌ package.json not found")
        results['dependencies'] = False
    except json.JSONDecodeError:
        print("❌ package.json is not valid JSON")
        results['dependencies'] = False
    
    # Test core API endpoints
    print("\n🔍 Testing core API endpoints")
    core_endpoints = [
        '/gemini-health',
        '/email-report',
        '/export-pdf'
    ]
    
    endpoint_results = []
    for endpoint in core_endpoints:
        try:
            if endpoint == '/gemini-health':
                response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
            else:
                # POST endpoints with minimal payload
                payload = {"report_id": "test", "variant": "owner"}
                response = requests.post(f"{API_BASE}{endpoint}", json=payload, timeout=10)
            
            if response.status_code in [200, 400]:  # 400 is OK for missing params
                print(f"✅ {endpoint} endpoint accessible")
                endpoint_results.append(True)
            else:
                print(f"❌ {endpoint} endpoint failed: {response.status_code}")
                endpoint_results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint} endpoint failed: {e}")
            endpoint_results.append(False)
    
    results['core_endpoints'] = all(endpoint_results)
    
    return all(results.values())

def run_comprehensive_test():
    """Run all tests and provide summary"""
    print("🏗️ SiteRecap Backend Testing - Email Confirmation and Security Setup")
    print("=" * 80)
    print(f"🕒 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Testing against: {BASE_URL}")
    
    test_results = {}
    
    # Run all tests
    test_results['environment_config'] = test_environment_configuration()
    test_results['email_endpoints'] = test_email_confirmation_endpoints()
    test_results['auth_callbacks'] = test_auth_callback_scenarios()
    test_results['auth_success_page'] = test_auth_success_page()
    test_results['security_features'] = test_security_features()
    test_results['production_readiness'] = test_production_readiness()
    
    # Summary
    print("\n" + "="*80)
    print("COMPREHENSIVE TEST SUMMARY")
    print("="*80)
    
    passed_tests = []
    failed_tests = []
    
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        test_display = test_name.replace('_', ' ').title()
        print(f"{status} - {test_display}")
        
        if result:
            passed_tests.append(test_display)
        else:
            failed_tests.append(test_display)
    
    print(f"\n📊 RESULTS: {len(passed_tests)}/{len(test_results)} tests passed")
    
    if failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"   • {test}")
    
    if len(passed_tests) == len(test_results):
        print("\n🎉 ALL TESTS PASSED - System ready for production deployment!")
        return True
    else:
        print(f"\n⚠️  {len(failed_tests)} test(s) failed - Review issues before deployment")
        return False

if __name__ == "__main__":
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)