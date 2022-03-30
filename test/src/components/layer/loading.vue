
<template >
  <label :class="setClass" :id="options.id">
    <span></span>
    <i v-if="options.content!=''" v-html="options.content"></i>
  </label>
</template>

<script>
export default {
  data() {
    return {
      // timeout: ""
    };
  },
  props: {
    options: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  computed: {
    setClass() {
      let cls = {
        'vl-notify': true,
        'vl-notify-msg': true,
        'vl-notify-loading': true
      };
      if (this.options.content === '') {
        delete cls['vl-notify-msg']
      }
      return cls;
    }
  },
  mounted() {
    setTimeout(() => {
      this.options.layer.close(this.options.id);
    }, this.options.time * 1000);
  }
};
</script>
