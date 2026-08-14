###############################################################
# AMIN E2E - COMPLETE API + FLOW VERIFICATION v2
# All field names corrected, full coverage
###############################################################

$BASE = "http://localhost:10001"
$FRONTEND = "http://localhost:10002"
$ErrorActionPreference = 'SilentlyContinue'
$Passed = 0; $Failed = 0; $Issues = @()

function Log-Pass($name, $detail = "") {
    Write-Host "[PASS] $name$(if ($detail) { " | $detail" })"
    $script:Passed++
}
function Log-Fail($name, $detail = "") {
    Write-Host "[FAIL] $name$(if ($detail) { " | $detail" })"
    $script:Failed++
    $script:Issues += "$name : $detail"
}
function Log-Skip($name) { Write-Host "[SKIP] $name" }

function Invoke-Api($method, $path, $body = $null, $token = $null) {
    $headers = @{ "Content-Type" = "application/json" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    $params = @{ Uri = "$BASE$path"; Method = $method; Headers = $headers; ErrorAction = "SilentlyContinue" }
    if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 10) }
    try { return Invoke-RestMethod @params } catch { return $null }
}

function Get-Token($email) {
    $send = Invoke-Api POST "/api/public/auth/otp/send" @{ email = $email }
    if (-not $send.success) { Write-Host "  [WARN] OTP send failed for $email : $($send.message)"; return $null }
    Start-Sleep 3
    $log = Get-Content "C:\Users\MD SADIQUE AMIN\.gemini\antigravity-ide\brain\024aef70-7202-42e1-9b32-404113d815f4\.system_generated\tasks\task-217.log" -Tail 12
    $otpLine = ($log | Where-Object { $_ -match "Sending OTP to $email" } | Select-Object -Last 1)
    if ($otpLine -match ": (\d{6})\s*$") {
        $otp = $Matches[1]
        Write-Host "  [OTP for $email]: $otp"
        $verify = Invoke-Api POST "/api/public/auth/otp/verify" @{ email = $email; otp = $otp }
        if ($verify.data.accessToken) { return $verify.data.accessToken }
        Write-Host "  [WARN] OTP verify returned no token"
    }
    return $null
}

Write-Host ""
Write-Host "============================================================"
Write-Host "  AMIN - COMPLETE E2E API & FLOW VERIFICATION v2"
Write-Host "============================================================"

#################################################################
Write-Host ""
Write-Host "--- STEP 1: AUTH - Get tokens ---"
$customerToken = Get-Token "mdsadiqueamin721721@gmail.com"
$adminToken    = Get-Token "mdsadiqueamin721786@gmail.com"
if ($customerToken) { Log-Pass "Customer OTP Login" "Token OK" } else { Log-Fail "Customer OTP Login" "No token" }
if ($adminToken)    { Log-Pass "Admin OTP Login"    "Token OK" } else { Log-Fail "Admin OTP Login"    "No token" }

#################################################################
Write-Host ""
Write-Host "--- STEP 2: PUBLIC CATALOG APIs ---"

$cats = Invoke-Api GET "/api/public/categories"
if ($cats.success -and $cats.data.Count -gt 0) { Log-Pass "GET /categories" "Count=$($cats.data.Count)" }
else { Log-Fail "GET /categories" "Count=$($cats.data.Count)" }

$prods = Invoke-Api GET "/api/public/products"
if ($prods.success -and $prods.data.totalResults -gt 0) { Log-Pass "GET /products" "Total=$($prods.data.totalResults)" }
else { Log-Fail "GET /products" "Returned 0 or error" }

$search = Invoke-Api GET "/api/public/products?search=gold"
if ($search.success) { Log-Pass "GET /products?search=gold" "Results=$($search.data.totalResults)" }
else { Log-Fail "GET /products?search=gold" "No results" }

