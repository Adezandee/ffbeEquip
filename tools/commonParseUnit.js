var stats = ["HP","MP","ATK","DEF","MAG","SPR"];
var baseStats = ["hp","mp","atk","def","mag","spr"];
var elements = ["fire", "ice", "lightning", "water", "wind", "earth", "light", "dark"];
var ailments = ["poison", "blind", "sleep", "silence", "paralysis", "confuse", "disease", "petrification"];

var typeMap = {
    1: 'dagger',
    2: 'sword',
    3: 'greatSword',
    4: 'katana',
    5: 'staff',
    6: 'rod',
    7: 'bow',
    8: 'axe',
    9: 'hammer',
    10: 'spear',
    11: 'harp',
    12: 'whip',
    13: 'throwing',
    14: 'gun',
    15: 'mace',
    16: 'fist',
    30: 'lightShield',
    31: 'heavyShield',
    40: 'hat',
    41: 'helm',
    50: 'clothes',
    51: 'lightArmor',
    52: 'heavyArmor',
    53: 'robe',
    60: 'accessory'
}

var raceMap = {
    1: 'beast',
    2: 'bird',
    3: 'aquatic',
    4: 'demon',
    5: 'human',
    6: 'machine',
    7: 'dragon',
    8: 'spirit',
    9: 'bug',
    10: 'stone',
    11: 'plant',
    12: 'undead'
}

var ailmentsMap = {
    "Poison": "poison",
    "Blind": "blind",
    "Sleep": "sleep",
    "Silence": "silence",
    "Paralyze": "paralysis",
    "Confusion": "confuse",
    "Disease": "disease",
    "Petrify": "petrification",
    "Death": "death"
}

var elementsMap = {
    1: 'fire',
    2: 'ice',
    3: 'lightning',
    4: 'water',
    5: 'wind',
    6: 'earth',
    7: 'light',
    8: 'dark'
}

var unlockedSkills = {
    "100011705": "225960",
    "100011805": "226000",
    "100012005": "225990",
    "100012405": "226010",
    "100011905": "507050",
    "100012505": "225970"
}

function getPassives(unitId, skillsIn, skills, lbs, enhancements, maxRarity, unitData, unitOut) {
    var baseEffects = {};
    var skillsOut = [baseEffects];
    var skillsOutSave = skillsOut;
    unitOut.passives = [];
    unitOut.actives = [];
    unitOut.magics = [];
    
    for (skillIndex in skillsIn) {
        if (skillsIn[skillIndex].rarity > maxRarity) {
            continue; // don't take into account skills for a max rarity not yet released
        }
        var skillId = skillsIn[skillIndex].id.toString();
        if (skillId == "0") {
            console.log(skillsIn[skillIndex]);
            continue;
        }
        var skillIn = skills[skillId];
        if (skillIn.active && skillIn.type != "MAGIC") {
            unitOut.actives.push(parseActiveSkill(skillIn, skills));
            if (enhancements && enhancements[skillId]) {
                var enhancementLevel = 0;
                while(enhancements[skillId]) {
                    enhancementLevel++;
                    skillId = enhancements[skillId];
                    skillIn = skills[skillId];
                    var skill = parseActiveSkill(skillIn, skills);
                    skill.name = skill.name + " +" + enhancementLevel;
                    unitOut.actives.push(skill);
                } 
            }
            continue;
        } 
        if (skillIn.type == "MAGIC") {
            unitOut.magics.push(parseActiveSkill(skillIn, skills));
            if (enhancements && enhancements[skillId]) {
                var enhancementLevel = 0;
                while(enhancements[skillId]) {
                    enhancementLevel++;
                    skillId = enhancements[skillId];
                    skillIn = skills[skillId];
                    var skill = parseActiveSkill(skillIn, skills);
                    skill.name = skill.name + " +" + enhancementLevel;
                    unitOut.magics.push(skill);
                } 
            }
            continue;
        }
        if (!skillIn) {
            console.log(skillId);
        }
        if (enhancements && enhancements[skillId]) {
            if (!unitOut.enhancements) {
                unitOut.enhancements = [];
            }
            var enhancementData = {"name":skills[skillId].name, "levels":[]}
            var enhancementBaseEffects = {};
            var enhancementSkillsOut = [enhancementBaseEffects];
            var skill = getPassive(skillIn, enhancementBaseEffects, enhancementSkillsOut);
            unitOut.passives.push(skill);
            if (Object.keys(enhancementBaseEffects).length === 0) {
                enhancementSkillsOut.splice(0,1);
            }
            if (skillsIn[skillIndex].level > 101) {
                for (var i = enhancementSkillsOut.length; i--;) {
                    enhancementSkillsOut[i].levelCondition = skillsIn[skillIndex].level;
                }   
            }
            enhancementData.levels.push(enhancementSkillsOut);
            var enhancementLevel = 0;
            while(enhancements[skillId]) {
                enhancementLevel++;
                skillId = enhancements[skillId];
                skillIn = skills[skillId];
                var enhancementBaseEffects = {};
                var enhancementSkillsOut = [enhancementBaseEffects];
                var skill = getPassive(skills[skillId], enhancementBaseEffects, enhancementSkillsOut);
                skill.name = skill.name + " +" + enhancementLevel;
                unitOut.passives.push(skill);
                
                if (Object.keys(enhancementBaseEffects).length === 0) {
                    enhancementSkillsOut.splice(0,1);
                }
                if (skillsIn[skillIndex].level > 101) {
                    for (var i = enhancementSkillsOut.length; i--;) {
                        enhancementSkillsOut[i].levelCondition = skillsIn[skillIndex].level;
                    }   
                }
                enhancementData.levels.push(enhancementSkillsOut);
            }
            var empty = true;
            for (var i = enhancementData.levels.length; i--;) {
                if (Object.keys(enhancementData.levels[i]).length > 0) {
                    empty = false;
                    break;
                }
            }
            if (!empty) {
                unitOut.enhancements.push(enhancementData);
            }
            continue;
        }
        
        if (skillsIn[skillIndex].level > 101) {
            baseEffectsLevelCondition = {};
            skillsOutLevelCondition = [baseEffectsLevelCondition];
            var skill = getPassive(skillIn, baseEffectsLevelCondition, skillsOutLevelCondition);
            if (!(Object.keys(skillsOutLevelCondition[0]).length === 0)) {
                baseEffectsLevelCondition.levelCondition = skillsIn[skillIndex].level;
                skillsOut.push(baseEffectsLevelCondition);
            }
            for (var i = 1, len = skillsOutLevelCondition.length; i < len; i++) {
                skillsOutLevelCondition[i].levelCondition = skillsIn[skillIndex].level;
                skillsOut.push(skillsOutLevelCondition[i]);
            }
        } else {
            var skill = getPassive(skillIn, baseEffects, skillsOut);
        }
        unitOut.passives.push(skill);
    }
    if (unlockedSkills[unitId]) {
        if (!unitOut.enhancements) {
            unitOut.enhancements = [];
        }
        
        var skillId = unlockedSkills[unitId];
        var skillIn = skills[skillId];
        
        var enhancementData = {"name":skillIn.name, "levels":[[]]}
        var enhancementBaseEffects = {};
        var enhancementSkillsOut = [enhancementBaseEffects];
        var skill = getPassive(skillIn, enhancementBaseEffects, enhancementSkillsOut);
        unitOut.passives.push(skill);
        if (Object.keys(enhancementBaseEffects).length === 0) {
            enhancementSkillsOut.splice(0,1);
        }
        enhancementData.levels.push(enhancementSkillsOut);
        unitOut.enhancements.push(enhancementData);
    }
    addElementalResist(baseEffects, unitData.element_resist);
    addAilmentResist(baseEffects, unitData.status_resist);
    
    if (Object.keys(baseEffects).length === 0) {
        skillsOut.splice(0,1);
    }
    
    if (unitData.limitburst_id && lbs[unitData.limitburst_id]) {
        var lb = lbs[unitData.limitburst_id];
        parseLb(lb, unitOut, skills);
    }
    
    return skillsOut;
}

