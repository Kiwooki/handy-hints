import { Action, Strike, Spell, Ability } from './actions.js';

export class ChatParser
{
    constructor(pf2eChatMessage)
    {
        let pf2eParent = pf2eChatMessage["flags"]["pf2e"]
        // this.origin = this.pf2eParent["origin"]
        // this.message_type = this.origin["type"] // "spell", "weapon", "feat"

        if(pf2eParent["origin"]["type"] == "feat")
        {
            let ability = new Ability( pf2eChatMessage )
            this.action_class = ability
        }

        let context = pf2eParent["context"]
        if(pf2eParent?.["casting"])
        {
            this.action_class = new Spell(pf2eChatMessage)
        }
        else if(pf2eParent?.["strike"])
        {
            this.action_class = new Strike( pf2eChatMessage )
            // this.strike = this.pf2eParent["strike"]
            // this.action_class.options = context?.["options"]
            // Staff / Unarmed Strike
            // console.log("is strike")
            // this.is_action = true
            // this.action_cost = 1

            // if(this.context?.["options"])
            // {
            //     this.options = this.context["options"]
            //     this.options.forEach(element => {
            //         if(element == "attack") // Staff / Unarmed Strike
            //         {
            //             // console.log("has option attack")
            //             this.has_attack_trait = true
            //         }
            //     });
            // }
        }

        // // context["type"]: spell-cast
        // if(this.context?.["sourceType"])
        // {
        //     console.log("source type: " + this.context["sourceType"]) // "save"
        // }


        if(this.context?.["traits"])
        {
            this.action_class.traits = this.context["traits"]
            this.traits = this.context["traits"]
            this.traits.forEach(element => {
                if(element.label == "Attack")
                {
                    // PF2E.TraitDescriptionAttack
                    // console.log("has trait: Attack. Calculate MAP in subsequent actions")
                    this.has_attack_trait = true
                }
                // console.log("Trait: " + element.label)
            });
        }

        if(this.pf2eParent?.["modifierName"])
        {
            // 'Melee Strike: Staff'
            // console.log("type is: " + this.pf2eParent["modifierName"])
        }

        // if(pf2eChatMessage?.["item"]["system"]["actionType"])
        // {
        //     this.action_3 = pf2eChatMessage?.["item"]["system"]["actionType"]
        //     if(this.action_3?.["value"])
        //     {
        //         // console.log("action has value: " + this.action["value"])
        //         this.action.action_cost = this.action_3["value"] // wrong for feat
        //         this.is_action = true
        //     }
        //     else
        //     {
        //         // console.log("action type: " + this.action)
        //         this.is_action = true
        //     }
        // }
        
  
        // else{
        //     console.log("no content")
        // }

        // if(pf2eChatMessage?.["flavor"])
        // {
        //     console.log("has flavor")

        // }
    }

    // get message_type()
    // {
    //     return this.message_type
    // }

    get action()
    {
        return this.action_class
    }
}