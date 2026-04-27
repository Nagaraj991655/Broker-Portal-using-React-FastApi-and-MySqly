export default function StepBar({ steps, current }) {

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: 32,
      position: 'relative'    
    }}>

     
      <div style={{
        position: 'absolute',
        top: 13,                 
        left: 28,
        right: 28,
        height: 1.5,
        background: '#b6b4b4',
        zIndex: 0                
      }} />

      
      {steps.map(function(label, i) {

        // Is this step already completed? (before the current step)
        var done = i < current

        // Is this the step we're currently on?
        var active = i === current

        return (
          <div
            key={i}
            style={{
              flex: 1,                    
              display: 'flex',
              flexDirection: 'column',    
              alignItems: 'center',
              gap: 6,
              zIndex: 1                   
            }}
          >
            
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',       
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 500,
             
              background: (active || done) ? '#110d49' : 'white',
              border: '1.5px solid ' + ((active || done) ? '#110d49' : '#e2e8f0'),
              color: (active || done) ? 'white' : '#bfc9d6a9'
            }}>
              
              {done ? '✓' : i + 1}
            </div>

            
            <span style={{
              fontSize: 11,
              textAlign: 'center',
              maxWidth: 80,
              lineHeight: 1.3,
             
              color: active ? '#110d49' : '#94a3b8',
              fontWeight: active ? 500 : 400
            }}>
              {label}
            </span>
          </div>
        )
      })}

    </div>
  )
}
