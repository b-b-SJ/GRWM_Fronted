import React from "react";

export function useProfile() {
  const [profile, setProfile] = [
    {
      User: {
        userId: "gilgyu",
        userName: "길규",
        profileImage:
          "https://chiikawamarket.jp/cdn/shop/files/4979432079006_4.jpg?v=1733821593&width=1445",
      },
      bio: "할머니한테 할을 뺏으면 그냥 머니, 머니머니해도 난 외할머니",
      bannerImage:
        "https://i.pinimg.com/736x/74/57/b5/7457b5852852da55b03570eef8253722.jpg",
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      achievedBadgeCount: 0,
      pinnedPostId: null,
    },
    {
      User: {
        userId: "gyudong",
        userName: "규동 먹고 싶다",
        profileImage:
          "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/4686a67d2f6e39e1899d1e2afaff26ee1.jpg",
      },
      bio: "규동은 한국어로 일본식 소고기덮밥, 제 고정 게시물 확인하시고 자격증 정보도 얻어가세요^^",
      bannerImage:
        "https://recipe1.ezmember.co.kr/cache/recipe/2021/12/13/7f00d49c3ed49e8b773aecb4c4795a931.jpg",
      postCount: 1,
      followerCount: 0,
      followingCount: 0,
      achievedBadgeCount: 0,
      pinnedPostId: "21",
    },
    {
      User: {
        userId: "youyousangjong",
        userName: "유유상종",
        profileImage:
          "https://i.ibb.co/FbWvz1bB/2025030118134100-02-CB906-EA538-A35643-C1-E1484-C4-B947-D.jpg",
      },
      bio: "안냥하세여, 저는 글라햄이구 동물의 숲 주민이에여..저는 느끼주민인데여...디게디게 기여우여ㅎㅎ",
      bannerImage:
        "https://static0.srcdn.com/wordpress/wp-content/uploads/2022/08/Every-Animal-Crossing-Villager-With-An-In-Game-Family.jpg",
      postCount: 1,
      followerCount: 0,
      followingCount: 0,
      achievedBadgeCount: 0,
      pinnedPostId: null,
    },
  ];
}
