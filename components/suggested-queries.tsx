import { motion } from "framer-motion";
import { Button } from "./ui/button";

export const SuggestedQueries = ({
  handleSuggestionClick,
}: {
  handleSuggestionClick: (suggestion: string) => void;
}) => {
  const categorizedQueries = [
    {
      category: "Revenue",
      queries: [
        { desktop: "What is my revenue YTD?", mobile: "Revenue YTD" },
        {
          desktop: "What is my revenue by month this year?",
          mobile: "Revenue By Month",
        },
        {
          desktop: "What is my revenue last quarter?",
          mobile: "Revenue Last Quarter",
        },
      ],
    },
    {
      category: "Membership",
      queries: [
        {
          desktop:
            "Average total time as a member for each membership category",
          mobile: "Average time as member",
        },
        {
          desktop: "Top 10 members with the longest total membership duration",
          mobile: "Top members",
        },
        {
          desktop: "Top 10 memberships with the most subscribers",
          mobile: "Highest selling memberships",
        },
      ],
    },
    {
      category: "Events",
      queries: [
        {
          desktop:
            "Which sport type has the highest number of scheduled events?",
          mobile: "Sport Type Scheduled Events",
        },
        {
          desktop: "Which event type has the highest attendance?",
          mobile: "Highest Attended Events",
        },
      ],
    },
    {
      category: "Clients",
      queries: [
        {
          desktop: "What is the distribution of clients by time zone?",
          mobile: "Clients by Timezone",
        },
        {
          desktop:
            "What percentage of clients have logged in within the past 30 days?",
          mobile: "Percent of Clients Who Logged In - Last 30 Days",
        },
      ],
    },
  ];

  // Define Nexus logo color as a CSS class or inline style
  const nexusLogoColor = "text-[#00C1FF]"; // Replace with the actual Nexus logo color (e.g., #1F2937)

  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto"
    >
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
        Suggested questions:
      </h2>
      {categorizedQueries.map((category, catIndex) => (
        <div key={catIndex} className="mb-6">
          <h3 className={`text-md sm:text-lg font-bold ${nexusLogoColor} mb-2`}>
            {category.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {category.queries.map((query, queryIndex) => (
              <Button
                key={`${catIndex}-${queryIndex}`}
                className="border"
                type="button"
                variant="outline"
                onClick={() => handleSuggestionClick(query.desktop)}
              >
                <span className="sm:hidden">{query.mobile}</span>
                <span className="hidden sm:inline">{query.desktop}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};
