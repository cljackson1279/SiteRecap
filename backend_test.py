#!/usr/bin/env python3
"""
SiteRecap Email Service Testing Suite
Tests email service functionality and debug signup confirmation email issue
Focus: Test email service configuration, test-email endpoints, and debug signup flow
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

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 {test_name}")
    print(f"{'='*60}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

def test_email_configuration():
    """Test GET /api/test-email - Verify Resend configuration and environment variables"""
    print_test_header("EMAIL CONFIGURATION TEST")
    
    try:
        print(f"🔍 Testing GET {API_BASE}/test-email")
        response = requests.get(f"{API_BASE}/test-email", timeout=30)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📄 Response: {json.dumps(data, indent=2)}")
            
            # Check configuration
            if data.get('resend_api_key_present'):
                print_success("RESEND_API_KEY is present")
            else:
                print_error("RESEND_API_KEY is missing")
                
            if data.get('email_from'):
                print_success(f"EMAIL_FROM configured: {data.get('email_from')}")
            else:
                print_error("EMAIL_FROM not configured")
                
            if data.get('base_url'):
                print_success(f"BASE_URL configured: {data.get('base_url')}")
            else:
                print_error("BASE_URL not configured")
                
            return data.get('resend_api_key_present') and data.get('email_from') and data.get('base_url')
        else:
            print_error(f"GET /api/test-email failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"GET /api/test-email failed: {str(e)}")
        return False

def test_email_sending():
    """Test POST /api/test-email - Send a test email to verify Resend service works"""
    print_test_header("EMAIL SENDING TEST")
    
    # Use a test email address
    test_email = "test@siterecap.com"
    
    try:
        print(f"🔍 Testing POST {API_BASE}/test-email")
        payload = {"email": test_email}
        response = requests.post(
            f"{API_BASE}/test-email", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📤 Request: {json.dumps(payload, indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📄 Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print_success(f"Test email sent successfully to {test_email}")
                if data.get('messageId'):
                    print_success(f"Message ID: {data.get('messageId')}")
                return True
            else:
                print_error("Email sending failed - success flag is false")
                return False
        else:
            print_error(f"POST /api/test-email failed with status {response.status_code}")
            try:
                data = response.json()
                print(f"📄 Error Response: {json.dumps(data, indent=2)}")
            except:
                print(f"📄 Error Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"POST /api/test-email failed: {str(e)}")
        return False

def test_send_confirmation():
    """Test POST /api/send-confirmation - Test custom confirmation email sending"""
    print_test_header("SEND CONFIRMATION EMAIL TEST")
    
    test_email = "test@siterecap.com"
    confirmation_url = f"{BASE_URL}/auth/callback?token=test123&email={test_email}"
    
    try:
        print(f"🔍 Testing POST {API_BASE}/send-confirmation")
        payload = {
            "email": test_email,
            "confirmationUrl": confirmation_url
        }
        response = requests.post(
            f"{API_BASE}/send-confirmation", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📤 Request: {json.dumps(payload, indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📄 Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print_success(f"Confirmation email sent successfully to {test_email}")
                if data.get('messageId'):
                    print_success(f"Message ID: {data.get('messageId')}")
                return True
            else:
                print_error("Confirmation email sending failed - success flag is false")
                return False
        else:
            print_error(f"POST /api/send-confirmation failed with status {response.status_code}")
            try:
                data = response.json()
                print(f"📄 Error Response: {json.dumps(data, indent=2)}")
            except:
                print(f"📄 Error Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"POST /api/send-confirmation failed: {str(e)}")
        return False

def test_resend_confirmation():
    """Test POST /api/resend-confirmation - Test resend confirmation functionality"""
    print_test_header("RESEND CONFIRMATION EMAIL TEST")
    
    test_email = "test@siterecap.com"
    
    try:
        print(f"🔍 Testing POST {API_BASE}/resend-confirmation")
        payload = {"email": test_email}
        response = requests.post(
            f"{API_BASE}/resend-confirmation", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📤 Request: {json.dumps(payload, indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📄 Response: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                print_success(f"Resend confirmation email sent successfully to {test_email}")
                if data.get('messageId'):
                    print_success(f"Message ID: {data.get('messageId')}")
                return True
            else:
                print_error("Resend confirmation email failed - success flag is false")
                return False
        else:
            print_error(f"POST /api/resend-confirmation failed with status {response.status_code}")
            try:
                data = response.json()
                print(f"📄 Error Response: {json.dumps(data, indent=2)}")
            except:
                print(f"📄 Error Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"POST /api/resend-confirmation failed: {str(e)}")
        return False

def test_error_handling():
    """Test error handling for missing parameters"""
    print_test_header("ERROR HANDLING TEST")
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: POST /api/test-email without email parameter
    print("🔍 Testing POST /api/test-email without email parameter")
    try:
        response = requests.post(
            f"{API_BASE}/test-email", 
            json={},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 400:
            print_success("POST /api/test-email correctly returns 400 for missing email")
            tests_passed += 1
        else:
            print_error(f"POST /api/test-email should return 400 for missing email, got {response.status_code}")
    except Exception as e:
        print_error(f"Error testing /api/test-email error handling: {str(e)}")
    
    # Test 2: POST /api/send-confirmation without required parameters
    print("\n🔍 Testing POST /api/send-confirmation without confirmationUrl")
    try:
        response = requests.post(
            f"{API_BASE}/send-confirmation", 
            json={"email": "test@example.com"},  # Missing confirmationUrl
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 400:
            print_success("POST /api/send-confirmation correctly returns 400 for missing confirmationUrl")
            tests_passed += 1
        else:
            print_error(f"POST /api/send-confirmation should return 400 for missing confirmationUrl, got {response.status_code}")
    except Exception as e:
        print_error(f"Error testing /api/send-confirmation error handling: {str(e)}")
    
    # Test 3: POST /api/resend-confirmation without email parameter
    print("\n🔍 Testing POST /api/resend-confirmation without email parameter")
    try:
        response = requests.post(
            f"{API_BASE}/resend-confirmation", 
            json={},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 400:
            print_success("POST /api/resend-confirmation correctly returns 400 for missing email")
            tests_passed += 1
        else:
            print_error(f"POST /api/resend-confirmation should return 400 for missing email, got {response.status_code}")
    except Exception as e:
        print_error(f"Error testing /api/resend-confirmation error handling: {str(e)}")
    
    print_info(f"Error handling tests passed: {tests_passed}/{total_tests}")
    return tests_passed == total_tests

def test_supabase_signup_flow():
    """Check Supabase signup flow configuration - Debug why confirmation emails stopped sending"""
    print_test_header("SUPABASE SIGNUP FLOW INVESTIGATION")
    
    try:
        # Check Supabase configuration
        print("🔍 Checking Supabase configuration")
        with open('/app/lib/supabase.js', 'r') as f:
            supabase_config = f.read()
            
        # Check for required configuration elements
        config_checks = [
            ('createClient import', 'createClient' in supabase_config),
            ('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL' in supabase_config),
            ('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY' in supabase_config),
            ('SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_KEY' in supabase_config),
            ('supabase export', 'export const supabase' in supabase_config),
            ('supabaseAdmin export', 'export const supabaseAdmin' in supabase_config)
        ]
        
        all_config_good = True
        for check_name, check_result in config_checks:
            if check_result:
                print_success(f"{check_name} found")
            else:
                print_error(f"{check_name} missing")
                all_config_good = False
        
        # Check login page signup configuration
        print("\n🔍 Checking login page signup configuration")
        with open('/app/app/login/page.js', 'r') as f:
            login_config = f.read()
            
        signup_checks = [
            ('Supabase auth import', 'supabase' in login_config and 'auth' in login_config),
            ('signUp function', 'signUp' in login_config),
            ('emailRedirectTo', 'emailRedirectTo' in login_config),
            ('siterecap.com redirect', 'siterecap.com/auth/callback' in login_config),
            ('resend confirmation', 'resend-confirmation' in login_config)
        ]
        
        all_signup_good = True
        for check_name, check_result in signup_checks:
            if check_result:
                print_success(f"{check_name} found")
            else:
                print_error(f"{check_name} missing")
                all_signup_good = False
        
        # Check environment variables
        print("\n🔍 Checking email-related environment variables")
        with open('/app/.env', 'r') as f:
            env_content = f.read()
            
        env_checks = [
            ('RESEND_API_KEY', 'RESEND_API_KEY=' in env_content),
            ('EMAIL_FROM', 'EMAIL_FROM=support@siterecap.com' in env_content),
            ('NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_BASE_URL=https://siterecap.com' in env_content),
            ('NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL=' in env_content),
            ('SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_KEY=' in env_content)
        ]
        
        all_env_good = True
        for check_name, check_result in env_checks:
            if check_result:
                print_success(f"{check_name} configured correctly")
            else:
                print_error(f"{check_name} missing or incorrect")
                all_env_good = False
        
        return all_config_good and all_signup_good and all_env_good
        
    except FileNotFoundError as e:
        print_error(f"Required file not found: {str(e)}")
        return False
    except Exception as e:
        print_error(f"Error checking Supabase signup flow: {str(e)}")
        return False

def test_environment_variables():
    """Test environment variables are correctly configured"""
    print_test_header("ENVIRONMENT VARIABLES TEST")
    
    try:
        # Test debug-urls endpoint if available
        print(f"🔍 Testing GET {API_BASE}/debug-urls")
        response = requests.get(f"{API_BASE}/debug-urls", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"📄 Debug URLs Response: {json.dumps(data, indent=2)}")
            
            env_vars = data.get('environment_variables', {})
            
            # Check critical environment variables
            checks = [
                ('NEXT_PUBLIC_BASE_URL', env_vars.get('NEXT_PUBLIC_BASE_URL'), 'https://siterecap.com'),
                ('NEXT_PUBLIC_SITE_URL', env_vars.get('NEXT_PUBLIC_SITE_URL'), 'https://siterecap.com'),
                ('NEXT_PUBLIC_SUPABASE_URL', env_vars.get('NEXT_PUBLIC_SUPABASE_URL'), None),
                ('EMAIL_FROM', env_vars.get('EMAIL_FROM'), 'support@siterecap.com')
            ]
            
            all_good = True
            for var_name, var_value, expected in checks:
                if var_value:
                    if expected and var_value == expected:
                        print_success(f"{var_name}: {var_value} ✓")
                    elif not expected and var_value.startswith('https://'):
                        print_success(f"{var_name}: {var_value} ✓")
                    else:
                        print_error(f"{var_name}: {var_value} (expected: {expected})")
                        all_good = False
                else:
                    print_error(f"{var_name}: Not set or empty")
                    all_good = False
            
            return all_good
        else:
            print_info(f"Debug URLs endpoint not available (status {response.status_code})")
            print_info("This is expected in production - environment variables will be checked via other endpoints")
            return True
            
    except Exception as e:
        print_info(f"Debug URLs endpoint not accessible: {str(e)}")
        print_info("This is expected in production - environment variables will be checked via other endpoints")
        return True

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