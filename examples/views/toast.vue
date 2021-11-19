<template>
  <button @click="click">按钮</button>
</template>

<script>
export default {
  methods: {
    click() {
      this.$wjToast({ msg: "cheng" });
    },
  },
};
</script>