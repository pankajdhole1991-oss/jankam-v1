// ============================================================
// App.tsx — JanKam V1 — Phase 2 Cleanup Build
// Section order (approved):
// Hero → Ticker → Numbers → Services → Complaint →
// Worker Tools → Labour Rights → AI Sahayak →
// Districts → Team & Leadership → Join → Contact → Footer
// ============================================================
import { useState, useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import LiveTicker from './components/LiveTicker';
import LiveImpact from './components/LiveImpact';
import Services from './components/Services';
import Movement from './components/Movement';
import { supabase } from './services/supabaseClient';
import { liveStatsService } from './services/liveStats';

// Lazy loaded below-the-fold sections
const SuccessStories = lazy(() => import('./components/SuccessStories'));
const ComplaintForm = lazy(() => import('./components/ComplaintForm'));
const WorkerTools = lazy(() => import('./components/WorkerTools'));
const LabourRights = lazy(() => import('./components/LabourRights'));
const AILabourSahayak = lazy(() => import('./components/AILabourSahayak'));
const DistrictNetwork = lazy(() => import('./components/DistrictNetwork'));
const TeamLeadership = lazy(() => import('./components/TeamLeadership'));
const JoinJanKam = lazy(() => import('./components/JoinJanKam'));
const Contact = lazy(() => import('./components/Contact'));
const AdminPortal = lazy(() => import('./components/AdminPortal'));

const SectionLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', margin: '20px 0' }}>
    <div style={{ width: '32px', height: '32px', border: '3px solid rgba(245,166,35,0.2)', borderTopColor: '#F5A623', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
  </div>
);

const scrollTo = (href: string, focusId?: string) => {
  setTimeout(() => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (focusId) {
        setTimeout(() => {
          const inputEl = document.getElementById(focusId) as HTMLInputElement | null;
          if (inputEl) {
            inputEl.focus();
            inputEl.select?.();
          }
        }, 500); // Wait for the smooth scroll animation to finish
      }
    }
  }, 80);
};

export default function App() {
  const [isAdminView, setIsAdminView] = useState(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    return hash === '#admin' || hash === '#/admin' || path === '/admin';
  });

  // Global Supabase Realtime changes listener
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    console.log('[Realtime] Initializing global Supabase Realtime listener...');

    const channel = client
      .channel('jankam_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        (payload) => {
          console.log('[Realtime] complaints change detected:', payload);
          liveStatsService.invalidate();
          window.dispatchEvent(new Event('jankam-data-update'));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          console.log('[Realtime] members change detected:', payload);
          liveStatsService.invalidate();
          window.dispatchEvent(new Event('jankam-data-update'));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteers' },
        (payload) => {
          console.log('[Realtime] volunteers change detected:', payload);
          liveStatsService.invalidate();
          window.dispatchEvent(new Event('jankam-data-update'));
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Global subscription status:', status);
      });

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      setIsAdminView(hash === '#admin' || hash === '#/admin' || path === '/admin');
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleAdminClose = () => {
    window.history.pushState(null, '', '/');
    window.location.hash = '#home';
    setIsAdminView(false);
  };

  if (isAdminView) {
    return (
      <Suspense fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A1931' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(245,166,35,0.2)', borderTopColor: '#F5A623', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      }>
        <AdminPortal onClose={handleAdminClose} />
      </Suspense>
    );
  }

  return (
    <Layout>
      {/* 1. Hero */}
      <Hero
        onFileComplaint={() => scrollTo('#complaint', 'cf-name')}
        onJoinJankam={() => scrollTo('#join', 'join-name')}
      />

      {/* 2. Live Ticker */}
      <LiveTicker />

      {/* 3. Numbers / Live Impact */}
      <LiveImpact />

      {/* 4. Services */}
      <Services
        onFileComplaint={() => scrollTo('#complaint', 'cf-name')}
        onJoinJankam={() => scrollTo('#join', 'join-name')}
      />

      {/* 4.5 The JanKam Movement */}
      <Movement />

      <Suspense fallback={<SectionLoader />}>
        {/* 4.6 Success Stories */}
        <SuccessStories />

        {/* 5. Complaint Form */}
        <ComplaintForm />

        {/* 6. Worker Tools */}
        <WorkerTools />

        {/* 7. Labour Rights */}
        <LabourRights />

        {/* 8. AI Sahayak */}
        <AILabourSahayak />

        {/* 9. District Network */}
        <DistrictNetwork />

        {/* 10. Team & Leadership */}
        <TeamLeadership />

        {/* 11. Join JanKam */}
        <JoinJanKam />

        {/* 12. Contact */}
        <Contact />
      </Suspense>
    </Layout>
  );
}
