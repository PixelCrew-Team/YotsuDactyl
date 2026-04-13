const socket = io();
const serverId = window.location.pathname.split('/').pop();

socket.emit('server:join', serverId);

socket.on('server:console', (data) => {
    const terminal = document.getElementById('console');
    terminal.innerHTML += `<div>${data}</div>`;
    terminal.scrollTop = terminal.scrollHeight;
});

document.querySelectorAll('.btn-ctrl').forEach(btn => {
    btn.addEventListener('click', async () => {
        const action = btn.innerText.toLowerCase();
        const response = await fetch(`/api/server/${serverId}/power`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        const res = await response.json();
        if (res.success) {
            console.log(`Acción ${action} enviada correctamente`);
        }
    });
});

const input = document.querySelector('.console-input');
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        socket.emit('server:command', { serverId, command: input.value });
        input.value = '';
    }
});