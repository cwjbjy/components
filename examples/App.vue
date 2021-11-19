<template>
  <div id="app">
    <wj-button></wj-button>
    <button @click="click">按钮</button>
  </div>
</template>

<script>

export default {
  name: "App",
  methods: {
    click() {
      this.$wjToast({ msg: "cheng" });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
