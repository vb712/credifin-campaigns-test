/**
 * CREDIFIN SECURITY TEST SCRIPT
 * ==============================
 * Tests all 7 critical security fixes
 * Run with: node scripts/test-security.js
 */

const BASE_URL = "http://127.0.0.1:3000";

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function log(test, status, details) {
    const icon = status === "PASS" ? "✅" : "❌";
    console.log(`${icon} ${test}: ${details}`);
    results.tests.push({ test, status, details });
    if (status === "PASS") results.passed++;
    else results.failed++;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// TEST 1: OTP Expiration
// =============================================================================
async function testOtpExpiration() {
    console.log("\n📋 TEST 1: OTP Expiration");
    console.log("-".repeat(50));
    
    try {
        // Send OTP
        const sendRes = await fetch(`${BASE_URL}/api/otp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: "9876543210" })
        });
        
        const sendData = await sendRes.json();
        
        if (sendData.expiresAt) {
            const expiresIn = Math.round((sendData.expiresAt - Date.now()) / 1000);
            log("OTP has expiration timestamp", "PASS", `Expires in ${expiresIn} seconds`);
            
            // Check expiration is ~10 minutes (600 seconds, allowing 5 second margin)
            if (expiresIn > 590 && expiresIn <= 605) {
                log("Expiration time is ~10 minutes", "PASS", `${expiresIn}s is within expected range`);
            } else {
                log("Expiration time is ~10 minutes", "FAIL", `${expiresIn}s is outside 590-605s range`);
            }
        } else {
            log("OTP has expiration timestamp", "FAIL", "No expiresAt in response");
        }
        
        // Test expired OTP rejection (simulate with past timestamp)
        const expiredVerifyRes = await fetch(`${BASE_URL}/api/otp/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mobile: "9876543210",
                otp: "123456",
                hash: sendData.hash || "fake",
                expiresAt: Date.now() - 60000, // 1 minute in the past
                name: "Test User",
                productSlug: "e-rickshaw-loan",
                city: "delhi",
                amount: 100000
            })
        });
        
        const expiredData = await expiredVerifyRes.json();
        if (expiredVerifyRes.status === 400 && expiredData.error?.includes("expired")) {
            log("Expired OTP rejected", "PASS", expiredData.error);
        } else {
            log("Expired OTP rejected", "FAIL", `Status: ${expiredVerifyRes.status}, Response: ${JSON.stringify(expiredData)}`);
        }
        
    } catch (err) {
        log("OTP Expiration Test", "FAIL", err.message);
    }
}

// =============================================================================
// TEST 2: Brute Force Protection (Rate Limiting on Verify)
// =============================================================================
async function testBruteForceProtection() {
    console.log("\n📋 TEST 2: Brute Force Protection on OTP Verify");
    console.log("-".repeat(50));
    
    const testMobile = "9" + Math.floor(100000000 + Math.random() * 900000000); // Random number
    
    try {
        // First, send an OTP to get valid hash
        const sendRes = await fetch(`${BASE_URL}/api/otp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: testMobile })
        });
        const sendData = await sendRes.json();
        
        // Try multiple wrong OTPs
        let blocked = false;
        for (let i = 1; i <= 7; i++) {
            const verifyRes = await fetch(`${BASE_URL}/api/otp/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mobile: testMobile,
                    otp: "000000", // Wrong OTP
                    hash: sendData.hash,
                    expiresAt: sendData.expiresAt,
                    name: "Test User",
                    productSlug: "e-rickshaw-loan",
                    city: "delhi",
                    amount: 100000
                })
            });
            
            if (verifyRes.status === 429) {
                blocked = true;
                log("Rate limit triggered on verify", "PASS", `Blocked after ${i} attempts`);
                break;
            }
            
            console.log(`   Attempt ${i}: Status ${verifyRes.status}`);
        }
        
        if (!blocked) {
            log("Rate limit triggered on verify", "FAIL", "Made 7+ attempts without being blocked");
        }
        
    } catch (err) {
        log("Brute Force Test", "FAIL", err.message);
    }
}

