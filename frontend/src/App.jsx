import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import './index.css'

const API_URL = 'http://localhost:5001/api'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem('user'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(storedUser)
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

/* ─── Glitch Text ─── */
function GlitchText({ children, tag: Tag = 'span' }) {
  return (
    <Tag className="glitch-text" data-text={children}>
      {children}
    </Tag>
  )
}

/* ─── Threat Level Badge ─── */
function ThreatBadge({ level }) {
  const colors = {
    critical: 'threat-critical',
    high: 'threat-high',
    medium: 'threat-medium',
    low: 'threat-low',
    detected: 'threat-detected'
  }
  const labels = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    detected: 'DETECTED'
  }
  return <span className={`threat-badge ${colors[level]}`}>{labels[level]}</span>
}

/* ─── Radar Animation ─── */
function RadarPulse() {
  return (
    <div className="radar-container">
      <div className="radar-ring ring-1"></div>
      <div className="radar-ring ring-2"></div>
      <div className="radar-ring ring-3"></div>
      <div className="radar-sweep"></div>
      <div className="radar-blips">
        <div className="blip blip-1"></div>
        <div className="blip blip-2"></div>
        <div className="blip blip-3"></div>
      </div>
    </div>
  )
}

/* ─── Matrix Rain Background ─── */
function MatrixBackground() {
  return <div className="matrix-rain" aria-hidden="true" />
}

/* ─── Navbar ─── */
function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/', label: 'HOME', icon: '⌬' },
    { to: '/login', label: 'AUTH', icon: '⚿' },
    { to: '/dashboard', label: 'PORTAL', icon: '☰' },
    { to: '/attacks', label: 'THREATS', icon: '⚠' },
  ]

  return (
    <nav className="cyber-nav">
      <div className="scanline"></div>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⌬</span>
          <GlitchText tag="span">SECURITY OPS</GlitchText>
        </Link>

        <div className="nav-links">
          {links.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            >
              <span className="link-icon">{icon}</span>
              {label}
            </Link>
          ))}
          {user && (
            <button onClick={logout} className="nav-logout">
              ✕ LOGOUT
            </button>
          )}
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
      </div>
    </nav>
  )
}

