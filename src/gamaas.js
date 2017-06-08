'use strict';

import _    from 'lodash';
import Enum from 'enum';

class Gamaas {
    constructor() {
        if (!Gamaas.instance) {
            console.log("initializing Gamaas class");

            if (!localStorage) {
                console.lof("Local storage is not available.");
            }

            this.options = {
                store : {
                    when : new Enum(["ALWAYS", "CALLED"])
                }
            };
            this.config = {
                store : {
                    when    : this.options.store.when.CALLED,
                    dataKey : "achievements"
                }
            }
            this.achievements = {};

            Gamaas.instance = this;
        }

        return Gamaas.instance;
    }

    init(configOnject) {
        if (!_.has(configOnject, "achievements")) {
            console.error("No achievements specified.");
            return this;
        }

        _.forEach(configOnject, (v, k) => {
            if (k === "achievements") {
                return this.processAchievements(v);
            } else if (k === "progression") {
                return this.processProgressions(v);
            } else if (k === "store") {
                return this.processStorage(v);
            }
        });

        return this;
    }

    setConfig(k, v) {
        Object.assign(this.config, {[k]: v});
        return this;
    }

    getConfig() {
        return this.config;
    }

    displayConfig() {
        console.log(this.config);
        return this;
    }

    displayAchievements() {
        console.log(this.achievements);
        return this;
    }

    displayPoints() {
        console.log("Points: ", 5);
        return this;
    }

    processStorage(store) {
        if (!_.isObject(store)) {
            console.error("Store must be an object. Received " + (typeof store));
            return false;
        }

        if (_.has(store, "when")) {
            let when = store.when.toUpperCase();
            if(this.options.store.when.get(when)) {
                this.config.store.when = this.options.store.when[when];
            } else {
                console.error("Invalid value for when to store");
            }
        }

        if (_.has(store, "dataKey")) {
            this.config.store.dataKey = store.dataKey;
        }

        return this;
    }

    processProgressions(progressions) {
        if (_.isString(progressions) &&
            progressions.toUpperCase() === "STORAGE") {
            return this.processProgressions(this.getStore());
        }

        if (!_.isObject(progressions)) {
            console.error("Progressions must be an object or \"STORAGE\". Received " + (typeof achievements));
            return false;
        }

        _.forEach(progressions, (a, k) => {
            return this.processProgression(k, a);
        });

        return true;
    }

    processProgression(id, progression) {
        if (!_.isObject(progression)) {
            console.error("Progression needs to be an object. Received " + (typeof progression));
            return false;
        }

        if (!_.has(this.achievements, id)) {
            console.error(`Achievement ${id} does not exist.`);
            return this;
        }

        if (!_.has(progression, "progress")) {
            console.error(`Progression ${id} lacks progress amount`);
            return false;
        }

        if (!_.has(progression, "awarded")) {
            console.error(`Progression ${id} lacks award state`);
            return false;
        }

        let { progress, awarded } = progression;

        console.log(_.merge({}, this.achievements[id], { progress, awarded }));

        this.achievements[id] = _.merge({}, this.achievements[id], { progress, awarded });

        return true;
    }

    processAchievements(achievements) {
        if (!_.isObject(achievements)) {
            console.error("Achievements must be an object. Received " + (typeof achievements));
            return false;
        }

        _.forEach(achievements, (a, k) => {
            return this.processAchievement(k, a);
        });
    }

    processAchievement(id, achievement) {
        if (!_.isObject(achievement)) {
            console.error("Achievement needs to be an object. Received " + (typeof achievement));
            return false;
        }

        Object.assign(this.achievements, _.merge({}, this.achievements, {
            [id]: _.merge({}, achievement, {
                progress: 0,
                awarded: false
            })
        }));
        return true;
    }

    store() {
        console.log("Storing achievements", JSON.stringify(this.achievements));
        localStorage.setItem(this.config.store.datakey, JSON.stringify(this.achievements));
    }

    getStore() {
        return JSON.parse(localStorage.getItem(this.config.store.datakey));
    }

    progress(id, awarded = true) {
        if (!_.has(this.achievements, id)) {
            console.error(`Achievement ${id} does not exist.`);
            return this;
        }

        if ((_.has(this.achievements[id], "exceedRequired") &&
            this.achievements[id].exceedRequired) ||
            this.achievements[id].progress < this.achievements[id].required) {
            this.achievements[id].progress++;
        }

        if (_.isBoolean(awarded) &&
            awarded &&
            this.achievements[id].progress >= this.achievements[id].required) {
            this.achievements[id].awarded = true;
        }

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }

    regress(id, awarded = true) {
        if (!_.has(this.achievements, id)) {
            console.error(`Achievement ${id} does not exist.`);
            return this;
        }

        this.achievements[id].progress--;

        if (_.isBoolean(awarded) &&
            awarded &&
            this.achievements[id].progress < this.achievements[id].required) {
            this.achievements[id].awarded = false;
        }

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }

    reset(id, awarded = false) {
        if (!_.has(this.achievements, id)) {
            console.error(`Achievement ${id} does not exist.`);
            return this;
        }

        if (!_.isBoolean(awarded)) {
            console.error(`Achievement ${id} cannot be awarded: ${awarded}.`);
            return this;
        }

        this.achievements[id].progress = 0;

        if (_.isBoolean(awarded) &&
            awarded &&
            this.achievements[id].progress < this.achievements[id].required) {
            this.achievements[id].awarded = false;
        }

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }

    award(id, awarded = true) {
        if (!_.has(this.achievements, id)) {
            console.error(`Achievement ${id} does not exist.`);
            return this;
        }

        if (!_.isBoolean(awarded)) {
            console.error(`Achievement ${id} cannot be awarded: ${awarded}.`);
            return this;
        }

        this.achievements[id].awarded = awarded;

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }
}

let gamaas = new Gamaas();
Object.freeze(gamaas);

export default gamaas;
