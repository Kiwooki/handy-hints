import { ChatParser } from './scripts/parse-chat.js'

// console.log('handy-hints | Hello World!');

Hooks.on("init", async function () {
    CONFIG.debug.hooks = true;
    console.log("enabled config debug hooks for handy hints")
});

Hooks.on("renderChatMessage", (chatMessagePF2E, html) => {
    // TODO - skip if actor not in initiative
    let parser = new ChatParser(chatMessagePF2E)
    let action = parser.action
    // TODO - count actions per turn
    console.log(action)
});

Hooks.on("preUpdateItem", ( itemPF2E ) => {
    // TODO item interactions e.g. Sheath / Draw
    console.log("Item interaction")
    console.log(itemPF2E)
});

Hooks.on('updateToken',(a,b,c,d,e)=>{
    // TODO - only apply anything if in actor's turn in initiative
    console.log("Update Token")
    // TODO - count movement against Actor's movement
    // TODO - count movement as Stride action
});

Hooks.on("updateCombatant", async (combatant, updateData, options, userId) => {
    // TODO - only make updates if ACTOR in initiative
    console.log("combatant update", {combatant, updateData, options, userId})
    let turn = combatant["parent"]["action"]
    let actor_name = combatant["name"]
    print(actor_name + " turn: " + turn)
});