function getPassive(skillIn, baseEffects, skillsOut) {
    var skill = {"name" : skillIn.name, "icon": skillIn.icon, "effects": []};
    var tmrAbilityEffects = [];
    
    for (var rawEffectIndex in skillIn["effects_raw"]) {
        var rawEffect = skillIn["effects_raw"][rawEffectIndex];

        var effects = parsePassiveRawEffet(rawEffect);
        if (effects) {
            if (skillIn.requirements && skillIn.requirements[0] == "EQUIP") {
                tmrAbilityEffects = tmrAbilityEffects.concat(effects);
            } else { 
                addEffectsToEffectList(skillsOut, effects);
            }
            for (var i = 0, len = effects.length; i < len; i++) {
                skill.effects.push({"effect":effects[i], "desc": skillIn.effects[rawEffectIndex]});    
            }
        } else {
            skill.effects.push({"effect":null, "desc": skillIn.effects[rawEffectIndex]});    
        }
    }
    if (skillIn.requirements && skillIn.requirements[0] == "EQUIP") {
        skill.equipedConditions = [skillIn.requirements[1].toString()];
        var condensedSkills = [{}];
        addEffectsToEffectList(condensedSkills, tmrAbilityEffects);
        for (var i = 0, len = condensedSkills.length; i < len; i++) {
            if (!condensedSkills[i].equipedConditions) {
                condensedSkills[i].equipedConditions = [];
            }
            condensedSkills[i].equipedConditions.push(skillIn.requirements[1].toString());
            skillsOut.push(condensedSkills[i]);    
        }
    }
    return skill;
}

function addEffectsToEffectList(effectList, effects) {
    for (var effectIndex = 0, lenEffectIndex = effects.length; effectIndex < lenEffectIndex; effectIndex++) {
        var effect = effects[effectIndex];
        if (effect.equipedConditions || effect.exclusiveUnits || effect.exclusiveSex) {
            effectList.push(effect);
        } else {
            
            for (var i = baseStats.length; i--;) {
                if (effect[baseStats[i]]) {
                    addToStat(effectList[0], baseStats[i], effect[baseStats[i]]);
                }
                if (effect[baseStats[i] + "%"]) {
                    addToStat(effectList[0], baseStats[i] + "%", effect[baseStats[i] + "%"]);
                }
            }
            if (effect.special) {
                for (var i = 0, len = effect.special.length; i < len; i++) {
                    addToList(effectList[0],"special",effect.special[i]);
                }
            }
            if (effect.element) {
                for (var i = 0, len = effect.element.length; i < len; i++) {
                    addToList(effectList[0],"element",effect.element[i]);
                }
            }   
            if (effect.killers) {
                for (var i = 0, len = effect.killers.length; i < len; i++) {
                    addKiller(effectList[0], effect.killers[i].name, effect.killers[i].physical || 0, effect.killers[i].magical || 0);
                }
            }
            if (effect.resist) {
                for (var i = 0, len = effect.resist.length; i < len; i++) {
                    addToResistList(effectList[0], effect.resist[i]);
                }
            }
            if (effect.ailments) {
                for (var i = 0, len = effect.ailments.length; i < len; i++) {
                    addToAilmentsList(effectList[0], effect.ailments[i]);
                }
            }
            const simpleValues = ["evoMag", "accuracy", "jumpDamage","lbFillRate", "mpRefresh"];
            for (var i = simpleValues.length; i--;) {
                if (effect[simpleValues[i]]) {
                    addToStat(effectList[0], simpleValues[i], effect[simpleValues[i]]);
                }
            }
            const baseStatsBasedValues = ["singleWielding","singleWieldingOneHanded","dualWielding","esperStatsBonus"];
            for (var i = baseStatsBasedValues.length; i--;) {
                if (effect[baseStatsBasedValues[i]]) {
                    if (!effectList[0][baseStatsBasedValues[i]]) {
                        effectList[0][baseStatsBasedValues[i]] = {};
                    }
                    for (var j = baseStats.length; j--;) {
                        if (effect[baseStatsBasedValues[i]][baseStats[j]]) {
                            addToStat(effectList[0][baseStatsBasedValues[i]], baseStats[j], effect[baseStatsBasedValues[i]][baseStats[j]]);
                        }
                    }
                }
            }
            if (effect.evade) {
                if (!effectList[0].evade) {
                    effectList[0].evade = {};
                }
                addToStat(effectList[0].evade, "physical", effect.evade.physical);
                addToStat(effectList[0].evade, "magical", effect.evade.magical);
            }
            if (effect.lbPerTurn) {
                if (!effectList[0].lbPerTurn) {
                    effectList[0].lbPerTurn = {};
                }
                addToStat(effectList[0].lbPerTurn, "min", effect.lbPerTurn.min);
                addToStat(effectList[0].lbPerTurn, "max", effect.lbPerTurn.max);
            }
            if (effect.partialDualWield) {
                for (var i = 0, len = effect.partialDualWield.length; i < len; i++) {
                    addToList(effectList[0],"partialDualWield",effect.partialDualWield[i]);
                }
            }
        }
    }
}

