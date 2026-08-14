$BASE = "http://localhost:10001"
$ErrorActionPreference = 'SilentlyContinue'

# ---------- Helper ----------
function Test-Api($label, $status, $detail) {
    $icon = if ($status) { "[PASS]" } else { "[FAIL]" }
    Write-Host "$icon $label - $detail"
}

Write-Host "============================================================"
Write-Host "   AMIN SECURITY VERIFICATION TESTS"
Write-Host "============================================================"
Write-Host ""

# ---- Test 1: OTP Flow ----
Write-Host "--- Auth / OTP ---"
$r1 = Invoke-RestMethod -Uri "$BASE/api/public/auth/otp/send" -Method POST -ContentType "application/json" -Body '{"email":"mdsadiqueamin721721@gmail.com"}' -ErrorVariable e1
if ($e1.Count -eq 0) {
    Test-Api "OTP Send" $true "message=$($r1.message)"
} else {
    Test-Api "OTP Send" $false "Error: $($e1[0].Message)"
}
Write-Host ""

# ---- Test 2: ReDoS - Special chars in category ----
Write-Host "--- ReDoS Prevention ---"
# URL-encode the dangerous string before sending
$dangerousCategory = "regex-attack-.*+?^"
$encoded = [uri]::EscapeDataString($dangerousCategory)
$r2 = Invoke-RestMethod -Uri "$BASE/api/public/products?category=$encoded" -Method GET -ErrorVariable e2
if ($e2.Count -eq 0) {
    Test-Api "Product search with special regex chars" $true "OK, returned $($r2.data.totalResults) results, no crash"
} else {
    Test-Api "Product search with special regex chars" $false "CRASHED: $($e2[0].Message)"
}
Write-Host ""

# ---- Test 3: IDOR - Access order without auth ----
Write-Host "--- IDOR / Authorization ---"
try {
    $r3 = Invoke-WebRequest -Uri "$BASE/api/public/orders/507f1f77bcf86cd799439011" -Method GET -UseBasicParsing -ErrorAction Stop
    Test-Api "Get order without auth" $false "Got $($r3.StatusCode) - expected 401"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Test-Api "Get order without auth" ($code -eq 401) "Got $code (expected 401)"
}
Write-Host ""

# ---- Test 4: Path traversal - Delete upload ----
Write-Host "--- Path Traversal ---"
try {
    $r4 = Invoke-WebRequest -Uri "$BASE/api/admin/upload/delete" -Method POST -ContentType "application/json" -Body '{"publicId":"local-../../package.json"}' -UseBasicParsing -ErrorAction Stop
    Test-Api "Path traversal delete without auth" $false "Got $($r4.StatusCode) - expected 401"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Test-Api "Path traversal delete without auth" ($code -eq 401) "Got $code (expected 401)"
}
Write-Host ""

# ---- Test 5: Rate Limiter ----
Write-Host "--- Rate Limiting ---"
$results = @()
for ($i = 1; $i -le 7; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "$BASE/api/public/auth/otp/send" -Method POST -ContentType "application/json" -Body '{"email":"rate-test@test.com"}' -UseBasicParsing -ErrorAction Stop
        $results += $res.StatusCode
    } catch {
        $results += $_.Exception.Response.StatusCode.value__
    }
}
Write-Host "  Rate limit results (7 reqs, expect 429 from req 6+): $($results -join ', ')"
$gotThrottled = ($results | Where-Object { $_ -eq 429 }).Count -gt 0
Test-Api "Rate limiting (429 appears after limit)" $gotThrottled "Throttled=$gotThrottled"
Write-Host ""

Write-Host "============================================================"
Write-Host "   All tests complete."
Write-Host "============================================================"
