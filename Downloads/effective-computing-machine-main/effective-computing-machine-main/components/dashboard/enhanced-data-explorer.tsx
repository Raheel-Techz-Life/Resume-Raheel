"use client"

import { useState, useEffect } from "react"
import DashboardNav from "@/components/dashboard/nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as api from "@/lib/api"

interface EnrollmentRow {
  date: string
  state: string
  district: string
  pincode?: string
  age_0_5: number
  age_5_17: number
  age_18_greater: number
}

export default function EnhancedDataExplorer() {
  const [rows, setRows] = useState<EnrollmentRow[]>([])
  const [filteredRows, setFilteredRows] = useState<EnrollmentRow[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [sortField, setSortField] = useState<keyof EnrollmentRow | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [availableStates, setAvailableStates] = useState<string[]>([])

  useEffect(() => {
    fetchData()
  }, [page, limit])

  useEffect(() => {
    // Filter and sort data
    let filtered = [...rows]
    
    // Apply state filter
    if (selectedState) {
      filtered = filtered.filter(row => row.state === selectedState)
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.date?.includes(searchTerm)
      )
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }
        
        return 0
      })
    }
    
    setFilteredRows(filtered)
    
    // Extract unique states
    const states = Array.from(new Set(rows.map(r => r.state).filter(Boolean))).sort()
    setAvailableStates(states)
  }, [rows, searchTerm, selectedState, sortField, sortDirection])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.getExplorerEnrollment({ page, limit }) as any
      const data = res?.rows || []
      setRows(data)
      setTotal(res?.total || data.length)
    } catch (err) {
      console.error("Data explorer fetch error", err)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: keyof EnrollmentRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof EnrollmentRow) => {
    if (sortField !== field) return "↕️"
    return sortDirection === 'asc' ? "↑" : "↓"
  }

  const totalEnrollments = filteredRows.reduce((sum, row) => 
    sum + (row.age_0_5 || 0) + (row.age_5_17 || 0) + (row.age_18_greater || 0), 0
  )

  const uniqueStates = new Set(filteredRows.map(r => r.state)).size
  const uniqueDistricts = new Set(filteredRows.map(r => r.district)).size

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🔍 Data Explorer & Table View
            </h1>
            <p className="text-muted-foreground">
              Browse, filter, and analyze enrollment records with advanced table features
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{filteredRows.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchTerm ? `Filtered from ${rows.length}` : 'All records'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totalEnrollments < 1000 ? '<1K' : `${(totalEnrollments / 1000).toFixed(0)}K`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all ages</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  States Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueStates}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique states</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Districts Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{uniqueDistricts}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique districts</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">📋 Data Table</TabsTrigger>
              <TabsTrigger value="info">ℹ️ About Data</TabsTrigger>
            </TabsList>

            {/* Table View */}
            <TabsContent value="table" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Enrollment Records Table</CardTitle>
                      <CardDescription>
                        Sortable and filterable enrollment data by date, location, and age groups
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{filteredRows.length} rows</Badge>
                  </div>
                  
                  {/* Search and Controls */}
                  <div className="flex gap-4 items-center mt-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Search by state, district, or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <select 
                      value={selectedState} 
                      onChange={(e) => {
                        setSelectedState(e.target.value)
                        setPage(1)
                      }}
                      className="px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">All States ({availableStates.length})</option>
                      {availableStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedState("")
                        setSortField(null)
                        setPage(1)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin text-4xl mb-4">⏳</div>
                        <p className="text-muted-foreground">Loading enrollment data...</p>
                      </div>
                    </div>
                  ) : filteredRows.length > 0 ? (
                    <>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th 
                                className="text-left p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('date')}
                              >
                                <div className="flex items-center gap-2">
                                  Date {getSortIcon('date')}
                                </div>
                              </th>
                              <th 
                                className="text-left p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('state')}
                              >
                                <div className="flex items-center gap-2">
                                  State {getSortIcon('state')}
                                </div>
                              </th>
                              <th 
                                className="text-left p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('district')}
                              >
                                <div className="flex items-center gap-2">
                                  District {getSortIcon('district')}
                                </div>
                              </th>
                              <th className="text-right p-3">Pincode</th>
                              <th 
                                className="text-right p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('age_0_5')}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  Age 0-5 {getSortIcon('age_0_5')}
                                </div>
                              </th>
                              <th 
                                className="text-right p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('age_5_17')}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  Age 5-17 {getSortIcon('age_5_17')}
                                </div>
                              </th>
                              <th 
                                className="text-right p-3 cursor-pointer hover:bg-muted/80 transition-colors"
                                onClick={() => handleSort('age_18_greater')}
                              >
                                <div className="flex items-center justify-end gap-2">
                                  Age 18+ {getSortIcon('age_18_greater')}
                                </div>
                              </th>
                              <th className="text-right p-3">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.slice((page - 1) * limit, page * limit).map((row, i) => {
                              const rowTotal = (row.age_0_5 || 0) + (row.age_5_17 || 0) + (row.age_18_greater || 0)
                              return (
                                <tr 
                                  key={i} 
                                  className="border-t hover:bg-muted/50 transition-colors"
                                >
                                  <td className="p-3">{row.date || '-'}</td>
                                  <td className="p-3 font-medium">{row.state || '-'}</td>
                                  <td className="p-3">{row.district || '-'}</td>
                                  <td className="text-right p-3 text-muted-foreground">
                                    {row.pincode || '-'}
                                  </td>
                                  <td className="text-right p-3">{row.age_0_5 || 0}</td>
                                  <td className="text-right p-3">{row.age_5_17 || 0}</td>
                                  <td className="text-right p-3">{row.age_18_greater || 0}</td>
                                  <td className="text-right p-3 font-semibold">{rowTotal}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4 px-2">
                        <div className="text-sm text-muted-foreground">
                          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredRows.length)} of {filteredRows.length} records
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            ← Previous
                          </Button>
                          <span className="text-sm px-3">
                            Page {page} of {Math.ceil(filteredRows.length / limit)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= filteredRows.length}
                          >
                            Next →
                          </Button>
                          <select 
                            value={limit} 
                            onChange={(e) => {
                              setLimit(Number(e.target.value))
                              setPage(1)
                            }}
                            className="ml-2 px-2 py-1 border rounded text-sm"
                          >
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-96 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-lg font-medium">No data found</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {searchTerm ? 'Try adjusting your search filters' : 'No enrollment records available'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    About This Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Data Source</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This table displays aggregated Aadhaar enrollment records sourced from CSV datasets 
                      containing enrollment information across multiple states and time periods. Data has been 
                      cleaned, deduplicated, and aggregated for analysis.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Column Descriptions</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <strong className="text-sm">Date:</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enrollment date or aggregation period. Format: YYYY-MM-DD
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <strong className="text-sm">State & District:</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Geographic location of enrollment. Used for regional analysis and resource planning.
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <strong className="text-sm">Age Groups (0-5, 5-17, 18+):</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enrollment counts split by age cohorts. Enables demographic analysis and 
                          age-specific policy planning. Children (0-17) require different services than adults.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="font-semibold text-sm mb-1">🔍 Search & Filter</div>
                        <p className="text-xs text-muted-foreground">
                          Search by state, district, or date. Results update in real-time.
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="font-semibold text-sm mb-1">↕️ Sorting</div>
                        <p className="text-xs text-muted-foreground">
                          Click any column header to sort ascending/descending.
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="font-semibold text-sm mb-1">📄 Pagination</div>
                        <p className="text-xs text-muted-foreground">
                          Navigate through large datasets. Adjust rows per page (25/50/100).
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="font-semibold text-sm mb-1">📊 Tally Verification</div>
                        <p className="text-xs text-muted-foreground">
                          Summary cards show totals matching visible data for verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <span>🎯</span>
                      Why Table View?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Table format provides granular, row-level access to enrollment data - essential for:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>Data Verification:</strong> Auditors can validate enrollment counts and identify discrepancies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>Detailed Analysis:</strong> Researchers can export and analyze specific subsets of data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>Pattern Detection:</strong> Sorting and filtering helps identify unusual patterns or outliers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><strong>Transparency:</strong> Stakeholders can inspect actual data behind aggregated visualizations</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
