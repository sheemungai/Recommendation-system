import { useState, useEffect } from 'react';
import { getMyProfile } from '../api/students';

export const useProfileCheck = () => {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      await getMyProfile();
      setHasProfile(true);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setHasProfile(false);
        setError('PROFILE_NOT_FOUND');
      } else {
        setError('Failed to check profile');
        console.error('Profile check error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { hasProfile, loading, error, checkProfile };
};