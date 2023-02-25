<template>
  <q-page class="container">
    <q-form @submit="createRoom" class="form">
      <q-input
        v-model="roomName"
        label="Please enter room name"
        class="input"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Input Required']"
      />
      <q-btn label="Create Room" type="submit" class="btn" />
    </q-form>
    <div class="or-text">or</div>
    <q-form class="form" @submit="joinRoom">
      <q-input
        v-model="roomCode"
        label="Please enter room code"
        class="input"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Input Required']"
      />
      <q-input
        v-model="userName"
        label="Please enter your name"
        class="input"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Input Required']"
      />
      <q-btn label="Join Room" type="submit" class="btn" />
    </q-form>
  </q-page>
</template>

<script>
import io from 'socket.io-client';
import { Notify } from 'quasar';
export default {
  data() {
    return {
      socket: io(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        withCredentials: true,
      }),
      roomName: '',
      roomCode: '',
      userId: '',
      userName: '',
    };
  },
  methods: {
    createRoom() {
      this.socket.emit('createRoom', {
        roomName: this.roomName,
        userId: this.userId,
      });
    },

    joinRoom() {
      this.socket.emit('joinRoom', {
        roomCode: this.roomCode,
        userId: this.userId,
      });
    },
  },
  mounted() {
    this.userId = localStorage.getItem('userId');
    this.userName = localStorage.getItem('userName');
    this.socket.on('connect', () => {
      if (this.userId == null) {
        this.socket.emit('user connect', this.socket.id);
      } else {
        this.socket.emit('user connect', this.userId);
      }
      this.socket.on('valid user', (userId) => {
        localStorage.setItem('userId', userId);
        console.log('connected to server with id', userId);
      });
      this.socket.on('roomNotFound', () => {
        Notify.create({
          color: 'negative',
          message: "Didn't find any room with that room code",
        });
      });
      this.socket.on('roomCreated', (room) => {
        this.roomCode = room.id;

        Notify.create({
          color: 'positive',
          message: `Room created with room code: '${this.roomCode}' and\n auto-filled the room code for easier joining`,
          progress: true,
          timeout: 10000,
          actions: [
            {
              label: 'Copy the room code to share',
              color: 'white',
              noDismiss: true,
              handler: () => {
                navigator.clipboard.writeText(this.roomCode);
                Notify.create({
                  color: 'positive',
                  message: 'Room code copied to clipboard',
                });
              },
            },
          ],
        });
      });
      this.socket.on('roomJoined', (room) => {
        localStorage.setItem('userName', this.userName);
        this.$router.push(`/rooms/${room.id}`);

        console.log('Room joined', room.id);
      });
      this.socket.on('duplicateRoom', () => {
        Notify.create({
          color: 'negative',
          message: 'Room found with the same name, please try another name',
        });
      });
    });
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  border: 3px solid rgb(129, 127, 127);
  border-radius: 10px;
  padding: 20px;
}

.input {
  width: 300px;
  margin-bottom: 20px;
}

.btn {
  width: 300px;
}

.or-text {
  margin: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  color: gray;
}
</style>
