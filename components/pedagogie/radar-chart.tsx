"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface RadarChartProps {
    data: { label: string; value: number }[]
    title?: string
}

export function RadarChart({ data, title = "Profil de Compétences" }: RadarChartProps) {
    const numPoints = data.length
    if (numPoints < 3) {
        return (
            <Card className="w-full h-full">
                <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
                <CardContent className="flex justify-center items-center h-64 text-slate-400 text-sm italic">
                    Pas assez de données pour générer le profil.
                </CardContent>
            </Card>
        )
    }

    const size = 100
    const center = size / 2
    const radius = 40

    // Generate points for the background web
    const getPoint = (angle: number, distance: number) => {
        const x = center + distance * Math.cos(angle - Math.PI / 2)
        const y = center + distance * Math.sin(angle - Math.PI / 2)
        return `${x},${y}`
    }

    const angles = data.map((_, i) => (i * 2 * Math.PI) / numPoints)

    const webLines = [0.25, 0.5, 0.75, 1].map(scale =>
        angles.map(angle => getPoint(angle, radius * scale)).join(" ")
    )

    const dataPoints = data.map((d, i) =>
        getPoint(angles[i], radius * (d.value / 100))
    ).join(" ")

    return (
        <Card className="w-full h-full border-none bg-transparent shadow-none">
            <CardHeader className="pb-2 p-0">
                <CardTitle className="text-xl font-black italic text-blue-900 uppercase tracking-tighter">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-0 h-[300px]">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {/* Background Web */}
                    {webLines.map((points, i) => (
                        <polygon
                            key={i}
                            points={points}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="0.5"
                            strokeDasharray={i < 3 ? "1,1" : "0"}
                        />
                    ))}

                    {/* Axis */}
                    {angles.map((angle, i) => (
                        <line
                            key={i}
                            x1={center} y1={center}
                            x2={center + radius * Math.cos(angle - Math.PI / 2)}
                            y2={center + radius * Math.sin(angle - Math.PI / 2)}
                            stroke="#f1f5f9"
                            strokeWidth="0.5"
                        />
                    ))}

                    {/* Data Shape */}
                    <polygon
                        points={dataPoints}
                        fill="rgba(59, 130, 246, 0.2)"
                        stroke="#2563eb"
                        strokeWidth="1.5"
                        className="animate-in fade-in zoom-in duration-700"
                    />

                    {/* Labels */}
                    {data.map((d, i) => {
                        const angle = angles[i]
                        const tx = center + (radius + 12) * Math.cos(angle - Math.PI / 2)
                        const ty = center + (radius + 12) * Math.sin(angle - Math.PI / 2)
                        return (
                            <text
                                key={i}
                                x={tx} y={ty}
                                textAnchor="middle"
                                fontSize="3"
                                fill="#64748b"
                                className="font-bold uppercase tracking-tighter"
                            >
                                {d.label}
                            </text>
                        )
                    })}
                </svg>
            </CardContent>
        </Card>
    )
}

export function RadarChartDemo() {
    const mockData = [
        { label: "Bloc 1", value: 80 },
        { label: "Bloc 2", value: 45 },
        { label: "Bloc 3", value: 60 },
        { label: "Bloc 4", value: 90 },
        { label: "Bloc 5", value: 30 },
        { label: "Bloc 6", value: 50 },
    ]
    return <RadarChart data={mockData} />
}
