// @flow

'use strict';

import _            from 'lodash';
import Enum         from 'enum';
import log          from 'loglevel';
import EventHandler from 'eventhandler';

class Gamaas {
    options: {
        store: {
            when: Enum
        },
        events: Enum
    };
    config: {
        store: {
            when: Object,
            dataKey: string
        }
    };
    achievements: Object;
    events: EventHandler;

    static instance: Gamaas;

    constructor(): Object {
        if (!Gamaas.instance) {
            log.debug("initializing Gamaas class");

            if (!_.has(window, "localStorage")) {
                throw new Error("Local storage is not available.");
            }

            this.events = new EventHandler();

            this.options = {
                store : {
                    when : new Enum(["ALWAYS", "CALLED"])
                },
                events : new Enum(["PROGRESS", "REGRESS", "RESET", "AWARD"])
            };
            this.config = {
                store : {
                    when     : this.options.store.when.CALLED,
                    dataKey  : "achievements"
                }
            }
            this.achievements = {};

            Gamaas.instance = this;
        }

        return Gamaas.instance;
    }

    init(configOnject: {
        achievements : Object,
        store        : Object,
        progression? : Object
    }): Gamaas {
        if (!_.has(configOnject, "achievements")) {
            throw new Error("No achievements specified.");
        }

        let { achievements, store, progression } = configOnject;

        // Achievements must be processed before progression
        this.processAchievements(achievements);
        if (progression) {
            this.processProgressions(progression);
        } else {
            this.processProgressions();
        }

        this.processStorage(store);

        return this;
    }

    getConfig(): Object {
        return _.cloneDeep(this.config);
    }

    displayConfig(): Gamaas {
        log.info(this.getConfig());
        return this;
    }

    getAchievements(): Object {
        return _.cloneDeep(this.achievements);
    }

    displayAchievements(): Gamaas {
        log.info(this.getAchievements());
        return this;
    }

    getPoints(): number {
        let points = 0;
        _.map(this.achievements, (a) => {
            if (a.awarded) {
                points += a.worth;
            }
        });

        return points;
    }

    displayPoints(): Gamaas {
        let points = this.getPoints();
        log.info("Points: ", points);

        return this;
    }

    processStorage(store: Object): boolean {
        if (!_.isObject(store)) {
            throw new Error("Store must be an object. Received " + (typeof store));
        }

        if (_.has(store, "when")) {
            let when: string = store.when.toUpperCase();
            if (this.options.store.when.get(when)) {
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

    processProgressions(progressions? : Object): boolean {
        if (!progressions) {
            progressions = this.getStore();
        }

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
        let achievements = {};
        _.map(_.cloneDeep(this.achievements), (a, id) => {
            const { progress, awarded } = a;
            achievements[id] = {
                progress,
                awarded
            }
        });

        log.info("Storing achievements", JSON.stringify(achievements));
        window.localStorage.setItem(this.config.store.dataKey, JSON.stringify(achievements));

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

            this.events.emit("progress", {
                event : "progress",
                id
            });

            if (_.isBoolean(awarded) &&
                awarded &&
                this.achievements[id].progress >= this.achievements[id].required) {
                this.award(id, true, "progress");
            }

            if (this.options.store.when.get(this.config.store.when)) {
                this.store();
            }
        }

        return this;
    }

    regress(id: string, awarded: boolean = true): Gamaas {
        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
        }

        if (this.achievements[id].progress > 0) {
            this.achievements[id].progress--;

            this.events.emit("regress", {
                event : "regress",
                id
            });

            if (_.isBoolean(awarded) &&
                awarded &&
                this.achievements[id].progress < this.achievements[id].required) {
                this.award(id, false, "regress");
            }

            if (this.options.store.when.get(this.config.store.when)) {
                this.store();
            }
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

        this.events.emit("reset", {
            event : "reset",
            id
        });

        if (_.isBoolean(awarded) &&
            awarded &&
            this.achievements[id].progress < this.achievements[id].required) {
            this.achievements[id].awarded  = false;
        }

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }

    award(id: string, awarded: boolean = true, reason? : string = "Unknown"): Gamaas {
        if (!_.has(this.achievements, id)) {
            throw new Error(`Achievement ${id} does not exist.`);
        }

        if (!_.isBoolean(awarded)) {
            throw new Error(`Achievement ${id} cannot be awarded: ${awarded.toString()}.`);
        }

        this.achievements[id].awarded = awarded;

        this.events.emit("award", {
            event   : "award",
            message : reason,
            id
        });

        if (this.options.store.when.get(this.config.store.when)) {
            this.store();
        }

        return this;
    }

    on(event: string, callback: Function): Gamaas {
        if (!this.options.events.get(event.toUpperCase())) {
            throw new Error("Invalid event type");
        }

        this.events.on(event, (data) => {
            setTimeout(() => {
                callback(data);
            },1);
        });

        return this;
    }
}

let gamaas: Gamaas = new Gamaas();
Object.freeze(gamaas);

export default gamaas;