function parsePassiveRawEffet(rawEffect) {
    var result = {};
    // stat bonus
    if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 1) {               
        var effectData = rawEffect[3];
        addToStat(result, "hp%", effectData[4]);
        addToStat(result, "mp%", effectData[5]);
        addToStat(result, "atk%", effectData[0]);
        addToStat(result, "def%", effectData[1]);
        addToStat(result, "mag%", effectData[2]);
        addToStat(result, "spr%", effectData[3]);
        return [result];

    // DW
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 14) {               
        var types = rawEffect[3]
        if (types.length == 1 && types[0] == "none") {
            addToList(result,"special","dualWield");
        } else {
            for(var partialDualWieldIndex in types) {
                addToList(result,"partialDualWield",typeMap[types[partialDualWieldIndex]]);
            }                    
        }
        return [result];
    }

    // Killers
    else if (((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 11) ||
        (rawEffect[0] == 1 && rawEffect[1] == 1 && rawEffect[2] == 11)) {
        var killerData = rawEffect[3];

        var killerRace = raceMap[killerData[0]];
        var physicalPercent = killerData[1];
        var magicalPercent = killerData[2];
        addKiller(result, killerRace, physicalPercent, magicalPercent);
        return [result];
    }

    // physical evade
    else if (rawEffect[1] == 3 && rawEffect[2] == 22) {
        result.evade = {"physical":rawEffect[3][0]}
        return [result];
    }

    // magical evade
    else if (rawEffect[1] == 3 && rawEffect[2] == 54 && rawEffect[3][0] == -1) {
        result.evade = {"magical":rawEffect[3][1]}
        return [result];
    }

    // Mastery
    else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 6) {
        var masteryEffect = rawEffect[3];
        var masteryType = typeMap[masteryEffect[0]];
        var result = {"equipedConditions":[masteryType]};

        if (masteryEffect.length > 5) {
            if (masteryEffect[5]) {
                result["hp%"] = masteryEffect[5]
            }
            if (masteryEffect[6]) {
                result["mp%"] = masteryEffect[6]
            }
        }
        if (masteryEffect[1]) {
            result["atk%"] = masteryEffect[1]
        }
        if (masteryEffect[2]) {
            result["def%"] = masteryEffect[2]
        }
        if (masteryEffect[3]) {
            result["mag%"] = masteryEffect[3]
        }
        if (masteryEffect[4]) {
            result["spr%"] = masteryEffect[4]
        }
        return [result];
    }

    // unarmed
    else if (rawEffect[0] == 1 && rawEffect[1] == 3 && rawEffect[2] == 19) {
        var masteryEffect = rawEffect[3];    
        var result = {"equipedConditions":["unarmed"]};

        if (masteryEffect[0]) {
            result["atk%"] = masteryEffect[0]
        }
        if (masteryEffect[1]) {
            result["def%"] = masteryEffect[1]
        }
        if (masteryEffect[2]) {
            result["mag%"] = masteryEffect[2]
        }
        if (masteryEffect[3]) {
            result["spr%"] = masteryEffect[3]
        }
        return [result];
    }

    // element based mastery
    else if (rawEffect[0] == 1 && rawEffect[1] == 3 && rawEffect[2] == 10004) {
        var masteryEffect = rawEffect[3];
        var masteryType = elementsMap[masteryEffect[0]];
        var result = {"equipedConditions":[masteryType]};
        if (masteryEffect[3]) {
            result["atk%"] = masteryEffect[3];
        }
        if (masteryEffect[5]) {
            result["def%"] = masteryEffect[5];
        }
        if (masteryEffect[4]) {
            result["mag%"] = masteryEffect[4];
        }
        if (masteryEffect[6]) {
            result["spr%"] = masteryEffect[6];
        }
        if (masteryEffect[1]) {
            result["hp%"] = masteryEffect[1];
        }
        if (masteryEffect[2]) {
            result["mp%"] = masteryEffect[2];
        }
        return [result];
    }

    //doublehand
    else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 13) {
        if (rawEffect[3].length == 3 && rawEffect[3][2] == 2) {
            result.singleWielding = {};
            addToStat(result.singleWielding, "atk", rawEffect[3][0]);
        } else {
            result.singleWieldingOneHanded = {};
            addToStat(result.singleWieldingOneHanded, "atk", rawEffect[3][0]);
        }
        return [result];
    }
    else if (rawEffect[0] == 1 && rawEffect[1] == 3 && rawEffect[2] == 10003) {
        var doublehandResult = {};
        var doublehandEffect = rawEffect[3];
        if (doublehandEffect.length == 7 && doublehandEffect[6] == 1) {
            result.singleWielding = {};
            doublehandResult = result.singleWielding;
        } else {
            result.singleWieldingOneHanded = {};
            doublehandResult = result.singleWieldingOneHanded;
        }
        if (doublehandEffect[2]) {
            addToStat(doublehandResult, "atk", doublehandEffect[2]);
        }
        if (doublehandEffect[4]) {
            addToStat(doublehandResult, "def", doublehandEffect[4]);
        }
        if (doublehandEffect[3]) {
            addToStat(doublehandResult, "mag", doublehandEffect[3]);
        }
        if (doublehandEffect[5]) {
            addToStat(doublehandResult, "spr", doublehandEffect[5]);
        }
        if (doublehandEffect[0]) {
            addToStat(doublehandResult, "hp", doublehandEffect[0]);
        }
        if (doublehandEffect[1]) {
            addToStat(doublehandResult, "mp", doublehandEffect[1]);
        }
        return [result];

    // MAG DH
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 70) {
        if (rawEffect[3][2] == 0) {
            result.singleWieldingOneHanded = {};
            addToStat(result.singleWieldingOneHanded,"mag",rawEffect[3][0]);    
        } else if (rawEffect[3][2] == 2) {
            result.singleWielding = {};
            addToStat(result.singleWielding,"mag",rawEffect[3][0]);    
        }
        return [result];
        
    // +EQ stat when dual wielding
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 69) {
        result.dualWielding = {};
        var stat;
        if (rawEffect[3][0] == 1) {
            stat = "atk";
        } else if (rawEffect[3][0] == 2) {
            stat = "def";
        } else if (rawEffect[3][0] == 3) {
            stat = "mag";
        } else if (rawEffect[3][0] == 4) {
            stat = "spr";
        }
        addToStat(result.dualWielding, stat, rawEffect[3][1]);
        return [result];

    // Element Resist
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 3) {
        addElementalResist(result, rawEffect[3]);
        return [result];

    // Ailments Resist
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 2) {
        addAilmentResist(result, rawEffect[3]);
        return [result];

    // MP refresh
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 32) {
        var mpRefresh = rawEffect[3][0];
        addToStat(result, "mpRefresh", mpRefresh);
        return [result];

    // LB/turn
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 33) {
        var lbPerTurn = rawEffect[3][0]/100;
        addLbPerTurn(result, lbPerTurn, lbPerTurn);
        return [result];

    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 125) {
        var lbPerTurnMin = rawEffect[3][0]/100;
        var lbPerTurnMax = rawEffect[3][1]/100;
        addLbPerTurn(result, lbPerTurnMin, lbPerTurnMax);
        return [result];

    // LB fill rate
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 31) {
        var lbFillRate = rawEffect[3][0];
        addToStat(result, "lbFillRate", lbFillRate);
        return [result];

    // +Jump damage
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 17) {
        var jumpDamage = rawEffect[3][0];
        addToStat(result, "jumpDamage", jumpDamage);
        return [result];

    // +EVO Mag
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 21) {
        var evoMag = rawEffect[3][0];
        addToStat(result, "evoMag", evoMag);
        return [result];

    // +Stats from espers boost
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 63) {
        var esperStatsBonus = rawEffect[3];
        result.esperStatsBonus = {};
        addToStat(result.esperStatsBonus, "hp", esperStatsBonus[0]);
        addToStat(result.esperStatsBonus, "mp", esperStatsBonus[1]);
        addToStat(result.esperStatsBonus, "atk", esperStatsBonus[2]);
        addToStat(result.esperStatsBonus, "def", esperStatsBonus[3]);
        addToStat(result.esperStatsBonus, "mag", esperStatsBonus[4]);
        addToStat(result.esperStatsBonus, "spr", esperStatsBonus[5]);
        return [result];

    // Gilgamesh multi equip skill
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 74) {
        var result = [];
        for (var i = rawEffect[3][0].length; i--;) {
            var gilgameshSkill = {"equipedConditions":[rawEffect[3][0][i].toString()]};
            gilgameshSkill["hp%"] = rawEffect[3][1];
            gilgameshSkill["mp%"] = rawEffect[3][2];
            gilgameshSkill["atk%"] = rawEffect[3][3];
            gilgameshSkill["def%"] = rawEffect[3][4];
            gilgameshSkill["mag%"] = rawEffect[3][5];
            gilgameshSkill["spr%"] = rawEffect[3][6];
            result.push(gilgameshSkill);
        }
        return result;

    // equipment type conditionned killers
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 75) {
        var typeArray;
        if (Array.isArray(rawEffect[3][0])) {
            typeArray = rawEffect[3][0];
        } else {
            typeArray = [rawEffect[3][0]];
        }
        result = [];
        for (var i = typeArray.length; i--;) {
            var conditionnedKillerSKill = {"equipedConditions":[typeMap[typeArray[i]]]};
            var killerData = rawEffect[3];

            var killerRace = raceMap[killerData[1]];
            var physicalPercent = killerData[2];
            var magicalPercent = killerData[3];
            addKiller(conditionnedKillerSKill, killerRace, physicalPercent, magicalPercent);

            result.push(conditionnedKillerSKill);
        }
        return result;

    // equipment type conditionned element resistance
    } else if ((rawEffect[0] == 0 || rawEffect[0] == 1) && rawEffect[1] == 3 && rawEffect[2] == 76) {
        var typeArray;
        if (Array.isArray(rawEffect[3][0])) {
            typeArray = rawEffect[3][0];
        } else {
            typeArray = [rawEffect[3][0]];
        }
        result = [];
        for (var i = typeArray.length; i--;) {
            var conditionnedElementalResistSKill = {"equipedConditions":[typeMap[typeArray[i]]]};

            var elementalResist = rawEffect[3].slice();
            elementalResist.splice(0,1);
            addElementalResist(conditionnedElementalResistSKill, elementalResist);

            result.push(conditionnedElementalResistSKill);
        }
        return result;
    }
    return null;
}

