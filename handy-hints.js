import { CharacterCreator } from './scripts/character-creator.js';
import { ChatParser } from './scripts/parse-chat.js'

class HandyHints
{
    static SETTINGS = {
        INJECT_BUTTON: 'inject-button'
    }
    static ID = "handy-hints"
    static combat_tracker_html = null

    static initialize()
    {
        game.settings.register(this.ID, this.SETTINGS.INJECT_BUTTON, {
            name: `handy-hints.settings.${this.SETTINGS.INJECT_BUTTON}.Name`,
            default: true,
            type: Boolean,
            scope: 'client',
            config: true,
            hint: `handy-hints.settings.${this.SETTINGS.INJECT_BUTTON}.Hint`,
          });
    }

    static set_combat_tracker( tracker_html )
    {
        this.combat_tracker_html = tracker_html
    }

    static get_combat_tracker()
    {
        return this.combat_tracker_html
    }
}

class CurrentActor
{
    static actions_left = 3
    static current_actor = ""
    static combatant = null
    static movement = {
        max: 0,
        used: 0
    }
    static startTurn( combatant )
    {
        this.combatant = combatant
        let actor_id = combatant.actorId
        this.actions_left = 3
        this.current_actor = actor_id
        // clear all state
        this.movement.used = 0
        this.movement.max = combatant.actor.system.attributes.speed.value / canvas.dimensions.distance
    }

    static consumeAction( actor_id, action_type, action_count )
    {
        this.actions_left -= action_count

        let my_thing = HandyHints.get_combat_tracker().find(`[id="actions-remaining"]`)
        let new_class = "action-economy"
        if(this.actions_left == 1)
        {
            new_class += " economy-1-action"
        }
        else if(this.actions_left == 2)
        {
            new_class += " economy-2-actions"
        }
        else if(this.actions_left == 3)
        {
            new_class += " economy-3-actions"
        }
        my_thing.attr('class', new_class)
    }

    static isTurn(my_id)
    {
        if(my_id != this.current_actor)
        {
            return false
        }
        return true
    }

    static isAction(chatMessagePF2E)
    {
        let pf2eParent = chatMessagePF2E["flags"]["pf2e"]
        if(!pf2eParent?.["origin"])
        {
            return false
        }
        return true
    }

    static countMovement(token, updates)
    {
        // copied from argon combat HUD
        let ttoken = canvas.tokens.get(token.id);
        let newX = updates.x || ttoken.x;
        let newY = updates.y || ttoken.y;
        let oldX = ttoken.x;
        let oldY = ttoken.y;
        const ray = new Ray({ x: oldX, y: oldY }, { x: newX, y: newY });
        const segments = [{ ray }];
        let distance = Math.floor(
          canvas.grid.measureDistances(segments, { gridSpaces: true }) /
            canvas.dimensions.distance
        );
        this.movement.used += distance // how much we've moved
        // calculate amount of strides
        if(this.movement.used >= this.movement.max)
        {
            // moved a stride (or more)
            let strides = Math.ceil(this.movement.used / this.movement.max) // (at least 1)
            this.consumeAction( this.actorId, "stride", strides)
            this.movement.used = (strides * this.movement.max) - this.movement.used
        }
    }

    static endMovement()
    {
        if(this.movement.used == 0)
            return
        let strides =  Math.ceil(this.movement.used / this.movement.max)
        this.consumeAction( this.actorId, "stride", strides)
        this.movement.used = 0
    }
}

Hooks.on("init", async function () {
    HandyHints.initialize()
    CONFIG.debug.hooks = true;
});

Hooks.on("pf2e.startTurn", ( combatant, encounter ) => {
    if (!game.settings.get(HandyHints.ID, HandyHints.SETTINGS.INJECT_BUTTON)) {
        return;
    }
    CurrentActor.startTurn(combatant)
});

Hooks.on("renderChatMessage", (chatMessagePF2E, html) => {
    if (!game.settings.get(HandyHints.ID, HandyHints.SETTINGS.INJECT_BUTTON)) {
        return;
    }

    // get ACTOR ID
    let my_id = chatMessagePF2E?.["actor"]?.["id"]
    if( !CurrentActor.isTurn(my_id))
    {
        return // not their turn
    }
    if (!CurrentActor.isAction(chatMessagePF2E))
    {
        return // not an action
    }

    CurrentActor.endMovement()
    let parser = new ChatParser(chatMessagePF2E)
    let action = parser.action
    CurrentActor.consumeAction(my_id, action, action.action_cost)
});


Hooks.on("preUpdateItem", ( itemPF2E ) => {
    if (!game.settings.get(HandyHints.ID, HandyHints.SETTINGS.INJECT_BUTTON)) {
        return;
    }

    // TODO - skip if actor not in initiative
    // get ACTOR ID
    if( !CurrentActor.isTurn(""))
    {
        return
    }

    // TODO item interactions e.g. Sheath / Draw
    endMovement()
    console.log("Item interaction")
    console.log(itemPF2E)
});

Hooks.on("preUpdateToken", (token, updates) => {
    if (!game.settings.get(HandyHints.ID, HandyHints.SETTINGS.INJECT_BUTTON)) {
        return;
    }

    let actorId = token["actorId"]
    if( !CurrentActor.isTurn(actorId))
    {
        return
    }
    let distance = CurrentActor.countMovement(token, updates)
});

Hooks.on("renderEncounterTrackerPF2e", (tracker, html, css) => {
    console.log(html)
    if(HandyHints.get_combat_tracker() == null)
    {
        HandyHints.set_combat_tracker(html)
    }
});

Hooks.on("renderCombatTracker", (tracker, html, css) => {
    // console.log("Render Combat Tracker")
    // console.log(html)

    let combatant = CurrentActor.combatant
    if(combatant == null)
    {
        console.log("actor not set")
        return
    }
    let my_id = combatant.id
    const combatantItem = html.find(`[data-combatant-id="${my_id}"]`)
    let inner_row = combatantItem.find(`[class="token-name flexcol"]`)
    inner_row.after(
        "<div class='action-economy economy-3-actions' id='actions-remaining'></div>"
    );
    HandyHints.set_combat_tracker(html)
});

// Hooks.on("updateToken", (tokenDoc, updateData, diff, id) => {
//     if( game.combat?.combatant?.token.id != updateData._id)
//     {
//         return
//     }
//     // console.log(tokenDoc)
//     // console.log(updateData)
// });

// Hooks.on('deleteCombat', async () => {
//     await Marker.clearAllMarkers();
// });

Hooks.on("renderCharacterSheetPF2e", (character_sheet, character_html, css_class) => {
    console.log(character_sheet)
    console.log(character_html)
    console.log(css_class)

    let header = character_html.find(`[class="header-button close"]`)
    const tooltip = game.i18n.localize('CHARACTER-CREATOR.button-title');
    header.before(
        '<button type="button" class="header-button character-creator-button" title="' + tooltip + '"><i class="fas fa-tasks"></i></button>'
    );

    // register an event listener for this button
    character_html.on('click', '.character-creator-button', (event) => {
        const userId = $(event.currentTarget).parents('[data-user-id]')?.data()?.userId;
        new CharacterCreator(character_sheet).render(true, { 
            width: 750,
            height: 800
        })
    });
});