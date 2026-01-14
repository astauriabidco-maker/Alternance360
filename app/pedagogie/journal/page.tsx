import { JournalEntryForm } from "@/components/pedagogie/journal-entry-form"

// Mock competencies for testing
const MOCK_COMPETENCES = [
    { id: "c1", description: "Administrer un système Linux" },
    { id: "c2", description: "Gérer des conteneurs Docker" },
    { id: "c3", description: "Configurer un réseau sécurisé" },
    { id: "c4", description: "Assurer la maintenance préventive" },
]

export default function JournalPage() {
    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-black tracking-tighter text-blue-950">Mon Espace Apprenti</h1>
                <p className="text-gray-500">Remplissez votre journal quotidien pour valider vos acquis.</p>
            </div>

            <JournalEntryForm competences={MOCK_COMPETENCES} />
        </div>
    )
}
