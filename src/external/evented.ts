/**
 * Event emitter.
 */
export class Evented<M> {
    private events: { [K in keyof M]?: Array<(ev: M[K]) => void> };

    /**
     * Event emitter class is used internally by the map.
     */
    constructor() {
        this.events = {};
    }

    /**
     * Registers event listener.
     *
     * @param type Event type.
     * @param listener Event handler.
     */
    public on<K extends keyof M>(type: K, listener: (ev: M[K]) => void): this {
        let eventsByType = this.events[type];
        if (!eventsByType) {
            eventsByType = this.events[type] = [];
        }
        eventsByType.push(listener);
        return this;
    }

    /**
     * Registers event listener which will be called once.
     *
     * @param type Event type.
     * @param listener Event handler.
     */
    public once<K extends keyof M>(type: K, listener: (ev: M[K]) => void): this {
        const wrapper = (data: M[K]) => {
            this.off(type, wrapper);
            listener.call(this, data);
        };

        this.on(type, wrapper);

        return this;
    }

    /**
     * Removes event listener registered with `on`.
     *
     * @param type Event type.
     * @param listener Event handler.
     */
    public off<K extends keyof M>(type: K, listener: (ev: M[K]) => void): this {
        const eventsByType = this.events[type];

        if (!eventsByType) {
            return this;
        }

        const index = eventsByType.indexOf(listener);

        if (index !== -1) {
            eventsByType.splice(index, 1);
        }

        return this;
    }

    /**
     * Calls all event listeners with event type `type`.
     *
     * @param type Event type.
     * @param data Data transferred to events.
     */
    public emit<K extends keyof M>(type: K, data?: M[K]): this {
        const eventsByType = this.events[type];

        if (!eventsByType) {
            return this;
        }

        const events = eventsByType.slice();

        for (let i = 0; i < events.length; i++) {
            events[i].call(this, data as any);
        }

        return this;
    }
}
