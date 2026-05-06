import Skeleton from './Skeleton'

// BookSkeleton — placeholder for a single BookCard
export default function BookSkeleton() {
  return (
    <div className="card" style={{ cursor: 'default', overflow: 'hidden' }}>
      {/* Cover image placeholder */}
      <div style={{ position: 'relative', aspectRatio: '2/3' }}>
        <Skeleton borderRadius="0" />
      </div>
      
      {/* Content placeholders */}
      <div style={{ padding: '12px' }}>
        {/* Title */}
        <Skeleton width="85%" height="18px" style={{ marginBottom: '8px' }} />
        {/* Author */}
        <Skeleton width="60%" height="14px" style={{ marginBottom: '12px' }} />
        
        {/* Meta / Badges */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <Skeleton width="40px" height="20px" borderRadius="10px" />
          <Skeleton width="50px" height="20px" borderRadius="10px" />
        </div>
      </div>
    </div>
  )
}
