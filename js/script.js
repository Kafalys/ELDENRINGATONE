/* ============================================================
   LE SERMENT DU SANG — LOGIQUE DU SITE
   ============================================================ */

(() => {
    "use strict";

    const config = window.questData;

    if (!config) {
        console.error("Les données de la quête sont introuvables.");
        return;
    }

    /* ------------------------------------------------------------
       ÉLÉMENTS DOM
       ------------------------------------------------------------ */

    const scenes = [...document.querySelectorAll(".scene")];
    const continueButton = document.getElementById("continue-button");
    const sceneNavigation = document.getElementById("scene-navigation");
    const particlesContainer = document.getElementById("particles");
    const resetProgressButton = document.getElementById("reset-progress-button");
    const TRANSITION_DURATION = 1500;

    /* ------------------------------------------------------------
       SAUVEGARDE LOCALE
       ------------------------------------------------------------ */

    const STORAGE_KEY = "elden-ring-quete-progress";
    const STORAGE_VERSION = 3;

    function loadProgress() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);

            if (!savedData) {
                return null;
            }

            const parsedData = JSON.parse(savedData);

            if (!parsedData || typeof parsedData !== "object") {
                return null;
            }

            // La structure des scènes a changé : les anciennes sauvegardes
            // utilisent des index incompatibles avec la version actuelle.
            if (parsedData.version !== STORAGE_VERSION) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return parsedData;
        } catch (error) {
            console.warn("Impossible de charger la progression sauvegardée.", error);
            return null;
        }
    }

    function saveProgress() {
        try {
            const hints = {};

            state.hints.forEach((hintState, stageKey) => {
                hints[stageKey] = {
                    currentIndex: hintState.currentIndex,
                    revealed: hintState.revealed,
                    revealedCount: hintState.revealedCount
                };
            });

            const progress = {
                version: STORAGE_VERSION,
                currentScene: state.currentScene,
                highestSceneReached: state.highestSceneReached,
                visitedScenes: [...state.visitedScenes],
                hints
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (error) {
            console.warn("Impossible de sauvegarder la progression.", error);
        }
    }

    function loadSavedProgress() {
        const savedData = loadProgress();

        if (!savedData) {
            return false;
        }

        const savedCurrentScene = Number.isInteger(savedData.currentScene)
            ? savedData.currentScene
            : 0;

        const savedHighestScene = Number.isInteger(savedData.highestSceneReached)
            ? savedData.highestSceneReached
            : 0;

        state.currentScene = Math.min(
            Math.max(savedCurrentScene, 0),
            scenes.length - 1
        );

        state.highestSceneReached = Math.min(
            Math.max(savedHighestScene, state.currentScene),
            scenes.length - 1
        );

        if (Array.isArray(savedData.visitedScenes)) {
            savedData.visitedScenes.forEach((index) => {
                if (
                    Number.isInteger(index) &&
                    index >= 0 &&
                    index < scenes.length
                ) {
                    state.visitedScenes.add(index);
                }
            });
        }

        state.visitedScenes.add(state.currentScene);

        for (let index = 0; index <= state.highestSceneReached; index += 1) {
            state.visitedScenes.add(index);
        }

        if (savedData.hints && typeof savedData.hints === "object") {
            Object.entries(savedData.hints).forEach(([stageKey, savedHint]) => {
                const hints = config.hints[stageKey] ?? [];

                if (!hints.length || !savedHint || typeof savedHint !== "object") {
                    return;
                }

                const legacyCurrentIndex = Number.isInteger(savedHint.currentIndex)
                    ? Math.min(
                        Math.max(savedHint.currentIndex, 0),
                        hints.length - 1
                    )
                    : 0;

                const revealedCount = Number.isInteger(savedHint.revealedCount)
                    ? Math.min(
                        Math.max(savedHint.revealedCount, 0),
                        hints.length
                    )
                    : (savedHint.revealed ? legacyCurrentIndex + 1 : 0);

                const currentIndex = revealedCount > 0
                    ? Math.min(legacyCurrentIndex, revealedCount - 1)
                    : 0;

                state.hints.set(stageKey, {
                    stageKey,
                    currentIndex,
                    revealed: revealedCount > 0,
                    revealedCount
                });
            });
        }

        return true;
    }

    /* ------------------------------------------------------------
       ÉTAT DE L'APPLICATION
       ------------------------------------------------------------ */

    const state = {
        currentScene: 0,
        highestSceneReached: 0,
        visitedScenes: new Set(),
        continueTimer: null,
        transitionTimer: null,
        victoryTimer: null,
        initialized: false,
        hints: new Map()
    };

    /* ------------------------------------------------------------
       OUTILS
       ------------------------------------------------------------ */

    function isFinalScene(index) {
        return Boolean(config.scenes[index]?.final) || index === scenes.length - 1;
    }

    function clearContinueTimer() {
        if (state.continueTimer !== null) {
            window.clearTimeout(state.continueTimer);
            state.continueTimer = null;
        }
    }

    function setContinueVisible(visible) {
        continueButton.classList.toggle("ready", visible);
        continueButton.setAttribute("aria-hidden", String(!visible));

        if (state.currentScene === 2 || state.currentScene === 4) {
            const scene = scenes[state.currentScene];
            const hintButton = scene?.querySelector(".hint-button");

            if (hintButton) {
                hintButton.classList.toggle("victory-hint-ready", visible);
            }
        }
    }
    /* ------------------------------------------------------------
       TRANSITION ENTRE LES SCÈNES
       ------------------------------------------------------------ */

    function playSceneTransition(index) {
        document.body.classList.remove("scene-transitioning");
        void document.body.offsetWidth;
        document.body.classList.add("scene-transitioning");


        if (state.transitionTimer !== null) {
            window.clearTimeout(state.transitionTimer);
        }

        state.transitionTimer = window.setTimeout(() => {
            document.body.classList.remove("scene-transitioning");
            state.transitionTimer = null;
        }, TRANSITION_DURATION);
    }

    /* ------------------------------------------------------------
       NAVIGATION DES SCÈNES
       ------------------------------------------------------------ */

    function updateSceneNavigation(highlightReachedIndex = null) {
        sceneNavigation.replaceChildren();

        for (let index = 0; index <= state.highestSceneReached; index += 1) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "scene-nav-item";
            button.textContent = String(index + 1);
            button.setAttribute("aria-label", `Aller à la scène ${index + 1}`);
            button.setAttribute(
                "aria-current",
                index === state.currentScene ? "step" : "false"
            );

            if (index === state.currentScene) {
                button.classList.add("current");
            }

            if (index === highlightReachedIndex) {
                button.classList.add("just-reached");
            }

            button.addEventListener("click", () => showScene(index));
            sceneNavigation.appendChild(button);

            if (index < state.highestSceneReached) {
                const separator = document.createElement("span");
                separator.className = "scene-nav-separator";
                separator.setAttribute("aria-hidden", "true");
                sceneNavigation.appendChild(separator);
            }
        }

        sceneNavigation.classList.add("visible");
    }

    function showScene(index) {
        if (index < 0 || index >= scenes.length) {
            return;
        }

        clearContinueTimer();

        if (state.victoryTimer !== null) {
            window.clearTimeout(state.victoryTimer);
            state.victoryTimer = null;
        }

        const alreadyVisited = state.visitedScenes.has(index);
        const isNewlyReached = !alreadyVisited;
        const isInitialRender = !state.initialized;

        if (!isInitialRender && (index !== state.currentScene || isNewlyReached)) {
            playSceneTransition(index);
        }

        state.visitedScenes.add(index);
        state.currentScene = index;
        state.highestSceneReached = Math.max(
            state.highestSceneReached,
            index
        );

        document.body.classList.toggle("stage-two-active", index === 4);

        saveProgress();

        scenes.forEach((scene) => {
            scene.classList.remove("active", "no-animation");
        });

        const scene = scenes[index];
        scene.classList.add("active");

        scene.classList.toggle(
            "victory-hint-pending",
            index === 2 || index === 4
        );

        if (alreadyVisited) {
            scene.classList.add("no-animation");
        }

        updateSceneNavigation(!isInitialRender && isNewlyReached ? index : null);
        updateContinueButton();
        state.initialized = true;

        if (isFinalScene(index)) {
            setContinueVisible(false);
            return;
        }

        if (alreadyVisited) {
            setContinueVisible(true);
            return;
        }

        setContinueVisible(false);

        const configuredDelay = config.scenes[index]?.continueDelay ?? 0;
        const delay = configuredDelay;

        state.continueTimer = window.setTimeout(() => {
            setContinueVisible(true);
            state.continueTimer = null;
        }, delay);
    }

    function nextScene() {
        if (state.currentScene >= scenes.length - 1) {
            return;
        }

        // Toutes les scènes utilisent désormais la même transition.
        // Les animations narratives propres à certaines scènes restent
        // indépendantes de ce changement de scène.
        showScene(state.currentScene + 1);
    }

    function updateContinueButton() {
        const isVictoryScene = state.currentScene === 2 || state.currentScene === 4;

        continueButton.hidden = isFinalScene(state.currentScene);
        continueButton.classList.toggle("victory-button", isVictoryScene);

        if (state.currentScene === 2) {
            continueButton.textContent = "LE RÉPROUVÉ EST VAINCU";
        } else if (state.currentScene === 4) {
            continueButton.textContent = "LE SEIGNEUR DU SANG EST VAINCU";
        } else {
            continueButton.textContent = "CONTINUER";
        }
    }

    /* ------------------------------------------------------------
       INDICES — CARROUSEL HORIZONTAL
       ------------------------------------------------------------ */

    function createHintState(stageKey) {
        return {
            stageKey,
            currentIndex: 0,
            revealed: false,
            revealedCount: 0
        };
    }

    function getHintElements(hintsElement) {
        return {
            revealButton: hintsElement.querySelector('[data-action="reveal-hint"]'),
            nextButton: hintsElement.querySelector('[data-action="next-hint"]'),
            container: hintsElement.querySelector('[data-role="hint-container"]'),
            track: hintsElement.querySelector('[data-role="hint-track"]'),
            navigation: hintsElement.querySelector('[data-role="hint-navigation"]'),
            status: hintsElement.querySelector('[data-role="hint-status"]')
        };
    }

    function getHintState(stageKey) {
        if (!state.hints.has(stageKey)) {
            state.hints.set(stageKey, createHintState(stageKey));
        }

        return state.hints.get(stageKey);
    }

    function getVisibleHintIndex(hintState, hintsLength) {
        if (!hintState.revealedCount) {
            return 0;
        }

        return Math.min(
            Math.max(hintState.currentIndex, 0),
            Math.max(hintState.revealedCount - 1, 0),
            hintsLength - 1
        );
    }

    function renderHintCarousel(hintsElement, animate = false, revealNew = false) {
        const stageKey = hintsElement.dataset.hintStage;
        const hints = config.hints[stageKey] ?? [];
        const hintState = getHintState(stageKey);
        const elements = getHintElements(hintsElement);

        if (!hints.length) {
            elements.revealButton.hidden = true;
            elements.container.hidden = true;
            return;
        }

        if (hintState.revealedCount <= 0) {
            elements.container.classList.remove("visible");
            elements.container.hidden = true;
            elements.revealButton.hidden = false;
            elements.status.hidden = true;
            return;
        }

        elements.container.hidden = false;
        elements.container.classList.add("visible");
        elements.container.setAttribute("aria-hidden", "false");
        elements.revealButton.hidden = true;

        const selectedIndex = getVisibleHintIndex(hintState, hints.length);

        elements.track.replaceChildren();

        for (let index = 0; index < hintState.revealedCount; index += 1) {
            const card = document.createElement("article");
            card.className = "hint-card";
            card.dataset.index = String(index);

            if (index === selectedIndex) {
                card.classList.add("current");
            }

            if (revealNew && index === hintState.revealedCount - 1) {
                card.classList.add("reveal-new");
            }

            const number = document.createElement("p");
            number.className = "hint-card-number";
            number.textContent = `INDICE ${toRoman(index + 1)}`;

            const text = document.createElement("p");
            text.className = "hint-card-text";
            text.textContent = hints[index];

            card.append(number, text);
            elements.track.appendChild(card);
        }

        requestAnimationFrame(() => {
            updateHintCarouselPosition(hintsElement, animate);
        });

        updateHintNavigation(hintsElement, revealNew ? hintState.revealedCount - 1 : null);

        const allRevealed = hintState.revealedCount >= hints.length;

        // Le dernier indice remplace directement le bouton d'interrogation.
        // Le message occupe exactement la même zone afin que la mise en page
        // ne bouge pas lorsque le dernier indice est révélé.
        elements.nextButton.hidden = allRevealed;
        elements.status.hidden = !allRevealed;

        // Le dernier indice ne propose plus d'interroger la Grâce.
        // Le texte final occupe exactement la même zone réservée.
        if (allRevealed) {
            elements.nextButton.setAttribute("aria-hidden", "true");
            elements.status.textContent = "La Grâce t'a montré le chemin. À toi de l'emprunter.";
            elements.status.setAttribute("aria-hidden", "false");
        } else {
            elements.nextButton.removeAttribute("aria-hidden");
            elements.status.setAttribute("aria-hidden", "true");
        }
    }

    function updateHintCarouselPosition(hintsElement, animate = true) {
        const stageKey = hintsElement.dataset.hintStage;
        const hints = config.hints[stageKey] ?? [];
        const hintState = getHintState(stageKey);
        const elements = getHintElements(hintsElement);

        if (!hints.length || !hintState.revealedCount) {
            return;
        }

        const selectedIndex = getVisibleHintIndex(hintState, hints.length);
        const cards = [...elements.track.querySelectorAll(".hint-card")];
        const currentCard = cards[selectedIndex];

        if (!currentCard) {
            return;
        }

        elements.track.classList.toggle("instant", !animate);

        const viewportCenter = elements.container.clientWidth / 2;
        const cardCenter = currentCard.offsetLeft + currentCard.offsetWidth / 2;
        const offset = viewportCenter - cardCenter;

        elements.track.style.transform = `translate3d(${offset}px, 0, 0)`;

        cards.forEach((card, index) => {
            card.classList.toggle("current", index === selectedIndex);
        });

        window.setTimeout(() => {
            elements.track.classList.remove("instant");
        }, animate ? 850 : 0);
    }

    function updateHintNavigation(hintsElement, highlightIndex = null) {
        const stageKey = hintsElement.dataset.hintStage;
        const hints = config.hints[stageKey] ?? [];
        const hintState = getHintState(stageKey);
        const elements = getHintElements(hintsElement);

        elements.navigation.replaceChildren();

        for (let index = 0; index < hintState.revealedCount; index += 1) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "hint-nav-item";
            button.textContent = toRoman(index + 1);
            button.setAttribute("aria-label", `Consulter l'indice ${index + 1}`);
            button.setAttribute(
                "aria-current",
                index === hintState.currentIndex ? "true" : "false"
            );

            if (index === hintState.currentIndex) {
                button.classList.add("current");
            }

            if (index === highlightIndex) {
                button.classList.add("just-revealed");
            }

            button.addEventListener("click", () => {
                selectHint(hintsElement, index);
            });

            elements.navigation.appendChild(button);

            if (index < hintState.revealedCount - 1) {
                const separator = document.createElement("span");
                separator.className = "hint-nav-separator";
                separator.textContent = "◆";
                separator.setAttribute("aria-hidden", "true");
                elements.navigation.appendChild(separator);
            }
        }
    }

    function selectHint(hintsElement, index) {
        const stageKey = hintsElement.dataset.hintStage;
        const hints = config.hints[stageKey] ?? [];
        const hintState = getHintState(stageKey);

        if (
            index < 0 ||
            index >= hintState.revealedCount ||
            index >= hints.length
        ) {
            return;
        }

        hintState.currentIndex = index;
        hintState.revealed = true;

        saveProgress();
        renderHintCarousel(hintsElement, true);
    }

    function revealNextHint(hintsElement) {
        const stageKey = hintsElement.dataset.hintStage;
        const hints = config.hints[stageKey] ?? [];
        const hintState = getHintState(stageKey);

        if (hintState.revealedCount >= hints.length) {
            return;
        }

        hintState.revealedCount += 1;
        hintState.currentIndex = hintState.revealedCount - 1;
        hintState.revealed = true;

        saveProgress();
        renderHintCarousel(hintsElement, true, true);
    }

    function initializeHints() {
        document
            .querySelectorAll(".hints[data-hint-stage]")
            .forEach((hintsElement) => {
                const elements = getHintElements(hintsElement);

                elements.revealButton.addEventListener("click", () => {
                    revealNextHint(hintsElement);
                });

                elements.nextButton.addEventListener("click", () => {
                    revealNextHint(hintsElement);
                });

                const stageKey = hintsElement.dataset.hintStage;
                const hintState = state.hints.get(stageKey);

                if (hintState?.revealedCount > 0) {
                    renderHintCarousel(hintsElement, false);
                } else {
                    renderHintCarousel(hintsElement, false);
                }
            });
    }

    function toRoman(number) {
        const values = [
            [1000, "M"],
            [900, "CM"],
            [500, "D"],
            [400, "CD"],
            [100, "C"],
            [90, "XC"],
            [50, "L"],
            [40, "XL"],
            [10, "X"],
            [9, "IX"],
            [5, "V"],
            [4, "IV"],
            [1, "I"]
        ];

        let result = "";

        for (const [value, symbol] of values) {
            while (number >= value) {
                result += symbol;
                number -= value;
            }
        }

        return result;
    }

    /* ------------------------------------------------------------
       CLAVIER
       ------------------------------------------------------------ */

    function initializeKeyboard() {
        document.addEventListener("keydown", (event) => {
            if (event.defaultPrevented) {
                return;
            }

            const tagName = event.target?.tagName;
            const isFormControl = [
                "INPUT",
                "TEXTAREA",
                "SELECT",
                "BUTTON"
            ].includes(tagName);

            if (isFormControl) {
                return;
            }

            if (event.code === "Space" || event.code === "Enter") {
                event.preventDefault();
                nextScene();
            }
        });
    }

    /* ------------------------------------------------------------
       PARTICULES / CENDRES
       ------------------------------------------------------------ */

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function initializeParticles() {
        if (!particlesContainer || !config.particles) {
            return;
        }

        const fragment = document.createDocumentFragment();

        for (
            let index = 0;
            index < config.particles.count;
            index += 1
        ) {
            const particle = document.createElement("span");
            const size = randomBetween(
                config.particles.minSize,
                config.particles.maxSize
            );
            const duration = randomBetween(
                config.particles.minDuration,
                config.particles.maxDuration
            );
            const driftX = randomBetween(-180, 180);
            const driftY = randomBetween(-75, -35);
            const delay = randomBetween(-duration, 0);
            const startX = randomBetween(0, 100);
            const opacity = randomBetween(0.18, 0.65);

            particle.className = "ember";
            particle.style.setProperty("--size", `${size}px`);
            particle.style.setProperty("--start-x", `${startX}vw`);
            particle.style.setProperty("--drift-x", `${driftX}px`);
            particle.style.setProperty("--drift-y", `${driftY}vh`);
            particle.style.setProperty("--duration", `${duration}s`);
            particle.style.setProperty("--delay", `${delay}s`);
            particle.style.setProperty(
                "--opacity",
                opacity.toFixed(2)
            );

            fragment.appendChild(particle);
        }

        particlesContainer.appendChild(fragment);
    }

    /* ------------------------------------------------------------
       INITIALISATION
       ------------------------------------------------------------ */

    function initialize() {
        continueButton.addEventListener("click", nextScene);

        if (resetProgressButton) {
            resetProgressButton.addEventListener("click", () => {
                const confirmed = window.confirm(
                    "Réinitialiser complètement la progression de la quête ?\n\nToutes les scènes et tous les indices débloqués seront effacés."
                );

                if (!confirmed) {
                    return;
                }

                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
            });
        }

        const hasSavedProgress = loadSavedProgress();

        initializeHints();
        initializeKeyboard();
        initializeParticles();

        if (hasSavedProgress) {
            showScene(state.currentScene);
        } else {
            showScene(0);
        }
    }

    initialize();
})();
