export interface PSEOPage {
  slug: string;
  headline: string;
  subheadline: string;
  categories: string[];
  checklistTitle: string;
  checklist: string[];
  metaDescription: string;
}

export const PSEO_PAGES: PSEOPage[] = [
  {
    slug: "gym-goers",
    headline: "What Do You Deserve After Working Out?",
    subheadline:
      "Peer-reviewed science confirms: exercise creates a measurable Reward Deficit. The Institute has calculated your prescription.",
    categories: ["fitness", "selfcare", "comfort"],
    checklistTitle: "Post-Workout Deserve Checklist",
    checklist: [
      "Completed at least one rep",
      "Did not skip leg day (this time)",
      "Sweat was produced (or witnessed)",
      "You are reading this instead of doing more cardio",
      "Science demands you treat yourself",
    ],
    metaDescription:
      "Finished a workout? Science says you deserve a reward. Get your AI-generated justification for buying that thing you've been eyeing.",
  },
  {
    slug: "remote-workers",
    headline: "What Do You Deserve After a WFH Day?",
    subheadline:
      "Research shows home-office workers are 31% more deserving of retail therapy. The data is unambiguous — your commute savings have been reallocated.",
    categories: ["tech", "comfort", "selfcare"],
    checklistTitle: "WFH Deserve Checklist",
    checklist: [
      "Attended at least one meeting that could have been an email",
      "Maintained professional top + pajama bottoms simultaneously",
      "Resisted the urge to nap before 3pm",
      "Coworkers never knew you were eating lunch",
      "You have clinically earned this",
    ],
    metaDescription:
      "Survived another WFH day? Get your scientifically justified reward recommendation from our AI research institute.",
  },
  {
    slug: "students",
    headline: "What Do You Deserve After Studying?",
    subheadline:
      "Cognitive expenditure depletes dopamine reserves at 2.3× the normal rate. The Institute of Academic Achievement mandates immediate refill.",
    categories: ["snacks", "comfort", "trending"],
    checklistTitle: "Student Deserve Checklist",
    checklist: [
      "Opened at least one textbook (tabs count)",
      "Highlighted something — anything",
      "Survived the library for 45+ minutes",
      "Did not fully panic during the exam",
      "This reward is scientifically mandated",
    ],
    metaDescription:
      "Just finished studying or passed an exam? The Institute of Academic Achievement says you deserve a reward. Get your AI justification.",
  },
  {
    slug: "monday-survivors",
    headline: "What Do You Deserve for Surviving Monday?",
    subheadline:
      "Clinical trials confirm: Monday attendance alone qualifies as a measurable achievement in 94.7% of subjects.",
    categories: ["comfort", "snacks", "selfcare"],
    checklistTitle: "Monday Survive Checklist",
    checklist: [
      "Got out of bed despite all available evidence against it",
      "Attended work with minimal existential dread",
      "Did not send a passive-aggressive email (or deleted it in time)",
      "Made it to 5pm without a full breakdown",
      "You have clinically earned a reward",
    ],
    metaDescription:
      "Made it through Monday? Science says that earns a reward. Get your AI-generated justification for treating yourself.",
  },
  {
    slug: "night-owls",
    headline: "What Do You Deserve for Working Late?",
    subheadline:
      "Nocturnal productivity is the rarest form of human achievement. The Institute recognizes your sacrifice with full reward authorization.",
    categories: ["comfort", "snacks", "selfcare", "tech"],
    checklistTitle: "Night Owl Deserve Checklist",
    checklist: [
      "Still awake past 10pm for a non-fun reason",
      "Clock checked with increasing frequency",
      "Caffeine was the primary food group",
      "Actual work was produced",
      "You are legally entitled to this purchase",
    ],
    metaDescription:
      "Burning the midnight oil? Science confirms late-night workers deserve immediate reward. Get your AI justification.",
  },
  {
    slug: "parents",
    headline: "What Do You Deserve for Being a Parent Today?",
    subheadline:
      "Parenthood science index: 9.8/10 deserve score. You've maintained life, schedules, and sanity. Full retail privileges unlocked.",
    categories: ["selfcare", "comfort", "snacks"],
    checklistTitle: "Parent Deserve Checklist",
    checklist: [
      "Children were fed and alive at end of day",
      "At least one meltdown was successfully diffused",
      "You remembered everyone's schedule (mostly)",
      "Bedtime happened (eventually)",
      "The researchers unanimously agree: treat yourself",
    ],
    metaDescription:
      "Being a parent is the hardest job. Get your scientifically justified reward recommendation — you've more than earned it.",
  },
  {
    slug: "meal-preppers",
    headline: "What Do You Deserve for Meal Prepping?",
    subheadline:
      "88.4% of meal preppers show measurable self-control deficits that can only be corrected through immediate reward stimulation.",
    categories: ["kitchen", "snacks", "comfort"],
    checklistTitle: "Meal Prep Deserve Checklist",
    checklist: [
      "Vegetables were voluntarily touched",
      "Meal containers were actually used (not just purchased)",
      "Zero delivery apps were opened",
      "Future-self will thank present-self",
      "Science prescribes one (1) immediate reward",
    ],
    metaDescription:
      "Meal prepped this week? That's genuinely impressive. Get your AI-generated scientific justification for treating yourself.",
  },
  {
    slug: "entrepreneurs",
    headline: "What Do You Deserve as a Founder Today?",
    subheadline:
      "Founder cortisol levels run 4.1× above baseline. The prescribed intervention is immediate, guilt-free retail therapy.",
    categories: ["tech", "trending", "comfort"],
    checklistTitle: "Founder Deserve Checklist",
    checklist: [
      "Laptop opened before 8am or after midnight",
      "Sent at least one cold email nobody replied to",
      "Pivoted — just slightly",
      "Survived the existential dread cycle (again)",
      "You have earned disproportionate reward",
    ],
    metaDescription:
      "Building something? Founders deserve recognition. Get your AI-generated justification for that purchase you've been eyeing.",
  },
  {
    slug: "weekend-warriors",
    headline: "What Do You Deserve This Weekend?",
    subheadline:
      "Weekend productivity converts to deserved reward at a 100% rate. Rest or hustle — the Institute approves both.",
    categories: ["home", "comfort", "fitness"],
    checklistTitle: "Weekend Warrior Deserve Checklist",
    checklist: [
      "Emerged from bed before noon",
      "Resisted the full Netflix queue (at least partially)",
      "Did one productive thing",
      "Survived Sunday evening dread",
      "The weekend was yours — you earned this",
    ],
    metaDescription:
      "Had a productive weekend? Rest or hustle — science says you deserve a reward either way. Get your AI justification.",
  },
  {
    slug: "coffee-addicts",
    headline: "What Do You Deserve for Running on Coffee?",
    subheadline:
      "Caffeine-sustained achievement is still achievement. Your neurochemistry has been running at a deficit — the Institute demands compensation.",
    categories: ["kitchen", "snacks", "comfort"],
    checklistTitle: "Coffee Survivor Deserve Checklist",
    checklist: [
      "At least 2 cups consumed (3+ earns bonus reward)",
      "Functional despite clinically insufficient sleep",
      "Work was produced (loosely defined)",
      "No one was harmed before the first cup",
      "The Institute mandates immediate reward",
    ],
    metaDescription:
      "Powered through your day on caffeine? Science says that earns you a treat. Get your AI-generated reward justification.",
  },
];

export function getPSEOPage(slug: string): PSEOPage | null {
  return PSEO_PAGES.find((p) => p.slug === slug) ?? null;
}
