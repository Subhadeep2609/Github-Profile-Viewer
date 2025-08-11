// script.js
// Requires GSAP loaded via CDN in HTML (we used gsap.min.js).
// Fetches GitHub user and animates profile card with GSAP.

const usernameInput = document.getElementById('username');
const getBtn = document.getElementById('getBtn');
const profileArea = document.getElementById('profile');
const searchForm = document.getElementById('searchForm');

getBtn.addEventListener('click', fetchProfile);

// Allow Enter to trigger the search
usernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchProfile();
});

function showMessage(text, type = 'info') {
  // type: 'info' | 'error'
  profileArea.innerHTML = `<div class="message" role="status">${text}</div>`;

  // animate message entrance
  if (window.gsap) {
    gsap.fromTo('.message', { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" });
  }
}

function fetchProfile() {
  const username = (usernameInput.value || '').trim();
  if (!username) {
    showMessage('Please enter a GitHub username.', 'error');
    return;
  }

  // Show loading
  profileArea.innerHTML = `<div class="message" role="status">Loading profile for <strong>${escapeHtml(username)}</strong>…</div>`;

  fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
    .then(async (response) => {
      if (response.status === 404) {
        throw new Error('User not found (404).');
      }
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Network error: ${response.status} ${response.statusText} ${text}`);
      }
      return response.json();
    })
    .then(data => {
      displayProfile(data);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      showMessage(err.message || 'Something went wrong while fetching profile.', 'error');
    });
}

// Escapes text inserted into HTML to prevent injection
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function displayProfile(profileData) {
  // Build HTML for the card
  const name = profileData.name ? escapeHtml(profileData.name) : escapeHtml(profileData.login);
  const login = escapeHtml(profileData.login);
  const bio = profileData.bio ? escapeHtml(profileData.bio) : 'No bio available';
  const followers = profileData.followers ?? 0;
  const following = profileData.following ?? 0;
  const repos = profileData.public_repos ?? 0;
  const location = profileData.location ? escapeHtml(profileData.location) : '';
  const blog = profileData.blog ? escapeHtml(profileData.blog) : '';
  const company = profileData.company ? escapeHtml(profileData.company) : '';
  const avatar = profileData.avatar_url;
  const htmlUrl = profileData.html_url;

  profileArea.innerHTML = `
    <article class="card" id="profileCard" aria-label="GitHub profile for ${login}">
      <div class="card__avatar">
        <img class="avatar" src="${avatar}" alt="${name}'s avatar" />
      </div>

      <div class="card__body">
        <h2 class="name">${name}</h2>
        <div class="handle">@${login}</div>
        <p class="bio">${bio}</p>

        <div class="stats" role="list">
          <div class="stat" role="listitem"><strong>${followers}</strong><span>Followers</span></div>
          <div class="stat" role="listitem"><strong>${following}</strong><span>Following</span></div>
          <div class="stat" role="listitem"><strong>${repos}</strong><span>Repos</span></div>
        </div>

        <div class="links">
          <a class="link-btn" href="${htmlUrl}" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>
          ${location ? `<span class="link-btn" aria-hidden="true">📍 ${location}</span>` : ''}
          ${company ? `<span class="link-btn" aria-hidden="true">🏢 ${company}</span>` : ''}
          ${blog ? `<a class="link-btn" href="${blog.startsWith('http') ? blog : 'https://' + blog}" target="_blank" rel="noopener noreferrer">🔗 Website</a>` : ''}
        </div>
      </div>
    </article>
  `;

  // GSAP animations
  if (window.gsap) {
    const tl = gsap.timeline();

    // fade in card
    tl.from('#profileCard', {
      y: 18, opacity: 0, duration: 0.45, ease: 'power3.out'
    });

    // pop avatar
    tl.from('.avatar', {
      scale: 0.85, opacity: 0, duration: 0.5, ease: 'back.out(1.1)'
    }, '-=0.25');

    // stagger stats and links
    tl.from('.stat', { y: 8, opacity: 0, stagger: 0.08, duration: 0.35 }, '-=0.2');
    tl.from('.links .link-btn', { y: 6, opacity: 0, stagger: 0.06, duration: 0.28 }, '-=0.28');
  }
}
