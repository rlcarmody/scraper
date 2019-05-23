const postComment = id => {
  const commentText = {
    comment: document.getElementById(id).value,
    id,
  };
  fetch('/comment', {
    method: 'POST',
    body: JSON.stringify(commentText),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      response.json()
      .then(data => {
        console.log(data);
        getComments(id);
      });
    })
    .catch(error => {
      console.error(error);
    });
};

const updateUsername = userName => {
  fetch('/updateUser', {
    method: 'PUT', 
    body: JSON.stringify({userName}),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      response.json()
      .then(data => {
        console.log(data);
      });
    })
    .catch(error => {
      console.log(error);
    })
};

const getComments = id => {
  fetch(`/view-comments/${id}`)
    .then(response => response.json()
    .then(data => {
      const commentBlock = document.querySelector(`[data-comment-block="${id}"]`);
      commentBlock.classList.remove('hidden');
      const commentList = document.getElementById(`comments-for-${id}`);
      let content = '';
      data.forEach(comment => {
        content += `<div class="comment"><span class="userName">${comment.user.username}</span>
        <p>${comment.text}</p></div>`
      });
      commentList.innerHTML = content;
    }));
}

const buttons = document.querySelectorAll('.commentButton');
[...buttons].forEach((button) => {
  button.addEventListener('click', event => {
    event.preventDefault();
    const dataId = event.target.getAttribute('data-id');
    postComment(dataId);
    document.getElementById(dataId).value = '';
  });
});

const userNameChange = document.getElementById('user');
userNameChange.addEventListener('change', event => {
  updateUsername(event.target.value);
});

const viewComments = document.querySelectorAll('.commentlink');
[...viewComments].forEach(article => {
  article.addEventListener('click', event => {
    event.preventDefault();
    getComments(event.target.getAttribute('href'));
  });
});

document.getElementById('next').addEventListener('click', event => {
  event.preventDefault();
  let currentPage = location.href.substr(-1,1);
  if (currentPage === '/') {
    currentPage = 1;
  }
  const nextPage = parseInt(currentPage) + 1;
  location.href = `${location.origin}/${nextPage}`
});

document.getElementById('prev').addEventListener('click', event => {
  event.preventDefault();
  let currentPage = location.href.substr(-1,1);
  const nextPage = parseInt(currentPage) - 1;
  location.href = `${location.origin}/${nextPage}`;
});

if (document.querySelector('.row').children.length < 5) {
  document.getElementById('next').remove();
}