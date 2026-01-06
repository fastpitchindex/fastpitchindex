"use client";

import { FormEvent, useEffect, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
// TODO: Import supabase client when auth is implemented
// import { supabaseClient } from "@/lib/supabaseClient";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Load profile from Supabase
    // const loadProfile = async () => {
    //   setLoading(true);
    //   setError(null);
    //   setMessage(null);
    //   // ... load profile logic
    //   setLoading(false);
    // };
    // loadProfile();
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("auth_notice");
    if (stored) {
      setNotice(stored);
      sessionStorage.removeItem("auth_notice");
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    // TODO: Update profile in Supabase
    setSaving(false);
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>No profile found.</p>;
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-2xl font-semibold">Profile</h2>
      {notice ? <p className="text-sm text-green-700">{notice}</p> : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Username</span>
          <Input
            type="text"
            value={username}
            readOnly
            className="bg-muted text-muted-foreground"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Display name</span>
          <Input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
