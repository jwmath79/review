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
  sessionNotice: "",
  classSearchTerm: "",
  classStatusFilter: "all",
  classSortKey: "updated-desc",
  studentSearchTerm: "",
  studentStatusFilter: "all",
  studentSortKey: "updated-desc",
  sessionSearchTerm: "",
  sessionStatusFilter: "all",
  sessionSortKey: "date-desc",
  classDetailTab: "info"
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

function renderSummaryItems(items) {
  return `
    <div class="summary-strip">
      ${items
        .map(
          (item) => `
            <div class="summary-item">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderToolbar({ searchId, searchValue, searchPlaceholder, filterId, filterValue, filterLabel, filterOptions, sortId, sortValue, sortOptions }) {
  return `
    <div class="list-toolbar">
      <input id="${searchId}" type="search" value="${escapeHtml(searchValue)}" placeholder="${escapeHtml(searchPlaceholder)}">
      <select id="${filterId}" aria-label="${escapeHtml(filterLabel)}">
        ${filterOptions
          .map((option) => `<option value="${option.value}" ${filterValue === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
          .join("")}
      </select>
      <select id="${sortId}" aria-label="정렬 기준">
        ${sortOptions
          .map((option) => `<option value="${option.value}" ${sortValue === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
          .join("")}
      </select>
    </div>
  `;
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

function getFilteredClasses() {
  const keyword = state.classSearchTerm.trim().toLowerCase();

  const filtered = state.classes.filter((classItem) => {
      const matchesStatus = state.classStatusFilter === "all" || classItem.status === state.classStatusFilter;
      const searchable = [
        classItem.classTitle,
        classItem.subject,
        classItem.targetSchool,
        classItem.targetGrade,
        classItem.accessCode
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!keyword || searchable.includes(keyword));
    });

  return filtered.sort((a, b) => {
    if (state.classSortKey === "title-asc") {
      return a.classTitle.localeCompare(b.classTitle, "ko");
    }

    if (state.classSortKey === "student-desc") {
      return getClassEnrollmentStats(b.classId).active - getClassEnrollmentStats(a.classId).active;
    }

    if (state.classSortKey === "session-desc") {
      return getVisibleClassSessionCount(b.classId) - getVisibleClassSessionCount(a.classId);
    }

    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

function getFilteredStudents() {
  const keyword = state.studentSearchTerm.trim().toLowerCase();

  const filtered = state.students.filter((student) => {
      const matchesStatus = state.studentStatusFilter === "all" || student.status === state.studentStatusFilter;
      const searchable = [
        student.studentName,
        student.school,
        student.grade,
        formatPhone(student.phone),
        student.memo
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!keyword || searchable.includes(keyword));
    });

  return filtered.sort((a, b) => {
    if (state.studentSortKey === "name-asc") {
      return a.studentName.localeCompare(b.studentName, "ko");
    }

    if (state.studentSortKey === "class-desc") {
      return getStudentEnrollments(b.studentId).length - getStudentEnrollments(a.studentId).length;
    }

    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

function getFilteredClassSessions(classId) {
  const keyword = state.sessionSearchTerm.trim().toLowerCase();
  const filtered = state.sessions.filter((session) => {
    const matchesClass = session.classId === classId;
    const matchesStatus = state.sessionStatusFilter === "all" || session.status === state.sessionStatusFilter;
    const searchable = [
      session.sessionTitle,
      session.sessionDate,
      session.summary,
      session.lessonVideoUrl
    ]
      .join(" ")
      .toLowerCase();

    return matchesClass && matchesStatus && (!keyword || searchable.includes(keyword));
  });

  return filtered.sort((a, b) => {
    if (state.sessionSortKey === "title-asc") {
      return a.sessionTitle.localeCompare(b.sessionTitle, "ko");
    }

    if (state.sessionSortKey === "updated-desc") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }

    return String(b.sessionDate || "").localeCompare(String(a.sessionDate || ""));
  });
}

function openModal(title, bodyHtml, bindControls) {
  let modal = document.querySelector("#admin-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "admin-modal";
    modal.className = "modal-backdrop";
    document.body.appendChild(modal);
  }

  modal.hidden = false;
  modal.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="panel-title">
        <h3 id="modal-title">${escapeHtml(title)}</h3>
        <button class="text-button" type="button" data-close-modal>닫기</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    </div>
  `;

  modal.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  if (typeof bindControls === "function") {
    bindControls(modal);
  }
}

function closeModal() {
  const modal = document.querySelector("#admin-modal");
  if (!modal) {
    return;
  }

  modal.hidden = true;
  modal.innerHTML = "";
}

function confirmDelete(message) {
  return window.confirm(message);
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
  const filteredClasses = getFilteredClasses();
  elements.classCountLabel.textContent = `${filteredClasses.length}/${state.classes.length}개`;
  const activeClassCount = state.classes.filter((classItem) => classItem.status === "active").length;
  const readyClassCount = state.classes.filter((classItem) => classItem.status === "ready").length;
  const totalActiveStudents = state.classes.reduce((total, classItem) => total + getClassEnrollmentStats(classItem.classId).active, 0);
  const classToolbar = renderToolbar({
    searchId: "class-search-input",
    searchValue: state.classSearchTerm,
    searchPlaceholder: "수업명, 학교, 과목 검색",
    filterId: "class-status-filter",
    filterValue: state.classStatusFilter,
    filterLabel: "수업 상태 필터",
    filterOptions: [
      { value: "all", label: "전체 상태" },
      ...Object.entries(CLASS_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    ],
    sortId: "class-sort-select",
    sortValue: state.classSortKey,
    sortOptions: [
      { value: "updated-desc", label: "최근 수정순" },
      { value: "title-asc", label: "수업명순" },
      { value: "student-desc", label: "학생 많은순" },
      { value: "session-desc", label: "회차 많은순" }
    ]
  });

  if (!state.classes.length) {
    elements.classList.innerHTML = `
      ${renderSummaryItems([
        { label: "전체 수업", value: "0개" },
        { label: "운영중", value: "0개" },
        { label: "등록 학생", value: "0명" }
      ])}
      ${classToolbar}
      <div class="empty-state">등록된 수업이 없습니다. 새 수업 만들기 버튼으로 첫 수업을 추가하세요.</div>
    `;
    elements.classDetail.innerHTML = '<div class="empty-state">수업을 선택하면 상세 정보가 표시됩니다.</div>';
    bindClassListControls();
    return;
  }

  if (!filteredClasses.length) {
    state.selectedClassId = null;
    elements.classList.innerHTML = `
      ${renderSummaryItems([
        { label: "전체 수업", value: `${state.classes.length}개` },
        { label: "운영중", value: `${activeClassCount}개` },
        { label: "준비중", value: `${readyClassCount}개` },
        { label: "등록 학생", value: `${totalActiveStudents}명` }
      ])}
      ${classToolbar}
      <div class="empty-state">검색 조건에 맞는 수업이 없습니다.</div>
    `;
    elements.classDetail.innerHTML = '<div class="empty-state">목록에서 수업을 선택하면 상세 정보가 표시됩니다.</div>';
    bindClassListControls();
    return;
  }

  if (!state.selectedClassId || !filteredClasses.some((classItem) => classItem.classId === state.selectedClassId)) {
    state.selectedClassId = filteredClasses[0].classId;
  }

  elements.classList.innerHTML = `
    ${renderSummaryItems([
      { label: "전체 수업", value: `${state.classes.length}개` },
      { label: "운영중", value: `${activeClassCount}개` },
      { label: "준비중", value: `${readyClassCount}개` },
      { label: "등록 학생", value: `${totalActiveStudents}명` }
    ])}
    ${classToolbar}
    <div class="table-list">
      ${filteredClasses
        .map((classItem) => {
          const enrollmentStats = getClassEnrollmentStats(classItem.classId);
          const sessionCount = getVisibleClassSessionCount(classItem.classId);

          return `
            <button class="table-row table-row-class ${classItem.classId === state.selectedClassId ? "is-selected" : ""}" type="button" data-class-id="${classItem.classId}">
              <div>
                <strong>${escapeHtml(classItem.classTitle)}</strong>
                <span>${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)}</span>
              </div>
              <div>
                <strong>${enrollmentStats.active}명</strong>
                <span>학생 수</span>
              </div>
              <div>
                <strong>${sessionCount}개</strong>
                <span>회차 수</span>
              </div>
              <div>
                <span class="${getStatusClass(classItem.status)}">${CLASS_STATUS_LABELS[classItem.status]}</span>
              </div>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  bindClassListControls();

  renderClassDetail();
}

function bindClassListControls() {
  const searchInput = document.querySelector("#class-search-input");
  const statusFilter = document.querySelector("#class-status-filter");
  const sortSelect = document.querySelector("#class-sort-select");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.classSearchTerm = searchInput.value;
      renderClassList();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      state.classStatusFilter = statusFilter.value;
      renderClassList();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.classSortKey = sortSelect.value;
      renderClassList();
    });
  }

  document.querySelectorAll("[data-class-id]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedClassId = row.dataset.classId;
      state.enrollmentPickerClassId = null;
      state.enrollmentNotice = "";
      state.selectedSessionId = null;
      state.editingSessionId = null;
      state.sessionFormClassId = null;
      state.sessionNotice = "";
      state.classDetailTab = "info";
      hideClassForm();
      render();
    });
  });
}

function renderClassDetail() {
  const classItem = state.classes.find((item) => item.classId === state.selectedClassId);

  if (!classItem) {
    elements.classDetail.innerHTML = '<div class="empty-state">수업을 선택하면 상세 정보가 표시됩니다.</div>';
    return;
  }

  const enrollmentStats = getClassEnrollmentStats(classItem.classId);
  const sessionCount = getVisibleClassSessionCount(classItem.classId);
  const activeTab = state.classDetailTab || "info";

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

      ${renderClassTabs(activeTab)}
      ${activeTab === "students" ? renderClassStudentsTab(classItem.classId, enrollmentStats) : ""}
      ${activeTab === "sessions" ? renderSessionManagement(classItem.classId) : ""}
      ${activeTab === "materials" ? renderFutureMaterialsTab() : ""}
      ${activeTab === "info" ? renderClassInfoTab(classItem, enrollmentStats, sessionCount) : ""}
    </div>
  `;

  bindClassDetailControls(classItem.classId);
  bindEnrollmentControls();
  bindSessionControls();
}

function renderClassTabs(activeTab) {
  const tabs = [
    ["info", "기본 정보"],
    ["students", "학생 관리"],
    ["sessions", "회차 관리"],
    ["materials", "자료 관리 예정"]
  ];

  return `
    <div class="tab-list" role="tablist" aria-label="수업 상세 메뉴">
      ${tabs
        .map(([value, label]) => `<button class="tab-button ${activeTab === value ? "is-active" : ""}" type="button" data-class-tab="${value}">${label}</button>`)
        .join("")}
    </div>
  `;
}

function renderFutureMaterialsTab() {
  return `
    <div class="detail-section">
      <div class="question-placeholder">
        자료/교재 관리와 문항 관리는 다음 단계에서 추가됩니다. 현재 작업에서는 구조 방향만 기록합니다.
      </div>
    </div>
  `;
}

function renderClassInfoTab(classItem, enrollmentStats, sessionCount) {
  return `
    <div class="detail-section">
      <div class="detail-row">
        <span>과목</span>
        <strong>${escapeHtml(classItem.subject)}</strong>
      </div>
      <div class="detail-row">
        <span>대상</span>
        <strong>${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)}</strong>
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
        <span>등록 학생</span>
        <strong>수강중 ${enrollmentStats.active}명</strong>
      </div>
      <div class="detail-row">
        <span>회차 수</span>
        <strong>${sessionCount}개</strong>
      </div>
      <div class="detail-row">
        <span>수정일</span>
        <strong>${formatDate(classItem.updatedAt)}</strong>
      </div>

      <div class="detail-description">
        ${escapeHtml(classItem.description || "수업 설명이 없습니다.")}
      </div>

      <div class="planned-link">
        <span class="planned-link-label">학생용 예정 링크</span>
        <code>${getStudentPreviewLink(classItem)}</code>
        <small>학생 로그인 기능은 아직 연결되지 않았습니다. 이번 화면에서는 링크를 표시만 합니다.</small>
      </div>

      <div class="detail-actions">
        <button id="edit-selected-class" class="secondary-button" type="button">수업 수정</button>
      </div>
      <div class="danger-zone">
        <span>위험 구역</span>
        <small>수업을 삭제하면 배정 학생 정보와 회차 정보도 함께 삭제됩니다.</small>
        <button class="danger-button" type="button" data-delete-class-id="${classItem.classId}">수업 삭제</button>
      </div>
    </div>
  `;
}

function renderClassStudentsTab(classId, enrollmentStats) {
  return `
    <div class="detail-section">
      <div class="enrollment-summary">
        <strong>수업별 등록 학생</strong>
        <span>수강중 ${enrollmentStats.active}명 / 일시중지 ${enrollmentStats.paused}명 / 수강종료 ${enrollmentStats.ended}명</span>
      </div>
      <div class="detail-actions">
        <button id="add-student-to-class" class="secondary-button" type="button">학생 추가</button>
      </div>
      ${state.enrollmentNotice ? `<div class="form-info">${escapeHtml(state.enrollmentNotice)}</div>` : ""}
      ${renderClassEnrollmentList(classId)}
    </div>
  `;
}

function bindClassDetailControls(classId) {
  document.querySelectorAll("[data-class-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.classDetailTab = button.dataset.classTab;
      renderClassDetail();
    });
  });

  const editClassButton = document.querySelector("#edit-selected-class");
  if (editClassButton) {
    editClassButton.addEventListener("click", () => {
      showEditClassForm(classId);
    });
  }

  const addStudentButton = document.querySelector("#add-student-to-class");
  if (addStudentButton) {
    addStudentButton.addEventListener("click", () => {
      showEnrollmentModal(classId);
    });
  }

  document.querySelectorAll("[data-delete-class-id]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteClass(button.dataset.deleteClassId);
    });
  });
}

function renderSessionManagement(classId) {
  const sessionCount = getVisibleClassSessionCount(classId);
  const sessions = getFilteredClassSessions(classId);
  const videoCount = state.sessions.filter((session) => session.classId === classId && session.lessonVideoUrl).length;
  const publicCount = state.sessions.filter((session) => session.classId === classId && session.status === "public").length;
  const sessionToolbar = renderToolbar({
    searchId: "session-search-input",
    searchValue: state.sessionSearchTerm,
    searchPlaceholder: "회차명, 날짜, 요약 검색",
    filterId: "session-status-filter",
    filterValue: state.sessionStatusFilter,
    filterLabel: "회차 상태 필터",
    filterOptions: [
      { value: "all", label: "전체 상태" },
      ...Object.entries(SESSION_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    ],
    sortId: "session-sort-select",
    sortValue: state.sessionSortKey,
    sortOptions: [
      { value: "date-desc", label: "최신 날짜순" },
      { value: "updated-desc", label: "최근 수정순" },
      { value: "title-asc", label: "회차명순" }
    ]
  });

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
      ${renderSummaryItems([
        { label: "표시 회차", value: `${sessions.length}개` },
        { label: "숨김 제외", value: `${sessionCount}개` },
        { label: "영상 등록", value: `${videoCount}개` },
        { label: "공개", value: `${publicCount}개` }
      ])}
      ${sessionToolbar}
      ${renderSessionList(classId, sessions)}
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
    <form id="session-form" class="modal-form session-form" data-class-id="${escapeHtml(classId)}">
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
      ${
        isEditing
          ? `<div class="danger-zone">
              <span>위험 구역</span>
              <small>이 회차를 삭제하면 되돌릴 수 없습니다.</small>
              <button class="danger-button" type="button" data-delete-session-id="${editingSession.sessionId}">회차 삭제</button>
            </div>`
          : ""
      }
    </form>
  `;
}

function renderSessionList(classId, sessions = getFilteredClassSessions(classId)) {
  if (!sessions.length) {
    return '<div class="empty-state">조건에 맞는 회차가 없습니다. 회차 추가 버튼으로 회차를 등록하세요.</div>';
  }

  return `
    <div class="table-list session-table">
      ${sessions
        .map((session) => {
          const isSelected = session.sessionId === state.selectedSessionId;
          const videoState = session.lessonVideoUrl ? "영상 등록됨" : "영상 준비중";
          const statusLabel = SESSION_STATUS_LABELS[session.status] || session.status;

          return `
            <div class="table-row table-row-session ${isSelected ? "is-selected" : ""}">
              <div>
                <strong>${escapeHtml(session.sessionTitle)}</strong>
                <span>${escapeHtml(truncateSummary(session.summary, 36))}</span>
              </div>
              <div>
                <strong>${formatSessionDate(session.sessionDate)}</strong>
                <span>날짜</span>
              </div>
              <div>
                <span class="video-state">${videoState}</span>
              </div>
              <div>
                <strong>준비중</strong>
                <span>자료 수</span>
              </div>
              <div>
                <span class="question-state">문항 준비중</span>
              </div>
              <div>
                <span class="${getStatusClass(session.status)}">${escapeHtml(statusLabel)}</span>
              </div>
              <div class="table-actions">
                <button class="text-button" type="button" data-session-detail-id="${session.sessionId}">상세</button>
                <button class="text-button" type="button" data-session-edit-id="${session.sessionId}">수정</button>
                <button class="danger-button" type="button" data-delete-session-id="${session.sessionId}">삭제</button>
              </div>
            </div>
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
      <div class="danger-zone">
        <span>위험 구역</span>
        <small>이 회차를 삭제하면 되돌릴 수 없습니다.</small>
        <button class="danger-button" type="button" data-delete-session-id="${session.sessionId}">회차 삭제</button>
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
  const filteredStudents = getFilteredStudents();
  elements.studentCountLabel.textContent = `${filteredStudents.length}/${state.students.length}명`;
  const activeStudentCount = state.students.filter((student) => student.status === "active").length;
  const pausedStudentCount = state.students.filter((student) => student.status === "paused").length;
  const totalEnrollments = state.enrollments.filter((enrollment) => enrollment.status !== "ended").length;
  const studentToolbar = renderToolbar({
    searchId: "student-search-input",
    searchValue: state.studentSearchTerm,
    searchPlaceholder: "이름, 학교, 전화번호 검색",
    filterId: "student-status-filter",
    filterValue: state.studentStatusFilter,
    filterLabel: "학생 상태 필터",
    filterOptions: [
      { value: "all", label: "전체 상태" },
      ...Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    ],
    sortId: "student-sort-select",
    sortValue: state.studentSortKey,
    sortOptions: [
      { value: "updated-desc", label: "최근 수정순" },
      { value: "name-asc", label: "이름순" },
      { value: "class-desc", label: "수강 수업 많은순" }
    ]
  });

  if (!state.students.length) {
    elements.studentList.innerHTML = `
      ${renderSummaryItems([
        { label: "전체 학생", value: "0명" },
        { label: "수강중", value: "0명" },
        { label: "수강 배정", value: "0개" }
      ])}
      ${studentToolbar}
      <div class="empty-state">아직 등록된 학생이 없습니다. 학생 등록 버튼을 눌러 첫 학생을 추가하세요.</div>
    `;
    elements.studentDetail.innerHTML = '<div class="empty-state">학생을 선택하면 상세 정보가 표시됩니다.</div>';
    bindStudentListControls();
    return;
  }

  if (!filteredStudents.length) {
    state.selectedStudentId = null;
    elements.studentList.innerHTML = `
      ${renderSummaryItems([
        { label: "전체 학생", value: `${state.students.length}명` },
        { label: "수강중", value: `${activeStudentCount}명` },
        { label: "일시중지", value: `${pausedStudentCount}명` },
        { label: "수강 배정", value: `${totalEnrollments}개` }
      ])}
      ${studentToolbar}
      <div class="empty-state">검색 조건에 맞는 학생이 없습니다.</div>
    `;
    elements.studentDetail.innerHTML = '<div class="empty-state">목록에서 학생을 선택하면 상세 정보가 표시됩니다.</div>';
    bindStudentListControls();
    return;
  }

  if (!state.selectedStudentId || !filteredStudents.some((student) => student.studentId === state.selectedStudentId)) {
    state.selectedStudentId = filteredStudents[0].studentId;
  }

  elements.studentList.innerHTML = `
    ${renderSummaryItems([
      { label: "전체 학생", value: `${state.students.length}명` },
      { label: "수강중", value: `${activeStudentCount}명` },
      { label: "일시중지", value: `${pausedStudentCount}명` },
      { label: "수강 배정", value: `${totalEnrollments}개` }
    ])}
    ${studentToolbar}
    <div class="table-list">
      ${filteredStudents
        .map((student) => {
          const enrollments = getStudentEnrollments(student.studentId);

          return `
            <button class="table-row table-row-student ${student.studentId === state.selectedStudentId ? "is-selected" : ""}" type="button" data-student-id="${student.studentId}">
              <div>
                <strong>${escapeHtml(student.studentName)}</strong>
                <span>이름</span>
              </div>
              <div>
                <strong>${escapeHtml(student.school)}</strong>
                <span>학교</span>
              </div>
              <div>
                <strong>${escapeHtml(student.grade)}</strong>
                <span>학년</span>
              </div>
              <div>
                <strong>${escapeHtml(formatPhone(student.phone))}</strong>
                <span>전화번호</span>
              </div>
              <div>
                <strong>${enrollments.length}개</strong>
                <span>수강 수업</span>
              </div>
              <div>
                <span class="${getStatusClass(student.status)}">${STUDENT_STATUS_LABELS[student.status]}</span>
              </div>
              <div>
                <strong>상세</strong>
              </div>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  bindStudentListControls();

  renderStudentDetail();
}

function bindStudentListControls() {
  const searchInput = document.querySelector("#student-search-input");
  const statusFilter = document.querySelector("#student-status-filter");
  const sortSelect = document.querySelector("#student-sort-select");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.studentSearchTerm = searchInput.value;
      renderStudentList();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      state.studentStatusFilter = statusFilter.value;
      renderStudentList();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.studentSortKey = sortSelect.value;
      renderStudentList();
    });
  }

  document.querySelectorAll("[data-student-id]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedStudentId = row.dataset.studentId;
      hideStudentForm();
      render();
    });
  });
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

      <div class="detail-actions">
        <button id="edit-selected-student" class="secondary-button" type="button">학생 수정</button>
      </div>
      <div class="danger-zone">
        <span>위험 구역</span>
        <small>학생을 삭제하면 수업 배정 정보도 함께 삭제됩니다.</small>
        <button class="danger-button" type="button" data-delete-student-id="${student.studentId}">학생 삭제</button>
      </div>
    </div>
  `;

  document.querySelector("#edit-selected-student").addEventListener("click", () => {
    showEditStudentForm(student.studentId);
  });

  document.querySelector("[data-delete-student-id]").addEventListener("click", () => {
    deleteStudent(student.studentId);
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

function renderClassForm(values, isEditing) {
  return `
    <form id="class-form-modal" class="modal-form">
      <div class="form-grid">
        <label>
          <span>수업명</span>
          <input name="classTitle" type="text" value="${escapeHtml(values.classTitle)}" required>
        </label>
        <label>
          <span>과목</span>
          <input name="subject" type="text" value="${escapeHtml(values.subject)}" required>
        </label>
        <label>
          <span>대상 학교</span>
          <input name="targetSchool" type="text" value="${escapeHtml(values.targetSchool)}" required>
        </label>
        <label>
          <span>대상 학년</span>
          <select name="targetGrade" required>
            ${["중1", "중2", "중3", "고1", "고2", "고3"]
              .map((grade) => `<option value="${grade}" ${values.targetGrade === grade ? "selected" : ""}>${grade}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>수업 유형</span>
          <select name="classType" required>
            ${["내신 대비", "정규 수업", "특강", "복습 관리"]
              .map((type) => `<option value="${type}" ${values.classType === type ? "selected" : ""}>${type}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>수업 코드</span>
          <input name="accessCode" type="text" value="${escapeHtml(values.accessCode)}" required>
        </label>
        <label>
          <span>상태</span>
          <select name="status" required>
            ${Object.entries(CLASS_STATUS_LABELS)
              .map(([value, label]) => `<option value="${value}" ${values.status === value ? "selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>
      </div>
      <label class="wide-field">
        <span>수업 설명</span>
        <textarea name="description" rows="4">${escapeHtml(values.description)}</textarea>
      </label>
      <div class="form-actions">
        <button class="primary-button" type="submit">저장</button>
        <button class="secondary-button" type="button" data-close-modal>취소</button>
      </div>
      ${
        isEditing
          ? `<div class="danger-zone">
              <span>위험 구역</span>
              <small>수업을 삭제하면 배정 학생 정보와 회차 정보도 함께 삭제됩니다.</small>
              <button class="danger-button" type="button" data-delete-class-id="${values.classId}">수업 삭제</button>
            </div>`
          : ""
      }
    </form>
  `;
}

function showCreateClassForm() {
  state.editingClassId = null;
  const values = {
    classTitle: "",
    subject: "",
    targetSchool: "",
    targetGrade: "고1",
    classType: "내신 대비",
    description: "",
    accessCode: "",
    status: "active"
  };

  openModal("새 수업 만들기", renderClassForm(values, false), (modal) => {
    modal.querySelector("#class-form-modal").addEventListener("submit", handleClassFormSubmit);
  });
}

function showEditClassForm(classId) {
  const classItem = state.classes.find((item) => item.classId === classId);
  if (!classItem) {
    return;
  }

  state.editingClassId = classId;
  openModal("수업 수정", renderClassForm(classItem, true), (modal) => {
    modal.querySelector("#class-form-modal").addEventListener("submit", handleClassFormSubmit);
    modal.querySelector("[data-delete-class-id]").addEventListener("click", () => {
      deleteClass(classId);
    });
  });
}

function hideClassForm() {
  state.editingClassId = null;
  if (elements.classForm) {
    elements.classForm.reset();
  }
  if (elements.classFormPanel) {
    elements.classFormPanel.hidden = true;
  }
}

function showCreateSessionForm(classId) {
  if (!getClassById(classId)) {
    return;
  }

  state.sessionFormClassId = classId;
  state.editingSessionId = null;
  state.sessionNotice = "";
  openModal("회차 추가", renderSessionForm(classId), (modal) => {
    modal.querySelector("#session-form").addEventListener("submit", (event) => {
      handleSessionFormSubmit(event, classId);
    });
    modal.querySelector("#cancel-session-form").addEventListener("click", closeModal);
  });
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
  openModal("회차 수정", renderSessionForm(session.classId), (modal) => {
    modal.querySelector("#session-form").addEventListener("submit", (event) => {
      handleSessionFormSubmit(event, session.classId);
    });
    modal.querySelector("#cancel-session-form").addEventListener("click", closeModal);
    modal.querySelector("[data-delete-session-id]").addEventListener("click", () => {
      deleteSession(session.sessionId);
    });
  });
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

function renderStudentForm(values, isEditing) {
  return `
    <form id="student-form-modal" class="modal-form">
      <div id="student-modal-form-error" class="form-error" role="alert" hidden></div>
      <div class="form-grid">
        <label>
          <span>학생 이름</span>
          <input name="studentName" type="text" value="${escapeHtml(values.studentName)}" required>
        </label>
        <label>
          <span>학생 전화번호</span>
          <input name="phone" type="tel" value="${escapeHtml(formatPhone(values.phone))}" required>
        </label>
        <label>
          <span>학교</span>
          <input name="school" type="text" value="${escapeHtml(values.school)}" required>
        </label>
        <label>
          <span>학년</span>
          <select name="grade" required>
            ${["중1", "중2", "중3", "고1", "고2", "고3"]
              .map((grade) => `<option value="${grade}" ${values.grade === grade ? "selected" : ""}>${grade}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          <span>학부모 연락처</span>
          <input name="parentPhone" type="tel" value="${escapeHtml(values.parentPhone)}">
        </label>
        <label>
          <span>상태</span>
          <select name="status">
            ${Object.entries(STUDENT_STATUS_LABELS)
              .map(([value, label]) => `<option value="${value}" ${values.status === value ? "selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>
      </div>
      <label class="wide-field">
        <span>메모 / 학습 특이사항</span>
        <textarea name="memo" rows="4">${escapeHtml(values.memo)}</textarea>
      </label>
      <div class="form-actions">
        <button class="primary-button" type="submit">저장</button>
        <button class="secondary-button" type="button" data-close-modal>취소</button>
      </div>
      ${
        isEditing
          ? `<div class="danger-zone">
              <span>위험 구역</span>
              <small>학생을 삭제하면 수업 배정 정보도 함께 삭제됩니다.</small>
              <button class="danger-button" type="button" data-delete-student-id="${values.studentId}">학생 삭제</button>
            </div>`
          : ""
      }
    </form>
  `;
}

function showCreateStudentForm() {
  state.editingStudentId = null;
  hideStudentFormError();
  const values = {
    studentName: "",
    phone: "",
    school: "",
    grade: "고1",
    parentPhone: "",
    memo: "",
    status: "active"
  };

  openModal("학생 등록", renderStudentForm(values, false), (modal) => {
    modal.querySelector("#student-form-modal").addEventListener("submit", handleStudentFormSubmit);
  });
}

function showEditStudentForm(studentId) {
  const student = state.students.find((item) => item.studentId === studentId);
  if (!student) {
    return;
  }

  state.editingStudentId = studentId;
  hideStudentFormError();
  openModal("학생 수정", renderStudentForm(student, true), (modal) => {
    modal.querySelector("#student-form-modal").addEventListener("submit", handleStudentFormSubmit);
    modal.querySelector("[data-delete-student-id]").addEventListener("click", () => {
      deleteStudent(studentId);
    });
  });
}

function hideStudentForm() {
  state.editingStudentId = null;
  if (elements.studentForm) {
    elements.studentForm.reset();
  }
  hideStudentFormError();
  if (elements.studentFormPanel) {
    elements.studentFormPanel.hidden = true;
  }
}

function showStudentFormError(message) {
  const errorBox = document.querySelector("#student-modal-form-error") || document.querySelector("#student-form-error");
  if (!errorBox) {
    return;
  }

  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideStudentFormError() {
  const errorBox = document.querySelector("#student-modal-form-error") || document.querySelector("#student-form-error");
  if (!errorBox) {
    return;
  }

  errorBox.textContent = "";
  errorBox.hidden = true;
}

function handleClassFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget || elements.classForm);
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
  closeModal();
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
  closeModal();
  render();
}

function handleStudentFormSubmit(event) {
  event.preventDefault();
  hideStudentFormError();

  const formData = new FormData(event.currentTarget || elements.studentForm);
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
  closeModal();
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
  closeModal();
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

function showEnrollmentModal(classId) {
  const classItem = getClassById(classId);
  if (!classItem) {
    return;
  }

  openModal(`${classItem.classTitle} 학생 추가`, renderEnrollmentModalList(classId), () => {
    bindEnrollmentControls();
  });
}

function renderEnrollmentModalList(classId) {
  const visibleStudents = getVisibleStudents();

  if (!visibleStudents.length) {
    return '<div class="empty-state">배정할 수 있는 학생이 없습니다. 학생 관리에서 학생을 먼저 등록하세요.</div>';
  }

  return `
    <div class="picker-list">
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
  `;
}

function deleteStudent(studentId) {
  const student = getStudentById(studentId);
  if (!student || !confirmDelete("이 학생을 삭제하면 학생 정보와 수업 배정 정보가 함께 삭제됩니다. 되돌릴 수 없습니다. 정말 삭제하시겠습니까?")) {
    return;
  }

  state.students = state.students.filter((item) => item.studentId !== studentId);
  state.enrollments = state.enrollments.filter((enrollment) => enrollment.studentId !== studentId);

  if (state.selectedStudentId === studentId) {
    state.selectedStudentId = state.students[0]?.studentId || null;
  }

  saveStudents();
  saveEnrollments();
  closeModal();
  render();
}

function deleteClass(classId) {
  const classItem = getClassById(classId);
  if (!classItem || !confirmDelete("이 수업을 삭제하면 수업 정보, 배정 학생 정보, 회차 정보가 함께 삭제됩니다. 되돌릴 수 없습니다. 정말 삭제하시겠습니까?")) {
    return;
  }

  state.classes = state.classes.filter((item) => item.classId !== classId);
  state.enrollments = state.enrollments.filter((enrollment) => enrollment.classId !== classId);
  state.sessions = state.sessions.filter((session) => session.classId !== classId);

  if (state.selectedClassId === classId) {
    state.selectedClassId = state.classes[0]?.classId || null;
    state.classDetailTab = "info";
  }

  state.selectedSessionId = null;
  state.editingSessionId = null;
  state.sessionFormClassId = null;
  state.enrollmentPickerClassId = null;
  state.enrollmentNotice = "";
  state.sessionNotice = "";

  saveClasses();
  saveEnrollments();
  saveSessions();
  closeModal();
  render();
}

function deleteSession(sessionId) {
  const session = getSessionById(sessionId);
  if (!session || !confirmDelete("이 회차를 삭제하면 회차 정보가 삭제됩니다. 되돌릴 수 없습니다. 정말 삭제하시겠습니까?")) {
    return;
  }

  state.sessions = state.sessions.filter((item) => item.sessionId !== sessionId);

  if (state.selectedSessionId === sessionId) {
    state.selectedSessionId = null;
  }

  if (state.editingSessionId === sessionId) {
    state.editingSessionId = null;
    state.sessionFormClassId = null;
  }

  saveSessions();
  closeModal();
  render();
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
  const searchInput = document.querySelector("#session-search-input");
  const statusFilter = document.querySelector("#session-status-filter");
  const sortSelect = document.querySelector("#session-sort-select");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.sessionSearchTerm = searchInput.value;
      renderClassDetail();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      state.sessionStatusFilter = statusFilter.value;
      renderClassDetail();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sessionSortKey = sortSelect.value;
      renderClassDetail();
    });
  }

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

  document.querySelectorAll("[data-delete-session-id]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteSession(button.dataset.deleteSessionId);
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
