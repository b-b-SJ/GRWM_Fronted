import React, { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

export function useImgConverter() {
  const { getAuthHeaders } = useAuth();
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  //api 주소 상대 경로
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

  // 이미지 1개 업로드
  const getImageUrl = useCallback(
    async (imageFile) => {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        //FormData용 헤더
        const authHeaders = getAuthHeaders();
        const headersForFormData = {
          Authorization: authHeaders["Authorization"],
          // Content-Type 제외
        };

        const response = await fetch(
          `${API_BASE_URL}/api/profile/upload-image`,
          {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: headersForFormData, //수정된 헤더 사용
            body: formData,
          }
        );

        if (response.ok) {
          const imageUrl = await response.text();
          console.log("받은 URL:", imageUrl);
          return imageUrl;
        } else {
          const errorText = await response.text();
          console.error("업로드 실패:", response.status, errorText);
          setError(`업로드 실패: ${response.status}`);
          return null;
        }
      } catch (error) {
        console.error("업로드 에러:", error);
        setError(error.message);
        return null;
      }
    },
    [getAuthHeaders]
  );

  // 여러개 용
  const getMultipleImageUrls = useCallback(
    async (imageFiles) => {
      console.log("여러 개 업로드:", imageFiles.length, "개");
      setUploading(true);
      setError(null);

      const urls = [];

      // 하나씩 순서대로 업로드
      for (let i = 0; i < imageFiles.length; i++) {
        console.log(`--- ${i + 1}/${imageFiles.length} 업로드 중 ---`);
        const url = await getImageUrl(imageFiles[i]);

        if (url) {
          urls.push(url);
          console.log(`${i + 1}번째 이미지 업로드 성공`);
        } else {
          console.error(`${i + 1}번째 이미지 업로드 실패`);
        }
      }

      console.log("이미지 전부:", urls);
      setUploading(false);
      return urls;
    },
    [getImageUrl]
  );

  return {
    getImageUrl, // 1개용
    getMultipleImageUrls, // 여러 개용
    isUploading,
    error,
  };
}
