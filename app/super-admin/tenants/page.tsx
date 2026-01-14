import { getTenants } from "@/app/actions/super-admin"
import { TenantManager } from "@/components/super-admin/tenant-manager"
import { Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function TenantsPage() {
    const tenants = await getTenants()

    return (
        <TenantManager initialTenants={tenants} />
    )
}
