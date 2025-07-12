import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
// import RichTextEditor from '../components/RichTextEditor'
import TagInput from '../components/TagInput'
import axios from 'axios'
import { MessageSquare, Save, X } from 'lucide-react'

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Common programming tags suggestions
  const tagSuggestions = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'MongoDB', 'MySQL', 'PostgreSQL', 'Express', 'Vue.js', 'Angular', 'TypeScript',
    'PHP', 'Laravel', 'Django', 'Flask', 'Spring Boot', 'Docker', 'AWS', 'Git',
    'REST API', 'GraphQL', 'Redux', 'Next.js', 'Tailwind CSS', 'Bootstrap',
    'Authentication', 'JWT', 'OAuth', 'Deployment', 'Testing', 'Jest', 'Cypress',
    'Webpack', 'Babel', 'ESLint', 'Prettier', 'SCSS', 'Sass', 'JSON', 'XML',
    'Regex', 'Algorithm', 'Data Structure', 'Performance', 'Security', 'Database'
  ]

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      setLoading(false)
      return
    }

    if (!formData.description.trim() || formData.description === '<p></p>') {
      setError('Description is required')
      setLoading(false)
      return
    }

    if (formData.tags.length === 0) {
      setError('At least one tag is required')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/questions', {
        title: formData.title,
        description: formData.description,
        tags: formData.tags
      })

      navigate(`/questions/${response.data.question._id}`)
    } catch (error) {
      console.error('Error creating question:', error)
      setError(error.response?.data?.message || 'Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/questions')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Ask a Question</CardTitle>
              <CardDescription>
                Get help from the community by asking a clear, detailed question
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Question Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., How to implement user authentication in React?"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-sm text-gray-600">
                Be specific and imagine you're asking a question to another person
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              {/* <RichTextEditor
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Describe your problem in detail. Include what you've tried and what you're expecting..."
                minHeight="300px"
              /> */}
              <p className="text-sm text-gray-600">
                Include all the information someone would need to answer your question
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags <span className="text-red-500">*</span>
              </Label>
              <TagInput
                value={formData.tags}
                onChange={(tags) => handleInputChange('tags', tags)}
                placeholder="Add relevant tags (e.g., react, javascript, nodejs)"
                suggestions={tagSuggestions}
                maxTags={5}
              />
              <p className="text-sm text-gray-600">
                Add up to 5 tags to describe what your question is about
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Publishing...' : 'Publish Question'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Writing a good question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <p>
                <strong>Summarize the problem</strong> - Include details about your goal, describe expected and actual results. Include any error messages.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <p>
                <strong>Show some code</strong> - When appropriate, share the minimum amount of code others need to reproduce your problem.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <p>
                <strong>Tag appropriately</strong> - Add relevant tags so the right people can find and answer your question.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AskQuestion
