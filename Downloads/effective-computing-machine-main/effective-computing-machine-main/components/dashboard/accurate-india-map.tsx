"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface StateData {
  name: string
  code: string
  enrollments: number
  population: number
  coverage: number
}

interface IndiaMapProps {
  onStateClick?: (stateCode: string, stateName: string) => void
  stateData?: Record<string, StateData>
}

export default function AccurateIndiaMap({ onStateClick, stateData }: IndiaMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // State codes mapped to their full names and enrollment data
  const stateNames: Record<string, string> = {
    'IN-AN': 'Andaman and Nicobar',
    'IN-AP': 'Andhra Pradesh',
    'IN-AR': 'Arunachal Pradesh',
    'IN-AS': 'Assam',
    'IN-BR': 'Bihar',
    'IN-CH': 'Chandigarh',
    'IN-CT': 'Chhattisgarh',
    'IN-DN': 'Dadra and Nagar Haveli',
    'IN-DD': 'Daman and Diu',
    'IN-DL': 'Delhi',
    'IN-GA': 'Goa',
    'IN-GJ': 'Gujarat',
    'IN-HR': 'Haryana',
    'IN-HP': 'Himachal Pradesh',
    'IN-JK': 'Jammu and Kashmir',
    'IN-JH': 'Jharkhand',
    'IN-KA': 'Karnataka',
    'IN-KL': 'Kerala',
    'IN-LD': 'Lakshadweep',
    'IN-MP': 'Madhya Pradesh',
    'IN-MH': 'Maharashtra',
    'IN-MN': 'Manipur',
    'IN-ML': 'Meghalaya',
    'IN-MZ': 'Mizoram',
    'IN-NL': 'Nagaland',
    'IN-OR': 'Odisha',
    'IN-PY': 'Puducherry',
    'IN-PB': 'Punjab',
    'IN-RJ': 'Rajasthan',
    'IN-SK': 'Sikkim',
    'IN-TN': 'Tamil Nadu',
    'IN-TG': 'Telangana',
    'IN-TR': 'Tripura',
    'IN-UT': 'Uttarakhand',
    'IN-UP': 'Uttar Pradesh',
    'IN-WB': 'West Bengal'
  }

  // State center coordinates for markers
  const stateCoordinates: Record<string, { lat: number; lon: number }> = {
    'IN-JK': { lat: 33.7782, lon: 76.5762 },
    'IN-HP': { lat: 31.1048, lon: 77.1734 },
    'IN-PB': { lat: 31.1471, lon: 75.3412 },
    'IN-HR': { lat: 29.0588, lon: 76.0856 },
    'IN-DL': { lat: 28.7041, lon: 77.1025 },
    'IN-UT': { lat: 30.0668, lon: 79.0193 },
    'IN-RJ': { lat: 27.0238, lon: 74.2179 },
    'IN-UP': { lat: 26.8467, lon: 80.9462 },
    'IN-BR': { lat: 25.0961, lon: 85.3131 },
    'IN-SK': { lat: 27.5330, lon: 88.5122 },
    'IN-AR': { lat: 28.2180, lon: 94.7278 },
    'IN-NL': { lat: 26.1584, lon: 94.5624 },
    'IN-MN': { lat: 24.6637, lon: 93.9063 },
    'IN-MZ': { lat: 23.1645, lon: 92.9376 },
    'IN-TR': { lat: 23.9408, lon: 91.9882 },
    'IN-ML': { lat: 25.4670, lon: 91.3662 },
    'IN-AS': { lat: 26.2006, lon: 92.9376 },
    'IN-WB': { lat: 22.9868, lon: 87.8550 },
    'IN-JH': { lat: 23.6102, lon: 85.2799 },
    'IN-OR': { lat: 20.9517, lon: 85.0985 },
    'IN-CT': { lat: 21.2787, lon: 81.8661 },
    'IN-MP': { lat: 22.9734, lon: 78.6569 },
    'IN-GJ': { lat: 22.2587, lon: 71.1924 },
    'IN-MH': { lat: 19.7515, lon: 75.7139 },
    'IN-TG': { lat: 18.1124, lon: 79.0193 },
    'IN-AP': { lat: 15.9129, lon: 79.7400 },
    'IN-KA': { lat: 15.3173, lon: 75.7139 },
    'IN-GA': { lat: 15.2993, lon: 74.1240 },
    'IN-KL': { lat: 10.8505, lon: 76.2711 },
    'IN-TN': { lat: 11.1271, lon: 78.6569 },
    'IN-CH': { lat: 30.7333, lon: 76.7794 },
    'IN-PY': { lat: 11.9416, lon: 79.8083 },
    'IN-AN': { lat: 11.7401, lon: 92.6586 },
    'IN-LD': { lat: 10.5667, lon: 72.6417 },
    'IN-DN': { lat: 20.1809, lon: 73.0169 },
    'IN-DD': { lat: 20.4283, lon: 72.8397 }
  }

  // Map state codes from stateData to Plotly format
  const getEnrollmentData = () => {
    const locations: string[] = []
    const z: number[] = []
    const text: string[] = []
    const customdata: any[] = []
    
    // For markers
    const markerLat: number[] = []
    const markerLon: number[] = []
    const markerText: string[] = []
    const markerSize: number[] = []
    const markerColor: string[] = []
    const markerCustomdata: any[] = []

    Object.entries(stateNames).forEach(([code, name]) => {
      // Find matching state data (case-insensitive match)
      const matchingState = stateData ? Object.values(stateData).find(
        state => state.name.toLowerCase() === name.toLowerCase() || 
                 state.name.toLowerCase().includes(name.toLowerCase()) ||
                 name.toLowerCase().includes(state.name.toLowerCase())
      ) : null

      locations.push(code)
      
      if (matchingState) {
        z.push(matchingState.enrollments)
        text.push(`${name}<br>Enrollments: ${matchingState.enrollments.toLocaleString()}<br>Coverage: ${matchingState.coverage.toFixed(1)}%`)
        customdata.push({ code: matchingState.code, name: matchingState.name })
        
        // Add marker data
        const coords = stateCoordinates[code]
        if (coords) {
          markerLat.push(coords.lat)
          markerLon.push(coords.lon)
          markerText.push(`${name}<br>${matchingState.enrollments.toLocaleString()} enrollments<br>${matchingState.coverage.toFixed(1)}% coverage`)
          markerSize.push(Math.max(8, Math.min(20, matchingState.enrollments / 50000)))
          
          // Color based on coverage
          if (matchingState.coverage >= 90) markerColor.push('#10b981')
          else if (matchingState.coverage >= 70) markerColor.push('#f59e0b')
          else markerColor.push('#ef4444')
          
          markerCustomdata.push({ code: matchingState.code, name: matchingState.name })
        }
      } else {
        z.push(0)
        text.push(`${name}<br>No data available`)
        customdata.push({ code: '', name })
      }
    })

    return { locations, z, text, customdata, markerLat, markerLon, markerText, markerSize, markerColor, markerCustomdata }
  }

  const data = getEnrollmentData()

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            India - State-wise Enrollment Map
          </CardTitle>
          <CardDescription>
            Loading interactive India map...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[600px] flex items-center justify-center bg-muted rounded-lg">
            <div className="text-muted-foreground">Loading map...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-3d">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🗺️</span>
          India - State-wise Enrollment Map
        </CardTitle>
        <CardDescription>
          Interactive India map showing enrollment distribution across states. Hover over states for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 rounded-xl p-4 shadow-inner">
          <Plot
            data={[
              {
                type: 'choropleth' as any,
                locationmode: 'geojson-id' as any,
                locations: data.locations,
                z: data.z,
                geojson: 'https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson' as any,
                featureidkey: 'properties.ST_NM' as any,
                text: data.text,
                hoverinfo: 'text' as any,
                customdata: data.customdata,
                colorscale: [
                  [0, '#fecaca'],
                  [0.2, '#fed7aa'],
                  [0.4, '#fef08a'],
                  [0.6, '#d9f99d'],
                  [0.8, '#86efac'],
                  [1, '#34d399']
                ] as any,
                colorbar: {
                  title: { text: 'Enrollments', font: { size: 14 } },
                  thickness: 20,
                  len: 0.75,
                  x: 1.02,
                  tickfont: { size: 11 },
                  outlinewidth: 0
                } as any,
                marker: {
                  line: {
                    color: '#0f172a',
                    width: 2.5
                  }
                } as any,
                showscale: true,
                geo: 'geo' as any,
                hovertemplate: '<b>%{text}</b><extra></extra>' as any
              } as any,
              {
                type: 'scattergeo' as any,
                lat: data.markerLat,
                lon: data.markerLon,
                text: data.markerText,
                hoverinfo: 'text' as any,
                customdata: data.markerCustomdata,
                mode: 'markers' as any,
                marker: {
                  size: data.markerSize,
                  color: data.markerColor,
                  line: {
                    color: '#ffffff',
                    width: 2.5
                  },
                  opacity: 1,
                  symbol: 'circle' as any
                } as any,
                showlegend: false,
                geo: 'geo' as any,
                hovertemplate: '<b>%{text}</b><extra></extra>' as any
              } as any
            ]}
            layout={{
              geo: {
                scope: 'asia',
                projection: { 
                  type: 'mercator'
                },
                center: { lon: 78.9629, lat: 22.0 },
                lonaxis: { range: [67.5, 97.5] },
                lataxis: { range: [6.5, 36.5] },
                showland: true,
                landcolor: '#e2e8f0',
                showocean: true,
                oceancolor: '#bfdbfe',
                showcountries: true,
                countrycolor: '#dc2626',
                countrywidth: 3,
                showcoastlines: true,
                coastlinecolor: '#1e40af',
                coastlinewidth: 2,
                showframe: true,
                framecolor: '#334155',
                framewidth: 2,
                resolution: 50,
                bgcolor: 'rgba(255,255,255,0)'
              },
              height: 750,
              margin: { t: 10, b: 10, l: 10, r: 80 },
              paper_bgcolor: 'rgba(255,255,255,0)',
              plot_bgcolor: 'rgba(255,255,255,0)',
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12,
                color: '#334155'
              },
              hoverlabel: {
                bgcolor: '#1e293b',
                font: { color: '#ffffff', size: 14, family: 'Inter, sans-serif' },
                bordercolor: '#94abe8',
                align: 'left'
              },
              dragmode: 'pan'
            }}
            config={{
              displayModeBar: true,
              displaylogo: false,
              scrollZoom: true,
              modeBarButtonsToRemove: ['select2d', 'lasso2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'india_enrollment_map',
                height: 1000,
                width: 1200,
                scale: 2
              }
            }}
            style={{ width: '100%', height: '700px' }}
            onClick={(event: any) => {
              if (event.points && event.points.length > 0) {
                const point = event.points[0]
                const { code, name } = point.customdata
                if (code && onStateClick) {
                  onStateClick(code, name)
                }
              }
            }}
          />
        </div>
        
        <div className="mt-6 flex flex-wrap gap-6 justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-600 mb-3">📊 Enrollment Levels</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: '#34d399' }}></div>
                <span className="text-sm">High (&gt;400K)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: '#86efac' }}></div>
                <span className="text-sm">Medium-High (200K-400K)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: '#fef08a' }}></div>
                <span className="text-sm">Medium (100K-200K)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: '#fed7aa' }}></div>
                <span className="text-sm">Low (50K-100K)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: '#fecaca' }}></div>
                <span className="text-sm">Very Low (&lt;50K)</span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-600 mb-3">🎯 Marker Coverage</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-sm">90%+ Coverage</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: '#f59e0b' }}></div>
                <span className="text-sm">70-89% Coverage</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm">&lt;70% Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
