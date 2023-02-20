class FeatSelector extends FormApplication
{
  constructor(feats, title, callback)
  {
    const template_file = 'modules/handy-hints/assets/feat.html'
    const template_data = {
      title: title,
      feats: feats
    }
    super( 
      template_data, 
      {
        title: title,
        template: template_file,
        resizable: true,
      }
    );
    this.callback = callback
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return options
  }

  getData(options = {}) {
    return super.getData().object; // the object from the constructor is where we are storing the data
  }
      
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.preview-feat').click( async ev => {
      console.log("ancestry feat clicked")
      console.log(ev)
      console.log(ev.currentTarget.attributes[1].value)
      let feat_uuid = ev.currentTarget.attributes[1].value
      let ancestry_feat = await game.packs.get("pf2e.feats-srd").get(feat_uuid)
      ancestry_feat.sheet.render(true)
    });
    html.find('.chosen-feat').click( async ev => {
      console.log("ancestry feat picked")
      console.log(ev)
      console.log(ev.currentTarget.attributes[1].value)
      this.callback(ev, "formData blah")
    });
  }

  async _updateObject(event, formData) {
    console.log("updateObject")
    this.callback(event, formData)
  }
}

export class CharacterCreator extends FormApplication 
{
    constructor(character_sheet, owner_id) 
    {
      Handlebars.registerHelper('ifCond', function(v1, v2, options) {
        if(!v1 || !v2)
        {
          return false
        }
        if(v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      });
  
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
        "modules/handy-hints/assets/heritage.html", 
        "modules/handy-hints/assets/background.html", 
        "modules/handy-hints/assets/class.html", 
        "modules/handy-hints/assets/level.html"]);
      let ability_boosts = [5,10, 15,20] // fixed for all actors
      const template_data = { title: "Handlebars header text.",
                              chosen_ancestry: "drag choice here",
                              chosen_heritage: "drag choice here",
                              chosen_background: "drag choice here",
                              chosen_class: "drag choice here",
                              ability_boosts: ability_boosts,
                              actor: null,
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
        this.ancestry_compendium = ancestry_compendium
        this.background_compendium = background_compendium
        this.class_compendium = class_compendium
        this.feat_compendium = game.packs.get("pf2e.feats-srd") // preload feats
      }
    
