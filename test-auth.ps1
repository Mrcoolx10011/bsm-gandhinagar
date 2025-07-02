# PowerShell test script for admin authentication
$loginData = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    Write-Host "🔐 Testing admin login..."
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Login successful!"
        Write-Host "Token: $($data.token.Substring(0, 20))..."
        
        # Test API calls with token
        $headers = @{
            "Authorization" = "Bearer $($data.token)"
            "Content-Type" = "application/json"
        }
        
        $endpoints = @("/api/members", "/api/campaigns", "/api/donations")
        
        foreach ($endpoint in $endpoints) {
            Write-Host "`n📡 Testing $endpoint..."
            try {
                $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000$endpoint" -Headers $headers -UseBasicParsing
                Write-Host "✅ $endpoint - Status: $($apiResponse.StatusCode)"
            }
            catch {
                Write-Host "❌ $endpoint - Error: $($_.Exception.Message)"
            }
        }
    }
    else {
        Write-Host "❌ Login failed with status: $($response.StatusCode)"
    }
}
catch {
    Write-Host "❌ Login error: $($_.Exception.Message)"
}
