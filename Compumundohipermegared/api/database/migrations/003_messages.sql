CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_low_id INT NOT NULL,
    user_high_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY conversations_pair_unique (user_low_id, user_high_id),
    CONSTRAINT conversations_distinct_users CHECK (user_low_id < user_high_id),
    CONSTRAINT fk_conversations_user_low
        FOREIGN KEY (user_low_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_user_high
        FOREIGN KEY (user_high_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_conversations_user_low (user_low_id),
    KEY idx_conversations_user_high (user_high_id),
    KEY idx_conversations_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    KEY idx_messages_conversation (conversation_id, created_at),
    KEY idx_messages_unread (conversation_id, sender_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
