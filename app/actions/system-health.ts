'use server'

import db from '@/lib/db'
import { auth } from '@/auth'
import os from 'os'

export interface SystemHealth {
    database: { status: 'OK' | 'ERROR', latency: number }
    system: { status: 'OK' | 'WARNING' | 'CRITICAL', load: number, memoryUsage: number } // Load is 1 min avg, Memory is % used
    services: {
        pdfEngine: { status: 'OK' | 'ERROR' }
        storage: { status: 'OK' | 'ERROR' }
    }
    lastUpdated: Date
}

export async function checkSystemHealth(): Promise<SystemHealth> {
    const session = await auth()
    if (!session || session.user.role !== 'super_admin') {
        throw new Error('Unauthorized')
    }

    const health: SystemHealth = {
        database: { status: 'OK', latency: 0 },
        system: { status: 'OK', load: 0, memoryUsage: 0 },
        services: {
            pdfEngine: { status: 'OK' }, // Mocked for now, assumes robust
            storage: { status: 'OK' }    // Mocked for now
        },
        lastUpdated: new Date()
    }

    // 1. Check Database Latency
    const start = performance.now()
    try {
        await db.$queryRaw`SELECT 1`
        health.database.latency = Math.round(performance.now() - start)
        health.database.status = 'OK'
    } catch (e) {
        console.error("Health Check DB Error:", e)
        health.database.status = 'ERROR'
        health.database.latency = -1
    }

    // 2. Check System Load & Memory
    try {
        const cpus = os.cpus().length
        const load = os.loadavg()[0] // 1 minute load average
        // Normalized load (0 to 1 where 1 is 100% CPU usage)
        const normalizedLoad = load / cpus

        const totalMem = os.totalmem()
        const freeMem = os.freemem()
        const usedMemPct = ((totalMem - freeMem) / totalMem) * 100

        health.system.load = parseFloat(normalizedLoad.toFixed(2))
        health.system.memoryUsage = Math.round(usedMemPct)

        if (health.system.load > 0.8 || health.system.memoryUsage > 90) {
            health.system.status = 'CRITICAL'
        } else if (health.system.load > 0.5 || health.system.memoryUsage > 70) {
            health.system.status = 'WARNING'
        }
    } catch (e) {
        console.error("Health Check OS Error:", e)
    }

    return health
}
