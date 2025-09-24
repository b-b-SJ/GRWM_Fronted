import React, { useState, useCallback } from "react";

export function usePost() {
  //토큰에서 유저 아이디를 반환할 수 ㅣㅆ어서 url에 유저 아이디 포함 안시켜도 된다는
  const [posts, setPosts] = useState([
    {
      postId: "12",
      //묶어서 줄 수 있는지 물어보기 -> 된대용 헤헤
      userId: "youyousangjong",
      userName: "유유상종",
      profileImage:
        "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
      content: {
        text: " oO(집가고 싶당..)",
        images: [
          "https://i.ibb.co/QFkg9D3q/2025020819375700-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
        ],
      },
      hashtags: ["#희한한화장실", "#힘줄까말까", "#똥:희희재밌다"],
      visibility: "public",
      likeCount: 0,
      commentCount: 0,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: null, // 없어도 되는 값은 null로 시작할 수 있습니다.
    },
    {
      postId: "21",
      //묶어서 줄 수 있는지 물어보기 -> 된대용 헤헤
      userId: "gyudong",
      userName: "",
      profileImage:
        "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
      content: {
        text: "소고기는 키친타월로 앞뒤로 꾹꾹 눌러서 핏기를 제거해 주고 먹기 좋은 크기로 썰어줍니다. 양파는 너무 얇지 않게 썰어주고 쪽파(대파)도 송송 썰어 줍니다. 분량의 양념을 넣고 잘 섞어줍니다. 달군 프라이팬에 식용유를 약간 두르고 소고기를 넣고 후추 톡톡 뿌려서 구워줍니다. 고기가 익으면 양파를 넣고 같이 볶아주세요. 섞어둔 양념장을 붓고 센 불에 끓여주다가 끓어오르면 중약불로 줄여서 졸여줍니다. 국물이 자박 자박해질 정도로 졸여주세요. 그릇에 밥을 담고 소고기를 올려줍니다. 가운데 계란 노른자를 올리고 쪽파를 뿌려서 완성해 주세요.",
        images: [
          "https://i.ibb.co/QFkg9D3q/2025020819375700-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
        ],
      },
      hashtags: ["#희한한화장실", "#힘줄까말까", "#똥:희희재밌다"],
      visibility: "public",
      likeCount: 0,
      commentCount: 0,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: null, // 없어도 되는 값은 null로 시작할 수 있습니다.
    },
  ]);

  // 아직 working on it
  {
    /**const getPostList = useCallback(async () => {
    setLoading(true);
    setError(null); // 이전 에러 초기화

    try {
      // 1. 성공 시나리오
      const data = await fetch(`/api//community-posts `, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }); //url 수정 필요할수도
      if (data.ok) {
        const posts = await data.json();
        setPosts(data);
      } else {
        console.error("불러오기를 실패했습니다");
        setPosts(posts);
      }
    } catch (error) {
      // 2. 실패 시나리오 (네트워크 에러 등)
      setError("데이터를 불러오는데 실패했습니다.");
      console.error(e); // 개발자는 콘솔에서 실제 에러 원인 파악
    } finally {
      // 3. 성공하든 실패하든 항상 마무리
      setLoading(false); // 로딩 상태를 확실하게 끝내줌
    }
  }, []); //여기엔 뭘 반환?

     */
  }

  const getUserSimpProfile = (userIdToFind) => {
    //community id로 들어올 가능성 농후하긴 함
    const matchingPost = posts.find((post) => post.userId === userIdToFind); //일치하는 거 가져옴
    if (matchingPost) {
      return {
        profileImage: matchingPost.profileImage,
        nickName: matchingPost.userName,
      };
    } else {
      return "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg";
    }
  }; //근데 생각해보니까 프로필 이미지만 가져올 게 아니라 찾는 김에 유저 정보 다 가져오는 게 나은데 왜 이렇게 햇지;

  //
  const getContent = (postIdToFind) => {
    const matchingPost = posts.find((post) => post.postId === postIdToFind);
    if (matchingPost) {
      return {
        content: matchingPost.content,
        hashtags: matchingPost.hashtags,
      };
    } else {
      return {
        content: {
          text: "움냐가되",
          images: [
            "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
            "https://i.ibb.co/QFkg9D3q/2025020819375700-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
          ],
        },
        hashtags: [
          "#저기엽죠?",
          "#제이름은",
          "#글라햄이고",
          "#저는동숲주민이어요",
        ],
      };
    }
  };
  //

  return {
    posts,
    getUserSimpProfile,
    getContent,
  };
}
