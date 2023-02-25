<template>
  <q-header bordered class="bg-white text-primary">
    <q-toolbar>
      <q-toolbar-title class="room-name">{{ roomName }}</q-toolbar-title>
      <q-btn size="10px" color="teal" @click="exitRoom">Exit Room</q-btn>
    </q-toolbar>
  </q-header>
  <q-list bordered class="bg-grey-1" style="min-height: 528px">
    <q-item
      v-for="(message, index) in messages"
      :key="index"
      :class="[message.isOwn ? 'self-message' : 'other-message']"
    >
      <q-item-section class="text-left"> </q-item-section>
      <q-item-section class="text-left">
        <q-item-label
          class="text-grey"
          :class="[message.isOwn ? 'self-name' : 'other-name']"
        >
          {{ message.userName }}
        </q-item-label>
        <q-item-label class="message-label">
          {{ message.text }}
        </q-item-label>
        <q-item-label
          class="text-grey"
          :class="[message.isOwn ? 'self-time' : 'other-time']"
        >
          {{ message.time }}
        </q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-img
          :class="[message.isOwn ? 'self-avatar' : 'other-avatar']"
          :src="`https://ui-avatars.com/api/?rounded=true&background=random&name=${message.userName}`"
          style="height: 30px; max-width: 30px"
        />
      </q-item-section>
    </q-item>
  </q-list>
  <q-footer>
    <SendMessageComponent
      :socket="socket"
      :roomId="roomId"
    ></SendMessageComponent>
  </q-footer>
</template>

<script>
import io from 'socket.io-client';
import SendMessageComponent from 'src/components/SendMessageComponent.vue';
import _ from 'lodash';
import { Notify } from 'quasar';

export default {
  components: { SendMessageComponent },
  data() {
    return {
      userId: '',
      roomId: '',
      roomName: '',
      socket: io(
        `${import.meta.env.VITE_API_URL}/api/rooms/${this.$route.params.id}`,
        {
          withCredentials: true,
        }
      ),
      messages: [],
    };
  },
  methods: {
    exitRoom() {
      this.socket.emit('exitRoom', {
        roomCode: this.roomId,
        userId: this.userId,
      });
      window.location.href = '/';
    },
  },
  mounted() {
    this.userId = localStorage.getItem('userId');
    this.roomId = this.$route.params.id;
    this.socket.on('connect', () => {
      this.socket.emit('pushMessages');
      this.socket.on('message', (message) => {
        message.isOwn = this.userId == message.userId;
        this.messages.push(message);
      });
      this.socket.on('receiveMessages', (room) => {
        this.roomName = _.capitalize(room.name);
        if (room.messages.length > 0) {
          room.messages.forEach((message) => {
            message.isOwn = this.userId == message.userId;
            return message;
          });
          this.messages = room.messages;
        }
      });
    });
  },
  beforeMount() {
    if (
      localStorage.getItem('userName') == undefined ||
      localStorage.getItem('userId') == undefined
    ) {
      this.$router.push('/');
      Notify.create({
        color: 'negative',
        message: 'Unable to identify you, please join again',
      });
    }
  },
};
</script>

<style scoped>
.bg-grey-1 {
  background-color: #f5f7fa;
}

.room-name {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
}

.message-label {
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  display: inline-block;
}

.self-message {
  display: flex;
  flex-direction: row;
  text-align: left;
  word-wrap: break-word;
}

.self-message .message-label {
  background-color: #b2ebf2;
  color: #000;
}

.other-message {
  display: flex;
  flex-direction: row-reverse;
  text-align: right;
  word-wrap: break-word;
}

.other-message .message-label {
  background-color: #fff;
  color: #000;
}

.self-time {
  text-align: right;
}

.other-time {
  text-align: left;
}
.self-name {
  text-align: right;
}

.other-name {
  text-align: left;
}
.self-avatar {
  text-align: right;
}

.other-avatar {
  text-align: left;
}
</style>
