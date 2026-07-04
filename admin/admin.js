const CLASS_STORAGE_KEY = "jmAdminClasses.v1";
const STUDENT_STORAGE_KEY = "jmAdminStudents.v1";
const ENROLLMENT_STORAGE_KEY = "jmAdminEnrollments.v1";
const SESSION_STORAGE_KEY = "jmAdminSessions.v1";

const CLASS_STATUS_LABELS = {
  active: "운영중",
  ready: "준비중",
  ended: "종료",
  hidden: "숨김"
};

const STUDENT_STATUS_LABELS = {
  active: "수강중",
  paused: "일시중지",
  ended: "수강종료",
  hidden: "숨김"
};

const ENROLLMENT_STATUS_LABELS = {
  active: "수강중",
  paused: "일시중지",
  ended: "수강종료"
};

const SESSION_STATUS_LABELS = {
  public: "공개",
  ready: "준비중",
  private: "관리자만",
  hidden: "숨김"
};

const starterClasses = [
  {
    classId: "class-dongin7979",
    classTitle: "동인고1 공통수학1 기말 대비",
    subject: "공통수학1",
    targetSchool: "동인고",
    targetGrade: "고1",
    classType: "내신 대비",
    description: "기존 복습실 프로토타입을 바탕으로 등록해 둔 예시 수업입니다.",
    accessCode: "dongin7979",
    status: "active",
    createdAt: "2026-07-04T00:00:00.000Z",
    updatedAt: "2026-07-04T00:00:00.000Z"
  }
];

const state = {
  classes: [],
  students: [],
  enrollments: [],
  sessions: [],
  selectedClassId: null,
  selectedStudentId: null,
  selectedSessionId: null,
  editingClassId: null,
  editingStudentId: null,
  editingSessionId: null,
  enrollmentPickerClassId: null,
  enrollmentNotice: "",
  sessionFormClassId: null,
  sessionNotice: ""
};

const elements = {
  navButtons: document.querySelectorAll(".nav-button"),
  viewTitle: document.querySelector("#view-title"),
  dashboardView: document.querySelector("#dashboard-view"),
  classesView: document.querySelector("#classes-view"),
  studentsView: document.querySelector("#students-view"),
  activeClassCount: document.querySelector("#active-class-count"),
  registeredStudentCount: document.querySelector("#registered-student-count"),
  registeredSessionCount: document.querySelector("#registered-session-count"),
  recentWorkList: document.querySelector("#recent-work-list"),
  newClassButton: document.querySelector("#new-class-button"),
  classFormPanel: document.querySelector("#class-form-panel"),
  formTitle: document.querySelector("#form-title"),
  classForm: document.querySelector("#class-form"),
  cancelFormButton: document.querySelector("#cancel-form-button"),
  classList: document.querySelector("#class-list"),
  classCountLabel: document.querySelector("#class-count-label"),
  classDetail: document.querySelector("#class-detail"),
  newStudentButton: document.querySelector("#new-student-button"),
  studentFormPanel: document.querySelector("#student-form-panel"),
  studentFormTitle: document.querySelector("#student-form-title"),
  studentForm: document.querySelector("#student-form"),
  studentFormError: document.querySelector("#student-form-error"),
  cancelStudentFormButton: document.querySelector("#cancel-student-form-button"),
  studentList: document.querySelector("#student-list"),
  studentCountLabel: document.querySelector("#student-count-label"),
  studentDetail: document.querySelector("#student-detail")
};

function loadClasses() {
  const saved = localStorage.getItem(CLASS_STORAGE_KEY);

  if (!saved) {
    const initialClasses = [...starterClasses];
    localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(initialClasses));
    return initialClasses;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...starterClasses];
  } catch (error) {
    const initialClasses = [...starterClasses];
    localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(initialClasses));
    return initialClasses;
  }
}

