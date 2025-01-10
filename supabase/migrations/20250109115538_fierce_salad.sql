/*
  # Create transcriptions schema
  
  1. New Tables
    - `transcriptions`
      - `id` (uuid, primary key)
      - `video_id` (text, YouTube video ID)
      - `text` (text, transcribed text)
      - `status` (text, transcription status)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  text text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transcriptions"
  ON transcriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transcriptions"
  ON transcriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);