'use client';

import { useState } from 'react';
import { addFeedback, getFeedbacks } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Feedback = {
  id: number;
  type: string;
  message: string;
  createdAt: Date | null;
};

export function FeedbackSection({
  initialFeedbacks,
  hasSubmittedInitial,
}: {
  initialFeedbacks: Feedback[];
  hasSubmittedInitial?: boolean;
}) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'love' | 'hate' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(hasSubmittedInitial || false);

  const handleSubmit = async () => {
    if (!message.trim() || !type) return;

    setLoading(true);
    setErrorMsg('');
    try {
      await addFeedback(type, message);
      const updated = await getFeedbacks();
      setFeedbacks(updated);
      setMessage('');
      setType(null);
      setHasSubmitted(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setErrorMsg(message);
      if (message.includes('already submitted')) {
        setHasSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="feedback-section" className="w-full max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Love it or Hate it?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Let us know what you think about cursor.js
        </p>
      </div>

      {!hasSubmitted ? (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 mb-12">
          {errorMsg && (
            <div className="mb-4 text-sm font-medium text-red-500 text-center">{errorMsg}</div>
          )}
          <div className="flex gap-4 mb-6">
            <Button
              id="feedback-love"
              variant={type === 'love' ? 'default' : 'outline'}
              className={`flex-1 ${type === 'love' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900/50 dark:hover:bg-green-900/20'}`}
              onClick={() => setType('love')}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Love it
            </Button>
            <Button
              id="feedback-hate"
              variant={type === 'hate' ? 'default' : 'outline'}
              className={`flex-1 ${type === 'hate' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/50 dark:hover:bg-red-900/20'}`}
              onClick={() => setType('hate')}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Hate it
            </Button>
          </div>
          <Textarea
            id="feedback-message"
            placeholder="Share your thoughts..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] mb-6 resize-none"
          />
          <div className="flex justify-end">
            <Button
              id="feedback-submit"
              className="w-full sm:w-auto"
              onClick={handleSubmit}
              disabled={!message.trim() || !type || loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-8 mb-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Thank you for your feedback!</h3>
          <p className="text-muted-foreground">You have already submitted your response.</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-6">Recent Feedback</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {feedbacks.map((fb) => (
            <Card key={fb.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {fb.type === 'love' ? (
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-sm text-foreground line-clamp-4">{fb.message}</p>
              </CardContent>
            </Card>
          ))}
          {feedbacks.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No feedback yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
