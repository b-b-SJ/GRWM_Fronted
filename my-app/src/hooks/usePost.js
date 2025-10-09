import React, { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
export function usePost() {
  const { getAuthHeaders } = useAuth();
  const [posts, setPosts] = useState([
    {
      postId: "12",

      user: {
        communityId: 4,
        nickname: "유유상종",
        profileImage:
          "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
      },
      content: {
        text: "새로 인테리어 공사 받은 우리집 화장실",
        images: [
          "https://i.ibb.co/QFkg9D3q/2025020819375700-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
        ],
      },
      hashtags: ["#글라햄일상"],
      visibility: "public",
      likeCount: 0,
      commentCount: 0,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: null, // 없어도 되는 값은 null로 시작할 수 있습니다.
    },
    {
      postId: "21",

      user: {
        communityId: 2,
        nickname: "규동",
        profileImage:
          "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/4686a67d2f6e39e1899d1e2afaff26ee1.jpg",
      },

      content: {
        text: "소고기는 키친타월로 앞뒤로 꾹꾹 눌러서 핏기를 제거해 주고 먹기 좋은 크기로 썰어줍니다. 양파는 너무 얇지 않게 썰어주고 쪽파(대파)도 송송 썰어 줍니다. 분량의 양념을 넣고 잘 섞어줍니다. 달군 프라이팬에 식용유를 약간 두르고 소고기를 넣고 후추 톡톡 뿌려서 구워줍니다. 고기가 익으면 양파를 넣고 같이 볶아주세요. 섞어둔 양념장을 붓고 센 불에 끓여주다가 끓어오르면 중약불로 줄여서 졸여줍니다. 국물이 자박 자박해질 정도로 졸여주세요. 그릇에 밥을 담고 소고기를 올려줍니다. 가운데 계란 노른자를 올리고 쪽파를 뿌려서 완성해 주세요.",
        images: [
          "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/ecf4b2fbf998f4d526ae6a5f446ebac61.jpg",
          "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/a41ddf83011bd73079c007d31a52218a1.jpg",
          "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/99aa5fbfb197d60e4c0ef06e7e3b838c1.jpg",
          "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/4686a67d2f6e39e1899d1e2afaff26ee1.jpg",
        ],
      },
      hashtags: ["#출처는", "#만개의", "#레시피"],
      visibility: "public",
      likeCount: 0,
      commentCount: 0,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: null,
    },
    {
      postId: "123",
      user: {
        communityId: 1,
        nickname: "가을이다~",
        profileImage:
          "https://cdn.mos.cms.futurecdn.net/7CfzWqwoHSzqtyQrfvnTwN-1200-80.jpg",
      },

      content: {
        text: "어느덧 벌써 가을이네요^^ 예쁘게 물든 나뭇잎들에 저 또한 훈훈한 미소가 지어집니다. 다들 건강하시고 행복하세요^^~",
        images: [
          "https://cdn.mos.cms.futurecdn.net/7CfzWqwoHSzqtyQrfvnTwN-1200-80.jpg",
        ],
      },
      hashtags: [""],
      visibility: "public",
      likeCount: 0,
      commentCount: 0,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: null,
    },
  ]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  //기본 타임라인에 뜰 게시글 부르는 거
  const getPostList = useCallback(async (page = 0, size = 30) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/community-posts?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("무슨 글을 썻는교", data);
        setPosts(data);

        console.log("게시물 목록 조회 성공");
      } else {
        console.error(" 게시물 목록 조회 실패:", response.status);
        setError("게시물을 불러오는데 실패했습니다");
      }
    } catch (error) {
      console.error(" 게시물 목록 조회 에러:", error);
      setError("네트워크 에러가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/community-posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(postData),
        }
      );
      if (response.ok) {
        const newPost = await response.json();
        setPosts((prevPosts) => [newPost, ...prevPosts]); // 새 게시물을 맨 위에 추가
        console.log("게시글 업로드 성공:", newPost);
        return newPost;
      } else {
        console.error("게시글 업로드에 실패했습니다");
      }
    } catch (error) {
      console.error("포스팅 업로드 에러", error);
    } finally {
    }
  }, []);

  //얘는 불러오는 단위 설정 필요함 - 새로 업데이트 된 거에도 포함
  const getUserPosts = useCallback(async (communityId, page = 0, size = 30) => {
    //확인 필요
    if (!communityId) {
      console.error("communityId 필요합니다");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      //특정 유저가 작성한 게시물 리스트
      const response = await fetch(
        `http://localhost:8080/api/community-posts/user/${communityId}?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("무슨 글을 썻는교", data);
        setPosts(data.postList);
      } else {
        console.error("게시글 조회에 실패했습니다");
      }
    } catch (error) {
      console.error("타임라인 조회 에러", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 게시물 수정
  const updatePost = useCallback(async (postId, postData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/community-posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(postData),
        }
      );

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.postId === postId ? updatedPost : post))
        );
        console.log(" 게시글 수정 성공");
        return updatedPost;
      } else {
        console.error(" 게시글 수정 실패:", response.status);
        setError("게시글 수정에 실패했습니다");
      }
    } catch (error) {
      console.error(" 게시글 수정 에러:", error);
      setError("네트워크 에러가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  // 게시물 삭제
  const deletePost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/community-posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.postId !== postId)
        );
        console.log("게시글 삭제 성공");
        return true;
      } else {
        console.error(" 게시글 삭제 실패:", response.status);
        setError("게시글 삭제에 실패했습니다");
        return false;
      }
    } catch (error) {
      console.error(" 게시글 삭제 에러:", error);
      setError("네트워크 에러가 발생했습니다");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts, // 게시물 배열
    loading, // 로딩 상태
    error, // 에러 메시지
    getPostList, // 전체 게시물 가져오기
    getUserPosts, // 특정 사용자 게시물 가져오기
    createPost, // 게시물 생성
    updatePost, // 게시물 수정
    deletePost, // 게시물 삭제
  };
}
