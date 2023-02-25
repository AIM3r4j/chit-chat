<template>
  <q-toolbar class="bg-grey-3 text-black row">
    <q-btn round flat icon="insert_emoticon" class="q-mr-sm" />
    <q-input
      autofocus
      rounded
      outlined
      dense
      class="WAL__field col-grow q-mr-sm"
      @keyup.enter="sendMessage"
      bg-color="white"
      v-model="inputMessage"
      placeholder="Type a message"
    />
    <q-btn round flat icon="mic" />
  </q-toolbar>
</template>

<script>
export default {
  data() {
    return {
      inputMessage: '',
    };
  },
  props: ['socket', 'roomId'],
  methods: {
    sendMessage() {
      if (this.inputMessage.length > 0) {
        this.socket.emit('sendMessage', {
          roomId: this.roomId,
          userId: localStorage.getItem('userId'),
          userName: localStorage.getItem('userName'),
          message: this.inputMessage,
        });
        this.inputMessage = '';
      }
    },
  },
};
</script>

<style></style>
