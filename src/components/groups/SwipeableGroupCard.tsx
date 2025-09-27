import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, User, Copy, Trash2 } from "lucide-react";
import { Group } from "@/hooks/useGroups";
import InviteButton from "./InviteButton";

interface SwipeableGroupCardProps {
  group: Group;
  onSelect: (group: Group) => void;
  onLeave: (groupId: string) => void;
  onCopyInvite: (inviteCode: string) => void;
}

const SwipeableGroupCard = ({ group, onSelect, onLeave, onCopyInvite }: SwipeableGroupCardProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const maxSwipe = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      const offset = Math.min(diff, maxSwipe);
      setSwipeOffset(offset);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    setIsSwipeActive(false);
    
    // Snap to position based on swipe distance
    if (swipeOffset > maxSwipe / 2) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    currentX.current = e.clientX;
    const diff = startX.current - currentX.current;
    
    if (diff > 0) {
      const offset = Math.min(diff, maxSwipe);
      setSwipeOffset(offset);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setIsSwipeActive(false);
    
    if (swipeOffset > maxSwipe / 2) {
      setSwipeOffset(maxSwipe);
    } else {
      setSwipeOffset(0);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging.current) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging.current]);

  const handleCardClick = () => {
    if (swipeOffset === 0) {
      onSelect(group);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleLeaveGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLeave(group.id);
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background action buttons */}
      <div 
        className={`absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-destructive transition-opacity duration-200 ${
          swipeOffset > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${maxSwipe}px` }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLeaveGroup}
          className="text-destructive-foreground hover:bg-destructive/90"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Main card */}
      <Card 
        ref={cardRef}
        className={`cursor-pointer transition-all border-0 bg-gradient-card shadow-medium ${
          isSwipeActive ? 'transition-none' : 'transition-transform duration-200 hover:shadow-lg'
        }`}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
        }}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <Badge variant={group.role === 'admin' ? 'default' : 'secondary'}>
              {group.role === 'admin' ? (
                <><Crown className="h-3 w-3 mr-1" /> Admin</>
              ) : (
                <><User className="h-3 w-3 mr-1" /> Member</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {group.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {group.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Challenges: {group.challenges?.length || 0}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyInvite(group.invite_code);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <div onClick={(e) => e.stopPropagation()}>
                <InviteButton 
                  groupName={group.name}
                  inviteCode={group.invite_code}
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            💡 Swipe left to leave group
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwipeableGroupCard;