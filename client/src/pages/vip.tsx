import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Coins, Crown, ShoppingCart, History, Star, Zap, MessageCircle, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { MarketplaceItem, UserTokens, VipMembership, TokenTransaction, VipPurchase } from "@shared/schema";

export default function VipPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get user tokens and VIP status
  const { data: userTokens } = useQuery<UserTokens>({
    queryKey: ['/api/vip/tokens'],
  });

  const { data: vipMembership } = useQuery<VipMembership>({
    queryKey: ['/api/vip/membership'],
  });

  const { data: marketplaceItems = [] } = useQuery<MarketplaceItem[]>({
    queryKey: ['/api/vip/marketplace'],
  });

  const { data: transactions = [] } = useQuery<TokenTransaction[]>({
    queryKey: ['/api/vip/transactions'],
  });

  const { data: purchases = [] } = useQuery<VipPurchase[]>({
    queryKey: ['/api/vip/purchases'],
  });

  // Purchase VIP item mutation
  const purchaseItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("POST", "/api/vip/purchase", { itemId });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Purchase failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "Your VIP feature has been activated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/vip'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = async (item: MarketplaceItem) => {
    if (!userTokens || userTokens.balance < item.price) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${item.price} tokens to purchase this item. You have ${userTokens?.balance || 0} tokens.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await purchaseItemMutation.mutateAsync(item.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vip_features": return <Zap className="h-4 w-4" />;
      case "premium_services": return <Crown className="h-4 w-4" />;
      case "special_access": return <Shield className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "vip_features": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "premium_services": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "special_access": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isVipActive = vipMembership?.isActive && 
    (!vipMembership.expiresAt || new Date(vipMembership.expiresAt) > new Date());

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  VIP Members
                </h1>
                <p className="text-gray-400 text-sm">Premium features and exclusive access</p>
              </div>
            </div>
            <Link to="/chat">
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* VIP Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Token Balance */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="h-5 w-5 text-yellow-500" />
                Token Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {userTokens?.balance || 0}
              </div>
              <div className="space-y-1 text-sm text-gray-400">
                <div>Total Earned: {userTokens?.totalEarned || 0}</div>
                <div>Total Spent: {userTokens?.totalSpent || 0}</div>
              </div>
            </CardContent>
          </Card>

          {/* VIP Status */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-purple-500" />
                VIP Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                {isVipActive ? (
                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-600 text-gray-400">
                    Inactive
                  </Badge>
                )}
              </div>
              {vipMembership && isVipActive && (
                <div className="text-sm text-gray-400">
                  <div className="mb-1">{vipMembership.membershipType}</div>
                  {vipMembership.expiresAt && (
                    <div>Expires: {formatDate(vipMembership.expiresAt)}</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-green-500" />
                Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500 mb-2">
                {purchases.length}
              </div>
              <div className="text-sm text-gray-400">
                Total VIP purchases
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-gray-800">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceItems.map((item) => (
                <Card key={item.id} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <Coins className="h-4 w-4" />
                        {item.price}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-300">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {item.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    {item.duration && (
                      <div className="text-sm text-gray-400">
                        Duration: {item.duration} days
                      </div>
                    )}

                    {/* Purchase Button */}
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={isProcessing || !userTokens || userTokens.balance < item.price}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      data-testid={`button-purchase-${item.id}`}
                    >
                      {isProcessing ? "Processing..." : 
                       !userTokens || userTokens.balance < item.price ? "Insufficient Tokens" : "Purchase"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Transactions */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Token Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        No transactions yet
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <div>
                            <div className="font-medium text-gray-200">{transaction.description}</div>
                            <div className="text-sm text-gray-400">{formatDate(transaction.createdAt)}</div>
                          </div>
                          <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* VIP Purchases */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    VIP Purchases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {purchases.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        No purchases yet
                      </div>
                    ) : (
                      purchases.map((purchase) => (
                        <div key={purchase.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-200">{purchase.itemTitle}</div>
                            <Badge className={purchase.status === 'active' ? 
                              'bg-green-500/10 text-green-500 border-green-500/20' : 
                              'bg-gray-500/10 text-gray-500 border-gray-500/20'}>
                              {purchase.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div>{formatDate(purchase.purchasedAt)}</div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {purchase.tokensSpent}
                            </div>
                          </div>
                          {purchase.expiresAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              Expires: {formatDate(purchase.expiresAt)}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}