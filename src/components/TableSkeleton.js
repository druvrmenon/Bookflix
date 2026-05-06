import Skeleton from './Skeleton'

// TableSkeleton — placeholder for admin data tables
export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="admin-table-wrap" style={{ border: 'none' }}>
      <table className="admin-table">
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i}><Skeleton width="60px" height="12px" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              {[...Array(columns)].map((_, j) => (
                <td key={j}><Skeleton width={j === 0 ? '120px' : '80px'} height="16px" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
