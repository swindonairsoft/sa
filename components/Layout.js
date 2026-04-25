// components/Layout.js
import Navbar from './Navbar'
import Footer from './Footer'
import Head from 'next/head'

export default function Layout({ children, session, title = 'Swindon Airsoft', description = 'Book airsoft events in Swindon, Wiltshire. Walk-on and hire packages available.' }) {
  return (
    <>
      <Head>
        <title>{title === 'Swindon Airsoft' ? title : `${title} — Swindon Airsoft`}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>
      <div className="min-h-screen flex flex-col" style={{ background: '#080c07' }}>
        <Navbar session={session} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}
