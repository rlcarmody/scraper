/* global document */

const postComment = (id) => {
  const commentText = { comment: document.getElementById(id).value };
  fetch('/comment', {
    method: 'POST',
    body: JSON.stringify(commentText),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    response.json().then((data) => {
      console.log(data);
    });
  }).catch((error) => {
    console.error(error);
  });
};

const submitButtons = () => {
  const buttons = document.querySelectorAll('button');
  [...buttons].forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      postComment(event.target.getAttribute('data-id'));
    });
  });
};

submitButtons();
