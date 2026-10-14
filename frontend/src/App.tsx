import { useEffect, useState } from 'react'
import {
  Alert,
  Carousel,
  Container,
  Dropdown,
  Nav,
  Navbar,
  Spinner,
  Table,
} from 'react-bootstrap'
import './App.css'

type UserRow = {
  name: string
  id: string
  status: 'Active' | 'Pending' | 'Inactive'
}

type HeroSlide = {
  title: string
  subtitle: string
}

const USERS_API_URL = import.meta.env.VITE_USERS_API_URL ?? 'http://localhost:3000/users'

const isUserRow = (value: unknown): value is UserRow => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const row = value as Record<string, unknown>
  return (
    typeof row.name === 'string' &&
    typeof row.id === 'string' &&
    (row.status === 'Active' || row.status === 'Pending' || row.status === 'Inactive')
  )
}

const heroSlides: HeroSlide[] = [
  { title: 'Good Morning', subtitle: 'Cybers and Spaces.' },
  { title: 'Welcome Back', subtitle: 'A clear view of what matters.' },
  { title: 'Build Something', subtitle: 'Your next idea starts here.' },
]

function App() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [rows, setRows] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadUsers = async () => {
      try {
        const response = await fetch(USERS_API_URL, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload: unknown = await response.json()
        if (!Array.isArray(payload) || !payload.every(isUserRow)) {
          throw new Error('The users response has an invalid format')
        }

        setRows(payload)
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }

        setError(requestError instanceof Error ? requestError.message : 'Unable to load users')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadUsers()
    return () => controller.abort()
  }, [])

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="app-navbar" collapseOnSelect>
        <Container fluid className="app-navbar__inner">
          <Navbar.Brand href="#home" className="app-brand">
            MY APP
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navigation" />
          <Navbar.Collapse id="main-navigation">
            <Nav className="app-nav">
              <Nav.Link href="#home" active>
                Home
              </Nav.Link>
              <Nav.Link href="#records">Link</Nav.Link>
              <Dropdown as={Nav.Item} className="app-dropdown">
                <Dropdown.Toggle as={Nav.Link} id="options-menu">
                  Options
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#records">Records</Dropdown.Item>
                  <Dropdown.Item href="#footer">About this app</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main id="home">
        <section className="hero-section" aria-label="Welcome">
          <Carousel
            activeIndex={activeSlide}
            onSelect={(selectedIndex) => setActiveSlide(selectedIndex ?? 0)}
            controls
            indicators
            interval={5000}
            pause="hover"
            className="hero-carousel"
          >
            {heroSlides.map((slide) => (
              <Carousel.Item key={slide.title}>
                <div className="hero-slide">
                  <div className="hero-content">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </section>

        <section id="records" className="records-section" aria-label="Latest records">
          <Container fluid>
            <div className="table-frame">
              <Table responsive bordered hover className="records-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">ID</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="table-loading">
                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                        <span>Loading users...</span>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={3}>
                        <Alert variant="danger" className="table-alert mb-0">
                          Unable to load users: {error}
                        </Alert>
                      </td>
                    </tr>
                  ) : rows.length > 0 ? (
                    rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.id}</td>
                        <td>
                          <span className={`status-badge status-badge--${row.status.toLowerCase()}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="empty-state">
                        No records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Container>
        </section>
      </main>

      <footer id="footer" className="app-footer">
        <span className="footer-mark" aria-hidden="true">{'\u2735'}</span>
        <span>Hanoi, August 2026</span>
      </footer>
    </div>
  )
}

export default App
