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

/* ─── Shared UI ─── */

function VulnBadge({ type }) {
  const colors = {
    sqli: 'bg-red-dim text-red border border-red/30',
    xss: 'bg-amber-dim text-amber border border-amber/30',
    cmdi: 'bg-[#8b5cf655] text-[#c4b5fd] border border-[#8b5cf633]',
    csrf: 'bg-cyan-dim text-cyan border border-cyan/30',
  }
  const labels = { sqli: 'SQL Injection', xss: 'XSS', cmdi: 'Cmd Injection', csrf: 'CSRF' }
  return <span className={`badge ${colors[type]}`}>{labels[type]}</span>
}

function AttackAlert({ children }) {
  return (
    <div className="pulse-alert bg-red/10 border border-red/30 rounded-lg p-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-red/20 border border-red/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-red"></div>
        </div>
        <div className="text-red text-base font-medium">{children}</div>
      </div>
    </div>
  )
}

function HintBox({ type, children }) {
  const styles = {
    sqli: 'border-red/20 bg-red/5',
    xss: 'border-amber/20 bg-amber/5',
    cmdi: 'border-[#8b5cf6]/20 bg-[#8b5cf6]/5',
    csrf: 'border-cyan/20 bg-cyan/5',
  }
  return (
    <div className={`border rounded-lg p-4 mb-5 ${styles[type]}`}>
      <div className="flex items-center gap-2 mb-2">
        <VulnBadge type={type} />
        <span className="text-text-dim text-sm font-mono">VULNERABILITY</span>
      </div>
      <div className="text-text-dim text-base leading-relaxed">{children}</div>
    </div>
  )
}

function PageShell({ title, children, maxWidth = 'max-w-3xl' }) {
  return (
    <div className={`${maxWidth} mx-auto px-5 py-8`}>
      <h1 className="font-display text-3xl font-bold text-text mb-7 tracking-tight">{title}</h1>
      {children}
    </div>
  )
}