$facets = Invoke-Api GET "/api/public/products/facets"
if ($facets.success) { Log-Pass "GET /products/facets" "Brands=$($facets.data.brands.Count)" }
else { Log-Fail "GET /products/facets" "No facets returned" }

$firstProd = $prods.data.results[0]
$slug = $firstProd.slug
$detail = Invoke-Api GET "/api/public/products/slug/$slug"
if ($detail.success -and $detail.data.name) { Log-Pass "GET /products/slug/:slug" "Product='$($detail.data.name)'" }
else { Log-Fail "GET /products/slug/:slug" "No product data" }

$redos = Invoke-Api GET "/api/public/products?category=.*%2B%3F%5E%24%7B%7D"
if ($redos -ne $null) { Log-Pass "GET /products (ReDoS safe)" "No crash on special regex chars" }
else { Log-Fail "GET /products (ReDoS safe)" "Server crashed or no response" }

#################################################################
Write-Host ""
Write-Host "--- STEP 3: CUSTOMER PROFILE & WISHLIST ---"

if ($customerToken) {
    $profile = Invoke-Api GET "/api/public/users/profile" $null $customerToken
    if ($profile.success -and $profile.data.email) { Log-Pass "GET /users/profile" "Email=$($profile.data.email) | Name=$($profile.data.name)" }
    else { Log-Fail "GET /users/profile" "No profile data" }

    # Update profile
    $updateProfile = Invoke-Api PATCH "/api/public/users/profile" @{ name = "E2E Test Customer" } $customerToken
    if ($updateProfile.success) { Log-Pass "PATCH /users/profile" "Name updated" }
    else { Log-Fail "PATCH /users/profile" "Update failed" }

    # Wishlist
    $wl = Invoke-Api GET "/api/public/wishlist" $null $customerToken
    if ($wl.success) { Log-Pass "GET /wishlist" "Items=$($wl.data.products.Length)" }
    else { Log-Fail "GET /wishlist" "Error getting wishlist" }

    $wlAdd = Invoke-Api POST "/api/public/wishlist" @{ productId = $firstProd._id } $customerToken
    if ($wlAdd.success) { Log-Pass "POST /wishlist (add)" "ProductId=$($firstProd._id)" }
    else { Log-Fail "POST /wishlist (add)" "Error: $($wlAdd.message)" }

    $wl2 = Invoke-Api GET "/api/public/wishlist" $null $customerToken
    if ($wl2.data.products.Length -gt 0) { Log-Pass "GET /wishlist after add" "Items=$($wl2.data.products.Length)" }
    else { Log-Fail "GET /wishlist after add" "Still empty" }

    $wlRemove = Invoke-Api DELETE "/api/public/wishlist/$($firstProd._id)" $null $customerToken
    if ($wlRemove.success) { Log-Pass "DELETE /wishlist/:id (remove)" "Removed product" }
    else { Log-Fail "DELETE /wishlist/:id (remove)" "Error: $($wlRemove.message)" }
} else { Log-Skip "Customer Auth endpoints (no token)" }

#################################################################
Write-Host ""
Write-Host "--- STEP 4: COUPONS ---"

$invalidCoupon = Invoke-Api POST "/api/public/coupons/validate" @{ code = "NOTEXIST999"; orderAmount = 500 }
if ($invalidCoupon -eq $null -or -not $invalidCoupon.success) { Log-Pass "POST /coupons/validate (invalid)" "Correctly rejected invalid coupon" }
else { Log-Fail "POST /coupons/validate (invalid)" "Should have returned error for invalid coupon" }

#################################################################
Write-Host ""
Write-Host "--- STEP 5: PLACE ORDER (COD) ---"

