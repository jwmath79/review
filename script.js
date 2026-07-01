const lesson = window.lessonData;

document.getElementById("lesson-title").textContent = lesson.title;
document.getElementById("lesson-subtitle").textContent = lesson.subtitle;

const preArea = document.getElementById("pre-question-list");
const reviewArea = document.getElementById("review-question-list");

function renderPreQuestions() {
  preArea.innerHTML = lesson.questions.map(q => `
    <div class="pre-question-card">
      <div class="question-head">
        <div>
          <h3>${q.number}번. ${q.title}</h3>
          <p class="meta">단원: ${q.unit} · 난이도: ${q.difficulty}</p>
        </div>
        <span class="question-status">수업 전 공개</span>
      </div>

      <div class="image-box">
        <img src="${q.problemImage}" alt="${q.number}번 문제" class="problem-image">
      </div>

      <div class="try-box">
        <strong>수업 전 할 일</strong>
        <ul>
          ${q.checklist.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </div>

      <details class="answer-box">
        <summary>정답 확인</summary>
        <p>정답: ${q.answer}</p>
      </details>
    </div>
  `).join("");
}

function renderReviewQuestions() {
  reviewArea.innerHTML = lesson.questions.map(q => `
    <div class="question-card">
      <h3>${q.number}번. ${q.title}</h3>
      <p class="meta">단원: ${q.unit} · 난이도: ${q.difficulty}</p>

      <details class="review-box">
        <summary>심정우T 손풀이 보기</summary>
        ${
          q.handwrittenImage
            ? `<div class="image-box"><img src="${q.handwrittenImage}" alt="${q.number}번 손풀이" class="problem-image"></div>`
            : `<p>수업 후 이곳에 손풀이 이미지를 추가합니다.</p>`
        }
      </details>

      <details class="review-box">
        <summary>단계별 풀이 보기</summary>
        ${q.steps.map(step => `
          <h4>${step.title}</h4>
          <p>${step.content}</p>
        `).join("")}
      </details>

      <details class="review-box">
        <summary>수업 영상 보기</summary>
        ${
          q.videoUrl
            ? `<p><a href="${q.videoUrl}" target="_blank">${q.videoTime ? q.videoTime + "부터 보기" : "영상 보기"}</a></p>`
            : `<p>수업 후 영상 링크와 문항별 시작 시간을 이곳에 추가합니다.</p>`
        }
      </details>

      <details class="review-box">
        <summary>변형문제 보기</summary>
        ${
          q.variationImage
            ? `<div class="image-box"><img src="${q.variationImage}" alt="${q.number}번 변형문제" class="problem-image"></div>`
            : `<p>수업 후 같은 풀이 흐름으로 연습할 변형문제를 추가합니다.</p>`
        }
      </details>
    </div>
  `).join("");
}

renderPreQuestions();
renderReviewQuestions();
