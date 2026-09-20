/* ============================================================
   DONNÉES DE LA QUÊTE
   Ce fichier contient le contenu éditorial, pas la logique du site.
   ============================================================ */

window.questData = {
    scenes: [
        { id: "scene-1", continueDelay: 11000 },
        { id: "scene-2", continueDelay: 6000 },
        { id: "scene-3", continueDelay: 4000 },
        { id: "scene-4", continueDelay: 4000 },
        { id: "scene-5", continueDelay: 4000 },
        { id: "scene-final", continueDelay: 0, final: true }
    ],

    hints: {
        step1: [
            "Sous les rues dorées de la capitale, un puits mène vers les profondeurs.",
            "Les égouts ne sont qu'un commencement. Descends toujours plus bas, là où les Réprouvés furent enfermés.",
            "Cherche une cathédrale au plus profond des égouts. Là où les Réprouvés sont gardés, ton ennemi t'attend.",
            "La cathédrale semble n'avoir aucune issue. Pourtant, un mur cache un passage. Frappe là où la pierre ment."
        ],

        step2: [
            "Dans les terres enneigées, cherche un médaillon qui n'est pas destiné à la Grâce.",
            "Le médaillon est incomplet. Ses deux moitiés sont séparées par les terres.",
            "L'une repose dans les terres de Liurnia. L'autre attend dans les montagnes des Géants.",
            "Lorsque les deux moitiés seront réunies, retourne à l'ascenseur qui mène aux terres enneigées. Une seconde voie s'offrira à toi."
        ]
    },

    particles: {
        count: 36,
        minSize: 1,
        maxSize: 3,
        minDuration: 12,
        maxDuration: 26
    }
};
