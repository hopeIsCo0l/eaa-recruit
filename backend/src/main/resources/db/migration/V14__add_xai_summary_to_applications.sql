-- V14: Store Qwen-generated XAI reason text on the application row
--      so the frontend can display it without re-calling the AI service.

ALTER TABLE applications ADD COLUMN xai_summary TEXT;
