const lesson = window.lessonData;

document.getElementById("lesson-title").textContent = lesson.title;
document.getElementById("lesson-subtitle").textContent = lesson.subtitle;

const numberNav = document.getElementById("question-number-nav");
const currentArea = document.getElementById("current-question-area");

const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");

const videoCard = document.getElementById("lesson-video-card");
const videoArea = document.getElementById("lesson-video-area");

let currentIndex = 0;
const GROUP_SIZE = 10;

function getYouTubeEmbedUrl(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.includes("/embed/")) {
        return url;
      }

      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch (error) {
    return "";
  }
}

function renderLessonVideo() {
  const embedUrl = getYouTubeEmbedUrl(lesson.lessonVideoUrl);

  if (!embedUrl) {
    videoCard.style.display = "none";
    return;
  }

  videoCard.style.display = "block";

  videoArea.innerHTML = `
    <div class="video-wrapper">
      <iframe
        src="${embedUrl}"
        title="수업 전체 영상"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

function getCurrentGroupStart() {
  return Math.floor(currentIndex / GROUP_SIZE) * GROUP_SIZE;
}

function getGroupCount() {
  return Math.ceil(lesson.questions.length / GROUP_SIZE);
}

function renderNumberButtons() {
  const total = lesson.questions.length;
  const currentGroupStart = getCurrentGroupStart();
  const currentGroupEnd = Math.min(currentGroupStart + GROUP_SIZE, total);

  const groupButtons = Array.from({ length: getGroupCount() }, (_, groupIndex) => {
    const start = groupIndex * GROUP_SIZE;
    const end = Math.min(start + GROUP_SIZE, total);
    const isActive = currentIndex >= start && currentIndex < end;

    return `
      <button 
        class="question-range-button ${isActive ? "active" : ""}" 
        onclick="goToQuestion(${start})"
      >
        ${lesson.questions[start].number}~${lesson.questions[end - 1].number}번
      </button>
    `;
  }).join("");

  const numberButtons = lesson.questions
    .slice(currentGroupStart, currentGroupEnd)
    .map((q, offset) => {
      const index = currentGroupStart + offset;

      return `
        <button 
          class="question-number-button ${index === currentIndex ? "active" : ""}" 
          onclick="goToQuestion(${index})"
        >
          ${q.number}번
        </button>
      `;
    }).join("");

  numberNav.innerHTML = `
    <div class="question-current-status">
      현재 ${lesson.questions[currentIndex].number}번 / 총 ${total}문항
    </div>

    <div class="question-range-nav">
      ${groupButtons}
    </div>

    <div class="question-number-list">
      ${numberButtons}
    </div>
  `;
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
      </div>

      <div class="section-divider">
        <span>수업 전</span>
      </div>

      <div class="image-box">
        <img src="${q.problemImage}" alt="${q.number}번 문제" class="problem-image">
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

        <div class="steps-wrapper">
          ${(q.steps || []).map(step => `
            <div class="step-card">
              <h4>${step.title}</h4>
              <p>${step.content}</p>
            </div>
          `).join("")}
        </div>
      </details>

      <details class="review-box">
        <summary>수업 영상 보기</summary>
        ${
          q.videoTime
            ? `<p>이 문항은 전체 영상의 <strong>${q.videoTime}</strong> 지점부터 복습하면 좋습니다.</p>`
            : `<p>위의 수업 전체 영상을 계속 재생하면서 이 문항의 풀이 흐름을 함께 확인합니다.</p>`
        }
      </details>

    </div>
  `;

  renderNumberButtons();
  updateSideButtons();
}

function updateSideButtons() {
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === lesson.questions.length - 1;
}

function goToQuestion(index) {
  const currentScrollY = window.scrollY;

  currentIndex = index;
  renderCurrentQuestion();

  requestAnimationFrame(() => {
    window.scrollTo({
      top: currentScrollY,
      behavior: "auto"
    });
  });
}

prevButton.addEventListener("click", () => {
  if (currentIndex > 0) {
    goToQuestion(currentIndex - 1);
  }
});

nextButton.addEventListener("click", () => {
  if (currentIndex < lesson.questions.length - 1) {
    goToQuestion(currentIndex + 1);
  }
});

renderLessonVideo();
renderCurrentQuestion();
