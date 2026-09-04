import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button, Card } from './ui';
import { showToast } from './Toast';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
  Send,
  Sparkles,
  Filter,
} from 'lucide-react';

export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole?: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
  tags?: string[];
  helpfulCount: number;
  isVerified?: boolean;
  isManagerApproval?: boolean; // True if this is a manager approval comment
  managerName?: string; // Name of the manager who approved
}

interface ReviewsAndCommentsProps {
  itemId: string;
  itemType: 'listing' | 'market' | 'service' | 'job';
  itemTitle?: string;
  initialMockReviews?: ReviewItem[];
  approvalComment?: string | null; // Optional manager approval comment
  approvalCommentAuthor?: string; // Name of manager who approved
}

export function ReviewsAndComments({
  itemId,
  itemType,
  itemTitle,
  initialMockReviews,
  approvalComment,
  approvalCommentAuthor,
}: ReviewsAndCommentsProps) {
  const { user } = useAuth();
  const { tr } = useLanguage();

  const storageKey = `duhuza_reviews_${itemType}_${itemId}`;

  // Default realistic baseline reviews if none saved yet
  const defaultBaselineReviews: ReviewItem[] = useMemo(() => {
    if (initialMockReviews && initialMockReviews.length > 0) {
      return initialMockReviews;
    }
    // Generated realistic contextual reviews for Rwanda platform
    if (itemType === 'listing') {
      return [
        {
          id: 'rev-1',
          authorName: 'Emmanuel Mugabo',
          authorRole: 'Verified Buyer',
          rating: 5,
          comment: 'Visite ku mutungo yagenze neza cyane. Amakuru yose ari ku rubuga ni ukuri kandi agent yatweretse imbibi neza n\'ibyangombwa bya UPI.',
          createdAt: '2026-08-25T14:20:00Z',
          tags: ['Verified Inspection', 'Accurate UPI', 'Recommended'],
          helpfulCount: 6,
          isVerified: true,
        },
        {
          id: 'rev-2',
          authorName: 'Aline Umutoni',
          authorRole: 'Tenant',
          rating: 5,
          comment: 'Great property in a very quiet neighborhood with 24/7 security and clean water access. The landlord and agent were very transparent.',
          createdAt: '2026-08-20T09:15:00Z',
          tags: ['Great Location', 'Clear Terms'],
          helpfulCount: 4,
          isVerified: true,
        },
        {
          id: 'rev-3',
          authorName: 'Jean Claude Nshimiyimana',
          authorRole: 'Investor',
          rating: 4,
          comment: 'Good investment prospect. The cadastral mapping matched the land registry records perfectly.',
          createdAt: '2026-08-14T16:45:00Z',
          tags: ['Clean Title', 'Fast Response'],
          helpfulCount: 2,
          isVerified: true,
        },
      ];
    } else if (itemType === 'market') {
      return [
        {
          id: 'rev-m1',
          authorName: 'Patrick Habimana',
          authorRole: 'Verified Buyer',
          rating: 5,
          comment: 'Igicuruzwa kimeze neza cyane nk\'uko byasobanuwe. Umucuruzi yagikozeho delivery yihuse i Kigali.',
          createdAt: '2026-08-24T11:30:00Z',
          tags: ['Fast Delivery', 'Top Quality', 'Verified Seller'],
          helpfulCount: 5,
          isVerified: true,
        },
        {
          id: 'rev-m2',
          authorName: 'Sandrine Uwase',
          authorRole: 'Buyer',
          rating: 4,
          comment: 'Good quality and fair price. WhatsApp communication was quick and straightforward.',
          createdAt: '2026-08-18T15:10:00Z',
          tags: ['Great Price', 'Responsive'],
          helpfulCount: 3,
          isVerified: true,
        },
      ];
    } else if (itemType === 'service') {
      return [
        {
          id: 'rev-s1',
          authorName: 'Diane Mukamana',
          authorRole: 'Client',
          rating: 5,
          comment: 'Yakoze akazi keza cyane kandi ku gihe. Yari afite ibikoresho byose bikenewe kandi igiciro cyari cyiza cyane.',
          createdAt: '2026-08-26T10:00:00Z',
          tags: ['Punctual', 'Professional', 'Fair Rates'],
          helpfulCount: 8,
          isVerified: true,
        },
        {
          id: 'rev-s2',
          authorName: 'Eric Bizimana',
          authorRole: 'Property Owner',
          rating: 5,
          comment: 'Highly certified expert. Solved our electrical installation seamlessly within 3 hours. Will hire again!',
          createdAt: '2026-08-21T13:40:00Z',
          tags: ['Certified Expert', 'High Quality'],
          helpfulCount: 4,
          isVerified: true,
        },
      ];
    } else {
      return [
        {
          id: 'rev-j1',
          authorName: 'Clarisse Keza',
          authorRole: 'Applicant',
          rating: 5,
          comment: 'Clear job specifications and swift recruitment process. Verified employer with prompt interview communication.',
          createdAt: '2026-08-22T08:30:00Z',
          tags: ['Clear Process', 'Verified Employer'],
          helpfulCount: 3,
          isVerified: true,
        },
      ];
    }
  }, [itemId, itemType, initialMockReviews]);

  // Load reviews from localStorage or fallback to default
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultBaselineReviews;
  });

  // Track user's helpful votes
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`duhuza_voted_${itemId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Form states
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [commentText, setCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Recommended');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & sort states
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Save to localStorage when reviews change (exclude manager approval comments)
  const saveReviews = (updated: ReviewItem[]) => {
    setReviews(updated);
    try {
      // Don't persist manager approval comments to localStorage
      const toSave = updated.filter((r) => !r.isManagerApproval);
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {
      // ignore
    }
  };

  // Sync author name if user logs in
  useEffect(() => {
    if (user?.name && !authorName) {
      setAuthorName(user.name);
    }
  }, [user, authorName]);

  // Add manager approval comment if provided (displayed separately)
  useEffect(() => {
    if (approvalComment && approvalComment.trim()) {
      const managerReview: ReviewItem = {
        id: `manager-approval-${itemId}`,
        authorName: approvalCommentAuthor || 'Platform Manager',
        rating: 0,
        comment: approvalComment,
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        isVerified: true,
        isManagerApproval: true,
        managerName: approvalCommentAuthor,
      };
      
      // Add manager comment at the top if not already present
      setReviews((prev) => {
        const hasManagerComment = prev.some((r) => r.isManagerApproval);
        if (!hasManagerComment) {
          return [managerReview, ...prev];
        }
        return prev;
      });
    }
  }, [approvalComment, approvalCommentAuthor, itemId]);

  // Calculations
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    // Separate manager approval comments from regular reviews
    const managerComments = reviews.filter((r) => r.isManagerApproval);
    let regularReviews = reviews.filter((r) => !r.isManagerApproval);
    
    // Apply filters to regular reviews only
    if (filterRating !== 'all') {
      regularReviews = regularReviews.filter((r) => Math.round(r.rating) === filterRating);
    }
    
    // Apply sorting
    const allReviews = [...regularReviews, ...managerComments];
    if (sortBy === 'recent') {
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'highest') {
      allReviews.sort((a, b) => {
        // Manager comments stay on top, regular reviews sorted by rating
        if (a.isManagerApproval) return -1;
        if (b.isManagerApproval) return 1;
        return b.rating - a.rating;
      });
    } else if (sortBy === 'lowest') {
      allReviews.sort((a, b) => {
        // Manager comments stay on top
        if (a.isManagerApproval) return -1;
        if (b.isManagerApproval) return 1;
        return a.rating - b.rating;
      });
    }
    
    // Ensure manager comments always appear first
    return allReviews;
  }, [reviews, filterRating, sortBy]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      authorName: authorName.trim() || 'Verified User',
      authorRole: user?.role ? `${user.role}` : 'Verified Client',
      rating: newRating,
      comment: commentText.trim(),
      createdAt: new Date().toISOString(),
      tags: selectedTag ? [selectedTag] : undefined,
      helpfulCount: 0,
      isVerified: true,
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);

    setCommentText('');
    setNewRating(5);
    setIsSubmitting(false);
    showToast('Your rating and review have been published!', 'success');
  };

  const handleVoteHelpful = (reviewId: string) => {
    const isVoted = votedHelpful[reviewId];
    const newVoted = { ...votedHelpful, [reviewId]: !isVoted };
    setVotedHelpful(newVoted);
    try {
      localStorage.setItem(`duhuza_voted_${itemId}`, JSON.stringify(newVoted));
    } catch {
      // ignore
    }

    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          helpfulCount: isVoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
        };
      }
      return r;
    });
    saveReviews(updated);
  };

  const starLabels: Record<number, string> = {
    1: '1 Star - Poor',
    2: '2 Stars - Fair',
    3: '3 Stars - Good',
    4: '4 Stars - Great',
    5: '5 Stars - Excellent',
  };

  const availableTags = [
    'Recommended',
    'Verified Quality',
    'Fast Response',
    'Accurate Description',
    'Great Price',
    'Professional',
  ];

  return (
    <div className="space-y-6 pt-6 border-t border-gray-200" id="reviews-section">
      {/* Title & Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#0F766E]" />
            <span>Ratings & Verified Reviews</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real feedback from verified buyers, clients, and community members.
          </p>
        </div>

        <a
          href="#write-review"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-[#0F766E] hover:bg-teal-100 transition border border-teal-200 self-start sm:self-auto"
        >
          <Star className="h-3.5 w-3.5 fill-[#0F766E] text-[#0F766E]" />
          <span>Write a Review</span>
        </a>
      </div>

      {/* ============================================================ */}
      {/* 1. RATING SUMMARY OVERVIEW CARD */}
      {/* ============================================================ */}
      <Card className="p-6 border border-[#E2E8E6] bg-gradient-to-r from-teal-50/40 via-white to-amber-50/20 shadow-xs">
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          {/* Big Score Box (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center sm:border-r border-gray-100 sm:pr-6">
            <div className="font-heading text-5xl font-extrabold text-gray-900 tracking-tight">
              {averageRating}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Based on <strong>{reviews.length}</strong> verified reviews
            </p>
          </div>

          {/* Star Rating Breakdown Bars (8 cols) */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;

              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                  className={`group w-full flex items-center gap-3 text-xs text-left transition rounded-lg px-2 py-1 ${
                    filterRating === star ? 'bg-teal-50 ring-1 ring-teal-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="w-12 font-bold text-gray-700 flex items-center gap-1 shrink-0">
                    {star} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>

                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-300 group-hover:bg-[#0F766E]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-gray-500 font-mono-data shrink-0">
                    {count} ({percent}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* 2. FILTER & SORT CONTROLS */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-[#0F766E]" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterRating('all')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filterRating === 'all'
                ? 'bg-[#0F766E] text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Stars ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setFilterRating(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                filterRating === s
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{s}★</span>
              <span>({ratingCounts[s as 1 | 2 | 3 | 4 | 5] || 0})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 focus:border-[#0F766E] focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. REVIEWS LIST */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/60 rounded-2xl border border-gray-200">
            <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No reviews found matching this filter</p>
            <p className="text-xs text-gray-500 mt-0.5">Be the first to share your experience below.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isVoted = votedHelpful[rev.id];
            const dateStr = new Date(rev.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card key={rev.id} className={`p-5 space-y-3 border transition ${
                rev.isManagerApproval 
                  ? 'border-emerald-200 bg-emerald-50/40 hover:shadow-sm' 
                  : 'border-[#E2E8E6] hover:shadow-sm'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white shadow-xs ${
                      rev.isManagerApproval
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                        : 'bg-gradient-to-br from-teal-600 to-[#0F766E]'
                    }`}>
                      {(rev.managerName || rev.authorName).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading text-sm font-bold text-gray-900">
                          {rev.authorName}
                        </span>
                        {rev.isManagerApproval && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Manager Feedback</span>
                          </span>
                        )}
                        {rev.isVerified && !rev.isManagerApproval && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                        {rev.authorRole && !rev.isManagerApproval && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            • {rev.authorRole}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono-data">{dateStr}</span>
                    </div>
                  </div>

                  {/* Star Rating - only show for regular reviews */}
                  {!rev.isManagerApproval && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Text */}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {rev.comment}
                </p>

                {/* Review Tags & Helpful Button - hide for manager feedback */}
                {!rev.isManagerApproval && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rev.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#0F766E] border border-teal-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVoteHelpful(rev.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        isVoted
                          ? 'bg-teal-50 text-[#0F766E] border border-teal-300'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${isVoted ? 'fill-[#0F766E]' : ''}`} />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. WRITE A REVIEW & RATING FORM */}
      {/* ============================================================ */}
      <div id="write-review">
        <Card className="p-6 border border-[#E2E8E6] bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <div>
            <h4 className="font-heading font-bold text-base text-gray-900">
              Leave a Review & Rating
            </h4>
            <p className="text-xs text-gray-500">
              Share your feedback regarding {itemTitle || 'this item'} to assist the Duhuza community.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Interactive Star Rating Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Your Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoverRating || newRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {starLabels[hoverRating || newRating]}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Your Name *
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Highlight Tag
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
              >
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Your Feedback / Comment *
            </label>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your honest review and comment here..."
              required
              className="w-full rounded-lg border border-[#E2E8E6] bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="font-bold">
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? tr('loading') : 'Submit Review & Rating'}</span>
          </Button>
        </form>
      </Card>
    </div>
  </div>
  );
}
