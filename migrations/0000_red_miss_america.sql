CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`room_id` int,
	`session_id` int,
	`nickname` text,
	`is_public` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`college_code` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`max_participants` int NOT NULL DEFAULT 50,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `chat_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `colleges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`confession_id` int,
	`session_id` int,
	`nickname` text,
	`is_approved` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `confessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`college_code` text NOT NULL,
	`session_id` int,
	`nickname` text,
	`is_approved` boolean NOT NULL DEFAULT false,
	`is_anonymous` boolean NOT NULL DEFAULT true,
	`likes` int NOT NULL DEFAULT 0,
	`comment_count` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT now()S,
	`updated_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `confessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `direct_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`from_session_id` int,
	`to_session_id` int,
	`status` text NOT NULL DEFAULT ('pending'),
	`admin_note` text,
	`created_at` datetime NOT NULL DEFAULT now()S,
	`updated_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `direct_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`confession_id` int,
	`session_id` int,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`price` int NOT NULL,
	`created_by_user_id` int,
	`is_active` boolean NOT NULL DEFAULT true,
	`features` json,
	`duration` int,
	`created_at` datetime NOT NULL DEFAULT now()S,
	`updated_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `marketplace_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_token` text NOT NULL,
	`user_id` int,
	`college_code` text,
	`nickname` text,
	`daily_confession_count` int NOT NULL DEFAULT 0,
	`last_reset_date` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `token_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` int,
	`type` text NOT NULL,
	`amount` int NOT NULL,
	`description` text NOT NULL,
	`related_item_id` varchar(191),
	`payment_method` text,
	`payment_reference` text,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `token_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` int,
	`balance` int NOT NULL DEFAULT 0,
	`total_earned` int NOT NULL DEFAULT 0,
	`total_spent` int NOT NULL DEFAULT 0,
	`updated_at` datetime NOT NULL DEFAULT now()S,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `user_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL DEFAULT ('user'),
	`college_id` int,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_idx` UNIQUE(`college_id`,`role`)
);
--> statement-breakpoint
CREATE TABLE `vip_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` int,
	`membership_type` text NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` datetime,
	`purchased_at` datetime NOT NULL DEFAULT now()S,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `vip_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vip_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` int,
	`marketplace_item_id` int,
	`tokens_spent` int NOT NULL,
	`status` text NOT NULL DEFAULT ('active'),
	`expires_at` datetime,
	`purchased_at` datetime NOT NULL DEFAULT now()S,
	`created_at` datetime NOT NULL DEFAULT now()S,
	CONSTRAINT `vip_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_room_id_chat_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_confession_id_confessions_id_fk` FOREIGN KEY (`confession_id`) REFERENCES `confessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `confessions` ADD CONSTRAINT `confessions_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `direct_messages` ADD CONSTRAINT `direct_messages_from_session_id_sessions_id_fk` FOREIGN KEY (`from_session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `direct_messages` ADD CONSTRAINT `direct_messages_to_session_id_sessions_id_fk` FOREIGN KEY (`to_session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_confession_id_confessions_id_fk` FOREIGN KEY (`confession_id`) REFERENCES `confessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplace_items` ADD CONSTRAINT `marketplace_items_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `token_transactions` ADD CONSTRAINT `token_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `token_transactions` ADD CONSTRAINT `token_transactions_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_tokens` ADD CONSTRAINT `user_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_tokens` ADD CONSTRAINT `user_tokens_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_college_id_colleges_id_fk` FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_memberships` ADD CONSTRAINT `vip_memberships_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_memberships` ADD CONSTRAINT `vip_memberships_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_purchases` ADD CONSTRAINT `vip_purchases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_purchases` ADD CONSTRAINT `vip_purchases_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vip_purchases` ADD CONSTRAINT `vip_purchases_marketplace_item_id_marketplace_items_id_fk` FOREIGN KEY (`marketplace_item_id`) REFERENCES `marketplace_items`(`id`) ON DELETE no action ON UPDATE no action;