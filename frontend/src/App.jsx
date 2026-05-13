import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then(data => {
        setDbStatus({ loading: false, data, error: null })
      })
      .catch(error => {
        setDbStatus({ loading: false, data: null, error: error.message })
      })
  }, [])

  return (
    <>
      <h1>S.T.A.R Learning Path</h1>
      <div className="card">
        <h2>System Status</h2>
        {dbStatus.loading && <p>Connecting to backend...</p>}
        {dbStatus.error && <p style={{color: 'red'}}>Connection Error: {dbStatus.error}</p>}
        {dbStatus.data && (
          <div>
            <p style={{color: 'green'}}>Backend Connection: Successful</p>
            {dbStatus.data.user ? (
              <div>
                <h3>Sample User Data</h3>
                <p><strong>Student ID:</strong> {dbStatus.data.user.StudentId}</p>
                <p><strong>Full Name:</strong> {dbStatus.data.user.FullName}</p>
              </div>
            ) : (
              <p>No sample user found in database.</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App
