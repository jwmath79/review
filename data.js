window.lessonData = {
  title: "동인고1 공통수학1",
  subtitle: "기말 대비 복습 페이지",
  lessonVideoUrl: "",
  questions: [
    {
      number: 1,
      title: "실근 조건과 판별식",
      unit: "이차방정식",
      difficulty: "중",
      problemImage: "assets/problems/q01.png",
      answer: "⑤ ㄱ, ㄴ, ㄷ",
      handwrittenImage: "",
      videoTime: "",
      steps: [
        {
          title: "1단계. 수업에서 먼저 본 것",
          content: "이 문제는 계산보다 먼저 세 점과 내분점의 위치를 좌표로 정리하는 것이 핵심입니다."
        },
        {
          title: "2단계. 조건 해석",
          content: "세 선분 OA, AB, BC를 같은 비율로 내분한다는 조건을 이용해 P, Q, R의 좌표를 각각 m, n으로 표현합니다."
        },
        {
          title: "3단계. 풀이의 첫 줄",
          content: "먼저 P, Q, R의 좌표를 정리하고, 세 점을 지나는 원의 방정식을 세우는 것에서 출발합니다."
        },
        {
          title: "4단계. 핵심 전개",
          content: "보기 ㄱ, ㄴ, ㄷ을 각각 좌표와 원의 방정식에 대입해 확인합니다. 특히 ㄷ은 원이 x축과 만나는 두 점 사이의 거리를 이용해 비율을 정리합니다."
        },
        {
          title: "5단계. 실수 포인트",
          content: "내분점의 좌표를 잡을 때 m과 n의 위치를 바꾸면 이후 계산이 모두 틀어질 수 있습니다. 또한 ㄷ에서는 x축과 만나는 두 점의 거리 조건을 원의 방정식과 연결해야 합니다."
        }
      ]
    },
    {
      number: 2,
      title: "원주각과 원의 중심",
      unit: "도형의 방정식",
      difficulty: "중상",
      problemImage: "assets/problems/q02.png",
      answer: "14",
      handwrittenImage: "",
      videoTime: "",
      steps: [
        {
          title: "1단계. 수업에서 먼저 본 것",
          content: "이 문제는 점 P를 직접 구하는 문제가 아니라, ∠APB=45°라는 조건을 이용해 원의 중심 C가 어디에 있을 수 있는지를 찾는 문제입니다."
        },
        {
          title: "2단계. 조건 해석",
          content: "호 AB에 대한 원주각이 45°이므로, 같은 호 AB에 대한 중심각 ∠ACB는 90°입니다. 따라서 삼각형 ABC는 CA=CB인 직각이등변삼각형입니다."
        },
        {
          title: "3단계. 반지름 구하기",
          content: "두 점 A(-9,-1), B(3,5) 사이의 거리는 6√5입니다. 반지름을 r이라 하면 (6√5)²=r²+r²이므로 r=3√10입니다."
        },
        {
          title: "4단계. 중심 C가 놓이는 직선 찾기",
          content: "원의 중심 C는 선분 AB의 수직이등분선 위에 있습니다. 선분 AB의 중점은 M(-3,2), AB의 기울기는 1/2이므로 수직이등분선의 기울기는 -2입니다."
        },
        {
          title: "5단계. 중심 C의 좌표 결정",
          content: "수직이등분선 위의 점 C를 (a, -2a-4)로 두고, B(3,5)가 원 위의 점이라는 조건을 이용해 가능한 중심을 구합니다."
        },
        {
          title: "6단계. 정답 도출",
          content: "가능한 중심은 C(0,-4), C(-6,8)이고, 각각 OC=4, OC=10입니다. 따라서 모든 k값의 합은 4+10=14입니다."
        }
      ]
    }
  ]
};
