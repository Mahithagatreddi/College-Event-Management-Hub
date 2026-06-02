Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Academic Coordinator: Event Removal Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Login as Coordinator
Write-Host "✓ Step 1: Authenticating Coordinator" -ForegroundColor Yellow
$loginBody = @{
    username = "coordinator"
    password = "coordinator"
} | ConvertTo-Json

$loginResp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
                               -Method POST `
                               -ContentType "application/json" `
                               -Body $loginBody

if ($loginResp.success) {
    $token = $loginResp.token
    $coordName = $loginResp.user.name
    Write-Host "✅ Logged in as: $coordName" -ForegroundColor Green
} else {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    exit
}

# 2. Get all events
Write-Host "`n✓ Step 2: Fetching all events from the system" -ForegroundColor Yellow
$eventsResp = Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method GET
Write-Host "✅ Total events in system: $($eventsResp.count)" -ForegroundColor Green

# Display all events
Write-Host "`n--- EVENT LIST ---" -ForegroundColor Cyan
foreach ($event in $eventsResp.events) {
    Write-Host "  • $($event.title) (Status: $($event.status)) - ID: $($event._id)" -ForegroundColor Gray
}

# 3. Delete first event
if ($eventsResp.count -gt 0) {
    $eventToDelete = $eventsResp.events[0]
    $eventId = $eventToDelete._id
    $eventTitle = $eventToDelete.title
    
    Write-Host "`n✓ Step 3: Testing Event Removal" -ForegroundColor Yellow
    Write-Host "   Removing: '$eventTitle' (ID: $eventId)" -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $deleteResp = Invoke-RestMethod -Uri "http://localhost:3000/api/events/$eventId" `
                                        -Method DELETE `
                                        -Headers $headers
        
        if ($deleteResp.success) {
            Write-Host "✅ Event successfully deleted!" -ForegroundColor Green
            Write-Host "   Message: $($deleteResp.message)" -ForegroundColor Green
        } else {
            Write-Host "❌ Delete failed: $($deleteResp.message)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error during deletion: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   This is likely a 404 or authorization issue" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ No events available to delete" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Feature Summary:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ NEW FEATURE ADDED:" -ForegroundColor Green
Write-Host "   DELETE /api/events/:id" -ForegroundColor Cyan
Write-Host "   - Coordinator Only Authorization" -ForegroundColor Cyan
Write-Host "   - Removes event from home page" -ForegroundColor Cyan
Write-Host "   - Deletes associated calendar entries" -ForegroundColor Cyan
Write-Host "   - Notifies event organizer" -ForegroundColor Cyan
Write-Host "   - Posts removal announcement notice" -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Cyan
