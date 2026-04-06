import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, BarChart2, RefreshCw } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getQuestions, submitBatch, getResults, getProgress } from '../api/assessment';
import type { PsychometricQuestion, PsychometricProgress } from '../types';

const LIKERT = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

const CATEGORY_COLORS: Record<string, string> = {
  REALISTIC:        'bg-orange-100 text-orange-700',
  INVESTIGATIVE:    'bg-blue-100 text-blue-700',
  ARTISTIC:         'bg-pink-100 text-pink-700',
  SOCIAL:           'bg-green-100 text-green-700',
  ENTERPRISING:     'bg-yellow-100 text-yellow-700',
  CONVENTIONAL:     'bg-gray-100 text-gray-700',
  OPENNESS:         'bg-purple-100 text-purple-700',
  CONSCIENTIOUSNESS:'bg-teal-100 text-teal-700',
  EXTRAVERSION:     'bg-red-100 text-red-700',
  AGREEABLENESS:    'bg-lime-100 text-lime-700',
  NEUROTICISM:      'bg-rose-100 text-rose-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  REALISTIC: 'Realistic', INVESTIGATIVE: 'Investigative', ARTISTIC: 'Artistic',
  SOCIAL: 'Social', ENTERPRISING: 'Enterprising', CONVENTIONAL: 'Conventional',
  OPENNESS: 'Openness', CONSCIENTIOUSNESS: 'Conscientiousness', EXTRAVERSION: 'Extraversion',
  AGREEABLENESS: 'Agreeableness', NEUROTICISM: 'Neuroticism',
};

type ResultData = Record<string, { average_score: number; question_count: number; interpretation: string }>;

const Assessment: React.FC = () => {
  const [questions, setQuestions] = useState<PsychometricQuestion[]>([]);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [, setProgress] = useState<PsychometricProgress | null>(null);
  const [results, setResults] = useState<ResultData | null>(null);
  const [showResults, setShowResults] = useState(false);

  const QUESTIONS_PER_PAGE = 5;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qs, prog] = await Promise.allSettled([getQuestions(), getProgress()]);
      if (qs.status === 'fulfilled') setQuestions(qs.value);
      if (prog.status === 'fulfilled') {
        const p = prog.value;
        setProgress(p);
        if (p.is_complete) {
          const res = await getResults();
          setResults(res.data || res);
          setShowResults(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleResponse = (questionId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const answeredOnPage = pageQuestions.filter((q) => responses[q.id] !== undefined).length;
  const totalAnswered = Object.keys(responses).length;
  const overallPercent = questions.length ? Math.round((totalAnswered / questions.length) * 100) : 0;

  const handleSubmit = async () => {
    if (totalAnswered < questions.length) {
      setAlert({ type: 'error', msg: `Please answer all questions before submitting. (${totalAnswered}/${questions.length} answered)` });
      return;
    }
    setSubmitting(true);
    try {
      const payload = Object.entries(responses).map(([qid, val]) => ({
        question_id: parseInt(qid),
        response_value: val,
      }));
      await submitBatch(payload);
      const res = await getResults();
      setResults(res.data || res);
      setShowResults(true);
      setAlert({ type: 'success', msg: 'Assessment submitted successfully!' });
      setProgress((p) => p ? { ...p, is_complete: true, percentage: 100 } : p);
    } catch {
      setAlert({ type: 'error', msg: 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner fullPage text="Loading assessment…" /></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Psychometric Assessment"
        subtitle="Complete 18 questions to discover your RIASEC career personality type"
        action={
          showResults ? (
            <button
              onClick={() => { setShowResults(false); setCurrentPage(0); }}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>
          ) : undefined
        }
      />

      {alert && (
        <div className="mb-5">
          <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Info box */}
      {!showResults && questions.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-blue-600">📋</div>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Quick assessment - only {questions.length} questions
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Answer honestly. There are no right or wrong answers!
              </p>
            </div>
          </div>
        </div>
      )}

      {showResults && results ? (
        /* ── Results view ── */
        <div className="space-y-6">
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
              <div>
                <h3 className="font-bold text-green-800 text-lg">Assessment Complete!</h3>
                <p className="text-green-700 text-sm">Here are your RIASEC personality profile results.</p>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-primary-600" />
            <span>Your RIASEC Profile Results</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results).map(([cat, data]) => (
              <div key={cat} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700'}`}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {typeof data.average_score === 'number' ? data.average_score.toFixed(1) : '–'}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${((data.average_score ?? 0) / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Score out of 5</p>
                </div>
                {data.interpretation && (
                  <p className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                    {data.interpretation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : questions.length === 0 ? (
        /* ── No questions ── */
        <div className="card flex flex-col items-center py-16 text-center">
          <BarChart2 className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No questions available yet.</p>
          <p className="text-sm text-gray-400 mt-1">Please check back later or contact admin.</p>
        </div>
      ) : (
        /* ── Quiz view ── */
        <div className="space-y-6">
          {/* Overall progress bar */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{totalAnswered}/{questions.length}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{overallPercent}% complete</p>
          </div>

          {/* Page indicator */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <span className="font-medium text-primary-600">{answeredOnPage}/{pageQuestions.length} answered on this page</span>
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {pageQuestions.map((q, idx) => {
              const globalIdx = currentPage * QUESTIONS_PER_PAGE + idx + 1;
              const answered = responses[q.id];
              return (
                <div key={q.id} className={`card transition-all ${answered ? 'border-primary-200' : ''}`}>
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                      {globalIdx}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`badge text-xs ${CATEGORY_COLORS[q.category] ?? 'bg-gray-100 text-gray-600'}`}>
                          {CATEGORY_LABELS[q.category] ?? q.category}
                        </span>
                        {answered && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-gray-800 font-medium leading-relaxed">{q.question_text}</p>
                    </div>
                  </div>

                  {/* Likert scale – responsive grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {LIKERT.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleResponse(q.id, opt.value)}
                        className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                          answered === opt.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-lg font-bold ${answered === opt.value ? 'text-primary-600' : 'text-gray-600'}`}>
                          {opt.value}
                        </span>
                        <span className="text-xs text-gray-400 leading-tight hidden sm:block mt-0.5">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="btn-secondary flex items-center space-x-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentPage < totalPages - 1 ? (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="btn-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || totalAnswered < questions.length}
                className="btn-primary flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{submitting ? 'Submitting…' : 'Submit Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Assessment;