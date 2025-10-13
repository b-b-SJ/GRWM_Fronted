import React, { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export function useImgConverter() {
  const { getAuthHeaders } = useAuth();
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // 이미지 1개 업로드
  const getImageUrl = useCallback(
    async (imageFile) => {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const response = await fetch(
          `http://localhost:8080/api/profile/upload-image`,
          {
            method: "POST",
            mode: "cors", // CORS 모드 명시
            credentials: "include", // 쿠키/인증 포함
            headers: {
              ...getAuthHeaders(),
            },
            body: formData,
          }
        );

        if (response.ok) {
          const imageUrl = await response.text();
          console.log("받은 URL:", imageUrl);
          return imageUrl;
        } else {
          console.error("업로드 실패:", response.status);
          return null;
        }
      } catch (error) {
        console.error("업로드 에러:", error);
        return null;
      }
    },
    [getAuthHeaders]
  );

  // 여러개 용
  const getMultipleImageUrls = useCallback(
    async (imageFiles) => {
      console.log("📤 여러 개 업로드:", imageFiles.length, "개");
      setUploading(true);
      setError(null);

      const urls = [];

      // 하나씩 순서대로 업로드
      for (let i = 0; i < imageFiles.length; i++) {
        console.log(`--- ${i + 1}/${imageFiles.length} ---`);
        const url = await getImageUrl(imageFiles[i]);

        if (url) {
          urls.push(url);
        }
      }

      console.log("최종 결과:", urls);
      setUploading(false);
      return urls;
    },
    [getImageUrl]
  );

  return {
    getImageUrl, // 1개용
    getMultipleImageUrls, // 여러 개용 ✅
    isUploading,
    error,
  };
}
