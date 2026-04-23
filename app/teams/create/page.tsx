"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { track } from "@vercel/analytics/react";

const INDUSTRIES = [
  { id: "tech", label: "💻 Technology/Engineering", description: "Startups, tech companies, software teams" },
  { id: "sales", label: "📈 Sales/Business Dev", description: "Sales teams, account executives" },
  { id: "marketing", label: "📣 Marketing/Communications", description: "Content, creative, campaigns" },
  { id: "design", label: "🎨 Design", description: "UI/UX, graphic, product design" },
  { id: "product", label: "🚀 Product Management", description: "Product managers, strategy" },
  { id: "operations", label: "⚙️ Operations", description: "Operations, logistics, infrastructure" },
  { id: "hr", label: "👥 People/HR", description: "HR teams, recruiting, culture" },
  { id: "finance", label: "💰 Finance/Accounting", description: "Finance teams, accounting" },
  { id: "education", label: "📚 Education", description: "Schools, universities, EdTech" },
  { id: "healthcare", label: "🏥 Healthcare", description: "Medical, wellness, healthcare teams" },
  { id: "non-profit", label: "🤝 Non-Profit/NGO", description: "Charities, social impact organizations" },
  { id: "open-source", label: "🌐 Open Source", description: "Open source projects, communities" },
];

export default function CreateTeamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    founderName: "",
    tone: "playful" as "playful" | "warm",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.industry) {
        setError("Team name and industry are required");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!formData.founderName) {
        setError("Founder name is required");
        return;
      }
      submitTeam();
    }
  };

  const submitTeam = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          industry: formData.industry,
          description: formData.description,
          userId: `founder-${Date.now()}`, // Simple ID generation
          displayName: formData.founderName,
          isPublic: true,
          tone: formData.tone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        track("team_created", {
          teamName: formData.name,
          industry: formData.industry,
        });
        router.push(`/team/${data.team.id}`);
      } else {
        setError("Failed to create team");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
              🏆 Create Your Team
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
              Start celebrating team wins and recognizing peers
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-between items-center mb-12">
            <div
              className={`flex-1 h-2 rounded-full mr-2 ${
                step >= 1
                  ? "bg-[var(--color-accent)]"
                  : "bg-[var(--color-bg-secondary)]"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full ${
                step >= 2
                  ? "bg-[var(--color-accent)]"
                  : "bg-[var(--color-bg-secondary)]"
              }`}
            />
          </div>

          {/* Form */}
          <div className="p-8 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
            {step === 1 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                  Tell us about your team
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Platform Engineering, Sales Reps, Content Creators"
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3">
                    What's your industry? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.id}
                        onClick={() =>
                          setFormData({ ...formData, industry: ind.id })
                        }
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.industry === ind.id
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-accent)]/50"
                        }`}
                      >
                        <p className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                          {ind.label}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                          {ind.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3">
                    Team Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="What makes your team special? What do you work on?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3">
                    Team Tone
                  </label>
                  <div className="flex gap-4">
                    {(["playful", "warm"] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setFormData({ ...formData, tone })}
                        className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                          formData.tone === tone
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : "border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                        }`}
                      >
                        <p className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                          {tone === "playful" ? "😄 Playful" : "🤍 Warm"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                )}

                <button
                  onClick={handleNext}
                  className="w-full px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 transition-all"
                >
                  Next →
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                  Almost there!
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3">
                    Your Name (Team Founder) *
                  </label>
                  <input
                    type="text"
                    value={formData.founderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        founderName: e.target.value,
                      })
                    }
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                  />
                </div>

                <div className="p-4 rounded-lg bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                  <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                    <strong>Team Summary:</strong>
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                    <li>📛 Name: {formData.name}</li>
                    <li>🏢 Industry: {formData.industry}</li>
                    <li>😄 Tone: {formData.tone}</li>
                  </ul>
                </div>

                {error && (
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 rounded-lg border-2 border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] font-semibold hover:opacity-80"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {isLoading ? "Creating..." : "Create Team 🎉"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <Link href="/teams" className="text-[var(--color-accent)] hover:underline text-sm">
              View all teams
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
