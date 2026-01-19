// Configuration
const API_URL = 'http://localhost:2222/api/v1/sync/apprentice';
const API_KEY = 'cfa_live_24a277467e648941038e04aac1fc4efef54269865d41ce29';
const WEBHOOK_SITE = 'https://webhook.site/YOUR_ID'; // For testing outgoing webhooks

async function testSync() {
    console.log("🚀 Testing CRM Sync Endpoint...");

    const payload = {
        email: "test-apprentice-crm@example.com",
        firstName: "Test",
        lastName: "CRM Sync",
        externalId: "CRM-EMP-001",
        contract: {
            externalId: "CRM-CON-001",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            rncpCode: "RNCP38362" // This exists in the DB
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log("✅ Sync Successful!");
        } else {
            console.log("❌ Sync Failed!");
        }
    } catch (error) {
        console.error("error:", error);
    }
}

testSync();
console.log("Verification script created. Run it with an active API Key.");
