import { useMemo, useState } from 'react';
import { products } from './data/products';
import { useReservations } from './lib/useReservations';
import { MenuBar } from './components/layout/MenuBar';
import { Hero } from './components/hero/Hero';
import { Ticker } from './components/sections/Ticker';
import { Wishlist } from './components/wishlist/Wishlist';
import { HowItWorks } from './components/sections/HowItWorks';
import { FinalCta } from './components/sections/FinalCta';
import { ProductWindow } from './components/modal/ProductWindow';
import { ClickSparkles } from './components/decor/ClickSparkles';
import { Scene } from './components/decor/Decor';
import { SunCompanion } from './components/decor/SunCompanion';
import { IntroGate } from './components/intro/IntroGate';
import { useMusic } from './lib/useMusic';

export default function App() {
  const reservations = useReservations();
  const [open, setOpen] = useState<{ id: string; intent?: 'reserve' } | null>(null);
  const music = useMusic();
  // pantalla de entrada -> el sol sube -> se va la pantalla
  const [gate, setGate] = useState<'shown' | 'leaving' | 'gone'>('shown');
  const enter = (withSound: boolean) => {
    if (withSound) music.play();
    setGate('leaving');
    window.setTimeout(() => setGate('gone'), 2100);
  };

  // en el hero aparecen los más queridos primero (hasta 3)
  const featured = useMemo(
    () => [...products].sort((a, b) => (b.hearts ?? 0) - (a.hearts ?? 0)).slice(0, 3),
    [],
  );

  const reservedCount = products.filter((p) => reservations.reserved.has(p.id)).length;
  const openProduct = open ? products.find((p) => p.id === open.id) ?? null : null;
  const handleOpen = (id: string, intent?: 'reserve') => setOpen({ id, intent });

  return (
    <>
      <Scene />
      <SunCompanion up={gate !== 'shown'} />
      <a className="skip-link" href="#wishlist">
        Saltar a la wishlist
      </a>
      <MenuBar mode={reservations.mode} music={music} />
      <main>
        <Hero featured={featured} total={products.length} reservedCount={reservedCount} onOpen={handleOpen} />
        <div className="meadow">
          <Ticker total={products.length} reserved={reservedCount} />
          <HowItWorks />
          <Wishlist products={products} reservations={reservations} onOpen={handleOpen} />
          <FinalCta />
        </div>
      </main>
      <ProductWindow
        product={openProduct}
        intent={open?.intent}
        reservations={reservations}
        onClose={() => setOpen(null)}
      />
      <ClickSparkles />
      {gate !== 'gone' && <IntroGate hasMusic={music.available} onEnter={enter} />}
    </>
  );
}
