import dynamic from 'next/dynamic';

const SolarSystem = dynamic(() => import('../components/SolarSystem'), { ssr: false });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0 m-0 w-full h-full">
      <SolarSystem />
    </main>
  );
}
