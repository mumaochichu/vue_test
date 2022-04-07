<template>
  <img :src="notfound" alt="404" style="position: absolute;top: 10%;left: 25%;">
</template>

<script>
import img from "../../src/assets/images/404.png"
export default {
   name: 'notFound',
  data(){
    return {
      notfound:img,
    }
  }
}
</script>

<style>

</style>