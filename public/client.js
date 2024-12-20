
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;

    
    if (isError) {
        notification.style.background = 'linear-gradient(45deg, #ff3333, #800000)';
    }

    document.getElementById('notifications').appendChild(notification);

    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}


document.getElementById('toRegister').addEventListener('click', () => {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'block';
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const walletNumber = document.getElementById('walletNumber').value;

    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, wallet_number: walletNumber }),
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('wallet_number', walletNumber); 
        showNotification(data.message); 
        showWallet(walletNumber);
    } else {
        showNotification(data.message, true); 
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('wallet_number', data.wallet_number); 
        showNotification('Вход успешен!'); 
        showWallet(data.wallet_number);
    } else {
        showNotification(data.message, true); 
    }
});


window.addEventListener('load', () => {
    const savedWalletNumber = localStorage.getItem('wallet_number');
    if (savedWalletNumber) {
        showWallet(savedWalletNumber);
    }
});


function showWallet(walletNumber) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('wallet').style.display = 'block';
    document.getElementById('walletNumberDisplay').textContent = `Номер кошелька: ${walletNumber}`;
    fetchUserData(walletNumber);
}


async function fetchUserData(walletNumber) {
    const res = await fetch(`/user/${walletNumber}`);
    const data = await res.json();
    document.getElementById('balance').textContent = data.balance;
    fetchHistory(walletNumber);
}


document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const senderWallet = document.getElementById('walletNumberDisplay').textContent.split(': ')[1];
    const recipientWallet = document.getElementById('recipientWallet').value;
    const amount = parseFloat(document.getElementById('amount').value);

    const res = await fetch('/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_wallet: senderWallet, recipient_wallet: recipientWallet, amount }),
    });

    const data = await res.json();
    if (res.ok) {
        showNotification(data.message); 
        fetchUserData(senderWallet);
    } else {
        showNotification(data.message, true); 
    }
});

// История транзакций
async function fetchHistory(walletNumber) {
    const res = await fetch(`/history/${walletNumber}`);
    const transactions = await res.json();
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';
    transactions.forEach((tx) => {
        const li = document.createElement('li');
        li.textContent = `${tx.timestamp} - ${tx.sender_wallet} → ${tx.recipient_wallet}: ${tx.amount} ₽`;
        historyList.appendChild(li);
    });
}
