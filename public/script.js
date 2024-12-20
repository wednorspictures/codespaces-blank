
document.getElementById('tbankButton').addEventListener('click', () => {
    document.getElementById('tbankModal').style.display = 'flex';
});


document.getElementById('sendButton').addEventListener('click', () => {
    // Показать ошибку в табличке
    const errorMessage = 'Не один API не ответил, переведите пользователю по ФПИ или попробуйте позже';
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `${errorMessage} <button onclick="this.parentElement.remove()">×</button>`;
    document.getElementById('notifications').appendChild(notification);

    
    document.getElementById('tbankModal').style.display = 'none';
});