/* ─── Navbar ─── */

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/login', label: 'Login' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/search', label: 'Search' },
    { to: '/comments', label: 'Comments' },
    { to: '/ping', label: 'Network' },
    { to: '/transfer', label: 'Transfer' },
  ]

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-base tracking-tight text-text hover:text-cyan transition-colors">
          Security<span className="text-cyan">Demo</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                location.pathname === to
                  ? 'text-cyan bg-cyan/10'
                  : 'text-text-dim hover:text-text'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/attacks"
            className={`nav-link px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/attacks'
                ? 'text-red bg-red/10'
                : 'text-red/70 hover:text-red'
            }`}
          >
            Attacks
          </Link>
          {user && (
            <button
              onClick={logout}
              className="ml-2 px-3 py-1.5 text-sm font-medium text-text-muted hover:text-text rounded-md border border-border hover:border-text-muted transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ─── Home ─── */

function Home() {
  const cards = [
    { type: 'sqli', title: 'SQL Injection', desc: "Manipulate database queries through the login form.", payload: "' OR '1'='1", link: '/login', color: 'red' },
    { type: 'xss', title: 'Cross-Site Scripting', desc: "Inject malicious scripts via comments and search.", payload: '<script>alert(1)</script>', link: '/comments', color: 'amber' },
    { type: 'cmdi', title: 'Command Injection', desc: "Execute system commands through network tools.", payload: '127.0.0.1 & whoami', link: '/ping', color: '[#8b5cf6]' },
    { type: 'csrf', title: 'Request Forgery', desc: "Forge authenticated requests from external sites.", payload: 'auto-submit form', link: '/transfer', color: 'cyan' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="mb-10 fade-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-cyan/40 to-transparent"></div>
          <span className="font-mono text-xs text-cyan/60 uppercase tracking-widest">Educational Platform</span>
          <div className="h-px flex-1 bg-gradient-to-l from-cyan/40 to-transparent"></div>
        </div>
        <h1 className="text-4xl font-display font-extrabold text-center tracking-tight mb-3">
          Security <span className="text-glow-cyan text-cyan">Vulnerability</span> Sandbox
        </h1>
        <p className="text-center text-text-dim text-base max-w-xl mx-auto leading-relaxed">
          Explore common web vulnerabilities in a safe environment. Each module demonstrates a real attack vector and how detection systems identify threats.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {cards.map((c, i) => (
          <Link
            key={c.type}
            to={c.link}
            className={`card p-5 group fade-up fade-up-${i + 1} hover:border-${c.color}/30`}
          >
            <div className="flex items-center justify-between mb-3">
              <VulnBadge type={c.type} />
              <svg className="w-4 h-4 text-text-muted group-hover:text-text transition-colors group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
            <h3 className="font-display font-bold text-text text-lg mb-1.5">{c.title}</h3>
            <p className="text-text-dim text-base mb-3 leading-relaxed">{c.desc}</p>
            <div className="font-mono text-sm text-text-muted bg-bg/60 rounded-md px-3 py-2 border border-border">
              <span className="text-text-dim mr-1">$</span> {c.payload}
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link to="/attacks" className="btn btn-red inline-flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></div>
          View Attack Log
        </Link>
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
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <PageShell title="Authentication" maxWidth="max-w-md">
      <div className="card p-6">
        <HintBox type="sqli">
          This login form uses unsanitized SQL queries. Try injecting:
          <code className="block mt-2 font-mono text-sm text-red bg-red/10 rounded px-3 py-2 border border-red/20">
            ' OR '1'='1
          </code>
        </HintBox>

        {attackDetected && <AttackAlert>SQL Injection attempt detected and logged!</AttackAlert>}

        {error && !attackDetected && (
          <div className="bg-surface-light border border-border rounded-lg px-4 py-3 mb-5 text-base text-text-dim">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-text-dim uppercase tracking-wider mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm font-mono text-text-dim uppercase tracking-wider mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="admin123" required />
          </div>
          <button type="submit" className="btn btn-cyan w-full">Sign In</button>
        </form>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-text-muted text-sm font-mono">
            Test accounts: <span className="text-text-dim">admin/admin123</span> &middot; <span className="text-text-dim">john/john123</span> &middot; <span className="text-text-dim">jane/jane123</span>
          </p>
        </div>
      </div>
    </PageShell>
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
      axios.get(`${API_URL}/dashboard?user=${currentUser}`)
        .then(res => { setBalance(res.data.balance); setTransactions(res.data.transactions) })
        .catch(err => console.error(err))
    }
  }, [currentUser])

  if (!currentUser) return null

  const stats = [
    { label: 'Balance', value: `$${balance.toFixed(2)}`, color: 'cyan', glow: 'glow-cyan' },
    { label: 'Account', value: 'Premium', color: 'green', glow: 'glow-green' },
    { label: 'Transactions', value: transactions.length, color: 'amber', glow: 'glow-amber' },
  ]

  const actions = [
    { to: '/search', label: 'Search Users', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
    { to: '/comments', label: 'Comments', icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
    { to: '/ping', label: 'Network Tools', icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418' },
    { to: '/transfer', label: 'Transfer', icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
  ]

  return (
    <PageShell title={`Welcome, ${currentUser}`} maxWidth="max-w-5xl">
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className={`card ${s.glow} p-5 fade-up fade-up-${i + 1}`}>
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted mb-1">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color} font-display`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-6">
        <h2 className="font-mono text-sm uppercase tracking-widest text-text-muted mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-mono text-sm text-text-dim">{tx.date}</td>
                  <td>{tx.description}</td>
                  <td className={`text-right font-mono font-semibold ${tx.amount >= 0 ? 'text-green' : 'text-red'}`}>
                    {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${tx.amount >= 0 ? 'bg-green-dim text-green border border-green/20' : 'bg-red-dim text-red border border-red/20'}`}>
                      {tx.amount >= 0 ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="4" className="text-center text-text-muted py-8">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="card p-4 flex flex-col items-center gap-2 group hover:border-cyan/20">
            <svg className="w-5 h-5 text-text-muted group-hover:text-cyan transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={a.icon} /></svg>
            <span className="text-sm font-medium text-text-dim group-hover:text-text transition-colors">{a.label}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}

/* ─── Search ─── */

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

  return (
    <PageShell title="Search Users">
      <div className="card p-6">
        <HintBox type="xss">
          Search results are rendered without sanitization. Try injecting:
          <code className="block mt-2 font-mono text-sm text-amber bg-amber/10 rounded px-3 py-2 border border-amber/20">
            {'<script>alert("XSS")</script>'}
          </code>
        </HintBox>

        {attackDetected && <AttackAlert>XSS attack attempt detected and logged!</AttackAlert>}

        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="input-field flex-1" placeholder="Search by username or email..." />
          <button type="submit" className="btn btn-cyan">Search</button>
        </form>

        {error && !attackDetected && (
          <div className="text-red text-base mb-4">{error}</div>
        )}

        {results.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Username</th><th>Email</th></tr>
              </thead>
              <tbody>
                {results.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-text-dim text-sm">{u.id}</td>
                    <td className="font-medium">{u.username}</td>
                    <td className="text-text-dim">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  )
}

/* ─── Comments ─── */

function Comments() {
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments`)
      setComments(res.data.comments)
    } catch (err) { console.error(err) }
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
      setError(err.response?.data?.error || 'Failed to post comment')
    }
  }

  return (
    <PageShell title="Comments">
      <div className="card p-6 mb-6">
        <HintBox type="xss">
          Comments are stored and displayed without sanitization — a stored XSS vector.
          <code className="block mt-2 font-mono text-sm text-amber bg-amber/10 rounded px-3 py-2 border border-amber/20">
            {'<script>alert("XSS")</script>'}
          </code>
        </HintBox>

        {attackDetected && <AttackAlert>XSS attack attempt detected in comment!</AttackAlert>}
        {error && !attackDetected && <div className="text-red text-base mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment..."
            rows="3"
            className="input-field mb-3 resize-none"
            required
          />
          <button type="submit" className="btn btn-cyan">Post Comment</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-mono text-sm uppercase tracking-widest text-text-muted mb-4">
          All Comments <span className="text-text-dim">({comments.length})</span>
        </h2>
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="bg-bg/50 border border-border rounded-lg px-4 py-3 text-base text-text-dim">
              {c.comment}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-text-muted text-base text-center py-6">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </PageShell>
  )
}

/* ─── Ping ─── */

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

  return (
    <PageShell title="Network Tools">
      <div className="card p-6">
        <HintBox type="cmdi">
          The ping input is passed to a system command. Try injecting:
          <code className="block mt-2 font-mono text-sm text-[#c4b5fd] bg-[#8b5cf6]/10 rounded px-3 py-2 border border-[#8b5cf6]/20">
            127.0.0.1 & whoami
          </code>
        </HintBox>

        {attackDetected && <AttackAlert>Command Injection attempt detected and logged!</AttackAlert>}
        {error && !attackDetected && <div className="text-red text-base mb-4">{error}</div>}

        <form onSubmit={handlePing} className="flex gap-3 mb-5">
          <input type="text" value={host} onChange={(e) => setHost(e.target.value)} className="input-field flex-1" placeholder="Enter host or IP address..." required />
          <button type="submit" className="btn btn-cyan">Ping</button>
        </form>

        {result && (
          <div className="terminal p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-red/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green/60"></div>
              <span className="text-text-muted text-xs font-mono ml-2">terminal</span>
            </div>
            <pre className="text-green text-sm leading-relaxed whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </PageShell>
  )
}

/* ─── Transfer ─── */

function Transfer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toUser, setToUser] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [attackDetected, setAttackDetected] = useState(false)
  const [attackDetail, setAttackDetail] = useState('')
  const [showPayload, setShowPayload] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('user')) navigate('/login')
  }, [navigate])

  const currentUser = user || localStorage.getItem('user')
  if (!currentUser) return null

  const handleTransfer = async (e) => {
    e.preventDefault()
    setAttackDetected(false); setAttackDetail(''); setMessage('')
    try {
      const res = await axios.post(`${API_URL}/transfer`, { to_user: toUser, amount })
      setMessage(res.data.warning ? res.data.message + ' — ' + res.data.warning : res.data.message)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Transfer failed')
    }
  }

  const simulateCsrfAttack = async () => {
    setAttackDetected(false); setAttackDetail(''); setMessage('')
    try {
      const res = await axios.post(`${API_URL}/transfer`, { to_user: 'hacker_account', amount: '9999', simulate_csrf: true })
      if (res.data.attack) {
        setAttackDetected(true)
        setAttackDetail(res.data.attack_detail)
        setMessage(res.data.message)
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Simulation failed')
    }
  }

  const csrfPayload = `<!-- evil-site.com/free-iphone.html -->
<html>
<body>
  <h1>You won a free iPhone!</h1>

  <!-- Hidden form auto-submits -->
  <form action="http://localhost:5001/api/transfer"
        method="POST" id="csrf-form"
        style="display:none">
    <input name="to_user" value="hacker_account" />
    <input name="amount" value="9999" />
  </form>

  <script>
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>`

  return (
    <PageShell title="Transfer Money" maxWidth="max-w-2xl">
      <div className="card p-6 mb-5">
        <HintBox type="csrf">
          This form has no CSRF token. An attacker can forge requests on behalf of authenticated users.
          Click <strong className="text-cyan">Simulate CSRF Attack</strong> below to see it in action.
        </HintBox>

        {attackDetected && (
          <AttackAlert>
            <p className="font-bold">CSRF Attack Succeeded!</p>
            <p className="mt-1 font-normal">{attackDetail}</p>
            {message && <p className="mt-1 font-semibold">{message}</p>}
          </AttackAlert>
        )}

        {message && !attackDetected && (
          <div className="bg-cyan/5 border border-cyan/20 rounded-lg px-4 py-3 mb-5 text-base text-cyan">
            {message}
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-text-dim uppercase tracking-wider mb-2">Recipient</label>
            <input type="text" value={toUser} onChange={(e) => setToUser(e.target.value)} className="input-field" placeholder="Username" required />
          </div>
          <div>
            <label className="block text-sm font-mono text-text-dim uppercase tracking-wider mb-2">Amount ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" placeholder="0.00" required />
          </div>
          <button type="submit" className="btn btn-cyan w-full">Transfer</button>
        </form>
      </div>

      <div className="card p-6 border-red/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red animate-pulse"></div>
          <h3 className="font-display font-bold text-red text-lg">Simulate CSRF Attack</h3>
        </div>
        <p className="text-text-dim text-base mb-4 leading-relaxed">
          Simulates a malicious website that tricks your browser into sending a forged transfer while you're logged in.
        </p>

        <div className="flex gap-3 mb-5">
          <button onClick={simulateCsrfAttack} className="btn btn-red">Launch Attack</button>
          <button onClick={() => setShowPayload(!showPayload)} className="btn btn-ghost">
            {showPayload ? 'Hide' : 'View'} Payload
          </button>
        </div>

        <div className="bg-bg/50 border border-border rounded-lg p-4 text-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-text-muted mb-2">Attack Flow</p>
          <ol className="space-y-2 text-text-dim text-sm leading-relaxed">
            <li className="flex gap-2"><span className="text-red font-mono">01</span> Victim is logged into this banking app</li>
            <li className="flex gap-2"><span className="text-red font-mono">02</span> Victim visits attacker's page (e.g. "free iPhone" scam)</li>
            <li className="flex gap-2"><span className="text-red font-mono">03</span> Hidden form auto-submits transfer to <code className="text-text font-mono">hacker_account</code></li>
            <li className="flex gap-2"><span className="text-red font-mono">04</span> Browser sends request with victim's session cookies</li>
            <li className="flex gap-2"><span className="text-red font-mono">05</span> Server processes it — no CSRF token to block it</li>
          </ol>
        </div>

        {showPayload && (
          <div className="terminal p-4 mt-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-red/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green/60"></div>
              <span className="text-text-muted text-xs font-mono ml-2">attacker-payload.html</span>
            </div>
            <pre className="text-green text-sm leading-relaxed whitespace-pre-wrap">{csrfPayload}</pre>
          </div>
        )}
      </div>
    </PageShell>
  )
}

/* ─── Attack Log ─── */

function AttackLog() {
  const [attacks, setAttacks] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/attacks`)
      .then(res => setAttacks(res.data.attacks))
      .catch(err => console.error(err))
  }, [])

  const typeColors = {
    SQL_INJECTION: { bg: 'bg-red/10', text: 'text-red', border: 'border-red/20' },
    XSS: { bg: 'bg-amber/10', text: 'text-amber', border: 'border-amber/20' },
    COMMAND_INJECTION: { bg: 'bg-[#8b5cf6]/10', text: 'text-[#c4b5fd]', border: 'border-[#8b5cf6]/20' },
    CSRF: { bg: 'bg-cyan/10', text: 'text-cyan', border: 'border-cyan/20' },
  }

  return (
    <PageShell title="Attack Detection Log" maxWidth="max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="card glow-red px-5 py-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red animate-pulse"></div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-text-muted">Threats Detected</p>
            <p className="text-2xl font-bold text-red font-display">{attacks.length}</p>
          </div>
        </div>
        <Link to="/" className="btn btn-ghost ml-auto">Back to Home</Link>
      </div>

      {attacks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-text-muted text-4xl mb-3">~</div>
          <p className="text-text-dim text-base">No attacks detected yet. Try some exploits!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attacks.map((attack, index) => {
            const c = typeColors[attack.type] || typeColors.SQL_INJECTION
            return (
              <div key={index} className={`card p-5 border-l-2 ${c.border} fade-up`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`badge ${c.bg} ${c.text} border ${c.border}`}>{attack.type}</span>
                  <span className="font-mono text-xs text-text-muted">from {attack.ip}</span>
                </div>
                <div className="terminal px-4 py-2.5 mb-3">
                  <p className="text-text-dim text-sm font-mono break-all">{attack.details}</p>
                </div>
                <p className="text-text-muted text-xs font-mono truncate">{attack.user_agent}</p>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

/* ─── App ─── */

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-bg bg-grid scanlines">
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
