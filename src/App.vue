<template>
  <div id="app">
    <header class="header-container">
      <i @click="minimize" class="fa fa-minus" aria-hidden="true"></i>
      <i @click="close" class="fa fa-times" aria-hidden="true"></i>
    </header>
    <router-view />
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  name: "App",
  methods: {
    close() {
      ipcRenderer.send("close");
    },
    minimize() {
      ipcRenderer.send("minimize");
    }
  }
};
</script>
<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, #474553 0%, #292830 100%);
  .header-container {
    width: 100%;
    text-align: right;
    i {
      padding: 5px 10px;
      border-radius: 5px;
      background-color: transparent;
      &:hover {
        cursor: url(./assets/img/pointer.png), pointer;
        background: #413f4c;
      }
    }
    .fa {
      -webkit-app-region: no-drag;
      margin: 5px 5px 0px 0px;
      font-size: 28px;
      color: #ffffff;
      font-weight: 200;
    }
  }
}
</style>
