(function () {
  const modules = window.GENIUS_MODULES || [];

  const page = document.body.dataset.page;
  if (page === "home") {
    renderHome();
  }
  if (page === "module") {
    renderModule();
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
    moduleText.innerHTML = module.text.map((p) => `<p>${p}</p>`).join("");
    progressCount.textContent = `1/${module.questions.length}`;

    function renderQuestion() {
      const question = module.questions[currentIndex];
      if (!question) return;
      validated = false;

      progressCount.textContent = `${currentIndex + 1}/${module.questions.length}`;
      questionNumber.textContent = `Question ${currentIndex + 1}`;
      questionTitle.textContent = question.prompt;
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
      feedbackExplain.textContent = module.questions[currentIndex].explanation;
      feedbackIcon.textContent = isCorrect ? "✓" : "!";
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
  }
})();
