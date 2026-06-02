# Test Delete Event Endpoint

# 1. Login as Coordinator
Write-Host "1. Logging in as Coordinator..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"coordinator","password":"coordinator"}'

if ($loginResponse.success) {
    $token = $loginResponse.token
    Write-Host "✅ Coordinator logged in successfully!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "❌ Login failed: $($loginResponse.message)" -ForegroundColor Red
    exit
}

# 2. Get all events
Write-Host "`n2. Fetching all events..." -ForegroundColor Cyan
$eventsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method GET

if ($eventsResponse.success) {
    Write-Host "✅ Events fetched successfully!" -ForegroundColor Green
    Write-Host "Total events: $($eventsResponse.count)" -ForegroundColor Gray
    
    if ($eventsResponse.count -gt 0) {
        $eventToDelete = $eventsResponse.events[0]
        Write-Host "Event to delete: $($eventToDelete.title) (ID: $($eventToDelete._id))" -ForegroundColor Yellow
        
        # 3. Delete Event
        Write-Host "`n3. Deleting event with coordinator authorization..." -ForegroundColor Cyan
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            
            $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/events/$($eventToDelete._id)" `
                                               -Method DELETE `
                                               -Headers $headers
            
            if ($deleteResponse.success) {
                Write-Host "✅ Event deleted successfully!" -ForegroundColor Green
                Write-Host "Message: $($deleteResponse.message)" -ForegroundColor Gray
            } else {
                Write-Host "❌ Delete failed: $($deleteResponse.message)" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ No events available to delete" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Failed to fetch events: $($eventsResponse.message)" -ForegroundColor Red
}

Write-Host "`n4. Fetching events after deletion..." -ForegroundColor Cyan
$finalEvents = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method GET
Write-Host "Remaining events: $($finalEvents.count)" -ForegroundColor Gray
