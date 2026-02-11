import {
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
} from "./config.js";

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

const questions = [
  {
    q: "Which is NOT a JavaScript primitive type?",
    choices: ["string", "number", "object", "boolean"],
    answer: 2,
    why: "Primitives: string, number, boolean, null, undefined, bigint, symbol. 'object' is a reference type.",
  },
  {
    q: "What does typeof null return?",
    choices: ["'null'", "'object'", "'undefined'", "'number'"],
    answer: 1,
    why: "Historical quirk: typeof null === 'object'.",
  },
  {
    q: "NaN is of type…",
    choices: ["'NaN'", "'number'", "'undefined'", "'object'"],
    answer: 1,
    why: "NaN is a special 'number' value meaning Not-a-Number.",
  },
  {
    q: "Default value of an uninitialized variable?",
    choices: ["null", "0", "undefined", "false"],
    answer: 2,
    why: "A declared but unassigned variable is undefined.",
  },
  {
    q: "Which one is falsy?",
    choices: ["0", "'' (empty string)", "null", "All of the above"],
    answer: 3,
    why: "0, '' and null are all falsy values.",
  },
  {
    q: "Boolean('') equals…",
    choices: ["true", "false", "undefined", "throws error"],
    answer: 1,
    why: "Empty string is falsy → Boolean('') is false.",
  },
  {
    q: "Boolean(0) equals…",
    choices: ["true", "false", "undefined", "null"],
    answer: 1,
    why: "0 is falsy → Boolean(0) is false.",
  },
  {
    q: "Which creates a number?",
    choices: ["Number('42')", "parseInt('42')", "+'42'", "All of the above"],
    answer: 3,
    why: "All of them convert '42' into the number 42.",
  },
  {
    q: "What does '===' do?",
    choices: [
      "Loose equality (type coercion)",
      "Strict equality (no coercion)",
      "Assignment",
      "Inequality",
    ],
    answer: 1,
    why: "=== compares both value and type without coercion.",
  },
  {
    q: "What is the result of '1' + 2 + 3?",
    choices: ["6", "'123'", "'15'", "NaN"],
    answer: 1,
    why: "Left to right: '1' + 2 → '12'; '12' + 3 → '123'.",
  },
];

let index = 0;
let selected = Array(questions.length).fill(null);
let completedAt = null;

const startCard = document.getElementById("startCard");
const quizCard = document.getElementById("quizCard");
const resultCard = document.getElementById("resultCard");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");

const questionText = document.getElementById("questionText");
const choicesEl = document.getElementById("choices");
const progressEl = document.getElementById("progress");
const scorePreview = document.getElementById("scorePreview");

const resultSummary = document.getElementById("resultSummary");
const explanations = document.getElementById("explanations");

const completedAtEl = document.getElementById("completedAt");

const restartBtn = document.querySelectorAll(".restartBtn");

const emailForm = document.getElementById("emailForm");
const emailStatus = document.getElementById("emailStatus");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

function render() {
  const q = questions[index];

  progressEl.textContent = `Question ${index + 1} / ${questions.length}`;
  scorePreview.textContent = `Score: ${calcScore()}`;
  questionText.textContent = q.q;

  choicesEl.innerHTML = "";
  q.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.textContent = text;
    if (selected[index] === i) btn.classList.add("selected");
    btn.addEventListener("click", () => selectAnswer(i));
    choicesEl.appendChild(btn);
  });

  nextBtn.disabled = selected[index] === null;
  nextBtn.textContent = index === questions.length - 1 ? "Finish" : "Next";
}

function calcScore() {
  return selected.reduce(
    (acc, pick, i) => acc + (pick === questions[i].answer ? 1 : 0),
    0,
  );
}

function selectAnswer(i) {
  selected[index] = i;
  [...choicesEl.children].forEach((c) => c.classList.remove("selected"));
  choicesEl.children[i].classList.add("selected");
  nextBtn.disabled = false;
}

function showResult() {
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");

  const score = calcScore();
  resultSummary.textContent = `You scored ${score} / ${questions.length}.`;

  completedAt = new Date();
  if (completedAtEl) {
    completedAtEl.textContent = `Completed at: ${completedAt.toLocaleString()}`;
  }

  explanations.innerHTML = "";
  questions.forEach((q, i) => {
    const li = document.createElement("li");
    const ok = selected[i] === q.answer;

    li.innerHTML = `
      <div><strong>Q${i + 1}:</strong> ${q.q}</div>
      <div><strong>Correct:</strong> ${q.choices[q.answer]}</div>
      <div><strong>Your:</strong> ${q.choices[selected[i]] ?? "-"}</div>
      <small>${q.why}</small>
    `;
    li.style.color = ok ? "lightgreen" : "salmon";
    explanations.appendChild(li);
  });
}

function resetQuiz() {
  index = 0;
  selected = Array(questions.length).fill(null);

  completedAt = null;
  if (completedAtEl) completedAtEl.textContent = "";

  if (emailStatus) emailStatus.textContent = "";
  if (userName) userName.value = "";
  if (userEmail) userEmail.value = "";

  resultCard.classList.add("hidden");
  quizCard.classList.add("hidden");
  startCard.classList.remove("hidden");
}

startBtn.addEventListener("click", () => {
  startCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
  render();
});

restartBtn.forEach((btn) => btn.addEventListener("click", resetQuiz));

nextBtn.addEventListener("click", () => {
  if (selected[index] === null) return;

  const correctIndex = questions[index].answer;

  choicesEl.children[correctIndex].classList.add("correct");

  setTimeout(() => {
    if (index < questions.length - 1) {
      index++;
      render();
    } else {
      showResult();
    }
  }, 500);
});

if (emailForm) {
  emailForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = userEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailStatus.textContent = "Enter a valid email.";
      return;
    }

    emailStatus.textContent = "Sending...";

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        user_name: userName.value.trim(),
        user_email: email,
        total_score: `${calcScore()} / ${questions.length}`,
        completed_at: (completedAt || new Date()).toLocaleString(),
        breakdown: questions
          .map((q, i) => {
            const ok = selected[i] === q.answer;
            const your = q.choices[selected[i]] ?? "-";
            const correct = q.choices[q.answer];

            return [
              `Q${i + 1}: ${q.q}`,
              `Correct: ${correct}`,
              `Your: ${your} ${ok ? "✓" : "✗"}`,
              `Why: ${q.why}`,
              `---`,
            ].join("\n");
          })
          .join("\n"),
      })
      .then(function () {
        emailStatus.textContent = "Sent!";
        setTimeout(function () {
          resetQuiz();
        }, 800);
      })
      .catch(function (err) {
        console.log(err);
        emailStatus.textContent = "Could not send.";
      });
  });
}
