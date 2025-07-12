import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Code, Database, Palette, Zap, Shield, Smartphone } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Modern Stack",
      description: "Built with MongoDB, Express, React, and Node.js"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Beautiful UI",
      description: "Styled with Tailwind CSS and shadcn/ui components"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Fast Development",
      description: "Hot reload and modern development tools"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Database Ready",
      description: "MongoDB integration with Mongoose ODM"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure",
      description: "JWT authentication and security best practices"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Responsive",
      description: "Mobile-first design with Tailwind CSS"
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Modern MERN Stack
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A complete full-stack application built with MongoDB, Express, React, and Node.js, 
            featuring Tailwind CSS and shadcn/ui for beautiful, responsive design.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Button asChild size="lg">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/posts">View Posts</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything You Need
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This MERN stack application comes with all the modern tools and features 
            you need to build scalable web applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-primary mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 rounded-lg p-8 text-center space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Ready to Start Building?
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Join our community and start building amazing applications with the MERN stack.
        </p>
        {!isAuthenticated && (
          <Button asChild size="lg">
            <Link to="/register">Create Account</Link>
          </Button>
        )}
      </section>
    </div>
  )
}

export default Home
