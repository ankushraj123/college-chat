import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { ConfessionForm } from "@/components/confession-form";
import { ConfessionCard } from "@/components/confession-card";
import { ChatRoom } from "@/components/chat-room";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useConfessions } from "@/hooks/use-confessions";
import { useDailyLimit } from "@/hooks/use-daily-limit";
import { useQuery } from "@tanstack/react-query";

export default function ChatPage() {
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data: dailyLimit } = useDailyLimit();
  const { data: confessions = [], isLoading } = useConfessions(selectedCollege);
  
  const { data: colleges = [] } = useQuery({
    queryKey: ["/api/colleges"],
    queryFn: async () => {
      const response = await fetch("/api/colleges");
      if (!response.ok) throw new Error("Failed to fetch colleges");
      return response.json();
    },
  });

  // Filter and sort confessions
  const filteredConfessions = confessions
    .filter(confession => {
      const matchesSearch = confession.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || confession.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "popular") {
        return b.likes - a.likes;
      }
      return 0;
    });

  const categories = ["all", "crush", "funny", "secrets", "rants", "advice", "academic"];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-comment text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-400">SecretChatBox</h1>
              <p className="text-sm text-gray-400">Anonymous campus confessions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <i className="fas fa-bell"></i>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <i className="fas fa-palette"></i>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* College Selection */}
        {!selectedCollege && (
          <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700" data-testid="card-college-selection">
            <div className="text-center mb-6">
              <i className="fas fa-university text-4xl text-purple-400 mb-4"></i>
              <h2 className="text-2xl font-bold text-white mb-2">Select Your College</h2>
              <p className="text-gray-400">Join your campus community</p>
            </div>
            <Select onValueChange={setSelectedCollege} data-testid="select-college">
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose your college..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {colleges.map((college: any) => (
                  <SelectItem key={college.id} value={college.code} className="text-white hover:bg-gray-600">
                    {college.name} ({college.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedCollege && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Share Your Story</span> <span className="text-purple-400">Anonymously</span>
              </h2>
              <p className="text-gray-400 mb-6">A safe space for college students to share confessions, stories, and connect with peers without judgment</p>
              
              {/* Daily Limit Display */}
              <div className="bg-gray-800 rounded-xl p-4 max-w-md mx-auto border border-gray-700" data-testid="card-daily-limit-display">
                <div className="flex items-center justify-center space-x-2">
                  <i className="fas fa-file-alt text-blue-400"></i>
                  <span className="text-lg">
                    <span className="text-blue-400 font-bold" data-testid="text-confessions-remaining">
                      {dailyLimit?.remaining ?? 5}
                    </span> confessions remaining today
                  </span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="confessions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2" data-testid="tabs-main">
                <TabsTrigger value="confessions" data-testid="tab-confessions">Confessions</TabsTrigger>
                <TabsTrigger value="chat" data-testid="tab-chat">Live Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="confessions">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Confession Form */}
                    <ConfessionForm collegeCode={selectedCollege} />

                    {/* Filter & Search */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700" data-testid="card-search-filters">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-filter text-gray-400 mr-2"></i>
                        <h3 className="text-lg font-semibold text-white">Filter & Search</h3>
                      </div>
                      
                      <Input
                        placeholder="Search confessions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        data-testid="input-search"
                      />
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Category</p>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(category => {
                              const isSelected = selectedCategory === category;
                              const categoryColors = {
                                all: 'bg-purple-500',
                                crush: 'bg-pink-500',
                                funny: 'bg-yellow-500',
                                secrets: 'bg-green-500',
                                rants: 'bg-red-500',
                                advice: 'bg-blue-500',
                                academic: 'bg-indigo-500'
                              };
                              return (
                                <Badge
                                  key={category}
                                  className={`cursor-pointer transition-all ${
                                    isSelected 
                                      ? `${categoryColors[category as keyof typeof categoryColors]} text-white` 
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                  onClick={() => setSelectedCategory(category)}
                                >
                                  {category === "all" ? "✨ All" : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Sort by</p>
                          <div className="flex gap-2">
                            <Button
                              variant={sortBy === 'newest' ? 'default' : 'secondary'}
                              size="sm"
                              onClick={() => setSortBy('newest')}
                              className={sortBy === 'newest' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}
                            >
                              🔥 Newest
                            </Button>
                            <Button
                              variant={sortBy === 'popular' ? 'default' : 'secondary'}
                              size="sm"
                              onClick={() => setSortBy('popular')}
                              className={sortBy === 'popular' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}
                            >
                              👑 Most Liked
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-gray-700 text-gray-300"
                            >
                              📈 Trending
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Featured Confession */}
                    {filteredConfessions.length > 0 && (
                      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-0.5 rounded-xl">
                        <div className="bg-gray-800 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-star text-yellow-400"></i>
                              <span className="text-lg font-semibold text-white">Daily Featured</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <i className="fas fa-chart-line"></i>
                              <span>Trending</span>
                              <span>•</span>
                              <span>26h ago</span>
                            </div>
                          </div>
                          <ConfessionCard confession={filteredConfessions[0]} featured={true} />
                          <div className="mt-4 text-center">
                            <span className="text-sm text-orange-400">🔥 Most popular today</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Ad Space */}
                    <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg mb-2">Ad Space</p>
                        <p className="text-sm">720x90 Ready</p>
                        <p className="text-xs text-green-400 mt-2">Google AdSense Ready</p>
                      </div>
                    </div>

                    {/* Confessions Feed */}
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                      ) : filteredConfessions.length === 0 ? (
                        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700" data-testid="card-no-confessions">
                          <i className="fas fa-comment-slash text-4xl text-gray-500 mb-4"></i>
                          <h3 className="text-xl font-semibold mb-2 text-white">No confessions found</h3>
                          <p className="text-gray-400">
                            {searchTerm || selectedCategory !== "all" 
                              ? "Try adjusting your search or filters"
                              : "Be the first to share a confession!"
                            }
                          </p>
                        </div>
                      ) : (
                        filteredConfessions.slice(1).map((confession) => (
                          <ConfessionCard key={confession.id} confession={confession} />
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Sidebar */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Platform Stats */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center mb-4">
                        <i className="fas fa-chart-bar text-blue-400 mr-2"></i>
                        <h3 className="text-lg font-semibold text-white">Platform Stats</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Confessions</span>
                          <span className="text-white font-bold">6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Likes</span>
                          <span className="text-pink-400 font-bold">1647</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Comments Today</span>
                          <span className="text-orange-400 font-bold">7</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Join Community CTA */}
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <i className="fas fa-heart text-white text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Join the Community</h3>
                      <p className="text-pink-100 text-sm mb-4">Share your thoughts anonymously and connect with fellow students</p>
                      <p className="text-pink-200 text-xs">Safe • Anonymous • Moderated</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <ChatRoom collegeCode={selectedCollege} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
