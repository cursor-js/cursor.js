import { ClientPage } from './ClientPage';
import { FeedbackSection } from './FeedbackSection';
import { getFeedbacks } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function Page() {
  const initialFeedbacks = await getFeedbacks();
  const cookieStore = await cookies();
  const hasSubmittedInitial = cookieStore.get('has_submitted_feedback')?.value === 'true';

  return (
    <>
      <ClientPage hasSubmittedFeedback={hasSubmittedInitial} />
      <FeedbackSection
        initialFeedbacks={initialFeedbacks}
        hasSubmittedInitial={hasSubmittedInitial}
      />
    </>
  );
}
