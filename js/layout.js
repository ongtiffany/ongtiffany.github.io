function loadLayout() {
  const root = document.getElementById("layout");

  if (!root) return;

  root.innerHTML = `
    <div class="cursor" id="cursor" aria-hidden="true"></div>

    <div class="page">

      <header role="banner" class="site-header">
        <a href="../index.html" class="nav-name">Tiffany Ong</a>
        <nav aria-label="Main navigation">
          <a href="../index.html#about">About</a>
          <a href="../index.html#contributions">Contributions</a>
          <a href="/work.html">Work</a>
        </nav>
      </header>

      <div class="proj-page-header">
        <a href="/work.html" class="back-btn">
          Back to work
        </a>
      </div>

      <!-- 🔑 project gets injected here -->
      <div id="project"></div>

      <footer role="contentinfo">
       
        <nav class="footer-links">
          <a href="https://www.linkedin.com/in/tiffanyong" target="_blank">LinkedIn</a>
          <a href="https://github.com/ongtiffany" target="_blank">GitHub</a>
          <a href="https://codepen.io/ongtiffany" target="_blank">CodePen</a>
        </nav>

         <div class="footer-name">Copyright © Tiffany Ong 2026 <br> <span>Certain images are sourced from Pexels, Unsplash, past collaborative projects, or original. Please do not use images or content without permission.</span></div>
      </footer>

    </div>
  `;
}

loadLayout();
