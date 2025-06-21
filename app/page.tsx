import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Shield, Users, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">VisaFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
              <Link href="/notifications-demo">
                <Button variant="outline">Notifications Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Streamline Your Visa Application Process</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Complete visa applications online, track your progress in real-time, and get expert support throughout your
            journey.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Your Application
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">Why Choose VisaFlow?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your personal information and documents are protected with bank-level security.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your application status and receive instant updates via email and SMS.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get guidance from our experienced team throughout your application process.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">Simple 4-Step Process</h3>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Register", desc: "Create your account with email and mobile" },
              { step: 2, title: "Choose Country", desc: "Select your destination and view requirements" },
              { step: 3, title: "Fill Application", desc: "Complete the form and upload documents" },
              { step: 4, title: "Track Progress", desc: "Monitor status and receive updates" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold mb-2 dark:text-gray-200">{item.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-6 w-6" />
                <span className="text-lg font-bold">VisaFlow</span>
              </div>
              <p className="text-gray-400">Your trusted partner for visa applications worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tourist Visa</li>
                <li>Business Visa</li>
                <li>Student Visa</li>
                <li>Work Visa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Track Application</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@visaflow.com</li>
                <li>+1 (555) 123-4567</li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VisaFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
