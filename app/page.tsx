import Image from "next/image";
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions} from '@/app/api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if(!session) {
    redirect('/login')
  }
  
  return (
   <div>
    <h1>Welcome {session.user?.name}</h1>

   </div>
  );
}
