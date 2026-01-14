'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    ChevronRight,
    Sparkles,
    Save,
    Check,
    Grip,
    Plus,
    Trash2,
    Wand2,
    ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { updateReferentielStructure, generateCriteriaWithAI } from '@/app/admin/actions'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Indicateur = {
    id: string
    description: string
}

type Competence = {
    id: string
    description: string
    indicateurs: Indicateur[]
}

type Bloc = {
    id: string
    title: string
    orderIndex: number
    competences: Competence[]
}

type Referentiel = {
    id: string
    codeRncp: string
    title: string
    blocs: Bloc[]
}

function SortableCompetence({
    comp,
    index,
    onEdit,
    onDelete
}: {
    comp: Competence,
    index: number,
    onEdit: (id: string, desc: string) => void,
    onDelete: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: comp.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-emerald-200 transition-all"
        >
            <div className="flex items-start gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-slate-300 hover:text-slate-500 mt-1"
                >
                    <Grip size={20} />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">C{index + 1}</Badge>
                        {comp.id.startsWith('ai-') && (
                            <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs gap-1">
                                <Sparkles size={10} /> IA
                            </Badge>
                        )}
                    </div>
                    <Input
                        value={comp.description}
                        onChange={(e) => onEdit(comp.id, e.target.value)}
                        className="border-none bg-transparent p-0 h-auto text-lg font-medium text-slate-900 focus:ring-0 focus:outline-none"
                    />

                    {comp.indicateurs.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-slate-100 space-y-2">
                            {comp.indicateurs.map(ind => (
                                <div key={ind.id} className="text-sm text-slate-500">
                                    {ind.description}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(comp.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                    <Trash2 size={16} />
                </Button>
            </div>
        </div>
    )
}

export function ConfiguratorClient({ referentiel }: { referentiel: Referentiel }) {
    const [selectedBlocId, setSelectedBlocId] = useState<string | null>(referentiel.blocs[0]?.id || null)
    const [blocs, setBlocs] = useState<Bloc[]>(referentiel.blocs)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            setBlocs((prev) => prev.map(bloc => {
                if (bloc.id !== selectedBlocId) return bloc
                const oldIndex = bloc.competences.findIndex(c => c.id === active.id)
                const newIndex = bloc.competences.findIndex(c => c.id === over?.id)
                return {
                    ...bloc,
                    competences: arrayMove(bloc.competences, oldIndex, newIndex)
                }
            }))
            setHasChanges(true)
        }
    }

    const selectedBloc = blocs.find(b => b.id === selectedBlocId)

    // Auto-save with debounce
    useEffect(() => {
        if (!hasChanges) return

        const timer = setTimeout(() => {
            handleSave()
        }, 2000)

        return () => clearTimeout(timer)
    }, [blocs, hasChanges])

    const handleSave = useCallback(async () => {
        if (!selectedBlocId) return
        setSaving(true)

        try {
            const currentCompetences = selectedBloc?.competences || []
            const result = await updateReferentielStructure(selectedBlocId, currentCompetences)

            if (result.success) {
                setHasChanges(false)
                toast.success("Modifications enregistrées", { duration: 2000 })
            } else {
                toast.error(result.error || "Erreur lors de la sauvegarde")
            }
        } catch (error) {
            toast.error("Erreur de connexion")
        } finally {
            setSaving(false)
        }
    }, [selectedBlocId, selectedBloc])

    const handleCompetenceEdit = (competenceId: string, newDescription: string) => {
        setBlocs(prev => prev.map(bloc => ({
            ...bloc,
            competences: bloc.competences.map(comp =>
                comp.id === competenceId ? { ...comp, description: newDescription } : comp
            )
        })))
        setHasChanges(true)
    }

    const handleAIGenerate = async () => {
        if (!selectedBloc) return

        setAiGenerating(true)
        toast.info("L'IA analyse le référentiel RNCP pour suggérer des critères...", { duration: 3000 })

        try {
            const result = await generateCriteriaWithAI(referentiel.title, selectedBloc.title)

            if (result.success && result.criteria) {
                setBlocs(prev => prev.map(bloc => {
                    if (bloc.id !== selectedBlocId) return bloc
                    return {
                        ...bloc,
                        competences: [
                            ...bloc.competences,
                            ...result.criteria!.map((desc: string, i: number) => ({
                                id: `ai-${Date.now()}-${i}`,
                                description: desc,
                                indicateurs: []
                            }))
                        ]
                    }
                }))
                setHasChanges(true)
                toast.success(`${result.criteria!.length} critères générés par l'IA !`, { icon: <Sparkles className="text-amber-500" size={16} /> })
            } else {
                toast.error(result.error || "L'IA n'a pas pu générer de critères")
            }
        } catch (error) {
            toast.error("Erreur lors de la génération IA")
        } finally {
            setAiGenerating(false)
        }
    }

    return (
        <div className="flex h-screen">
            {/* Left Sidebar - Bloc Navigation */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/admin/referentiels" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Retour à l'Atelier</span>
                    </Link>
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">
                        {referentiel.codeRncp}
                    </div>
                    <h1 className="text-xl font-black text-slate-900 leading-tight">
                        {referentiel.title}
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {blocs.map((bloc, index) => (
                        <button
                            key={bloc.id}
                            onClick={() => setSelectedBlocId(bloc.id)}
                            className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 group ${selectedBlocId === bloc.id
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${selectedBlocId === bloc.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{bloc.title}</div>
                                <div className="text-xs opacity-60">{bloc.competences.length} compétences</div>
                            </div>
                            <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedBlocId === bloc.id ? 'opacity-100' : ''
                                }`} />
                        </button>
                    ))}
                </nav>

                {/* Save Indicator */}
                <div className="p-4 border-t border-slate-100">
                    <div className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${saving ? 'bg-amber-50 text-amber-600' :
                        hasChanges ? 'bg-slate-100 text-slate-500' :
                            'bg-emerald-50 text-emerald-600'
                        }`}>
                        {saving ? (
                            <>
                                <Save className="animate-pulse" size={14} />
                                Enregistrement...
                            </>
                        ) : hasChanges ? (
                            <>
                                <Save size={14} />
                                Modifications en attente
                            </>
                        ) : (
                            <>
                                <Check size={14} />
                                Modifications enregistrées
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Right Panel - Bloc Editor */}
            <main className="flex-1 overflow-y-auto">
                {selectedBloc ? (
                    <div className="p-8">
                        {/* Bloc Header */}
                        <header className="flex items-center justify-between mb-8">
                            <div>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-2">
                                    Bloc {blocs.findIndex(b => b.id === selectedBlocId) + 1}
                                </Badge>
                                <h2 className="text-3xl font-black text-slate-900">{selectedBloc.title}</h2>
                            </div>

                            <Button
                                onClick={handleAIGenerate}
                                disabled={aiGenerating}
                                className="h-12 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold gap-2 shadow-lg shadow-amber-200 transition-all"
                            >
                                {aiGenerating ? (
                                    <>
                                        <Wand2 className="animate-spin" size={18} />
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Générer avec l'IA
                                    </>
                                )}
                            </Button>
                        </header>

                        {/* Competences List with DND */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={selectedBloc.competences.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4">
                                    {selectedBloc.competences.map((comp, index) => (
                                        <SortableCompetence
                                            key={comp.id}
                                            comp={comp}
                                            index={index}
                                            onEdit={handleCompetenceEdit}
                                            onDelete={(id) => {
                                                setBlocs(prev => prev.map(bloc => ({
                                                    ...bloc,
                                                    competences: bloc.competences.filter(c => c.id !== id)
                                                })))
                                                setHasChanges(true)
                                            }}
                                        />
                                    ))}

                                    <button
                                        onClick={() => {
                                            setBlocs(prev => prev.map(bloc => {
                                                if (bloc.id !== selectedBlocId) return bloc
                                                return {
                                                    ...bloc,
                                                    competences: [
                                                        ...bloc.competences,
                                                        { id: `new-${Date.now()}`, description: "", indicateurs: [] }
                                                    ]
                                                }
                                            }))
                                            setHasChanges(true)
                                        }}
                                        className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Plus size={20} />
                                        Ajouter une compétence
                                    </button>
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Sélectionnez un bloc pour commencer
                    </div>
                )}

            </main>
        </div>
    )
}
