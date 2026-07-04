const STORAGE_KEY = "jmAdminClasses.v1";

const STATUS_LABELS = {
  active: "운영중",
  ready: "준비중",
  ended: "종료",
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
  selectedClassId: null,
  editingClassId: null
};

const elements = {
  navButtons: document.querySelectorAll(".nav-button"),
  viewTitle: document.querySelector("#view-title"),
  dashboardView: document.querySelector("#dashboard-view"),
  classesView: document.querySelector("#classes-view"),
  activeClassCount: document.querySelector("#active-class-count"),
  recentWorkList: document.querySelector("#recent-work-list"),
  newClassButton: document.querySelector("#new-class-button"),
  classFormPanel: document.querySelector("#class-form-panel"),
  formTitle: document.querySelector("#form-title"),
  classForm: document.querySelector("#class-form"),
  cancelFormButton: document.querySelector("#cancel-form-button"),
  classList: document.querySelector("#class-list"),
  classCountLabel: document.querySelector("#class-count-label"),
  classDetail: document.querySelector("#class-detail")
};

function loadClasses() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const initialClasses = [...starterClasses];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClasses));
    return initialClasses;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...starterClasses];
  } catch (error) {
    const initialClasses = [...starterClasses];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialClasses));
    return initialClasses;
  }
}

function saveClasses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.classes));
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

function getStatusClass(status) {
  return `status-badge status-${status}`;
}

function getStudentPreviewLink(classItem) {
  return `/student/login?classCode=${encodeURIComponent(classItem.accessCode)}`;
}

function switchView(viewName) {
  elements.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });

  elements.dashboardView.classList.toggle("is-active", viewName === "dashboard");
  elements.classesView.classList.toggle("is-active", viewName === "classes");
  elements.viewTitle.textContent = viewName === "classes" ? "수업 관리" : "대시보드";
}

function renderDashboard() {
  const activeCount = state.classes.filter((classItem) => classItem.status === "active").length;
  elements.activeClassCount.textContent = activeCount;

  const recentClasses = [...state.classes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  if (!recentClasses.length) {
    elements.recentWorkList.innerHTML = '<div class="empty-state">아직 최근 작업이 없습니다. 수업을 만들면 이 영역에 임시로 표시됩니다.</div>';
    return;
  }

  elements.recentWorkList.innerHTML = recentClasses
    .map((classItem) => `
      <div class="recent-item">
        <strong>${escapeHtml(classItem.classTitle)}</strong>
        <span>${STATUS_LABELS[classItem.status]} - ${formatDate(classItem.updatedAt)}</span>
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
    .map((classItem) => `
      <button class="class-card ${classItem.classId === state.selectedClassId ? "is-selected" : ""}" type="button" data-class-id="${classItem.classId}">
        <h4>${escapeHtml(classItem.classTitle)}</h4>
        <p>${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)} - ${escapeHtml(classItem.subject)}</p>
        <div class="card-footer">
          <span class="${getStatusClass(classItem.status)}">${STATUS_LABELS[classItem.status]}</span>
          <span class="class-meta">수업 코드 ${escapeHtml(classItem.accessCode)}</span>
        </div>
      </button>
    `)
    .join("");

  document.querySelectorAll(".class-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedClassId = card.dataset.classId;
      hideForm();
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

  elements.classDetail.innerHTML = `
    <div class="detail-content">
      <div class="panel-title">
        <h3>수업 상세</h3>
        <span class="${getStatusClass(classItem.status)}">${STATUS_LABELS[classItem.status]}</span>
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

      <div class="detail-description">
        ${escapeHtml(classItem.description || "수업 설명이 없습니다.")}
      </div>

      <div class="planned-link">
        <span class="planned-link-label">학생용 예정 링크</span>
        <code>${getStudentPreviewLink(classItem)}</code>
        <small>학생 로그인 기능은 아직 연결되지 않았습니다. 이번 화면에서는 링크를 표시만 합니다.</small>
      </div>

      <button id="edit-selected-class" class="secondary-button" type="button">수업 수정</button>
    </div>
  `;

  document.querySelector("#edit-selected-class").addEventListener("click", () => {
    showEditForm(classItem.classId);
  });
}

function showCreateForm() {
  state.editingClassId = null;
  elements.formTitle.textContent = "새 수업 만들기";
  elements.classForm.reset();
  elements.classForm.status.value = "active";
  elements.classFormPanel.hidden = false;
  elements.classFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showEditForm(classId) {
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

function hideForm() {
  state.editingClassId = null;
  elements.classForm.reset();
  elements.classFormPanel.hidden = true;
}

function handleFormSubmit(event) {
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
  hideForm();
  render();
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

  elements.newClassButton.addEventListener("click", showCreateForm);
  elements.cancelFormButton.addEventListener("click", hideForm);
  elements.classForm.addEventListener("submit", handleFormSubmit);
}

function render() {
  renderDashboard();
  renderClassList();
}

function init() {
  state.classes = loadClasses();
  state.selectedClassId = state.classes[0]?.classId || null;
  bindEvents();
  render();
}

init();
