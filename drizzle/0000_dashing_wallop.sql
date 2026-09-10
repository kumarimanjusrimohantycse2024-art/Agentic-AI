CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_owner_time` ON `audit` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`job_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`hash` text NOT NULL,
	`summary` text NOT NULL,
	`report_key` text NOT NULL,
	`decision` text DEFAULT 'Unreviewed' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_candidates_owner_job` ON `candidates` (`owner`,`job_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_candidates_job_hash` ON `candidates` (`owner`,`job_id`,`hash`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_jobs_owner` ON `jobs` (`owner`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text DEFAULT 'My workspace' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`job_id` text NOT NULL,
	`name` text NOT NULL,
	`source_key` text NOT NULL,
	`original_key` text NOT NULL,
	`hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error` text,
	`lease_until` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_owner_status` ON `tasks` (`owner`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tasks_owner_job_hash` ON `tasks` (`owner`,`job_id`,`hash`);