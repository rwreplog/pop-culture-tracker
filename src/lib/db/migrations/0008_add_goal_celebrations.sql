ALTER TYPE "public"."notification_type" ADD VALUE 'goal_achieved';--> statement-breakpoint
ALTER TABLE "goals" ADD COLUMN "achieved_notified_at" timestamp;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "goal_id" uuid;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;