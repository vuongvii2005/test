import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Carousel,
  Container,
  Dropdown,
  Nav,
  Navbar,
  Spinner,
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

type SortKey = keyof UserRow
type SortDirection = 'asc' | 'desc'

type SortState = {
  key: SortKey
  direction: SortDirection
}

const PAGE_SIZE = 10
const columns: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'id', label: 'ID' },
  { key: 'status', label: 'Status' },
]
const statuses: Array<UserRow['status']> = ['Active', 'Pending', 'Inactive']

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
  const [filters, setFilters] = useState<Record<SortKey, string>>({
    name: '',
    id: '',
    status: 'All',
  })
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredRows = useMemo(() => {
    const nameFilter = filters.name.trim().toLocaleLowerCase()
    const idFilter = filters.id.trim().toLocaleLowerCase()

    return rows
      .filter((row) => {
        const matchesName = row.name.toLocaleLowerCase().includes(nameFilter)
        const matchesId = row.id.toLocaleLowerCase().includes(idFilter)
        const matchesStatus = filters.status === 'All' || row.status === filters.status

        return matchesName && matchesId && matchesStatus
      })
      .sort((left, right) => {
        const leftValue = left[sort.key]
        const rightValue = right[sort.key]
        const comparison = leftValue.localeCompare(rightValue, undefined, {
          numeric: true,
          sensitivity: 'base',
        })

        return sort.direction === 'asc' ? comparison : -comparison
      })
  }, [filters, rows, sort])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const activePage = Math.min(currentPage, totalPages)
  const visibleRows = filteredRows.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE)

  const updateFilter = (key: SortKey, value: string) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }))
    setCurrentPage(1)
  }

  const updateSort = (key: SortKey) => {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
    setCurrentPage(1)
  }

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
            <div className="grid-frame">
              <div className="grid-scroll">
                <div className="records-grid" role="grid" aria-label="User records">
                  <div className="records-grid__row records-grid__row--header" role="row">
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className="records-grid__cell records-grid__cell--header"
                        role="columnheader"
                        aria-sort={
                          sort.key === column.key
                            ? sort.direction === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                      >
                        <button
                          type="button"
                          className="sort-button"
                          onClick={() => updateSort(column.key)}
                          aria-label={`Sort by ${column.label} ${
                            sort.key === column.key && sort.direction === 'asc' ? 'descending' : 'ascending'
                          }`}
                        >
                          <span>{column.label}</span>
                          <span className="sort-indicator" aria-hidden="true">
                            {sort.key === column.key ? (sort.direction === 'asc' ? 'Asc' : 'Desc') : 'Sort'}
                          </span>
                        </button>

                        {column.key === 'status' ? (
                          <select
                            className="grid-filter"
                            value={filters.status}
                            onChange={(event) => updateFilter('status', event.target.value)}
                            aria-label="Filter by status"
                          >
                            <option value="All">All statuses</option>
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="grid-filter"
                            type="search"
                            value={filters[column.key]}
                            onChange={(event) => updateFilter(column.key, event.target.value)}
                            placeholder={`Filter ${column.label}`}
                            aria-label={`Filter by ${column.label}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {isLoading ? (
                    <div className="records-grid__row records-grid__row--state" role="row">
                      <div className="records-grid__cell grid-state" role="gridcell" aria-colspan={3}>
                        <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                        <span>Loading users...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="records-grid__row records-grid__row--state" role="row">
                      <div className="records-grid__cell" role="gridcell" aria-colspan={3}>
                        <Alert variant="danger" className="grid-alert mb-0">
                          Unable to load users: {error}
                        </Alert>
                      </div>
                    </div>
                  ) : visibleRows.length > 0 ? (
                    visibleRows.map((row) => (
                      <div className="records-grid__row" role="row" key={row.id}>
                        <div className="records-grid__cell" role="gridcell">{row.name}</div>
                        <div className="records-grid__cell" role="gridcell">{row.id}</div>
                        <div className="records-grid__cell" role="gridcell">
                          <span className={`status-badge status-badge--${row.status.toLowerCase()}`}>
                            {row.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="records-grid__row records-grid__row--state" role="row">
                      <div className="records-grid__cell empty-state" role="gridcell" aria-colspan={3}>
                        {rows.length > 0 ? 'No records match the current filters.' : 'No records yet.'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isLoading && !error && (
                <div className="grid-footer">
                  <span className="grid-result-count" aria-live="polite">
                    Showing {filteredRows.length === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1}
                    {'-'}
                    {Math.min(activePage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} records
                  </span>
                  <nav className="grid-pagination" aria-label="Records pagination">
                    <button
                      type="button"
                      className="pagination-button pagination-button--arrow"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={activePage === 1}
                      aria-label="Previous page"
                    >
                      {'<'}
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        type="button"
                        className={`pagination-button${page === activePage ? ' pagination-button--active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        key={page}
                        aria-current={page === activePage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="pagination-button pagination-button--arrow"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={activePage === totalPages}
                      aria-label="Next page"
                    >
                      {'>'}
                    </button>
                  </nav>
                </div>
              )}
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
