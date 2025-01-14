// index.js - Primary Page TS
// Author: Nathan Shturm
// Date: 1.13.2025

//Imports
import $ from 'npm:jquery';

// make sure document is ready
$(document).ready(() => {
  console.log("Document ready.")

  // Constants

  // Functions

  //Sample function
  
  // function myFunction(param1: any, param2: any) {
  //   // some code here
  //   // return results;
  // }

  $('#fullscreen').click(()  => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e: Error) => {
        console.error(e);
      });
      console.log("Going fullscreen.");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
  
  $(document).on('fullscreenchange', function() {
    if (document.fullscreenElement) {
      console.log("Entered fullscreen mode");
      $('body').addClass('is-fullscreen');
    } else {
      console.log("Exited fullscreen mode");
      $('body').removeClass('is-fullscreen');
    }
  });

});
