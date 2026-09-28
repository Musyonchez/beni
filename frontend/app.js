// Plain-JS frontend for the Peer Tutoring & Study Group Matcher.
// No build step: talks to the backend REST API with fetch() and re-renders
// the relevant panel after each action.

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  courses: [],
};

async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function setMsg(name, text, kind) {
  const el = document.querySelector(`.form-msg[data-for="${name}"]`);
  if (!el) return;
  el.textContent = text || '';
  el.className = `form-msg ${kind || ''}`;
}

function setSession(token, user) {
  state.token = token;
  state.user = user;
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  renderShell();
}

function renderShell() {
  const authView = document.getElementById('authView');
  const dashView = document.getElementById('dashboardView');
  const userBox = document.getElementById('userBox');

  if (state.user) {
    authView.classList.add('hidden');
    dashView.classList.remove('hidden');
    userBox.innerHTML = `<span>${escapeHtml(state.user.name)}${state.user.isAdmin ? ' (admin)' : ''}</span>
      <button id="logoutBtn">Log out</button>`;
    document.getElementById('logoutBtn').addEventListener('click', () => setSession(null, null));
    document.getElementById('adminTabBtn').hidden = !state.user.isAdmin;
    loadCourses().then(() => {
      switchTab(document.querySelector('.tab-btn.active')?.dataset.tab || 'find');
    });
  } else {
    authView.classList.remove('hidden');
    dashView.classList.add('hidden');
    userBox.innerHTML = '';
  }
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

// ---- Courses ----

async function loadCourses() {
  const { courses } = await api('/courses', { auth: false });
  state.courses = courses;
  const selects = [
    document.getElementById('findCourseSelect'),
    document.getElementById('tutorCourseSelect'),
    document.getElementById('requestCourseSelect'),
  ];
  for (const select of selects) {
    if (!select) continue;
    select.innerHTML = courses
      .map((c) => `<option value="${c.id}">${escapeHtml(c.code)} — ${escapeHtml(c.name)}</option>`)
      .join('');
  }
}

// ---- Tabs ----

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== `tab-${tab}`);
  });

  if (tab === 'find') renderTutorResults();
  if (tab === 'tutor') loadMyTutorProfiles();
  if (tab === 'requests') loadMyRequests();
  if (tab === 'sessions') loadMySessions();
  if (tab === 'admin' && state.user?.isAdmin) loadAdmin();
}

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ---- Auth ----

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const { token, user } = await api('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: form.get('email'), password: form.get('password') },
    });
    setMsg('login', '', '');
    setSession(token, user);
  } catch (err) {
    setMsg('login', err.message, 'error');
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    const { token, user } = await api('/auth/register', {
      method: 'POST',
      auth: false,
      body: {
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      },
    });
    setMsg('register', '', '');
    setSession(token, user);
  } catch (err) {
    setMsg('register', err.message, 'error');
  }
});

// ---- Find a tutor ----

document.getElementById('findTutorsBtn').addEventListener('click', () => renderTutorResults());

