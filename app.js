(function () {
  const modules = window.GENIUS_MODULES || [];

  const page = document.body.dataset.page;
  if (page === "home") {
    renderHome();
  }
  if (page === "module") {
    renderModule();
  }
  if (page === "course") {
    renderCourse();
  }

  function renderHome() {
    const grid = document.getElementById("modules-grid");
    if (!grid) return;

    grid.innerHTML = modules
      .map((module) => {
        return `
        <article class="module-card">
          <p class="eyebrow">Module ${module.id}</p>
          <h3>${module.title}</h3>
          <p>${module.summary}</p>
          <span class="chip">${module.level}</span>
          <a class="primary-btn" href="module.html?module=${module.id}">
            Ouvrir le module
          </a>
        </article>
      `;
      })
      .join("");
  }

  function renderModule() {
    const params = new URLSearchParams(window.location.search);
    const moduleId = Number(params.get("module")) || 1;
    const module = modules.find((item) => item.id === moduleId) || modules[0];
    if (!module) return;

    const moduleTitle = document.getElementById("module-title");
    const moduleTag = document.getElementById("module-tag");
    const moduleText = document.getElementById("module-text");
    const moduleDuration = document.getElementById("module-duration");
    const progressCount = document.getElementById("progress-count");
    const progressLabel = document.getElementById("progress-label");
    const quizPanel = document.querySelector(".quiz-panel");
    const translationPanel = document.getElementById("translation-panel");
    const translationContent = document.getElementById("translation-content");
    const translationTitle = document.getElementById("translation-title");
    const translationSubtitle = document.getElementById("translation-subtitle");
    const questionNumber = document.getElementById("question-number");
    const questionTitle = document.getElementById("question-title");
    const optionsForm = document.getElementById("options-form");
    const feedback = document.getElementById("feedback");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackText = document.getElementById("feedback-text");
    const feedbackExplain = document.getElementById("feedback-explain");
    const feedbackIcon = document.getElementById("feedback-icon");
    const validateBtn = document.getElementById("validate-btn");
    const continueBtn = document.getElementById("continue-btn");
    const nextModuleBtn = document.getElementById("next-module-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    let currentIndex = 0;
    let validated = false;

    moduleTitle.textContent = module.title;
    moduleTag.textContent = `Module ${module.id}`;
    moduleDuration.textContent = module.duration;
    if (module.text && module.text.length > 0) {
      moduleText.innerHTML = module.text
        .map((p) => {
          if (p.includes("R&egrave;gles cl&eacute;s")) {
            return `<div class="cheat-sheet">${p}</div>`;
          }
          return `<p>${p}</p>`;
        })
        .join("");
      moduleText.parentElement.classList.remove("hidden");
    } else {
      moduleText.parentElement.classList.add("hidden");
    }
    moduleDuration.textContent = module.duration || "00:00";

    if (module.type === "translation") {
      if (quizPanel) quizPanel.classList.add("hidden");
      if (translationPanel) translationPanel.classList.remove("hidden");
      if (translationTitle) {
        translationTitle.innerHTML =
          module.translationTitle || "Exercices de traduction";
      }
      if (translationSubtitle) {
        translationSubtitle.innerHTML =
          module.translationSubtitle ||
          "Lis la phrase, r&eacute;fl&eacute;chis, puis clique pour voir la traduction propos&eacute;e.";
      }
      if (progressLabel) progressLabel.textContent = "exercices";
      const totalItems = module.translations
        ? module.translations.reduce((sum, block) => sum + block.items.length, 0)
        : 0;
      progressCount.textContent = `${totalItems}`;
      renderTranslations();
      return;
    }

    if (translationPanel) translationPanel.classList.add("hidden");
    if (quizPanel) quizPanel.classList.remove("hidden");
    if (progressLabel) progressLabel.textContent = "questions";
    progressCount.textContent = `1/${module.questions.length}`;

    function renderQuestion() {
      const question = module.questions[currentIndex];
      if (!question) return;
      validated = false;

      progressCount.textContent = `${currentIndex + 1}/${module.questions.length}`;
      questionNumber.textContent = `Question ${currentIndex + 1}`;
      questionTitle.innerHTML = question.prompt;
      optionsForm.innerHTML = question.choices
        .map((choice, index) => {
          return `
          <label class="option">
            <input type="radio" name="choice" value="${index}" />
            <span>${choice}</span>
          </label>
        `;
        })
        .join("");

      feedback.classList.add("hidden");
      validateBtn.classList.remove("hidden");
      continueBtn.classList.add("hidden");
      nextModuleBtn.classList.add("hidden");
      setOptionClasses(null);
    }

    function setOptionClasses(selectedIndex) {
      const optionLabels = optionsForm.querySelectorAll(".option");
      optionLabels.forEach((label, index) => {
        label.classList.remove("correct", "incorrect");
        if (validated) {
          if (index === module.questions[currentIndex].answer) {
            label.classList.add("correct");
          } else if (index === selectedIndex) {
            label.classList.add("incorrect");
          }
        }
      });
    }

    function showFeedback(isCorrect) {
      feedback.classList.remove("hidden");
      feedbackTitle.textContent = isCorrect
        ? "Bonne réponse !"
        : "Pas tout à fait.";
      feedbackText.textContent = isCorrect
        ? "Tu as trouvé la bonne option. Continue comme ça."
        : "Regarde la correction et retiens le point clé.";
      feedbackExplain.innerHTML = module.questions[currentIndex].explanation;
      feedbackIcon.textContent = isCorrect ? "âœ“" : "!";
      feedbackIcon.classList.toggle("bad", !isCorrect);
    }

    function validateAnswer() {
      const selected = optionsForm.querySelector("input[name='choice']:checked");
      if (!selected) {
        feedback.classList.remove("hidden");
        feedbackTitle.textContent = "Choisis une réponse.";
        feedbackText.textContent =
          "Clique sur une option puis valide pour voir la correction.";
        feedbackExplain.textContent =
          "Rappel : lis bien la question et repère les mots-clés.";
        feedbackIcon.textContent = "!";
        feedbackIcon.classList.add("bad");
        return;
      }

      validated = true;
      const selectedIndex = Number(selected.value);
      const isCorrect = selectedIndex === module.questions[currentIndex].answer;
      setOptionClasses(selectedIndex);
      showFeedback(isCorrect);

      validateBtn.classList.add("hidden");
      if (currentIndex < module.questions.length - 1) {
        continueBtn.classList.remove("hidden");
      } else {
        nextModuleBtn.classList.remove("hidden");
      }
    }

    validateBtn.addEventListener("click", (event) => {
      event.preventDefault();
      validateAnswer();
    });

    continueBtn.addEventListener("click", () => {
      if (currentIndex < module.questions.length - 1) {
        currentIndex += 1;
        renderQuestion();
      }
    });

    nextModuleBtn.addEventListener("click", () => {
      const nextId = module.id + 1;
      const nextExists = modules.find((item) => item.id === nextId);
      if (nextExists) {
        window.location.href = `module.html?module=${nextId}`;
      } else {
        window.location.href = "index.html";
      }
    });

    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        renderQuestion();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (currentIndex < module.questions.length - 1) {
        currentIndex += 1;
        renderQuestion();
      }
    });

    renderQuestion();

    function renderTranslations() {
      if (!translationContent || !module.translations) return;
      translationContent.innerHTML = module.translations
        .map((block) => {
          const items = block.items
            .map((item, index) => {
              return `
              <li class="translation-item">
                <p><strong>${index + 1}.</strong> ${item.prompt}</p>
                <button class="ghost-btn" type="button" data-toggle>
                  ${item.buttonLabel || "Voir la traduction"}
                </button>
                <div class="translation-answer hidden">${item.answer}</div>
              </li>
            `;
            })
            .join("");
          return `
          <article class="translation-block">
            <h3>${block.title}</h3>
            <ul class="translation-list">
              ${items}
            </ul>
          </article>
        `;
        })
        .join("");

      translationContent.querySelectorAll("[data-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
          const answer = button.nextElementSibling;
          if (!answer) return;
          answer.classList.toggle("hidden");
          button.textContent = answer.classList.contains("hidden")
            ? "Voir la traduction"
            : "Masquer la traduction";
        });
      });
    }
  }

  function renderCourse() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course");
    const courses = window.GENIUS_COURSES || [];
    const course = courses.find((item) => item.id === courseId) || courses[0];
    if (!course) return;

    const title = document.getElementById("course-title");
    const level = document.getElementById("course-level");
    const subtitle = document.getElementById("course-subtitle");
    const tag = document.getElementById("course-tag");
    const content = document.getElementById("course-content");

    title.innerHTML = course.title;
    level.innerHTML = course.levelLabel;
    subtitle.innerHTML = course.subtitle;
    tag.innerHTML = course.levelLabel;

    const contentBlocks = (course.content || [])
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
    const extraPoints = (course.extraPoints || [])
      .map((point) => `<li>${point}</li>`)
      .join("");

    content.innerHTML = `
      <div class="course-block">
        <h3>Objectif</h3>
        <p>${course.goal}</p>
      </div>
      ${
        contentBlocks
          ? `<div class="course-block">
              <h3>Contenu</h3>
              ${contentBlocks}
            </div>`
          : ""
      }
      <div class="course-block">
        <h3>Mots cl&eacute;s</h3>
        <ul class="course-tags">
          ${course.keywords.map((word) => `<li>${word}</li>`).join("")}
        </ul>
      </div>
      <div class="course-block">
        <h3>Exemples</h3>
        <ul class="course-examples">
          ${course.examples.map((example) => `<li>${example}</li>`).join("")}
        </ul>
      </div>
      <div class="course-block">
        <h3>Rappel rapide</h3>
        <p>${course.tip}</p>
      </div>
      ${
        extraPoints
          ? `<div class="course-block">
              <h3>&Agrave; retenir</h3>
              <ul class="course-tags">${extraPoints}</ul>
            </div>`
          : ""
      }
    `;
  }
})();

