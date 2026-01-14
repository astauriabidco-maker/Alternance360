'use server'

import { z } from 'zod'

export type UploadState = {
    message: string
    error: boolean
    details?: string
}

export async function uploadRNCP(formData: FormData): Promise<UploadState> {
    console.log("Action called!")
    return { message: "Server Action Reachable", error: false }
}
