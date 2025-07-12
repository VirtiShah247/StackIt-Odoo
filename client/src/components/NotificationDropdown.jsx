import React, { useRef, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Bell, BellOff, CheckCheck, MessageCircle, ThumbsUp, AtSign } from 'lucide-react'

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'answer':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />
      case 'vote':
        return <ThumbsUp className="h-4 w-4 text-yellow-500" />
      case 'mention':
        return <AtSign className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    // Navigate to the relevant page based on notification type
    // This would be implemented based on your routing structure
  }

  return (
    <Card 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto shadow-lg z-50"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BellOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  notification.read 
                    ? 'bg-gray-50 hover:bg-gray-100' 
                    : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {notifications.length > 10 && (
              <div className="text-center pt-3 border-t">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationDropdown
