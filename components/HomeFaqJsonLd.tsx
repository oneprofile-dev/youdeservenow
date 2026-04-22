/**
 * FAQ rich results — answers real questions without promising medical/legal outcomes.
 */
export default function HomeFaqJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is YouDeserveNow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You describe something you accomplished (or someone you love did). The site generates a humorous, science-themed justification and suggests a reward—like a treat or gift idea. It is entertainment, not medical or financial advice.",
        },
      },
      {
        "@type": "Question",
        name: "Can I generate a prescription for my partner or a friend?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Choose “Someone I love” on the homepage or use the Gift a Diagnosis flow. You can share the result so they see the justification without needing an account.",
        },
      },
      {
        "@type": "Question",
        name: "Is this real science?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The “studies” and statistics are fictional jokes for entertainment. The emotional goal is permission to celebrate small wins—safely and lightly.",
        },
      },
      {
        "@type": "Question",
        name: "Does YouDeserveNow cost money?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Generating and sharing your justification is free. Optional links may point to third-party products; those purchases are between you and the retailer.",
        },
      },
      {
        "@type": "Question",
        name: "How do I share my result?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "After your prescription is generated, use the share buttons on your result page to copy a link or post to social platforms. Anyone with the link can view your shared result.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
