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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* College Selection */}
        {!selectedCollege && (
          <Card className="mb-8" data-testid="card-college-selection">
            <CardHeader>
              <CardTitle className="text-center gradient-text">
                Select Your College
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedCollege} data-testid="select-college">
                <SelectTrigger>
                  <SelectValue placeholder="Choose your college..." />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college: any) => (
                    <SelectItem key={college.id} value={college.code}>
                      {college.name} ({college.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {selectedCollege && (
          <>
            {/* Daily Limit Display */}
            <Card className="mb-6 glass-card" data-testid="card-daily-limit-display">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-accent"></i>
                    <span className="font-mono text-lg">
                      <span className="text-primary font-bold" data-testid="text-confessions-remaining">
                        {dailyLimit?.remaining ?? 5}
                      </span> confessions remaining today
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      College: <Badge className="bg-primary/20 text-primary">{selectedCollege}</Badge>
                    </div>
                  </div>
                </div>
                {dailyLimit && (
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(dailyLimit.used / dailyLimit.limit) * 100}%` }}
                    ></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="confessions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2" data-testid="tabs-main">
                <TabsTrigger value="confessions" data-testid="tab-confessions">Confessions</TabsTrigger>
                <TabsTrigger value="chat" data-testid="tab-chat">Live Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="confessions" className="space-y-6">
                {/* Confession Form */}
                <ConfessionForm collegeCode={selectedCollege} />

                {/* Search and Filters */}
                <Card data-testid="card-search-filters">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <Input
                        placeholder="Search confessions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md:flex-1"
                        data-testid="input-search"
                      />
                      
                      <Select value={selectedCategory} onValueChange={setSelectedCategory} data-testid="select-category">
                        <SelectTrigger className="md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy} data-testid="select-sort">
                        <SelectTrigger className="md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Confessions Feed */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredConfessions.length === 0 ? (
                    <Card className="p-8 text-center" data-testid="card-no-confessions">
                      <i className="fas fa-comment-slash text-4xl text-muted-foreground mb-4"></i>
                      <h3 className="text-xl font-semibold mb-2">No confessions found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || selectedCategory !== "all" 
                          ? "Try adjusting your search or filters"
                          : "Be the first to share a confession!"
                        }
                      </p>
                    </Card>
                  ) : (
                    filteredConfessions.map((confession) => (
                      <ConfessionCard key={confession.id} confession={confession} />
                    ))
                  )}
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
