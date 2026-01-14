
// Native fetch is available in Node 18+
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function listDatasets() {
    const orgSlug = 'france-competences';
    const url = `https://www.data.gouv.fr/api/1/organizations/${orgSlug}/datasets/?page_size=20`;
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            console.log(`Found ${data.total} datasets.`);
            data.data.forEach(d => {
                console.log(`\nDataset: [${d.id}] ${d.title}`);
                console.log(`Page: ${d.page}`);
                d.resources.forEach(r => {
                    console.log(`  - [${r.format}] ${r.title} (${r.url})`);
                });
            });
        } else {
            console.log(`❌ FAILED: ${res.status}`);
        }
    } catch (e) {
        console.log(`❌ ERROR: ${e.message}`);
    }
}

listDatasets();
