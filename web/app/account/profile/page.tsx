"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuth } from "@/lib/auth";
import { sanitizeText } from "@/lib/utils";

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
};

export default function ProfilePage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        if (!session) {
          setError("Not authenticated.");
          setLoading(false);
          return;
        }

        const supabaseUrl = typeof window !== 'undefined' 
          ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
              ? `http://${window.location.hostname}:54321`
              : 'http://127.0.0.1:54321')
          : 'http://127.0.0.1:54321';
        
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=id,username,display_name&limit=1`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const profileData = data[0];
            setProfile(profileData);
            setUsername(profileData.username || "");
            setDisplayName(profileData.display_name || "");
          } else {
            // Profile doesn't exist, create one
            const emailUsername = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
            const newProfile = {
              id: user.id,
              username: emailUsername,
              display_name: user.email?.split('@')[0] || '',
            };
            
            const createResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
              method: 'POST',
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
              },
              body: JSON.stringify(newProfile),
            });

            if (createResponse.ok) {
              const created = await createResponse.json();
              setProfile(created[0] || newProfile);
              setUsername(newProfile.username);
              setDisplayName(newProfile.display_name);
            } else {
              setError("Failed to create profile.");
            }
          }
        } else {
          setError("Failed to load profile.");
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  useEffect(() => {
    const stored = sessionStorage.getItem("auth_notice");
    if (stored) {
      setNotice(stored);
      sessionStorage.removeItem("auth_notice");
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !profile) return;
    
    setSaving(true);
    setError(null);
    setMessage(null);

    // Sanitize display name
    const sanitizedDisplayName = sanitizeText(displayName, 100);
    
    // Allow empty display name (will be stored as null)
    // No need to validate length here as sanitizeText handles it

    try {
      if (!session) {
        setError("Not authenticated.");
        setSaving(false);
        return;
      }

      const supabaseUrl = typeof window !== 'undefined' 
        ? (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
            ? `http://${window.location.hostname}:54321`
            : 'http://127.0.0.1:54321')
        : 'http://127.0.0.1:54321';
      
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            display_name: sanitizedDisplayName || null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProfile(data[0]);
          setMessage("Profile updated successfully!");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
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
          <span className="text-sm font-semibold">Email</span>
          <Input
            type="email"
            value={user?.email || ""}
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
