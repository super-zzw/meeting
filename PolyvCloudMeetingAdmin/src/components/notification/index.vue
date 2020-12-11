<template>
  <div>
    <notifications
      group="success"
      position="top center"
      classes="notify-success">
      <template slot="body" slot-scope="props">
        <div class="live-notify notify-success">
          <h3 v-if="props.item.title">{{props.item.title}}</h3>
          <p v-html="props.item.text"></p>
          <span class="live-notify-close" @click="props.close">x</span>
        </div>
      </template>
    </notifications>
    <notifications
      group="warning"
      position="top center">
      <template slot="body" slot-scope="props">
        <div class="live-notify notify-warning">
          <h3 v-if="props.item.title">{{props.item.title}}</h3>
          <p v-html="props.item.text"></p>
          <span class="live-notify-close" @click="props.close">x</span>
        </div>
      </template>
    </notifications>
    <notifications
      group="error"
      position="top center">
      <template slot="body" slot-scope="props">
        <div class="live-notify notify-error">
          <h3 v-if="props.item.title">{{props.item.title}}</h3>
          <p v-html="props.item.text"></p>
          <span class="live-notify-close" @click="props.close">x</span>
        </div>
      </template>
    </notifications>
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss">
.live-notify {
  padding: 10px 15px;
  text-align: center;
  position: relative;
  color: #fff;

  >h3 {
    margin-bottom: 10px;
  }
}

.live-notify-close {
  position: absolute;
  right: 10px;
  top: 50%;
  width: 10px;
  // line-height: 20px;
  transform: translateY(-50%);
  text-align: center;
  cursor: pointer;
}

.notify-success {
  background-color: #68cd86;
}

.notify-warning {
  background-color: #ffb648;
}

.notify-error {
  background-color: #e54d42;
}

</style>
