import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { Search, Plus, MessageSquare, ThumbsUp, CheckCircle, User, Clock, Tag } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const { isAuthenticated } = useAuth()
//   const navigate = useNavigate()

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') })
      })

      const response = await axios.get(`/api/questions?${params}`)
      setQuestions(response.data.questions)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedTags, sortBy, pagination.page, pagination.limit])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchQuestions()
  }

  const handleTagClick = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeSelectedTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const getSortOptions = () => [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'votes', label: 'Most Voted' },
    { value: 'answers', label: 'Most Answers' },
    { value: 'unanswered', label: 'Unanswered' }
  ]

  const QuestionCard = ({ question }) => {
    const hasAcceptedAnswer = question.answers?.some(answer => answer.isAccepted)
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Question Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{question.votes || 0} votes</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{question.answers?.length || 0} answers</span>
                  {hasAcceptedAnswer && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Question Title */}
              <Link
                to={`/questions/${question._id}`}
                className="block group"
              >
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {question.title}
                </h3>
              </Link>

              {/* Question Preview */}
              <div 
                className="mt-2 text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: question.description?.substring(0, 200) + '...' 
                }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {question.tags?.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-2 ml-4 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{question.author?.name || 'Anonymous'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600 mt-1">
            Find answers to your questions or help others by answering theirs
          </p>
        </div>
        
        {isAuthenticated && (
          <Button asChild className="flex items-center space-x-2">
            <Link to="/ask">
              <Plus className="h-4 w-4" />
              <span>Ask Question</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {getSortOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Filtered by:
              </span>
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => removeSelectedTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading questions...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedTags.length > 0
                  ? 'Try adjusting your search terms or filters.'
                  : 'Be the first to ask a question!'}
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link to="/ask">Ask the first question</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {questions.map(question => (
              <QuestionCard key={question._id} question={question} />
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                
                <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Questions