      _onDragStart( event ) {
        // if(!event.currentTarget.classList.contains("ancestry-row"))
        // {
        //   super._onDragStart(event);
        // }

        if(event.currentTarget.classList.contains("ancestry-row"))
        {
          const dragData =
          {
            type: "Ancestry",
            id: event.currentTarget.dataset.documentId,
          }
          event.dataTransfer.setData('text/plain', JSON.stringify(dragData)) 
        }
        else if(event.currentTarget.classList.contains("heritage-row"))
        {
          const dragData =
          {
            type: "Heritage",
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
        this._updateObject(event, data)
      }

      static get defaultOptions() {
        const options = super.defaultOptions;
        options.dragDrop.push({ dragSelector: ".ancestry-row", dropSelector: null},
                              { dragSelector: ".heritage-row", dropSelector: null},
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
          let ancestry_sheet = await this.ancestry_compendium.getDocument(my_ancestry_id)
          ancestry_sheet.sheet.render(true)
        });
        html.find('.heritage-selected').click( async ev => {
          let my_ancestry_id = ev.currentTarget.attributes[2].value
          let ancestry_sheet = await this.heritages_compendium.getDocument(my_ancestry_id)
          ancestry_sheet.sheet.render(true)
        });
        html.find('.background-selected').click( async ev => {
          let my_background_id = ev.currentTarget.attributes[2].value
          let background_sheet = await this.background_compendium.getDocument(my_background_id)
          background_sheet.sheet.render(true)
        });
        html.find('.class-selected').click( async ev => {
          let my_class_id = ev.currentTarget.attributes[2].value
          let class_sheet = await this.class_compendium.getDocument(my_class_id)
          class_sheet.sheet.render(true)
        });
        html.find('.background-feat').click( async ev => {
          console.log("background feat clicked")
          console.log(ev)
          console.log(ev.currentTarget.attributes[1].value)
          let feat_uuid = ev.currentTarget.attributes[1].value.split(".")[3]
          let background_feat = await game.packs.get("pf2e.feats-srd").getDocument(feat_uuid)
          background_feat.sheet.render(true)
        });
        html.find('.class-feature').click( async ev => {
          console.log("class feature clicked")
          console.log(ev)
          console.log(ev.currentTarget.attributes[1].value)
          let feature_uuid = ev.currentTarget.attributes[1].value.split(".")[3]
          let class_feature = await game.packs.get("pf2e.classfeatures").getDocument(feature_uuid)
          class_feature.sheet.render(true)
        });
        html.find('.ancestry-feat').click( async ev => {
          console.log("ancestry feat clicked")
          console.log(ev)
          console.log(ev.currentTarget.attributes[1].value)
          let feat_uuid = ev.currentTarget.attributes[1].value.split(".")[3]
          let ancestry_feat = await game.packs.get("pf2e.ancestryfeatures").getDocument(feat_uuid)
          ancestry_feat.sheet.render(true)
        });
        html.find('.ancestry-feat-select').click( async ev => {
          // let selected_level = ev.currentTarget.attributes[1].value
          // use the ev to pass which level this is for instead
          let tmp_ancestry = this.ancestry
          let feats = []
          for( const feat_entry of this.feat_compendium.index)
          {
            let feat = await this.feat_compendium.getDocument(feat_entry._id)
            if(feat.system.featType.value === "ancestry")
            {
              if(feat.system.traits.value.includes(tmp_ancestry.system.traits.value[0]))
              {
                feats.push(feat) // TODO check level is correct
              }
            }
          }

          // make this much smaller - window sized
          new FeatSelector(feats, "Select Ancestry Feat", this.selectedFeatClick).render(true, { 
            width: 400,
            height: 400
          })
        });
        html.find('.level-accordion').click( async ev => {
          /* Toggle between adding and removing the "active" class,
          to highlight the button that controls the panel */
          ev.currentTarget.classList.toggle("level-active");

          /* Toggle between hiding and showing the active panel */
          var panel = ev.currentTarget.nextElementSibling;
          if (panel.style.display === "block") {
            panel.style.display = "none";
          } else {
            panel.style.display = "block";
          }
          // this.render(true)
        });
        html.find('.gen-character').click(async ev => {
          if( !this.ancestry_set || !this.heritage_set || !this.background_set || !this.class_set )
          {
            console.log("still populating Character")
            return
          }

          const ancestry_UUID = "Compendium.pf2e.ancestries." + this.ancestry._id
          const ancestry_source = this.ancestry
          ancestry_source.flags = mergeObject(ancestry_source.flags ?? {}, { core: { sourceId: ancestry_UUID } });
  
          const heritage_UUID = "Compendium.pf2e.heritages." + this.heritage._id
          const heritage_source = this.heritage
          heritage_source.flags = mergeObject(heritage_source.flags ?? {}, { core: { sourceId: heritage_UUID } });
  
          const background_UUID = "Compendium.pf2e.backgrounds." + this.background._id
          const background_source = this.background
          background_source.flags = mergeObject(background_source.flags ?? {}, { core: { sourceId: background_UUID } });
  
          const class_UUID = "Compendium.pf2e.classes." + this.class._id
          const class_source = this.class
          class_source.flags = mergeObject(class_source.flags ?? {}, { core: { sourceId: class_UUID } });
  
          await this.character_sheet.actor.createEmbeddedDocuments(
            "Item",
            [ ancestry_source, heritage_source, background_source, class_source ]
          )

          let data = super.getData().object
          this.addLevel(data)
        });
      }
    
      async selectedFeatClick(event, formData)
      {
        console.log(event)
        console.log(formData)
      }

      async _updateObject(event, formData) {
        //  TODO filter for ancestry/heritage/class/etc.
        let data = super.getData().object
        if( formData.type == "Ancestry" )
        {
          this.updateAncestry(data, formData)
        }
        else if( formData.type == "Heritage")
        {
          this.updateHeritage(data, formData)
        }
        else if( formData.type == "Background")
        {
          this.updateBackground(data, formData)
        }
        else if( formData.type == "Class")
        {
          this.updateClass(data, formData)
        }
      }

      async addLevel(options_data)
      {
        if( !this.ancestry_set || !this.heritage_set || !this.background_set || !this.class_set )
        {
          console.log("still populating Character")
          return
        }
        
        // this.character_sheet.actor.ancestry = this.ancestry
        options_data.actor = this.character_sheet.actor
        // set example level to 5
        let levels = Array.from({length: 5}, (_, index) => index + 1);
        options_data.tabs.push(
          { 
            label: "level",
            title: "Level",
            character_level: levels,
            content: "<em>Fancy Level content.</em>",
            level: true,
            // actor: this.character_sheet.actor
          }
        )
        console.log(this.character_sheet)
        this.render( true ) // sets value but render fails
      }

      async updateAncestry(options_data, form_data)
      {
        // use ancestry to populate heritage
        this.ancestry = await game.packs.get("pf2e.ancestries").getDocument(form_data.id)
        options_data.chosen_ancestry = this.ancestry.name
        // set out heritages now that Ancestry is populated
        this.heritages_compendium = game.packs.get("pf2e.heritages")
        let filtered_heritages = []
        for( const temp_heritage of this.heritages_compendium.index )
        {
          let current_heritage = await this.heritages_compendium.getDocument(temp_heritage._id)
          console.log(current_heritage)
          if( !current_heritage.system.ancestry || current_heritage.system.ancestry.name == this.ancestry.name)
          {
            filtered_heritages.push(current_heritage)
          }
        }
        
        options_data.tabs[0] = 
                        { 
                          label: "heritage",
                          title: "Heritage",
                          heritage: true,
                          heritages: filtered_heritages
                        }
        this.ancestry_set = true
        this.render( true ) // sets value but render fails
      }

      async updateHeritage(options_data, form_data)
      {
        this.heritage = await game.packs.get("pf2e.heritages").getDocument(form_data.id)
        options_data.chosen_heritage = this.heritage.name
        this.heritage_set = true
        this.render( true ) // sets value but render fails
      }

      async updateBackground(options_data, form_data)
      {
        this.background = await this.background_compendium.getDocument(form_data.id)
        options_data.chosen_background = this.background.name
        this.background_set = true
        this.render( true ) // sets value but render fails
      }

      async updateClass(options_data, form_data)
      {
        this.class = await game.packs.get("pf2e.classes").getDocument(form_data.id)
        options_data.chosen_class = this.class.name
        this.class_set = true
        this.render( true ) // sets value but render fails
      }
}