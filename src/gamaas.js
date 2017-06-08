// @flow

'use strict';

import _    from 'lodash';
import Enum from 'enum';
import log  from 'loglevel';

class Gamaas {
    options: { store: { when: Object } };
    config: { store: { when: Object, dataKey: string } };
    achievements: Object;
    static instance: Gamaas;

    constructor(): Object {
        if (!Gamaas.instance) {
            log.info("initializing Gamaas class");

            if (!localStorage) {
                throw new Error("Local storage is not available.");
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

    init(configOnject: Object): Gamaas {
        if (!_.has(configOnject, "achievements")) {
            throw new Error("No achievements specified.");
        }

        _.map(configOnject, this.processConfig.bind(this));

        return this;
    }

    processConfig(v: Object, k: string): void {
        switch (k) {
            case "achievements": {
                this.processAchievements(v);
                this.processProgressions();
                break;
            }
            case "store": {
                this.processStorage(v);
                break;
            }
        }
    }

    getConfig(): Object {
        return this.config;
    }

    displayConfig(): Gamaas {
        log.info(this.config);
        return this;
    }

    displayAchievements(): Gamaas {
        log.info(this.achievements);
        return this;
    }

    displayPoints(): Gamaas {
        log.info("Points: ", 5);
        return this;
    }

    processStorage(store: Object): boolean {
        if (!_.isObject(store)) {
            throw new Error("Store must be an object. Received " + (typeof store));
        }

        if (_.has(store, "when")) {
            let when: string = store.when.toUpperCase();
            if(this.options.store.when.get(when)) {
                this.config.store.when = this.options.store.when[when];
            } else {
                throw new Error("Invalid value for when to store");
            }
        }

        if (_.has(store, "dataKey")) {
            this.config.store.dataKey = store.dataKey;
        }

        return true;
    }

    processProgressions(): boolean {
        let progressions = this.getStore();

        if (!_.isObject(progressions)) {
            throw new Error("Progressions must be an object or \"STORAGE\". Received " + (typeof progressions));
        }

        _.map(progressions, this.processProgression.bind(this));

        return true;
    }

    processProgression(progression: { progress?: number, awarded?: boolean }, id: string): boolean {
        if (!_.isObject(progression)) {
            throw new Error("Progression needs to be an object. Received " + (typeof progression));
        }

        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
        }

        if (!_.has(progression, "progress")) {
            throw new Error(`Progression ${id} lacks progress amount`);
        }

        if (!_.has(progression, "awarded")) {
            throw new Error(`Progression ${id} lacks award state`);
        }

        let { progress, awarded } = progression;

        log.info(_.merge({}, this.achievements[id], { progress, awarded }));

        this.achievements[id] = _.merge({}, this.achievements[id], { progress, awarded });

        return true;
    }

    processAchievements(achievements: Object): boolean {
        if (!_.isObject(achievements)) {
            throw new Error("Achievements must be an object. Received " + (typeof achievements));
        }

        _.map(achievements, this.processAchievement.bind(this));

        return true;
    }

    processAchievement(achievement: Object, id: string): boolean {
        if (!_.isObject(achievement)) {
            throw new Error("Achievement needs to be an object. Received " + (typeof achievement));
        }

        Object.assign(this.achievements, _.merge({}, this.achievements, {
            [id]: _.merge({}, achievement, {
                progress: 0,
                awarded: false
            })
        }));

        return true;
    }

    store(): Gamaas {
        log.info("Storing achievements", JSON.stringify(this.achievements));
        window.localStorage.setItem(this.config.store.dataKey, JSON.stringify(this.achievements));

        return this;
    }

    getStore(): Object {
        return JSON.parse(window.localStorage.getItem(this.config.store.dataKey));
    }

    progress(id: string, awarded: boolean = true): Gamaas {
        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
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

    regress(id: string, awarded: boolean = true): Gamaas {
        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
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

    reset(id: string, awarded: boolean = false): Gamaas {
        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
        }

        if (!_.isBoolean(awarded)) {
            throw new Error(`Achievement ${id} cannot be awarded: ${awarded.toString()}.`);
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

    award(id: string, awarded: boolean = true): Gamaas {
        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
        }

        if (!_.isBoolean(awarded)) {
            throw new Error(`Achievement ${id} cannot be awarded: ${awarded.toString()}.`);
        }

        this.achievements[id].awarded = awarded;

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }
}

let gamaas: Gamaas = new Gamaas();
Object.freeze(gamaas);

export default gamaas;
