const CLASS_STORAGE_KEY = "jmAdminClasses.v1";
const STUDENT_STORAGE_KEY = "jmAdminStudents.v1";

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
  selectedClassId: null,
  selectedStudentId: null,
  editingClassId: null,
  editingStudentId: null
};

const elements = {
  navButtons: document.querySelectorAll(".nav-button"),
  viewTitle: document.querySelector("#view-title"),
  dashboardView: document.querySelector("#dashboard-view"),
  classesView: document.querySelector("#classes-view"),
  studentsView: document.querySelector("#students-view"),
  activeClassCount: document.querySelector("#active-class-count"),
  registeredStudentCount: document.querySelector("#registered-student-count"),
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

function saveClasses() {
  localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(state.classes));
}

function saveStudents() {
  localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(state.students));
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
  elements.activeClassCount.textContent = activeCount;
  elements.registeredStudentCount.textContent = visibleStudentCount;

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
    .map((classItem) => `
      <button class="class-card ${classItem.classId === state.selectedClassId ? "is-selected" : ""}" type="button" data-class-id="${classItem.classId}">
        <h4>${escapeHtml(classItem.classTitle)}</h4>
        <p>${escapeHtml(classItem.targetSchool)} ${escapeHtml(classItem.targetGrade)} - ${escapeHtml(classItem.subject)}</p>
        <div class="card-footer">
          <span class="${getStatusClass(classItem.status)}">${CLASS_STATUS_LABELS[classItem.status]}</span>
          <span class="class-meta">수업 코드 ${escapeHtml(classItem.accessCode)}</span>
        </div>
      </button>
    `)
    .join("");

  document.querySelectorAll(".class-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedClassId = card.dataset.classId;
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
    showEditClassForm(classItem.classId);
  });
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

      <button id="edit-selected-student" class="secondary-button" type="button">학생 수정</button>
    </div>
  `;

  document.querySelector("#edit-selected-student").addEventListener("click", () => {
    showEditStudentForm(student.studentId);
  });
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
  state.selectedClassId = state.classes[0]?.classId || null;
  state.selectedStudentId = state.students[0]?.studentId || null;
  bindEvents();
  render();
}

init();
