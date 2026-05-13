interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle = 'Itinerary Planner' }: PageHeaderProps) {
  return (
    <header 
      className="page-header"
      style={{
        background: '#000000',
        padding: '24px 0px 24px',
        width: '100%',
        textAlign: 'center',
        position:'fixed'
      }}
    >
      <div 
        className="page-header-city"
        style={{
          fontFamily: "Verdana, sans-serif",
          fontSize: 'clamp(44px, 10vw, 76px)',
          color: '#ffffff',
          textTransform: 'uppercase',
          lineHeight: '1',
          letterSpacing: '-2px',
          fontWeight: 'normal',
          margin: '0'
        }}
      >
        {title}
      </div>
      {subtitle && (
        <p 
          className="page-header-tagline"
          style={{
            fontFamily: "'Blackhawk Italic', cursive",
            fontSize: 'clamp(20px, 5vw, 32px)',
            color: '#ffffff',
            fontStyle: 'italic',
            marginTop: '4px',
            marginBottom: '0'
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