function parseActiveSkill(skillIn, skills) {
    var skill = {"name" : skillIn.name, "icon": skillIn.icon, "effects": []};
    
    for (var rawEffectIndex in skillIn["effects_raw"]) {
        var rawEffect = skillIn["effects_raw"][rawEffectIndex];

        var effect = parseActiveRawEffect(rawEffect, skills);
        skill.effects.push({"effect":effect, "desc": skillIn.effects[rawEffectIndex]});
    }
    return skill;
}

function parseLb(lb, unit, skills) {
    unit.lb = {"name": lb.name, minEffects: [], "maxEffects":[]}
    for (var rawEffectIndex in lb.min_level["effects_raw"]) {
        var rawEffect = lb.min_level["effects_raw"][rawEffectIndex];

        var effect = parseActiveRawEffect(rawEffect, skills);
        unit.lb.minEffects.push({"effect":effect, "desc": lb.min_level.effects[rawEffectIndex]});
    }
    for (var rawEffectIndex in lb.max_level["effects_raw"]) {
        var rawEffect = lb.max_level["effects_raw"][rawEffectIndex];

        var effect = parseActiveRawEffect(rawEffect, skills);
        unit.lb.maxEffects.push({"effect":effect, "desc": lb.max_level.effects[rawEffectIndex]});
    }
}

