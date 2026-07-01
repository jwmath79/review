const params = new URLSearchParams(window.location.search);
const classId = params.get("classId") || "dongin-g1-final";

const classTitleEl = document.getElementById("class-title");
const classSubtitleEl = document.getElementById("class-subtitle");
const sessionGridEl = document.getElementById("session-grid");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function getSessionButton(session) {
  const sessionTitle = escapeHtml(session.sessionTitle || `${session.sessionId}회차`);
  const sessionDate = escapeHtml(session.sessionDate || "");
  const status = String(session.status || "ready");

  if (status === "hidden") {
    return "";
  }

  if (status === "ready") {
    return `
      <div class="session-button is-disabled">
        <strong>${sessionTitle}</strong>
        <span>준비중</span>
      </div>
    `;
  }

  const href = `session.html?classId=${encodeURIComponent(classId)}&sessionId=${encodeURIComponent(session.sessionId)}`;

  return `
    <a class="session-button" href="${href}">
      <strong>${sessionTitle}</strong>
      <span>${sessionDate}</span>
    </a>
  `;
}

async function loadClassPage() {
  try {
    const data = await callApi({
      action: "getClass",
      classId
    });

    if (!data.ok) {
      throw new Error(data.message || "수업 정보를 불러오지 못했습니다.");
    }

    const classInfo = data.classInfo;
    const sessions = data.sessions || [];

    document.title = `${classInfo.classTitle} | 제이엠수학 복습실`;
    classTitleEl.textContent = classInfo.classTitle;
    classSubtitleEl.textContent = classInfo.classSubtitle;

    const sessionHtml = sessions
      .map(getSessionButton)
      .filter(Boolean)
      .join("");

    sessionGridEl.innerHTML = sessionHtml || `
      <div class="session-button is-disabled">
        <strong>회차 없음</strong>
        <span>아직 공개된 회차가 없습니다</span>
      </div>
    `;
  } catch (error) {
    sessionGridEl.innerHTML = `
      <div class="session-button is-disabled">
        <strong>오류</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;
  }
}

loadClassPage();
