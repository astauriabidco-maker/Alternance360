import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function uploadFile(file: File, folder: string = 'default'): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Define upload directory
    const relativeUploadDir = `/uploads/${folder}`
    const uploadDir = path.join(process.cwd(), 'public', relativeUploadDir)

    // Ensure directory exists
    try {
        await mkdir(uploadDir, { recursive: true })
    } catch (e) {
        console.error("Error creating upload directory", e)
    }

    // Generate unique filename
    const distinctId = uuidv4()
    const extension = path.extname(file.name)
    const filename = `${distinctId}${extension}`

    const filepath = path.join(uploadDir, filename)

    // Write file to disk
    await writeFile(filepath, buffer)

    // Return public URL
    return `${relativeUploadDir}/${filename}`
}
