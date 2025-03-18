import { displayQuestions } from './view';
import { messageHandlers } from './handlers/message-handlers';
import { MessageType } from '../shared/types/messages';

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const contentDiv = document.getElementById('content');

  generateBtn?.addEventListener('click', async () => {
    generateBtn.classList.add('loading');
    generateBtn.textContent = '';

    try {
      const jobText = await messageHandlers.sendMessage<string>({
        type: MessageType.GET_JOB_TEXT,
      });
      const questions = await messageHandlers.generateQuestions(jobText);
      generateBtn.style.display = 'none';

      if (contentDiv) {
        displayQuestions(questions.technicalQuestions, 'Technical', contentDiv);
        displayQuestions(
          questions.behavioralQuestions,
          'Behavioral',
          contentDiv
        );
      }
    } catch (error) {
      console.error('Popup error:', error);
      generateBtn.textContent = 'Error occurred';
    }
  });
});
