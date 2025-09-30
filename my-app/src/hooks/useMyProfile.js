// hooks/useMyProfile.js
import { useState, useEffect, useCallback } from "react";
import { myProfile as mockMyProfile } from "../mocks/profileData";

const USE_MOCK_DATA = process.env.NODE_ENV === "development";

export function useMyProfile() {
  const [myProfile, setMyProfile] = useState(null);

  const fetchMyProfile = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setTimeout(() => setMyProfile(mockMyProfile), 500);
      return;
    }

    try {
      // 이 api 없긴 함
      const response = await fetch("/api/users/me/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("내 프로필 조회 실패");
      const data = await response.json();
      setMyProfile(data);
    } catch (err) {
      /* ... 에러 처리 ... */
    }
  }, []);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  return { myProfile, loading, error, refetch: fetchMyProfile };
}
