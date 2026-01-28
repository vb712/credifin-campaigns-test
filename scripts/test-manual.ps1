# CREDIFIN SECURITY TESTS - PowerShell Version
# =============================================

$baseUrl = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CREDIFIN SECURITY TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: OTP Send with valid number
Write-Host "TEST 1: OTP Send (Valid Indian Number)" -ForegroundColor Yellow
Write-Host "-" * 40
try {
    $body = @{ mobile = "9876543210" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/api/otp/send" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ PASS: OTP sent successfully" -ForegroundColor Green
    Write-Host "   - Hash received: $($response.hash.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "   - ExpiresAt: $($response.expiresAt)" -ForegroundColor Gray
    
    if ($response.expiresAt) {
        $expiresIn = [math]::Round(($response.expiresAt - [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) / 1000)
        Write-Host "   - Expires in: ${expiresIn} seconds" -ForegroundColor Gray
        
        if ($expiresIn -gt 590 -and $expiresIn -le 610) {
            Write-Host "✅ PASS: Expiration is ~10 minutes" -ForegroundColor Green
        } else {
            Write-Host "❌ FAIL: Expiration time unexpected: $expiresIn seconds" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ FAIL: No expiresAt in response" -ForegroundColor Red
    }
    
    $global:lastHash = $response.hash
    $global:lastExpires = $response.expiresAt
} catch {
    Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Invalid Phone Number Rejection
Write-Host "`nTEST 2: Invalid Phone Rejection" -ForegroundColor Yellow
Write-Host "-" * 40
$invalidNumbers = @(
    @{ num = "1234567890"; reason = "starts with 1" },
    @{ num = "0987654321"; reason = "starts with 0" },
    @{ num = "5555555555"; reason = "starts with 5" },
    @{ num = "12345"; reason = "too short" }
)

foreach ($test in $invalidNumbers) {
    try {
        $body = @{ mobile = $test.num } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/otp/send" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "❌ FAIL: $($test.num) should be rejected ($($test.reason))" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 400) {
            Write-Host "✅ PASS: $($test.num) rejected ($($test.reason))" -ForegroundColor Green
        } else {
            Write-Host "❌ FAIL: Unexpected error for $($test.num)" -ForegroundColor Red
        }
    }
}

# Test 3: Expired OTP Rejection
Write-Host "`nTEST 3: Expired OTP Rejection" -ForegroundColor Yellow
Write-Host "-" * 40
try {
    $body = @{
        mobile = "9876543210"
        otp = "123456"
        hash = "fakehash"
        expiresAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - 60000  # 1 minute ago
        name = "Test User"
        productSlug = "e-rickshaw-loan"
        city = "delhi"
        amount = 100000
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/otp/verify" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "❌ FAIL: Expired OTP should be rejected" -ForegroundColor Red
} catch {
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
    if ($errorBody.error -like "*expired*") {
        Write-Host "✅ PASS: Expired OTP correctly rejected" -ForegroundColor Green
        Write-Host "   - Message: $($errorBody.error)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  INFO: OTP rejected (may be for different reason)" -ForegroundColor Yellow
        Write-Host "   - Message: $($errorBody.error)" -ForegroundColor Gray
    }
}

# Test 4: Invalid Name Rejection (XSS attempt)
Write-Host "`nTEST 4: XSS Name Rejection" -ForegroundColor Yellow
Write-Host "-" * 40
try {
    $body = @{
        mobile = "9876543210"
        otp = "123456"
        hash = "fakehash"
        expiresAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + 600000
        name = "<script>alert('xss')</script>"
        productSlug = "e-rickshaw-loan"
        city = "delhi"
        amount = 100000
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/otp/verify" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "❌ FAIL: Malicious name should be rejected" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "✅ PASS: XSS attempt blocked in name field" -ForegroundColor Green
    } else {
        Write-Host "⚠️  INFO: Request rejected (status: $($_.Exception.Response.StatusCode.value__))" -ForegroundColor Yellow
    }
}

# Test 5: Rate Limiting on Send (if Redis configured)
Write-Host "`nTEST 5: Rate Limiting (Send)" -ForegroundColor Yellow
Write-Host "-" * 40
$rateLimited = $false
$randomMobile = "9" + (Get-Random -Minimum 100000000 -Maximum 999999999).ToString()

for ($i = 1; $i -le 5; $i++) {
    try {
        $body = @{ mobile = $randomMobile } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/api/otp/send" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
        Write-Host "   Attempt $i : OTP sent" -ForegroundColor Gray
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            Write-Host "✅ PASS: Rate limited after $i attempts" -ForegroundColor Green
            $rateLimited = $true
            break
        }
    }
}

if (-not $rateLimited) {
    Write-Host "⚠️  INFO: Rate limiting may not be active (check Redis config)" -ForegroundColor Yellow
}

# Test 6: Lead Creation (Full Flow)
Write-Host "`nTEST 6: Full Lead Creation Flow" -ForegroundColor Yellow
Write-Host "-" * 40
Write-Host "   (This test requires manual OTP verification)" -ForegroundColor Gray

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
