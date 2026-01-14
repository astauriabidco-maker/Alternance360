'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

interface SignatureCanvasProps {
    onSave: (blob: Blob) => void
    width?: number
    height?: number
}

export function SignatureCanvas({ onSave, width = 500, height = 200 }: SignatureCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasContent, setHasContent] = useState(false)

    // Touch/Mouse Event Handlers
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        setIsDrawing(true)
        setHasContent(true)

        // Get coordinates
        const { x, y } = getCoordinates(e, canvas)
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        e.preventDefault() // Prevent scrolling on mobile

        const { x, y } = getCoordinates(e, canvas)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx?.closePath()
            // Auto-save logic could go here if needed, but we prefer explicit save
        }
    }

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        let clientX, clientY

        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = (e as React.MouseEvent).clientX
            clientY = (e as React.MouseEvent).clientY
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        setHasContent(false)
    }

    const handleSave = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.toBlob((blob) => {
            if (blob) onSave(blob)
        }, 'image/png')
    }

    // Init styles
    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.lineWidth = 2
                ctx.lineCap = 'round'
                ctx.strokeStyle = '#000000'
            }
        }
    }, [])

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white cursor-crosshair touch-none">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full block"
                />
            </div>

            <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={clearCanvas} type="button" className="flex-1">
                    <Eraser className="w-4 h-4 mr-2" />
                    Effacer
                </Button>
                <Button onClick={handleSave} disabled={!hasContent} className="flex-1 bg-indigo-600 hover:bg-indigo-700 font-bold">
                    Valider la signature
                </Button>
            </div>
        </div>
    )
}
