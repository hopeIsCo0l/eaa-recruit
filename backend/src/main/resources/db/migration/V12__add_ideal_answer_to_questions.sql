-- V12: Add ideal_answer text column for SHORT_ANSWER questions

ALTER TABLE questions ADD COLUMN ideal_answer TEXT;

-- Backfill existing SHORT_ANSWER questions with reasonable ideal answers
UPDATE questions SET ideal_answer = 'The GIL (Global Interpreter Lock) prevents multiple native threads from executing Python bytecodes simultaneously. It makes CPU-bound multi-threaded programs effectively single-threaded.'
WHERE type = 'SHORT_ANSWER' AND question_text LIKE '%GIL%';

UPDATE questions SET ideal_answer = 'Vertical scaling means adding more resources (CPU, RAM) to a single machine. Horizontal scaling means adding more machines to distribute the load. Horizontal scaling offers better fault tolerance and is preferred for web applications.'
WHERE type = 'SHORT_ANSWER' AND question_text LIKE '%horizontal%vertical%';
