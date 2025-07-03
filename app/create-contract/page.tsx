import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import ContractCreation from './ContractCreation'

export default async function CreateContractPage() {
  const cookieStore = cookies()
  const session = cookieStore.get('session')
  
  if (!session) {
    redirect('/login')
  }

  return <ContractCreation />
}
