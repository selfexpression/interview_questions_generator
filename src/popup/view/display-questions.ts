import { messageHandlers } from '../handlers/message-handlers';

export const displayQuestions = (
  questions: string[],
  type: string,
  container: HTMLElement,
  language: string
) => {
  const h4 = document.createElement('h4');
  h4.textContent = `${type} Questions`;

  const ol = document.createElement('ol');
  ol.className = 'questions';

  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.className = 'question';

    const span = document.createElement('span');
    span.textContent = `${index + 1}. ${q}`;

    const btn = document.createElement('button');
    btn.className = 'dontKnowBtn';
    btn.textContent = "Don't know";

    li.append(span, btn);
    ol.appendChild(li);

    btn.addEventListener('click', async () => {
      btn.classList.add('loading');
      btn.textContent = '';
      const answer = await messageHandlers.generateAnswer(q, language);
      btn.remove();
      const hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = answer;
      li.appendChild(hint);
    });
  });

  container.append(h4, ol);
};
