const socket = io('/');
const peer = new Peer(undefined, {
  host: '/',
  port: '3001'
});

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);

  socket.on('user-connected', ( userId, userList ) => {
    console.log(`userID ${userId} connected to this room`);
    console.log(userList);
    DOM_updateLobbyMembers(id, userList);
  });

  socket.on('user-disconnected', ( userId ) => {
    console.log(`userID ${userId} left this room`);
    DOM_removeUserFromLobby(userId);
  });

  socket.on('debug-command', (data, timestamp, delta) => {
    DOM_logDebugCommand(data, timestamp, delta);
  })
});

function sendCMD() {
  socket.emit('debugCommand', ROOM_ID, Math.random(), Math.round(+new Date()));
}

function DOM_removeUserFromLobby(userId) {
  if( userId ) {
    document.querySelector(`[data-uid="${userId}"]`).remove();
  }
}
function DOM_clearLobby() {
  document.querySelector('#roomMembers').innerHTML = '';
}
function DOM_updateLobbyMembers(userId, userList) {
  DOM_clearLobby();

  Object.entries(userList).forEach( u => {
    let opt = document.createElement('option');
      opt.dataset.uid = u[1];
      opt.value = u[1];
      opt.innerText = u[1];
      opt.style.fontWeight = ( u[1] == userId ? 'bold' : 'normal' );
    document.querySelector('#roomMembers').appendChild(opt);
  });
}

function DOM_logDebugCommand(data, timestamp, delta) {
  let opt = document.createElement('option');
    opt.value = data;
    opt.innerText = `${delta}: ${data}`;
  document.querySelector('#debugCommands').appendChild(opt);
}