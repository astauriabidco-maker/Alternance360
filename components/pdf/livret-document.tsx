import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { LivretData } from '@/app/actions/livret'

// Register a default font (Inter-like)
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 700 },
    ]
})

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#1e293b'
    },
    watermark: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        fontSize: 8,
        color: '#94a3b8',
        opacity: 0.7
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#e2e8f0'
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#0f172a'
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    cell: {
        flex: 1
    },
    cellHeader: {
        flex: 1,
        fontWeight: 700,
        fontSize: 9,
        color: '#64748b',
        textTransform: 'uppercase'
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 8,
        fontWeight: 700
    },
    badgeSuccess: {
        backgroundColor: '#dcfce7',
        color: '#166534'
    },
    badgePending: {
        backgroundColor: '#fef3c7',
        color: '#92400e'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 8
    },
    statBox: {
        alignItems: 'center'
    },
    statValue: {
        fontSize: 28,
        fontWeight: 700,
        color: '#0f172a'
    },
    statLabel: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 4
    },
    coverPage: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    coverTitle: {
        fontSize: 32,
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: 10
    },
    coverSubtitle: {
        fontSize: 16,
        color: '#64748b'
    },
    coverInfo: {
        marginTop: 40,
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        alignItems: 'center'
    }
})

interface LivretDocumentProps {
    data: LivretData
}

export function LivretDocument({ data }: LivretDocumentProps) {
    const primaryColor = data.tenant.primaryColor || '#4f46e5'
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.coverPage}>
                    <Text style={[styles.coverTitle, { color: primaryColor }]}>Livret d'Apprentissage</Text>
                    <Text style={styles.coverSubtitle}>{data.tenant.name}</Text>

                    <View style={styles.coverInfo}>
                        <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>{data.apprentice.fullName}</Text>
                        <Text style={{ fontSize: 10, color: '#64748b' }}>{data.apprentice.email}</Text>
                        <Text style={{ fontSize: 10, color: '#64748b', marginTop: 10 }}>
                            Du {formatDate(data.contract.startDate)} au {formatDate(data.contract.endDate)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.watermark}>DOC-{data.documentId} | Généré le {formatDate(data.generatedAt)}</Text>
            </Page>

            {/* Progression Summary */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Synthèse du Parcours</Text>
                        <Text style={styles.subtitle}>Bilan des compétences acquises</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={[styles.statValue, { color: primaryColor }]}>{data.stats.progressPercent}%</Text>
                        <Text style={styles.statLabel}>Progression Globale</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{data.stats.validatedCompetences}/{data.stats.totalCompetences}</Text>
                        <Text style={styles.statLabel}>Compétences Validées</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{data.stats.blocsValidated}/{data.stats.totalBlocs}</Text>
                        <Text style={styles.statLabel}>Blocs Certifiables</Text>
                    </View>
                </View>

                {/* Blocs Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Détail par Bloc de Compétences</Text>
                    <View style={styles.row}>
                        <Text style={styles.cellHeader}>Bloc</Text>
                        <Text style={styles.cellHeader}>Compétences</Text>
                        <Text style={styles.cellHeader}>Progression</Text>
                    </View>
                    {data.blocs.map((bloc) => (
                        <View key={bloc.id} style={styles.row}>
                            <Text style={styles.cell}>{bloc.code} - {bloc.title}</Text>
                            <Text style={styles.cell}>{bloc.totalCount}</Text>
                            <Text style={[styles.cell, { color: bloc.validatedCount === bloc.totalCount ? '#16a34a' : '#f59e0b' }]}>
                                {bloc.validatedCount}/{bloc.totalCount} ({Math.round((bloc.validatedCount / bloc.totalCount) * 100) || 0}%)
                            </Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.watermark}>DOC-{data.documentId} | Page 2</Text>
            </Page>

            {/* Activity Log */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Registre d'Activités</Text>
                        <Text style={styles.subtitle}>Journal de bord de l'apprenti</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.cellHeader}>Date</Text>
                        <Text style={[styles.cellHeader, { flex: 2 }]}>Activité</Text>
                        <Text style={styles.cellHeader}>Type</Text>
                    </View>
                    {data.journalEntries.map((entry) => (
                        <View key={entry.id} style={styles.row}>
                            <Text style={styles.cell}>{formatDate(entry.createdAt)}</Text>
                            <Text style={[styles.cell, { flex: 2 }]}>{entry.title}</Text>
                            <Text style={styles.cell}>{entry.type}</Text>
                        </View>
                    ))}
                    {data.journalEntries.length === 0 && (
                        <Text style={{ color: '#94a3b8', marginTop: 10 }}>Aucune activité enregistrée.</Text>
                    )}
                </View>
                <Text style={styles.watermark}>DOC-{data.documentId} | Page 3</Text>
            </Page>

            {/* Attestation Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Attestation de Fin de Formation</Text>
                        <Text style={styles.subtitle}>Reconnaissance des acquis</Text>
                    </View>
                </View>

                <View style={{ marginVertical: 20 }}>
                    <Text style={{ marginBottom: 15 }}>
                        Je soussigné(e), responsable du CFA {data.tenant.name}, atteste que l'apprenti(e) :
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{data.apprentice.fullName}</Text>
                    <Text style={{ marginBottom: 15 }}>
                        a suivi la formation du {formatDate(data.contract.startDate)} au {formatDate(data.contract.endDate)}
                        et a validé les blocs de compétences suivants :
                    </Text>
                </View>

                <View style={styles.section}>
                    {data.blocs.filter(b => b.validatedCount === b.totalCount && b.totalCount > 0).map((bloc) => (
                        <View key={bloc.id} style={[styles.row, { backgroundColor: '#dcfce7' }]}>
                            <Text style={[styles.cell, { fontWeight: 700 }]}>✓ {bloc.code}</Text>
                            <Text style={[styles.cell, { flex: 2 }]}>{bloc.title}</Text>
                        </View>
                    ))}
                    {data.blocs.filter(b => b.validatedCount === b.totalCount && b.totalCount > 0).length === 0 && (
                        <Text style={{ color: '#94a3b8', marginTop: 10 }}>Aucun bloc entièrement validé pour le moment.</Text>
                    )}
                </View>

                <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '45%' }}>
                        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 5 }}>Signature Responsable CFA</Text>
                        <View style={{ height: 60, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 }} />
                    </View>
                    <View style={{ width: '45%' }}>
                        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 5 }}>Signature Apprenti</Text>
                        <View style={{ height: 60, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 }} />
                    </View>
                </View>

                <Text style={styles.watermark}>DOC-{data.documentId} | Page 4 - Document officiel</Text>
            </Page>
        </Document>
    )
}
