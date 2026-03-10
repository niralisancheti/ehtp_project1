import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './index.css'

const API_URL = 'http://localhost:5000/api'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return localStorage.getItem('user')
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = (username) => {
    setUser(username)
    localStorage.setItem('user', username)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-gray-900 text-white px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-400">SecurityDemo</Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-blue-400 transition">Home</Link>
          <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
          <Link to="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link to="/search" className="hover:text-blue-400 transition">Search</Link>
          <Link to="/comments" className="hover:text-blue-400 transition">Comments</Link>
          <Link to="/ping" className="hover:text-blue-400 transition">Network</Link>
          <Link to="/transfer" className="hover:text-blue-400 transition">Transfer</Link>
          <Link to="/attacks" className="hover:text-red-400 transition text-red-400">Attack Log</Link>
          {user && (
            <button onClick={logout} className="hover:text-red-400 transition">Logout</button>
          )}
        </div>
      </div>
    </nav>
  )
}

function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Security Demo Application</h1>
        <p className="text-gray-600 text-lg">This is an educational web application that demonstrates common web vulnerabilities and their detection/prevention.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <VulnerabilityCard
          title="SQL Injection"
          description="Go to Login page and try entering: ' OR '1'='1 in the username field."
          link="/login"
          color="bg-red-50 border-red-200"
        />
        <VulnerabilityCard
          title="Cross-Site Scripting (XSS)"
          description="Go to Comments page and try: <script>alert('XSS')</script>"
          link="/comments"
          color="bg-yellow-50 border-yellow-200"
        />
        <VulnerabilityCard
          title="Command Injection"
          description="Go to Network Tools and try: 127.0.0.1 & whoami"
          link="/ping"
          color="bg-purple-50 border-purple-200"
        />
        <VulnerabilityCard
          title="Cross-Site Request Forgery (CSRF)"
          description="The transfer page lacks CSRF protection - demonstrates how attacks work."
          link="/transfer"
          color="bg-blue-50 border-blue-200"
        />
      </div>

      <div className="mt-6 text-center">
        <Link to="/attacks" className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
          View Attack Log
        </Link>
      </div>
    </div>
  )
}

