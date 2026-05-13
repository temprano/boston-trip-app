import { Outlet } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { BottomNav } from '../components/BottomNav'

export function MainLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0d0d0d',
      }}
    >
      {/* Page Header - Fixed height at top */}
      <PageHeader title="BOSTON" subtitle="MORE THAN A FEELING" />

      {/* Main Content - Scrolls and respects bottom nav */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: '160px',
        //   paddingBottom: '72px', /* Account for fixed BottomNav height */
        }}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation - Already has position: fixed, so goes here */}
      <BottomNav />
    </div>
  )
}
