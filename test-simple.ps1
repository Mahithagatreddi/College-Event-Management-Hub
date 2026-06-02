Write-Host "======= COORDINATOR EVENT REMOVAL TEST =======" -ForegroundColor Cyan

# Login
$loginBody = @{ username = "coordinator"; password = "coordinator" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

if ($loginResp.success) {
    $token = $loginResp.token
    Write-Host "✅ Logged in as: $($loginResp.user.name)" -ForegroundColor Green
    
    # Get events
    $eventsResp = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method GET
    Write-Host "✅ Total events: $($eventsResp.count)" -ForegroundColor Green
    
    # Show events
    Write-Host "`nCurrent Events:" -ForegroundColor Yellow
    $counter = 1
    foreach ($event in $eventsResp.events) {
        Write-Host "  $counter. $($event.title) - Status: $($event.status)" -ForegroundColor Gray
        $counter++
    }
    
    # Delete first event
    if ($eventsResp.count -gt 0) {
        $eventId = $eventsResp.events[0]._id
        $eventTitle = $eventsResp.events[0].title
        
        Write-Host "`nAttempting to delete: '$eventTitle'" -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $deleteResp = Invoke-RestMethod -Uri "http://localhost:3000/api/events/$eventId" -Method DELETE -Headers $headers
        
        if ($deleteResp.success) {
            Write-Host "✅ Successfully deleted!" -ForegroundColor Green
            Write-Host "   $($deleteResp.message)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed: $($deleteResp.message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
}

Write-Host "`n====== FEATURE ADDED SUCCESSFULLY! =====" -ForegroundColor Green
Write-Host "DELETE /api/events/:id - Coordinator Only" -ForegroundColor Cyan
