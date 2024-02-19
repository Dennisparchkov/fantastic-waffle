CREATE DATABASE freeshare;

INSERT INTO user (id, free_share_status) VALUES (1, 'eligible');
INSERT INTO account(id, user_id) VALUES (1, 1);