function parseActiveRawEffect(rawEffect, skills) {
    var result = null;
    
    // break
    if (rawEffect[2] == 24) { 
        result = {};
        if (rawEffect[1] == 1) {
            addBreak(result, rawEffect[3]);
        } else {
            addStatsBuff(result, rawEffect[3]);
        }
    
    // Randomly use skills
    } else if (rawEffect[2] == 29) { 
        result = {"randomlyUse": []};
        for (var i = 0, len = rawEffect[3].length; i < len; i++) {
            var data = rawEffect[3][i];
            if (data && data[0] && skills[data[0]]) {
                var skillIn = skills[data[0]];
                var skill = parseActiveSkill(skillIn, skills);
                result.randomlyUse.push({"skill":skill, "percent":data[1]});
            }
        }
        
    // Imperil
    } else if (rawEffect[2] == 33) { 
        result = {};
        var imperilData = rawEffect[3];
        if (rawEffect[1] == 1) {
            addImperil(result, imperilData);
        } else {
            addElementalResist(result, imperilData);
            result.turns = imperilData[9];
        }
    
    // Status ailment resistance
    } else if (rawEffect[2] == 7) { 
        result = {};
        var ailmentsData = rawEffect[3];
        addAilmentResist(result, ailmentsData);
        result.turns = ailmentsData[9];
        
    // Killers
    } else if (rawEffect[2] == 92) { 
        result = {};
        var killersData = rawEffect[3];
        for (var i = 0; i < 8; i++) {
            if (killersData[i] == -1) {
                break;
            }
            addKiller(result, raceMap[killersData[i][0]], killersData[i][1], 0);
        }
        result.turns = killersData[8];
    } else if (rawEffect[2] == 93) { 
        result = {};
        var killersData = rawEffect[3];
        for (var i = 0; i < 8; i++) {
            if (killersData[i] == -1) {
                break;
            }
            addKiller(result, raceMap[killersData[i][0]], 0, killersData[i][1]);
        }
        result.turns = killersData[8];
        
        
    // Imbue
    } else if (rawEffect[2] == 95) { 
        result = {"imbue":[]};
        var imbueData = rawEffect[3];
        for (var index in elements) {
            if (imbueData[index]) {
                result.imbue.push(elements[index]);
            }
        }
        result.turns = imbueData[8];
        
        
    }

    if (result) {
        if (rawEffect[0] == 0) {
            result.area = "SELF";
        } else if (rawEffect[0] == 1) {
            result.area = "ST";
        } else if (rawEffect[0] == 2) {
            result.area = "AOE";
        } else {
            result.area = "RND";
        }
        
        if (rawEffect[1] == 0) {
            result.target = "SELF";
        } else if (rawEffect[1] == 1) {
            result.target = "ENEMY";
        } else if (rawEffect[1] == 2) {
            result.target = "ALLY";
        } else if (rawEffect[1] == 3) {
            result.target = "SELF";
            result.area = "SELF";
        } else if (rawEffect[1] == 4) {
            result.target = "ALLY";
        } else if (rawEffect[1] == 5) {
            result.target = "ALLY_BUT_SELF";
        } else if (rawEffect[1] == 6) {
            result.target = "ANY";
        } else {
            console.log("unknown target : " + JSON.stringify(rawEffect));
        }
    }
    return result;
}

function addToStat(skill, stat, value) {
    if (value) {
        if (!skill[stat]) {
            skill[stat] = value;
        } else {
            skill[stat] += value;
        }
    }
}
    
function addToList(skill, listName, value) {
    if (!skill[listName]) {
        skill[listName] = [value];
    } else {
        if (!skill[listName].includes(value)) {
            skill[listName].push(value);
        }
    }
}

function addKiller(skill, race, physicalPercent, magicalPercent) {
    if (!skill.killers) {
        skill.killers = [];
    }
    var killerData;
    for (var index in skill.killers) {
        if (skill.killers[index].name == race) {
            killerData = skill.killers[index];
            break;
        }
    }
    
    if (!killerData) {
        killerData = {"name":race};
        skill.killers.push(killerData);
    }
    if (physicalPercent != 0) {
        if (killerData.physical) {
            killerData.physical += physicalPercent;
        } else {
            killerData.physical = physicalPercent;
        }
    }
    if (magicalPercent != 0) {
        if (killerData.magical) {
            killerData.magical += magicalPercent;
        } else {
            killerData.magical = magicalPercent;
        }
    }
}

function addToResistList(item, resist) {
    if (!item.resist) {
        item.resist = [];
    }
    for (var i = 0, len = item.resist.length; i < len; i++) {
        if (item.resist[i].name == resist.name) {
            item.resist[i].percent += resist.percent;
            return;
        }
    }
    item.resist.push(resist);
}

function addToAilmentsList(item, ailment) {
    if (!item.ailments) {
        item.ailments = [];
    }
    for (var i = item.ailments.length; i--;) {
        if (item.ailments[i].name == ailment.name) {
            item.ailments[i].percent += ailment.percent;
            return;
        }
    }
    item.ailments.push(ailment);
}

function addElementalResist(item, values) {
    for (var index in elements) {
        if (values[index]) {
            if (!item.resist) {
                item.resist = [];
            }
            item.resist.push({"name":elements[index],"percent":values[index]})
        }
    }
}

