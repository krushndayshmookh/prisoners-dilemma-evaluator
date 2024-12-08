CREATE TABLE psp_strategies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_evaluated_at TIMESTAMP DEFAULT NULL,
    last_evaluation_time INTERVAL DEFAULT NULL,
    win_count INT DEFAULT 0,
    loss_count INT DEFAULT 0,
    evaluated_against_count INT DEFAULT 0
);