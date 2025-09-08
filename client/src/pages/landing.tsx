import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDailyLimit } from "@/hooks/use-daily-limit";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const { data: dailyLimit } = useDailyLimit();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => ({
      totalConfessions: 12400,
      activeStudents: 3200,
      safetyRating: 89,
      uptime: "24/7"
    }),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float" data-testid="text-hero-title">
              <span className="gradient-text">Share Your Story</span><br />
              <span className="text-foreground glow-green">Anonymously</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
              A safe space for college students to share confessions, stories, and connect with peers without judgment
            </p>
            
            {/* Daily Limit Counter */}
            <div className="glass-card rounded-xl p-4 mb-8 max-w-md mx-auto" data-testid="card-daily-limit">
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-clock text-accent"></i>
                <span className="font-mono text-lg">
                  <span className="text-primary font-bold" data-testid="text-remaining-count">
                    {dailyLimit?.remaining ?? 5}
                  </span> confessions remaining today
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/chat">
                <Button 
                  size="lg"
                  data-testid="button-start-sharing"
                  className="px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg animate-glow rounded-full"
                >
                  Start Sharing
                </Button>
              </Link>
              <Link href="/chat">
                <Button 
                  size="lg"
                  variant="outline"
                  data-testid="button-learn-more"
                  className="px-8 py-4 text-lg font-semibold hover:bg-secondary/10 transform hover:scale-105 transition-all duration-200 shadow-lg rounded-full"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-muted/50 rounded-2xl h-80 flex items-center justify-center shadow-2xl animate-float" style={{animationDelay: "1s"}}>
                <div className="text-center">
                  <i className="fas fa-users text-6xl text-primary/50 mb-4"></i>
                  <p className="text-muted-foreground text-lg" data-testid="text-hero-image-alt">
                    College students connecting anonymously
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Card className="glass-card p-6" data-testid="card-stat-confessions">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalConfessions.toLocaleString() ?? "12.4K"}
              </div>
              <div className="text-sm text-muted-foreground">Anonymous Confessions</div>
            </Card>
            <Card className="glass-card p-6" data-testid="card-stat-students">
              <div className="text-3xl font-bold text-secondary mb-2">
                {stats?.activeStudents.toLocaleString() ?? "3.2K"}
              </div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </Card>
            <Card className="glass-card p-6" data-testid="card-stat-safety">
              <div className="text-3xl font-bold text-accent mb-2">
                {stats?.safetyRating ?? 89}%
              </div>
              <div className="text-sm text-muted-foreground">Feel Safer Sharing</div>
            </Card>
            <Card className="glass-card p-6" data-testid="card-stat-uptime">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.uptime ?? "24/7"}
              </div>
              <div className="text-sm text-muted-foreground">Moderated Chat</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-features-title">
              Why Students Love <span className="gradient-text">SecretChatBox</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-description">
              Safe, anonymous, and designed specifically for college life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Anonymous Confessions */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 group" data-testid="card-feature-confessions">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-mask text-2xl text-primary"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Anonymous Confessions</h3>
                <p className="text-muted-foreground mb-6">Share your deepest thoughts without revealing your identity. Optional nicknames for personality.</p>
                
                <Card className="bg-muted/50 p-4">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-primary/20 text-primary">Crush</Badge>
                    <span className="ml-2 text-muted-foreground text-sm">Anonymous User</span>
                  </div>
                  <p className="text-sm">"I've had a crush on my lab partner for months but I'm too shy to say anything..."</p>
                  <div className="flex items-center mt-2 space-x-4 text-muted-foreground text-sm">
                    <span><i className="far fa-heart"></i> 23</span>
                    <span><i className="far fa-comment"></i> 5</span>
                  </div>
                </Card>
              </CardContent>
            </Card>

            {/* Real-time Chat */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 group" data-testid="card-feature-chat">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-comments text-2xl text-secondary"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Real-time Anonymous Chat</h3>
                <p className="text-muted-foreground mb-6">Connect instantly with other students. Random pairing ensures complete anonymity.</p>
                
                <Card className="bg-muted/50 p-4 space-y-2">
                  <div className="bg-primary/20 rounded-lg p-2 text-right text-sm">
                    <p>"Anyone else stressed about finals?"</p>
                  </div>
                  <div className="bg-secondary/20 rounded-lg p-2 text-sm">
                    <p>"Totally! What's your major?"</p>
                  </div>
                  <div className="bg-accent/20 rounded-lg p-2 text-sm">
                    <p>"Computer Science here, drowning in code 😅"</p>
                  </div>
                </Card>
              </CardContent>
            </Card>

            {/* Daily Limits */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 group" data-testid="card-feature-limits">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-hourglass-half text-2xl text-accent"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Daily Confession Limits</h3>
                <p className="text-muted-foreground mb-6">Quality over quantity. 5 confessions per day keeps content meaningful and prevents spam.</p>
                
                <Card className="bg-muted/50 p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-2">
                    {dailyLimit?.remaining ?? 3}
                  </div>
                  <p className="text-sm text-muted-foreground">Confessions remaining today</p>
                  <div className="w-full bg-background rounded-full h-2 mt-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((dailyLimit?.used ?? 2) / 5) * 100}%` }}
                    ></div>
                  </div>
                </Card>
              </CardContent>
            </Card>

            {/* Moderation */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 group" data-testid="card-feature-moderation">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-shield-alt text-2xl text-primary"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Safe & Moderated</h3>
                <p className="text-muted-foreground mb-6">24/7 admin moderation ensures a safe space free from harassment and inappropriate content.</p>
                
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <i className="fas fa-check-circle text-2xl text-primary mb-2"></i>
                  <p className="text-sm text-muted-foreground">All content reviewed before publication</p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 group" data-testid="card-feature-categories">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-tags text-2xl text-secondary"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Organized Categories</h3>
                <p className="text-muted-foreground mb-6">Find what you're looking for with categories like Crush, Funny, Secrets, and Complaints.</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/20 text-primary">💕 Crush</Badge>
                  <Badge className="bg-secondary/20 text-secondary">😂 Funny</Badge>
                  <Badge className="bg-accent/20 text-accent">🤫 Secrets</Badge>
                  <Badge variant="secondary">😤 Rants</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Direct Messages */}
            <Card className="p-8 shadow-lg hover:shadow-xl transition-all duration-300 group" data-testid="card-feature-messages">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-envelope text-2xl text-accent"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">Admin-Approved DMs</h3>
                <p className="text-muted-foreground mb-6">Send direct messages that require admin approval for safe, private conversations.</p>
                
                <Card className="bg-muted/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">DM Request</span>
                    <Badge className="bg-accent/20 text-accent text-xs">Pending</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">"Hi, I saw your confession about engineering stress. Want to chat?"</p>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Campus Life Gallery */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-stories-title">
              <span className="gradient-text">Real Stories</span> from Real Students
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-stories-description">
              See how SecretChatBox is helping students across campuses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { quote: "Finally found my study group!", author: "Anonymous Student" },
              { quote: "Best place to share real feelings", author: "CS Major, UCLA" },
              { quote: "Made real connections anonymously", author: "Psychology Student" }
            ].map((story, index) => (
              <Card key={index} className="relative group overflow-hidden" data-testid={`card-story-${index}`}>
                <div className="h-60 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <i className="fas fa-quote-left text-4xl text-primary/50"></i>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-semibold" data-testid={`text-story-quote-${index}`}>"{story.quote}"</p>
                  <p className="text-sm opacity-90" data-testid={`text-story-author-${index}`}>{story.author}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Featured Confession */}
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card p-8 text-center" data-testid="card-featured-confession">
              <div className="inline-flex items-center bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <i className="fas fa-star mr-2"></i>
                Featured Confession of the Day
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium mb-6" data-testid="text-featured-quote">
                "I was struggling with imposter syndrome in my computer science program. Sharing anonymously here helped me realize I wasn't alone - so many others felt the same way. The support I received gave me the confidence to keep going."
              </blockquote>
              <div className="flex items-center justify-center space-x-6 text-muted-foreground">
                <span data-testid="text-featured-likes"><i className="fas fa-heart text-primary"></i> 156 likes</span>
                <span data-testid="text-featured-comments"><i className="fas fa-comment"></i> 23 comments</span>
                <span data-testid="text-featured-shares"><i className="fas fa-share"></i> 12 shares</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Ad Space Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4" data-testid="text-ads-title">Supported by Student-Friendly Brands</h3>
            <p className="text-muted-foreground" data-testid="text-ads-description">Carefully curated advertisements relevant to college life</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-dashed border-muted p-12 text-center" data-testid="card-ad-space">
              <i className="fas fa-ad text-4xl text-muted-foreground mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">Google AdSense Ready</h4>
              <p className="text-muted-foreground">728x90 Banner Ad Space</p>
              <p className="text-sm text-muted-foreground mt-2">Student discounts, textbooks, career services, and more</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 gradient-text" data-testid="text-cta-title">
              Ready to Share Your Story?
            </h2>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-cta-description">
              Join thousands of students in the safest anonymous community on campus
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/chat">
                <Button 
                  size="lg"
                  data-testid="button-cta-start-chatting"
                  className="px-8 py-4 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 shadow-lg animate-glow"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Chatting Now
                </Button>
              </Link>
              <Button 
                variant="outline"
                size="lg"
                data-testid="button-cta-learn-more"
                className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg font-semibold transition-all duration-200"
              >
                <i className="fas fa-info-circle mr-2"></i>
                Learn More
              </Button>
            </div>

            {/* Safety Notice */}
            <Card className="glass-card p-6 max-w-2xl mx-auto" data-testid="card-safety-notice">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <i className="fas fa-shield-check text-primary"></i>
                <span className="font-semibold">Your Privacy is Protected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                No personal information required. All confessions are anonymous. 24/7 moderation ensures a safe space.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-card border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-user-secret text-2xl text-primary"></i>
                <span className="text-xl font-bold gradient-text">SecretChatBox</span>
              </div>
              <p className="text-muted-foreground">
                The safest anonymous platform for college students to share, connect, and support each other.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Anonymous Confessions</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Real-time Chat</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Categories & Tags</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Admin Moderation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Safety</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Report Content</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Admin</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Mental Health Resources</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Campus Counseling</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Crisis Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SecretChatBox. Made with ❤️ for college students everywhere.</p>
            <p className="mt-2 text-sm">Remember: You're never alone. Reach out for help when you need it.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <Link href="/chat">
        <Button 
          size="icon"
          data-testid="button-floating-action"
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-50 animate-bounce-slow"
        >
          <i className="fas fa-plus"></i>
        </Button>
      </Link>
    </div>
  );
}
