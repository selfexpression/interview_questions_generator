import { displayQuestions } from './view/display-questions';
import { messageHandlers } from './handlers';

document.addEventListener('DOMContentLoaded', async () => {
  const generateBtn = document.getElementById('generateBtn');
  const contentDiv = document.getElementById('content');

  generateBtn?.addEventListener('click', async () => {
    generateBtn.classList.add('loading');
    generateBtn.textContent = '';

    try {
      const lang = await messageHandlers.getPageLanguage();
      const jobText = await messageHandlers.getJobText();
      const questions = await messageHandlers.generateQuestions(jobText, lang);
      generateBtn.style.display = 'none';

      if (contentDiv) {
        displayQuestions(
          questions.technicalQuestions,
          'Technical',
          contentDiv,
          lang
        );
        displayQuestions(
          questions.behavioralQuestions,
          'Behavioral',
          contentDiv,
          lang
        );
      }
    } catch (error) {
      console.error('Popup error:', error);
      generateBtn.textContent = 'Error occurred';
    }
  });
});
