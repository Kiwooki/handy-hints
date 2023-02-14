export class CharacterCreator extends FormApplication 
{
    constructor(character_sheet, owner_id) 
    {
      const template_file = "modules/handy-hints/assets/myFormApplication.html";

      console.log("try load the compendium content to get ancestries, background, and classes")
      const ancestry_compendium = game.packs.get("pf2e.ancestries")
      // const heritages_compendium = game.packs.get("pf2e.heritages")
      // const feats_compendium = game.packs.get("pf2e.feats-srd")
      const background_compendium = game.packs.get("pf2e.backgrounds")
      const class_compendium = game.packs.get("pf2e.classes")
      // for( const feat_entry of feats_compendium.index )
      // {
      //   let feat = game.packs.get("pf2e.feats-srd").getDocument(feat_entry._id)
      // }

      loadTemplates([
        "modules/handy-hints/assets/sidebar.html", 
        "modules/handy-hints/assets/ancestry.html", 
        "modules/handy-hints/assets/background.html", 
        "modules/handy-hints/assets/class.html", 
        "modules/handy-hints/assets/level.html"]);
      const template_data = { title: "Handlebars header text.",
                              chosen_ancestry: "drag choice here",
                              chosen_heritage: "drag choice here",
                              chosen_background: "drag choice here",
                              chosen_class: "drag choice here",
                              tabs: [
                                      { 
                                        label: "ancestry",
                                        title: "Ancestry",
                                        ancestry: true,
                                        ancestries: ancestry_compendium.index
                                      },
                                      { 
                                        label: "background",
                                        title: "Background",
                                        content: "<em>Fancy tab3 content.</em>",
                                        background: true,
                                        backgrounds: background_compendium.index
                                      },
                                      { 
                                        label: "class",
                                        title: "Class",
                                        content: "<em>Fancy tab4 content.</em>",
                                        class: true,
                                        classes: class_compendium.index
                                      },
                                      { 
                                        label: "level",
                                        title: "Level",
                                        content: "<em>Fancy Level content.</em>",
                                        level: true
                                      }]
                            };
        let title_name = "Character Builder: " + character_sheet.object.name
        super( 
          template_data, 
          {
            title: title_name,
            template: template_file,
            tabs: [{navSelector: ".tabs", contentSelector: ".content", initial: "tab1"}],
            resizable: true,
          }
        );
        this.character_sheet = character_sheet;
        this.owner_id = owner_id;
      }
    
      _onDragStart( event ) {
        if(!event.currentTarget.classList.contains("ancestry-row"))
        {
          super._onDragStart(event);
        }

        if(event.currentTarget.classList.contains("ancestry-row"))
        {
          const dragData =
          {
            type: "Ancestry",
            id: event.currentTarget.dataset.documentId,
          }
          event.dataTransfer.setData('text/plain', JSON.stringify(dragData)) 
        }
        else if(event.currentTarget.classList.contains("background-row"))
        {
          const dragData =
          {
            type: "Background",
            id: event.currentTarget.dataset.documentId,
          }
          event.dataTransfer.setData('text/plain', JSON.stringify(dragData)) 
        }
        else if(event.currentTarget.classList.contains("class-row"))
        {
          const dragData =
          {
            type: "Class",
            id: event.currentTarget.dataset.documentId,
          }
          event.dataTransfer.setData('text/plain', JSON.stringify(dragData)) 
        }
      }

      async _onDrop(event) {
        let data;
        try {
          data = JSON.parse(event.dataTransfer.getData('text/plain'))
        } catch (err)
        {
          console.log(err)
          return false;
        }
        // TODO if ancestry
        this._updateObject(event, data)
      }

      static get defaultOptions() {
        const options = super.defaultOptions;
        options.dragDrop.push({ dragSelector: ".ancestry-row", dropSelector: null},
                              { dragSelector: ".background-row", dropSelector: null},
                              { dragSelector: ".class-row", dropSelector: null });
        return options
      }
    
      getData(options = {}) {
        return super.getData().object; // the object from the constructor is where we are storing the data
      }
      
      activateListeners(html) {
        super.activateListeners(html);

        html.find('.ancestry-selected').click( async ev => {
          let my_ancestry_id = ev.currentTarget.attributes[2].value
          let ancestry_sheet = await game.packs.get("pf2e.ancestries").getDocument(my_ancestry_id)
          ancestry_sheet.sheet.render(true)
        });
        html.find('.background-selected').click( async ev => {
          let my_background_id = ev.currentTarget.attributes[2].value
          let background_sheet = await game.packs.get("pf2e.backgrounds").getDocument(my_background_id)
          background_sheet.sheet.render(true)
        });
        html.find('.class-selected').click( async ev => {
          let my_class_id = ev.currentTarget.attributes[2].value
          let class_sheet = await game.packs.get("pf2e.classes").getDocument(my_class_id)
          class_sheet.sheet.render(true)
        });
      }
    
      async _updateObject(event, formData) {
        //  TODO filter for ancestry/heritage/class/etc.
        let data = super.getData().object
        if( formData.type == "Ancestry")
        {
          data.chosen_ancestry = formData.id
        }
        else if( formData.type == "Background")
        {
          data.chosen_background = formData.id
        }
        else if( formData.type == "Class")
        {
          data.chosen_class = formData.id
        }
        // if ancestry is chosen
        //   populate heritages
        // if all are picked 
        //   populate feats: ancestry/heritage/background/class/ 
        this.render( true ) // sets value but render fails
      }
}