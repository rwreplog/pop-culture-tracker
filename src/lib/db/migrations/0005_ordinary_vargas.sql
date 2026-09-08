CREATE TYPE "public"."accent_color" AS ENUM('blue', 'violet', 'emerald', 'amber');--> statement-breakpoint
CREATE TYPE "public"."font_family" AS ENUM('space-grotesk', 'bricolage-grotesque', 'manrope', 'sora');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "theme" "theme" DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "accent_color" "accent_color" DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "font_family" "font_family" DEFAULT 'space-grotesk' NOT NULL;