import { useAppStore } from '../store'
import { TeamTable } from '../components/TeamTable'

export function TravelersPage() {
  const travelers = useAppStore((state) => state.travelers)

  return (
    <div style={{ padding: '16px', backgroundColor: '#ffffff', minHeight: '100%', paddingBottom: '100px' }}>
      {/* MEET THE TEAM Header */}
      {/* <h1 style={{ fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: 'bold', marginBottom: '6px', color: '#ffffff', backgroundColor: '#000000', padding: '6px 10px', borderRadius: '4px', display: 'inline-block', letterSpacing: '-1.68px' }}>
        MEET THE TEAM
      </h1> */}
      <div style={{ height: '2px', backgroundColor: '#ffffff', width: '100%', marginBottom: '16px' }} />

      {travelers.length > 0 ? (
        <TeamTable travelers={travelers} />
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p style={{ color: '#666666', marginBottom: '16px' }}>
            No travelers yet
          </p>
        </div>
      )}
    </div>
  )
}
