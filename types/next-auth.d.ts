import NextAuth, { DefaultSession } from "next-auth"
import { AdapterUser as BaseAdapterUser } from "@auth/core/adapters"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            tenantId: string | null
        } & DefaultSession["user"]
    }

    interface User {
        id?: string
        role: string
        tenantId: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        tenantId: string | null
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser extends BaseAdapterUser {
        role: string
        tenantId: string | null
    }
}
