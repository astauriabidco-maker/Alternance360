'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface FadeInProps {
    children: ReactNode
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    className?: string
}

export function FadeIn({ children, delay = 0, direction = 'up', className = '' }: FadeInProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 }
    }

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                ...directions[direction]
            }}
            animate={isInView ? {
                opacity: 1,
                x: 0,
                y: 0
            } : {}}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

interface StaggerContainerProps {
    children: ReactNode
    className?: string
    staggerDelay?: number
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }: StaggerContainerProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }
    }
}
