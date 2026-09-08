import { Target } from "lucide-react";

import { BackButton } from "@/components/layout/back-button";
import { PlaceholderScreen } from "@/components/layout/placeholder-screen";
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { auth } from "@/lib/auth";
import { getGoalsForUser } from "@/lib/services/goals/queries";

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PlaceholderScreen
        icon={Target}
        title="Your goals"
        description="Sign in to set and track goals."
      />
    );
  }

  const goals = await getGoalsForUser(session.user.id);
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-6">
      <BackButton fallbackHref="/profile" />
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Your goals</h1>
          <p className="text-muted-foreground text-sm">
            Targets to complete, tracked against your library automatically.
          </p>
        </div>
        <CreateGoalDialog currentYear={currentYear} />
      </div>

      {goals.length === 0 ? (
        <PlaceholderScreen
          icon={Target}
          title="No goals yet"
          description="Add a goal to start tracking progress toward it."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              id={goal.id}
              year={goal.year}
              target={goal.target}
              completed={goal.completed}
              mediaType={goal.mediaType}
              genre={goal.genre}
            />
          ))}
        </div>
      )}
    </div>
  );
}
