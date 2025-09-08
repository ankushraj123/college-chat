import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateConfession } from "@/hooks/use-confessions";
import { useDailyLimit } from "@/hooks/use-daily-limit";
import { useToast } from "@/hooks/use-toast";

const confessionSchema = z.object({
  content: z.string().min(10, "Confession must be at least 10 characters").max(1000, "Confession must be less than 1000 characters"),
  category: z.string().min(1, "Please select a category"),
  nickname: z.string().optional(),
});

type ConfessionFormData = z.infer<typeof confessionSchema>;

interface ConfessionFormProps {
  collegeCode: string;
}

export function ConfessionForm({ collegeCode }: ConfessionFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: dailyLimit } = useDailyLimit();
  const createConfession = useCreateConfession();
  const { toast } = useToast();

  const form = useForm<ConfessionFormData>({
    resolver: zodResolver(confessionSchema),
    defaultValues: {
      content: "",
      category: "",
      nickname: "",
    },
  });

  const isLimitReached = dailyLimit && dailyLimit.remaining <= 0;

  const onSubmit = async (data: ConfessionFormData) => {
    if (isLimitReached) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily confession limit. Try again tomorrow!",
        variant: "destructive",
      });
      return;
    }

    try {
      await createConfession.mutateAsync({
        ...data,
        collegeCode,
        isAnonymous: true,
      });
      
      toast({
        title: "Confession submitted!",
        description: "Your confession is being reviewed by moderators.",
      });
      
      form.reset();
      setIsExpanded(false);
    } catch (error) {
      toast({
        title: "Failed to submit confession",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const categories = [
    { value: "crush", label: "💕 Crush", emoji: "💕" },
    { value: "funny", label: "😂 Funny", emoji: "😂" },
    { value: "secrets", label: "🤫 Secrets", emoji: "🤫" },
    { value: "rants", label: "😤 Rants", emoji: "😤" },
    { value: "advice", label: "💡 Advice", emoji: "💡" },
    { value: "academic", label: "📚 Academic", emoji: "📚" },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700" data-testid="card-confession-form">
      <div className="flex items-center mb-4">
        <i className="fas fa-edit text-purple-400 mr-2"></i>
        <h3 className="text-lg font-semibold text-white">Share Your Confession</h3>
        {dailyLimit && (
          <div className="ml-auto text-sm text-blue-400">
            <i className="fas fa-file-alt mr-1"></i>
            {dailyLimit.remaining} confessions remaining today
          </div>
        )}
      </div>
      
      {isLimitReached ? (
        <div className="text-center py-8" data-testid="container-limit-reached">
          <i className="fas fa-hourglass-end text-4xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2 text-white">Daily Limit Reached</h3>
          <p className="text-gray-400">
            You've used all 5 of your confessions for today. Come back tomorrow to share more!
          </p>
        </div>
      ) : !isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          className="w-full h-16 text-left justify-start bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
          data-testid="button-expand-form"
        >
          <i className="fas fa-comment-dots mr-3 text-purple-400"></i>
          <span>What's on your mind? Share anonymously...</span>
        </Button>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Confession</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share what's on your mind... (10-1000 characters)"
                        rows={4}
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                        data-testid="textarea-confession-content"
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <FormMessage />
                      <span>{field.value.length}/1000</span>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} data-testid="select-confession-category">
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Choose a category..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Anonymous User"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                          data-testid="input-nickname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  data-testid="button-cancel-confession"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createConfession.isPending}
                  className="bg-purple-500 hover:bg-purple-600 text-white flex-1"
                  data-testid="button-submit-confession"
                >
                  {createConfession.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Submit Confession
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
    </div>
  );
}