function addAilmentResist(item, values) {
    for (var index in ailments) {
        if (values[index]) {
            if (!item.resist) {
                item.resist = [];
            }
            item.resist.push({"name":ailments[index],"percent":values[index]})
        }
    }
}

function addImperil(item, values) {
    if (!item.imperil) {
        item.imperil = {"elements":[]};
    }
    for (var index in elements) {
        if (values[index]) {
            item.imperil.elements.push({"name":elements[index],"percent":-values[index]});
            if (values[index] > 0) {
                console.log("Positive imperil !");
                console.log(values);
            }
        }
    }
    item.imperil.turns = values[9];
}

function addBreak(item, values) {
    if (!item.break) {
        item.break = {};
    }
    if (values[0]) {
        item.break.atk = -values[0];
    }
    if (values[1]) {
        item.break.def = -values[1];
    }
    if (values[2]) {
        item.break.mag = -values[2];
    }
    if (values[3]) {
        item.break.spr = -values[3];
    }
    item.break.turns = values[4];
}

function addStatsBuff(item, values) {
    if (!item.statsBuff) {
        item.statsBuff = {};
    }
    if (values[0]) {
        item.statsBuff.atk = values[0];
    }
    if (values[1]) {
        item.statsBuff.def = values[1];
    }
    if (values[2]) {
        item.statsBuff.mag = values[2];
    }
    if (values[3]) {
        item.statsBuff.spr = values[3];
    }
    item.statsBuff.turns = values[4];
}

function addLbPerTurn(item, min, max) {
    if (!item.lbPerTurn) {
        item.lbPerTurn = {"min":0, "max":0};
    }
    item.lbPerTurn.min += min;
    item.lbPerTurn.max += max;
}

function getEquip(equipIn) {
    var equip = [];
    for(var equipIndex in equipIn) {
        if (equipIn[equipIndex] != 60) {
            equip.push(typeMap[equipIn[equipIndex]]);
        }
    }
    return equip;
}

var properties = ["id","name","jpname","type","hp","hp%","mp","mp%","atk","atk%","def","def%","mag","mag%","spr","spr%","evoMag","evade","singleWielding","singleWieldingOneHanded","dualWielding","accuracy","damageVariance","jumpDamage","lbFillRate", "lbPerTurn","element","partialDualWield","resist","ailments","killers","mpRefresh","esperStatsBonus","special","exclusiveSex","exclusiveUnits","equipedConditions","levelCondition","tmrUnit","access","icon"];

function formatOutput(units) {
    var result = "{\n";
    var first = true;
    for (var unitId in units) {
        var unit = units[unitId]
        if (first) {
            first = false;
        } else {
            result += ",";
        }
        result += "\n\t\"" + unitId + "\": {";
        result += formatUnit(unit);
        
        result += "\n\t}";
    }
    result += "\n}";
    return result;
}

function formatUnit(unit, prefix = "", sixStarForm = false) {
    result = getUnitBasicInfo(unit,prefix, sixStarForm) + ",";
    if (unit.enhancements && unit.enhancements.length > 0) {
        result += "\n\t\t\"enhancements\": [";
        for (var i = 0, len = unit.enhancements.length; i < len; i++) {
            result += "\n\t\t\t" + JSON.stringify(unit.enhancements[i]);
            if (i < unit.enhancements.length - 1) {
                result += ",";
            }
        }
        result += "\n\t\t],";
    }
    result += "\n" + prefix + "\t\t\"skills\": [";
    var firstSkill = true;
    for (var skillIndex in unit.skills) {
        var skill = unit.skills[skillIndex];
        if (firstSkill) {
            firstSkill = false;
        } else {
            result+= ",";
        }
        result+= "\n" + formatSkill(skill, prefix + "\t\t\t");
    }
    result += "\n" + prefix + "\t\t]";
    if (unit["6_form"]) {
        result += ",\n\t\t\"6_form\": {" + formatUnit(unit["6_form"], "\t", true) + "\n\t\t}";
    }
    return result;
}

function formatSkill(skill, prefix) {
    var result = prefix + "{"
    var firstProperty = true;
    for (var propertyIndex in properties) {
        var property = properties[propertyIndex];
        if (skill[property]) {
            if (firstProperty) {
                firstProperty = false;
            } else {
                result += ", ";
            }
            result+= "\"" + property + "\":" + JSON.stringify(skill[property]);
        }
    }
    result+= "}";
    return result;
}

function formatSimpleOutput(units) {
    var result = "{\n";
    var first = true;
    for (var unitId in units) {
        var unit = units[unitId]
        if (first) {
            first = false;
        } else {
            result += ",";
        }
        result += "\n\t\"" + unitId + "\": {";
        result += getUnitBasicInfo(unit);
        if (unit["6_form"]) {
            result += ",\n\t\t\"6_form\": {" + getUnitBasicInfo(unit["6_form"], "\t", true) + "\n\t\t}";
        }
        result += "\n\t}";
    }
    result += "\n}";
    return result;
}

