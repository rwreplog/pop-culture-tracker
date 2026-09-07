CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"addressee_id" uuid NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_requester_id_addressee_id_unique" UNIQUE("requester_id","addressee_id"),
	CONSTRAINT "friendships_no_self_friendship" CHECK ("friendships"."requester_id" <> "friendships"."addressee_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "handle" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
UPDATE "users" AS u
SET "handle" = sub.handle
FROM (
	SELECT
		id,
		base || CASE WHEN rn = 1 THEN '' ELSE '-' || rn::text END AS handle
	FROM (
		SELECT
			id,
			left(COALESCE(NULLIF(regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9]+', '-', 'g'), ''), 'user'), 30) AS base,
			row_number() OVER (
				PARTITION BY left(COALESCE(NULLIF(regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9]+', '-', 'g'), ''), 'user'), 30)
				ORDER BY created_at
			) AS rn
		FROM "users"
		WHERE "handle" IS NULL
	) numbered
) sub
WHERE u.id = sub.id;--> statement-breakpoint
ALTER TABLE "lists" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "friendships_requester_id_idx" ON "friendships" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "friendships_addressee_id_idx" ON "friendships" USING btree ("addressee_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_handle_unique" UNIQUE("handle");