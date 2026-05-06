// Base Skeleton component — a pulsing placeholder box
export default function Skeleton({ width = '100%', height = '100%', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div 
      className="skeleton" 
      style={{ 
        width, 
        height, 
        borderRadius,
        ...style 
      }} 
    />
  )
}
