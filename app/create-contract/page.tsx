import { UnifiedLayout } from "@/components/unified-layout"
import ContractCreation from "./ContractCreation"

export default function CreateContractPage() {
  return (
    <UnifiedLayout title="Contract Generator" currentPage="create-contract">
      <ContractCreation />
    </UnifiedLayout>
  )
}
