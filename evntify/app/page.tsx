import Link from 'next/link';


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className='text-[5rem]'>Eventify!</h1>
      <p className='text-xl font-medium'>Join the campus event community. Discover and join upcoming talks, concerts, and hackathons.</p>
      <Link
        href="/signup"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Sign Up
      </Link>
    </main>
  );

}
