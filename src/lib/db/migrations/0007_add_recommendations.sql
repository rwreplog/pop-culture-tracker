ALTER TYPE "public"."notification_type" ADD VALUE 'recommendation';--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recommendations_recommender_id_recipient_id_media_id_unique" UNIQUE("recommender_id","recipient_id","media_id"),
	CONSTRAINT "recommendations_no_self_recommendation" CHECK ("recommendations"."recommender_id" <> "recommendations"."recipient_id")
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "recommendation_id" uuid;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recommender_id_users_id_fk" FOREIGN KEY ("recommender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recommendations_recipient_id_idx" ON "recommendations" USING btree ("recipient_id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recommendation_id_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE cascade ON UPDATE no action;