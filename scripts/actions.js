export class Action
{
    action_cost = 0
    traits = []
    constructor()
    {
        console.log("Action")
    }
}

export class Strike extends Action
{
    // weapon / unarmed
    constructor( pf2eChatMessage )
    {
        super()
        console.log("Strike")
        this.options = pf2eChatMessage["flags"]["pf2e"]["context"]["options"]
        let cost = 1 // pf2eChatMessage?.["item"]["system"]["actions"]["value"]
        let traits = pf2eChatMessage["flags"]["pf2e"]["context"]["traits"]
        traits.forEach(element => {
            console.log("Trait: " + element.label)
        });
        this.action_cost = cost
        this.traits = traits
    }
}

export class Spell extends Action
{
    // either save / spell attack
    constructor( pf2eChatMessage )
    {
        super()
        console.log("Spell")
        this.casting = pf2eChatMessage["flags"]["pf2e"]["casting"]
        let cost = pf2eChatMessage?.["item"]["system"]["time"]["value"]
        let traits = pf2eChatMessage?.["item"]["system"]["traits"]
        traits["value"].forEach(element => {
            console.log("Trait: " + element)
        });
        this.action_cost = cost
        this.traits = traits
    }
}

export class Ability extends Action
{
    // e.g. feats
    // check / DC
    constructor(pf2eChatMessage)
    {
        super()
        console.log("Ability/Skill")
        let cost = pf2eChatMessage?.["item"]["system"]["actions"]["value"]
        this.action_cost = cost
    }
}

// export class Interact extends Action
// {
//     // e.g. object/item interactions
//     constructor()
//     {
//         super()
//         console.log("Interact")
//     }
// }

// export class Stride extends Action
// {
//     // TODO - movement
//     constructor()
//     {
//         super()
//         console.log("Stride")
//     }
// }