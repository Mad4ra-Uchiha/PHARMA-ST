document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const progressScreen = document.getElementById('progress-screen');

    const homeBtn = document.getElementById('home-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const progressBtn = document.getElementById('progress-btn');
    const startQuizHomeBtn = document.getElementById('start-quiz-home-btn');

    const questionPrompt = document.getElementById('question-prompt');
    const optionsContainer = document.getElementById('options-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const quizProgressBar = document.getElementById('quiz-progress-bar');
    const quizProgressText = document.getElementById('quiz-progress-text');

    const finalScoreDisplay = document.getElementById('final-score');
    const reviewContainer = document.getElementById('review-container');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    const viewProgressFromResultsBtn = document.getElementById('view-progress-from-results-btn');

    const completedQuizzesSpan = document.getElementById('completed-quizzes');
    const averageScoreSpan = document.getElementById('average-score');
    const quizHistoryList = document.getElementById('quiz-history-list');

    let questions =;
    let currentQuestionIndex = 0;
    let userResponses =; // Stores { questionId, selectedOptionId, isCorrect } for current quiz
    let quizResultsHistory =; // Stores { date, score, totalQuestions, responses } for all completed quizzes

    // --- Navigation Functions ---
    function showScreen(screenToShow) {
        const screens =;
        screens.forEach(screen => screen.classList.remove('active'));
        screenToShow.classList.add('active');
    }

    homeBtn.addEventListener('click', () => showScreen(homeScreen));
    startQuizBtn.addEventListener('click', startNewQuiz);
    startQuizHomeBtn.addEventListener('click', startNewQuiz);
    progressBtn.addEventListener('click', showProgress);
    restartQuizBtn.addEventListener('click', startNewQuiz);
    viewProgressFromResultsBtn.addEventListener('click', showProgress);

    // --- Quiz Logic ---
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            questions = await response.json();
            // Shuffle questions once loaded
            shuffleArray(questions);
        } catch (error) {
            console.error('Error loading questions:', error);
            feedbackContainer.innerHTML = '<p style="color: var(--color-error);">Error al cargar las preguntas. Por favor, recarga la página.</p>';
            nextQuestionBtn.disabled = true;
            submitQuizBtn.disabled = true;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    function startNewQuiz() {
        if (questions.length === 0) {
            alert('Las preguntas aún no se han cargado o no hay preguntas disponibles. Por favor, verifica el archivo questions.json y recarga la página.');
            return;
        }
        currentQuestionIndex = 0;
        userResponses =;
        shuffleArray(questions); // Shuffle questions for each new quiz
        showScreen(quizScreen);
        renderQuestion();
        nextQuestionBtn.style.display = 'block';
        submitQuizBtn.style.display = 'none';
        feedbackContainer.innerHTML = '';
    }

    function renderQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResultsScreen();
            return;
        }

        const question = questions[currentQuestionIndex];
        questionPrompt.textContent = question.prompt;
        optionsContainer.innerHTML = '';
        feedbackContainer.innerHTML = '';

        // Shuffle options for the current question
        shuffleArray(question.options);

        question.options.forEach(option => {
            const label = document.createElement('label');
            label.classList.add('option-label');
            label.innerHTML = `
                <input type="radio" name="current-question" value="${option.id}">
                ${option.content}
            `;
            label.addEventListener('click', () => selectOption(label, option.id));
            optionsContainer.appendChild(label);
        });

        updateProgressBar();
        nextQuestionBtn.disabled = true; // Disable next button until an option is selected
        submitQuizBtn.disabled = true; // Disable submit button until an option is selected

        // Show submit button on the last question
        if (currentQuestionIndex === questions.length - 1) {
            nextQuestionBtn.style.display = 'none';
            submitQuizBtn.style.display = 'block';
        } else {
            nextQuestionBtn.style.display = 'block';
            submitQuizBtn.style.display = 'none';
        }
    }

    let selectedOptionLabel = null;
    let selectedOptionId = null;

    function selectOption(label, optionId) {
        // Deselect previous option if any
        if (selectedOptionLabel) {
            selectedOptionLabel.classList.remove('selected');
        }
        // Select current option
        label.classList.add('selected');
        selectedOptionLabel = label;
        selectedOptionId = optionId;

        // Enable next/submit button
        nextQuestionBtn.disabled = false;
        submitQuizBtn.disabled = false;
    }

    nextQuestionBtn.addEventListener('click', () => {
        if (selectedOptionId!== null) {
            checkAnswerAndProceed();
        }
    });

    submitQuizBtn.addEventListener('click', () => {
        if (selectedOptionId!== null) {
            checkAnswerAndProceed();
        }
    });

    function checkAnswerAndProceed() {
        const question = questions[currentQuestionIndex];
        const isCorrect = question.correctAnswer === selectedOptionId;

        userResponses.push({
            questionId: question.id,
            selectedOptionId: selectedOptionId,
            isCorrect: isCorrect,
            questionPrompt: question.prompt,
            correctAnswerContent: question.options.find(opt => opt.id === question.correctAnswer).content,
            userAnswerContent: question.options.find(opt => opt.id === selectedOptionId).content,
            feedback: question.feedback |

| '',
            dosageInfo: question.dosageInfo |

| '',
            interactionInfo: question.interactionInfo |

| ''
        });

        // Provide immediate visual feedback on the selected option
        if (selectedOptionLabel) {
            selectedOptionLabel.classList.remove('selected'); // Remove selected state
            if (isCorrect) {
                selectedOptionLabel.classList.add('correct');
                feedbackContainer.innerHTML = `<p style="color: var(--color-neon-lime);">¡Correcto!</p>`;
            } else {
                selectedOptionLabel.classList.add('incorrect');
                feedbackContainer.innerHTML = `<p style="color: var(--color-error);">Incorrecto. La respuesta correcta era: <strong>${question.options.find(opt => opt.id === question.correctAnswer).content}</strong></p>`;
            }
            // Display additional info
            if (question.feedback) feedbackContainer.innerHTML += `<p>${question.feedback}</p>`;
            if (question.dosageInfo) feedbackContainer.innerHTML += `<p><strong>Dosis:</strong> ${question.dosageInfo}</p>`;
            if (question.interactionInfo) feedbackContainer.innerHTML += `<p><strong>Interacciones:</strong> ${question.interactionInfo}</p>`;
        }

        // Disable options after selection
        Array.from(optionsContainer.children).forEach(label => {
            label.style.pointerEvents = 'none';
        });

        // Temporarily disable buttons to allow user to read feedback
        nextQuestionBtn.disabled = true;
        submitQuizBtn.disabled = true;

        setTimeout(() => {
            currentQuestionIndex++;
            selectedOptionLabel = null; // Reset for next question
            selectedOptionId = null; // Reset for next question
            renderQuestion();
        }, 2000); // Wait 2 seconds before moving to next question
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        quizProgressBar.style.width = `${progress}%`;
        quizProgressText.textContent = `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`;
    }

    function showResultsScreen() {
        showScreen(resultsScreen);
        let correctCount = userResponses.filter(response => response.isCorrect).length;
        let scorePercentage = (correctCount / questions.length) * 100;
        finalScoreDisplay.textContent = `Tu puntuación: ${correctCount} / ${questions.length} (${scorePercentage.toFixed(0)}%)`;

        // Save quiz results to history
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        const quizResult = {
            date: formattedDate,
            score: correctCount,
            totalQuestions: questions.length,
            responses: userResponses
        };
        quizResultsHistory.push(quizResult);
        saveProgress();
        displayReview();
    }

    function displayReview() {
        reviewContainer.innerHTML = '<h3>Revisión de Preguntas:</h3>';
        userResponses.forEach((response, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');
            reviewItem.classList.add(response.isCorrect? 'correct' : 'incorrect');
            reviewItem.innerHTML = `
                <p class="question-prompt"><strong>${index + 1}. ${response.questionPrompt}</strong></p>
                <p>Tu respuesta: <span class="user-answer">${response.userAnswerContent}</span> ${response.isCorrect? '&#10003;' : '&#10007;'}</p>
                ${!response.isCorrect? `<p>Respuesta correcta: <span class="correct-answer">${response.correctAnswerContent}</span></p>` : ''}
                ${response.feedback? `<p class="feedback-info"><strong>Información adicional:</strong> ${response.feedback}</p>` : ''}
                ${response.dosageInfo? `<p class="feedback-info"><strong>Dosis:</strong> ${response.dosageInfo}</p>` : ''}
                ${response.interactionInfo? `<p class="feedback-info"><strong>Interacciones:</strong> ${response.interactionInfo}</p>` : ''}
            `;
            reviewContainer.appendChild(reviewItem);
        });
    }

    // --- Progress Tracking ---
    function saveProgress() {
        localStorage.setItem('pharmaQuizProgress', JSON.stringify(quizResultsHistory));
        updateOverallProgressDisplay();
    }

    function loadProgress() {
        const savedProgress = localStorage.getItem('pharmaQuizProgress');
        if (savedProgress) {
            quizResultsHistory = JSON.parse(savedProgress);
        }
        updateOverallProgressDisplay();
    }

    function updateOverallProgressDisplay() {
        if (quizResultsHistory.length === 0) {
            completedQuizzesSpan.textContent = '0';
            averageScoreSpan.textContent = '0%';
            quizHistoryList.innerHTML = '<li>No hay quizzes completados aún.</li>';
            return;
        }

        const totalQuizzes = quizResultsHistory.length;
        const totalCorrectAnswers = quizResultsHistory.reduce((sum, quiz) => sum + quiz.score, 0);
        const totalPossibleAnswers = quizResultsHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
        const overallAverage = totalPossibleAnswers > 0? (totalCorrectAnswers / totalPossibleAnswers) * 100 : 0;

        completedQuizzesSpan.textContent = totalQuizzes;
        averageScoreSpan.textContent = `${overallAverage.toFixed(0)}%`;

        quizHistoryList.innerHTML = '';
        quizResultsHistory.forEach(quiz => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${quiz.date}:</strong> ${quiz.score} / ${quiz.totalQuestions} correctas (${((quiz.score / quiz.totalQuestions) * 100).toFixed(0)}%)`;
            quizHistoryList.appendChild(listItem);
        });
    }

    function showProgress() {
        showScreen(progressScreen);
        updateOverallProgressDisplay();
    }

    // Initial load
    loadQuestions();
    loadProgress();
});
                
