import { useState } from "react";
import { Bell, X, Users, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GroupNotification } from "@/hooks/useNotifications";

interface NotificationPanelProps {
  notifications: GroupNotification[];
  onClear: () => void;
  onRemove: (id: string) => void;
}

const NotificationPanel = ({ notifications, onClear, onRemove }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'member_joined':
        return <Users className="h-4 w-4 text-primary" />;
      case 'pushups_logged':
        return <Target className="h-4 w-4 text-accent" />;
      case 'goal_completed':
        return <Star className="h-4 w-4 text-star fill-star" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-80 border-0 bg-card shadow-large">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-0">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                        index === 0 ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(notification.id)}
                                className="p-0 h-auto text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              {notification.type === 'goal_completed' && (
                                <Badge variant="secondary" className="text-xs">
                                  Goal Complete
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Backdrop to close panel */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationPanel;