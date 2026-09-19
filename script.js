/* ============================================================
   RÉCUPÉRATION DES ÉLÉMENTS
   ============================================================ */

const intro = document.getElementById("intro");
const title = document.getElementById("title");
const separator = document.getElementById("separator");

const step1 = document.getElementById("step1");
const transition = document.getElementById("transition");
const step2 = document.getElementById("step2");

const finalMessage = document.getElementById("final-message");


/* ============================================================
   FONCTION POUR AFFICHER UN ÉLÉMENT
   ============================================================ */

function show(element) {

    element.classList.remove("hidden");

    element.classList.add("fade-in");
}


/* ============================================================
   FONCTION POUR CACHER UN ÉLÉMENT
   ============================================================ */

function hide(element) {

    element.classList.remove("fade-in");

    element.classList.add("fade-out");

    setTimeout(() => {

        element.classList.add("hidden");

    }, 2000);
}


/* ============================================================
   DÉROULEMENT DE LA QUÊTE
   ============================================================ */


/*
    1. Introduction

    L'introduction reste affichée pendant quelques secondes.
*/


setTimeout(() => {

    hide(intro);

}, 4500);


/*
    2. Apparition du titre
*/

setTimeout(() => {

    show(title);
    show(separator);

}, 5000);


/*
    3. Apparition de la première étape
*/

setTimeout(() => {

    show(step1);

}, 7500);


/*
    4. Disparition de l'étape 1
*/

setTimeout(() => {

    hide(title);
    hide(separator);
    hide(step1);

}, 15000);


/*
    5. Message de transition
*/

setTimeout(() => {

    show(transition);

}, 17000);


/*
    6. Disparition du message de transition
*/

setTimeout(() => {

    hide(transition);

}, 21000);


/*
    7. Apparition de la deuxième étape
*/

setTimeout(() => {

    show(step2);

}, 22000);


/*
    8. Message final
*/

setTimeout(() => {

    show(finalMessage);

}, 30000);
