<template>
  <div :id="RUNKIT_ID" class="hidden-runkit" >{{CODE}}</div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  const showLoading = ref(true);
  const RUNKIT_ID = 'runkit-id';
  const CODE = `
  const stylus = require("stylus"); 
  const str = \`
  // your stylus code here
  body
    color white
  \`
  stylus.render(str, { filename: 'playground.css' }, function(err, css){
    if (err) throw err;
    console.log("stylus compile result: ", css); 
  });  
`

  onMounted(() => {
    let runkitScript = document.createElement('script');
    runkitScript.setAttribute('src', 'https://embed.runkit.com');
    runkitScript.setAttribute('data-element-id', RUNKIT_ID);
    document.head.appendChild(runkitScript);
  });
</script>

<style scoped>
  .hidden-runkit {
    color: transparent;
  }
</style>
