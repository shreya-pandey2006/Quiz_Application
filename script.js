let allQuestions = [];
let userAnswers = {};
const loadingText = document.getElementById("loadingText");
const errorText = document.getElementById("errorText");
const quizContainer = document.getElementById("quizContainer");
const submitBtn = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreText = document.getElementById("scoreText");
getQuestions();
async function getQuestions() {
  loadingText.style.display = "block";
  errorText.style.display = "none";
  quizContainer.innerHTML = "";
  submitBtn.style.display = "none";
  restartBtn.style.display = "none";
  scoreText.textContent = "";
  userAnswers = {};
  try {
    const response = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("No questions found");
    }

    allQuestions = data.results.map(function (item) {
      const correctAnswer = decodeText(item.correct_answer);
      const wrongAnswers = item.incorrect_answers.map(decodeText);
      const options = shuffle([correctAnswer, ...wrongAnswers]);
      return {
        question: decodeText(item.question),
        options: options,
        correctAnswer: correctAnswer
      };
    });

    loadingText.style.display = "none";
    showQuestions();
    submitBtn.style.display = "inline-block";

  } catch (error) {
    console.log("Error fetching questions:", error);
    loadingText.style.display = "none";
    errorText.style.display = "block";
     errorText.style.textAlign = "center";
    errorText.textContent = "Could not load questions. Please check your internet and try again.";
  }
}
function showQuestions() {
  quizContainer.innerHTML = "";

  allQuestions.forEach(function (q, index) {
    const questionBox = document.createElement("div");
    questionBox.className = "question-box";

    const questionText = document.createElement("div");
    questionText.className = "question-text";
    questionText.textContent = (index + 1) + ". " + q.question;
    questionBox.appendChild(questionText);

    q.options.forEach(function (option) {
      const label = document.createElement("label");
      label.className = "option";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "question" + index;
      radio.value = option;
      radio.addEventListener("change", function () {
        userAnswers[index] = option;
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      questionBox.appendChild(label);
    });

    quizContainer.appendChild(questionBox);
  });
}
submitBtn.addEventListener("click", function () {
  let score = 0;

  allQuestions.forEach(function (q, index) {
    const userAnswer = userAnswers[index];
    if (userAnswer === q.correctAnswer) {
      score = score + 1;
    }

    markAnswer(index, q, userAnswer);
  });
  scoreText.textContent = "You scored " + score + " out of " + allQuestions.length;
  submitBtn.style.display = "none";
  restartBtn.style.display = "inline-block";
});

function markAnswer(index, question, userAnswer) {
  const questionBox = quizContainer.children[index];
  const labels = questionBox.querySelectorAll(".option");

  labels.forEach(function (label) {
    const radio = label.querySelector("input");
    radio.disabled = true;
    if (radio.value === question.correctAnswer) {
      label.classList.add("correct");
    } else if (radio.value === userAnswer) {
      label.classList.add("incorrect");
    }
  });
}
restartBtn.addEventListener("click", function () {
  getQuestions();
});

function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[randomIndex];
    newArray[randomIndex] = temp;
  }
  return newArray;
}
function decodeText(text) {
  const temp = document.createElement("textarea");
  temp.innerHTML = text;
  return temp.value;
}