async function renderTutorResults() {
  const container = document.getElementById('tutorResults');
  const courseId = document.getElementById('findCourseSelect').value;
  if (!courseId) return;
  container.innerHTML = '<p class="empty">Loading…</p>';

  const { tutorProfiles } = await api(`/tutors?courseId=${courseId}`, { auth: false });
  if (!tutorProfiles.length) {
    container.innerHTML = '<p class="empty">No tutors registered for this course yet.</p>';
    return;
  }

  const template = document.getElementById('tutorCardTemplate');
  container.innerHTML = '';
  for (const profile of tutorProfiles) {
    const node = template.content.cloneNode(true);
    node.querySelector('.t-name').textContent = profile.tutorName;
    node.querySelector('.t-course').textContent = `${profile.courseCode} — ${profile.courseName}`;
    node.querySelector('.t-bio').textContent = profile.bio || '(no bio provided)';
    node.querySelector('.t-availability').textContent = `Availability: ${profile.availability}`;
    node.querySelector('.t-rating').textContent = profile.avgRating
      ? `★ ${profile.avgRating} (${profile.ratingCount} review${profile.ratingCount === 1 ? '' : 's'})`
      : 'No ratings yet';
    if (!profile.verified) {
      const badge = document.createElement('span');
      badge.className = 'badge unverified';
      badge.textContent = 'Not yet verified';
      node.querySelector('.tutor-card').appendChild(badge);
    }

    const bookBtn = node.querySelector('.t-book-btn');
    const timeInput = node.querySelector('.t-book-time');
    bookBtn.addEventListener('click', async () => {
      if (!timeInput.value) {
        alert('Pick a date/time first.');
        return;
      }
      try {
        await api('/sessions', {
          method: 'POST',
          body: {
            tutorId: profile.userId,
            courseId: profile.courseId,
            scheduledTime: new Date(timeInput.value).toISOString(),
          },
        });
        alert('Session booked! Check "My Sessions".');
      } catch (err) {
        alert(err.message);
      }
    });

    container.appendChild(node);
  }
}

// ---- Become a tutor ----

document.getElementById('tutorForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/tutors', {
      method: 'POST',
      body: {
        courseId: Number(form.get('courseId')),
        bio: form.get('bio'),
        availability: form.get('availability'),
      },
    });
    setMsg('tutor', 'Tutor profile saved.', 'success');
    e.target.reset();
    loadMyTutorProfiles();
  } catch (err) {
    setMsg('tutor', err.message, 'error');
  }
});

async function loadMyTutorProfiles() {
  const container = document.getElementById('myTutorProfilesList');
  container.innerHTML = '<p class="empty">Loading…</p>';
  const { tutorProfiles } = await api('/tutors/me');
  if (!tutorProfiles.length) {
    container.innerHTML = '<p class="empty">You haven\'t registered as a tutor for any course yet.</p>';
    return;
  }
  container.innerHTML = tutorProfiles.map((p) => `
    <div class="item-card">
      <h4>${escapeHtml(p.courseCode)} — ${escapeHtml(p.courseName)}</h4>
      <p class="meta">${escapeHtml(p.bio || '(no bio)')}</p>
      <p class="meta">Availability: ${escapeHtml(p.availability)}</p>
      <span class="badge ${p.verified ? 'verified' : 'unverified'}">${p.verified ? 'Verified' : 'Pending verification'}</span>
    </div>
  `).join('');
}

// ---- Request help ----

document.getElementById('requestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('/requests', {
      method: 'POST',
      body: {
        courseId: Number(form.get('courseId')),
        topic: form.get('topic'),
        preferredTimes: form.get('preferredTimes'),
      },
    });
    setMsg('request', 'Request submitted.', 'success');
    e.target.reset();
    loadMyRequests();
  } catch (err) {
    setMsg('request', err.message, 'error');
  }
});

async function loadMyRequests() {
  const container = document.getElementById('myRequestsList');
  container.innerHTML = '<p class="empty">Loading…</p>';
  const { helpRequests } = await api('/requests/me');
  if (!helpRequests.length) {
    container.innerHTML = '<p class="empty">You haven\'t requested help yet.</p>';
    return;
  }
  container.innerHTML = helpRequests.map((r) => `
    <div class="item-card">
      <h4>${escapeHtml(r.courseCode)} — ${escapeHtml(r.topic)}</h4>
      <p class="meta">Preferred times: ${escapeHtml(r.preferredTimes || 'any time')}</p>
      <span class="badge">${escapeHtml(r.status)}</span>
    </div>
  `).join('');
}

// ---- Sessions ----

