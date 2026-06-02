Write-Host "======= COORDINATOR EVENT REMOVAL TEST =======" -ForegroundColor Cyan

$loginBody = @{ username = "coordinator"; password = "coordinator" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

if ($loginResp.success) {
    $token = $loginResp.token
    Write-Host "✅ Logged in successfully" -ForegroundColor Green
    
    $eventsResp = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method GET
    Write-Host "✅ Retrieved $($eventsResp.count) events" -ForegroundColor Green
    
    if ($eventsResp.count -gt 0) {
        $eventId = $eventsResp.events[0]._id
        $eventTitle = $eventsResp.events[0].title
        
        Write-Host "`nDeleting event: $eventTitle (ID: $eventId)" -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        Write-Host "Headers sent:" -ForegroundColor Gray
        Write-Host "  Authorization: Bearer $($token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "  Content-Type: application/json" -ForegroundColor Gray
        
        try {
            Write-Host "`nSending DELETE request to: http://localhost:3000/api/events/$eventId" -ForegroundColor Yellow
            
            $deleteResp = Invoke-RestMethod -Uri "http://localhost:3000/api/events/$eventId" `
                                            -Method DELETE `
                                            -Headers $headers `
                                            -ErrorAction Stop
            
            Write-Host "✅ Response received!" -ForegroundColor Green
            Write-Host ($deleteResp | ConvertTo-Json) -ForegroundColor Green
        }
        catch [System.Net.WebException] {
            Write-Host "❌ WebException caught" -ForegroundColor Red
            Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
            
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Gray
        }
        catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Full Error: $($_)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
}
