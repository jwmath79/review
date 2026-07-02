const params = new URLSearchParams(window.location.search);
const classId = params.get("classId") || "dongin-g1-final";
const sessionId = params.get("sessionId") || "01";

const lessonTitleEl = document.getElementById("lesson-title");
const lessonSubtitleEl = document.getElementById("lesson-subtitle");
const numberNav = document.getElementById("question-number-nav");
const currentArea = document.getElementById("current-question-area");

const prevButton = document.getElementById("prev-question");
const nextButton = document.getElementById("next-question");

const videoCard = document.getElementById("lesson-video-card");
const videoArea = document.getElementById("lesson-video-area");
const backToClass = document.getElementById("back-to-class");

let lesson = null;
let currentIndex = 0;
let renderedLessonVideoUrl = "";
const GROUP_SIZE = 10;

backToClass.href = `class.html?classId=${encodeURIComponent(classId)}`;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasContent(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function callApi(query) {
  return new Promise((resolve, reject) => {
    const callbackName = `jmCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const searchParams = new URLSearchParams({
      ...query,
      callback: callbackName
    });

    const script = document.createElement("script");
    script.src = `${window.JM_CONFIG.apiBaseUrl}?${searchParams.toString()}`;

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("데이터를 불러오는 시간이 너무 오래 걸립니다."));
    }, 10000);

    function cleanup() {
      clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("데이터를 불러오지 못했습니다."));
    };

    document.body.appendChild(script);
  });
}

function getYouTubeEmbedUrl(url) {
  if (!hasContent(url)) return "";

  const rawUrl = String(url).trim();

  try {
    const parsedUrl = new URL(rawUrl);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      if (parsedUrl.pathname.includes("/embed/")) {
        return rawUrl;
      }

      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return rawUrl;
  } catch (error) {
    return "";
  }
}

function renderLessonVideo() {
  const embedUrl =
    getYouTubeEmbedUrl(lesson?.videoUrl) ||
    getYouTubeEmbedUrl(lesson?.lessonVideoUrl);

  if (!embedUrl) {
    videoCard.style.display = "none";
    videoArea.innerHTML = "";
    renderedLessonVideoUrl = "";
    return;
  }

  videoCard.style.display = "block";

  if (renderedLessonVideoUrl === embedUrl) {
    return;
  }

  renderedLessonVideoUrl = embedUrl;

  videoArea.innerHTML = `
    <div class="video-wrapper">
      <iframe
        src="${escapeHtml(embedUrl)}"
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

  if (total === 0) {
    numberNav.innerHTML = `
      <div class="question-current-status">
        등록된 문항이 없습니다.
      </div>
    `;
    return;
  }

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
        ${escapeHtml(lesson.questions[start].number)}~${escapeHtml(lesson.questions[end - 1].number)}번
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
          ${escapeHtml(q.number)}번
        </button>
      `;
    }).join("");

  numberNav.innerHTML = `
    <div class="question-current-status">
      현재 ${escapeHtml(lesson.questions[currentIndex].number)}번 / 총 ${total}문항
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
  if (!lesson || !lesson.questions || lesson.questions.length === 0) {
    currentArea.innerHTML = `
      <div class="single-question-card">
        <span class="badge">문항 없음</span>
        <h2>등록된 문항이 없습니다.</h2>
        <p class="meta">구글시트 Questions 탭에 문항을 추가해주세요.</p>
      </div>
    `;

    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  const q = lesson.questions[currentIndex];
  const afterClassArea = renderAfterClassArea(q);

  currentArea.innerHTML = `
    <div class="single-question-card">

      <div class="question-head">
        <div>
          <span class="badge">선택 문항</span>
          <h2>${escapeHtml(q.number)}번. ${escapeHtml(q.title)}</h2>
          <p class="meta">단원: ${escapeHtml(q.unit)} · 난이도: ${escapeHtml(q.difficulty)}</p>
        </div>
      </div>

      <div class="section-divider">
        <span>수업 전</span>
      </div>

      ${
        hasContent(q.problemImage)
          ? `
            <div class="image-box">
              <img src="${escapeHtml(q.problemImage)}" alt="${escapeHtml(q.number)}번 문제" class="problem-image">
            </div>
          `
          : `
            <div class="image-box">
              문제 이미지가 아직 등록되지 않았습니다.
            </div>
          `
      }

      ${
        hasContent(q.answer)
          ? `
            <details class="answer-box">
              <summary>정답 확인</summary>
              <p>정답: ${escapeHtml(q.answer)}</p>
            </details>
          `
          : ""
      }

      ${
        afterClassArea
          ? `
            <div class="section-divider">
              <span>수업 후</span>
            </div>

            ${afterClassArea}
          `
          : ""
      }

    </div>
  `;

  renderNumberButtons();
  updateSideButtons();
}

function renderAfterClassArea(q) {
  const blocks = [];
  const steps = Array.isArray(q.steps) ? q.steps : [];

  if (hasContent(q.handwrittenImage)) {
    blocks.push(`
      <details class="review-box">
        <summary>심정우T 손풀이 보기</summary>
        <div class="image-box">
          <img src="${escapeHtml(q.handwrittenImage)}" alt="${escapeHtml(q.number)}번 손풀이" class="problem-image">
        </div>
      </details>
    `);
  }

  if (steps.length > 0) {
    blocks.push(`
      <details class="review-box">
        <summary>단계별 풀이 보기</summary>

        <div class="steps-wrapper">
          ${steps.map(step => `
            <div class="step-card">
              <h4>${escapeHtml(step.title)}</h4>
              <p>${escapeHtml(step.content)}</p>
            </div>
          `).join("")}
        </div>
      </details>
    `);
  }

  return blocks.join("");
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
  if (lesson && currentIndex > 0) {
    goToQuestion(currentIndex - 1);
  }
});

nextButton.addEventListener("click", () => {
  if (lesson && currentIndex < lesson.questions.length - 1) {
    goToQuestion(currentIndex + 1);
  }
});

async function loadSessionPage() {
  try {
    const data = await callApi({
      action: "getSession",
      classId,
      sessionId
    });

    if (!data.ok) {
      throw new Error(data.message || "회차 정보를 불러오지 못했습니다.");
    }

    lesson = data;

    document.title = `${lesson.title} ${lesson.sessionInfo.sessionTitle} | 제이엠수학 복습실`;
    lessonTitleEl.textContent = lesson.title;
    lessonSubtitleEl.textContent = lesson.subtitle;

    renderLessonVideo();
    renderCurrentQuestion();
  } catch (error) {
    videoCard.style.display = "none";
    prevButton.disabled = true;
    nextButton.disabled = true;

    currentArea.innerHTML = `
      <div class="single-question-card">
        <span class="badge">오류</span>
        <h2>데이터를 불러오지 못했습니다.</h2>
        <p class="meta">${escapeHtml(error.message)}</p>
      </div>
    `;

    numberNav.innerHTML = `
      <div class="question-current-status">
        오류가 발생했습니다.
      </div>
    `;
  }
}

loadSessionPage();
