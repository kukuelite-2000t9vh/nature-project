import Head from 'next/head';
import dynamic from 'next/dynamic';

const NatureCanvas = dynamic(() => import('../components/NatureCanvas'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Nature – A Living World</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <NatureCanvas />
    </>
  );
}