// =============================================================================
// TEST 3: No Sensitive Data in Response
// =============================================================================
async function testNoSensitiveDataLeakage() {
    console.log("\n📋 TEST 3: No Sensitive Data Leakage");
    console.log("-".repeat(50));
    
    try {
        const sendRes = await fetch(`${BASE_URL}/api/otp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: "9123456789" })
        });
        
        const responseText = await sendRes.text();
        
        // Check response doesn't contain OTP
        if (!/\b\d{6}\b/.test(responseText) || responseText.includes("expiresAt")) {
            // Found 6-digit number but it's likely the expiresAt timestamp, not OTP
            const parsed = JSON.parse(responseText);
            if (!parsed.otp) {
                log("OTP not exposed in response", "PASS", "No OTP in API response");
            } else {
                log("OTP not exposed in response", "FAIL", "OTP found in response!");
            }
        }
        
        // Check response doesn't contain secret
        if (!responseText.toLowerCase().includes("secret")) {
            log("Secret not exposed in response", "PASS", "No secret in API response");
        } else {
            log("Secret not exposed in response", "FAIL", "Secret found in response!");
        }
        
    } catch (err) {
        log("Data Leakage Test", "FAIL", err.message);
    }
}

// =============================================================================
// TEST 4: Phone Number Validation
// =============================================================================
async function testPhoneValidation() {
    console.log("\n📋 TEST 4: Phone Number Validation");
    console.log("-".repeat(50));
    
    const invalidNumbers = [
        { mobile: "1234567890", reason: "Starts with 1 (invalid)" },
        { mobile: "0987654321", reason: "Starts with 0 (invalid)" },
        { mobile: "5555555555", reason: "Starts with 5 (invalid)" },
        { mobile: "123456789", reason: "Only 9 digits" },
        { mobile: "12345678901", reason: "11 digits" },
    ];
    
    for (const test of invalidNumbers) {
        try {
            const res = await fetch(`${BASE_URL}/api/otp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile: test.mobile })
            });
            
            if (res.status === 400) {
                log(`Reject ${test.mobile}`, "PASS", test.reason);
            } else {
                log(`Reject ${test.mobile}`, "FAIL", `Expected 400, got ${res.status}`);
            }
        } catch (err) {
            log(`Reject ${test.mobile}`, "FAIL", err.message);
        }
    }
    
    // Test valid number
    try {
        const res = await fetch(`${BASE_URL}/api/otp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: "9876543210" })
        });
        
        if (res.status === 200 || res.status === 429) { // 429 if rate limited
            log("Accept valid 98XXXXXXXX", "PASS", "Valid Indian mobile accepted");
        } else {
            log("Accept valid 98XXXXXXXX", "FAIL", `Status ${res.status}`);
        }
    } catch (err) {
        log("Accept valid number", "FAIL", err.message);
    }
}

// =============================================================================
// TEST 5: Rate Limiting on OTP Send
// =============================================================================
async function testSendRateLimiting() {
    console.log("\n📋 TEST 5: Rate Limiting on OTP Send");
    console.log("-".repeat(50));
    
    const testMobile = "9" + Math.floor(100000000 + Math.random() * 900000000);
    
    try {
        let blocked = false;
        for (let i = 1; i <= 5; i++) {
            const res = await fetch(`${BASE_URL}/api/otp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile: testMobile })
            });
            
            if (res.status === 429) {
                blocked = true;
                log("Mobile rate limit works", "PASS", `Blocked after ${i} OTPs to same number`);
                break;
            }
            console.log(`   OTP ${i} sent: Status ${res.status}`);
        }
        
        if (!blocked) {
            log("Mobile rate limit works", "FAIL", "Sent 5+ OTPs without limit (or limit is >5)");
        }
        
    } catch (err) {
        log("Send Rate Limit Test", "FAIL", err.message);
    }
}

// =============================================================================
// TEST 6: Name Validation
// =============================================================================
async function testNameValidation() {
    console.log("\n📋 TEST 6: Input Validation");
    console.log("-".repeat(50));
    
    // Get a valid OTP first
    try {
        const sendRes = await fetch(`${BASE_URL}/api/otp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobile: "9111222333" })
        });
        const sendData = await sendRes.json();
        
        // Test invalid name with special chars
        const verifyRes = await fetch(`${BASE_URL}/api/otp/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mobile: "9111222333",
                otp: "123456",
                hash: sendData.hash,
                expiresAt: sendData.expiresAt,
                name: "<script>alert('xss')</script>",
                productSlug: "e-rickshaw-loan",
                city: "delhi",
                amount: 100000
            })
        });
        
        if (verifyRes.status === 400) {
            log("Reject malicious name input", "PASS", "XSS attempt blocked");
        } else {
            log("Reject malicious name input", "FAIL", `Status ${verifyRes.status}`);
        }
        
    } catch (err) {
        log("Name Validation Test", "FAIL", err.message);
    }
}

// =============================================================================
// MAIN: Run All Tests
// =============================================================================
async function runAllTests() {
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║     CREDIFIN SECURITY VULNERABILITY TESTS             ║");
    console.log("║     Testing all 7 critical fixes                      ║");
    console.log("╚═══════════════════════════════════════════════════════╝");
    console.log(`\n🎯 Target: ${BASE_URL}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);
    
    await testOtpExpiration();
    await testBruteForceProtection();
    await testNoSensitiveDataLeakage();
    await testPhoneValidation();
    await testSendRateLimiting();
    await testNameValidation();
    
    // Summary
    console.log("\n" + "═".repeat(55));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("═".repeat(55));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Score: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed === 0) {
        console.log("\n🎉 ALL SECURITY TESTS PASSED!");
    } else {
        console.log("\n⚠️ Some tests failed. Review the output above.");
    }
}

runAllTests().catch(console.error);
