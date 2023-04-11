import { strict as assert } from "assert";

import * as Discord from "discord.js";
import { MessageContextMenuCommandBuilder, ModalHandler, TextBasedCommandBuilder } from "./command.js";
import { critical_error, M } from "./utils.js";

import { Wheatley } from "./wheatley.js";

type Arr = readonly unknown[];
const wrap = <T extends Arr>(f: ((...args: [...T]) => (void | Promise<void>))) => {
    return async (...args: [...T]) => {
        try {
            await f(...args);
        } catch(e) {
            critical_error(e);
        }
    };
};

export class BotComponent {
    constructor(protected readonly wheatley: Wheatley) {
        wheatley.on("wheatley_ready", wrap(this.on_wheatley_ready.bind(this)));
    }

    async setup() {} // eslint-disable-line @typescript-eslint/no-empty-function

    private setup_listener<E extends keyof Discord.ClientEvents>(
        event: E, f: undefined | ((...args: Discord.ClientEvents[E]) => Promise<void>)
    ) {
        if(f) {
            M.log("Adding listener", event, this.constructor.name);
            this.wheatley.client.on(event, wrap(f.bind(this)));
        }
    }

    private on_wheatley_ready() {
        this.setup_listener("messageCreate", this.on_message_create);
        this.setup_listener("messageDelete", this.on_message_delete);
        this.setup_listener("messageUpdate", this.on_message_update);
        this.setup_listener("messageReactionAdd", this.on_reaction_add);
        this.setup_listener("messageReactionRemove", this.on_reaction_remove);
        this.setup_listener("interactionCreate", this.on_interaction_create);
        this.setup_listener("guildMemberAdd", this.on_guild_member_add);
        this.setup_listener("guildMemberUpdate", this.on_guild_member_update);
        this.setup_listener("threadCreate", this.on_thread_create);

        this.on_ready();
    }

    add_command<T extends unknown[]>(
        command: TextBasedCommandBuilder<T, true, true> | MessageContextMenuCommandBuilder<true> | ModalHandler<true>
    ) {
        this.wheatley.add_command(command);
    }

    // events
    /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
    async on_ready() {} // actually on wheatley ready
    async on_message_create?(message: Discord.Message): Promise<void>;
    async on_message_delete?(message: Discord.Message | Discord.PartialMessage): Promise<void>;
    async on_message_update?(
        old_message: Discord.Message | Discord.PartialMessage,
        new_message: Discord.Message | Discord.PartialMessage
    ): Promise<void>;
    async on_interaction_create?(interaction: Discord.Interaction): Promise<void>;
    async on_guild_member_add?(member: Discord.GuildMember): Promise<void>;
    async on_guild_member_update?(
        old_member: Discord.GuildMember | Discord.PartialGuildMember,
        new_member: Discord.GuildMember
    ): Promise<void>;
    async on_reaction_add?(
        reaction: Discord.MessageReaction | Discord.PartialMessageReaction,
        user: Discord.User                | Discord.PartialUser
    ): Promise<void>;
    async on_reaction_remove?(
        reaction: Discord.MessageReaction | Discord.PartialMessageReaction,
        user: Discord.User                | Discord.PartialUser
    ): Promise<void>;
    async on_thread_create?(thread: Discord.ThreadChannel): Promise<void>;
    /* eslint-enable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
}