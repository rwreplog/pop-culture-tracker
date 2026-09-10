ALTER TABLE "media" ADD COLUMN "series_id" uuid;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "series_position" integer;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_series_id_media_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;