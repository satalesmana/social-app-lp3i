// lib/types.ts

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
};

export type Post = {
  id: number;
  content: string;
  created_at: string;
  profiles: Profile;
  image_url?: string;
};