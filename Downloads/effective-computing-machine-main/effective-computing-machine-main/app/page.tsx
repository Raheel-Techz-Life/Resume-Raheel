import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Database, Globe, Shield, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-muted border rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-xs sm:text-sm">Trusted Aadhaar Intelligence</span>
            </div>
            
            {/* Styled Vidyut Brand Name */}
            <div className="mb-6 overflow-hidden">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-2 text-primary tracking-wider" style={{ textShadow: '2px 2px 4px rgba(148, 171, 232, 0.3), 0 0 10px rgba(148, 171, 232, 0.2)' }}>
                VIDYUT
              </h1>
              <div className="h-1 w-24 sm:w-32 mx-auto bg-primary rounded-full shadow-lg"></div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Transform Aadhaar Data Into
              <br />
              <span className="text-primary">Actionable Insights</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Advanced analytics platform for enrollment patterns, mobility analysis, and policy recommendations powered by 6 million+ records.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
              <Button size="lg" className="px-6 sm:px-8 py-3 text-base font-semibold shadow-3d hover:shadow-3d-hover" asChild>
                <Link href="/overview">
                  Explore Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 text-base shadow-3d hover:shadow-3d-hover" asChild>
                <Link href="/data-explorer">
                  View Data
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">6M+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Total Enrollments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">30</div>
              <div className="text-sm sm:text-base text-muted-foreground">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">96.8%</div>
              <div className="text-sm sm:text-base text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">6</div>
              <div className="text-sm sm:text-base text-muted-foreground">Analytics Frameworks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Comprehensive Aadhaar Intelligence Platform
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
              Powered by advanced analytics and machine learning, Vidyut provides real-time insights into enrollment patterns, mobility trends, and demographic distributions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="hover:shadow-3d-lg transition-all duration-300 border-l-4 border-l-primary shadow-3d-sm">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Track enrollment trends, detect anomalies, and monitor state-wise distributions with live dashboards and interactive visualizations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-3d-lg transition-all duration-300 border-l-4 border-l-primary shadow-3d-sm">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Mobility Insights</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Advanced mobility framework tracking interstate migration, seasonal patterns, and risk scoring with 96.8% predictive accuracy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-3d-lg transition-all duration-300 border-l-4 border-l-primary shadow-3d-sm">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">CSV Database</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Lightning-fast queries on 6M+ records across 12 CSV files with advanced filtering, sorting, and data exploration capabilities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-3d-lg transition-all duration-300 border-l-4 border-l-primary shadow-3d-sm">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  AI-powered anomaly detection identifying unusual patterns, duplicate records, and data quality issues across all states.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-3d-lg transition-all duration-300 border-l-4 border-l-primary shadow-3d-sm">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Demographic Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Comprehensive demographic breakdowns by age, gender, urban/rural distribution with interactive charts and deep-dive analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-3d-lg transition-all duration-300 border-l-4 border-l-primary shadow-3d-sm">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Policy Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base">
                  Data-driven policy insights and recommendations based on enrollment trends, coverage gaps, and regional disparities.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Frameworks Section */}
      <section className="py-16 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-4">6 Analytical Frameworks</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Multi-Framework Analysis Approach
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
              Our platform integrates six specialized frameworks for comprehensive Aadhaar data intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "ADIF", desc: "Aadhaar Data Intelligence Framework", icon: "🔍" },
              { name: "IRF", desc: "Identity Resolution Framework", icon: "🆔" },
              { name: "AFIF", desc: "Aadhaar Fraud Intelligence Framework", icon: "🛡️" },
              { name: "PROF", desc: "Policy Recommendation & Optimization Framework", icon: "📋" },
              { name: "AMF", desc: "Aadhaar Mobility Framework", icon: "🚗" },
              { name: "PPAF", desc: "Privacy-Preserving Analytics Framework", icon: "🔒" },
            ].map((fw) => (
              <Card key={fw.name} className="p-4 hover:shadow-3d transition-all duration-300 shadow-3d-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{fw.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{fw.name}</h3>
                    <p className="text-sm text-muted-foreground">{fw.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">
              Ready to Explore the Data?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-12">
              Access comprehensive Aadhaar analytics with our intuitive dashboard and powerful data explorer.
            </p>
            <Button size="lg" className="px-8 py-6 text-lg shadow-3d hover:shadow-3d-hover" asChild>
              <Link href="/overview">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
