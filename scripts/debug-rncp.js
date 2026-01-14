
// Native fetch is available in Node 18+
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkDataGouv() {
    const datasetId = '5eebbc067a14b6fecc9c9976'; // RNCP Dataset ID
    const url = `https://www.data.gouv.fr/api/1/datasets/${datasetId}/`;
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            console.log("Dataset Title:", data.title);
            console.log("Resources:");
            data.resources.forEach(r => {
                console.log(`- [${r.format}] ${r.title}: ${r.url}`);
            });
        } else {
            console.log(`❌ FAILED: ${res.status}`);
        }
    } catch (e) {
        console.log(`❌ ERROR: ${e.message}`);
    }
}

checkDataGouv();