function VulnerabilityCard({ title, description, link, color }) {
  return (
    <div className={`p-6 rounded-lg border ${color}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link to={link} className="text-blue-600 hover:underline font-medium">
        Try Now →
      </Link>
    </div>
  )
}

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAttackDetected(false)

    try {
      const res = await axios.post(`${API_URL}/login`, { username, password })
      login(res.data.user)
      navigate('/dashboard')
    } catch (err) {
      if (err.response?.data?.attack) {
        setAttackDetected(true)
      }
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700 font-medium">Vulnerability: SQL Injection</p>
          <p className="text-sm text-yellow-600">This form is vulnerable to SQL injection attacks.</p>
          <code className="bg-yellow-100 px-2 py-1 rounded text-sm">' OR '1'='1</code>
        </div>

        {attackDetected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ SQL Injection attempt detected!
          </div>
        )}

        {error && !attackDetected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <p className="mt-4 text-gray-600 text-sm">
          Default users: admin/admin123, john/john123, jane/jane123
        </p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
    }
  }, [navigate])
  
  const currentUser = user || localStorage.getItem('user')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (currentUser) {
      axios.get(`${API_URL}/dashboard?user=${currentUser}`)
        .then(res => {
          setBalance(res.data.balance)
          setTransactions(res.data.transactions)
        })
        .catch(err => console.error(err))
    }
  }, [currentUser])

  if (!currentUser) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {currentUser}!</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-800">Account Balance</h3>
            <p className="text-3xl font-bold text-blue-600">${balance.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-green-800">Account Type</h3>
            <p className="text-xl text-green-600">Premium Account</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-purple-800">Total Transactions</h3>
            <p className="text-3xl font-bold text-purple-600">{transactions.length}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3">{tx.description}</td>
                  <td className={`p-3 text-right font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${tx.amount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tx.amount >= 0 ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/search" className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
            🔍 Search Users
          </Link>
          <Link to="/comments" className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
            💬 View Comments
          </Link>
          <Link to="/ping" className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
            🌐 Network Tools
          </Link>
          <Link to="/transfer" className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
            💸 Transfer Money
          </Link>
        </div>
      </div>
    </div>
  )
}

function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setAttackDetected(false)

    try {
      const res = await axios.post(`${API_URL}/search`, { query })
      setResults(res.data.results)
    } catch (err) {
      if (err.response?.data?.attack) {
        setAttackDetected(true)
      }
      setError(err.response?.data?.error || 'Search failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Users</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700 font-medium">Vulnerability: XSS</p>
          <p className="text-sm text-yellow-600">Search results are displayed without sanitization.</p>
        </div>

        {attackDetected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ XSS attack attempt detected!
          </div>
        )}

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or email"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Search
            </button>
          </div>
        </form>

        {error && !attackDetected && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        {results.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {results.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Comments() {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments`)
      setComments(res.data.comments)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAttackDetected(false)

    try {
      await axios.post(`${API_URL}/comments`, { comment })
      setComment('')
      fetchComments()
    } catch (err) {
      if (err.response?.data?.attack) {
        setAttackDetected(true)
      }
      setError(err.response?.data?.error || 'Failed to post comment')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comments</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700 font-medium">Vulnerability: XSS</p>
          <p className="text-sm text-yellow-600">Comments are stored and displayed without sanitization.</p>
          <code className="bg-yellow-100 px-2 py-1 rounded text-sm">{'<script>alert("XSS")</script>'}</code>
        </div>

        {attackDetected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ XSS attack attempt detected!
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment"
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Post Comment
          </button>
        </form>

        {error && !attackDetected && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        <h3 className="text-xl font-bold text-gray-800 mb-4">All Comments</h3>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-700">{c.comment}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Ping() {
  const [host, setHost] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)

  const handlePing = async (e) => {
    e.preventDefault()
    setError('')
    setAttackDetected(false)
    setResult('')

    try {
      const res = await axios.post(`${API_URL}/ping`, { host })
      setResult(res.data.result)
    } catch (err) {
      if (err.response?.data?.attack) {
        setAttackDetected(true)
      }
      setError(err.response?.data?.error || 'Ping failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Network Tools</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700 font-medium">Vulnerability: Command Injection</p>
          <p className="text-sm text-yellow-600">The ping functionality is vulnerable to command injection.</p>
          <code className="bg-yellow-100 px-2 py-1 rounded text-sm">127.0.0.1 & whoami</code>
        </div>

        {attackDetected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            ⚠️ Command Injection attempt detected!
          </div>
        )}

        <form onSubmit={handlePing} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Enter host or IP"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Ping
            </button>
          </div>
        </form>

        {error && !attackDetected && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        {result && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

function Transfer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toUser, setToUser] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
    }
  }, [navigate])

  const currentUser = user || localStorage.getItem('user')

  if (!currentUser) {
    return null
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/transfer`, { to_user: toUser, amount })
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Transfer failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Transfer Money</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700 font-medium">Vulnerability: CSRF</p>
          <p className="text-sm text-yellow-600">This form lacks CSRF protection.</p>
        </div>

        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Recipient Username</label>
            <input
              type="text"
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
            Transfer
          </button>
        </form>

        <p className="mt-4 text-gray-500 text-sm">Note: This is a demo. No actual transfers occur.</p>
      </div>
    </div>
  )
}

function AttackLog() {
  const [attacks, setAttacks] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/attacks`)
      .then(res => setAttacks(res.data.attacks))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Attack Detection Log</h2>
        <p className="text-gray-600 mb-6">This page shows all detected attack attempts on the application.</p>

        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <span className="text-red-700 font-bold">Total Attacks Detected: </span>
          <span className="text-red-600 text-xl">{attacks.length}</span>
        </div>

        {attacks.length === 0 ? (
          <p className="text-gray-500">No attacks detected yet.</p>
        ) : (
          <div className="space-y-4">
            {attacks.map((attack, index) => (
              <div key={index} className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-red-800">{attack.type}</h3>
                <p className="text-gray-700 mt-2"><strong>Details:</strong> {attack.details}</p>
                <p className="text-gray-600 mt-1"><strong>IP:</strong> {attack.ip}</p>
                <p className="text-gray-600"><strong>User Agent:</strong> {attack.user_agent}</p>
              </div>
            ))}
          </div>
        )}

        <Link to="/" className="inline-block mt-6 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/ping" element={<Ping />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/attacks" element={<AttackLog />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App