<template>
  <div class="app" id="app">
    <navbar />
    <router-view />
    <notification />
  </div>
</template>

<script>
import Navbar from '@/components/navbar/navbar';
import Notification from '@/components/notification';

export default {
  components: {
    Navbar,
    Notification
  },
  data() {
    return {

    };
  },
  methods: {

  }
};
</script>

<style lang="scss">
@import '@/assets/styles/basic/basic.scss';
html,
body,
.app {
  min-width: 980px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: #eceff3;
}
</style>
