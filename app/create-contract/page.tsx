import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/users"
import ContractCreation from "./ContractCreation"

export default async function CreateContractPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/login")
  }

  return <ContractCreation />
}