async function loadMySessions() {
  const container = document.getElementById('sessionsList');
  container.innerHTML = '<p class="empty">Loading…</p>';
  const { sessions } = await api('/sessions/me');
  if (!sessions.length) {
    container.innerHTML = '<p class="empty">No sessions yet — book one from "Find a Tutor".</p>';
    return;
  }

  container.innerHTML = '';
  for (const s of sessions) {
    const isTutor = s.tutorId === state.user.id;
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <h4>${escapeHtml(s.courseCode)} — ${escapeHtml(s.courseName)}</h4>
      <p class="meta">With ${isTutor ? escapeHtml(s.tuteeName) : escapeHtml(s.tutorName)} (${isTutor ? 'you are tutoring' : 'you are learning'})</p>
      <p class="meta">Scheduled: ${fmtDate(s.scheduledTime)}</p>
      <span class="badge">${escapeHtml(s.status)}</span>
      <div class="actions"></div>
    `;
    const actions = div.querySelector('.actions');

    if (s.status === 'pending') {
      actions.appendChild(makeActionBtn('Confirm', () => updateSession(s.id, 'confirmed')));
      actions.appendChild(makeActionBtn('Cancel', () => updateSession(s.id, 'cancelled'), 'danger'));
    } else if (s.status === 'confirmed') {
      actions.appendChild(makeActionBtn('Mark Completed', () => updateSession(s.id, 'completed')));
      actions.appendChild(makeActionBtn('Cancel', () => updateSession(s.id, 'cancelled'), 'danger'));
    } else if (s.status === 'completed' && !isTutor && !s.feedback) {
      actions.appendChild(makeActionBtn('Leave Feedback', () => leaveFeedback(s.id)));
    } else if (s.feedback) {
      const p = document.createElement('p');
      p.className = 'meta';
      p.textContent = `Feedback: ★ ${s.feedback.rating} — ${s.feedback.comment || '(no comment)'}`;
      actions.appendChild(p);
    }

    container.appendChild(div);
  }
}

function makeActionBtn(label, onClick, cls) {
  const btn = document.createElement('button');
  btn.textContent = label;
  if (cls) btn.classList.add(cls);
  btn.addEventListener('click', onClick);
  return btn;
}

async function updateSession(id, status) {
  try {
    await api(`/sessions/${id}`, { method: 'PATCH', body: { status } });
    loadMySessions();
  } catch (err) {
    alert(err.message);
  }
}

async function leaveFeedback(id) {
  const rating = Number(prompt('Rating (1-5)?', '5'));
  if (!rating) return;
  const comment = prompt('Any comments? (optional)') || '';
  try {
    await api(`/sessions/${id}/feedback`, { method: 'POST', body: { rating, comment } });
    loadMySessions();
  } catch (err) {
    alert(err.message);
  }
}

// ---- Admin ----

async function loadAdmin() {
  const stats = await api('/admin/stats');
  document.getElementById('adminStats').innerHTML = Object.entries(stats)
    .map(([key, value]) => `<div class="stat"><div class="n">${value}</div><div class="label">${escapeHtml(key)}</div></div>`)
    .join('');

  const { tutorProfiles } = await api('/admin/tutors');
  const container = document.getElementById('adminTutorsList');
  if (!tutorProfiles.length) {
    container.innerHTML = '<p class="empty">No tutor profiles yet.</p>';
    return;
  }
  container.innerHTML = '';
  for (const p of tutorProfiles) {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <h4>${escapeHtml(p.tutorName)} — ${escapeHtml(p.courseCode)}</h4>
      <p class="meta">${escapeHtml(p.tutorEmail)}</p>
      <span class="badge ${p.verified ? 'verified' : 'unverified'}">${p.verified ? 'Verified' : 'Pending'}</span>
      <div class="actions"></div>
    `;
    const actions = div.querySelector('.actions');
    actions.appendChild(makeActionBtn(p.verified ? 'Unverify' : 'Verify', async () => {
      try {
        await api(`/admin/tutors/${p.id}/verify`, { method: 'POST', body: { verified: !p.verified } });
        loadAdmin();
      } catch (err) {
        alert(err.message);
      }
    }));
    container.appendChild(div);
  }
}

// ---- Boot ----

renderShell();
