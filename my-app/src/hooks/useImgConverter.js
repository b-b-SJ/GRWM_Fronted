import React, { useState } from "react";
import { useAuth } from "./AuthContext";
export function useImgConverter() {
  const { getAuthHeaders } = useAuth();
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  {
    /* 이미지 파일 = 이미지 파일 형태로 그대로  */
  }
  const getImageUrl = useCallback(async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/upload-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(postData), //이게 맞느지 모르겟슨..이미지파일 형태라 아마 아닐듯
        }
      );
      if (response.ok) {
        const imageUrl = await response.text();

        console.log("이미지 업로드 성공:", imageUrl);
        return imageUrl;
      } else {
        console.error("이미지 업로드에 실패했습니다");
      }
    } catch (error) {
      console.error("이미지 업로드 에러", error);
      setError("실패~ 따라란따라란~");
    } finally {
      setUploading(false);
    }
  }, []);

  return getImageUrl;
}
