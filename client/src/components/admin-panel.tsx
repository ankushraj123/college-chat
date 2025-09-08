import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLogout } from "@/hooks/use-auth";
import type { Confession, DirectMessage } from "@shared/schema";

export function AdminPanel() {
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);
  const [selectedDM, setSelectedDM] = useState<DirectMessage | null>(null);
  const [adminNote, setAdminNote] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const logout = useLogout();

  // Get pending confessions
  const { data: pendingConfessions = [], isLoading: confessionsLoading } = useQuery({
    queryKey: ["/api/admin/confessions/pending"],
    queryFn: async () => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch("/api/admin/confessions/pending", {
        headers: sessionToken ? { "x-session-token": sessionToken } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch pending confessions");
      return response.json() as Promise<Confession[]>;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Get pending direct messages
  const { data: pendingDMs = [], isLoading: dmsLoading } = useQuery({
    queryKey: ["/api/admin/direct-messages/pending"],
    queryFn: async () => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await fetch("/api/admin/direct-messages/pending", {
        headers: sessionToken ? { "x-session-token": sessionToken } : {},
      });
      if (!response.ok) throw new Error("Failed to fetch pending direct messages");
      return response.json() as Promise<DirectMessage[]>;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Approve confession mutation
  const approveConfession = useMutation({
    mutationFn: async (confessionId: string) => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await apiRequest("POST", `/api/admin/confessions/${confessionId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/confessions/pending"] });
      toast({
        title: "Confession approved",
        description: "The confession has been published.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to approve confession",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Delete confession mutation
  const deleteConfession = useMutation({
    mutationFn: async (confessionId: string) => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await apiRequest("DELETE", `/api/admin/confessions/${confessionId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/confessions/pending"] });
      toast({
        title: "Confession deleted",
        description: "The confession has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete confession",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Approve/reject DM mutation
  const updateDM = useMutation({
    mutationFn: async ({ dmId, status, note }: { dmId: string; status: string; note?: string }) => {
      const sessionToken = localStorage.getItem("adminSessionToken");
      const response = await apiRequest("POST", `/api/admin/direct-messages/${dmId}/approve`, {
        status,
        adminNote: note,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/direct-messages/pending"] });
      setSelectedDM(null);
      setAdminNote("");
      toast({
        title: "Direct message updated",
        description: "The status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update direct message",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout.mutate();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      crush: "💕",
      funny: "😂",
      secrets: "🤫",
      rants: "😤",
      advice: "💡",
      academic: "📚",
    };
    return emojis[category] || "📝";
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-pending-confessions-stat">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock text-accent text-2xl"></i>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {pendingConfessions.length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Confessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-dms-stat">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <i className="fas fa-envelope text-secondary text-2xl"></i>
              <div>
                <div className="text-2xl font-bold text-secondary">
                  {pendingDMs.length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Direct Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-admin-actions">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">Admin Actions</div>
                <div className="text-sm text-muted-foreground">Moderation Tools</div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="confessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2" data-testid="tabs-admin">
          <TabsTrigger value="confessions" data-testid="tab-confessions">
            Pending Confessions ({pendingConfessions.length})
          </TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-messages">
            Direct Messages ({pendingDMs.length})
          </TabsTrigger>
        </TabsList>

        {/* Confessions Tab */}
        <TabsContent value="confessions">
          <Card data-testid="card-confessions-list">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-list text-primary"></i>
                <span>Pending Confessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confessionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : pendingConfessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-pending-confessions">
                  <i className="fas fa-check-circle text-4xl mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                  <p>No pending confessions to review.</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {pendingConfessions.map((confession) => (
                      <Card key={confession.id} className="hover:shadow-lg transition-shadow" data-testid={`confession-item-${confession.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-primary/20 text-primary" data-testid={`badge-confession-category-${confession.id}`}>
                                {getCategoryEmoji(confession.category)} {confession.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground" data-testid={`text-confession-author-${confession.id}`}>
                                {confession.nickname || "Anonymous User"}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground" data-testid={`text-confession-time-${confession.id}`}>
                              {formatTime(confession.createdAt.toString())}
                            </span>
                          </div>
                          
                          <p className="text-foreground mb-4 leading-relaxed" data-testid={`text-confession-content-${confession.id}`}>
                            {confession.content}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" data-testid={`badge-confession-college-${confession.id}`}>
                              {confession.collegeCode}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => approveConfession.mutate(confession.id)}
                              disabled={approveConfession.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              data-testid={`button-approve-confession-${confession.id}`}
                            >
                              <i className="fas fa-check mr-2"></i>
                              Approve
                            </Button>
                            <Button
                              onClick={() => deleteConfession.mutate(confession.id)}
                              disabled={deleteConfession.isPending}
                              variant="destructive"
                              data-testid={`button-delete-confession-${confession.id}`}
                            >
                              <i className="fas fa-trash mr-2"></i>
                              Delete
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedConfession(confession)}
                                  data-testid={`button-view-confession-${confession.id}`}
                                >
                                  <i className="fas fa-eye mr-2"></i>
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Confession Details</DialogTitle>
                                </DialogHeader>
                                {selectedConfession && (
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold">Category & Author</h4>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <Badge className="bg-primary/20 text-primary">
                                          {getCategoryEmoji(selectedConfession.category)} {selectedConfession.category}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          {selectedConfession.nickname || "Anonymous User"}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Content</h4>
                                      <p className="mt-1 p-3 bg-muted rounded-lg">{selectedConfession.content}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Metadata</h4>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        <p>College: {selectedConfession.collegeCode}</p>
                                        <p>Submitted: {formatTime(selectedConfession.createdAt.toString())}</p>
                                        <p>Session ID: {selectedConfession.sessionId}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Direct Messages Tab */}
        <TabsContent value="messages">
          <Card data-testid="card-direct-messages-list">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-envelope text-secondary"></i>
                <span>Pending Direct Messages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dmsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
                </div>
              ) : pendingDMs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-pending-dms">
                  <i className="fas fa-check-circle text-4xl mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                  <p>No pending direct messages to review.</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {pendingDMs.map((dm) => (
                      <Card key={dm.id} className="hover:shadow-lg transition-shadow" data-testid={`dm-item-${dm.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-secondary/20 text-secondary" data-testid={`badge-dm-status-${dm.id}`}>
                                {dm.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                From: {dm.fromSessionId?.substring(0, 8)}...
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground" data-testid={`text-dm-time-${dm.id}`}>
                              {formatTime(dm.createdAt.toString())}
                            </span>
                          </div>
                          
                          <p className="text-foreground mb-4 leading-relaxed" data-testid={`text-dm-content-${dm.id}`}>
                            {dm.content}
                          </p>
                          
                          <div className="text-sm text-muted-foreground mb-4">
                            <p>To: {dm.toSessionId?.substring(0, 8)}...</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => setSelectedDM(dm)}
                                  data-testid={`button-approve-dm-${dm.id}`}
                                >
                                  <i className="fas fa-check mr-2"></i>
                                  Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approve Direct Message</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">Message Content</h4>
                                    <p className="mt-1 p-3 bg-muted rounded-lg">{dm.content}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Admin Note (Optional)</h4>
                                    <Textarea
                                      placeholder="Add a note for your records..."
                                      value={adminNote}
                                      onChange={(e) => setAdminNote(e.target.value)}
                                      data-testid="textarea-admin-note"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateDM.mutate({ dmId: dm.id, status: "approved", note: adminNote })}
                                      disabled={updateDM.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid="button-confirm-approve-dm"
                                    >
                                      Approve & Send
                                    </Button>
                                    <Button
                                      onClick={() => updateDM.mutate({ dmId: dm.id, status: "rejected", note: adminNote })}
                                      disabled={updateDM.isPending}
                                      variant="destructive"
                                      data-testid="button-reject-dm"
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              onClick={() => updateDM.mutate({ dmId: dm.id, status: "rejected" })}
                              disabled={updateDM.isPending}
                              variant="destructive"
                              data-testid={`button-reject-dm-${dm.id}`}
                            >
                              <i className="fas fa-times mr-2"></i>
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Guidelines Card */}
      <Card className="bg-muted/50" data-testid="card-moderation-guidelines">
        <CardHeader>
          <CardTitle className="text-lg">Moderation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">✅ Approve when content:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Is appropriate for college students</li>
                <li>• Follows community guidelines</li>
                <li>• Doesn't contain personal information</li>
                <li>• Is not spam or repetitive</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-600">❌ Reject when content:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Contains harassment or bullying</li>
                <li>• Has explicit or inappropriate material</li>
                <li>• Includes personal information</li>
                <li>• Violates platform policies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