/* ─── Home / Dashboard ─── */
function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [threatCount, setThreatCount] = useState(0)

  useEffect(() => {
    axios.get(`${API_URL}/attacks`)
      .then(res => setThreatCount(res.data.attacks.length))
      .catch(() => {})
  }, [])

  const attackModules = [
    {
      id: 'sqli',
      type: 'SQL_INJECTION',
      title: 'SQL Injection',
      description: 'Exploit vulnerable SQL queries to bypass authentication and extract database contents.',
      payload: "' OR '1'='1",
      severity: 'critical',
      path: '/login'
    },
    {
      id: 'xss',
      type: 'XSS_ATTACK',
      title: 'Cross-Site Scripting',
      description: 'Inject malicious scripts into web pages to hijack sessions or steal cookies.',
      payload: '<script>alert("XSS")</script>',
      severity: 'high',
      path: '/comments'
    },
    {
      id: 'cmdi',
      type: 'CMD_INJECTION',
      title: 'Command Injection',
      description: 'Execute system commands through unsanitized input fields.',
      payload: '127.0.0.1 & whoami',
      severity: 'high',
      path: '/ping'
    },
    {
      id: 'csrf',
      type: 'CSRF_ATTACK',
      title: 'Cross-Site Request Forgery',
      description: 'Forge authenticated requests without CSRF token protection.',
      payload: 'auto-submit form',
      severity: 'medium',
      path: '/transfer'
    }
  ]

  return (
    <div className="cyber-home">
      <MatrixBackground />
      
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <ThreatBadge level="detected" />
            <span>ATTACK DETECTION SYSTEM</span>
          </div>
          
          <h1 className="hero-title">
            <GlitchText tag="span">THREAT</GlitchText>
            <br />
            <span className="title-accent">DETECTION</span>
            <br />
            <span className="title-sub">LABORATORY</span>
          </h1>
          
          <p className="hero-desc">
            Analyze and detect web application attacks in a controlled environment.
            Built with attack pattern recognition and real-time logging.
          </p>

          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-value">{attackModules.length}</span>
              <span className="stat-label">ATTACK VECTORS</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{threatCount}</span>
              <span className="stat-label">THREATS LOGGED</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">4</span>
              <span className="stat-label">DETECTION RULES</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <RadarPulse />
        </div>
      </div>

      <div className="attacks-grid">
        <h2 className="section-title">
          <span className="title-line"></span>
          ATTACK MODULES
          <span className="title-line"></span>
        </h2>
        
        <div className="attacks-container">
          {attackModules.map((attack, index) => (
            <div key={attack.id} className="attack-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="attack-card-header">
                <ThreatBadge level={attack.severity} />
                <span className="attack-type">{attack.type}</span>
              </div>
              <h3 className="attack-title">{attack.title}</h3>
              <p className="attack-desc">{attack.description}</p>
              <div className="payload-box">
                <span className="payload-label">PAYLOAD:</span>
                <code>{attack.payload}</code>
              </div>
              <button className="exploit-btn" onClick={() => navigate(attack.path)}>
                <span className="exploit-icon">▶</span>
                LAUNCH ATTACK
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="detection-section">
        <h2 className="section-title">
          <span className="title-line"></span>
          DETECTION ENGINE
          <span className="title-line"></span>
        </h2>
        
        <div className="detection-cards">
          <div className="detection-card">
            <div className="det-icon">◉</div>
            <h4>Pattern Matching</h4>
            <p>Regex-based detection of SQL keywords, script tags, and command operators</p>
          </div>
          <div className="detection-card">
            <div className="det-icon">◉</div>
            <h4>Real-Time Logging</h4>
            <p>Every attack attempt is logged with IP, timestamp, and payload details</p>
          </div>
          <div className="detection-card">
            <div className="det-icon">◉</div>
            <h4>Alert System</h4>
            <p>Immediate notification when attack patterns are detected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Login ─── */
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
      if (err.response?.data?.attack) setAttackDetected(true)
      setError(err.response?.data?.error || 'Authentication failed')
    }
  }

  const injectPayload = () => {
    setUsername("admin' --")
    setPassword('anything')
  }

  return (
    <div className="cyber-page">
      <div className="auth-container">
        <div className="auth-header">
          <ThreatBadge level="critical" />
          <h1><GlitchText tag="span">SQL INJECTION</GlitchText></h1>
          <p>Vulnerable authentication - try bypassing with SQL payloads</p>
        </div>

        {attackDetected && (
          <div className="alert-box alert-danger">
            <span className="alert-icon">⚠</span>
            <div>
              <strong>ATTACK DETECTED</strong>
              <p>SQL Injection attempt logged and blocked!</p>
            </div>
          </div>
        )}

        {error && !attackDetected && (
          <div className="alert-box alert-error">
            <span className="alert-icon">✕</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
            />
          </div>
          <button type="submit" className="cyber-btn primary">
            AUTHENTICATE
          </button>
        </form>

        <div className="auth-footer">
          <p className="test-accounts">TEST: admin/admin123 · john/john123 · jane/jane123</p>
          <button className="inject-btn" onClick={injectPayload}>
            ⌬ AUTO-INJECT PAYLOAD
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Dashboard ─── */
function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const currentUser = user || localStorage.getItem('user')
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (!localStorage.getItem('user')) navigate('/login')
  }, [navigate])

  useEffect(() => {
    if (currentUser) {
      axios.get(`${API_URL}/dashboard`)
        .then(res => { setBalance(res.data.balance); setTransactions(res.data.transactions) })
        .catch(() => {})
    }
  }, [currentUser])

  if (!currentUser) return null

  return (
    <div className="cyber-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>WELCOME, <GlitchText tag="span">{currentUser.toUpperCase()}</GlitchText></h1>
          <ThreatBadge level="detected" />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">$</span>
            <span className="stat-value">${balance.toFixed(2)}</span>
            <span className="stat-label">BALANCE</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">☰</span>
            <span className="stat-value">{transactions.length}</span>
            <span className="stat-label">TRANSACTIONS</span>
          </div>
        </div>

        <div className="actions-grid">
          <Link to="/search" className="action-card">
            <span className="action-icon">⌕</span>
            <span className="action-label">SEARCH</span>
            <span className="action-hint">XSS vulnerable</span>
          </Link>
          <Link to="/comments" className="action-card">
            <span className="action-icon">☰</span>
            <span className="action-label">COMMENTS</span>
            <span className="action-hint">Stored XSS</span>
          </Link>
          <Link to="/ping" className="action-card">
            <span className="action-icon">⚡</span>
            <span className="action-label">NETWORK</span>
            <span className="action-hint">Cmd Injection</span>
          </Link>
          <Link to="/transfer" className="action-card">
            <span className="action-icon">⇄</span>
            <span className="action-label">TRANSFER</span>
            <span className="action-hint">CSRF vulnerable</span>
          </Link>
        </div>

        <div className="transactions-section">
          <h2>RECENT TRANSACTIONS</h2>
          <div className="transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-row">
                <span className="tx-date">{tx.date}</span>
                <span className="tx-desc">{tx.description}</span>
                <span className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                  {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="no-data">No transactions recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Search (XSS vulnerable) ─── */
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
      if (err.response?.data?.attack) setAttackDetected(true)
      setError(err.response?.data?.error || 'Search failed')
    }
  }

  const injectXSS = () => {
    setQuery('<script>alert("XSS")</script>')
  }

  return (
    <div className="cyber-page">
      <div className="vuln-container">
        <div className="vuln-header">
          <ThreatBadge level="high" />
          <h1><GlitchText tag="span">XSS VULNERABILITY</GlitchText></h1>
          <p>Search input is not sanitized - malicious scripts execute on page</p>
        </div>

        {attackDetected && (
          <div className="alert-box alert-danger">
            <span className="alert-icon">⚠</span>
            <div>
              <strong>ATTACK DETECTED</strong>
              <p>XSS payload blocked by detection engine!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="cyber-input"
          />
          <button type="submit" className="cyber-btn primary">SEARCH</button>
          <button type="button" className="cyber-btn danger" onClick={injectXSS}>
            ⌬ INJECT XSS
          </button>
        </form>

        {results.length > 0 && (
          <div className="results-list">
            {results.map((u) => (
              <div key={u.id} className="result-row">
                <span className="result-id">#{u.id}</span>
                <span className="result-user">{u.username}</span>
                <span className="result-email">{u.email}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Comments (Stored XSS) ─── */
function Comments() {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments`)
      setComments(res.data.comments)
    } catch (err) {}
  }

  useEffect(() => { fetchComments() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setAttackDetected(false)
    try {
      await axios.post(`${API_URL}/comments`, { comment })
      setComment('')
      fetchComments()
    } catch (err) {
      if (err.response?.data?.attack) setAttackDetected(true)
      setError(err.response?.data?.error || 'Failed to post')
    }
  }

  const injectStoredXSS = () => {
    setComment('<script>alert("STORED XSS")</script>')
  }

  return (
    <div className="cyber-page">
      <div className="vuln-container">
        <div className="vuln-header">
          <ThreatBadge level="high" />
          <h1><GlitchText tag="span">STORED XSS</GlitchText></h1>
          <p>Comments are stored and rendered without sanitization</p>
        </div>

        {attackDetected && (
          <div className="alert-box alert-danger">
            <span className="alert-icon">⚠</span>
            <div>
              <strong>ATTACK DETECTED</strong>
              <p>Stored XSS payload detected and blocked!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter comment..."
            rows="4"
            className="cyber-textarea"
          />
          <div className="form-actions">
            <button type="submit" className="cyber-btn primary">POST COMMENT</button>
            <button type="button" className="cyber-btn danger" onClick={injectStoredXSS}>
              ⌬ INJECT XSS
            </button>
          </div>
        </form>

        <div className="comments-list">
          <h3>ALL COMMENTS ({comments.length})</h3>
          {comments.map((c) => (
            <div key={c.id} className="comment-row">
              <span className="comment-id">#{c.id}</span>
              <div className="comment-content">{c.comment}</div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="no-data">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Ping (Command Injection) ─── */
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
      if (err.response?.data?.attack) setAttackDetected(true)
      setError(err.response?.data?.error || 'Ping failed')
    }
  }

  const injectCmd = () => {
    setHost('127.0.0.1 & whoami')
  }

  return (
    <div className="cyber-page">
      <div className="vuln-container">
        <div className="vuln-header">
          <ThreatBadge level="high" />
          <h1><GlitchText tag="span">COMMAND INJECTION</GlitchText></h1>
          <p>Ping input is passed to system command without sanitization</p>
        </div>

        {attackDetected && (
          <div className="alert-box alert-danger">
            <span className="alert-icon">⚠</span>
            <div>
              <strong>ATTACK DETECTED</strong>
              <p>Command injection attempt blocked by detection engine!</p>
            </div>
          </div>
        )}

        <form onSubmit={handlePing} className="ping-form">
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Enter host or IP..."
            className="cyber-input"
          />
          <button type="submit" className="cyber-btn primary">PING</button>
          <button type="button" className="cyber-btn danger" onClick={injectCmd}>
            ⌬ INJECT CMD
          </button>
        </form>

        {result && (
          <div className="terminal-output">
            <div className="terminal-header">
              <span className="terminal-title">OUTPUT</span>
            </div>
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Transfer (CSRF) ─── */
function Transfer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toUser, setToUser] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('user')) navigate('/login')
  }, [navigate])

  const currentUser = user || localStorage.getItem('user')
  if (!currentUser) return null

  const handleTransfer = async (e) => {
    e.preventDefault()
    setAttackDetected(false)
    setMessage('')
    try {
      const res = await axios.post(`${API_URL}/transfer`, { to_user: toUser, amount })
      setMessage(res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Transfer failed')
    }
  }

  const simulateCSRF = async () => {
    setAttackDetected(false)
    setMessage('')
    try {
      const res = await axios.post(`${API_URL}/transfer`, { 
        to_user: 'hacker', 
        amount: '9999',
        simulate_csrf: true 
      })
      if (res.data.attack) {
        setAttackDetected(true)
        setMessage(res.data.attack_detail)
      }
    } catch (err) {}
  }

  return (
    <div className="cyber-page">
      <div className="vuln-container">
        <div className="vuln-header">
          <ThreatBadge level="medium" />
          <h1><GlitchText tag="span">CSRF VULNERABILITY</GlitchText></h1>
          <p>Form lacks CSRF token - forged requests can be sent</p>
        </div>

        {attackDetected && (
          <div className="alert-box alert-danger">
            <span className="alert-icon">⚠</span>
            <div>
              <strong>CSRF ATTACK SIMULATED</strong>
              <p>{message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleTransfer} className="transfer-form">
          <div className="form-group">
            <label>RECIPIENT</label>
            <input
              type="text"
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              placeholder="Enter username..."
              className="cyber-input"
            />
          </div>
          <div className="form-group">
            <label>AMOUNT ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="cyber-input"
            />
          </div>
          <button type="submit" className="cyber-btn primary">TRANSFER</button>
        </form>

        {message && !attackDetected && (
          <div className="alert-box alert-warning">
            <span className="alert-icon">⚡</span>
            <span>{message}</span>
          </div>
        )}

        <div className="csrf-demo">
          <h3>SIMULATE CSRF ATTACK</h3>
          <p>Simulate an external site forging a transfer request while logged in</p>
          <button className="cyber-btn danger" onClick={simulateCSRF}>
            ⚠ LAUNCH CSRF ATTACK
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Attack Log ─── */
function AttackLog() {
  const [attacks, setAttacks] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    axios.get(`${API_URL}/attacks`)
      .then(res => setAttacks(res.data.attacks))
      .catch(() => {})
  }, [])

  const filteredAttacks = filter === 'all' 
    ? attacks 
    : attacks.filter(a => a.type === filter)

  const threatColors = {
    SQL_INJECTION: 'critical',
    XSS: 'high',
    COMMAND_INJECTION: 'high',
    CSRF: 'medium'
  }

  return (
    <div className="cyber-page">
      <div className="threats-container">
        <div className="threats-header">
          <div className="threats-title">
            <ThreatBadge level="detected" />
            <h1><GlitchText tag="span">THREAT DETECTION</GlitchText></h1>
            <span className="threat-count">{attacks.length} ATTACKS LOGGED</span>
          </div>

          <div className="filter-btns">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              ALL
            </button>
            <button 
              className={filter === 'SQL_INJECTION' ? 'active' : ''} 
              onClick={() => setFilter('SQL_INJECTION')}
            >
              SQLi
            </button>
            <button 
              className={filter === 'XSS' ? 'active' : ''} 
              onClick={() => setFilter('XSS')}
            >
              XSS
            </button>
            <button 
              className={filter === 'COMMAND_INJECTION' ? 'active' : ''} 
              onClick={() => setFilter('COMMAND_INJECTION')}
            >
              CMD
            </button>
          </div>
        </div>

        {filteredAttacks.length === 0 ? (
          <div className="no-threats">
            <span className="no-icon">◇</span>
            <h2>NO THREATS DETECTED</h2>
            <p>Execute attack modules to see detection logs</p>
            <Link to="/" className="cyber-btn primary">GO TO ATTACK MODULES</Link>
          </div>
        ) : (
          <div className="threats-list">
            {filteredAttacks.map((attack, index) => (
              <div key={index} className="threat-card">
                <div className="threat-header">
                  <ThreatBadge level={threatColors[attack.type] || 'medium'} />
                  <span className="threat-type">{attack.type}</span>
                  <span className="threat-ip">from {attack.ip}</span>
                </div>
                <div className="threat-details">
                  <code>{attack.details}</code>
                </div>
                <div className="threat-meta">
                  <span className="threat-agent">{attack.user_agent}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── App ─── */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="cyber-app">
          <MatrixBackground />
          <Navbar />
          <main className="main-content">
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
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