$orderId = $null
if ($customerToken -and $firstProd) {
    $variantId = if ($firstProd.variants.Count -gt 0) { $firstProd.variants[0]._id } else { $null }
    $variantPrice = if ($firstProd.variants.Count -gt 0) { $firstProd.variants[0].price } else { 999 }

    $orderBody = @{
        items = @(
            @{
                product  = $firstProd._id
                variant  = $variantId
                quantity = 1
                price    = $variantPrice
                name     = $firstProd.name
            }
        )
        shippingAddress = @{
            fullName     = "E2E Test Customer"
            phone        = "9876543210"
            addressLine1 = "123 Test Street"
            city         = "Mumbai"
            state        = "Maharashtra"
            pincode      = "400001"
            country      = "India"
        }
        paymentMethod = "cod"
    }

    $newOrder = Invoke-Api POST "/api/public/orders" $orderBody $customerToken
    if ($newOrder.success) {
        $orderId = $newOrder.data._id
        Log-Pass "POST /orders (COD)" "OrderId=$orderId | Status=$($newOrder.data.status)"
        
        # Verify COD
        $codVerify = Invoke-Api POST "/api/public/orders/verify/cod" @{ orderId = $orderId } $customerToken
        if ($codVerify.success) { Log-Pass "POST /orders/verify/cod" "Status=$($codVerify.data.status)" }
        else { Log-Fail "POST /orders/verify/cod" "Error: $($codVerify.message)" }

        # Get own order
        $myOrder = Invoke-Api GET "/api/public/orders/$orderId" $null $customerToken
        if ($myOrder.success -and $myOrder.data._id) { Log-Pass "GET /orders/:id (own order)" "Status=$($myOrder.data.status)" }
        else { Log-Fail "GET /orders/:id (own order)" "Could not get own order" }

        # IDOR test - access without token
        $idor = Invoke-Api GET "/api/public/orders/$orderId" $null $null
        if ($idor -eq $null -or -not $idor.success) { Log-Pass "GET /orders/:id without auth (IDOR blocked)" "Correctly returns 401" }
        else { Log-Fail "GET /orders/:id without auth (IDOR blocked)" "SECURITY: Unauthenticated access allowed!" }

        # My orders list
        $myOrders = Invoke-Api GET "/api/public/orders/my-orders" $null $customerToken
        if ($myOrders.success -and $myOrders.data.results.Length -gt 0) { Log-Pass "GET /orders/my-orders" "Count=$($myOrders.data.results.Length)" }
        else { Log-Fail "GET /orders/my-orders" "No orders returned" }
    } else {
        Log-Fail "POST /orders (COD)" "Error: $($newOrder.message)"
    }
} else { Log-Skip "Order placement (no token or product)" }

#################################################################
Write-Host ""
Write-Host "--- STEP 6: ADMIN MANAGEMENT APIs ---"

