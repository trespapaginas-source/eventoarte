CREATE TABLE `banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`subtitle` text,
	`cta_text` text,
	`cta_link` text,
	`image_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_desc` text,
	`created_at` integer DEFAULT strftime('%s', 'now') NOT NULL,
	`updated_at` integer DEFAULT strftime('%s', 'now') NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `occasions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `occasions_slug_unique` ON `occasions` (`slug`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`r2_key` text NOT NULL,
	`alt_text` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_occasions` (
	`product_id` integer NOT NULL,
	`occasion_id` integer NOT NULL,
	PRIMARY KEY(`product_id`, `occasion_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`occasion_id`) REFERENCES `occasions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`code` text NOT NULL,
	`category_id` integer,
	`short_desc` text,
	`long_desc` text,
	`price` real NOT NULL,
	`price_type` text DEFAULT 'desde' NOT NULL,
	`min_qty` integer DEFAULT 1 NOT NULL,
	`material` text,
	`colors` text,
	`dimensions` text,
	`weight` text,
	`lead_time` text,
	`customization` text,
	`active` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`featured_order` integer DEFAULT 0 NOT NULL,
	`seo_title` text,
	`seo_desc` text,
	`og_image_key` text,
	`created_at` integer DEFAULT strftime('%s', 'now') NOT NULL,
	`updated_at` integer DEFAULT strftime('%s', 'now') NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`quantity` integer,
	`event_date` text,
	`occasion` text,
	`message` text,
	`source` text,
	`status` text DEFAULT 'nueva' NOT NULL,
	`created_at` integer DEFAULT strftime('%s', 'now') NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT strftime('%s', 'now') NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT strftime('%s', 'now') NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);