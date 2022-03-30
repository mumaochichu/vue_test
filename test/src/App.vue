<!--根组件-->
<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view/>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'App',
  data(){
    return {
      
    }
  }
}
</script>

<style>
html,body,#app{
  width:100%;
  height:100%;
   margin: 0px;
    padding: 0;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    user-select: none;
}
</style>