if ($adminToken) {
    # Dashboard
    $stats = Invoke-Api GET "/api/admin/dashboard/stats" $null $adminToken
    if ($stats.success) { Log-Pass "GET /admin/dashboard/stats" "Revenue=$($stats.data.revenue) | Orders=$($stats.data.totalOrders)" }
    else { Log-Fail "GET /admin/dashboard/stats" "No stats" }

    # Admin orders
    $aOrders = Invoke-Api GET "/api/admin/orders" $null $adminToken
    if ($aOrders.success) { Log-Pass "GET /admin/orders" "Count=$($aOrders.data.results.Length)" }
    else { Log-Fail "GET /admin/orders" "No orders" }

    # Admin update order status
    if ($orderId) {
        $upd1 = Invoke-Api PATCH "/api/admin/orders/$orderId/status" @{ status = "processing" } $adminToken
        if ($upd1.success) { Log-Pass "PATCH /admin/orders/:id/status (processing)" "Status=$($upd1.data.status)" }
        else { Log-Fail "PATCH /admin/orders/:id/status (processing)" "Error: $($upd1.message)" }

        $upd2 = Invoke-Api PATCH "/api/admin/orders/$orderId/status" @{ status = "shipped"; trackingNumber = "TRK-E2E-001" } $adminToken
        if ($upd2.success) { Log-Pass "PATCH /admin/orders/:id/status (shipped)" "Status=$($upd2.data.status)" }
        else { Log-Fail "PATCH /admin/orders/:id/status (shipped)" "Error: $($upd2.message)" }

        $upd3 = Invoke-Api PATCH "/api/admin/orders/$orderId/status" @{ status = "delivered" } $adminToken
        if ($upd3.success) { Log-Pass "PATCH /admin/orders/:id/status (delivered)" "Status=$($upd3.data.status)" }
        else { Log-Fail "PATCH /admin/orders/:id/status (delivered)" "Error: $($upd3.message)" }
    }

    # Admin products
    $aProds = Invoke-Api GET "/api/admin/products" $null $adminToken
    if ($aProds.success) { Log-Pass "GET /admin/products" "Total=$($aProds.data.totalResults)" }
    else { Log-Fail "GET /admin/products" "No products" }

    # Admin categories CRUD
    $aCats = Invoke-Api GET "/api/admin/categories" $null $adminToken
    if ($aCats.success) { Log-Pass "GET /admin/categories" "Count=$($aCats.data.Count)" }
    else { Log-Fail "GET /admin/categories" "No categories" }

    $newCat = Invoke-Api POST "/api/admin/categories" @{ name = "E2E Test Category"; description = "Created by E2E script" } $adminToken
    if ($newCat.success) { Log-Pass "POST /admin/categories (create)" "Id=$($newCat.data._id)" }
    else { Log-Fail "POST /admin/categories (create)" "Error: $($newCat.message)" }

    if ($newCat.data._id) {
        $updCat = Invoke-Api PATCH "/api/admin/categories/$($newCat.data._id)" @{ name = "E2E Test Category Updated" } $adminToken
        if ($updCat.success) { Log-Pass "PATCH /admin/categories/:id (update)" "Name=$($updCat.data.name)" }
        else { Log-Fail "PATCH /admin/categories/:id (update)" "Error: $($updCat.message)" }

        $delCat = Invoke-Api DELETE "/api/admin/categories/$($newCat.data._id)" $null $adminToken
        if ($delCat.success) { Log-Pass "DELETE /admin/categories/:id (delete)" "Deleted OK" }
        else { Log-Fail "DELETE /admin/categories/:id (delete)" "Error: $($delCat.message)" }
    }

    # Admin coupons CRUD
    $aCoupons = Invoke-Api GET "/api/admin/coupons" $null $adminToken
    if ($aCoupons.success) { Log-Pass "GET /admin/coupons" "Count=$($aCoupons.data.Length)" }
    else { Log-Fail "GET /admin/coupons" "No coupons" }

    $newCoupon = Invoke-Api POST "/api/admin/coupons" @{
        code = "E2ETEST77"; discountType = "percentage"; discountValue = 10
        minOrderAmount = 100
        startDate = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        endDate   = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ssZ")
        isActive  = $true
    } $adminToken
    if ($newCoupon.success) { Log-Pass "POST /admin/coupons (create)" "Code=E2ETEST77" }
    else { Log-Fail "POST /admin/coupons (create)" "Error: $($newCoupon.message)" }

    if ($newCoupon.data._id) {
        $valCoupon = Invoke-Api POST "/api/public/coupons/validate" @{ code = "E2ETEST77"; orderAmount = 500 }
        if ($valCoupon.success) { Log-Pass "POST /coupons/validate (valid coupon)" "Discount=$($valCoupon.data.discountAmount)" }
        else { Log-Fail "POST /coupons/validate (valid coupon)" "Error: $($valCoupon.message)" }

        $delCoupon = Invoke-Api DELETE "/api/admin/coupons/$($newCoupon.data._id)" $null $adminToken
        if ($delCoupon.success) { Log-Pass "DELETE /admin/coupons/:id" "Deleted OK" }
        else { Log-Fail "DELETE /admin/coupons/:id" "Error: $($delCoupon.message)" }
    }

    # Admin users
    $aUsers = Invoke-Api GET "/api/admin/users" $null $adminToken
    if ($aUsers.success) { Log-Pass "GET /admin/users" "Count=$($aUsers.data.results.Length)" }
    else { Log-Fail "GET /admin/users" "No users" }

    # Admin banners
    $aBanners = Invoke-Api GET "/api/admin/banners" $null $adminToken
    if ($aBanners.success) { Log-Pass "GET /admin/banners" "Count=$($aBanners.data.Length)" }
    else { Log-Fail "GET /admin/banners" "No banners returned" }

    # Admin FAQs
    $aFaqs = Invoke-Api GET "/api/admin/faqs" $null $adminToken
    if ($aFaqs.success) { Log-Pass "GET /admin/faqs" "Count=$($aFaqs.data.Length)" }
    else { Log-Fail "GET /admin/faqs" "No FAQs returned" }

    # RBAC: Customer cannot access admin route
    if ($customerToken) {
        $rbac = Invoke-Api GET "/api/admin/orders" $null $customerToken
        if ($rbac -eq $null -or -not $rbac.success) { Log-Pass "RBAC: Customer blocked from /admin/orders" "Security OK" }
        else { Log-Fail "RBAC: Customer blocked from /admin/orders" "SECURITY: Customer accessed admin route!" }
    }

} else { Log-Skip "Admin API tests (no token)" }

