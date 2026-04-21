"use client";

import { useState } from "react";
import { showToast } from "@/components/ToastContainer";

export function NPSSurvey() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (score === null) {
      showToast("Please select a score", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: `user-${Date.now()}`,
          score,
          feedback: feedback || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit NPS");

      showToast("Thank you for rating us! 🌟", "success");
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setScore(null);
        setFeedback("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      showToast("Failed to submit rating", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-t-lg shadow-xl max-w-md w-full p-6 animate-pop">
        {!submitted ? (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              How likely are you to recommend us?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your feedback helps us improve
            </p>

            {/* Score Scale */}
            <div className="grid grid-cols-11 gap-1 mb-4">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`py-2 rounded font-semibold text-sm transition-all ${
                    score === i
                      ? "bg-blue-600 text-white scale-110"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-4">
              <span>Not likely</span>
              <span>Very likely</span>
            </div>

            {/* Optional Feedback */}
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us why? (optional)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4 text-sm"
            />

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                disabled={loading}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || score === null}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-lg font-semibold text-gray-900">
              Thank you for your feedback!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              We appreciate your input
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function NPSSurveyTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <NPSSurvey />}
      {/* Survey can be triggered programmatically or on specific user events */}
    </>
  );
}