function getUnitBasicInfo(unit, prefix = "", sixStarForm = false) {
    var result = "\n" + prefix + "\t\t\"name\":\"" + unit.name + "\",";
    if (unit.jpname) {
        result += "\n" + prefix + "\t\t\"jpname\":\"" + unit.jpname + "\",";
    }
    if (unit.wikiEntry) {
        result += "\n" + prefix + "\t\t\"wikiEntry\":\"" + unit.wikiEntry + "\",";
    }
    result += "\n" + prefix + "\t\t\"id\":\"" + unit.id + "\",";
    if (sixStarForm) {
        result += "\n" + prefix + "\t\t\"sixStarForm\":true,";
    }
    result += "\n" + prefix + "\t\t\"max_rarity\":\"" + unit.max_rarity + "\",";
    result += "\n" + prefix + "\t\t\"min_rarity\":\"" + unit.min_rarity + "\",";
    result += "\n" + prefix + "\t\t\"sex\":\"" + unit.sex + "\",";
    if (unit.materiaSlots || unit.materiaSlots == 0) {
        result += "\n" + prefix + "\t\t\"materiaSlots\":" + unit.materiaSlots + ","
    }
    if (unit.mitigation) {
        result += "\n\t\t\"mitigation\":" + JSON.stringify(unit.mitigation) + ","
    }
    result += "\n" + prefix + "\t\t\"stats\": {";
    result += "\n" + prefix + "\t\t\t\"maxStats\":" + JSON.stringify(unit.stats.maxStats) + ",";
    result += "\n" + prefix + "\t\t\t\"minStats\":" + JSON.stringify(unit.stats.minStats) + ",";
    result += "\n" + prefix + "\t\t\t\"pots\":" + JSON.stringify(unit.stats.pots);
    result += "\n" + prefix + "\t\t},";
    result += "\n" + prefix + "\t\t\"stats_pattern\":" + unit.stats_pattern + ",";
    result += "\n" + prefix + "\t\t\"equip\":" + JSON.stringify(unit.equip);
    if (unit.enhancementSkills.length > 0) {
        result += ",\n" + prefix + "\t\t\"enhancementSkills\":" + JSON.stringify(unit.enhancementSkills);
    }
    
    return result;
}

function formatForSearch(units) {
    var result = "[\n";
    var first = true;
    for (var unitId in units) {
        var unit = units[unitId];
        if (unit.id) {
            var skills = unit.skills.slice();
            if (unit.tmrSkill) {
                skills.push(unit.tmrSkill);
            }
            if (unit.enhancements) {
                for (var i = unit.enhancements.length; i--;) {
                    var enhancement = unit.enhancements[i];
                    for (var j = enhancement.levels[enhancement.levels.length - 1].length; j--;) {
                        skills.push(enhancement.levels[enhancement.levels.length - 1][j]);
                    }
                }
            }
            var unitOut = {"passives":{}, "actives":{"SELF":{}, "ST":{},"AOE":{}}, "lb":{"SELF":{}, "ST":{},"AOE":{}}};
            for (var i = skills.length; i--;) {
                var skill = skills[i];
                if (skill.resist) {
                    for (var resistIndex = skill.resist.length; resistIndex--;) {
                        var resist = skill.resist[resistIndex];
                        if (elements.includes(resist.name)) {
                            if (!unitOut.passives.elementalResist) {
                                unitOut.passives.elementalResist = {};
                            }
                            addToStat(unitOut.passives.elementalResist, resist.name, resist.percent);
                        } else {
                            if (!unitOut.passives.ailmentResist) {
                                unitOut.passives.ailmentResist = {};
                            }
                            addToStat(unitOut.passives.ailmentResist, resist.name, resist.percent);
                        }
                    }
                }
                if (skill.killers) {
                    for (var killerIndex = skill.killers.length; killerIndex--;) {
                        var killer = skill.killers[killerIndex];
                        if (killer.physical) {
                            if (!unitOut.passives.physicalKillers) {
                                unitOut.passives.physicalKillers = {};
                            }
                            addToStat(unitOut.passives.physicalKillers, killer.name, killer.physical);
                        }
                        if (killer.magical) {
                            if (!unitOut.passives.magicalKillers) {
                                unitOut.passives.magicalKillers = {};
                            }
                            addToStat(unitOut.passives.magicalKillers, killer.name, killer.magical);
                        }
                    }
                }
            }
            var activeAndMagic = unit.actives.concat(unit.magics);
            for (var i = activeAndMagic.length; i--;) {
                var skill = activeAndMagic[i];
                addSkillEffectToSearch(skill.effects, unitOut.actives);
            }
            if (unit.lb) {
                addSkillEffectToSearch(unit.lb.maxEffects, unitOut.lb);
            }
            unitOut.equip = unit.equip;
            unitOut.id = unit.id;
            if (first) {
                first = false;
            } else {
                result += ",\n";
            }
            result += "\t" + JSON.stringify(unitOut);
        }
    }
    result += "\n]";
    return result;
}

