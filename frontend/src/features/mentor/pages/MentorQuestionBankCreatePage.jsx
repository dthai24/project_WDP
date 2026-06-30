/**
 * Redirect legacy create route → manage workspace.
 */
import { Navigate, useSearchParams } from 'react-router-dom';

export default function MentorQuestionBankCreatePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return (
    <Navigate
      to={query ? `/mentor/question-banks/manage?${query}` : '/mentor/question-banks/manage'}
      replace
    />
  );
}