#################################################################
Write-Host ""
Write-Host "--- STEP 7: FRONTEND PAGE REACHABILITY ---"

$pages = @("/", "/shop", "/cart", "/checkout", "/account/orders", "/account/wishlist", "/admin", "/admin/products", "/admin/orders", "/admin/categories")
foreach ($pg in $pages) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:10002$pg" -UseBasicParsing -ErrorAction Stop
        if ($r.StatusCode -eq 200) { Log-Pass "Frontend $pg" "HTTP 200" }
        else { Log-Fail "Frontend $pg" "HTTP $($r.StatusCode)" }
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Log-Fail "Frontend $pg" "HTTP $code (error)"
    }
}

#################################################################
Write-Host ""
Write-Host "--- STEP 8: SECURITY CHECKS ---"

# No auth on protected routes
$noAuth = Invoke-Api GET "/api/public/orders/my-orders" $null $null
if ($noAuth -eq $null -or -not $noAuth.success) { Log-Pass "GET /orders/my-orders without auth (401)" "Correctly blocked" }
else { Log-Fail "GET /orders/my-orders without auth" "SECURITY: No auth required!" }

$noAuthProfile = Invoke-Api GET "/api/public/users/profile" $null $null
if ($noAuthProfile -eq $null -or -not $noAuthProfile.success) { Log-Pass "GET /users/profile without auth (401)" "Correctly blocked" }
else { Log-Fail "GET /users/profile without auth" "SECURITY: No auth required!" }

# Path traversal
try {
    $pt = Invoke-WebRequest -Uri "http://localhost:10001/api/public/upload/delete" -Method POST -ContentType "application/json" -Body '{"publicId":"local-../../etc/passwd"}' -UseBasicParsing -ErrorAction Stop
    Log-Fail "Path traversal protection" "Got $($pt.StatusCode) - should be 401"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) { Log-Pass "Path traversal protection" "Got 401 - blocked at auth" }
    else { Log-Fail "Path traversal protection" "Unexpected status: $code" }
}

#################################################################
Write-Host ""
Write-Host "============================================================"
Write-Host "  FINAL RESULTS"
Write-Host "============================================================"
Write-Host "  PASSED: $Passed"
Write-Host "  FAILED: $Failed"
Write-Host "  TOTAL:  $($Passed + $Failed)"
Write-Host ""
if ($Issues.Count -gt 0) {
    Write-Host "ISSUES TO FIX:"
    $Issues | ForEach-Object { Write-Host "  [BUG] $_" }
} else {
    Write-Host "  All tests passed!"
}
Write-Host "============================================================"