function addSkillEffectToSearch(effects, unitOut) {
    for (var i = effects.length; i--;) {
        var effect = effects[i];
        if (effect.effect && unitOut[effect.effect.area]) {
            if (effect.effect.imperil) {
                if (!unitOut[effect.effect.area].imperil) {
                    unitOut[effect.effect.area].imperil = {};
                }
                for (var j = effect.effect.imperil.elements.length; j--;) {
                    if (!unitOut[effect.effect.area].imperil[effect.effect.imperil.elements[j].name] || unitOut[effect.effect.area].imperil[effect.effect.imperil.elements[j].name] < effect.effect.imperil.elements[j].percent) {
                        unitOut[effect.effect.area].imperil[effect.effect.imperil.elements[j].name] = effect.effect.imperil.elements[j].percent;
                    }
                }
             } else if (effect.effect.resist) {
                for (var j = effect.effect.resist.length; j--;) {
                    if (ailments.includes(effect.effect.resist[j].name)) {
                        if (!unitOut[effect.effect.area].ailmentResist) {unitOut[effect.effect.area].ailmentResist = {};}
                        if (!unitOut[effect.effect.area].ailmentResist[effect.effect.resist[j].name] || unitOut[effect.effect.area].ailmentResist[effect.effect.resist[j].name] < effect.effect.resist[j].percent) {
                            unitOut[effect.effect.area].ailmentResist[effect.effect.resist[j].name] = effect.effect.resist[j].percent;
                        }
                    } else {
                        if (!unitOut[effect.effect.area].elementalResist) {unitOut[effect.effect.area].elementalResist = {};}
                        if (!unitOut[effect.effect.area].elementalResist[effect.effect.resist[j].name] || unitOut[effect.effect.area].elementalResist[effect.effect.resist[j].name] < effect.effect.resist[j].percent) {
                            unitOut[effect.effect.area].elementalResist[effect.effect.resist[j].name] = effect.effect.resist[j].percent;
                        }
                    }
                    
                }
            } else if (effect.effect.killers) {
                for (var j = effect.effect.killers.length; j--;) {
                    if (effect.effect.killers[j].physical) {
                        if (!unitOut[effect.effect.area].physicalKillers) {unitOut[effect.effect.area].physicalKillers = {};}
                        if (!unitOut[effect.effect.area].physicalKillers[effect.effect.killers[j].name] || unitOut[effect.effect.area].physicalKillers[effect.effect.killers[j].name] < effect.effect.killers[j].physical) {
                            unitOut[effect.effect.area].physicalKillers[effect.effect.killers[j].name] = effect.effect.killers[j].physical;
                        }  
                    } 
                    if (effect.effect.killers[j].magical) {
                        if (!unitOut[effect.effect.area].magicalKillers) {unitOut[effect.effect.area].magicalKillers = {};}
                        if (!unitOut[effect.effect.area].magicalKillers[effect.effect.killers[j].name] || unitOut[effect.effect.area].magicalKillers[effect.effect.killers[j].name] < effect.effect.killers[j].magical) {
                            unitOut[effect.effect.area].magicalKillers[effect.effect.killers[j].name] = effect.effect.killers[j].magical;
                        }    
                    } 
                }
            } else if (effect.effect.randomlyUse) {
                for (var j = 0, len = effect.effect.randomlyUse.length; j < len; j++) {
                    addSkillEffectToSearch(effect.effect.randomlyUse[j].skill.effects, unitOut);
                }
            } else if (effect.effect.break) {
                if (!unitOut[effect.effect.area].break) {
                    unitOut[effect.effect.area].break = {};
                }
                if (!unitOut[effect.effect.area].break.atk || unitOut[effect.effect.area].break.atk < effect.effect.break.atk) {
                    unitOut[effect.effect.area].break.atk = effect.effect.break.atk;
                }
                if (!unitOut[effect.effect.area].break.def || unitOut[effect.effect.area].break.def < effect.effect.break.def) {
                    unitOut[effect.effect.area].break.def = effect.effect.break.def;
                }
                if (!unitOut[effect.effect.area].break.mag || unitOut[effect.effect.area].break.atk < effect.effect.break.mag) {
                    unitOut[effect.effect.area].break.mag = effect.effect.break.mag;
                }
                if (!unitOut[effect.effect.area].break.spr || unitOut[effect.effect.area].break.spr < effect.effect.break.spr) {
                    unitOut[effect.effect.area].break.spr = effect.effect.break.spr;
                }
            } else if (effect.effect.statsBuff) {
                if (!unitOut[effect.effect.area].statsBuff) {
                    unitOut[effect.effect.area].statsBuff = {};
                }
                if (!unitOut[effect.effect.area].statsBuff.atk || unitOut[effect.effect.area].statsBuff.atk < effect.effect.statsBuff.atk) {
                    unitOut[effect.effect.area].statsBuff.atk = effect.effect.statsBuff.atk;
                }
                if (!unitOut[effect.effect.area].statsBuff.def || unitOut[effect.effect.area].statsBuff.def < effect.effect.statsBuff.def) {
                    unitOut[effect.effect.area].statsBuff.def = effect.effect.statsBuff.def;
                }
                if (!unitOut[effect.effect.area].statsBuff.mag || unitOut[effect.effect.area].statsBuff.atk < effect.effect.statsBuff.mag) {
                    unitOut[effect.effect.area].statsBuff.mag = effect.effect.statsBuff.mag;
                }
                if (!unitOut[effect.effect.area].statsBuff.spr || unitOut[effect.effect.area].statsBuff.spr < effect.effect.statsBuff.spr) {
                    unitOut[effect.effect.area].statsBuff.spr = effect.effect.statsBuff.spr;
                }
            } else if (effect.effect.imbue) {
                if (!unitOut[effect.effect.area].imbue) {
                    unitOut[effect.effect.area].imbue = [];
                }
                for (var j = 0, lenj = effect.effect.imbue.length; j < lenj; j++) {
                    if (!unitOut[effect.effect.area].imbue.includes(effect.effect.imbue[j])) {
                        unitOut[effect.effect.area].imbue.push(effect.effect.imbue[j]);
                    }
                }
            }
        }
    }
}

function formatForSkills(units) {
    var result = "{\n";
    var first = true;
    for (var unitId in units) {
        var unit = units[unitId]
        if (first) {
            first = false;
        } else {
            result += ",";
        }
        result += "\n\t\"" + unitId + "\": {";
        result += getUnitBasicInfo(unit) + ",";
        result += "\n" + "\t\t\"lb\": " + JSON.stringify(unit.lb) + ",";
        result += "\n" + "\t\t\"passives\": [";
        var firstPassive = true;
        for (var skillIndex in unit.passives) {
            var passive = unit.passives[skillIndex];
            if (firstPassive) {
                firstPassive = false;
            } else {
                result+= ",";
            }
            result+= "\n\t\t\t" + JSON.stringify(passive);
        }
        result += "\n" + "\t\t]";
        
        result += ",\n" + "\t\t\"actives\": [";
        var firstActive = true;
        for (var skillIndex in unit.actives) {
            var active = unit.actives[skillIndex];
            if (firstActive) {
                firstActive = false;
            } else {
                result+= ",";
            }
            result+= "\n\t\t\t" + JSON.stringify(active);
        }
        result += "\n" + "\t\t]";
        
        result += ",\n" + "\t\t\"magics\": [";
        var firstMagic = true;
        for (var skillIndex in unit.magics) {
            var magic = unit.magics[skillIndex];
            if (firstMagic) {
                firstMagic = false;
            } else {
                result+= ",";
            }
            result+= "\n\t\t\t" + JSON.stringify(magic);
        }
        result += "\n" + "\t\t]";
        
        result += "\n\t}";
    }
    result += "\n}";
    return result;
    
}


module.exports = {
    getPassives: getPassives,
    addElementalResist: addElementalResist,
    addAilmentResist: addAilmentResist,
    getEquip: getEquip,
    formatSimpleOutput: formatSimpleOutput,
    formatOutput: formatOutput,
    formatForSearch:formatForSearch,
    formatForSkills:formatForSkills,
    stats: stats,
    elements: elements,
    ailments: ailments
}