function loadStudents() {
  const saved = localStorage.getItem(STUDENT_STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

function loadEnrollments() {
  const saved = localStorage.getItem(ENROLLMENT_STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

function loadSessions() {
  const saved = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

function saveClasses() {
  localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(state.classes));
}

function saveStudents() {
  localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(state.students));
}

function saveEnrollments() {
  localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(state.enrollments));
}

function saveSessions() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.sessions));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatSessionDate(value) {
  if (!value) {
    return "-";
  }

  const parts = String(value).split("-");
  if (parts.length === 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }

  return formatDate(value);
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPhone(value) {
  const digits = normalizePhone(value);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value || "-";
}

function truncateText(value, maxLength = 48) {
  const text = String(value || "").trim();
  if (!text) {
    return "메모 없음";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function truncateSummary(value, maxLength = 58) {
  const text = String(value || "").trim();
  if (!text) {
    return "요약 없음";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function createClassId(accessCode) {
  const safeCode = accessCode
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const baseId = safeCode || `class-${Date.now()}`;
  let candidate = `class-${baseId}`;
  let index = 2;

  while (state.classes.some((classItem) => classItem.classId === candidate)) {
    candidate = `class-${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

function createStudentId(phone) {
  let candidate = `student-${phone}`;
  let index = 2;

  while (state.students.some((student) => student.studentId === candidate)) {
    candidate = `student-${phone}-${index}`;
    index += 1;
  }

  return candidate;
}

function createEnrollmentId(classId, studentId) {
  let candidate = `enrollment-${classId}-${studentId}-${Date.now()}`;
  let index = 2;

  while (state.enrollments.some((enrollment) => enrollment.enrollmentId === candidate)) {
    candidate = `enrollment-${classId}-${studentId}-${Date.now()}-${index}`;
    index += 1;
  }

  return candidate;
}

function createSessionId(classId) {
  let candidate = `session-${classId}-${Date.now()}`;
  let index = 2;

  while (state.sessions.some((session) => session.sessionId === candidate)) {
    candidate = `session-${classId}-${Date.now()}-${index}`;
    index += 1;
  }

  return candidate;
}

function getStatusClass(status) {
  return `status-badge status-${status}`;
}

function getStudentPreviewLink(classItem) {
  return `/student/login?classCode=${encodeURIComponent(classItem.accessCode)}`;
}

function isDuplicateStudentPhone(phone, currentStudentId = null) {
  return state.students.some((student) => {
    return student.phone === phone && student.studentId !== currentStudentId;
  });
}

function getStudentById(studentId) {
  return state.students.find((student) => student.studentId === studentId);
}

function getClassById(classId) {
  return state.classes.find((classItem) => classItem.classId === classId);
}

function getClassEnrollmentStats(classId) {
  return state.enrollments
    .filter((enrollment) => enrollment.classId === classId)
    .reduce(
      (stats, enrollment) => {
        if (enrollment.status === "active") {
          stats.active += 1;
        }

        if (enrollment.status === "paused") {
          stats.paused += 1;
        }

        if (enrollment.status === "ended") {
          stats.ended += 1;
        }

        return stats;
      },
      { active: 0, paused: 0, ended: 0 }
    );
}

function getClassSessions(classId) {
  return state.sessions
    .filter((session) => session.classId === classId)
    .sort((a, b) => {
      const dateDiff = String(b.sessionDate || "").localeCompare(String(a.sessionDate || ""));
      if (dateDiff !== 0) {
        return dateDiff;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function getVisibleClassSessionCount(classId) {
  return state.sessions.filter((session) => {
    return session.classId === classId && session.status !== "hidden";
  }).length;
}

function getVisibleSessionCount() {
  return state.sessions.filter((session) => session.status !== "hidden").length;
}

function getSessionById(sessionId) {
  return state.sessions.find((session) => session.sessionId === sessionId);
}

function getClassEnrollments(classId) {
  const statusOrder = {
    active: 1,
    paused: 2,
    ended: 3
  };

  return state.enrollments
    .filter((enrollment) => enrollment.classId === classId)
    .sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
}

function getStudentEnrollments(studentId) {
  return state.enrollments
    .filter((enrollment) => enrollment.studentId === studentId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getActiveOrPausedEnrollment(classId, studentId) {
  return state.enrollments.find((enrollment) => {
    return (
      enrollment.classId === classId &&
      enrollment.studentId === studentId &&
      ["active", "paused"].includes(enrollment.status)
    );
  });
}

function getEndedEnrollment(classId, studentId) {
  return state.enrollments
    .filter((enrollment) => {
      return (
        enrollment.classId === classId &&
        enrollment.studentId === studentId &&
        enrollment.status === "ended"
      );
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
}

function getVisibleStudents() {
  return state.students.filter((student) => student.status !== "hidden");
}

function switchView(viewName) {
  const titles = {
    dashboard: "대시보드",
    classes: "수업 관리",
    students: "학생 관리"
  };

  elements.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });

  elements.dashboardView.classList.toggle("is-active", viewName === "dashboard");
  elements.classesView.classList.toggle("is-active", viewName === "classes");
  elements.studentsView.classList.toggle("is-active", viewName === "students");
  elements.viewTitle.textContent = titles[viewName] || "대시보드";
}

function renderDashboard() {
  const activeCount = state.classes.filter((classItem) => classItem.status === "active").length;
  const visibleStudentCount = state.students.filter((student) => student.status !== "hidden").length;
  const visibleSessionCount = getVisibleSessionCount();
  elements.activeClassCount.textContent = activeCount;
  elements.registeredStudentCount.textContent = visibleStudentCount;
  elements.registeredSessionCount.textContent = visibleSessionCount;

  const recentClasses = [...state.classes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  if (!recentClasses.length) {
    elements.recentWorkList.innerHTML = '<div class="empty-state">아직 최근 작업이 없습니다. 수업이나 학생 정보를 추가하면 이 영역에 임시로 표시됩니다.</div>';
    return;
  }

  elements.recentWorkList.innerHTML = recentClasses
    .map((classItem) => `
      <div class="recent-item">
        <strong>${escapeHtml(classItem.classTitle)}</strong>
        <span>${CLASS_STATUS_LABELS[classItem.status]} - ${formatDate(classItem.updatedAt)}</span>
      </div>
    `)
    .join("");
}

function renderClassList() {
  elements.classCountLabel.textContent = `${state.classes.length}개`;

  if (!state.classes.length) {
    elements.classList.innerHTML = '<div class="empty-state">등록된 수업이 없습니다. 새 수업 만들기 버튼으로 첫 수업을 추가하세요.</div>';
    elements.classDetail.innerHTML = '<div class="empty-state">수업을 선택하면 상세 정보가 표시됩니다.</div>';
    return;
  }

  if (!state.selectedClassId || !state.classes.some((classItem) => classItem.classId === state.selectedClassId)) {
    state.selectedClassId = state.classes[0].classId;
  }

  elements.classList.innerHTML = state.classes
    .map((classItem) => {
      const enrollmentStats = getClassEnrollmentStats(classItem.classId);
      const sessionCount = getVisibleClassSessionCount(classItem.classId);

      return `
        <button class="class-card ${classItem.classId === state.selectedClassId ? "is-selected" : ""}" type="button" data-class-id="${classItem.classId}">
          <h4>${escapeHtml(classItem.classTitle)}</h4>
          <p>${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)} - ${escapeHtml(classItem.subject)}</p>
          <p class="class-meta">회차 ${sessionCount}개 / 수강중 ${enrollmentStats.active}명</p>
          <p class="class-meta">일시중지 ${enrollmentStats.paused}명 / 수강종료 ${enrollmentStats.ended}명</p>
          <div class="card-footer">
            <span class="${getStatusClass(classItem.status)}">${CLASS_STATUS_LABELS[classItem.status]}</span>
            <span class="class-meta">수업 코드 ${escapeHtml(classItem.accessCode)}</span>
          </div>
        </button>
      `;
    })
    .join("");

  document.querySelectorAll(".class-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedClassId = card.dataset.classId;
      state.enrollmentPickerClassId = null;
      state.enrollmentNotice = "";
      state.selectedSessionId = null;
      state.editingSessionId = null;
      state.sessionFormClassId = null;
      state.sessionNotice = "";
      hideClassForm();
      render();
    });
  });

  renderClassDetail();
}

function renderClassDetail() {
  const classItem = state.classes.find((item) => item.classId === state.selectedClassId);

  if (!classItem) {
    elements.classDetail.innerHTML = '<div class="empty-state">수업을 선택하면 상세 정보가 표시됩니다.</div>';
    return;
  }

  const enrollmentStats = getClassEnrollmentStats(classItem.classId);
  const sessionCount = getVisibleClassSessionCount(classItem.classId);
  const showPicker = state.enrollmentPickerClassId === classItem.classId;

  elements.classDetail.innerHTML = `
    <div class="detail-content">
      <div class="panel-title">
        <h3>수업 상세</h3>
        <span class="${getStatusClass(classItem.status)}">${CLASS_STATUS_LABELS[classItem.status]}</span>
      </div>

      <div>
        <h3>${escapeHtml(classItem.classTitle)}</h3>
        <p class="class-meta">${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)} - ${escapeHtml(classItem.subject)}</p>
      </div>

      <div class="detail-row">
        <span>관리용 ID</span>
        <strong>${escapeHtml(classItem.classId)}</strong>
      </div>
      <div class="detail-row">
        <span>수업 유형</span>
        <strong>${escapeHtml(classItem.classType)}</strong>
      </div>
      <div class="detail-row">
        <span>수업 코드</span>
        <strong>${escapeHtml(classItem.accessCode)}</strong>
      </div>
      <div class="detail-row">
        <span>생성일</span>
        <strong>${formatDate(classItem.createdAt)}</strong>
      </div>
      <div class="detail-row">
        <span>수정일</span>
        <strong>${formatDate(classItem.updatedAt)}</strong>
      </div>
      <div class="detail-row">
        <span>회차 수</span>
        <strong>${sessionCount}개</strong>
      </div>

      <div class="detail-description">
        ${escapeHtml(classItem.description || "수업 설명이 없습니다.")}
      </div>

      <div class="enrollment-summary">
        <strong>수업별 등록 학생</strong>
        <span>수강중 ${enrollmentStats.active}명 / 일시중지 ${enrollmentStats.paused}명 / 수강종료 ${enrollmentStats.ended}명</span>
      </div>

      <div class="detail-actions">
        <button id="add-student-to-class" class="secondary-button" type="button">학생 추가</button>
        <button id="edit-selected-class" class="secondary-button" type="button">수업 수정</button>
      </div>

      ${state.enrollmentNotice ? `<div class="form-info">${escapeHtml(state.enrollmentNotice)}</div>` : ""}

      ${showPicker ? renderEnrollmentPicker(classItem.classId) : ""}

      ${renderClassEnrollmentList(classItem.classId)}

      ${renderSessionManagement(classItem.classId)}

      <div class="planned-link">
        <span class="planned-link-label">학생용 예정 링크</span>
        <code>${getStudentPreviewLink(classItem)}</code>
        <small>학생 로그인 기능은 아직 연결되지 않았습니다. 이번 화면에서는 링크를 표시만 합니다.</small>
      </div>
    </div>
  `;

  document.querySelector("#edit-selected-class").addEventListener("click", () => {
    showEditClassForm(classItem.classId);
  });

  document.querySelector("#add-student-to-class").addEventListener("click", () => {
    state.enrollmentPickerClassId = showPicker ? null : classItem.classId;
    state.enrollmentNotice = "";
    renderClassDetail();
  });

  bindEnrollmentControls();
  bindSessionControls();
}

function renderSessionManagement(classId) {
  const sessionCount = getVisibleClassSessionCount(classId);
  const showForm = state.sessionFormClassId === classId;

  return `
    <div class="session-section">
      <div class="panel-title">
        <h3>회차 관리</h3>
        <span>숨김 제외 ${sessionCount}개</span>
      </div>

      <div class="detail-actions">
        <button id="show-session-form" class="secondary-button" type="button">회차 추가</button>
      </div>

      ${state.sessionNotice ? `<div class="form-info">${escapeHtml(state.sessionNotice)}</div>` : ""}
      ${showForm ? renderSessionForm(classId) : ""}
      ${renderSessionList(classId)}
      ${renderSessionDetail(classId)}
    </div>
  `;
}

function renderSessionForm(classId) {
  const editingSession = state.editingSessionId ? getSessionById(state.editingSessionId) : null;
  const isEditing = editingSession?.classId === classId;
  const values = isEditing
    ? editingSession
    : {
        sessionTitle: "",
        sessionDate: "",
        summary: "",
        lessonVideoUrl: "",
        status: "ready"
      };

  return `
    <form id="session-form" class="session-form" data-class-id="${escapeHtml(classId)}">
      <div class="panel-title">
        <h3>${isEditing ? "회차 수정" : "회차 추가"}</h3>
        <span>현재 수업에 자동 연결</span>
      </div>

      <label>
        <span>회차명</span>
        <input name="sessionTitle" type="text" value="${escapeHtml(values.sessionTitle)}" placeholder="예: 1회차 - 다항식 복습" required>
      </label>

      <label>
        <span>수업 날짜</span>
        <input name="sessionDate" type="date" value="${escapeHtml(values.sessionDate)}" required>
      </label>

      <label>
        <span>수업 요약</span>
        <textarea name="summary" rows="4" placeholder="이번 회차에서 다룬 내용을 입력하세요.">${escapeHtml(values.summary)}</textarea>
      </label>

      <label>
        <span>수업 영상 링크</span>
        <input name="lessonVideoUrl" type="url" value="${escapeHtml(values.lessonVideoUrl)}" placeholder="https://...">
      </label>

      <label>
        <span>상태</span>
        <select name="status" required>
          ${Object.entries(SESSION_STATUS_LABELS)
            .map(([value, label]) => `<option value="${value}" ${values.status === value ? "selected" : ""}>${label}</option>`)
            .join("")}
        </select>
      </label>

      <div class="form-actions">
        <button class="primary-button" type="submit">저장</button>
        <button id="cancel-session-form" class="secondary-button" type="button">취소</button>
      </div>
    </form>
  `;
}

function renderSessionList(classId) {
  const sessions = getClassSessions(classId);

  if (!sessions.length) {
    return '<div class="empty-state">아직 이 수업에 등록된 회차가 없습니다. 회차 추가 버튼으로 첫 회차를 등록하세요.</div>';
  }

  return `
    <div class="session-list">
      ${sessions
        .map((session) => {
          const isSelected = session.sessionId === state.selectedSessionId;
          const videoState = session.lessonVideoUrl ? "영상 등록됨" : "영상 준비중";
          const statusLabel = SESSION_STATUS_LABELS[session.status] || session.status;

          return `
            <article class="session-card ${isSelected ? "is-selected" : ""}">
              <h4>${escapeHtml(session.sessionTitle)}</h4>
              <p class="session-meta">${formatSessionDate(session.sessionDate)}</p>
              <p class="session-summary-preview">${escapeHtml(truncateSummary(session.summary))}</p>
              <div class="session-meta-list">
                <span class="video-state">${videoState}</span>
                <span class="question-state">문항 준비중</span>
                <span class="${getStatusClass(session.status)}">${escapeHtml(statusLabel)}</span>
              </div>
              <div class="session-card-footer">
                <span class="session-meta">문항 수 0개</span>
                <div class="session-actions">
                  <button class="text-button" type="button" data-session-detail-id="${session.sessionId}">상세</button>
                  <button class="text-button" type="button" data-session-edit-id="${session.sessionId}">수정</button>
                </div>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderSessionDetail(classId) {
  const session = getSessionById(state.selectedSessionId);

  if (!session || session.classId !== classId) {
    return "";
  }

  const statusLabel = SESSION_STATUS_LABELS[session.status] || session.status;
  const videoContent = session.lessonVideoUrl
    ? `<code class="session-video-link">${escapeHtml(session.lessonVideoUrl)}</code>`
    : '<span class="session-video-link">영상 준비중</span>';

  return `
    <article class="session-detail">
      <div class="panel-title">
        <h3>회차 상세</h3>
        <span class="${getStatusClass(session.status)}">${escapeHtml(statusLabel)}</span>
      </div>

      <h4>${escapeHtml(session.sessionTitle)}</h4>

      <div class="detail-row">
        <span>수업 날짜</span>
        <strong>${formatSessionDate(session.sessionDate)}</strong>
      </div>
      <div class="detail-row">
        <span>수업 영상 링크</span>
        <strong>${session.lessonVideoUrl ? "영상 등록됨" : "영상 준비중"}</strong>
      </div>
      ${videoContent}

      <div class="detail-description">
        ${escapeHtml(session.summary || "수업 요약이 없습니다.")}
      </div>

      <div class="question-placeholder">
        문항 관리 기능은 다음 단계에서 추가됩니다.
      </div>

      <div class="detail-actions">
        <button class="secondary-button" type="button" data-session-edit-id="${session.sessionId}">회차 수정</button>
      </div>
    </article>
  `;
}

function renderEnrollmentPicker(classId) {
  const visibleStudents = getVisibleStudents();

  if (!visibleStudents.length) {
    return `
      <div class="enrollment-picker">
        <div class="panel-title">
          <h3>학생 선택</h3>
          <span>숨김 학생 제외</span>
        </div>
        <div class="empty-state">배정할 수 있는 학생이 없습니다. 학생 관리에서 학생을 먼저 등록하세요.</div>
      </div>
    `;
  }

  return `
    <div class="enrollment-picker">
      <div class="panel-title">
        <h3>학생 선택</h3>
        <span>숨김 학생 제외</span>
      </div>
      <div class="enrollment-picker-list">
        ${visibleStudents
          .map((student) => {
            const activeOrPausedEnrollment = getActiveOrPausedEnrollment(classId, student.studentId);
            const endedEnrollment = getEndedEnrollment(classId, student.studentId);

            if (activeOrPausedEnrollment) {
              return `
                <div class="student-pick-row is-disabled">
                  <div>
                    <strong>${escapeHtml(student.studentName)}</strong>
                    <span>${escapeHtml(student.school)} ${escapeHtml(student.grade)} - ${escapeHtml(formatPhone(student.phone))}</span>
                  </div>
                  <span class="${getStatusClass(activeOrPausedEnrollment.status)}">${ENROLLMENT_STATUS_LABELS[activeOrPausedEnrollment.status]}</span>
                </div>
              `;
            }

            if (endedEnrollment) {
              return `
                <div class="student-pick-row">
                  <div>
                    <strong>${escapeHtml(student.studentName)}</strong>
                    <span>${escapeHtml(student.school)} ${escapeHtml(student.grade)} - ${escapeHtml(formatPhone(student.phone))}</span>
                    <small>수강종료 상태입니다. 다시 수강중으로 변경할 수 있습니다.</small>
                  </div>
                  <button class="text-button" type="button" data-enroll-student-id="${student.studentId}">다시 수강중</button>
                </div>
              `;
            }

            return `
              <div class="student-pick-row">
                <div>
                  <strong>${escapeHtml(student.studentName)}</strong>
                  <span>${escapeHtml(student.school)} ${escapeHtml(student.grade)} - ${escapeHtml(formatPhone(student.phone))}</span>
                </div>
                <button class="text-button" type="button" data-enroll-student-id="${student.studentId}">배정</button>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderClassEnrollmentList(classId) {
  const enrollments = getClassEnrollments(classId);

  if (!enrollments.length) {
    return `
      <div class="enrollment-section">
        <div class="panel-title">
          <h3>배정 학생</h3>
          <span>0명</span>
        </div>
        <div class="empty-state">아직 이 수업에 배정된 학생이 없습니다. 학생 추가 버튼으로 학생을 배정하세요.</div>
      </div>
    `;
  }

  return `
    <div class="enrollment-section">
      <div class="panel-title">
        <h3>배정 학생</h3>
        <span>${enrollments.length}명</span>
      </div>
      <div class="enrollment-list">
        ${enrollments
          .map((enrollment) => {
            const student = getStudentById(enrollment.studentId);
            if (!student) {
              return "";
            }

            return `
              <div class="enrollment-row ${enrollment.status === "ended" ? "is-ended" : ""}">
                <div>
                  <strong>${escapeHtml(student.studentName)}</strong>
                  <span>${escapeHtml(student.school)} ${escapeHtml(student.grade)} - ${escapeHtml(formatPhone(student.phone))}</span>
                </div>
                <div class="enrollment-actions">
                  <select data-enrollment-status="${enrollment.enrollmentId}" aria-label="수강 상태">
                    <option value="active" ${enrollment.status === "active" ? "selected" : ""}>수강중</option>
                    <option value="paused" ${enrollment.status === "paused" ? "selected" : ""}>일시중지</option>
                    <option value="ended" ${enrollment.status === "ended" ? "selected" : ""}>수강종료</option>
                  </select>
                  ${enrollment.status !== "ended" ? `<button class="text-button" type="button" data-end-enrollment-id="${enrollment.enrollmentId}">수강 종료</button>` : ""}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderStudentList() {
  elements.studentCountLabel.textContent = `${state.students.length}명`;

  if (!state.students.length) {
    elements.studentList.innerHTML = '<div class="empty-state">아직 등록된 학생이 없습니다. 학생 등록 버튼을 눌러 첫 학생을 추가하세요.</div>';
    elements.studentDetail.innerHTML = '<div class="empty-state">학생을 선택하면 상세 정보가 표시됩니다.</div>';
    return;
  }

  if (!state.selectedStudentId || !state.students.some((student) => student.studentId === state.selectedStudentId)) {
    state.selectedStudentId = state.students[0].studentId;
  }

  elements.studentList.innerHTML = state.students
    .map((student) => `
      <button class="student-card ${student.studentId === state.selectedStudentId ? "is-selected" : ""}" type="button" data-student-id="${student.studentId}">
        <h4>${escapeHtml(student.studentName)}</h4>
        <p>${escapeHtml(student.school)} ${escapeHtml(student.grade)} - ${escapeHtml(formatPhone(student.phone))}</p>
        <p class="student-memo-preview">${escapeHtml(truncateText(student.memo, 42))}</p>
        <div class="card-footer">
          <span class="${getStatusClass(student.status)}">${STUDENT_STATUS_LABELS[student.status]}</span>
          <span class="class-meta">등록 ${formatDate(student.createdAt)}</span>
        </div>
      </button>
    `)
    .join("");

  document.querySelectorAll(".student-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedStudentId = card.dataset.studentId;
      hideStudentForm();
      render();
    });
  });

  renderStudentDetail();
}

function renderStudentDetail() {
  const student = state.students.find((item) => item.studentId === state.selectedStudentId);

  if (!student) {
    elements.studentDetail.innerHTML = '<div class="empty-state">학생을 선택하면 상세 정보가 표시됩니다.</div>';
    return;
  }

  elements.studentDetail.innerHTML = `
    <div class="detail-content">
      <div class="panel-title">
        <h3>학생 상세</h3>
        <span class="${getStatusClass(student.status)}">${STUDENT_STATUS_LABELS[student.status]}</span>
      </div>

      <div>
        <h3>${escapeHtml(student.studentName)}</h3>
        <p class="class-meta">${escapeHtml(student.school)} ${escapeHtml(student.grade)}</p>
      </div>

      <div class="detail-row">
        <span>학생 전화번호</span>
        <strong>${escapeHtml(formatPhone(student.phone))}</strong>
      </div>
      <div class="detail-row">
        <span>학교</span>
        <strong>${escapeHtml(student.school)}</strong>
      </div>
      <div class="detail-row">
        <span>학년</span>
        <strong>${escapeHtml(student.grade)}</strong>
      </div>
      <div class="detail-row">
        <span>학부모 연락처</span>
        <strong>${escapeHtml(student.parentPhone ? formatPhone(student.parentPhone) : "-")}</strong>
      </div>
      <div class="detail-row">
        <span>생성일</span>
        <strong>${formatDate(student.createdAt)}</strong>
      </div>
      <div class="detail-row">
        <span>수정일</span>
        <strong>${formatDate(student.updatedAt)}</strong>
      </div>

      <div class="detail-description">
        ${escapeHtml(student.memo || "메모 / 학습 특이사항이 없습니다.")}
      </div>

      ${renderStudentEnrollmentList(student.studentId)}

      <button id="edit-selected-student" class="secondary-button" type="button">학생 수정</button>
    </div>
  `;

  document.querySelector("#edit-selected-student").addEventListener("click", () => {
    showEditStudentForm(student.studentId);
  });
}

function renderStudentEnrollmentList(studentId) {
  const enrollments = getStudentEnrollments(studentId);

  if (!enrollments.length) {
    return `
      <div class="enrollment-section">
        <div class="panel-title">
          <h3>수강 수업</h3>
          <span>0개</span>
        </div>
        <div class="empty-state">아직 배정된 수업이 없습니다. 수업 상세 화면에서 학생을 추가하세요.</div>
      </div>
    `;
  }

  return `
    <div class="enrollment-section">
      <div class="panel-title">
        <h3>수강 수업</h3>
        <span>${enrollments.length}개</span>
      </div>
      <div class="enrollment-list">
        ${enrollments
          .map((enrollment) => {
            const classItem = getClassById(enrollment.classId);
            if (!classItem) {
              return "";
            }

            return `
              <div class="enrollment-row ${enrollment.status === "ended" ? "is-ended" : ""}">
                <div>
                  <strong>${escapeHtml(classItem.classTitle)}</strong>
                  <span>${escapeHtml(classItem.subject)} - ${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)}</span>
                  <small>등록일 ${formatDate(enrollment.joinedAt)}</small>
                </div>
                <span class="${getStatusClass(enrollment.status)}">${ENROLLMENT_STATUS_LABELS[enrollment.status]}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function showCreateClassForm() {
  state.editingClassId = null;
  elements.formTitle.textContent = "새 수업 만들기";
  elements.classForm.reset();
  elements.classForm.status.value = "active";
  elements.classFormPanel.hidden = false;
  elements.classFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showEditClassForm(classId) {
  const classItem = state.classes.find((item) => item.classId === classId);
  if (!classItem) {
    return;
  }

  state.editingClassId = classId;
  elements.formTitle.textContent = "수업 수정";
  elements.classForm.classTitle.value = classItem.classTitle;
  elements.classForm.subject.value = classItem.subject;
  elements.classForm.targetSchool.value = classItem.targetSchool;
  elements.classForm.targetGrade.value = classItem.targetGrade;
  elements.classForm.classType.value = classItem.classType;
  elements.classForm.description.value = classItem.description;
  elements.classForm.accessCode.value = classItem.accessCode;
  elements.classForm.status.value = classItem.status;
  elements.classFormPanel.hidden = false;
  elements.classFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hideClassForm() {
  state.editingClassId = null;
  elements.classForm.reset();
  elements.classFormPanel.hidden = true;
}

function showCreateSessionForm(classId) {
  if (!getClassById(classId)) {
    return;
  }

  state.sessionFormClassId = classId;
  state.editingSessionId = null;
  state.sessionNotice = "";
  renderClassDetail();
}

function showEditSessionForm(sessionId) {
  const session = getSessionById(sessionId);
  if (!session) {
    return;
  }

  state.selectedClassId = session.classId;
  state.selectedSessionId = session.sessionId;
  state.sessionFormClassId = session.classId;
  state.editingSessionId = session.sessionId;
  state.sessionNotice = "";
  renderClassDetail();
}

function hideSessionForm() {
  state.sessionFormClassId = null;
  state.editingSessionId = null;
}

function selectSession(sessionId) {
  const session = getSessionById(sessionId);
  if (!session || session.classId !== state.selectedClassId) {
    return;
  }

  state.selectedSessionId = session.sessionId;
  state.sessionFormClassId = null;
  state.editingSessionId = null;
  renderClassDetail();
}

function showCreateStudentForm() {
  state.editingStudentId = null;
  elements.studentFormTitle.textContent = "학생 등록";
  elements.studentForm.reset();
  elements.studentForm.status.value = "active";
  hideStudentFormError();
  elements.studentFormPanel.hidden = false;
  elements.studentFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showEditStudentForm(studentId) {
  const student = state.students.find((item) => item.studentId === studentId);
  if (!student) {
    return;
  }

  state.editingStudentId = studentId;
  elements.studentFormTitle.textContent = "학생 수정";
  elements.studentForm.studentName.value = student.studentName;
  elements.studentForm.phone.value = student.phone;
  elements.studentForm.school.value = student.school;
  elements.studentForm.grade.value = student.grade;
  elements.studentForm.parentPhone.value = student.parentPhone;
  elements.studentForm.memo.value = student.memo;
  elements.studentForm.status.value = student.status;
  hideStudentFormError();
  elements.studentFormPanel.hidden = false;
  elements.studentFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hideStudentForm() {
  state.editingStudentId = null;
  elements.studentForm.reset();
  hideStudentFormError();
  elements.studentFormPanel.hidden = true;
}

function showStudentFormError(message) {
  elements.studentFormError.textContent = message;
  elements.studentFormError.hidden = false;
}

function hideStudentFormError() {
  elements.studentFormError.textContent = "";
  elements.studentFormError.hidden = true;
}

function handleClassFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.classForm);
  const now = new Date().toISOString();
  const values = {
    classTitle: formData.get("classTitle").trim(),
    subject: formData.get("subject").trim(),
    targetSchool: formData.get("targetSchool").trim(),
    targetGrade: formData.get("targetGrade"),
    classType: formData.get("classType"),
    description: formData.get("description").trim(),
    accessCode: formData.get("accessCode").trim(),
    status: formData.get("status")
  };

  if (state.editingClassId) {
    state.classes = state.classes.map((classItem) => {
      if (classItem.classId !== state.editingClassId) {
        return classItem;
      }

      return {
        ...classItem,
        ...values,
        updatedAt: now
      };
    });
    state.selectedClassId = state.editingClassId;
  } else {
    const newClass = {
      classId: createClassId(values.accessCode),
      ...values,
      createdAt: now,
      updatedAt: now
    };
    state.classes = [newClass, ...state.classes];
    state.selectedClassId = newClass.classId;
  }

  saveClasses();
  hideClassForm();
  render();
}

function handleSessionFormSubmit(event, classId) {
  event.preventDefault();

  const classItem = getClassById(classId);
  if (!classItem) {
    state.sessionNotice = "회차를 연결할 수업을 찾을 수 없습니다.";
    renderClassDetail();
    return;
  }

  const formData = new FormData(event.currentTarget);
  const now = new Date().toISOString();
  const values = {
    sessionTitle: formData.get("sessionTitle").trim(),
    sessionDate: formData.get("sessionDate"),
    summary: formData.get("summary").trim(),
    lessonVideoUrl: formData.get("lessonVideoUrl").trim(),
    status: formData.get("status") || "ready"
  };

  if (!values.sessionTitle || !values.sessionDate) {
    state.sessionNotice = "회차명과 수업 날짜는 필수 입력값입니다.";
    renderClassDetail();
    return;
  }

  if (state.editingSessionId) {
    const editingSession = getSessionById(state.editingSessionId);
    if (!editingSession || editingSession.classId !== classId) {
      state.sessionNotice = "수정할 회차를 찾을 수 없습니다.";
      renderClassDetail();
      return;
    }

    state.sessions = state.sessions.map((session) => {
      if (session.sessionId !== state.editingSessionId) {
        return session;
      }

      return {
        ...session,
        ...values,
        classId,
        updatedAt: now
      };
    });
    state.selectedSessionId = state.editingSessionId;
    state.sessionNotice = "회차를 수정했습니다.";
  } else {
    const newSession = {
      sessionId: createSessionId(classId),
      classId,
      ...values,
      createdAt: now,
      updatedAt: now
    };

    state.sessions = [newSession, ...state.sessions];
    state.selectedSessionId = newSession.sessionId;
    state.sessionNotice = "회차를 추가했습니다.";
  }

  saveSessions();
  hideSessionForm();
  render();
}

function handleStudentFormSubmit(event) {
  event.preventDefault();
  hideStudentFormError();

  const formData = new FormData(elements.studentForm);
  const now = new Date().toISOString();
  const values = {
    studentName: formData.get("studentName").trim(),
    phone: normalizePhone(formData.get("phone")),
    school: formData.get("school").trim(),
    grade: formData.get("grade"),
    parentPhone: formData.get("parentPhone").trim(),
    memo: formData.get("memo").trim(),
    status: formData.get("status") || "active"
  };

  if (!values.studentName || !values.phone || !values.school || !values.grade) {
    showStudentFormError("학생 이름, 학생 전화번호, 학교, 학년은 필수 입력값입니다.");
    return;
  }

  if (isDuplicateStudentPhone(values.phone, state.editingStudentId)) {
    showStudentFormError("이미 같은 전화번호로 등록된 학생이 있습니다. 학생 전화번호를 확인해주세요.");
    return;
  }

  if (state.editingStudentId) {
    state.students = state.students.map((student) => {
      if (student.studentId !== state.editingStudentId) {
        return student;
      }

      return {
        ...student,
        ...values,
        updatedAt: now
      };
    });
    state.selectedStudentId = state.editingStudentId;
  } else {
    const newStudent = {
      studentId: createStudentId(values.phone),
      ...values,
      createdAt: now,
      updatedAt: now
    };
    state.students = [newStudent, ...state.students];
    state.selectedStudentId = newStudent.studentId;
  }

  saveStudents();
  hideStudentForm();
  render();
}

function enrollStudentInClass(classId, studentId) {
  const classItem = getClassById(classId);
  const student = getStudentById(studentId);

  if (!classItem || !student || student.status === "hidden") {
    state.enrollmentNotice = "배정할 수 없는 학생입니다. 학생 상태를 확인해주세요.";
    render();
    return;
  }

  const activeOrPausedEnrollment = getActiveOrPausedEnrollment(classId, studentId);
  if (activeOrPausedEnrollment) {
    state.enrollmentNotice = "이미 이 수업에 수강중 또는 일시중지 상태로 배정된 학생입니다.";
    render();
    return;
  }

  const now = new Date().toISOString();
  const endedEnrollment = getEndedEnrollment(classId, studentId);

  if (endedEnrollment) {
    state.enrollments = state.enrollments.map((enrollment) => {
      if (enrollment.enrollmentId !== endedEnrollment.enrollmentId) {
        return enrollment;
      }

      return {
        ...enrollment,
        status: "active",
        endedAt: "",
        updatedAt: now
      };
    });
    state.enrollmentNotice = `${student.studentName} 학생의 수강종료 기록을 다시 수강중으로 변경했습니다.`;
  } else {
    state.enrollments = [
      {
        enrollmentId: createEnrollmentId(classId, studentId),
        studentId,
        classId,
        status: "active",
        joinedAt: now,
        endedAt: "",
        createdAt: now,
        updatedAt: now
      },
      ...state.enrollments
    ];
    state.enrollmentNotice = `${student.studentName} 학생을 수업에 배정했습니다.`;
  }

  saveEnrollments();
  state.enrollmentPickerClassId = null;
  render();
}

function updateEnrollmentStatus(enrollmentId, status) {
  const now = new Date().toISOString();

  state.enrollments = state.enrollments.map((enrollment) => {
    if (enrollment.enrollmentId !== enrollmentId) {
      return enrollment;
    }

    return {
      ...enrollment,
      status,
      endedAt: status === "ended" ? now : "",
      updatedAt: now
    };
  });

  saveEnrollments();
  state.enrollmentNotice = status === "ended" ? "수강종료 처리했습니다. 기록은 삭제하지 않고 보관됩니다." : "수강 상태를 변경했습니다.";
  render();
}

function endEnrollment(enrollmentId) {
  updateEnrollmentStatus(enrollmentId, "ended");
}

function bindEnrollmentControls() {
  document.querySelectorAll("[data-enroll-student-id]").forEach((button) => {
    button.addEventListener("click", () => {
      enrollStudentInClass(state.selectedClassId, button.dataset.enrollStudentId);
    });
  });

  document.querySelectorAll("[data-enrollment-status]").forEach((select) => {
    select.addEventListener("change", () => {
      updateEnrollmentStatus(select.dataset.enrollmentStatus, select.value);
    });
  });

  document.querySelectorAll("[data-end-enrollment-id]").forEach((button) => {
    button.addEventListener("click", () => {
      endEnrollment(button.dataset.endEnrollmentId);
    });
  });
}

function bindSessionControls() {
  const showSessionFormButton = document.querySelector("#show-session-form");
  if (showSessionFormButton) {
    showSessionFormButton.addEventListener("click", () => {
      showCreateSessionForm(state.selectedClassId);
    });
  }

  const sessionForm = document.querySelector("#session-form");
  if (sessionForm) {
    sessionForm.addEventListener("submit", (event) => {
      handleSessionFormSubmit(event, sessionForm.dataset.classId);
    });
  }

  const cancelSessionFormButton = document.querySelector("#cancel-session-form");
  if (cancelSessionFormButton) {
    cancelSessionFormButton.addEventListener("click", () => {
      hideSessionForm();
      renderClassDetail();
    });
  }

  document.querySelectorAll("[data-session-detail-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectSession(button.dataset.sessionDetailId);
    });
  });

  document.querySelectorAll("[data-session-edit-id]").forEach((button) => {
    button.addEventListener("click", () => {
      showEditSessionForm(button.dataset.sessionEditId);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  elements.newClassButton.addEventListener("click", showCreateClassForm);
  elements.cancelFormButton.addEventListener("click", hideClassForm);
  elements.classForm.addEventListener("submit", handleClassFormSubmit);

  elements.newStudentButton.addEventListener("click", showCreateStudentForm);
  elements.cancelStudentFormButton.addEventListener("click", hideStudentForm);
  elements.studentForm.addEventListener("submit", handleStudentFormSubmit);
}

function render() {
  renderDashboard();
  renderClassList();
  renderStudentList();
}

function init() {
  state.classes = loadClasses();
  state.students = loadStudents();
  state.enrollments = loadEnrollments();
  state.sessions = loadSessions();
  state.selectedClassId = state.classes[0]?.classId || null;
  state.selectedStudentId = state.students[0]?.studentId || null;
  bindEvents();
  render();
}

init();
