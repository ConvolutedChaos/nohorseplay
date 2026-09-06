"use strict";
/* Kickoff.

   Loaded last, on purpose. Everything in here is a call that used to sit in the
   middle of the one big IIFE, where every function in the file was hoisted and
   callable no matter how far down it was written. Split into files that is no
   longer true, so the few load-time calls that reach forward into a later file
   are made from here instead, once all of them have loaded. Same order, same
   result -- deferred scripts all run before the first paint. */

tick();
