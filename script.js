const lesson = window.lessonData;

document.getElementById("lesson-title").textContent = lesson.title;
document.getElementById("lesson-subtitle").textContent = lesson.subtitle;

const numberNav = document.getElementById("question-number-nav");
const currentArea = document.getElementById("current-question-area");

const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");

let currentIndex = 0;

function renderNumberButtons() {
  numberNav.innerHTML = lesson.questions.map((q, index) => `
    <button 
      class="question-number-button ${index === currentIndex ? "active" : ""}" 
      onclick="goToQuestion(${index})"
    >
      ${q.number}번
    </button>
  `).join("");
}

function renderCurrentQuestion() {
  const q = lesson.questions[currentIndex];

  currentArea.innerHTML = `
    <div class="single-question-card">

      <div class="question-head">
        <div>
          <span class="badge">선택 문항</span>
          <h2>${q.number}번. ${q.title}</h2>
          <p class="meta">단원: ${q.unit} · 난이도: ${q.difficulty}</p>
        </div>
        <span class="question-status">수업 전 공개</span>
      </div>

      <div class="section-divider">
        <span>수업 전</span>
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

      <div class="section-divider">
        <span>수업 후</span>
      </div>

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
  `;

  renderNumberButtons();
  updateSideButtons();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function updateSideButtons() {
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === lesson.questions.length - 1;
}

function goToQuestion(index) {
  currentIndex = index;
  renderCurrentQuestion();
}

prevButton.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentQuestion();
  }
});

nextButton.addEventListener("click", () => {
  if (currentIndex < lesson.questions.length - 1) {
    currentIndex++;
    renderCurrentQuestion();
  }
});

renderCurrentQuestion();
