import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Award, TrendingUp, Users, Target } from "lucide-react";
import themePreviewImg from "@/assets/theme-preview.png";

export default function ThemePreview() {
  const [count, setCount] = useState(86);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-white mb-2">Energy Burst Theme</h1>
          <p className="text-gray-400">Dark fitness theme preview</p>
        </div>

        {/* Generated Preview Image */}
        <Card className="bg-[#252525] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generated Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={themePreviewImg} 
              alt="Energy Burst Theme Preview"
              className="w-full rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Interactive Demo */}
        <Card className="bg-[#252525] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FF6B4A]" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{count}</div>
              <p className="text-gray-400">Pushups completed</p>
            </div>
            
            <Progress 
              value={75} 
              className="h-3 bg-gray-700"
              style={{
                background: 'linear-gradient(90deg, #FF6B4A, #FFA94D)'
              }}
            />
            
            <div className="flex justify-between items-center">
              <Badge className="bg-[#00D9FF] text-black">
                <Star className="h-3 w-3 mr-1" />
                Streak: 7 days
              </Badge>
              <Badge className="bg-[#FF6B4A] text-white">
                <Award className="h-3 w-3 mr-1" />
                New Record!
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#252525] border-gray-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-[#FF6B4A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">573</div>
              <p className="text-gray-400 text-sm">Total Reps</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#252525] border-gray-700">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-[#00D9FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-gray-400 text-sm">Group Rank</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-[#FF6B4A] hover:bg-[#e55a3f] text-white font-medium"
            onClick={() => setCount(count + 1)}
          >
            Log Pushups (+1)
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF] hover:text-black"
          >
            View Groups
          </Button>
        </div>

        {/* Color Palette */}
        <Card className="bg-[#252525] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-gray-600"></div>
              <span className="text-gray-300">Background: #1a1a1a</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF6B4A]"></div>
              <span className="text-gray-300">Primary: #FF6B4A (Coral Orange)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00D9FF]"></div>
              <span className="text-gray-300">Accent: #00D9FF (Electric Cyan)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#252525] border border-gray-600"></div>
              <span className="text-gray-300">Cards: #252525 (Dark Gray)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}